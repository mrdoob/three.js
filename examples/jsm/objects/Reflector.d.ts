import {
	Mesh,
	BufferGeometry,
	Color,
	WebGLRenderTarget
} from '../../../src/Three';

export interface ReflectorOptions {
	color?: Color;
	textureWidth?: number;
	textureHeight?: number;
	clipBias?: number;
	shader?: object;
	recursion?: number;
}

export class Reflector extends Mesh {

	constructor( geometry?: BufferGeometry, options?: ReflectorOptions );

	getRenderTarget(): WebGLRenderTarget;

}
