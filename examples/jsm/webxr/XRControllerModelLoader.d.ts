import {
	Group,
	Object3D,
	Texture
} from '../../../src/Three';

import { GLTFLoader } from '../loaders/GLTFLoader';

export class XRControllerModel extends Object3D {
	constructor( );

	motionController: any;

	setEnvironmentMap( envMap: Texture ): XRControllerModel;
}

export class XRControllerModelLoader {
	constructor( gltfLoader?: GLTFLoader );
	gltfLoader: GLTFLoader | null;
	path: string;

	setGLTFLoader( gltfLoader: GLTFLoader ): XRControllerModelLoader;
	getControllerModel( controller: Group ): XRControllerModel;
}
