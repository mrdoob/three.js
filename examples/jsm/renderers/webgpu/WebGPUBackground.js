import { GPULoadOp } from './constants.js';
import { Color } from '../../../../build/three.module.js';

class WebGPUBackground {

	constructor() {

		this.clearAlpha = 0;
		this.clearColor = new Color( 0x000000 );

	}

	render( scene, renderPassDescriptor, autoClear ) {

		const background = ( scene.isScene === true ) ? scene.background : null;
		const clearColor = this.clearColor;
		let clearAlpha = this.clearAlpha;

		let forceClear = false;

		if ( background !== null && background.isColor === true ) {

			clearColor.copy( background );
			clearAlpha = 1;
			forceClear = true;

		}

		const colorAttachment = renderPassDescriptor.colorAttachments[ 0 ];

		if ( autoClear === true || forceClear === true ) {

			colorAttachment.loadValue = { r: clearColor.r, g: clearColor.g, b: clearColor.b, a: clearAlpha };

		} else {

			colorAttachment.loadValue = GPULoadOp.Load;

		}

	}

}

export default WebGPUBackground;
