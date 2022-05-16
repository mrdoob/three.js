import { DataTexture, DataTextureLoader, LoadingManager } from '../../../src/Three';

export class TGALoader extends DataTextureLoader {
    constructor(manager?: LoadingManager);

    load(
        url: string,
        onLoad?: (texture: DataTexture, texData: object) => void,
        onProgress?: (event: ProgressEvent) => void,
        onError?: (event: ErrorEvent) => void,
    ): DataTexture;
    loadAsync(url: string, onProgress?: (event: ProgressEvent) => void): Promise<DataTexture>;
    parse(data: ArrayBuffer): DataTexture;
}
