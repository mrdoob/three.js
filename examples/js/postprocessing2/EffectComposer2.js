/**
 * @author alteredq / http://alteredqualia.com/
 * @author Oletus http://oletus.fi/
 */

THREE.EffectComposer2 = function ( renderer, colorRenderTarget ) {

	this.renderer = renderer;

	if ( colorRenderTarget === undefined ) {

		var parameters = {
			minFilter: THREE.LinearFilter,
			magFilter: THREE.LinearFilter,
			format: THREE.RGBAFormat,
			stencilBuffer: false
		};

		var size = renderer.getDrawingBufferSize();
		colorRenderTarget = new THREE.WebGLRenderTarget( size.width, size.height, parameters );
		colorRenderTarget.texture.name = 'EffectComposer2.rt1';

	}

	this.colorRenderTarget1 = colorRenderTarget;
	this.colorRenderTarget2 = colorRenderTarget.clone();
	this.colorRenderTarget2.texture.name = 'EffectComposer2.rt2';

	this.colorWriteBuffer = this.colorRenderTarget1;
	this.colorReadBuffer = this.colorRenderTarget2;

	this.passes = [];

	// dependencies

	if ( THREE.CopyShader === undefined ) {

		console.error( 'THREE.EffectComposer2 relies on THREE.CopyShader' );

	}

	if ( THREE.ShaderPass2 === undefined ) {

		console.error( 'THREE.EffectComposer2 relies on THREE.ShaderPass2' );

	}

	this.copyPass = new THREE.ShaderPass2( THREE.CopyShader );

	this._previousFrameTime = Date.now();

};

Object.assign( THREE.EffectComposer2.prototype, {

	swapBuffers: function () {

		var tmp = this.colorReadBuffer;
		this.colorReadBuffer = this.colorWriteBuffer;
		this.colorWriteBuffer = tmp;

	},

	addPass: function ( pass ) {

		this.passes.push( pass );

		var size = this.renderer.getDrawingBufferSize();
		pass.setSize( size.width, size.height );

	},

	insertPass: function ( pass, index ) {

		this.passes.splice( index, 0, pass );

	},

	isLastEnabledPass: function ( passIndex ) {

		for ( i = passIndex + 1; i < this.passes.length; ++i ) {

			if ( this.passes[i].enabled ) {

				return false;

			}

		}

		return true;

	},

	getColorOutputBuffer: function ( bufferConfig, writeToFinalColorTarget, finalColorRenderTarget ) {

		// finalColorRenderTarget null or undefined means rendering to the default framebuffer.
		// If the buffer must be a texture then we can't render directly to that but will do an extra copy
		// step afterwards.
		var canUseFinalColorTarget = finalColorRenderTarget || !bufferConfig.mustBeTexture;
		if ( writeToFinalColorTarget && canUseFinalColorTarget ) {

			return finalColorRenderTarget;

		} else if ( bufferConfig.isInput ) {

			// The output buffer is also used as a color input in the pass.
			return this.colorReadBuffer;

		} else {

			return this.colorWriteBuffer;

		}

	},

	gatherBuffersForPass: function ( pass, writeToFinalColorTarget, finalColorRenderTarget, buffers ) {

		var writesToColorWriteBuffer = false;

		for ( i = 0; i < pass.bufferConfigs.length; ++i ) {

			var bufferConfig = pass.bufferConfigs[i];
			if ( bufferConfig.content == THREE.EffectComposer2.BufferContent.Color ) {

				if ( bufferConfig.isOutput ) {

					var buffer = this.getColorOutputBuffer( bufferConfig, writeToFinalColorTarget, finalColorRenderTarget );
					if ( buffer == finalColorRenderTarget && bufferConfig.isInput && !bufferConfig.clear )
					{
						// The output buffer is also used as a color input in the pass.
						// Copy the color buffer from the previous pass to the final target before executing the pass.
						this.copyPass.render( this.renderer, [ buffer, this.colorReadBuffer ], 0 );
					}
					if ( buffer == this.colorWriteBuffer ) {
						writesToColorWriteBuffer = true;
					}
					buffers.push( buffer );

				} else {

					buffers.push( this.colorReadBuffer );

				}

			}
			// TODO: Support passing other buffers than color buffers between passes.

		}

		return writesToColorWriteBuffer;

	},

	passWroteToBuffer: function( pass, writeToFinalColorTarget, finalColorRenderTarget ) {

		for ( i = 0; i < pass.bufferConfigs.length; ++i ) {

			var bufferConfig = pass.bufferConfigs[i];
			if ( bufferConfig.content == THREE.EffectComposer2.BufferContent.Color ) {

				if ( bufferConfig.isOutput ) {
					return this.getColorOutputBuffer( bufferConfig, writeToFinalColorTarget, finalColorRenderTarget );
				}

			}

		}
		return null;

	},

	render: function ( finalColorRenderTarget, deltaTime ) {
		
		if ( finalColorRenderTarget == undefined ) {

			// Write to the default framebuffer.
			finalColorRenderTarget = null;

		}

		// deltaTime value is in seconds

		if ( deltaTime === undefined ) {

			deltaTime = ( Date.now() - this._previousFrameTime ) * 0.001;

		}
		this._previousFrameTime = Date.now();

		var pass, i, il = this.passes.length;

		for ( i = 0; i < il; i ++ ) {

			pass = this.passes[ i ];

			if ( pass.enabled === false ) continue;

			var writeToFinalColorTarget = this.isLastEnabledPass( i );

			var buffers = [];
			var writesToColorWriteBuffer = this.gatherBuffersForPass( pass, writeToFinalColorTarget, finalColorRenderTarget, buffers );

			pass.render( this.renderer, buffers, deltaTime );

			// Check if we need to copy the final output from a texture to the default framebuffer.
			if ( writeToFinalColorTarget && !finalColorRenderTarget ) {

				var wroteToBuffer = this.passWroteToBuffer( pass, writeToFinalColorTarget, finalColorRenderTarget );
				if ( wroteToBuffer ) {
					// In case the pass is only able to use a texture as its write buffer, copy the result to screen here.
					this.copyPass.render( this.renderer, [ null, wroteToBuffer ], 0 );
				}

			} else if ( writesToColorWriteBuffer ) {

				this.swapBuffers();

			}

		}

	},

	reset: function ( colorRenderTarget ) {

		if ( colorRenderTarget === undefined ) {

			var size = this.renderer.getDrawingBufferSize();

			colorRenderTarget = this.colorRenderTarget1.clone();
			colorRenderTarget.setSize( size.width, size.height );

		}

		this.colorRenderTarget1.dispose();
		this.colorRenderTarget2.dispose();
		this.colorRenderTarget1 = colorRenderTarget;
		this.colorRenderTarget2 = colorRenderTarget.clone();

		this.colorWriteBuffer = this.colorRenderTarget1;
		this.colorReadBuffer = this.colorRenderTarget2;

	},

	setSize: function ( width, height ) {

		this.colorRenderTarget1.setSize( width, height );
		this.colorRenderTarget2.setSize( width, height );

		for ( var i = 0; i < this.passes.length; i ++ ) {

			this.passes[ i ].setSize( width, height );

		}

	}

} );

THREE.EffectComposer2.BufferContent = {

	Color: 0,
	Depth: 1,
	Normal: 2

};

THREE.IntermediateBufferConfig = function() {

	// This is the content of the buffer. Note that even if the buffer's content is Depth, it may still be packed into a
	// color format.
	this.content = THREE.EffectComposer2.BufferContent.Color;

	// Set to true if the pass intends to either blend new things on top of this buffer or reads it as a texture.
	this.isInput = false;

	// Set to true if this buffer is written to by the pass.
	this.isOutput = true;

	// Set to true if this buffer needs to be stored in a texture. Should only be set if isInput is also true.
	this.mustBeTexture = false;

	// Set to true if the pass clears this buffer before reading from or writing to it. Should only be set if isOutput
	// is also true. If this is set then isInput is essentially ignored and the contents of the buffer are undefined
	// when it is given to the pass.
	this.clear = false;

};

THREE.Pass2 = function () {

	// If set to true, the pass is processed by the composer.
	this.enabled = true;

	// Configuration of input and output buffers used by this pass.
	this.bufferConfigs = [ new THREE.IntermediateBufferConfig() ];

};

Object.assign( THREE.Pass2.prototype, {

	setSize: function ( width, height ) {},

	render: function ( renderer, buffers, deltaTime, maskActive ) {

		console.error( 'THREE.Pass2: .render() must be implemented in derived pass.' );

	},
	
} );

// Helper for passes that need a scene that simply has the whole viewport filled with a single quad.
THREE.Pass2.createFillQuadScene = function( material ) {

	var fillQuad = {};

	fillQuad.camera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
	fillQuad.scene = new THREE.Scene();

	fillQuad.quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), material );
	fillQuad.quad.frustumCulled = false; // Avoid getting clipped
	fillQuad.scene.add( fillQuad.quad );

	return fillQuad;

};

// Helper for passes that need a specific clear setting, autoClear temporarily disabled.
THREE.Pass2.renderWithClear = function( renderer, scene, camera, writeBuffer, clear ) {

	var oldAutoClear = renderer.autoClear;
	renderer.autoClear = false;

	renderer.render( scene, camera, writeBuffer, clear );

	renderer.autoClear = oldAutoClear;

};
