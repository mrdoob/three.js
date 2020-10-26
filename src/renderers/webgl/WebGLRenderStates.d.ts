import { Scene } from '../../scenes/Scene';
import { Camera } from '../../cameras/Camera';
import { Light } from '../../lights/Light';
import { WebGLLights } from './WebGLLights';

interface WebGLRenderState {

	init(): void;

	state: {
		lightsArray: Light[];
		shadowsArray: Light[];
		lights: WebGLLights;
	};
	setupLights(): void;
	setupLightsView( camera: Camera ): void;
	pushLight( light: Light ): void;
	pushShadow( shadowLight: Light ): void;

}

export class WebGLRenderStates {

	// renderCallDepth indexes start from 0.
	get( scene: Scene, renderCallDepth?: number ): WebGLRenderState;
	dispose(): void;

}
