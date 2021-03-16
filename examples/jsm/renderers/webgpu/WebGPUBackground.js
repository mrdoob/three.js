import { GPULoadOp } from './constants.js';
import { Color } from '../../../../build/three.module.js';

let _clearAlpha;
const _clearColor = new Color();

class WebGPUBackground {

	constructor( renderer ) {

		this.renderer = renderer;

		this.forceClear = false;

	}

	clear() {

		this.forceClear = true;

	}

	update( scene ) {

		const renderer = this.renderer;
		const background = ( scene.isScene === true ) ? scene.background : null;
		let forceClear = this.forceClear;

		if ( background === null ) {

			// no background settings, use clear color configuration from the renderer

			_clearColor.copy( renderer._clearColor );
			_clearAlpha = renderer._clearAlpha;

		} else if ( background.isColor === true ) {

			// background is an opaque color

			_clearColor.copy( background );
			_clearAlpha = 1;
			forceClear = true;

		} else {

			console.error( 'THREE.WebGPURenderer: Unsupported background configuration.', background );

		}

		// configure render pass descriptor

		const renderPassDescriptor = renderer._renderPassDescriptor;
		const colorAttachment = renderPassDescriptor.colorAttachments[ 0 ];
		const depthStencilAttachment = renderPassDescriptor.depthStencilAttachment;

		if ( renderer.autoClear === true || forceClear === true ) {

			if ( renderer.autoClearColor === true ) {

				colorAttachment.loadValue = { r: _clearColor.r, g: _clearColor.g, b: _clearColor.b, a: _clearAlpha };

			} else {

				colorAttachment.loadValue = GPULoadOp.Load;

			}

			if ( renderer.autoClearDepth === true ) {

				depthStencilAttachment.depthLoadValue = renderer._clearDepth;

			} else {

				depthStencilAttachment.depthLoadValue = GPULoadOp.Load;

			}

			if ( renderer.autoClearStencil === true ) {

				depthStencilAttachment.stencilLoadValue = renderer._clearDepth;

			} else {

				depthStencilAttachment.stencilLoadValue = GPULoadOp.Load;

			}

		} else {

			colorAttachment.loadValue = GPULoadOp.Load;
			depthStencilAttachment.depthLoadValue = GPULoadOp.Load;
			depthStencilAttachment.stencilLoadValue = GPULoadOp.Load;

		}

		this.forceClear = false;

	}

}

export default WebGPUBackground;
