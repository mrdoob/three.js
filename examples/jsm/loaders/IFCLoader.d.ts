import {
    Loader,
    LoadingManager,
    Scene,
    BufferGeometry,
    Material,
    Object3D,
    Mesh,
    BufferAttribute,
} from '../../../src/Three';

declare class IFCLoader extends Loader {
    ifcManager: IFCManager;

    constructor(manager?: LoadingManager);

    load(
        url: any,
        onLoad: (ifc: IFCModel) => void,
        onProgress?: (event: ProgressEvent) => void,
        onError?: (event: ErrorEvent) => void,
    ): void;

    parse(buffer: ArrayBuffer): Promise<IFCModel>;
}

export interface LoaderSettings {
    COORDINATE_TO_ORIGIN: boolean;
    USE_FAST_BOOLS: boolean;
    CIRCLE_SEGMENTS_LOW?: number;
    CIRCLE_SEGMENTS_MEDIUM?: number;
    CIRCLE_SEGMENTS_HIGH?: number;
}

export class IFCManager {
    private state;
    private BVH;
    private parser;
    private subsets;
    private properties;
    private types;
    private hider;

    parse(buffer: ArrayBuffer): Promise<IFCModel>;

    /**
     * Sets the relative path of web-ifc.wasm file in the project.
     * Beware: you **must** serve this file in your page; this means
     * that you have to copy this files from *node_modules/web-ifc*
     * to your deployment directory.
     *
     * If you don't use this methods,
     * IFC.js assumes that you are serving it in the root directory.
     *
     * Example if web-ifc.wasm is in dist/wasmDir:
     * `ifcLoader.setWasmPath("dist/wasmDir/");`
     *
     * @path Relative path to web-ifc.wasm.
     */
    setWasmPath(path: string): void;

    /**
     * Applies a configuration for [web-ifc](https://ifcjs.github.io/info/docs/Guide/web-ifc/Introduction).
     */
    applyWebIfcConfig(settings: LoaderSettings): void;

    /**
     * Enables the JSON mode (which consumes way less memory) and eliminates the WASM data.
     * Only use this in the following scenarios:
     * - If you don't need to access the properties of the IFC
     * - If you will provide the properties as JSON.
     */
    useJSONData(useJSON?: boolean): void;

    /**
     * Adds the properties of a model as JSON data.
     * @modelID ID of the IFC model.
     * @data: data as an object where the keys are the expressIDs and the values the properties.
     */
    addModelJSONData(
        modelID: number,
        data: {
            [id: number]: JSONObject;
        },
    ): void;

    /**
     * Completely releases the WASM memory, thus drastically decreasing the memory use of the app.
     * Only use this in the following scenarios:
     * - If you don't need to access the properties of the IFC
     * - If you will provide the properties as JSON.
     */
    disposeMemory(): void;

    /**
     * Makes object picking a lot faster
     * Courtesy of gkjohnson's [work](https://github.com/gkjohnson/three-mesh-bvh).
     * Import these objects from his library and pass them as arguments. IFC.js takes care of the rest!
     */
    setupThreeMeshBVH(computeBoundsTree: any, disposeBoundsTree: any, acceleratedRaycast: any): void;

    /**
     * Closes the specified model and deletes it from the [scene](https://threejs.org/docs/#api/en/scenes/Scene).
     * @modelID ID of the IFC model.
     * @scene Scene where the model is (if it's located in a scene).
     */
    close(modelID: number, scene?: Scene): void;

    /**
     * Gets the **Express ID** to which the given face belongs.
     * This ID uniquely identifies this entity within this IFC file.
     * @geometry The geometry of the IFC model.
     * @faceIndex The index of the face of a geometry.You can easily get this index using the [Raycaster](https://threejs.org/docs/#api/en/core/Raycaster).
     */
    getExpressId(geometry: BufferGeometry, faceIndex: number): number | undefined;

    /**
     * Returns all items of the specified type. You can import
     * the types from *web-ifc*.
     *
     * Example to get all the standard walls of a project:
     * ```js
     * import { IFCWALLSTANDARDCASE } from 'web-ifc';
     * const walls = ifcLoader.getAllItemsOfType(IFCWALLSTANDARDCASE);
     * ```
     * @modelID ID of the IFC model.
     * @ifcType type of IFC items to get.
     * @verbose If false (default), this only gets IDs. If true, this also gets the native properties of all the fetched items.
     */
    getAllItemsOfType(modelID: number, type: number, verbose: boolean): any[];

    /**
     * Gets the native properties of the given element.
     * @modelID ID of the IFC model.
     * @id Express ID of the element.
     * @recursive Wether you want to get the information of the referenced elements recursively.
     */
    getItemProperties(modelID: number, id: number, recursive?: boolean): any;

    /**
     * Gets the [property sets](https://standards.buildingsmart.org/IFC/DEV/IFC4_2/FINAL/HTML/schema/ifckernel/lexical/ifcpropertyset.htm)
     * assigned to the given element.
     * @modelID ID of the IFC model.
     * @id Express ID of the element.
     * @recursive If true, this gets the native properties of the referenced elements recursively.
     */
    getPropertySets(modelID: number, id: number, recursive?: boolean): any[];

    /**
     * Gets the properties of the type assigned to the element.
     * For example, if applied to a wall (IfcWall), this would get back the information
     * contained in the IfcWallType assigned to it, if any.
     * @modelID ID of the IFC model.
     * @id Express ID of the element.
     * @recursive If true, this gets the native properties of the referenced elements recursively.
     */
    getTypeProperties(modelID: number, id: number, recursive?: boolean): any[];

    /**
     * Gets the materials assigned to the given element.
     * @modelID ID of the IFC model.
     * @id Express ID of the element.
     * @recursive If true, this gets the native properties of the referenced elements recursively.
     */
    getMaterialsProperties(modelID: number, id: number, recursive?: boolean): any[];

    /**
     * Gets the ifc type of the specified item.
     * @modelID ID of the IFC model.
     * @id Express ID of the element.
     */
    getIfcType(modelID: number, id: number): string;

    /**
     * Gets the spatial structure of the project. The
     * [spatial structure](https://standards.buildingsmart.org/IFC/DEV/IFC4_2/FINAL/HTML/schema/ifcproductextension/lexical/ifcspatialstructureelement.htm)
     * is the hierarchical structure that organizes every IFC project (all physical items
     * are referenced to an element of the spatial structure). It is formed by
     * one IfcProject that contains one or more IfcSites, that contain one or more
     * IfcBuildings, that contain one or more IfcBuildingStoreys, that contain
     * one or more IfcSpaces.
     * @modelID ID of the IFC model.
     */
    getSpatialStructure(modelID: number): {
        expressID: number;
        type: string;
        children: never[];
    };

    /**
     * Gets the mesh of the subset with the specified [material](https://threejs.org/docs/#api/en/materials/Material).
     * If no material is given, this returns the subset with the original materials.
     * @modelID ID of the IFC model.
     * @material Material assigned to the subset (if any).
     */
    getSubset(modelID: number, material?: Material): Mesh | null;

    /**
     * Removes the specified subset.
     * @modelID ID of the IFC model.
     * @parent The parent where the subset is (can be any `THREE.Object3D`).
     * @material Material assigned to the subset, if any.
     */
    removeSubset(modelID: number, parent?: Object3D, material?: Material): void;

    /**
     * Creates a new geometric subset.
     * @config A configuration object with the following options:
     * - **scene**: `THREE.Object3D` where the model is located.
     * - **modelID**: ID of the model.
     * - **ids**: Express IDs of the items of the model that will conform the subset.
     * - **removePrevious**: wether to remove the previous subset of this model with this material.
     * - **material**: (optional) wether to apply a material to the subset
     */
    createSubset(config: HighlightConfigOfModel): void | Mesh;

    /**
     * Hides the selected items in the specified model
     * @modelID ID of the IFC model.
     * @ids Express ID of the elements.
     */
    hideItems(modelID: number, ids: number[]): void;

    /**
     * Hides all the items of the specified model
     * @modelID ID of the IFC model.
     */
    hideAllItems(modelID: number): void;

    /**
     * Shows all the items of the specified model
     * @modelID ID of the IFC model.
     * @ids Express ID of the elements.
     */
    showItems(modelID: number, ids: number[]): void;

    /**
     * Shows all the items of the specified model
     * @modelID ID of the IFC model.
     */
    showAllItems(modelID: number): void;
}

/**
 * Represents an IFC model. This object is returned by the `IFCLoader` after loading an IFC.
 * @geometry `THREE.Buffergeometry`, see Three.js documentation.
 * @materials `THREE.Material[]`, see Three.js documentation.
 * @manager contains all the logic to work with IFC.
 */
export class IFCModel extends Mesh {
    modelID: number;
    ifcManager: IFCManager | null;
    /**
     * @deprecated `IfcModel` is already a mesh; you can place it in the scene directly.
     */
    mesh: this;

    setIFCManager(manager: IFCManager): void;

    /**
     * @deprecated Use `IfcModel.ifcManager.setWasmPath` instead.
     *
     * Sets the relative path of web-ifc.wasm file in the project.
     * Beware: you **must** serve this file in your page; this means
     * that you have to copy this files from *node_modules/web-ifc*
     * to your deployment directory.
     *
     * If you don't use this methods,
     * IFC.js assumes that you are serving it in the root directory.
     *
     * Example if web-ifc.wasm is in dist/wasmDir:
     * `ifcLoader.setWasmPath("dist/wasmDir/");`
     *
     * @path Relative path to web-ifc.wasm.
     */
    setWasmPath(path: string): void;

    /**
     * @deprecated Use `IfcModel.ifcManager.close` instead.
     *
     * Closes the specified model and deletes it from the [scene](https://threejs.org/docs/#api/en/scenes/Scene).
     * @scene Scene where the model is (if it's located in a scene).
     */
    close(scene?: Scene): void;

    /**
     * @deprecated Use `IfcModel.ifcManager.getExpressId` instead.
     *
     * Gets the **Express ID** to which the given face belongs.
     * This ID uniquely identifies this entity within this IFC file.
     * @geometry The geometry of the IFC model.
     * @faceIndex The index of the face of a geometry.You can easily get this index using the [Raycaster](https://threejs.org/docs/#api/en/core/Raycaster).
     */
    getExpressId(geometry: BufferGeometry, faceIndex: number): number | undefined;

    /**
     * @deprecated Use `IfcModel.ifcManager.getAllItemsOfType` instead.
     *
     * Returns all items of the specified type. You can import
     * the types from *web-ifc*.
     *
     * Example to get all the standard walls of a project:
     * ```js
     * import { IFCWALLSTANDARDCASE } from 'web-ifc';
     * const walls = ifcLoader.getAllItemsOfType(IFCWALLSTANDARDCASE);
     * ```
     * @ifcType The type of IFC items to get.
     * @verbose If false (default), this only gets IDs. If true, this also gets the native properties of all the fetched items.
     */
    getAllItemsOfType(type: number, verbose: boolean): any[];

    /**
     * @deprecated Use `IfcModel.ifcManager.getItemProperties` instead.
     *
     * Gets the native properties of the given element.
     * @id Express ID of the element.
     * @recursive Wether you want to get the information of the referenced elements recursively.
     */
    getItemProperties(id: number, recursive?: boolean): any;

    /**
     * @deprecated Use `IfcModel.ifcManager.getPropertySets` instead.
     *
     * Gets the [property sets](https://standards.buildingsmart.org/IFC/DEV/IFC4_2/FINAL/HTML/schema/ifckernel/lexical/ifcpropertyset.htm)
     * assigned to the given element.
     * @id Express ID of the element.
     * @recursive If true, this gets the native properties of the referenced elements recursively.
     */
    getPropertySets(id: number, recursive?: boolean): any[];

    /**
     * @deprecated Use `IfcModel.ifcManager.getTypeProperties` instead.
     *
     * Gets the properties of the type assigned to the element.
     * For example, if applied to a wall (IfcWall), this would get back the information
     * contained in the IfcWallType assigned to it, if any.
     * @id Express ID of the element.
     * @recursive If true, this gets the native properties of the referenced elements recursively.
     */
    getTypeProperties(id: number, recursive?: boolean): any[];

    /**
     * @deprecated Use `IfcModel.ifcManager.getIfcType` instead.
     *
     * Gets the ifc type of the specified item.
     * @id Express ID of the element.
     */
    getIfcType(id: number): string;

    /**
     * @deprecated Use `IfcModel.ifcManager.getSpatialStructure` instead.
     *
     * Gets the spatial structure of the project. The
     * [spatial structure](https://standards.buildingsmart.org/IFC/DEV/IFC4_2/FINAL/HTML/schema/ifcproductextension/lexical/ifcspatialstructureelement.htm)
     * is the hierarchical structure that organizes every IFC project (all physical items
     * are referenced to an element of the spatial structure). It is formed by
     * one IfcProject that contains one or more IfcSites, that contain one or more
     * IfcBuildings, that contain one or more IfcBuildingStoreys, that contain
     * one or more IfcSpaces.
     */
    getSpatialStructure(): {
        expressID: number;
        type: string;
        children: never[];
    };

    /**
     * @deprecated Use `IfcModel.ifcManager.getSubset` instead.
     *
     * Gets the mesh of the subset with the specified [material](https://threejs.org/docs/#api/en/materials/Material).
     * If no material is given, this returns the subset with the original materials.
     * @material Material assigned to the subset, if any.
     */
    getSubset(material?: Material): Mesh | null;

    /**
     * @deprecated Use `IfcModel.ifcManager.removeSubset` instead.
     *
     * Removes the specified subset.
     * @parent The parent where the subset is (can be any `THREE.Object3D`).
     * @material Material assigned to the subset, if any.
     */
    removeSubset(parent?: Object3D, material?: Material): void;

    /**
     * @deprecated Use `IfcModel.ifcManager.createSubset` instead.
     *
     * Creates a new geometric subset.
     * @config A configuration object with the following options:
     * - **scene**: `THREE.Object3D` where the model is located.
     * - **ids**: Express IDs of the items of the model that will conform the subset.
     * - **removePrevious**: Wether to remove the previous subset of this model with this material.
     * - **material**: (optional) Wether to apply a material to the subset
     */
    createSubset(config: HighlightConfig): void | Mesh;

    /**
     * @deprecated Use `IfcModel.ifcManager.hideItems` instead.
     *
     * Hides the selected items in the specified model
     * @ids Express ID of the elements.
     */
    hideItems(ids: number[]): void;

    /**
     * @deprecated Use `IfcModel.ifcManager.hideAllItems` instead.
     *
     * Hides all the items of the specified model
     */
    hideAllItems(): void;

    /**
     * @deprecated Use `IfcModel.ifcManager.showItems` instead.
     *
     * Hides all the items of the specified model
     * @ids Express ID of the elements.
     */
    showItems(ids: number[]): void;

    /**
     * @deprecated Use `IfcModel.ifcManager.showAllItems` instead.
     *
     * Shows all the items of the specified model
     */
    showAllItems(): void;
}

export const IdAttrName = 'expressID';
export interface IdAttributeByMaterial {
    [id: number]: number;
}
export interface IdAttributesByMaterials {
    [materialID: string]: IdAttributeByMaterial;
}
export function merge(geoms: BufferGeometry[], createGroups?: boolean): BufferGeometry;
export function newFloatAttr(data: any[], size: number): BufferAttribute;
export function newIntAttr(data: any[], size: number): BufferAttribute;

export interface HighlightConfig {
    scene: Object3D;
    ids: number[];
    removePrevious: boolean;
    material?: Material;
}

export interface HighlightConfigOfModel extends HighlightConfig {
    modelID: number;
}

export const DEFAULT = 'default';
export interface SelectedItems {
    [matID: string]: {
        ids: Set<number>;
        mesh: Mesh;
    };
}
export interface MapFaceindexID {
    [key: number]: number;
}
export interface IdGeometries {
    [expressID: number]: BufferGeometry;
}
export interface GeometriesByMaterial {
    material: Material;
    geometries: IdGeometries;
}

export interface GeometriesByMaterials {
    [materialID: string]: GeometriesByMaterial;
}

export interface TypesMap {
    [key: number]: number;
}

export interface IfcModel {
    modelID: number;
    mesh: IfcMesh;
    items: GeometriesByMaterials;
    types: TypesMap;
    jsonData: {
        [id: number]: JSONObject;
    };
}

export interface JSONObject {
    expressID: number;
    type: string;

    [key: string]: any;
}

export interface IfcState {
    models: {
        [modelID: number]: IfcModel;
    };
    api: IfcAPI;
    useJSON: boolean;
    webIfcSettings?: LoaderSettings;
}

export interface IfcMesh extends Mesh {
    modelID: number;
}

export interface Node {
    expressID: number;
    type: string;
    children: Node[];
}

export interface pName {
    name: number;
    relating: string;
    related: string;
    key: string;
}

export const PropsNames: {
    aggregates: {
        name: number;
        relating: string;
        related: string;
        key: string;
    };
    spatial: {
        name: number;
        relating: string;
        related: string;
        key: string;
    };
    psets: {
        name: number;
        relating: string;
        related: string;
        key: string;
    };
    materials: {
        name: number;
        relating: string;
        related: string;
        key: string;
    };
    type: {
        name: number;
        relating: string;
        related: string;
        key: string;
    };
};

export interface IfcGeometry {
    GetVertexData(): number;

    GetVertexDataSize(): number;

    GetIndexData(): number;

    GetIndexDataSize(): number;
}

export interface RawLineData {
    ID: number;
    type: number;
    arguments: any[];
}

export interface Vector<T> {
    get(index: number): T;

    size(): number;
}

export interface FlatMesh {
    geometries: Vector<PlacedGeometry>;
    expressID: number;
}

export interface PlacedGeometry {
    color: Color;
    geometryExpressID: number;
    flatTransformation: number[];
}

export interface Color {
    x: number;
    y: number;
    z: number;
    w: number;
}

export class IfcAPI {
    wasmModule: any;
    fs: any;

    /**
     * Initializes the WASM module (WebIFCWasm), required before using any other functionality
     */
    Init(): Promise<void>;

    /**
     * Opens a model and returns a modelID number
     * @data Buffer containing IFC data (bytes)
     * @data Settings settings for loading the model
     */
    OpenModel(data: string | Uint8Array, settings?: LoaderSettings): number;

    /**
     * Creates a new model and returns a modelID number
     * @data Settings settings for generating data the model
     */
    CreateModel(settings?: LoaderSettings): number;

    ExportFileAsIFC(modelID: number): Uint8Array;

    /**
     * Opens a model and returns a modelID number
     * @modelID Model handle retrieved by OpenModel, model must not be closed
     * @data Buffer containing IFC data (bytes)
     */
    GetGeometry(modelID: number, geometryExpressID: number): IfcGeometry;

    GetLine(modelID: number, expressID: number, flatten?: boolean): any;

    WriteLine(modelID: number, lineObject: any): void;

    FlattenLine(modelID: number, line: any): void;

    GetRawLineData(modelID: number, expressID: number): RawLineData;

    WriteRawLineData(modelID: number, data: RawLineData): any;

    GetLineIDsWithType(modelID: number, type: number): Vector<number>;

    GetAllLines(modelID: number): Vector<number>;

    SetGeometryTransformation(modelID: number, transformationMatrix: number[]): void;

    GetVertexArray(ptr: number, size: number): Float32Array;

    GetIndexArray(ptr: number, size: number): Uint32Array;

    getSubArray(heap: any, startPtr: any, sizeBytes: any): any;

    /**
     * Closes a model and frees all related memory
     * @modelID Model handle retrieved by OpenModel, model must not be closed
     */
    CloseModel(modelID: number): void;

    StreamAllMeshes(modelID: number, meshCallback: (mesh: FlatMesh) => void): void;

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

    /**
     * Load geometry for a single element
     * @modelID Model handle retrieved by OpenModel
     */
    GetFlatMesh(modelID: number, expressID: number): FlatMesh;

    SetWasmPath(path: string): void;
}

export { IFCLoader };
