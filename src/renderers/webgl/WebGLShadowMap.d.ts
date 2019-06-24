import { Scene } from './../../scenes/Scene';
import { WebGLRenderer } from '../WebGLRenderer';
import { ShadowMapType } from '../../constants';
import { Light } from '../../lights/Light';

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

	render( lights: Light[], scene: Scene ): void;

	/**
	 * @deprecated Use {@link WebGLShadowMap#renderReverseSided .shadowMap.renderReverseSided} instead.
	 */
	cullFace: any;

}
