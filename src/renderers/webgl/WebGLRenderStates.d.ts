import { Scene } from '../../scenes/Scene';
import { Camera } from '../../cameras/Camera';
import { Light } from '../../lights/Light';
import { WebGLLights } from './WebGLLights';
import { WebGLExtensions } from './WebGLExtensions';
import { WebGLCapabilities } from './WebGLCapabilities';

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

	constructor( extensions: WebGLExtensions, capabilities: WebGLCapabilities );

	// renderCallDepth indexes start from 0.
	get( scene: Scene, renderCallDepth?: number ): WebGLRenderState;

	dispose(): void;

}
