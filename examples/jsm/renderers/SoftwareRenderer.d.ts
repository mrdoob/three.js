import {
	Color,
	Scene,
	Camera
} from '../../../src/Three';

export class SoftwareRenderer {

	constructor();
	domElement: HTMLElement;
	autoClear: boolean;

	setClearColor( color: Color, alpha: number ): void;
	setPixelRatio(): void;
	setSize( width: number, height: number ): void;
	clear(): void;
	render( scene: Scene, camera: Camera ): void;

}
