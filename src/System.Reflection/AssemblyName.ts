import assert from "assert";
import {
    Throw,
    Version,
} from "System";
import { CultureInfo } from "System.Globalization";
import {
    AssemblyVersionCompatibility,
    AssemblyHashAlgorithm,
} from "System.Configuration.Assemblies";
import {
    AssemblyNameParser,
    AssemblyNameFlags,
    ProcessorArchitecture,
    AssemblyContentType,
    AssemblyNameHelpers,
} from "System.Reflection";

export class AssemblyName {
    // If you modify any of these fields, you must also update the
    // AssemblyBaseObject structure in object.h
    private _name?: string;
    private _publicKey?: Uint8Array;
    private _publicKeyToken?: Uint8Array;
    private _cultureInfo?: CultureInfo;
    private _codeBase?: string;
    private _version?: Version;

    private _hashAlgorithm?: AssemblyHashAlgorithm;

    private _versionCompatibility: AssemblyVersionCompatibility;
    private _flags: AssemblyNameFlags;

    public constructor(assemblyName?: string) {
        this._versionCompatibility = AssemblyVersionCompatibility.SameMachine;

        Throw.ThrowIfNullOrEmpty(assemblyName);
        if (assemblyName[0] == '\0') {
            Throw.ArgumentException('Format_StringZeroLength');
        }

        const parts = AssemblyNameParser.Parse(assemblyName);
        this._name = parts._name;
        this._version = parts._version;
        this._flags = parts._flags;
        if ((parts._flags & AssemblyNameFlags.PublicKey) != 0) {
            this._publicKey = parts._publicKeyOrToken;
        }
        else {
            this._publicKeyToken = parts._publicKeyOrToken;
        }

        if (parts._cultureName != undefined) {
            this._cultureInfo = new CultureInfo(parts._cultureName);
        }
    }


    // Set and get the name of the assembly. If this is a weak Name
    // then it optionally contains a site. For strong assembly names,
    // the name partitions up the strong name's namespace
    public get Name(): string | undefined {
        return this._name;
    }

    public set Name(value: string | undefined) {
        this._name = value;
    }

    public get Version(): Version | undefined {
        return this._version;
    }

    public set Version(value: Version | undefined) {
        this._version = value;
    }

    public get CultureInfo(): CultureInfo | undefined {
        return this._cultureInfo;
    }

    public set CultureInfo(value: CultureInfo | undefined) {
        this._cultureInfo = value;
    }

    public get CultureName(): string | undefined {
        return this._cultureInfo?.Name;
    }

    public set CultureName(value: string | undefined) {
        this._cultureInfo = value == undefined ? undefined : new CultureInfo(value);
    }

    public get CodeBase(): string | undefined {
        return this._codeBase;
    }

    public set CodeBase(value: string | undefined) {
        this._codeBase = value;
    }

    public get EscapedCodeBase(): string | undefined {
        if (this._codeBase == undefined) {
            return undefined;
        }
        else {
            return AssemblyName.EscapeCodeBase(this._codeBase);
        }
    }

    public get ProcessorArchitecture(): ProcessorArchitecture {
        const x = (((this._flags as number) & 0x70) >> 4);
        if (x > 5) {
            return ProcessorArchitecture.None;
        }
        return x as ProcessorArchitecture;
    }

    public set ProcessorArchitecture(value: ProcessorArchitecture) {
        let x = (value as number) & 0x07;
        if (x <= 5) {
            this._flags = (this._flags & 0xFFFFFF0F) | (x << 4);
        }
    }


    public get ContentType(): AssemblyContentType {
        let x = (((this._flags as number) & 0x00000E00) >> 9);
        if (x > 1) {
            x = 0;
        }
        return x as AssemblyContentType;
    }

    public set ContentType(value: AssemblyContentType) {
        let x = (value as number) & 0x07;
        if (x <= 1) {
            this._flags = (this._flags & 0xFFFFF1FF) | (x << 9);
        }
    }


    // // Make a copy of this assembly name.
    // public object Clone() {
    //     var name = new AssemblyName
    //     {
    //         _name = _name,
    //             _publicKey = (byte[] ?)_publicKey?.Clone(),
    //                 _publicKeyToken = (byte[] ?)_publicKeyToken?.Clone(),
    //                     _cultureInfo = _cultureInfo,
    //                     _version = _version,
    //                     _flags = _flags,
    //                     _codeBase = _codeBase,
    //                     _hashAlgorithm = _hashAlgorithm,
    //                     _versionCompatibility = _versionCompatibility,
    //         };
    //     return name;
    // }

    private static s_getAssemblyName?: (file: string) => AssemblyName;
    private static InitGetAssemblyName(): (file: string) => AssemblyName {
        //     Type readerType = Type.GetType(
        // "System.Reflection.Metadata.MetadataReader, System.Reflection.Metadata",
        // throwOnError: true)!;

        // MethodInfo ? getAssemblyNameMethod = readerType.GetMethod(
        //     "GetAssemblyName",
        //     BindingFlags.NonPublic | BindingFlags.Public | BindingFlags.Static,
        //     undefined,
        //     [typeof (string)],
        //     undefined) ??
        //         throw new MissingMethodException(readerType.FullName, "GetAssemblyName");
        // return s_getAssemblyName = getAssemblyNameMethod.CreateDelegate<Func<string, AssemblyName>>();
        throw new Error("Not implemented");
    }

    /*
     * Get the AssemblyName for a given file. This will only work
     * if the file contains an assembly manifest. This method causes
     * the file to be opened and closed.
     */
    public static GetAssemblyName(assemblyFile: string): AssemblyName {
        const factory = (AssemblyName.s_getAssemblyName ?? AssemblyName.InitGetAssemblyName());
        return factory(assemblyFile);
    }

    public GetPublicKey(): Uint8Array | undefined {
        return this._publicKey;
    }

    public SetPublicKey(publicKey: Uint8Array | undefined) {
        this._publicKey = publicKey;

        if (publicKey == undefined)
            this._flags &= ~AssemblyNameFlags.PublicKey;
        else
            this._flags |= AssemblyNameFlags.PublicKey;
    }

    // The compressed version of the public key formed from a truncated hash.
    // Will throw a SecurityException if _publicKey is invalid
    public GetPublicKeyToken(): Uint8Array | undefined {
        this._publicKeyToken = this._publicKeyToken ?? AssemblyNameHelpers.ComputePublicKeyToken(this._publicKey);
        return this._publicKeyToken;
    }

    public SetPublicKeyToken(publicKeyToken: Uint8Array | undefined) {
        this._publicKeyToken = publicKeyToken;
    }

    public get Flags(): AssemblyNameFlags {
        return (this._flags & 0xFFFFF10F);
    }

    public set Flags(value: AssemblyNameFlags) {
        this._flags &= 0x00000EF0;
        this._flags |= (value & 0xFFFFF10F);
    }

    public get HashAlgorithm(): AssemblyHashAlgorithm {
        assert(this._hashAlgorithm != undefined);
        return this._hashAlgorithm;
    }

    public set HashAlgorithm(value: AssemblyHashAlgorithm) {
        this._hashAlgorithm = value;
    }


    // [Obsolete(Obsoletions.AssemblyNameMembersMessage, DiagnosticId = Obsoletions.AssemblyNameMembersDiagId, UrlFormat = Obsoletions.SharedUrlFormat)]
    //         public AssemblyHashAlgorithm HashAlgorithm
    // {
    //     get => _hashAlgorithm;
    //     set => _hashAlgorithm = value;
    // }

    // [Obsolete(Obsoletions.AssemblyNameMembersMessage, DiagnosticId = Obsoletions.AssemblyNameMembersDiagId, UrlFormat = Obsoletions.SharedUrlFormat)]
    //         public AssemblyVersionCompatibility VersionCompatibility
    // {
    //     get => _versionCompatibility;
    //     set => _versionCompatibility = value;
    // }

    // [Obsolete(Obsoletions.StrongNameKeyPairMessage, DiagnosticId = Obsoletions.StrongNameKeyPairDiagId, UrlFormat = Obsoletions.SharedUrlFormat)]
    //         public StrongNameKeyPair ? KeyPair
    //         {
    //     get => throw new PlatformNotSupportedException(SR.PlatformNotSupported_StrongNameSigning);
    //         set => throw new PlatformNotSupportedException(SR.PlatformNotSupported_StrongNameSigning);
    //         }

    public get FullName(): string {
        if (!this.Name) {
            return "";
        }

        // Do not call GetPublicKeyToken() here - that latches the result into AssemblyName which isn't a side effect we want.
        // const pkt = this._publicKeyToken ?? AssemblyNameHelpers.ComputePublicKeyToken(_publicKey);
        // return AssemblyNameFormatter.ComputeDisplayName(Name, Version, CultureName, pkt, Flags, ContentType);

        throw new Error("Not implemented");

    }

    // public override string ToString()
    // {
    //     string s = FullName;
    //     if (s == undefined)
    //         return base.ToString()!;
    //     else
    //         return s;
    // }

    // [Obsolete(Obsoletions.LegacyFormatterImplMessage, DiagnosticId = Obsoletions.LegacyFormatterImplDiagId, UrlFormat = Obsoletions.SharedUrlFormat)]
    // [EditorBrowsable(EditorBrowsableState.Never)]
    // public void GetObjectData(SerializationInfo info, StreamingContext context)
    // {
    //     throw new PlatformNotSupportedException();
    // }

    // public void OnDeserialization(object ? sender)
    // {
    //     throw new PlatformNotSupportedException();
    // }

    /// <summary>
    /// Compares the simple names disregarding Version, Culture and PKT. While this clearly does not
    /// match the intent of this api, this api has been broken this way since its debut and we cannot
    /// change its behavior now.
    /// </summary>
    public static ReferenceMatchesDefinition(reference?: AssemblyName, definition?: AssemblyName): boolean {
        // if (ReferenceEquals(reference, definition))
        //     return true;
        // ArgumentNullException.ThrowIfNull(reference);
        // ArgumentNullException.ThrowIfNull(definition);

        // string refName = reference.Name ?? string.Empty;
        // string defName = definition.Name ?? string.Empty;
        // return refName.Equals(defName, StringComparison.OrdinalIgnoreCase);
        throw new Error("Not implemented");
    }

    // [RequiresAssemblyFiles("The code will return an empty string for assemblies embedded in a single-file app")]
    public static EscapeCodeBase(codebase?: string): string {
        // if (codebase == undefined)
        //     return string.Empty;

        // int position = 0;
        // char[] ? dest = EscapeString(codebase, 0, codebase.Length, undefined, ref position, true, c_DummyChar, c_DummyChar, c_DummyChar);
        // if (dest == undefined)
        //     return codebase;

        // return new string(dest, 0, position);
        throw new Error("Not implemented");
    }

    //     // This implementation of EscapeString has been copied from System.Private.Uri from the runtime repo
    //     // - forceX characters are always escaped if found
    //     // - rsvd character will remain unescaped
    //     //
    //     // start    - starting offset from input
    //     // end      - the exclusive ending offset in input
    //     // destPos  - starting offset in dest for output, on return this will be an exclusive "end" in the output.
    //     //
    //     // In case "dest" has lack of space it will be reallocated by preserving the _whole_ content up to current destPos
    //     //
    //     // Returns undefined if nothing has to be escaped AND passed dest was undefined, otherwise the resulting array with the updated destPos
    //     //
    //     internal static unsafe char[] ?EscapeString(string input, int start, int end, char[]? dest, ref int destPos,
    //     bool isUriString, char force1, char force2, char rsvd) {
    //         int i = start;
    //         int prevInputPos = start;
    //     byte * bytes = stackalloc byte[c_MaxUnicodeCharsReallocate * c_MaxUTF_8BytesPerUnicodeChar];   // 40*4=160

    //     fixed(char * pStr = input)
    //     {
    //         for (; i < end; ++i) {
    //                 char ch = pStr[i];

    //             // a Unicode ?
    //             if (ch > '\x7F') {
    //                     short maxSize = (short)Math.Min(end - i, (int)c_MaxUnicodeCharsReallocate - 1);

    //                     short count = 1;
    //                 for (; count < maxSize && pStr[i + count] > '\x7f'; ++count);

    //                 // Is the last a high surrogate?
    //                 if (pStr[i + count - 1] >= 0xD800 && pStr[i + count - 1] <= 0xDBFF) {
    //                     // Should be a rare case where the app tries to feed an invalid Unicode surrogates pair
    //                     if (count == 1 || count == end - i)
    //                         throw new FormatException(SR.Arg_FormatException);
    //                     // need to grab one more char as a Surrogate except when it's a bogus input
    //                     ++count;
    //                 }

    //                 dest = EnsureDestinationSize(pStr, dest, i,
    //                     (short)(count * c_MaxUTF_8BytesPerUnicodeChar * c_EncodedCharsPerByte),
    //                     c_MaxUnicodeCharsReallocate * c_MaxUTF_8BytesPerUnicodeChar * c_EncodedCharsPerByte,
    //                     ref destPos, prevInputPos);

    //                     short numberOfBytes = (short)Encoding.UTF8.GetBytes(pStr + i, count, bytes,
    //                         c_MaxUnicodeCharsReallocate * c_MaxUTF_8BytesPerUnicodeChar);

    //                 // This is the only exception that built in UriParser can throw after a Uri ctor.
    //                 // Should not happen unless the app tries to feed an invalid Unicode string
    //                 if (numberOfBytes == 0)
    //                     throw new FormatException(SR.Arg_FormatException);

    //                 i += (count - 1);

    //                 for (count = 0; count < numberOfBytes; ++count)
    //                     EscapeAsciiChar((char)bytes[count], dest, ref destPos);

    //                 prevInputPos = i + 1;
    //             }
    //             else if (ch == '%' && rsvd == '%') {
    //                 // Means we don't reEncode '%' but check for the possible escaped sequence
    //                 dest = EnsureDestinationSize(pStr, dest, i, c_EncodedCharsPerByte,
    //                     c_MaxAsciiCharsReallocate * c_EncodedCharsPerByte, ref destPos, prevInputPos);
    //                 if (i + 2 < end && char.IsAsciiHexDigit(pStr[i + 1]) && char.IsAsciiHexDigit(pStr[i + 2])) {
    //                     // leave it escaped
    //                     dest[destPos++] = '%';
    //                     dest[destPos++] = pStr[i + 1];
    //                     dest[destPos++] = pStr[i + 2];
    //                     i += 2;
    //                 }
    //                 else {
    //                     EscapeAsciiChar('%', dest, ref destPos);
    //                 }
    //                 prevInputPos = i + 1;
    //             }
    //             else if (ch == force1 || ch == force2 || (ch != rsvd && (isUriString ? !IsReservedUnreservedOrHash(ch) : !IsUnreserved(ch)))) {
    //                 dest = EnsureDestinationSize(pStr, dest, i, c_EncodedCharsPerByte,
    //                     c_MaxAsciiCharsReallocate * c_EncodedCharsPerByte, ref destPos, prevInputPos);
    //                 EscapeAsciiChar(ch, dest, ref destPos);
    //                 prevInputPos = i + 1;
    //             }
    //         }

    //         if (prevInputPos != i) {
    //             // need to fill up the dest array ?
    //             if (prevInputPos != start || dest != undefined)
    //                 dest = EnsureDestinationSize(pStr, dest, i, 0, 0, ref destPos, prevInputPos);
    //         }
    //     }

    //     return dest;
    // }

    // //
    // // ensure destination array has enough space and contains all the needed input stuff
    // //
    // private static unsafe char[] EnsureDestinationSize(char * pStr, char[]? dest, int currentInputPos,
    //     short charsToAdd, short minReallocateChars, ref int destPos, int prevInputPos) {
    //     if (dest is undefined || dest.Length < destPos + (currentInputPos - prevInputPos) + charsToAdd)
    //     {
    //         // allocating or reallocating array by ensuring enough space based on maxCharsToAdd.
    //         char[] newresult = new char[destPos + (currentInputPos - prevInputPos) + minReallocateChars];

    //         if (dest is not undefined && destPos != 0)
    //         Buffer.BlockCopy(dest, 0, newresult, 0, destPos << 1);
    //         dest = newresult;
    //     }

    //     // ensuring we copied everything form the input string left before last escaping
    //     while (prevInputPos != currentInputPos)
    //         dest[destPos++] = pStr[prevInputPos++];
    //     return dest;
    // }

    //     internal static void EscapeAsciiChar(char ch, char[] to, ref int pos) {
    //     to[pos++] = '%';
    //     to[pos++] = HexConverter.ToCharUpper(ch >> 4);
    //     to[pos++] = HexConverter.ToCharUpper(ch);
    // }

    // private static bool IsReservedUnreservedOrHash(char c) {
    //     if (IsUnreserved(c)) {
    //         return true;
    //     }
    //     return RFC3986ReservedMarks.Contains(c);
    // }

    //     internal static bool IsUnreserved(char c) {
    //     if (char.IsAsciiLetterOrDigit(c)) {
    //         return true;
    //     }
    //     return RFC3986UnreservedMarks.Contains(c);
    // }

    public static readonly c_DummyChar = 0xFFFF;     // An Invalid Unicode character used as a dummy char passed into the parameter
    private static readonly c_MaxAsciiCharsReallocate = 40;
    private static readonly c_MaxUnicodeCharsReallocate = 40;
    private static readonly c_MaxUTF_8BytesPerUnicodeChar = 4;
    private static readonly c_EncodedCharsPerByte = 3;
    private static readonly RFC3986ReservedMarks = ":/?#[]@!$&'()*+,;=";
    private static readonly RFC3986UnreservedMarks = "-._~";
}