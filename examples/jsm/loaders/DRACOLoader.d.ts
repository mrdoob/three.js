import {
  LoadingManager,
  BufferGeometry
} from '../../../src/Three';

export class DRACOLoader {
  constructor(manager?: LoadingManager);

  load(url: string, onLoad: (geometry: BufferGeometry) => void, onProgress?: (event: ProgressEvent) => void, onError?: (event: ErrorEvent) => void): void;
  setPath(path: string): DRACOLoader;
  setDecoderPath(path: string): DRACOLoader;
  setDecoderConfig(config: object): DRACOLoader;
  setCrossOrigin(crossOrigin: string): DRACOLoader;
  setWorkerLimit(workerLimit: number): DRACOLoader;
  dispose(): DRACOLoader;
}
