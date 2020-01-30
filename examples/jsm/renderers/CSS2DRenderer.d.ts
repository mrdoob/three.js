import {
	Object3D,
	Scene,
	Camera
} from '../../../src/Three';

export class CSS2DObject extends Object3D {

	constructor( element: HTMLElement );
	element: HTMLElement;

	onBeforeRender: <Renderer = CSS2DRenderer>(renderer: Renderer, scene: Scene, camera: Camera) => void;
 	onAfterRender: <Renderer = CSS2DRenderer>(renderer: Renderer, scene: Scene, camera: Camera) => void;

}

export class CSS2DRenderer {

	constructor();
	domElement: HTMLElement;

	getSize(): {width: number, height: number};
	setSize( width: number, height: number ): void;
	render( scene: Scene, camera: Camera ): void;

}
