import { Loader } from './Loader';
import { LoadingManager } from './LoadingManager';
import { DataTexture } from './../textures/DataTexture';

export class DataTextureLoader extends Loader {
    constructor(manager?: LoadingManager);

    load(
        url: string,
        onLoad: (dataTexture: DataTexture, texData: object) => void,
        onProgress?: (event: ProgressEvent) => void,
        onError?: (event: ErrorEvent) => void,
    ): DataTexture;

    loadAsync(url: string, onProgress?: (event: ProgressEvent) => void): Promise<DataTexture>;
}
