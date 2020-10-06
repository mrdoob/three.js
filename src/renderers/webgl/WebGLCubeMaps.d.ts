import { WebGLRenderer } from '../WebGLRenderer';

export class WebGLCubeMaps {

	constructor( renderer: WebGLRenderer );

	get( texture: any, isPBR?: boolean ): any;
	dispose(): void;

}
