import {
	Group,
	Object3D,
} from '../../../src/Three';

import { GLTFLoader } from '../loaders/GLTFLoader';

export class XRHandModel extends Object3D {

	constructor();

	motionController: any;

}

export class XRHandModelFactory {

	constructor( gltfLoader?: GLTFLoader );
	gltfLoader: GLTFLoader | null;
	path: string;

	createHandModel(
		controller: Group,
		profile?: 'spheres' | 'boxes' | 'oculus',
		options?: { primitive: 'sphere' | 'box' }
	): XRHandModel;

}
