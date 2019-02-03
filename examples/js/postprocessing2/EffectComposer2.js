/**
 * @author alteredq / http://alteredqualia.com/
 * @author Oletus http://oletus.fi/
 */

THREE.EffectComposer2 = function ( renderer, params ) {

	this.renderer = renderer;

	this.size = renderer.getDrawingBufferSize();

	params = params !== undefined ? params : {};

	var defaultParams = {
		alpha: true,
		colorRenderTargetType: THREE.UnsignedByteType
	}
	this.params = {};

	for ( var key in defaultParams ) {

		if ( defaultParams.hasOwnProperty(key) ) {

			if ( params.hasOwnProperty(key) ) {
				this.params[key] = params[key];
			} else {
				this.params[key] = defaultParams[key];
			}

		}

	}

	this.needStencilBuffer = false;
	this.recreateIntermediateTargets = false;
	
	this.intermediateRenderTargets = [];

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

	this.maskActive = false;
	this.renderer.autoClearStencil = false;  // Only mask passes should clear the stencil.

};

Object.assign( THREE.EffectComposer2.prototype, {

	createIntermediateRenderTarget: function () {

		var parameters = {
			minFilter: THREE.LinearFilter,
			magFilter: THREE.LinearFilter,
			format: this.params.alpha ? THREE.RGBAFormat : THREE.RGBFormat,
			type: this.params.colorRenderTargetType,
			stencilBuffer: this.needStencilBuffer
		};

		var intermediateRenderTarget = new THREE.WebGLRenderTarget( this.size.width, this.size.height, parameters );
		intermediateRenderTarget.texture.name = 'EffectComposer2.rt' + this.intermediateRenderTargets.length;
		this.intermediateRenderTargets.push( intermediateRenderTarget );

	},

	updateNeedStencilBuffer: function ( pass ) {

		if ( THREE.MaskPass2 !== undefined ) {
			if ( pass instanceof THREE.MaskPass2 && !this.needStencilBuffer ) {
				this.needStencilBuffer = true;
				this.recreateIntermediateTargets = true;
			}
		}
	},

	disposeIntermediateRenderTargetsIfNeeded: function () {

		if ( this.recreateIntermediateTargets ) {
			this.recreateIntermediateTargets = false;
			for ( var i = 0; i < this.intermediateRenderTargets.length; ++i ) {
				this.intermediateRenderTargets[i].dispose();
			}
			this.intermediateRenderTargets = [];
		}

	},

	colorReadTarget: function () {

		if ( this.intermediateRenderTargets.length < 1 )
		{
			this.createIntermediateRenderTarget();
		}
		return this.intermediateRenderTargets[ this.readTargetIndex ];

	},

	colorWriteTarget: function () {

		while ( this.intermediateRenderTargets.length < 2 )
		{
			this.createIntermediateRenderTarget();
		}
		return this.intermediateRenderTargets[ this.writeTargetIndex ];

	},

	swapBuffers: function () {

		this.readTargetIndex = 1 - this.readTargetIndex;
		this.writeTargetIndex = 1 - this.writeTargetIndex;

	},

	addPass: function ( pass ) {

		this.passes.push( pass );

		pass.setSize( this.size.width, this.size.height );

		this.updateNeedStencilBuffer( pass );

	},

	insertPass: function ( pass, index ) {

		this.passes.splice( index, 0, pass );

		this.updateNeedStencilBuffer( pass );

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
			return this.colorReadTarget();

		} else {

			return this.colorWriteTarget();

		}

	},

	gatherBuffersForPass: function ( pass, writeToFinalColorTarget, finalColorRenderTarget, buffers ) {

		var writesToColorWriteBuffer = false;

		for ( i = 0; i < pass.bufferConfigs.length; ++i ) {

			var bufferConfig = pass.bufferConfigs[i];
			if ( bufferConfig.content == THREE.EffectComposer2.BufferContent.Color ) {

				if ( bufferConfig.isOutput ) {

					var buffer = this.getColorOutputBuffer( bufferConfig, writeToFinalColorTarget, finalColorRenderTarget );
					var passClearsWholeBuffer = bufferConfig.clear && !this.maskActive;
					if ( buffer == finalColorRenderTarget && bufferConfig.isInput && !passClearsWholeBuffer )
					{
						// The output buffer is also used as a color input in the pass and the pass does not clear it.
						// Copy the color buffer from the previous pass to the final target before executing the pass.
						this.copyPass.render( this.renderer, [ buffer, this.colorReadTarget() ], 0, this.maskActive );
					}
					if ( this.intermediateRenderTargets.length > 1 && buffer == this.colorWriteTarget() ) {
						writesToColorWriteBuffer = true;
					}
					buffers.push( buffer );

				} else {

					buffers.push( this.colorReadTarget() );

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

	handleMaskPass: function( pass ) {

		if ( THREE.MaskPass2 !== undefined ) {

			if ( pass instanceof THREE.MaskPass2 ) {

				this.maskActive = true;

				pass.render( this.renderer, this.intermediateRenderTargets );
				return true;

			} else if ( pass instanceof THREE.ClearMaskPass2 ) {

				this.maskActive = false;
				pass.render( this.renderer );
				return true;

			}

		}

		return false;

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

		this.disposeIntermediateRenderTargetsIfNeeded();

		var pass, i, il = this.passes.length;

		this.maskActive = false;

		this.readTargetIndex = 0;
		this.writeTargetIndex = 1;

		for ( i = 0; i < il; i ++ ) {

			pass = this.passes[ i ];

			if ( pass.enabled === false ) continue;

			var writeToFinalColorTarget = this.isLastEnabledPass( i );

			if ( this.handleMaskPass( pass ) ) continue;

			var buffers = [];
			var writesToColorWriteBuffer = this.gatherBuffersForPass( pass, writeToFinalColorTarget, finalColorRenderTarget, buffers );

			pass.render( this.renderer, buffers, deltaTime, this.maskActive );

			// Check if we need to copy the final output from a texture to the default framebuffer.
			if ( writeToFinalColorTarget && !finalColorRenderTarget ) {

				var wroteToBuffer = this.passWroteToBuffer( pass, writeToFinalColorTarget, finalColorRenderTarget );
				if ( wroteToBuffer ) {
					// In case the pass is only able to use a texture as its write buffer, copy the result to screen here.
					this.copyPass.render( this.renderer, [ null, wroteToBuffer ], 0, this.maskActive );
				}

			} else if ( writesToColorWriteBuffer ) {

				this.swapBuffers();

			}

		}

	},

	setSize: function ( width, height ) {

		this.size.width = width;
		this.size.height = height;

		for ( var i = 0; i < this.intermediateRenderTargets.length; ++i )
		{
			this.intermediateRenderTargets[i].setSize( width, height );
		}

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
	// is also true. If this is set and a mask is not active then isInput is essentially ignored and the contents of the
	// buffer are undefined when it is given to the pass.
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

	// TODO: Maybe this function should specifically clear only color and depth and make sure that clearing stencil is
	// disabled?
	renderer.render( scene, camera, writeBuffer, clear );

	renderer.autoClear = oldAutoClear;

};
