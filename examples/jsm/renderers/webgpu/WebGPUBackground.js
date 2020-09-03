import { GPULoadOp } from './constants.js';
import { Color } from '../../../../build/three.module.js';

class WebGPUBackground {

	constructor( renderer ) {

		this.renderer = renderer;

		this.clearAlpha = 1;
		this.clearColor = new Color( 0x000000 );

	}

	render( scene ) {

		const renderer = this.renderer;
		const background = ( scene.isScene === true ) ? scene.background : null;
		const clearColor = this.clearColor;
		let clearAlpha = this.clearAlpha;

		let forceClear = false;

		if ( background === null ) {

			// no background settings, use clear color configuration from the renderer

			this.clearColor.copy( renderer._clearColor );
			this.clearAlpha = renderer._clearAlpha;

		} else if ( background !== null && background.isColor === true ) {

			// background is an opaque color

			clearColor.copy( background );
			clearAlpha = 1;
			forceClear = true;

		}

		// configure render pass descriptor

		const renderPassDescriptor = renderer._renderPassDescriptor;
		const colorAttachment = renderPassDescriptor.colorAttachments[ 0 ];

		if ( renderer.autoClear === true || forceClear === true ) {

			colorAttachment.loadValue = { r: clearColor.r, g: clearColor.g, b: clearColor.b, a: clearAlpha };

		} else {

			colorAttachment.loadValue = GPULoadOp.Load;

		}

	}

}

export default WebGPUBackground;
