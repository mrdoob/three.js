import { Camera, MOUSE, TOUCH, Vector3 } from '../../../src/Three';
import { Controls } from './Controls.js';

export class OrbitControls extends Controls {

	constructor( object: Camera, domElement: HTMLElement );

	object: Camera;

	// API
	target: Vector3;

	// deprecated
	center: Vector3;

	minDistance: number;
	maxDistance: number;

	minZoom: number;
	maxZoom: number;

	minPolarAngle: number;
	maxPolarAngle: number;

	minAzimuthAngle: number;
	maxAzimuthAngle: number;

	enableDamping: boolean;
	dampingFactor: number;

	enableZoom: boolean;
	zoomSpeed: number;

	enableRotate: boolean;
	rotateSpeed: number;

	enablePan: boolean;
	panSpeed: number;
	screenSpacePanning: boolean;
	keyPanSpeed: number;

	autoRotate: boolean;
	autoRotateSpeed: number;

	enableKeys: boolean;
	keys: { LEFT: number; UP: number; RIGHT: number; BOTTOM: number; };
	mouseButtons: { LEFT: MOUSE; MIDDLE: MOUSE; RIGHT: MOUSE; };
	touches: { ONE: TOUCH; TWO: TOUCH };

	update(): boolean;

	saveState(): void;

	reset(): void;

	getPolarAngle(): number;

	getAzimuthalAngle(): number;

}
