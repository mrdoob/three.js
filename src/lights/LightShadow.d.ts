import { Camera } from './../cameras/Camera';
import { Light } from './../lights/Light';
import { Vector2 } from './../math/Vector2';
import { Vector4 } from './../math/Vector4';
import { Matrix4 } from './../math/Matrix4';
import { RenderTarget } from '../renderers/webgl/WebGLRenderLists';

export class LightShadow {

	constructor( camera: Camera );

	camera: Camera;

	/**
	 * @default 0
	 */
	bias: number;

	/**
	 * @default 0
	 */
	normalBias: number;

	/**
	 * @default 1
	 */
	radius: number;

	/**
	 * @default new THREE.Vector2( 512, 512 )
	 */
	mapSize: Vector2;

	/**
	 * @default null
	 */
	map: RenderTarget;

	/**
	 * @default null
	 */
	mapPass: RenderTarget;

	/**
	 * @default new THREE.Matrix4()
	 */
	matrix: Matrix4;

	/**
	 * @default true
	 */
	autoUpdate: boolean;

	/**
	 * @default false
	 */
	needsUpdate: boolean;

	copy( source: LightShadow ): this;
	clone( recursive?: boolean ): this;
	toJSON(): any;
	getFrustum(): number;
	updateMatrices( light: Light, viewportIndex?: number ): void;
	getViewport( viewportIndex: number ): Vector4;
	getFrameExtents(): Vector2;

}
