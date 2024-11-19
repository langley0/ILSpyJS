export class StreamConstraints {
    public readonly GuardOpt?: Object;
    public readonly ImageStart: number;
    public readonly ImageSize: number;

    public constructor(guardOpt: Object | undefined, startPosition: number, imageSize: number) {
        this.GuardOpt = guardOpt;
        this.ImageStart = startPosition;
        this.ImageSize = imageSize;
    }
}