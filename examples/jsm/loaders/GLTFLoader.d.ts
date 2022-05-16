import {
    AnimationClip,
    BufferAttribute,
    BufferGeometry,
    Camera,
    Group,
    InterleavedBufferAttribute,
    Loader,
    LoadingManager,
    Mesh,
    MeshStandardMaterial,
    Object3D,
    Material,
    SkinnedMesh,
    Texture,
    TextureLoader,
    FileLoader,
    ImageBitmapLoader,
} from '../../../src/Three';

import { DRACOLoader } from './DRACOLoader';
import { KTX2Loader } from './KTX2Loader';

export interface GLTF {
    animations: AnimationClip[];
    scene: Group;
    scenes: Group[];
    cameras: Camera[];
    asset: {
        copyright?: string | undefined;
        generator?: string | undefined;
        version?: string | undefined;
        minVersion?: string | undefined;
        extensions?: any;
        extras?: any;
    };
    parser: GLTFParser;
    userData: any;
}

export class GLTFLoader extends Loader {
    constructor(manager?: LoadingManager);
    dracoLoader: DRACOLoader | null;

    load(
        url: string,
        onLoad: (gltf: GLTF) => void,
        onProgress?: (event: ProgressEvent) => void,
        onError?: (event: ErrorEvent) => void,
    ): void;
    loadAsync(url: string, onProgress?: (event: ProgressEvent) => void): Promise<GLTF>;

    setDRACOLoader(dracoLoader: DRACOLoader): GLTFLoader;

    register(callback: (parser: GLTFParser) => GLTFLoaderPlugin): GLTFLoader;
    unregister(callback: (parser: GLTFParser) => GLTFLoaderPlugin): GLTFLoader;

    setKTX2Loader(ktx2Loader: KTX2Loader): GLTFLoader;
    setMeshoptDecoder(meshoptDecoder: /* MeshoptDecoder */ any): GLTFLoader;

    parse(
        data: ArrayBuffer | string,
        path: string,
        onLoad: (gltf: GLTF) => void,
        onError?: (event: ErrorEvent) => void,
    ): void;

    parseAsync(data: ArrayBuffer | string, path: string): Promise<void>;
}

export type GLTFReferenceType = 'materials' | 'nodes' | 'textures' | 'meshes';

export interface GLTFReference {
    materials?: number;
    nodes?: number;
    textures?: number;
    meshes?: number;
}

export class GLTFParser {
    json: any;

    options: {
        path: string;
        manager: LoadingManager;
        ktx2Loader: KTX2Loader;
        meshoptDecoder: /* MeshoptDecoder */ any;
        crossOrigin: string;
        requestHeader: { [header: string]: string };
    };

    fileLoader: FileLoader;
    textureLoader: TextureLoader | ImageBitmapLoader;
    plugins: GLTFLoaderPlugin;
    extensions: { [name: string]: any };
    associations: Map<Object3D | Material | Texture, GLTFReference>;

    getDependency: (type: string, index: number) => Promise<any>;
    getDependencies: (type: string) => Promise<any[]>;
    loadBuffer: (bufferIndex: number) => Promise<ArrayBuffer>;
    loadBufferView: (bufferViewIndex: number) => Promise<ArrayBuffer>;
    loadAccessor: (accessorIndex: number) => Promise<BufferAttribute | InterleavedBufferAttribute>;
    loadTexture: (textureIndex: number) => Promise<Texture>;
    loadTextureImage: (
        textureIndex: number,
        /**
         * GLTF.Image
         * See: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/schema/image.schema.json
         */
        source: { [key: string]: any },
        loader: Loader,
    ) => Promise<Texture>;
    assignTexture: (
        materialParams: { [key: string]: any },
        mapName: string,
        mapDef: {
            index: number;
            texCoord?: number | undefined;
            extensions?: any;
        },
    ) => Promise<void>;
    assignFinalMaterial: (object: Mesh) => void;
    getMaterialType: () => typeof MeshStandardMaterial;
    loadMaterial: (materialIndex: number) => Promise<Material>;
    createUniqueName: (originalName: string) => string;
    createNodeMesh: (nodeIndex: number) => Promise<Group | Mesh | SkinnedMesh>;
    loadGeometries: (
        /**
         * GLTF.Primitive[]
         * See: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/schema/mesh.primitive.schema.json
         */
        primitives: Array<{ [key: string]: any }>,
    ) => Promise<BufferGeometry[]>;
    loadMesh: (meshIndex: number) => Promise<Group | Mesh | SkinnedMesh>;
    loadCamera: (cameraIndex: number) => Promise<Camera>;
    loadSkin: (skinIndex: number) => Promise<{
        joints: number[];
        inverseBindMatrices?: BufferAttribute | InterleavedBufferAttribute | undefined;
    }>;
    loadAnimation: (animationIndex: number) => Promise<AnimationClip>;
    loadNode: (nodeIndex: number) => Promise<Object3D>;
    loadScene: () => Promise<Group>;
}

export interface GLTFLoaderPlugin {
    beforeRoot?: (() => Promise<void> | null) | undefined;
    afterRoot?: ((result: GLTF) => Promise<void> | null) | undefined;
    loadMesh?: ((meshIndex: number) => Promise<Group | Mesh | SkinnedMesh> | null) | undefined;
    loadBufferView?: ((bufferViewIndex: number) => Promise<ArrayBuffer> | null) | undefined;
    loadMaterial?: ((materialIndex: number) => Promise<Material> | null) | undefined;
    loadTexture?: ((textureIndex: number) => Promise<Texture> | null) | undefined;
    getMaterialType?: ((materialIndex: number) => typeof Material | null) | undefined;
    extendMaterialParams?:
        | ((materialIndex: number, materialParams: { [key: string]: any }) => Promise<any> | null)
        | undefined;
    createNodeMesh?: ((nodeIndex: number) => Promise<Group | Mesh | SkinnedMesh> | null) | undefined;
    createNodeAttachment?: ((nodeIndex: number) => Promise<Object3D> | null) | undefined;
}
