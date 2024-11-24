import assert from "assert";
import { Throw } from "System/Throw";
import { Version } from "System/Version";
import { AssemblyNameFlags } from "./AssemblyNameFlags";
import { AssemblyContentType } from "./AssemblyContentType";

export class AssemblyNameFormatter
    {
        public static ComputeDisplayName( 
            name: string, 
            version: Version | undefined = undefined, 
            cultureName: string | undefined = undefined, 
            pkt: Uint8Array | undefined = undefined,  
            flags:AssemblyNameFlags = 0,  
            contentType:AssemblyContentType = 0,  
            pk: Uint8Array | undefined = undefined)
        {
            const PUBLIC_KEY_TOKEN_LEN = 8;
            assert(name.length != 0);

            var vsb = Array<string>();
            AssemblyNameFormatter.AppendQuoted(vsb, name);

            if (version != undefined)
            {
                const major = version.Major;
                if (major != 0xFFFF)
                {
                    vsb.push(", Version=");
                    vsb.push(major.toString());

                    const minor = version.Minor;
                    if (minor != 0xFFFF)
                    {
                        vsb.push('.');
                        vsb.push(minor.toString());

                        const build = version.Build;
                        if (build != 0xFFFF)
                        {
                            vsb.push('.');
                            vsb.push(build.toString());

                            const revision = version.Revision;
                            if (revision != 0xFFFF)
                            {
                                vsb.push('.');
                                vsb.push(revision.toString());
                            }
                        }
                    }
                }
            }

            if (cultureName != undefined)
            {
                if (cultureName.length == 0)
                    cultureName = "neutral";
                vsb.push(", Culture=");
                AssemblyNameFormatter.AppendQuoted(vsb, cultureName);
            }

            const keyOrToken = pkt ?? pk;
            if (keyOrToken != undefined)
            {
                if (pkt != undefined)
                {
                    if (pkt.length > PUBLIC_KEY_TOKEN_LEN)
                        Throw.ArgumentException();

                    vsb.push(", PublicKeyToken=");
                }
                else
                {
                    vsb.push(", PublicKey=");
                }

                if (keyOrToken.length == 0)
                {
                    vsb.push("null");
                }
                else
                {
                    for (let i = 0; i < keyOrToken.length; i++)
                    {
                        vsb.push(keyOrToken[i].toString(16).toLowerCase());
                    }
                }
            }

            if (0 != (flags & AssemblyNameFlags.Retargetable))
                vsb.push(", Retargetable=Yes");

            if (contentType == AssemblyContentType.WindowsRuntime)
                vsb.push(", ContentType=WindowsRuntime");

            // NOTE: By design (desktop compat) AssemblyName.FullName and ToString() do not include ProcessorArchitecture.

            return vsb.join('');
                }

        private static AppendQuoted(vsb: string[], s: string)
        {
            let needsQuoting = false;
            const quoteChar = '\"';

            // App-compat: You can use double or single quotes to quote a name, and Fusion (or rather the IdentityAuthority) picks one
            // by some algorithm. Rather than guess at it, we use double quotes consistently.
            if (s.length != s.trim().length || s.indexOf('\"') >=0 || s.indexOf('\'') >= 0)
                needsQuoting = true;

            if (needsQuoting)
                vsb.push(quoteChar);

            for (let i = 0; i < s.length; i++)
            {
                switch (s[i])
                {
                    case '\\':
                    case ',':
                    case '=':
                    case '\'':
                    case '"':
                        vsb.push('\\');
                        break;
                    case '\t':
                        vsb.push("\\t");
                        continue;
                    case '\r':
                        vsb.push("\\r");
                        continue;
                    case '\n':
                        vsb.push("\\n");
                        continue;
                }

                vsb.push(s[i]);
            }

            if (needsQuoting)
                vsb.push(quoteChar);
        }

    }