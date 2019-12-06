import { Camera } from './../../cameras/Camera';
import { Object3D } from './../../core/Object3D';
import { WebGLRenderer } from '../WebGLRenderer';
import { WebGLUniforms } from './WebGLUniforms';

export class WebGLMultiview {

	constructor( renderer: WebGLRenderer, gl: WebGLRenderingContext );

	isAvailable(): boolean;
	attachCamera( camera: Camera ): void;
	detachCamera( camera: Camera ): void;
	updateCameraProjectionMatricesUniform( camera: Camera, uniforms: WebGLUniforms ): void;
	updateCameraViewMatricesUniform( camera: Camera, uniforms: WebGLUniforms ): void;
	updateObjectMatricesUniforms( object: Object3D, camera: Camera, uniforms: WebGLUniforms ): void;

}
