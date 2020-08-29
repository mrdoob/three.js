import { EventDispatcher, Camera, Object3D, Plane, Vector2, Vector3, Vector } from '../../../src/Three';

export class Controls extends EventDispatcher {

	constructor( camera: Camera, domElement: HTMLElement );

	camera: Camera;

	domElement: HTMLElement | HTMLDocument;

	target: Vector3;

	enabled: boolean = true;

	enableDamping: boolean = false;

	dampingFactor: number = 0.05;

	onTrackedPointerDown( pointer: Pointer, pointer: Pointer[] ): void;

	onTrackedPointerMove( pointer: Pointer, pointer: Pointer[] ): void;

	onTrackedPointerHover( pointer: Pointer, pointer: Pointer[] ): void;

	onTrackedPointerUp( pointer: Pointer, pointer: Pointer[] ): void;

	onTrackedKeyDown( keyCode: number, keyCodes: number[] ): void;

	onTrackedKeyUp( keyCode: number, keyCodes: number[] ): void;

	onTrackedKeyChange( keyCode: number, keyCodes: number[] ): void;

	dispose(): void;

	startAnimation( callback: Function ): void;

	stopAnimation( callback: Function ): void;

}

export class Pointer {

	constructor( pointerEvent: PointerEvent, camera: Camera, target: Vector3 );

	domElement: HTMLElement | HTMLDocument;

	pointerId: number;

	type: string;

	buttons: number;

	altKey: boolean;
	ctrlKey: boolean;
	metaKey: boolean;
	shiftKey: boolean;

	start: Vector2;
	current: Vector2;
	previous: Vector2;
	movement: Vector2;
	delta: Vector2;

	view: Object = {
		start: Vector2,
		current: Vector2,
		previous: Vector2,
		movement: Vector2,
		delta: Vector2
	}

	planar: Object = {
		start: Vector3,
		current: Vector3,
		previous: Vector3,
		movement: Vector3,
		delta: Vector3
	}

	world: Object = {
		start: Vector3,
		current: Vector3,
		previous: Vector3,
		movement: Vector3,
		delta: Vector3
	}

	update( pointerEvent: PointerEvent, camera: Camera, target: Vector3 ): void;
	applyDamping( dampingFactor: number, deltaTime: number ): void;
	intersectObjects( objects: Object3D[] ): object[];
	intersectPlane( plane: Plane ): Vector3;

}
