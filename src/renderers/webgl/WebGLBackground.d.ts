
import { Color } from '../../math/Color';
import { WebGLRenderer } from '../WebGLRenderer';
import { WebGLState } from './WebGLState';
import { WebGLObjects } from './WebGLObjects';
import { WebGLRenderList } from './WebGLRenderLists';
import { Scene } from '../../scenes/Scene';
import { Camera } from '../../cameras/Camera';
import { WebGLCubeMaps } from './WebGLCubeMaps';
import { WebGLCubeUVMaps } from './WebGLCubeUVMaps';

export class WebGLBackground {

	constructor( renderer: WebGLRenderer, cubemaps: WebGLCubeMaps, cubeuvmaps: WebGLCubeUVMaps, state: WebGLState, objects: WebGLObjects, premultipliedAlpha: boolean );

	setBlurriness( blurriness: number ): void;
	getClearColor(): Color;
	setClearColor( color: Color, alpha: number ): void;
	getClearAlpha(): number;
	setClearAlpha( alpha: number ): void;
	render( renderList: WebGLRenderList, scene: Scene, camera: Camera, forceClear: boolean ): void;

}
