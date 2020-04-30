
import { Color } from '../../math/Color';
import { WebGLRenderer } from '../WebGLRenderer';
import { WebGLState } from './WebGLState';
import { WebGLObjects } from './WebGLObjects';
import { WebGLRenderList } from './WebGLRenderLists';
import { Scene } from '../../scenes/Scene';

export class WebGLBackground {

	constructor( renderer: WebGLRenderer, state: WebGLState, objects: WebGLObjects, premultipliedAlpha: any );

	getClearColor(): Color;
	setClearColor( color: Color, alpha: number ): void;
	getClearAlpha(): number;
	setClearAlpha( alpha: number ): void;
	render( renderList: WebGLRenderList, scene: Scene, camera: any, forceClear: any ): void;

}
