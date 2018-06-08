/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.EffectComposer = function ( renderer, renderTarget ) {

	this.renderer = renderer;

	window.addEventListener( 'vrdisplaypresentchange' , this.resize.bind(this) );

	if ( renderTarget === undefined ) {

		var parameters = {
			minFilter: THREE.LinearFilter,
			magFilter: THREE.LinearFilter,
			format: THREE.RGBAFormat,
			stencilBuffer: false
		};

		var size = renderer.getDrawingBufferSize();
		renderTarget = new THREE.WebGLRenderTarget( size.width, size.height, parameters );
		renderTarget.texture.name = 'EffectComposer.rt1';

	}

	this.renderTarget1 = renderTarget;
	this.renderTarget2 = renderTarget.clone();
	this.renderTarget2.texture.name = 'EffectComposer.rt2';

	this.writeBuffer = this.renderTarget1;
	this.readBuffer = this.renderTarget2;

	this.passes = [];
	this.maskActive = false;

	// dependencies

	if ( THREE.CopyShader === undefined ) {

		console.error( 'THREE.EffectComposer relies on THREE.CopyShader' );

	}

	if ( THREE.ShaderPass === undefined ) {

		console.error( 'THREE.EffectComposer relies on THREE.ShaderPass' );

	}

	this.copyPass = new THREE.ShaderPass( THREE.CopyShader );

};

Object.assign( THREE.EffectComposer.prototype, {

	swapBuffers: function (pass) {

		if ( pass.needsSwap ) {

			if ( this.maskActive ) {

				var context = this.renderer.context;

				context.stencilFunc( context.NOTEQUAL, 1, 0xffffffff );

				this.copyPass.render( this.renderer, this.writeBuffer, this.readBuffer, delta );

				context.stencilFunc( context.EQUAL, 1, 0xffffffff );

			}

			var tmp = this.readBuffer;
			this.readBuffer = this.writeBuffer;
			this.writeBuffer = tmp;

		}

		if ( THREE.MaskPass !== undefined ) {

			if ( pass instanceof THREE.MaskPass ) {

				this.maskActive = true;

			} else if ( pass instanceof THREE.ClearMaskPass ) {

				this.maskActive = false;

			}

		}

	},

	addPass: function ( pass ) {

		this.passes.push( pass );

		var size = this.renderer.getDrawingBufferSize();
		pass.setSize( size.width, size.height );

	},

	insertPass: function ( pass, index ) {

		this.passes.splice( index, 0, pass );

	},

	render: function ( delta, starti ) {

		var maskActive = this.maskActive;

		var pass, i, il = this.passes.length;

		var scope = this;

		var currentOnAfterRender;

		for ( i = starti || 0; i < il; i ++ ) {

			pass = this.passes[ i ];

			if ( pass.enabled === false ) continue;

			// If VR mode is enabled and rendering the whole scene is required.
			// The pass renders the scene and and postprocessing is resumed before
			// submitting the frame to the headset by using the onAfterRender callback.
			if ( this.renderer.vr.enabled && pass.scene ) {

				currentOnAfterRender = pass.scene.onAfterRender;

				pass.scene.onAfterRender = function () {

					// Disable stereo rendering when doing postprocessing
					// on a render target.
					scope.renderer.vr.enabled = false;

					scope.render( delta, i + 1, maskActive );

					// Renable vr mode.
					scope.renderer.vr.enabled = true;
				}

				pass.render( this.renderer, this.writeBuffer, this.readBuffer, delta, maskActive );
				
				// Restore onAfterRender
				pass.scene.onAfterRender = currentOnAfterRender;

				this.swapBuffers( pass );

				return;
			}

			pass.render( this.renderer, this.writeBuffer, this.readBuffer, delta, maskActive );

			this.swapBuffers(pass);

		}

	},

	reset: function ( renderTarget ) {

		if ( renderTarget === undefined ) {

			var size = this.renderer.getDrawingBufferSize();

			renderTarget = this.renderTarget1.clone();
			renderTarget.setSize( size.width, size.height );

		}

		this.renderTarget1.dispose();
		this.renderTarget2.dispose();
		this.renderTarget1 = renderTarget;
		this.renderTarget2 = renderTarget.clone();

		this.writeBuffer = this.renderTarget1;
		this.readBuffer = this.renderTarget2;

	},

	setSize: function ( width, height ) {

		this.renderTarget1.setSize( width, height );
		this.renderTarget2.setSize( width, height );

		for ( var i = 0; i < this.passes.length; i ++ ) {

			this.passes[ i ].setSize( width, height );

		}

	},

	resize: function ( ) {

		var rendererSize = renderer.getDrawingBufferSize();
		this.setSize( rendererSize.width, rendererSize.height );

	}

} );


THREE.Pass = function () {

	// if set to true, the pass is processed by the composer
	this.enabled = true;

	// if set to true, the pass indicates to swap read and write buffer after rendering
	this.needsSwap = true;

	// if set to true, the pass clears its buffer before rendering
	this.clear = false;

	// if set to true, the result of the pass is rendered to screen
	this.renderToScreen = false;

};

Object.assign( THREE.Pass.prototype, {

	setSize: function ( width, height ) {},

	render: function ( renderer, writeBuffer, readBuffer, delta, maskActive ) {

		console.error( 'THREE.Pass: .render() must be implemented in derived pass.' );

	}

} );
