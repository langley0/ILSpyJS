import {
    Throw,
    ArgumentNullException,
    ArgumentOutOfRangeException,
} from "System";
import {
    BlobBuilder,

} from "System.Reflection.Metadata";
import {
    MetadataRootBuilder,
    MetadataBuilder,
} from "System.Reflection.Metadata.Ecma335";
import {
    ManagedPEBuilder,
} from "System.Reflection.PortableExecutable";
import { PEHeaderBuilder } from "System.Reflection.PortableExecutable";

function AssertArgumentNullException(action: () => void) {
    try {
        action();
    } catch (e) {
        if (e instanceof ArgumentNullException) {
            return;
        }
        throw e;
    }
}

function AssertArgumentOutOfRangeException(action: () => void) {
    try {
        action();
    } catch (e) {
        if (e instanceof ArgumentOutOfRangeException) {
            return;
        }
        throw e;
    }
}


export function ManagedPEBuilder_Errors() {
    var hdr = new PEHeaderBuilder();
    var ms = new MetadataRootBuilder(new MetadataBuilder());
    var il = new BlobBuilder();

    // AssertArgumentNullException(() => new ManagedPEBuilder(undefined, ms, il));

    // AssertArgumentNullException(() => new ManagedPEBuilder(undefined, ms, il));
    // AssertArgumentNullException(() => new ManagedPEBuilder(hdr, undefined, il));
    // AssertArgumentNullException(() => new ManagedPEBuilder(hdr, ms, undefined));
    AssertArgumentOutOfRangeException(() => new ManagedPEBuilder(hdr, ms, il, undefined, undefined, undefined, undefined, -1));
}
