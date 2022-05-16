import { Loader, LoadingManager, Vector3, DataTexture, DataTexture3D } from '../../../src/Three';

export interface LUTCubeResult {
    title: string;
    size: number;
    domainMin: Vector3;
    domainMax: Vector3;
    texture: DataTexture;
    texture3D: DataTexture3D;
}

export class LUTCubeLoader extends Loader {
    constructor(manager?: LoadingManager);

    load(
        url: string,
        onLoad: (result: LUTCubeResult) => void,
        onProgress?: (event: ProgressEvent) => void,
        onError?: (event: Error) => void,
    ): any;
    loadAsync(url: string, onProgress?: (event: ProgressEvent) => void): Promise<LUTCubeResult>;
    parse(data: string): LUTCubeResult;
}
