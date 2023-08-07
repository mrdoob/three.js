import { Loader } from './Loader';
import { LoadingManager } from './LoadingManager';
import { BufferGeometry } from './../core/BufferGeometry';
import { InstancedBufferGeometry } from '../core/InstancedBufferGeometry';

export class BufferGeometryLoader extends Loader {
    constructor(manager?: LoadingManager);

    load(
        url: string,
        onLoad: (bufferGeometry: InstancedBufferGeometry | BufferGeometry) => void,
        onProgress?: (request: ProgressEvent) => void,
        onError?: (event: ErrorEvent) => void,
    ): void;
    loadAsync(
        url: string,
        onProgress?: (event: ProgressEvent) => void,
    ): Promise<InstancedBufferGeometry | BufferGeometry>;
    parse(json: any): InstancedBufferGeometry | BufferGeometry;
}
