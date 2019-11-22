import {
	EventDispatcher,
	Color,
	Scene,
	Camera
} from '../../../src/Three';

export interface RaytracingRendererParameters {
	alpha?: boolean;
	blockSize?: number;
	randomize: boolean;
	workerPath: string;
	workers: number;
}

export class RaytracingRenderer extends EventDispatcher {

	constructor( parameters: RaytracingRendererParameters );
	domElement: HTMLElement;
	autoClear: boolean;
	randomize: boolean;

	setWorkers( w: number ): void;
	setClearColor( color: Color, alpha: number ): void;
	setPixelRatio(): void;
	setSize( width: number, height: number ): void;
	clear(): void;
	render( scene: Scene, camera: Camera ): void;

}
