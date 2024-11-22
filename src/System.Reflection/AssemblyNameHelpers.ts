import * as crypto from "crypto";
import assert from "assert";
import { Throw } from "System";

export class AssemblyNameHelpers
    {
        public static ComputePublicKeyToken(publicKey: Uint8Array | undefined): Uint8Array | undefined
        {
            if (publicKey == undefined)
                return undefined;

            if (publicKey.length == 0)
                return new Uint8Array();

            if (!AssemblyNameHelpers.IsValidPublicKey(publicKey))
                Throw.SecurityException('Security_InvalidAssemblyPublicKey');

            const sha1 = crypto.createHash("sha1");
            sha1.update(publicKey);
            const hash = sha1.digest();
            assert(hash.length == 20);

            const publicKeyToken = new Uint8Array(AssemblyNameHelpers.PublicKeyTokenLength);
            for (let i = 0; i < publicKeyToken.length; i++)
                publicKeyToken[i] = hash[hash.length - 1 - i];
            return publicKeyToken;
        }

        //
        // This validation logic is a port of StrongNameIsValidPublicKey() from src\coreclr\md\runtime\strongnameinternal.cpp
        //
        private static  IsValidPublicKey( publicKey: Uint8Array): boolean
        {
            // uint publicKeyLength = (uint)(publicKey.Length);

            // // The buffer must be at least as large as the public key structure (for compat with desktop, we actually compare with the size of the header + 4).
            // if (publicKeyLength < SizeOfPublicKeyBlob + 4)
            //     return false;

            // // Poor man's reinterpret_cast into the PublicKeyBlob structure.
            // ReadOnlySpan<byte> publicKeyBlob = new ReadOnlySpan<byte>(publicKey);
            // uint sigAlgID = BinaryPrimitives.ReadUInt32LittleEndian(publicKeyBlob);
            // uint hashAlgID = BinaryPrimitives.ReadUInt32LittleEndian(publicKeyBlob.Slice(4));
            // uint cbPublicKey = BinaryPrimitives.ReadUInt32LittleEndian(publicKeyBlob.Slice(8));

            // // The buffer must be the same size as the structure header plus the trailing key data
            // if (cbPublicKey != publicKeyLength - SizeOfPublicKeyBlob)
            //     return false;

            // // The buffer itself looks reasonable, but the public key structure needs to be validated as well

            // // The ECMA key doesn't look like a valid key so it will fail the below checks. If we were passed that
            // // key, then we can skip them.
            // if (EcmaKey.SequenceEqual(publicKeyBlob))
            //     return true;

            // // If a hash algorithm is specified, it must be a sensible value
            // bool fHashAlgorithmValid = GetAlgClass(hashAlgID) == ALG_CLASS_HASH && GetAlgSid(hashAlgID) >= ALG_SID_SHA1;
            // if (hashAlgID != 0 && !fHashAlgorithmValid)
            //     return false;

            // // If a signature algorithm is specified, it must be a sensible value
            // bool fSignatureAlgorithmValid = GetAlgClass(sigAlgID) == ALG_CLASS_SIGNATURE;
            // if (sigAlgID != 0 && !fSignatureAlgorithmValid)
            //     return false;

            // // The key blob must indicate that it is a PUBLICKEYBLOB
            // if (publicKey[SizeOfPublicKeyBlob] != PUBLICKEYBLOB)
            //     return false;

            // return true;
            throw new Error("Not implemented");
        }

        // // Constants and macros copied from WinCrypt.h:

        // private static uint GetAlgClass(uint x)
        // {
        //     return (x & (7 << 13));
        // }

        // private static uint GetAlgSid(uint x)
        // {
        //     return (x & (511));
        // }

        private static readonly ALG_CLASS_HASH = (4 << 13);
        private static readonly ALG_SID_SHA1 = 4;
        private static readonly ALG_CLASS_SIGNATURE = (1 << 13);
        private static readonly PUBLICKEYBLOB = 0x6;

        private static readonly SizeOfPublicKeyBlob = 12;

        private static readonly PublicKeyTokenLength = 8;

        private static readonly EcmaKey = Uint8Array.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
    }