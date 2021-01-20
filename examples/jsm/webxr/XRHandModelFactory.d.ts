import {
	Group,
	Object3D,
} from '../../../src/Three';

export class XRHandModel extends Object3D {

	constructor();

	motionController: any;

}

export class XRHandModelFactory {

	constructor();
	path: string;

	createHandModel(
		controller: Group,
		profile?: 'spheres' | 'boxes' | 'oculus',
		options?: { model?: 'lowpoly', primitive?: 'sphere' | 'box' }
	): XRHandModel;

}
