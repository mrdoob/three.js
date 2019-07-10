export class OBJLoader2Parser {
  constructor();
  callbacks: {
    onProgress: Function;
    onAssetAvailable: Function;
    onError: Function;
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

  resetRawMesh(): void;
  setMaterialPerSmoothingGroup(materialPerSmoothingGroup: boolean): void;
  setUseOAsMesh(useOAsMesh: boolean): void;
  setUseIndices(useIndices: boolean): void;
  setDisregardNormals(disregardNormals: boolean): void;
  setMaterials(materials: object): void;
  setCallbackOnAssetAvailable(onAssetAvailable: Function): void;
  setCallbackOnProgress(onProgress: Function): void;
  setCallbackOnError(onError: Function): void;
  setLogging(enabled: boolean, debug: boolean): void;
  configure(): void;
  parse(arrayBuffer: Uint8Array): void;
  parseText(text: string): void;
  processLine(buffer: string[], bufferPointer: number, slashesCount: number): void;
  pushSmoothingGroup(smoothingGroup: object): void;
  checkFaceType(faceType: number): void;
  checkSubGroup(): void;
  buildFace(faceIndexV: string, faceIndexU: string, faceIndexN: string): void;
  createRawMeshReport(inputObjectCount: number): void;
  finalizeRawMesh(): object;
  processCompletedMesh(): boolean;
  buildMesh(result: object): void;
  finalizeParsing(): void;
}
