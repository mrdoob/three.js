import { WebGLRenderer } from './../WebGLRenderer';
import { WebGLProgram } from './WebGLProgram';
import { WebGLCapabilities } from './WebGLCapabilities';
import { WebGLExtensions } from './WebGLExtensions';
import { Material } from './../../materials/Material';

export class WebGLPrograms {

	constructor( renderer: WebGLRenderer, extensions: WebGLExtensions, capabilities: WebGLCapabilities );

	programs: WebGLProgram[];

	getParameters(
		material: Material,
		lights: any,
		fog: any,
		nClipPlanes: number,
		object: any
	): any;
	getProgramCacheKey( material: Material, parameters: any ): string;
	acquireProgram(
		material: Material,
		parameters: any,
		cacheKey: string
	): WebGLProgram;
	releaseProgram( program: WebGLProgram ): void;

}
