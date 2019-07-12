import {
  CompressedTexture,
  LoadingManager,
  WebGLRenderer
} from '../../../src/Three';

export class BasisTextureLoader {
  constructor(manager?: LoadingManager);
  manager: LoadingManager;
  crossOrigin: string;
  transcoderBinary: ArrayBuffer | null;
  transcoderPath: string;
  transcoderPending: Promise<void> | null;

  workerConfig: {
    format: number;
    etcSupported: boolean;
    dxtSupported: boolean;
    pvrtcSupported: boolean;
  }
  workerLimit: number;
  workerNextTaskID: number;
  workerPool: object[];
  workerSourceURL: string;

  detectSupport(renderer: WebGLRenderer): this;
  dispose(): void;
  load(url: string, onLoad: (texture: CompressedTexture) => void, onProgress?: (event: ProgressEvent) => void, onError?: (event: ErrorEvent) => void): void;
  setCrossOrigin(crossOrigin: string): this;
  setTranscoderPath(path: string): this;
  setWorkerLimit(workerLimit: number): this;
}
