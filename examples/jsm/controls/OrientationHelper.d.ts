import { Scene, Camera, Mesh } from '../../../src/Three';
import { OrbitControls } from './OrbitControls';

export class OrientationHelper {

	constructor( object: Camera, controls?: OrbitControls, options?: Object, labels?: Object );

	object: Camera;
	controls: OrbitControls;
	options: Object;
	labels: Object 

	// API
	enabled: boolean;
	visible: boolean;
	scene: Scene;
	domElement: HTMLElement;

	update(): void;
	activate(): void;
	deactivate(): void;
	dispose(): void;

	setGizmo( model3D: Mesh, addRing: Boolean ): void;
	takePicture( imageFormat: String ): Promise<String>;

}
