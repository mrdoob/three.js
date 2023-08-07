import { Scene, Loader, LoadingManager } from '../../../src/Three';

export class VRMLLoader extends Loader {
    constructor(manager?: LoadingManager);

    load(
        url: string,
        onLoad: (scene: Scene) => void,
        onProgress?: (event: ProgressEvent) => void,
        onError?: (event: ErrorEvent) => void,
    ): void;
    loadAsync(url: string, onProgress?: (event: ProgressEvent) => void): Promise<Scene>;
    parse(data: string, path: string): Scene;
}
