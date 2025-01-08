import {
	CullFaceNone, CullFaceBack, CullFaceFront, DoubleSide, BackSide,
	NormalBlending, NoBlending, CustomBlending, AddEquation,
	AdditiveBlending, SubtractiveBlending, MultiplyBlending, SubtractEquation, ReverseSubtractEquation,
	ZeroFactor, OneFactor, SrcColorFactor, SrcAlphaFactor, SrcAlphaSaturateFactor, DstColorFactor, DstAlphaFactor,
	OneMinusSrcColorFactor, OneMinusSrcAlphaFactor, OneMinusDstColorFactor, OneMinusDstAlphaFactor,
	NeverDepth, AlwaysDepth, LessDepth, LessEqualDepth, EqualDepth, GreaterEqualDepth, GreaterDepth, NotEqualDepth
} from '../../../constants.js';

let initialized = false, equationToGL, factorToGL;

/**
 * A WebGL 2 backend utility module for managing the WebGL state.
 *
 * The major goal of this module is to reduce the number of state changes
 * by caching the WEbGL state with a series of variables. In this way, the
 * renderer only executes state change commands when necessary which
 * improves the overall performance.
 *
 * @private
 */
class WebGLState {

	/**
	 * Constructs a new utility object.
	 *
	 * @param {WebGLBackend} backend - The WebGL 2 backend.
	 */
	constructor( backend ) {

		/**
		 * A reference to the WebGL 2 backend.
		 *
		 * @type {WebGLBackend}
		 */
		this.backend = backend;

		/**
		 * A reference to the rendering context.
		 *
		 * @type {WebGL2RenderingContext}
		 */
		this.gl = this.backend.gl;

		// Below properties are intended to cache
		// the WebGL state and are not explicitly
		// documented for convenience reasons.

		this.enabled = {};
		this.currentFlipSided = null;
		this.currentCullFace = null;
		this.currentProgram = null;
		this.currentBlendingEnabled = false;
		this.currentBlending = null;
		this.currentBlendSrc = null;
		this.currentBlendDst = null;
		this.currentBlendSrcAlpha = null;
		this.currentBlendDstAlpha = null;
		this.currentPremultipledAlpha = null;
		this.currentPolygonOffsetFactor = null;
		this.currentPolygonOffsetUnits = null;
		this.currentColorMask = null;
		this.currentDepthFunc = null;
		this.currentDepthMask = null;
		this.currentStencilFunc = null;
		this.currentStencilRef = null;
		this.currentStencilFuncMask = null;
		this.currentStencilFail = null;
		this.currentStencilZFail = null;
		this.currentStencilZPass = null;
		this.currentStencilMask = null;
		this.currentLineWidth = null;
		this.currentClippingPlanes = 0;

		this.currentBoundFramebuffers = {};
		this.currentDrawbuffers = new WeakMap();

		this.maxTextures = this.gl.getParameter( this.gl.MAX_TEXTURE_IMAGE_UNITS );
		this.currentTextureSlot = null;
		this.currentBoundTextures = {};
		this.currentBoundBufferBases = {};

		if ( initialized === false ) {

			this._init();

			initialized = true;

		}

	}

	/**
	 * Inits the state of the utility.
	 *
	 * @private
	 */
	_init() {

		const gl = this.gl;

		// Store only WebGL constants here.

		equationToGL = {
			[ AddEquation ]: gl.FUNC_ADD,
			[ SubtractEquation ]: gl.FUNC_SUBTRACT,
			[ ReverseSubtractEquation ]: gl.FUNC_REVERSE_SUBTRACT
		};

		factorToGL = {
			[ ZeroFactor ]: gl.ZERO,
			[ OneFactor ]: gl.ONE,
			[ SrcColorFactor ]: gl.SRC_COLOR,
			[ SrcAlphaFactor ]: gl.SRC_ALPHA,
			[ SrcAlphaSaturateFactor ]: gl.SRC_ALPHA_SATURATE,
			[ DstColorFactor ]: gl.DST_COLOR,
			[ DstAlphaFactor ]: gl.DST_ALPHA,
			[ OneMinusSrcColorFactor ]: gl.ONE_MINUS_SRC_COLOR,
			[ OneMinusSrcAlphaFactor ]: gl.ONE_MINUS_SRC_ALPHA,
			[ OneMinusDstColorFactor ]: gl.ONE_MINUS_DST_COLOR,
			[ OneMinusDstAlphaFactor ]: gl.ONE_MINUS_DST_ALPHA
		};

	}

	/**
	 * Enables the given WebGL capability.
	 *
	 * This method caches the capability state so
	 * `gl.enable()` is only called when necessary.
	 *
	 * @param {GLenum} id - The capability to enable.
	 */
	enable( id ) {

		const { enabled } = this;

		if ( enabled[ id ] !== true ) {

			this.gl.enable( id );
			enabled[ id ] = true;

		}

	}

	/**
	 * Disables the given WebGL capability.
	 *
	 * This method caches the capability state so
	 * `gl.disable()` is only called when necessary.
	 *
	 * @param {GLenum} id - The capability to enable.
	 */
	disable( id ) {

		const { enabled } = this;

		if ( enabled[ id ] !== false ) {

			this.gl.disable( id );
			enabled[ id ] = false;

		}

	}

	/**
	 * Specifies whether polygons are front- or back-facing
	 * by setting the winding orientation.
	 *
	 * This method caches the state so `gl.frontFace()` is only
	 * called when necessary.
	 *
	 * @param {Boolean} flipSided - Whether triangles flipped their sides or not.
	 */
	setFlipSided( flipSided ) {

		if ( this.currentFlipSided !== flipSided ) {

			const { gl } = this;

			if ( flipSided ) {

				gl.frontFace( gl.CW );

			} else {

				gl.frontFace( gl.CCW );

			}

			this.currentFlipSided = flipSided;

		}

	}

	/**
	 * Specifies whether or not front- and/or back-facing
	 * polygons can be culled.
	 *
	 * This method caches the state so `gl.cullFace()` is only
	 * called when necessary.
	 *
	 * @param {Number} cullFace - Defines which polygons are candidates for culling.
	 */
	setCullFace( cullFace ) {

		const { gl } = this;

		if ( cullFace !== CullFaceNone ) {

			this.enable( gl.CULL_FACE );

			if ( cullFace !== this.currentCullFace ) {

				if ( cullFace === CullFaceBack ) {

					gl.cullFace( gl.BACK );

				} else if ( cullFace === CullFaceFront ) {

					gl.cullFace( gl.FRONT );

				} else {

					gl.cullFace( gl.FRONT_AND_BACK );

				}

			}

		} else {

			this.disable( gl.CULL_FACE );

		}

		this.currentCullFace = cullFace;

	}

	/**
	 * Specifies the width of line primitives.
	 *
	 * This method caches the state so `gl.lineWidth()` is only
	 * called when necessary.
	 *
	 * @param {Number} width - The line width.
	 */
	setLineWidth( width ) {

		const { currentLineWidth, gl } = this;

		if ( width !== currentLineWidth ) {

			gl.lineWidth( width );

			this.currentLineWidth = width;

		}

	}

	/**
	 * Defines the blending.
	 *
	 * This method caches the state so `gl.blendEquation()`, `gl.blendEquationSeparate()`,
	 * `gl.blendFunc()` and  `gl.blendFuncSeparate()` are only called when necessary.
	 *
	 * @param {Number} blending - The blending type.
	 * @param {Number} blendEquation - The blending equation.
	 * @param {Number} blendSrc - Only relevant for custom blending. The RGB source blending factor.
	 * @param {Number} blendDst - Only relevant for custom blending. The RGB destination blending factor.
	 * @param {Number} blendEquationAlpha - Only relevant for custom blending. The blending equation for alpha.
	 * @param {Number} blendSrcAlpha - Only relevant for custom blending. The alpha source blending factor.
	 * @param {Number} blendDstAlpha - Only relevant for custom blending. The alpha destination blending factor.
	 * @param {Boolean} premultipliedAlpha - Whether premultiplied alpha is enabled or not.
	 */
	setBlending( blending, blendEquation, blendSrc, blendDst, blendEquationAlpha, blendSrcAlpha, blendDstAlpha, premultipliedAlpha ) {

		const { gl } = this;

		if ( blending === NoBlending ) {

			if ( this.currentBlendingEnabled === true ) {

				this.disable( gl.BLEND );
				this.currentBlendingEnabled = false;

			}

			return;

		}

		if ( this.currentBlendingEnabled === false ) {

			this.enable( gl.BLEND );
			this.currentBlendingEnabled = true;

		}

		if ( blending !== CustomBlending ) {

			if ( blending !== this.currentBlending || premultipliedAlpha !== this.currentPremultipledAlpha ) {

				if ( this.currentBlendEquation !== AddEquation || this.currentBlendEquationAlpha !== AddEquation ) {

					gl.blendEquation( gl.FUNC_ADD );

					this.currentBlendEquation = AddEquation;
					this.currentBlendEquationAlpha = AddEquation;

				}

				if ( premultipliedAlpha ) {

					switch ( blending ) {

						case NormalBlending:
							gl.blendFuncSeparate( gl.ONE, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA );
							break;

						case AdditiveBlending:
							gl.blendFunc( gl.ONE, gl.ONE );
							break;

						case SubtractiveBlending:
							gl.blendFuncSeparate( gl.ZERO, gl.ONE_MINUS_SRC_COLOR, gl.ZERO, gl.ONE );
							break;

						case MultiplyBlending:
							gl.blendFuncSeparate( gl.ZERO, gl.SRC_COLOR, gl.ZERO, gl.SRC_ALPHA );
							break;

						default:
							console.error( 'THREE.WebGLState: Invalid blending: ', blending );
							break;

					}

				} else {

					switch ( blending ) {

						case NormalBlending:
							gl.blendFuncSeparate( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA );
							break;

						case AdditiveBlending:
							gl.blendFunc( gl.SRC_ALPHA, gl.ONE );
							break;

						case SubtractiveBlending:
							gl.blendFuncSeparate( gl.ZERO, gl.ONE_MINUS_SRC_COLOR, gl.ZERO, gl.ONE );
							break;

						case MultiplyBlending:
							gl.blendFunc( gl.ZERO, gl.SRC_COLOR );
							break;

						default:
							console.error( 'THREE.WebGLState: Invalid blending: ', blending );
							break;

					}

				}

				this.currentBlendSrc = null;
				this.currentBlendDst = null;
				this.currentBlendSrcAlpha = null;
				this.currentBlendDstAlpha = null;

				this.currentBlending = blending;
				this.currentPremultipledAlpha = premultipliedAlpha;

			}

			return;

		}

		// custom blending

		blendEquationAlpha = blendEquationAlpha || blendEquation;
		blendSrcAlpha = blendSrcAlpha || blendSrc;
		blendDstAlpha = blendDstAlpha || blendDst;

		if ( blendEquation !== this.currentBlendEquation || blendEquationAlpha !== this.currentBlendEquationAlpha ) {

			gl.blendEquationSeparate( equationToGL[ blendEquation ], equationToGL[ blendEquationAlpha ] );

			this.currentBlendEquation = blendEquation;
			this.currentBlendEquationAlpha = blendEquationAlpha;

		}

		if ( blendSrc !== this.currentBlendSrc || blendDst !== this.currentBlendDst || blendSrcAlpha !== this.currentBlendSrcAlpha || blendDstAlpha !== this.currentBlendDstAlpha ) {

			gl.blendFuncSeparate( factorToGL[ blendSrc ], factorToGL[ blendDst ], factorToGL[ blendSrcAlpha ], factorToGL[ blendDstAlpha ] );

			this.currentBlendSrc = blendSrc;
			this.currentBlendDst = blendDst;
			this.currentBlendSrcAlpha = blendSrcAlpha;
			this.currentBlendDstAlpha = blendDstAlpha;

		}

		this.currentBlending = blending;
		this.currentPremultipledAlpha = false;

	}

	/**
	 * Specifies whether colors can be written when rendering
	 * into a framebuffer or not.
	 *
	 * This method caches the state so `gl.colorMask()` is only
	 * called when necessary.
	 *
	 * @param {Boolean} colorMask - The color mask.
	 */
	setColorMask( colorMask ) {

		if ( this.currentColorMask !== colorMask ) {

			this.gl.colorMask( colorMask, colorMask, colorMask, colorMask );
			this.currentColorMask = colorMask;

		}

	}

	/**
	 * Specifies whether the depth test is enabled or not.
	 *
	 * @param {Boolean} depthTest - Whether the depth test is enabled or not.
	 */
	setDepthTest( depthTest ) {

		const { gl } = this;

		if ( depthTest ) {

			this.enable( gl.DEPTH_TEST );

		} else {

			this.disable( gl.DEPTH_TEST );

		}

	}

	/**
	 * Specifies whether depth values can be written when rendering
	 * into a framebuffer or not.
	 *
	 * This method caches the state so `gl.depthMask()` is only
	 * called when necessary.
	 *
	 * @param {Boolean} depthMask - The depth mask.
	 */
	setDepthMask( depthMask ) {

		if ( this.currentDepthMask !== depthMask ) {

			this.gl.depthMask( depthMask );
			this.currentDepthMask = depthMask;

		}

	}

	/**
	 * Specifies the depth compare function.
	 *
	 * This method caches the state so `gl.depthFunc()` is only
	 * called when necessary.
	 *
	 * @param {Number} depthFunc - The depth compare function.
	 */
	setDepthFunc( depthFunc ) {

		if ( this.currentDepthFunc !== depthFunc ) {

			const { gl } = this;

			switch ( depthFunc ) {

				case NeverDepth:

					gl.depthFunc( gl.NEVER );
					break;

				case AlwaysDepth:

					gl.depthFunc( gl.ALWAYS );
					break;

				case LessDepth:

					gl.depthFunc( gl.LESS );
					break;

				case LessEqualDepth:

					gl.depthFunc( gl.LEQUAL );
					break;

				case EqualDepth:

					gl.depthFunc( gl.EQUAL );
					break;

				case GreaterEqualDepth:

					gl.depthFunc( gl.GEQUAL );
					break;

				case GreaterDepth:

					gl.depthFunc( gl.GREATER );
					break;

				case NotEqualDepth:

					gl.depthFunc( gl.NOTEQUAL );
					break;

				default:

					gl.depthFunc( gl.LEQUAL );

			}

			this.currentDepthFunc = depthFunc;

		}

	}

	/**
	 * Specifies whether the stencil test is enabled or not.
	 *
	 * @param {Boolean} stencilTest - Whether the stencil test is enabled or not.
	 */
	setStencilTest( stencilTest ) {

		const { gl } = this;

		if ( stencilTest ) {

			this.enable( gl.STENCIL_TEST );

		} else {

			this.disable( gl.STENCIL_TEST );

		}

	}

	/**
	 * Specifies whether stencil values can be written when rendering
	 * into a framebuffer or not.
	 *
	 * This method caches the state so `gl.stencilMask()` is only
	 * called when necessary.
	 *
	 * @param {Boolean} stencilMask - The stencil mask.
	 */
	setStencilMask( stencilMask ) {

		if ( this.currentStencilMask !== stencilMask ) {

			this.gl.stencilMask( stencilMask );
			this.currentStencilMask = stencilMask;

		}

	}

	/**
	 * Specifies whether the stencil test functions.
	 *
	 * This method caches the state so `gl.stencilFunc()` is only
	 * called when necessary.
	 *
	 * @param {Number} stencilFunc - The stencil compare function.
	 * @param {Number} stencilRef - The reference value for the stencil test.
	 * @param {Number} stencilMask - A bit-wise mask that is used to AND the reference value and the stored stencil value when the test is done.
	 */
	setStencilFunc( stencilFunc, stencilRef, stencilMask ) {

		if ( this.currentStencilFunc !== stencilFunc ||
			 this.currentStencilRef !== stencilRef ||
			 this.currentStencilFuncMask !== stencilMask ) {

			this.gl.stencilFunc( stencilFunc, stencilRef, stencilMask );

			this.currentStencilFunc = stencilFunc;
			this.currentStencilRef = stencilRef;
			this.currentStencilFuncMask = stencilMask;

		}

	}

	/**
	 * Specifies whether the stencil test operation.
	 *
	 * This method caches the state so `gl.stencilOp()` is only
	 * called when necessary.
	 *
	 * @param {Number} stencilFail - The function to use when the stencil test fails.
	 * @param {Number} stencilZFail - The function to use when the stencil test passes, but the depth test fail.
	 * @param {Number} stencilZPass - The function to use when both the stencil test and the depth test pass,
	 * or when the stencil test passes and there is no depth buffer or depth testing is disabled.
	 */
	setStencilOp( stencilFail, stencilZFail, stencilZPass ) {

		if ( this.currentStencilFail !== stencilFail ||
			 this.currentStencilZFail !== stencilZFail ||
			 this.currentStencilZPass !== stencilZPass ) {

			this.gl.stencilOp( stencilFail, stencilZFail, stencilZPass );

			this.currentStencilFail = stencilFail;
			this.currentStencilZFail = stencilZFail;
			this.currentStencilZPass = stencilZPass;

		}

	}

	/**
	 * Configures the WebGL state for the given material.
	 *
	 * @param {Material} material - The material to configure the state for.
	 * @param {Number} frontFaceCW - Whether the front faces are counter-clockwise or not.
	 * @param {Number} hardwareClippingPlanes - The number of hardware clipping planes.
	 */
	setMaterial( material, frontFaceCW, hardwareClippingPlanes ) {

		const { gl } = this;

		material.side === DoubleSide
			? this.disable( gl.CULL_FACE )
			: this.enable( gl.CULL_FACE );

		let flipSided = ( material.side === BackSide );
		if ( frontFaceCW ) flipSided = ! flipSided;

		this.setFlipSided( flipSided );

		( material.blending === NormalBlending && material.transparent === false )
			? this.setBlending( NoBlending )
			: this.setBlending( material.blending, material.blendEquation, material.blendSrc, material.blendDst, material.blendEquationAlpha, material.blendSrcAlpha, material.blendDstAlpha, material.premultipliedAlpha );

		this.setDepthFunc( material.depthFunc );
		this.setDepthTest( material.depthTest );
		this.setDepthMask( material.depthWrite );
		this.setColorMask( material.colorWrite );

		const stencilWrite = material.stencilWrite;
		this.setStencilTest( stencilWrite );
		if ( stencilWrite ) {

			this.setStencilMask( material.stencilWriteMask );
			this.setStencilFunc( material.stencilFunc, material.stencilRef, material.stencilFuncMask );
			this.setStencilOp( material.stencilFail, material.stencilZFail, material.stencilZPass );

		}

		this.setPolygonOffset( material.polygonOffset, material.polygonOffsetFactor, material.polygonOffsetUnits );

		material.alphaToCoverage === true && this.backend.renderer.samples > 1
			? this.enable( gl.SAMPLE_ALPHA_TO_COVERAGE )
			: this.disable( gl.SAMPLE_ALPHA_TO_COVERAGE );

		if ( hardwareClippingPlanes > 0 ) {

			if ( this.currentClippingPlanes !== hardwareClippingPlanes ) {

				const CLIP_DISTANCE0_WEBGL = 0x3000;

				for ( let i = 0; i < 8; i ++ ) {

					if ( i < hardwareClippingPlanes ) {

						this.enable( CLIP_DISTANCE0_WEBGL + i );

					} else {

						this.disable( CLIP_DISTANCE0_WEBGL + i );

					}

				}

			}

		}

	}

	/**
	 * Specifies the polygon offset.
	 *
	 * This method caches the state so `gl.polygonOffset()` is only
	 * called when necessary.
	 *
	 * @param {Boolean} polygonOffset - Whether polygon offset is enabled or not.
	 * @param {Number} factor - The scale factor for the variable depth offset for each polygon.
	 * @param {Number} units - The multiplier by which an implementation-specific value is multiplied with to create a constant depth offset.
	 */
	setPolygonOffset( polygonOffset, factor, units ) {

		const { gl } = this;

		if ( polygonOffset ) {

			this.enable( gl.POLYGON_OFFSET_FILL );

			if ( this.currentPolygonOffsetFactor !== factor || this.currentPolygonOffsetUnits !== units ) {

				gl.polygonOffset( factor, units );

				this.currentPolygonOffsetFactor = factor;
				this.currentPolygonOffsetUnits = units;

			}

		} else {

			this.disable( gl.POLYGON_OFFSET_FILL );

		}

	}

	/**
	 * Defines the usage of the given WebGL program.
	 *
	 * This method caches the state so `gl.useProgram()` is only
	 * called when necessary.
	 *
	 * @param {WebGLProgram} program - The WebGL program to use.
	 * @return {Boolean} Whether a program change has been executed or not.
	 */
	useProgram( program ) {

		if ( this.currentProgram !== program ) {

			this.gl.useProgram( program );

			this.currentProgram = program;

			return true;

		}

		return false;

	}

	// framebuffer


	/**
	 * Binds the given framebuffer.
	 *
	 * This method caches the state so `gl.bindFramebuffer()` is only
	 * called when necessary.
	 *
	 * @param {Number} target - The binding point (target).
	 * @param {WebGLFramebuffer} framebuffer - The WebGL framebuffer to bind.
	 * @return {Boolean} Whether a bind has been executed or not.
	 */
	bindFramebuffer( target, framebuffer ) {

		const { gl, currentBoundFramebuffers } = this;

		if ( currentBoundFramebuffers[ target ] !== framebuffer ) {

			gl.bindFramebuffer( target, framebuffer );

			currentBoundFramebuffers[ target ] = framebuffer;

			// gl.DRAW_FRAMEBUFFER is equivalent to gl.FRAMEBUFFER

			if ( target === gl.DRAW_FRAMEBUFFER ) {

				currentBoundFramebuffers[ gl.FRAMEBUFFER ] = framebuffer;

			}

			if ( target === gl.FRAMEBUFFER ) {

				currentBoundFramebuffers[ gl.DRAW_FRAMEBUFFER ] = framebuffer;

			}

			return true;

		}

		return false;

	}

	/**
	 * Defines draw buffers to which fragment colors are written into.
	 * Configures the MRT setup of custom framebuffers.
	 *
	 * This method caches the state so `gl.drawBuffers()` is only
	 * called when necessary.
	 *
	 * @param {RenderContext} renderContext - The render context.
	 * @param {WebGLFramebuffer} framebuffer - The WebGL framebuffer.
	 */
	drawBuffers( renderContext, framebuffer ) {

		const { gl } = this;

		let drawBuffers = [];

		let needsUpdate = false;

		if ( renderContext.textures !== null ) {

			drawBuffers = this.currentDrawbuffers.get( framebuffer );

			if ( drawBuffers === undefined ) {

				drawBuffers = [];
				this.currentDrawbuffers.set( framebuffer, drawBuffers );

			}


			const textures = renderContext.textures;

			if ( drawBuffers.length !== textures.length || drawBuffers[ 0 ] !== gl.COLOR_ATTACHMENT0 ) {

				for ( let i = 0, il = textures.length; i < il; i ++ ) {

					drawBuffers[ i ] = gl.COLOR_ATTACHMENT0 + i;

				}

				drawBuffers.length = textures.length;

				needsUpdate = true;

			}


		} else {

			if ( drawBuffers[ 0 ] !== gl.BACK ) {

				drawBuffers[ 0 ] = gl.BACK;

				needsUpdate = true;

			}

		}

		if ( needsUpdate ) {

			gl.drawBuffers( drawBuffers );

		}

	}


	// texture

	/**
	 * Makes the given texture unit active.
	 *
	 * This method caches the state so `gl.activeTexture()` is only
	 * called when necessary.
	 *
	 * @param {Number} webglSlot - The texture unit to make active.
	 */
	activeTexture( webglSlot ) {

		const { gl, currentTextureSlot, maxTextures } = this;

		if ( webglSlot === undefined ) webglSlot = gl.TEXTURE0 + maxTextures - 1;

		if ( currentTextureSlot !== webglSlot ) {

			gl.activeTexture( webglSlot );
			this.currentTextureSlot = webglSlot;

		}

	}

	/**
	 * Binds the given WebGL texture to a target.
	 *
	 * This method caches the state so `gl.bindTexture()` is only
	 * called when necessary.
	 *
	 * @param {Number} webglType - The binding point (target).
	 * @param {WebGLTexture} webglTexture - The WebGL texture to bind.
	 * @param {Number} webglSlot - The texture.
	 */
	bindTexture( webglType, webglTexture, webglSlot ) {

		const { gl, currentTextureSlot, currentBoundTextures, maxTextures } = this;

		if ( webglSlot === undefined ) {

			if ( currentTextureSlot === null ) {

				webglSlot = gl.TEXTURE0 + maxTextures - 1;

			} else {

				webglSlot = currentTextureSlot;

			}

		}

		let boundTexture = currentBoundTextures[ webglSlot ];

		if ( boundTexture === undefined ) {

			boundTexture = { type: undefined, texture: undefined };
			currentBoundTextures[ webglSlot ] = boundTexture;

		}

		if ( boundTexture.type !== webglType || boundTexture.texture !== webglTexture ) {

			if ( currentTextureSlot !== webglSlot ) {

				gl.activeTexture( webglSlot );
				this.currentTextureSlot = webglSlot;

			}

			gl.bindTexture( webglType, webglTexture );

			boundTexture.type = webglType;
			boundTexture.texture = webglTexture;

		}

	}

	/**
	 * Binds a given WebGL buffer to a given binding point (target) at a given index.
	 *
	 * This method caches the state so `gl.bindBufferBase()` is only
	 * called when necessary.
	 *
	 * @param {Number} target - The target for the bind operation.
	 * @param {Number} index - The index of the target.
	 * @param {WebGLBuffer} buffer - The WebGL buffer.
	 * @return {Boolean} Whether a bind has been executed or not.
	 */
	bindBufferBase( target, index, buffer ) {

		const { gl } = this;

		const key = `${target}-${index}`;

		if ( this.currentBoundBufferBases[ key ] !== buffer ) {

			gl.bindBufferBase( target, index, buffer );
			this.currentBoundBufferBases[ key ] = buffer;

			return true;

		}

		return false;

	}


	/**
	 * Unbinds the current bound texture.
	 *
	 * This method caches the state so `gl.bindTexture()` is only
	 * called when necessary.
	 */
	unbindTexture() {

		const { gl, currentTextureSlot, currentBoundTextures } = this;

		const boundTexture = currentBoundTextures[ currentTextureSlot ];

		if ( boundTexture !== undefined && boundTexture.type !== undefined ) {

			gl.bindTexture( boundTexture.type, null );

			boundTexture.type = undefined;
			boundTexture.texture = undefined;

		}

	}

}

export default WebGLState;
