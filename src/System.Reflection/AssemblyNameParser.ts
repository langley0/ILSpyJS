import assert from 'assert';
import { Throw, Version } from 'System';
import { 
    AssemblyNameFlags, 
    ProcessorArchitecture,
    AssemblyContentType,
} from 'System.Reflection';


/// <summary>
/// Token categories for the lexer.
/// </summary>
export enum Token {
    Equals = 1,
    Comma = 2,
    String = 3,
    End = 4,
}

export enum AttributeKind {
    Version = 1,
    Culture = 2,
    PublicKeyOrToken = 4,
    ProcessorArchitecture = 8,
    Retargetable = 16,
    ContentType = 32
}


export class AssemblyNameParser {

    private readonly _input: string;
    private _index: number;

    private constructor(input: string) {
        assert(input.length > 0);


        this._input = input;
        this._index = 0;
    }

    // #if SYSTEM_PRIVATE_CORELIB
    //         public static AssemblyNameParts Parse(string name) => Parse(name.AsSpan());

    public static Parse(name: string): AssemblyNameParser.AssemblyNameParts {
        const parser = new AssemblyNameParser(name);
        const result = parser.TryParse();
        if (result) {
            return result;
        }
        throw Throw.FileLoadException('InvalidAssemblyName', name);
    }
    // #endif

    //         internal static bool TryParse(ReadOnlySpan<char> name, ref AssemblyNameParts parts)
    //         {
    //             AssemblyNameParser parser = new(name);
    //             return parser.TryParse(ref parts);
    //         }

    private static TryRecordNewSeen(seenAttributes: AttributeKind, newAttribute: AttributeKind): AttributeKind | undefined {
        if ((seenAttributes & newAttribute) != 0) {
            return undefined;
        }
        seenAttributes |= newAttribute;
        return seenAttributes;
    }

    private TryParse(): AssemblyNameParser.AssemblyNameParts | undefined {
        // Name must come first.
        let next: { tokenString: string, token: Token } | undefined;
        next = this.TryGetNextToken();
        if (next == undefined || next.token != Token.String || next.tokenString.length == 0) {
            return undefined;
        }

        const name = next.tokenString;

        let version: Version | undefined = undefined;
        let cultureName: string | undefined = undefined;
        let pkt: Uint8Array | undefined = undefined;
        let flags: AssemblyNameFlags = 0;
        let alreadySeen: AttributeKind = 0 as AttributeKind;

        next = this.TryGetNextToken();
        if (next == undefined) {
            return undefined;
        }

        let token = next.token;
        while (token != Token.End) {
            if (token != Token.Comma) {
                return undefined;
            }


            next = this.TryGetNextToken(); //next string attributeName, next token) || token != Token.String)
            if (next == undefined || next.token != Token.String) {
                return undefined;
            }
            const attributeName = next.tokenString;

            next = this.TryGetNextToken();
            if (next == undefined || next.token != Token.Equals) {
                return undefined;
            }

            next = this.TryGetNextToken(); // next string attributeValue, next token) || token != Token.String)
            if (next == undefined || next.token != Token.String) {
                return undefined;
            }
            const attributeValue = next.tokenString;

            if (attributeName == "")
                return undefined;

            if (AssemblyNameParser.IsAttribute(attributeName, "Version")) {
                const alreadyNewSeen = AssemblyNameParser.TryRecordNewSeen(alreadySeen, AttributeKind.Version);
                if (alreadyNewSeen == undefined) {
                    return undefined;
                }
                const newVersion = AssemblyNameParser.TryParseVersion(attributeValue)
                if (newVersion == undefined) {
                    return undefined;
                }

                alreadySeen = alreadyNewSeen;
                version = newVersion
            }
            else if (AssemblyNameParser.IsAttribute(attributeName, "Culture")) {
                const alreadyNewSeen = AssemblyNameParser.TryRecordNewSeen(alreadySeen, AttributeKind.Culture);
                if (alreadyNewSeen == undefined) {
                    return undefined;
                }

                const newcultureName = AssemblyNameParser.TryParseCulture(attributeValue)
                if (newcultureName == undefined) {
                    return undefined;
                }

                alreadySeen = alreadyNewSeen;
                cultureName = newcultureName;
            }
            else if (AssemblyNameParser.IsAttribute(attributeName, "PublicKeyToken")) {
                const alreadyNewSeen = AssemblyNameParser.TryRecordNewSeen(alreadySeen, AttributeKind.PublicKeyOrToken)
                if (alreadyNewSeen == undefined) {
                    return undefined;
                }

                const newPkt = AssemblyNameParser.TryParsePKT(attributeValue, true);
                if (newPkt == undefined) {
                    return undefined;
                }

                alreadySeen = alreadyNewSeen;
                pkt = newPkt;
            }
            else if (AssemblyNameParser.IsAttribute(attributeName, "PublicKey")) {
                const alreadyNewSeen = AssemblyNameParser.TryRecordNewSeen(alreadySeen, AttributeKind.PublicKeyOrToken)
                if (alreadyNewSeen == undefined) {
                    return undefined;
                }

                const newPkt = AssemblyNameParser.TryParsePKT(attributeValue, false);
                if (newPkt == undefined) {
                    return undefined;
                }
                flags |= AssemblyNameFlags.PublicKey;
                alreadySeen = alreadyNewSeen;
                pkt = newPkt;
            }
            else if (AssemblyNameParser.IsAttribute(attributeName, "ProcessorArchitecture")) {
                const alreadyNewSeen = AssemblyNameParser.TryRecordNewSeen(alreadySeen, AttributeKind.ProcessorArchitecture);
                if (alreadyNewSeen == undefined) {
                    return undefined;
                }
                const arch = AssemblyNameParser.TryParseProcessorArchitecture(attributeValue);
                if (arch == undefined) {
                    return undefined;
                }

                alreadySeen = alreadyNewSeen;
                flags |= ((arch) << 4);
            }
            else if (AssemblyNameParser.IsAttribute(attributeName, "Retargetable")) {
                const alreadyNewSeen = AssemblyNameParser.TryRecordNewSeen(alreadySeen, AttributeKind.Retargetable);
                if (alreadyNewSeen == undefined) {
                    return undefined;
                }

                if (attributeValue.toLowerCase() == "Yes".toLowerCase()) {
                    flags |= AssemblyNameFlags.Retargetable;
                }
                else if (attributeValue.toLocaleLowerCase() == "No".toLocaleLowerCase()) {
                    // nothing to do
                }
                else {
                    return undefined;
                }
            }
            else if (AssemblyNameParser.IsAttribute(attributeName, "ContentType")) {
                const alreadyNewSeen = AssemblyNameParser.TryRecordNewSeen(alreadySeen, AttributeKind.ContentType)
                if (alreadyNewSeen == undefined) {
                    return undefined;
                }

                if (attributeValue.toLocaleLowerCase() == "WindowsRuntime".toLocaleLowerCase()) {
                    flags |= (AssemblyContentType.WindowsRuntime) << 9;
                }
                else {
                    return undefined;
                }
            }
            else {
                // Desktop compat: If we got here, the attribute name is unknown to us. Ignore it.
            }

            next = this.TryGetNextToken();
            if (next == undefined) {
                return undefined;
            }
        }

        const result = new AssemblyNameParser.AssemblyNameParts(name, version, cultureName, flags, pkt);
        return result;
        // return true;
    }

    private static IsAttribute(candidate: string, attributeKind: string): boolean {
        return candidate.toLowerCase() == attributeKind.toLowerCase();
    }

    private static TryParseVersion(attributeValue: string): Version | undefined {
        const parts = attributeValue.split('.');

        if (parts.length < 2 || parts.length > 4) {
            return undefined;
        }

        const versionNumbers = [Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER];
        for (let i = 0; i < parts.length; i++) {
            const result = Number.parseFloat(parts[i]);
            if (isNaN(result)) {
                return undefined;
            }
            versionNumbers[i] = result;
        }

        if (versionNumbers[0] == Number.MAX_SAFE_INTEGER ||
            versionNumbers[1] == Number.MAX_SAFE_INTEGER) {
            return undefined;
        }

        const version =
            versionNumbers[2] == Number.MAX_SAFE_INTEGER ? new Version(versionNumbers[0], versionNumbers[1]) :
                versionNumbers[3] == Number.MAX_SAFE_INTEGER ? new Version(versionNumbers[0], versionNumbers[1], versionNumbers[2]) :
                    new Version(versionNumbers[0], versionNumbers[1], versionNumbers[2], versionNumbers[3]);

        return version;
    }

    private static TryParseCulture(attributeValue: string): string | undefined {
        if (attributeValue.toLowerCase() == "Neutral".toLowerCase()) {
            return "";
        }

        return attributeValue;
    }

    private static TryParsePKT(attributeValue: string, isToken: boolean,): Uint8Array | undefined {
        if (attributeValue.toLowerCase() == "undefined".toLowerCase() || attributeValue == "") {
            return new Uint8Array(0);
        }

        if (attributeValue.length % 2 != 0 || (isToken && attributeValue.length != 8 * 2)) {
            return undefined;
        }

        return Uint8Array.from(Buffer.from(attributeValue, 'hex'));
    }

    private static TryParseProcessorArchitecture(attributeValue: string): ProcessorArchitecture | undefined {
        if (attributeValue.toLowerCase() == "msil") {
            return ProcessorArchitecture.MSIL;
        }
        else if (attributeValue.toLowerCase() == "x86") {
            return ProcessorArchitecture.X86;
        }
        else if (attributeValue.toLowerCase() == "ia64") {
            return ProcessorArchitecture.IA64;
        }
        else if (attributeValue.toLowerCase() == "amd64") {
            return ProcessorArchitecture.Amd64;
        }
        else if (attributeValue.toLowerCase() == "arm") {
            return ProcessorArchitecture.Arm;
        }
        return undefined;
    }

    private static IsWhiteSpace(ch: string): boolean {
        return ch == '\n' || ch == '\r' || ch == ' ' || ch == '\t';
    }

    // [MethodImpl(MethodImplOptions.AggressiveInlining)]
    private TryGetNextChar(): string | undefined {
        if (this._index < this._input.length) {
            const ch = this._input[this._index++];
            if (ch == '\0') {
                return undefined;
            }
            return ch;
        }
        else {
            return '\0';
        }
    }

    //
    // Return the next token in assembly name. If the result is Token.String,
    // sets "tokenString" to the tokenized string.
    //
    private TryGetNextToken(): { tokenString: string, token: Token } | undefined {
        let tokenString = "";
        let c: string | undefined;

        while (true) {
            c = this.TryGetNextChar();
            if (c == undefined) {
                return undefined;
            }

            switch (c) {
                case ',':
                    {
                        return { tokenString, token: Token.Comma };
                    }
                case '=':
                    {
                        return { tokenString, token: Token.Equals };
                    }
                case '\0':
                    {
                        return { tokenString, token: Token.End };
                    }
            }

            if (!AssemblyNameParser.IsWhiteSpace(c)) {
                break;
            }
        }

        const sb = new Array<string>(); // simple string builder

        let quoteChar = 0;
        if (c == '\'' || c == '\"') {
            quoteChar = c.charCodeAt(0);
            c = this.TryGetNextChar();
            if (c == undefined) {
                return undefined;
            }
        }

        for (; ;) {
            if (c!.charCodeAt(0) == 0) {
                if (quoteChar != 0) {
                    // EOS and unclosed quotes is an error
                    return undefined;
                }
                // Reached end of input and therefore of string
                break;
            }

            if (quoteChar != 0 && c!.charCodeAt(0) == quoteChar) {
                break;  // Terminate: Found closing quote of quoted string.
            }

            if (quoteChar == 0 && (c == ',' || c == '=')) {
                this._index--;
                break;  // Terminate: Found start of a new ',' or '=' token.
            }

            if (quoteChar == 0 && (c == '\'' || c == '\"')) {
                return undefined;
            }

            if (c == '\\') {
                c = this.TryGetNextChar();
                if (c == undefined) {
                    return undefined;
                }

                switch (c) {
                    case '\\':
                    case ',':
                    case '=':
                    case '\'':
                    case '"':
                        sb.push(c);
                        break;
                    case 't':
                        sb.push('\t');
                        break;
                    case 'r':
                        sb.push('\r');
                        break;
                    case 'n':
                        sb.push('\n');
                        break;
                    default:
                        return undefined;
                }
            }
            else {
                sb.push(c!);
            }

            c = this.TryGetNextChar();
            if (c == undefined) {
                return undefined;
            }
        }

        const builtStr = sb.join('');

        let length = builtStr.length;
        if (quoteChar == 0) {
            while (length > 0 && AssemblyNameParser.IsWhiteSpace(builtStr.charAt(length - 1))) {
                length--;
            }
        }

        tokenString = builtStr.substring(0, length);
        const token = Token.String;
        return { tokenString, token };
    }
}

export namespace AssemblyNameParser {
    export class AssemblyNameParts {
        public constructor(name: string, version: Version | undefined, cultureName: string | undefined, flags: AssemblyNameFlags, publicKeyOrToken: Uint8Array | undefined) {
            this._name = name;
            this._version = version;
            this._cultureName = cultureName;
            this._flags = flags;
            this._publicKeyOrToken = publicKeyOrToken;
        }

        public readonly _name: string;
        public readonly _version?: Version;
        public readonly _cultureName?: string;
        public readonly _flags: AssemblyNameFlags;
        public readonly _publicKeyOrToken?: Uint8Array;
    }

}