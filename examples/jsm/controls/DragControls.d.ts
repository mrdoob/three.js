import { Camera, Object3D } from '../../../src/Three';
import { Controls } from './Controls.js';

export class DragControls extends Controls {

	constructor( objects: Object3D[], camera: Camera, domElement: HTMLElement );

	transformGroup: boolean;
	objects: Object3D[];

}
