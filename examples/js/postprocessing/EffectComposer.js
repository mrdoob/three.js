/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.EffectComposer = function ( renderer, renderTarget ) {

	this.renderer = renderer;

	if ( renderTarget === undefined ) {

		var parameters = {
			minFilter: THREE.LinearFilter,
			magFilter: THREE.LinearFilter,
			format: THREE.RGBAFormat,
			stencilBuffer: false
		};

		var size = renderer.getSize( new THREE.Vector2() );
		this._pixelRatio = renderer.getPixelRatio();
		this._width = size.width;
		this._height = size.height;

		renderTarget = new THREE.WebGLRenderTarget( this._width * this._pixelRatio, this._height * this._pixelRatio, parameters );
		renderTarget.texture.name = 'EffectComposer.rt1';

	} else {

		this._pixelRatio = 1;
		this._width = renderTarget.width;
		this._height = renderTarget.height;

	}

	this.renderTarget1 = renderTarget;
	this.renderTarget2 = renderTarget.clone();
	this.renderTarget2.texture.name = 'EffectComposer.rt2';

	this.writeBuffer = this.renderTarget1;
	this.readBuffer = this.renderTarget2;

	this.renderToScreen = true;

	this.passes = [];

	// dependencies

	if ( THREE.CopyShader === undefined ) {

		console.error( 'THREE.EffectComposer relies on THREE.CopyShader' );

	}

	if ( THREE.ShaderPass === undefined ) {

		console.error( 'THREE.EffectComposer relies on THREE.ShaderPass' );

	}

	this.copyPass = new THREE.ShaderPass( THREE.CopyShader );

	this.clock = new THREE.Clock();

	// for VR

	var rendererSize = new THREE.Vector2();
	var scope = this;

	function onSessionStateChange() {

		renderer.getBufferSize( rendererSize );
		scope.setPixelRatio( renderer.getPixelRatio() );
		scope.setSize( rendererSize.x, rendererSize.y );

	}

	renderer.xr.addEventListener( 'sessionstart', onSessionStateChange );
	renderer.xr.addEventListener( 'sessionend', onSessionStateChange );

};

Object.assign( THREE.EffectComposer.prototype, {

	swapBuffers: function () {

		var tmp = this.readBuffer;
		this.readBuffer = this.writeBuffer;
		this.writeBuffer = tmp;

	},

	addPass: function ( pass ) {

		this.passes.push( pass );
		pass.setSize( this._width * this._pixelRatio, this._height * this._pixelRatio );

	},

	insertPass: function ( pass, index ) {

		this.passes.splice( index, 0, pass );

	},

	isLastEnabledPass: function ( passIndex ) {

		for ( var i = passIndex + 1; i < this.passes.length; i ++ ) {

			if ( this.passes[ i ].enabled ) {

				return false;

			}

		}

		return true;

	},

	render: function ( deltaTime ) {

		// deltaTime value is in seconds

		if ( deltaTime === undefined ) {

			deltaTime = this.clock.getDelta();

		}

		var currentRenderTarget = this.renderer.getRenderTarget();

		var maskActive = false;

		var currentVREnabled = this.renderer.xr.enabled;

		if ( this.renderer.xr.enabled === true ) {

			this.renderer.xr.enabled = false;

		}

		var pass, i, il = this.passes.length;

		var swapped = false;
		for ( i = 0; i < il; i ++ ) {

			pass = this.passes[ i ];

			if ( pass.enabled === false ) continue;

			pass.renderToScreen = ( this.renderToScreen && this.isLastEnabledPass( i ) );
			pass.render( this.renderer, this.writeBuffer, this.readBuffer, deltaTime, maskActive );

			if ( pass.needsSwap ) {

				if ( maskActive ) {

					var context = this.renderer.getContext();
					var stencil = this.renderer.state.buffers.stencil;

					stencil.setFunc( context.NOTEQUAL, 1, 0xffffffff );
					this.copyPass.render( this.renderer, this.writeBuffer, this.readBuffer, deltaTime );
					stencil.setFunc( context.EQUAL, 1, 0xffffffff );

				}

				this.swapBuffers();
				swapped = !swapped;

			}

			if ( THREE.MaskPass !== undefined ) {

				if ( pass instanceof THREE.MaskPass ) {

					maskActive = true;

				} else if ( pass instanceof THREE.ClearMaskPass ) {

					maskActive = false;

				}

			}

		}

		if (swapped) this.swapBuffers();
		this.renderer.setRenderTarget( currentRenderTarget );

		this.renderer.xr.enabled = currentVREnabled;

	},

	reset: function ( renderTarget ) {

		if ( renderTarget === undefined ) {

			var size = this.renderer.getSize( new THREE.Vector2() );
			this._pixelRatio = this.renderer.getPixelRatio();
			this._width = size.width;
			this._height = size.height;

			renderTarget = this.renderTarget1.clone();
			renderTarget.setSize( this._width * this._pixelRatio, this._height * this._pixelRatio );

		}

		this.renderTarget1.dispose();
		this.renderTarget2.dispose();
		this.renderTarget1 = renderTarget;
		this.renderTarget2 = renderTarget.clone();

		this.writeBuffer = this.renderTarget1;
		this.readBuffer = this.renderTarget2;

	},

	setSize: function ( width, height ) {

		this._width = width;
		this._height = height;

		var effectiveWidth = this._width * this._pixelRatio;
		var effectiveHeight = this._height * this._pixelRatio;

		this.renderTarget1.setSize( effectiveWidth, effectiveHeight );
		this.renderTarget2.setSize( effectiveWidth, effectiveHeight );

		for ( var i = 0; i < this.passes.length; i ++ ) {

			this.passes[ i ].setSize( effectiveWidth, effectiveHeight );

		}

	},

	setPixelRatio: function ( pixelRatio ) {

		this._pixelRatio = pixelRatio;

		this.setSize( this._width, this._height );

	}

} );


THREE.Pass = function () {

	// if set to true, the pass is processed by the composer
	this.enabled = true;

	// if set to true, the pass indicates to swap read and write buffer after rendering
	this.needsSwap = true;

	// if set to true, the pass clears its buffer before rendering
	this.clear = false;

	// if set to true, the result of the pass is rendered to screen. This is set automatically by EffectComposer.
	this.renderToScreen = false;

};

Object.assign( THREE.Pass.prototype, {

	setSize: function ( /* width, height */ ) {},

	render: function ( /* renderer, writeBuffer, readBuffer, deltaTime, maskActive */ ) {

		console.error( 'THREE.Pass: .render() must be implemented in derived pass.' );

	}

} );

// Helper for passes that need to fill the viewport with a single quad.
THREE.Pass.FullScreenQuad = ( function () {

	var camera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
	var geometry = new THREE.PlaneBufferGeometry( 2, 2 );

	var FullScreenQuad = function ( material ) {

		this._mesh = new THREE.Mesh( geometry, material );

	};

	Object.defineProperty( FullScreenQuad.prototype, 'material', {

		get: function () {

			return this._mesh.material;

		},

		set: function ( value ) {

			this._mesh.material = value;

		}

	} );

	Object.assign( FullScreenQuad.prototype, {

		dispose: function () {

			this._mesh.geometry.dispose();

		},

		render: function ( renderer ) {

			renderer.render( this._mesh, camera );

		}

	} );

	return FullScreenQuad;

} )();
