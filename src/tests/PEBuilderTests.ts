import {
    Throw,
    ArgumentNullException,
    ArgumentOutOfRangeException,
} from "System";
import {
    MetadataRootBuilder,
    BlobBuilder,
    MetadataBuilder,
} from "System.Reflection.Metadata";
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

    // AssertArgumentNullException(() => new ManagedPEBuilder(null, ms, il));

    // AssertArgumentNullException(() => new ManagedPEBuilder(null, ms, il));
    // AssertArgumentNullException(() => new ManagedPEBuilder(hdr, null, il));
    // AssertArgumentNullException(() => new ManagedPEBuilder(hdr, ms, null));
    AssertArgumentOutOfRangeException(() => new ManagedPEBuilder(hdr, ms, il, undefined, undefined, undefined, undefined, -1));
}
