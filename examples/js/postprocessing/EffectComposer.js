/**
 * @author alteredq / http://alteredqualia.com/
 * @author takahirox / https://github.com/takahirox
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

	// dependencies

	if ( THREE.CopyShader === undefined ) {

		console.error( 'THREE.EffectComposer relies on THREE.CopyShader' );

	}

	if ( THREE.ShaderPass === undefined ) {

		console.error( 'THREE.EffectComposer relies on THREE.ShaderPass' );

	}

	this.copyPass = new THREE.ShaderPass( THREE.CopyShader );

	// for VR

	// material for separating

	var shader = THREE.CopyShader;
	this.materialSeparate = new THREE.ShaderMaterial( {
		defines: shader.defines || {},
		uniforms: THREE.UniformsUtils.clone( shader.uniforms ),
		vertexShader: shader.vertexShader,
		fragmentShader: shader.fragmentShader
	} );

	// material for combining

	shader = THREE.VRCombineShader;
	this.materialCombine = new THREE.ShaderMaterial( {
		defines: shader.defines || {},
		uniforms: THREE.UniformsUtils.clone( shader.uniforms ),
		vertexShader: shader.vertexShader,
		fragmentShader: shader.fragmentShader
	} );

	this.renderTargets1 = [];
	this.renderTargets1[ 0 ] = renderTarget.clone();
	this.renderTargets1[ 0 ].texture.name = 'EffectComposer.rt1Left';
	this.renderTargets1[ 1 ] = renderTarget.clone();
	this.renderTargets1[ 1 ].texture.name = 'EffectComposer.rt1Right';

	this.renderTargets2 = [];
	this.renderTargets2[ 0 ] = renderTarget.clone();
	this.renderTargets2[ 0 ].texture.name = 'EffectComposer.rt2Left';
	this.renderTargets2[ 1 ] = renderTarget.clone();
	this.renderTargets2[ 1 ].texture.name = 'EffectComposer.rt2Right';

	this.writeBuffers = [];
	this.writeBuffers[ 0 ] = this.renderTargets1[ 0 ];
	this.writeBuffers[ 1 ] = this.renderTargets1[ 1 ];

	this.readBuffers = [];
	this.readBuffers[ 0 ] = this.renderTargets2[ 0 ];
	this.readBuffers[ 1 ] = this.renderTargets2[ 1 ];

	//

	this.camera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
	this.scene = new THREE.Scene();

	this.quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), this.materialSeparate );
	this.quad.frustumCulled = false; // Avoid getting clipped
	this.scene.add( this.quad );

	var self = this;

	function onVRDisplayPresentChange() {

		var size = self.renderer.getDrawingBufferSize();
		self.setSize( size.width, size.height );

	}

	window.addEventListener( 'vrdisplaypresentchange', onVRDisplayPresentChange, false );

	this.swapBuffers = function () {

		var tmp = this.readBuffer;
		this.readBuffer = this.writeBuffer;
		this.writeBuffer = tmp;

	};

	this.addPass = function ( pass ) {

		this.passes.push( pass );

		var size = this.renderer.getDrawingBufferSize();
		pass.setSize( size.width, size.height );

	},

	this.insertPass = function ( pass, index ) {

		this.passes.splice( index, 0, pass );

	};

	this.render = function ( delta ) {

		if ( this.renderer.vr.getDevice() && this.renderer.vr.getDevice().isPresenting ) {

			this.renderVR( delta );
			return;

		}

		var maskActive = false;

		var pass, i, il = this.passes.length;

		for ( i = 0; i < il; i ++ ) {

			pass = this.passes[ i ];

			if ( pass.enabled === false ) continue;

			pass.update( this.renderer, this.writeBuffer, this.readBuffer, delta, maskActive );
			pass.render( this.renderer, this.writeBuffer, this.readBuffer, delta, maskActive );

			if ( pass.needsSwap ) {

				if ( maskActive ) {

					var context = this.renderer.context;

					context.stencilFunc( context.NOTEQUAL, 1, 0xffffffff );

					this.copyPass.render( this.renderer, this.writeBuffer, this.readBuffer, delta );

					context.stencilFunc( context.EQUAL, 1, 0xffffffff );

				}

				this.swapBuffers();

			}

			if ( THREE.MaskPass !== undefined ) {

				if ( pass instanceof THREE.MaskPass ) {

					maskActive = true;

				} else if ( pass instanceof THREE.ClearMaskPass ) {

					maskActive = false;

				}

			}

		}

	};

	this.renderVR = function ( delta ) {

		var maskActive = false;

		var pass, i, il = this.passes.length;

		var separated = false;

		var currentAutoSubmitFrame = this.renderer.vr.autoSubmitFrame;

		this.renderer.vr.autoSubmitFrame = false;

		this.renderer.vr.enabled = false;

		for ( i = 0; i < il; i ++ ) {

			pass = this.passes[ i ];

			if ( pass.enabled === false ) continue;

			if ( THREE.RenderPass !== undefined && pass.constructor === THREE.RenderPass ) {

				this.renderer.vr.enabled = true;

				pass.update( this.renderer, this.writeBuffer, this.readBuffer, delta, maskActive );
				pass.render( this.renderer, this.writeBuffer, this.readBuffer, delta, maskActive );

				this.renderer.vr.enabled = false;

				if ( pass.needsSwap ) {

					if ( maskActive ) {

						var context = this.renderer.context;

						context.stencilFunc( context.NOTEQUAL, 1, 0xffffffff );

						this.copyPass.render( this.renderer, this.writeBuffer, this.readBuffer, delta );

						context.stencilFunc( context.EQUAL, 1, 0xffffffff );

					}

					this.swapBuffers();

				}

				separated = false;

			} else {

				if ( ! separated ) {

					// Exports left/right half from the original

					this.materialSeparate.uniforms.tDiffuse.value = this.readBuffer.texture;
					this.quad.material = this.materialSeparate;

					for ( var j = 0; j < 2; j ++ ) {

						var uv = this.quad.geometry.attributes.uv;
						var array = uv.array;

						// TODO: These parameters should be from vrDisplay.getLayers()?

						if ( j === 0 ) {

							// for left

							array[ 0 ] = 0.0;
							array[ 2 ] = 0.5;
							array[ 4 ] = 0.0;
							array[ 6 ] = 0.5;

						} else {

							// for right

							array[ 0 ] = 0.5;
							array[ 2 ] = 1.0;
							array[ 4 ] = 0.5;
							array[ 6 ] = 1.0;

						}

						uv.needsUpdate = true;

						this.renderer.render( this.scene, this.camera, this.readBuffers[ j ] );

					}

					separated = true;

				}

				var currentRenderToScreen = pass.renderToScreen;

				pass.renderToScreen = false;

				for ( var j = 0; j < 2; j ++ ) {

					if ( j === 0 ) pass.update( this.renderer, this.writeBuffers[ j ], this.readBuffers[ j ], delta, maskActive );

					pass.render( this.renderer, this.writeBuffers[ j ], this.readBuffers[ j ], delta, maskActive );

				}

				pass.renderToScreen = currentRenderToScreen;

				if ( pass.needsSwap ) {

					for ( var j = 0; j < 2; j ++ ) {

						if ( maskActive ) {

							var context = this.renderer.context;

							context.stencilFunc( context.NOTEQUAL, 1, 0xffffffff );

							this.copyPass.render( this.renderer, this.writeBuffers[ j ], this.readBuffers[ j ], delta );

							context.stencilFunc( context.EQUAL, 1, 0xffffffff );

						}

						var tmp = this.readBuffers[ j ];
						this.readBuffers[ j ] = this.writeBuffers[ j ];
						this.writeBuffers[ j ] = tmp;

					}

				}

			}

			if ( THREE.MaskPass !== undefined ) {

				if ( pass instanceof THREE.MaskPass ) {

					maskActive = true;

				} else if ( pass instanceof THREE.ClearMaskPass ) {

					maskActive = false;

				}

			}

			if ( separated && ( pass.renderToScreen || i === il - 1 ) ) {

				// Combines left and right

				var uv = this.quad.geometry.attributes.uv;
				var array = uv.array;

				array[ 0 ] = 0.0;
				array[ 2 ] = 1.0;
				array[ 4 ] = 0.0;
				array[ 6 ] = 1.0;

				uv.needsUpdate = true;

				this.materialCombine.uniforms.left.value = this.readBuffers[ 0 ].texture;
				this.materialCombine.uniforms.right.value = this.readBuffers[ 1 ].texture;
				this.quad.material = this.materialCombine;

				this.renderer.render( this.scene, this.camera, pass.renderToScreen ? null : this.writeBuffer );

				separated = false;

			}

			if ( pass.renderToScreen && currentAutoSubmitFrame ) {

				this.renderer.vr.submitFrame();

			}

		}

		this.renderer.vr.enabled = true;

		this.renderer.vr.autoSubmitFrame = currentAutoSubmitFrame;

	};

	this.reset = function ( renderTarget ) {

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

		this.renderTargets1[ 0 ].dispose();
		this.renderTargets1[ 1 ].dispose();
		this.renderTargets2[ 0 ].dispose();
		this.renderTargets2[ 1 ].dispose();

		this.renderTargets1[ 0 ] = renderTarget.clone();
		this.renderTargets1[ 1 ] = renderTarget.clone();
		this.renderTargets2[ 0 ] = renderTarget.clone();
		this.renderTargets2[ 1 ] = renderTarget.clone();

		this.writeBuffers[ 0 ] = this.renderTargets1[ 0 ];
		this.writeBuffers[ 1 ] = this.renderTargets1[ 1 ];
		this.readBuffers[ 0 ] = this.renderTargets2[ 0 ];
		this.readBuffers[ 1 ] = this.renderTargets2[ 1 ];

	};

	this.setSize = function ( width, height ) {

		this.renderTarget1.setSize( width, height );
		this.renderTarget2.setSize( width, height );

		if ( this.renderer.vr.getDevice() && this.renderer.vr.getDevice().isPresenting ) {

			this.renderTargets1[ 0 ].setSize( width / 2, height );
			this.renderTargets1[ 1 ].setSize( width / 2, height );
			this.renderTargets2[ 0 ].setSize( width / 2, height );
			this.renderTargets2[ 1 ].setSize( width / 2, height );

			for ( var i = 0, il = this.passes.length; i < il; i ++ ) {

				var pass = this.passes[ i ];

				if ( THREE.RenderPass !== undefined && pass.constructor === THREE.RenderPass ) {

					this.passes[ i ].setSize( width, height );

				} else {

					this.passes[ i ].setSize( width / 2, height );

				}

			}

		} else {

			for ( var i = 0, il = this.passes.length; i < il; i ++ ) {

				this.passes[ i ].setSize( width, height );

			}

		}

	};

	this.dispose = function () {

		this.renderTarget1.dispose();
		this.renderTarget2.dispose();

		this.renderTargets1[ 0 ].dispose();
		this.renderTargets1[ 1 ].dispose();
		this.renderTargets2[ 0 ].dispose();
		this.renderTargets2[ 1 ].dispose();

		window.removeEventListener( 'vrdisplaypresentchange', onVRDisplayPresentChange );

	};

};


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

	setSize: function( width, height ) {},

	update: function ( renderer, writeBuffer, readBuffer, delta, maskActive ) {},

	render: function ( renderer, writeBuffer, readBuffer, delta, maskActive ) {

		console.error( 'THREE.Pass: .render() must be implemented in derived pass.' );

	}

} );


// shader for combining left and right half
THREE.VRCombineShader = {

	uniforms: {

		"left": { value: null },
		"right": { value: null },
		"opacity":  { value: 1.0 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform float opacity;",

		"uniform sampler2D left;",
		"uniform sampler2D right;",

		"varying vec2 vUv;",

		"void main() {",

			"vec4 texel = vUv.x < 0.5 ? texture2D( left, vec2( vUv.x * 2.0, vUv.y ) ) : texture2D( right, vec2( ( vUv.x - 0.5 ) * 2.0, vUv.y ) );",
			"gl_FragColor = opacity * texel;",

		"}"

	].join( "\n" )

};
