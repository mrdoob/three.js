import {
	Object3D
} from '../../../src/Three';

export class DeviceOrientationControls {

	constructor( object: Object3D );

	object: Object3D;

	// API

	alphaOffset: number;
	deviceOrientation: any;
	enabled: boolean;
	screenOrientation: number;

	connect(): void;
	disconnect(): void;
	dispose(): void;
	update(): void;

}
