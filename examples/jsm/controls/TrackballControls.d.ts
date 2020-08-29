import { Camera } from '../../../src/Three';
import { Controls } from './Controls.js';

export class TrackballControls extends Controls {

	constructor( camera: Camera, domElement: HTMLElement );

	// API
	rotateSpeed: number;
	zoomSpeed: number;
	panSpeed: number;
	noRotate: boolean;
	noZoom: boolean;
	noPan: boolean;
	noRoll: boolean;
	minDistance: number;
	maxDistance: number;
	keys: number[];

	update(): void;

	reset(): void;

	zoomCamera(): void;

	panCamera(): void;

	rotateCamera(): void;

}
