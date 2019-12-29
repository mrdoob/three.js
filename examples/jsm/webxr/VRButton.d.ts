import {
	WebGLRenderer
} from '../../../src/Three';

export interface WebXROptions {
	referenceSpaceType: string;
}

export namespace VRButton {
	export function createButton( renderer: WebGLRenderer, options?: WebXROptions ): HTMLElement;
}
