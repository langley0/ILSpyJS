// [Flags]
// [Obsolete(Obsoletions.LegacyFormatterMessage, DiagnosticId = Obsoletions.LegacyFormatterDiagId, UrlFormat = Obsoletions.SharedUrlFormat)]
export enum StreamingContextStates {
    CrossProcess = 0x01,
    CrossMachine = 0x02,
    File = 0x04,
    Persistence = 0x08,
    Remoting = 0x10,
    Other = 0x20,
    Clone = 0x40,
    CrossAppDomain = 0x80,
    All = 0xFF,
}

export class StreamingContext {
    // private readonly object? _additionalContext;

    // [Obsolete(Obsoletions.LegacyFormatterMessage, DiagnosticId = Obsoletions.LegacyFormatterDiagId, UrlFormat = Obsoletions.SharedUrlFormat)]
    // private readonly StreamingContextStates _state;

    // [Obsolete(Obsoletions.LegacyFormatterMessage, DiagnosticId = Obsoletions.LegacyFormatterDiagId, UrlFormat = Obsoletions.SharedUrlFormat)]
    // public StreamingContext(StreamingContextStates state) : this(state, null)
    // {
    // }

    // [Obsolete(Obsoletions.LegacyFormatterMessage, DiagnosticId = Obsoletions.LegacyFormatterDiagId, UrlFormat = Obsoletions.SharedUrlFormat)]
    // public StreamingContext(StreamingContextStates state, object? additional)
    // {
    //     _state = state;
    //     _additionalContext = additional;
    // }

    // public override bool Equals([NotNullWhen(true)] object? obj)
    // {
    //     if (obj is StreamingContext ctx)
    //     {
    //         return
    //             ctx._additionalContext == _additionalContext &&
    //             ctx._state == _state;
    //     }

    //     return false;
    // }

    // public override int GetHashCode() => (int)_state;

    // [Obsolete(Obsoletions.LegacyFormatterMessage, DiagnosticId = Obsoletions.LegacyFormatterDiagId, UrlFormat = Obsoletions.SharedUrlFormat)]
    // public StreamingContextStates State => _state;

    // public object? Context => _additionalContext;
}

