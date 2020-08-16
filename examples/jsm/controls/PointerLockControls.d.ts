import {
	Camera,
	EventDispatcher,
	Vector3
} from '../../../src/Three';

export class PointerLockControls extends EventDispatcher {

	constructor( camera: Camera, domElement?: HTMLElement );

	domElement: HTMLElement;

	// API

	isLocked: boolean;

	minPolarAngle: number;
	maxPolarAngle: number;

	connect(): void;
	disconnect(): void;
	dispose(): void;
	getObject(): Camera;
	getDirection( v: Vector3 ): Vector3;
	moveForward( distance: number ): void;
	moveRight( distance: number ): void;
	lock(): void;
	unlock(): void;

}
