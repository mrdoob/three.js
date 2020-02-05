
import { Color } from '../../math/Color';
import { WebGLRenderer } from '../WebGLRenderer';
import { WebGLState } from './WebGLState';
import { WebGLObjects } from './WebGLObjects';
import { WebGLRenderLists } from './WebGLRenderLists';
import { Scene } from '../../scenes/Scene';

export class WebGLBackground {

	constructor( renderer: WebGLRenderer, state: WebGLState, objects: WebGLObjects, premultipliedAlpha: any );

	getClearColor(): void;
	setClearColor( color: Color, alpha: any ): void;
	getClearAlpha(): void;
	setClearAlpha( alpha: any ): void;
	render( renderList: WebGLRenderLists, scene: Scene, camera: any, forceClear: any ): void;

}
