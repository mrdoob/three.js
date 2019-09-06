export class OBJLoader2Parser {
  constructor();
  callbacks: {
    onProgress: Function;
    onAssetAvailable: Function;
    onError: Function;
    onLoad: Function;
  };
  contentRef: Uint8Array;
  legacyMode: boolean;
  materials: object;
  materialPerSmoothingGroup: boolean;
  useOAsMesh: boolean;
  useIndices: boolean;
  disregardNormals: boolean;

  vertices: number[];
  colors: number[];
  normals: number[];
  uvs: number[];

  rawMesh: {
    objectName: string;
    groupName: string;
    activeMtlName: string;
    mtllibName: string;
    faceType: number;
    subGroups: object[];
    subGroupInUse: object;
    smoothingGroup: {
      splitMaterials: boolean;
      normalized: boolean;
      real: boolean;
    };
    counts: {
      doubleIndicesCount: number;
      faceCount: number;
      mtlCount: number;
      smoothingGroupCount: number;
    }
  };

  inputObjectCount: number;
  outputObjectCount: number;
  globalCounts: {
    vertices: number;
    faces: number;
    doubleIndicesCount: number;
    lineByte: number;
    currentByte: number;
    totalBytes: number;
  };

  logging: {
    enabled: boolean;
    debug: boolean;
  };

  setMaterialPerSmoothingGroup(materialPerSmoothingGroup: boolean): this;
  setUseOAsMesh(useOAsMesh: boolean): this;
  setUseIndices(useIndices: boolean): this;
  setDisregardNormals(disregardNormals: boolean): this;

  setCallbackOnAssetAvailable(onAssetAvailable: Function): this;
  setCallbackOnProgress(onProgress: Function): this;
  setCallbackOnError(onError: Function): this;
  setCallbackOnLoad(onLoad: Function): this;
  setLogging(enabled: boolean, debug: boolean): this;
  execute(arrayBuffer: Uint8Array): void;
  executeLegacy(text: string): void;
}
