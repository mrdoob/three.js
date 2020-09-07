import { Scene } from '../../../../src/Three';
import WebGPURenderer from './WebGPURenderer.js';

class WebGPUBackground {

	constructor( renderer: WebGPURenderer );

	clear(): void;

	update( scene: Scene ): void;

}

export default WebGPUBackground;
