/**
 * @author mrdoob / http://mrdoob.com/
 */
import * as THREE from '../../../build/three.module.js';
import { Pass } from '../../modules/postprocessing/Pass.js';
var __ClearPass;

__ClearPass = function ( clearColor, clearAlpha ) {

	Pass.call( this );

	this.needsSwap = false;

	this.clearColor = ( clearColor !== undefined ) ? clearColor : 0x000000;
	this.clearAlpha = ( clearAlpha !== undefined ) ? clearAlpha : 0;

};

__ClearPass.prototype = Object.assign( Object.create( Pass.prototype ), {

	constructor: __ClearPass,

	render: function ( renderer, writeBuffer, readBuffer, delta, maskActive ) {

		var oldClearColor, oldClearAlpha;

		if ( this.clearColor ) {

			oldClearColor = renderer.getClearColor().getHex();
			oldClearAlpha = renderer.getClearAlpha();

			renderer.setClearColor( this.clearColor, this.clearAlpha );

		}

		renderer.setRenderTarget( this.renderToScreen ? null : readBuffer );
		renderer.clear();

		if ( this.clearColor ) {

			renderer.setClearColor( oldClearColor, oldClearAlpha );

		}

	}

} );

export { __ClearPass as ClearPass };
