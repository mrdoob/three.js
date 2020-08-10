
import { Color } from '../../math/Color';
import { WebGLRenderer } from '../WebGLRenderer';
import { WebGLState } from './WebGLState';
import { WebGLObjects } from './WebGLObjects';
import { WebGLRenderList } from './WebGLRenderLists';
import { Scene } from '../../scenes/Scene';
import { Camera } from '../../cameras/Camera';
import { WebGLCubeMaps } from './WebGLCubeMaps';

export class WebGLBackground {

	constructor( renderer: WebGLRenderer, cubemaps: WebGLCubeMaps, state: WebGLState, objects: WebGLObjects, premultipliedAlpha: boolean );

	getClearColor(): Color;
	setClearColor( color: Color, alpha: number ): void;
	getClearAlpha(): number;
	setClearAlpha( alpha: number ): void;
	render( renderList: WebGLRenderList, scene: Scene, camera: Camera, forceClear: boolean ): void;

}
