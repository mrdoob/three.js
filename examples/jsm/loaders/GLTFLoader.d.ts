import {
	AnimationClip,
	Camera,
	Group,
	Loader,
	LoadingManager,
	Mesh,
	Object3D,
	Material,
	SkinnedMesh,
	Texture
} from '../../../src/Three';

import { DRACOLoader } from './DRACOLoader';
import { DDSLoader } from './DDSLoader';
import { KTX2Loader } from './KTX2Loader';

export interface GLTF {
	animations: AnimationClip[];
	scene: Group;
	scenes: Group[];
	cameras: Camera[];
	asset: {
		copyright?: string;
		generator?: string;
		version?: string;
		minVersion?: string;
		extensions?: any;
		extras?: any;
	};
	parser: GLTFParser;
	userData: any;
}

export class GLTFLoader extends Loader {

	constructor( manager?: LoadingManager );
	dracoLoader: DRACOLoader | null;
	ddsLoader: DDSLoader | null;

	load( url: string, onLoad: ( gltf: GLTF ) => void, onProgress?: ( event: ProgressEvent ) => void, onError?: ( event: ErrorEvent ) => void ) : void;
	loadAsync( url: string, onProgress?: ( event: ProgressEvent ) => void ): Promise<GLTF>;

	setDRACOLoader( dracoLoader: DRACOLoader ): GLTFLoader;
	setDDSLoader( ddsLoader: DDSLoader ): GLTFLoader;

	register( callback: ( parser: GLTFParser ) => GLTFLoaderPlugin ): GLTFLoader;
	unregister( callback: ( parser: GLTFParser ) => GLTFLoaderPlugin ): GLTFLoader;

	setKTX2Loader( ktx2Loader: KTX2Loader ): GLTFLoader;
	setMeshoptDecoder( meshoptDecoder: /* MeshoptDecoder */ any ): GLTFLoader;

	parse( data: ArrayBuffer | string, path: string, onLoad: ( gltf: GLTF ) => void, onError?: ( event: ErrorEvent ) => void ) : void;

}

export interface GLTFReference {
	type: 'materials'|'nodes'|'textures';
	index: number;
}

export class GLTFParser {

	json: any;

	associations: Map<Object3D|Material|Texture, GLTFReference>;

	getDependency: ( type: string, index: number ) => Promise<any>;
	getDependencies: ( type: string ) => Promise<any[]>;
	assignFinalMaterial: ( object: Mesh ) => void;

}

export interface GLTFLoaderPlugin {

	loadMesh?: ( meshIndex: number ) => Promise<Group | Mesh | SkinnedMesh> | null;
	loadBufferView?: ( bufferViewIndex: number ) => Promise<ArrayBuffer> | null;
	loadMaterial?: ( materialIndex: number ) => Promise<Material> | null;
	loadTexture?: ( textureIndex: number ) => Promise<Texture> | null;
	getMaterialType?: ( materialIndex: number ) => typeof Material | null;
	extendMaterialParams?: ( materialIndex: number, materialParams: { [ key: string ]: any } ) => Promise<any> | null;
	createNodeAttachment?: ( nodeIndex: number ) => Promise<Object3D> | null;

}
