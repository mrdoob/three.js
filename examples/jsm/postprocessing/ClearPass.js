import {
	Color
} from '../../../build/three.module.js';
import { Pass } from '../postprocessing/Pass.js';

var ClearPass = function ( clearColor, clearAlpha ) {

	Pass.call( this );

	this.needsSwap = false;

	this.clearColor = ( clearColor !== undefined ) ? clearColor : 0x000000;
	this.clearAlpha = ( clearAlpha !== undefined ) ? clearAlpha : 0;
	this._oldClearColor = new Color();

};

ClearPass.prototype = Object.assign( Object.create( Pass.prototype ), {

	constructor: ClearPass,

	render: function ( renderer, writeBuffer, readBuffer /*, deltaTime, maskActive */ ) {

		var oldClearAlpha;

		if ( this.clearColor ) {

			renderer.getClearColor( this._oldClearColor );
			oldClearAlpha = renderer.getClearAlpha();

			renderer.setClearColor( this.clearColor, this.clearAlpha );

		}

		renderer.setRenderTarget( this.renderToScreen ? null : readBuffer );
		renderer.clear();

		if ( this.clearColor ) {

			renderer.setClearColor( this._oldClearColor, oldClearAlpha );

		}

	}

} );

export { ClearPass };
