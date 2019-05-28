import { WebGLRenderer } from './../WebGLRenderer';
import { WebGLProgram } from './WebGLProgram';
import { WebGLCapabilities } from './WebGLCapabilities';
import { WebGLExtensions } from './WebGLExtensions';
import { WebGLTextures } from './WebGLTextures';
import { ShaderMaterial } from './../../materials/ShaderMaterial';

export class WebGLPrograms {

	constructor( renderer: WebGLRenderer, extensions: WebGLExtensions, capabilities: WebGLCapabilities, textures: WebGLTextures );

	programs: WebGLProgram[];

	getParameters(
		material: ShaderMaterial,
		lights: any,
		fog: any,
		nClipPlanes: number,
		object: any
	): any;
	getProgramCode( material: ShaderMaterial, parameters: any ): string;
	acquireProgram(
		material: ShaderMaterial,
		parameters: any,
		code: string
	): WebGLProgram;
	releaseProgram( program: WebGLProgram ): void;

}
