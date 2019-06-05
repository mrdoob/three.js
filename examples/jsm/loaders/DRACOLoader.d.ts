import {
  LoadingManager,
  BufferGeometry,
  TrianglesDrawModes
} from '../../../src/Three';

export class DRACOLoader {
  constructor(manager?: LoadingManager);

  static setDecoderPath(path: string): void;
  static setDecoderConfig(config: object): void;
  static getDecoderModule(): Promise<any>;
  static releaseDecoderModule(): void;

  load(url: string, onLoad: (geometry: BufferGeometry) => void, onProgress?: (event: ProgressEvent) => void, onError?: (event: ErrorEvent) => void): void;
  setPath(path: string): DRACOLoader;
  setVerbosity(level: number): DRACOLoader;
  setDrawMode(drawMode: TrianglesDrawModes): DRACOLoader;
  setSkipDequantization(attributeName: 'position', skip?: boolean): DRACOLoader;
  isVersionSupported(version: number, callback: (isVersionSupported: boolean) => any);
}
