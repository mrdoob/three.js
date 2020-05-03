import {
	Camera,
	EventDispatcher,
	Object3D
} from '../../../src/Three';

export class DragControls extends EventDispatcher {

	constructor( objects: Object3D[], camera: Camera, domElement?: HTMLElement );

	object: Camera;

	// API

	enabled: boolean;
	transformGroup: boolean;

	activate(): void;
	deactivate(): void;
	dispose(): void;
	getObjects(): Object3D[];

}

export interface DragEvent {
	object: THREE.Object3D;
	target: DragControls;
	type: string;
	event: MouseEvent;
}
