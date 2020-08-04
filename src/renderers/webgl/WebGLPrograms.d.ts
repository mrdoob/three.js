import { WebGLRenderer } from './../WebGLRenderer';
import { WebGLProgram } from './WebGLProgram';
import { WebGLCapabilities } from './WebGLCapabilities';
import { WebGLExtensions } from './WebGLExtensions';
import { Material } from './../../materials/Material';
import { Scene } from './../../scenes/Scene';

export interface WebGLProgramParameters {
	vertexShader: string;
	fragmentShader: string;
}

export class WebGLPrograms {

	constructor(
		renderer: WebGLRenderer,
		extensions: WebGLExtensions,
		capabilities: WebGLCapabilities
	);

	programs: WebGLProgram[];

	getParameters(
		material: Material,
		lights: any,
		shadows: any[],
		scene: Scene,
		nClipPlanes: number,
		nClipIntersection: number,
		object: any
	): WebGLProgramParameters;
	getProgramCacheKey( parameters: WebGLProgramParameters ): string;
	getUniforms( material: Material ): any;
	acquireProgram(
		parameters: WebGLProgramParameters,
		cacheKey: string
	): WebGLProgram;
	releaseProgram( program: WebGLProgram ): void;

}
