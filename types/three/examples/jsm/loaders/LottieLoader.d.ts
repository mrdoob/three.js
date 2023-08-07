import { CanvasTexture, Loader, LoadingManager } from '../../../src/Three';

export class LottieLoader extends Loader {
    constructor(manager?: LoadingManager);

    load(
        url: string,
        onLoad: (texture: CanvasTexture) => void,
        onProgress?: (event: ProgressEvent) => void,
        onError?: (event: ErrorEvent) => void,
    ): void;
    loadAsync(url: string, onProgress?: (event: ProgressEvent) => void): Promise<CanvasTexture>;

    setQuality(value: number): void;
}
