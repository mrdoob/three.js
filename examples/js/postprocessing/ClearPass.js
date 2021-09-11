( function () {

	class ClearPass extends THREE.Pass {

		constructor( clearColor, clearAlpha ) {

			super();
			this.needsSwap = false;
			this.clearColor = clearColor !== undefined ? clearColor : 0x000000;
			this.clearAlpha = clearAlpha !== undefined ? clearAlpha : 0;
			this._oldClearColor = new THREE.Color();

		}

		render( renderer, writeBuffer, readBuffer
			/*, deltaTime, maskActive */
		) {

			let oldClearAlpha;

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

	}

	THREE.ClearPass = ClearPass;

} )();
