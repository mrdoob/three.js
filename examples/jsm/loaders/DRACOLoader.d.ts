import { LoadingManager } from '../../../src/Three';

export class DRACOLoader extends CompressedTextureLoader {
  constructor(manager: LoadingManager);

  load(url: string, onLoad: (gltf: any) => void, onProgress?: (event: ProgressEvent) => void, onError?: (event: ErrorEvent) => void);

  /**
   * Path to the draco wasm files
   * @param path The path to the wasm files
   */
  setPath(path: string);

  setVerbosity(level: number);

  /**
   *  Sets desired mode for generated geometry indices.
   *  @param drawMode Can be either: TrianglesDrawMode or TriangleStripDrawMode
   */
  setDrawMode(drawMode: 'TrianglesDrawMode' | 'TriangleStripDrawMode');

  /**
   * Skips dequantization for a specific attribute.
   * @param attributeName is the js name of the given attribute type.
   * The only currently supported attributeName is 'position', more may be
   * added in future.
   */
  setSkipDequantization(attributeName: 'position', skip: boolean);

  /**
   * Decompresses a Draco buffer. Names of attributes (for ID and type maps)
   * must be one of the supported three.js types, including: position, color,
   * normal, uv, uv2, skinIndex, skinWeight.
   *
   * @param rawBuffer
   * @param callback
   * @param attributeUniqueIdMap Provides a pre-defined ID
   *     for each attribute in the geometry to be decoded. If given,
   *     `attributeTypeMap` is required and `nativeAttributeMap` will be
   *     ignored.
   * @param attributeTypeMap Provides a predefined data
   *     type (as a typed array constructor) for each attribute in the
   *     geometry to be decoded.
   */
  decodeDracoFile(rawBuffer: ArrayBuffer, callback: any, attributeUniqueIdMap?: {}, attributeTypeMap?: {});

  isVersionSupported(version: any, callback: any);

  getAttributeOptions(attributeName: string);

  static setDecoderPath(path: string): void;
  static setDecoderConfig(config: any): void;
  static releaseDecoderModule(): void;
  static getDecoderModule(): Promise<DracoDecoderModule>;
  static _loadScript(src: string): Promise<HTMLScriptElement>;
  static _loadArrayBuffer(src: string): Promise<ArrayBuffer>;
}
