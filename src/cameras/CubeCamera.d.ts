import { WebGLCubeRenderTarget } from './../renderers/WebGLCubeRenderTarget';
import { WebGLRenderTargetOptions } from './../renderers/WebGLRenderTarget';
import { Scene } from './../scenes/Scene';
import { WebGLRenderer } from './../renderers/WebGLRenderer';
import { Object3D } from './../core/Object3D';

export class CubeCamera extends Object3D {

	constructor( near?: number, far?: number, cubeResolution?: number, options?: WebGLRenderTargetOptions );

	type: 'CubeCamera';

	renderTarget: WebGLCubeRenderTarget;

	update( renderer: WebGLRenderer, scene: Scene ): void;

	clear( renderer: WebGLRenderer, color: boolean, depth: boolean, stencil: boolean ): void;

}
