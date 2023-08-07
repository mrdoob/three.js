import { Camera, AnimationClip, FileLoader, Loader, LoadingManager, SkinnedMesh } from '../../../src/Three';

export interface MMDLoaderAnimationObject {
    animation: AnimationClip;
    mesh: SkinnedMesh;
}

export class MMDLoader extends Loader {
    constructor(manager?: LoadingManager);
    animationBuilder: object;
    animationPath: string;
    loader: FileLoader;
    meshBuilder: object;
    parser: object | null;

    load(
        url: string,
        onLoad: (mesh: SkinnedMesh) => void,
        onProgress?: (event: ProgressEvent) => void,
        onError?: (event: ErrorEvent) => void,
    ): void;
    loadAsync(url: string, onProgress?: (event: ProgressEvent) => void): Promise<SkinnedMesh>;
    loadAnimation(
        url: string,
        object: SkinnedMesh | Camera,
        onLoad: (object: SkinnedMesh | AnimationClip) => void,
        onProgress?: (event: ProgressEvent) => void,
        onError?: (event: ErrorEvent) => void,
    ): void;
    loadPMD(
        url: string,
        onLoad: (object: object) => void,
        onProgress?: (event: ProgressEvent) => void,
        onError?: (event: ErrorEvent) => void,
    ): void;
    loadPMX(
        url: string,
        onLoad: (object: object) => void,
        onProgress?: (event: ProgressEvent) => void,
        onError?: (event: ErrorEvent) => void,
    ): void;
    loadVMD(
        url: string,
        onLoad: (object: object) => void,
        onProgress?: (event: ProgressEvent) => void,
        onError?: (event: ErrorEvent) => void,
    ): void;
    loadVPD(
        url: string,
        isUnicode: boolean,
        onLoad: (object: object) => void,
        onProgress?: (event: ProgressEvent) => void,
        onError?: (event: ErrorEvent) => void,
    ): void;
    loadWithAnimation(
        url: string,
        vmdUrl: string | string[],
        onLoad: (object: MMDLoaderAnimationObject) => void,
        onProgress?: (event: ProgressEvent) => void,
        onError?: (event: ErrorEvent) => void,
    ): void;
    setAnimationPath(animationPath: string): this;
}
