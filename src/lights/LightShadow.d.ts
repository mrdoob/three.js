import { Camera } from './../cameras/Camera';
import { Vector2 } from './../math/Vector2';
import { Matrix4 } from './../math/Matrix4';
import { RenderTarget } from '../renderers/webgl/WebGLRenderLists';

export class LightShadow {

	constructor( camera: Camera );

	camera: Camera;
	bias: number;
	radius: number;
	mapSize: Vector2;
	map: RenderTarget;
	matrix: Matrix4;

	copy( source: LightShadow ): this;
	clone( recursive?: boolean ): this;
	toJSON(): any;

}
