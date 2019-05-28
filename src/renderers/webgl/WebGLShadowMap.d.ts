import { Scene } from './../../scenes/Scene';
import { Camera } from './../../cameras/Camera';
import { WebGLRenderer } from '../WebGLRenderer';
import { ShadowMapType } from '../../constants';

export class WebGLShadowMap {

	constructor(
		_renderer: WebGLRenderer,
		_lights: any[],
		_objects: any[],
		capabilities: any
	);

	enabled: boolean;
	autoUpdate: boolean;
	needsUpdate: boolean;
	type: ShadowMapType;

	render( scene: Scene, camera: Camera ): void;

	/**
   * @deprecated Use {@link WebGLShadowMap#renderReverseSided .shadowMap.renderReverseSided} instead.
   */
	cullFace: any;

}
