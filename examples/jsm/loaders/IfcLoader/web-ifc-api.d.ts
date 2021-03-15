export interface Vector<T> {
    get(index: number): T;
    size(): number;
}
export interface Color {
    x: number;
    y: number;
    z: number;
    w: number;
}
export interface PlacedGeometry {
    color: Color;
    geometryExpressID: number;
    flatTransformation: Array<number>;
}
export interface FlatMesh {
    geometries: Vector<PlacedGeometry>;
}
export interface IfcGeometry {
    GetVertexData(): number;
    GetVertexDataSize(): number;
    GetIndexData(): number;
    GetIndexDataSize(): number;
}
export declare function ms(): number;
export declare class IfcAPI {
    wasmModule: any;
    /**
     * Initializes the WASM module (WebIFCWasm), required before using any other functionality
    */
    Init(): Promise<void>;
    /**
     * Opens a model and returns a modelID number
     * @filename Is for debuggin purposes
     * @data Buffer containing IFC data (bytes)
    */
    OpenModel(filename: string, data: string | Uint8Array): number;
    /**
     * Opens a model and returns a modelID number
     * @modelID Model handle retrieved by OpenModel, model must not be closed
     * @data Buffer containing IFC data (bytes)
    */
    GetGeometry(modelID: number, geometryExpressID: number): IfcGeometry;
    SetGeometryTransformation(modelID: number, transformationMatrix: Array<number>): void;
    GetVertexArray(ptr: number, size: number): any;
    GetIndexArray(ptr: number, size: number): any;
    getSubArray(heap: any, startPtr: any, sizeBytes: any): any;
    /**
     * Closes a model and frees all related memory
     * @modelID Model handle retrieved by OpenModel, model must not be closed
    */
    CloseModel(modelID: number): void;
    /**
     * Checks if a specific model ID is open or closed
     * @modelID Model handle retrieved by OpenModel
    */
    IsModelOpen(modelID: number): boolean;
    /**
     * Load all geometry in a model
     * @modelID Model handle retrieved by OpenModel
    */
    LoadAllGeometry(modelID: number): Vector<FlatMesh>;
}
