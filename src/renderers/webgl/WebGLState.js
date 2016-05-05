/**
* @author mrdoob / http://mrdoob.com/
*/

THREE.WebGLState = function ( gl, extensions, paramThreeToGL ) {

	var _this = this;

	var color = new THREE.Vector4();

	var maxVertexAttributes = gl.getParameter( gl.MAX_VERTEX_ATTRIBS );
	var newAttributes = new Uint8Array( maxVertexAttributes );
	var enabledAttributes = new Uint8Array( maxVertexAttributes );
	var attributeDivisors = new Uint8Array( maxVertexAttributes );

	var capabilities = {};

	var compressedTextureFormats = null;

	var currentBlending = null;
	var currentBlendEquation = null;
	var currentBlendSrc = null;
	var currentBlendDst = null;
	var currentBlendEquationAlpha = null;
	var currentBlendSrcAlpha = null;
	var currentBlendDstAlpha = null;
	var currentPremultipledAlpha = false;

	var currentDepthFunc = null;
	var currentDepthWrite = null;

	var currentColorWrite = null;

	var currentStencilWrite = null;
	var currentStencilFunc = null;
	var currentStencilRef = null;
	var currentStencilMask = null;
	var currentStencilFail  = null;
	var currentStencilZFail = null;
	var currentStencilZPass = null;

	var currentFlipSided = null;
	var currentCullFace = null;

	var currentLineWidth = null;

	var currentPolygonOffsetFactor = null;
	var currentPolygonOffsetUnits = null;

	var currentScissorTest = null;

	var maxTextures = gl.getParameter( gl.MAX_TEXTURE_IMAGE_UNITS );

	var currentTextureSlot = null;
	var currentBoundTextures = {};

	var currentClearColor = new THREE.Vector4();
	var currentClearDepth = null;
	var currentClearStencil = null;

	var currentScissor = new THREE.Vector4();
	var currentViewport = new THREE.Vector4();

	function createTexture( type, target, count ) {

		var data = new Uint8Array( 3 );
		var texture = gl.createTexture();

		gl.bindTexture( type, texture );
		gl.texParameteri( type, gl.TEXTURE_MIN_FILTER, gl.NEAREST );
		gl.texParameteri( type, gl.TEXTURE_MAG_FILTER, gl.NEAREST );

		for ( var i = 0; i < count; i ++ ) {

			gl.texImage2D( target + i, 0, gl.RGB, 1, 1, 0, gl.RGB, gl.UNSIGNED_BYTE, data );

		}

		return texture;

	}

	var emptyTextures = {};
	emptyTextures[ gl.TEXTURE_2D ] = createTexture( gl.TEXTURE_2D, gl.TEXTURE_2D, 1 );
	emptyTextures[ gl.TEXTURE_CUBE_MAP ] = createTexture( gl.TEXTURE_CUBE_MAP, gl.TEXTURE_CUBE_MAP_POSITIVE_X, 6 );

	//

	this.init = function () {

		this.clearColor( 0, 0, 0, 1 );
		this.clearDepth( 1 );
		this.clearStencil( 0 );

		this.enable( gl.DEPTH_TEST );
		this.setDepthFunc( THREE.LessEqualDepth );

		this.setFlipSided( false );
		this.setCullFace( THREE.CullFaceBack );
		this.enable( gl.CULL_FACE );

		this.enable( gl.BLEND );
		this.setBlending( THREE.NormalBlending );

	};

	this.initAttributes = function () {

		for ( var i = 0, l = newAttributes.length; i < l; i ++ ) {

			newAttributes[ i ] = 0;

		}

	};

	this.enableAttribute = function ( attribute ) {

		newAttributes[ attribute ] = 1;

		if ( enabledAttributes[ attribute ] === 0 ) {

			gl.enableVertexAttribArray( attribute );
			enabledAttributes[ attribute ] = 1;

		}

		if ( attributeDivisors[ attribute ] !== 0 ) {

			var extension = extensions.get( 'ANGLE_instanced_arrays' );

			extension.vertexAttribDivisorANGLE( attribute, 0 );
			attributeDivisors[ attribute ] = 0;

		}

	};

	this.enableAttributeAndDivisor = function ( attribute, meshPerAttribute, extension ) {

		newAttributes[ attribute ] = 1;

		if ( enabledAttributes[ attribute ] === 0 ) {

			gl.enableVertexAttribArray( attribute );
			enabledAttributes[ attribute ] = 1;

		}

		if ( attributeDivisors[ attribute ] !== meshPerAttribute ) {

			extension.vertexAttribDivisorANGLE( attribute, meshPerAttribute );
			attributeDivisors[ attribute ] = meshPerAttribute;

		}

	};

	this.disableUnusedAttributes = function () {

		for ( var i = 0, l = enabledAttributes.length; i !== l; ++ i ) {

			if ( enabledAttributes[ i ] !== newAttributes[ i ] ) {

				gl.disableVertexAttribArray( i );
				enabledAttributes[ i ] = 0;

			}

		}

	};

	this.enable = function ( id ) {

		if ( capabilities[ id ] !== true ) {

			gl.enable( id );
			capabilities[ id ] = true;

		}

	};

	this.disable = function ( id ) {

		if ( capabilities[ id ] !== false ) {

			gl.disable( id );
			capabilities[ id ] = false;

		}

	};

	this.getCompressedTextureFormats = function () {

		if ( compressedTextureFormats === null ) {

			compressedTextureFormats = [];

			if ( extensions.get( 'WEBGL_compressed_texture_pvrtc' ) ||
			     extensions.get( 'WEBGL_compressed_texture_s3tc' ) ||
			     extensions.get( 'WEBGL_compressed_texture_etc1' ) ) {

				var formats = gl.getParameter( gl.COMPRESSED_TEXTURE_FORMATS );

				for ( var i = 0; i < formats.length; i ++ ) {

					compressedTextureFormats.push( formats[ i ] );

				}

			}

		}

		return compressedTextureFormats;

	};

	this.setBlending = function ( blending, blendEquation, blendSrc, blendDst, blendEquationAlpha, blendSrcAlpha, blendDstAlpha, premultipliedAlpha ) {

		if ( blending !== THREE.NoBlending ) {

			this.enable( gl.BLEND );

		} else {

			this.disable( gl.BLEND );
			currentBlending = blending; // no blending, that is
			return;

		}

		if ( blending !== currentBlending || premultipliedAlpha !== currentPremultipledAlpha ) {

			if ( blending === THREE.AdditiveBlending ) {

				if ( premultipliedAlpha ) {

					gl.blendEquationSeparate( gl.FUNC_ADD, gl.FUNC_ADD );
					gl.blendFuncSeparate( gl.ONE, gl.ONE, gl.ONE, gl.ONE );

				} else {

					gl.blendEquation( gl.FUNC_ADD );
					gl.blendFunc( gl.SRC_ALPHA, gl.ONE );

				}

			} else if ( blending === THREE.SubtractiveBlending ) {

				if ( premultipliedAlpha ) {

					gl.blendEquationSeparate( gl.FUNC_ADD, gl.FUNC_ADD );
					gl.blendFuncSeparate( gl.ZERO, gl.ZERO, gl.ONE_MINUS_SRC_COLOR, gl.ONE_MINUS_SRC_ALPHA );

				} else {

					gl.blendEquation( gl.FUNC_ADD );
					gl.blendFunc( gl.ZERO, gl.ONE_MINUS_SRC_COLOR );

				}

			} else if ( blending === THREE.MultiplyBlending ) {

				if ( premultipliedAlpha ) {

					gl.blendEquationSeparate( gl.FUNC_ADD, gl.FUNC_ADD );
					gl.blendFuncSeparate( gl.ZERO, gl.ZERO, gl.SRC_COLOR, gl.SRC_ALPHA );

				} else {

					gl.blendEquation( gl.FUNC_ADD );
					gl.blendFunc( gl.ZERO, gl.SRC_COLOR );

				}

			} else {

				if ( premultipliedAlpha ) {

					gl.blendEquationSeparate( gl.FUNC_ADD, gl.FUNC_ADD );
					gl.blendFuncSeparate( gl.ONE, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA );

				} else {

					gl.blendEquationSeparate( gl.FUNC_ADD, gl.FUNC_ADD );
					gl.blendFuncSeparate( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA );

				}

			}

			currentBlending = blending;
			currentPremultipledAlpha = premultipliedAlpha;

		}

		if ( blending === THREE.CustomBlending ) {

			blendEquationAlpha = blendEquationAlpha || blendEquation;
			blendSrcAlpha = blendSrcAlpha || blendSrc;
			blendDstAlpha = blendDstAlpha || blendDst;

			if ( blendEquation !== currentBlendEquation || blendEquationAlpha !== currentBlendEquationAlpha ) {

				gl.blendEquationSeparate( paramThreeToGL( blendEquation ), paramThreeToGL( blendEquationAlpha ) );

				currentBlendEquation = blendEquation;
				currentBlendEquationAlpha = blendEquationAlpha;

			}

			if ( blendSrc !== currentBlendSrc || blendDst !== currentBlendDst || blendSrcAlpha !== currentBlendSrcAlpha || blendDstAlpha !== currentBlendDstAlpha ) {

				gl.blendFuncSeparate( paramThreeToGL( blendSrc ), paramThreeToGL( blendDst ), paramThreeToGL( blendSrcAlpha ), paramThreeToGL( blendDstAlpha ) );

				currentBlendSrc = blendSrc;
				currentBlendDst = blendDst;
				currentBlendSrcAlpha = blendSrcAlpha;
				currentBlendDstAlpha = blendDstAlpha;

			}

		} else {

			currentBlendEquation = null;
			currentBlendSrc = null;
			currentBlendDst = null;
			currentBlendEquationAlpha = null;
			currentBlendSrcAlpha = null;
			currentBlendDstAlpha = null;

		}

	};

	this.setDepthFunc = function ( depthFunc ) {

		if ( currentDepthFunc !== depthFunc ) {

			if ( depthFunc ) {

				switch ( depthFunc ) {

					case THREE.NeverDepth:

						gl.depthFunc( gl.NEVER );
						break;

					case THREE.AlwaysDepth:

						gl.depthFunc( gl.ALWAYS );
						break;

					case THREE.LessDepth:

						gl.depthFunc( gl.LESS );
						break;

					case THREE.LessEqualDepth:

						gl.depthFunc( gl.LEQUAL );
						break;

					case THREE.EqualDepth:

						gl.depthFunc( gl.EQUAL );
						break;

					case THREE.GreaterEqualDepth:

						gl.depthFunc( gl.GEQUAL );
						break;

					case THREE.GreaterDepth:

						gl.depthFunc( gl.GREATER );
						break;

					case THREE.NotEqualDepth:

						gl.depthFunc( gl.NOTEQUAL );
						break;

					default:

						gl.depthFunc( gl.LEQUAL );

				}

			} else {

				gl.depthFunc( gl.LEQUAL );

			}

			currentDepthFunc = depthFunc;

		}

	};

	this.setDepthTest = function ( depthTest ) {

		if ( depthTest ) {

			this.enable( gl.DEPTH_TEST );

		} else {

			this.disable( gl.DEPTH_TEST );

		}

	};

	this.setDepthWrite = function ( depthWrite ) {

		// TODO: Rename to setDepthMask

		if ( currentDepthWrite !== depthWrite ) {

			gl.depthMask( depthWrite );
			currentDepthWrite = depthWrite;

		}

	};

	this.setColorWrite = function ( colorWrite ) {

		// TODO: Rename to setColorMask

		if ( currentColorWrite !== colorWrite ) {

			gl.colorMask( colorWrite, colorWrite, colorWrite, colorWrite );
			currentColorWrite = colorWrite;

		}

	};

	this.setStencilFunc = function ( stencilFunc, stencilRef, stencilMask ) {

		if ( currentStencilFunc !== stencilFunc ||
				 currentStencilRef 	!== stencilRef 	||
				 currentStencilMask !== stencilMask ) {

			gl.stencilFunc( stencilFunc,  stencilRef, stencilMask );

			currentStencilFunc = stencilFunc;
			currentStencilRef  = stencilRef;
			currentStencilMask = stencilMask;

		}

	};

	this.setStencilOp = function ( stencilFail, stencilZFail, stencilZPass ) {

		if ( currentStencilFail	 !== stencilFail 	||
				 currentStencilZFail !== stencilZFail ||
				 currentStencilZPass !== stencilZPass ) {

			gl.stencilOp( stencilFail,  stencilZFail, stencilZPass );

			currentStencilFail  = stencilFail;
			currentStencilZFail = stencilZFail;
			currentStencilZPass = stencilZPass;

		}

	};

	this.setStencilTest = function ( stencilTest ) {

		if ( stencilTest ) {

			this.enable( gl.STENCIL_TEST );

		} else {

			this.disable( gl.STENCIL_TEST );

		}

	};

	this.setStencilWrite = function ( stencilWrite ) {

		// TODO: Rename to setStencilMask

		if ( currentStencilWrite !== stencilWrite ) {

			gl.stencilMask( stencilWrite );
			currentStencilWrite = stencilWrite;

		}

	};

	this.setFlipSided = function ( flipSided ) {

		if ( currentFlipSided !== flipSided ) {

			if ( flipSided ) {

				gl.frontFace( gl.CW );

			} else {

				gl.frontFace( gl.CCW );

			}

			currentFlipSided = flipSided;

		}

	};

	this.setCullFace = function ( cullFace ) {

		if ( cullFace !== THREE.CullFaceNone ) {

			this.enable( gl.CULL_FACE );

			if ( cullFace !== currentCullFace ) {

				if ( cullFace === THREE.CullFaceBack ) {

					gl.cullFace( gl.BACK );

				} else if ( cullFace === THREE.CullFaceFront ) {

					gl.cullFace( gl.FRONT );

				} else {

					gl.cullFace( gl.FRONT_AND_BACK );

				}

			}

		} else {

			this.disable( gl.CULL_FACE );

		}

		currentCullFace = cullFace;

	};

	this.setLineWidth = function ( width ) {

		if ( width !== currentLineWidth ) {

			gl.lineWidth( width );

			currentLineWidth = width;

		}

	};

	this.setPolygonOffset = function ( polygonOffset, factor, units ) {

		if ( polygonOffset ) {

			this.enable( gl.POLYGON_OFFSET_FILL );

			if ( currentPolygonOffsetFactor !== factor || currentPolygonOffsetUnits !== units ) {

				gl.polygonOffset( factor, units );

				currentPolygonOffsetFactor = factor;
				currentPolygonOffsetUnits = units;

			}

		} else {

			this.disable( gl.POLYGON_OFFSET_FILL );

		}

	};

	this.getScissorTest = function () {

		return currentScissorTest;

	};

	this.setScissorTest = function ( scissorTest ) {

		currentScissorTest = scissorTest;

		if ( scissorTest ) {

			this.enable( gl.SCISSOR_TEST );

		} else {

			this.disable( gl.SCISSOR_TEST );

		}

	};

	// texture

	this.activeTexture = function ( webglSlot ) {

		if ( webglSlot === undefined ) webglSlot = gl.TEXTURE0 + maxTextures - 1;

		if ( currentTextureSlot !== webglSlot ) {

			gl.activeTexture( webglSlot );
			currentTextureSlot = webglSlot;

		}

	};

	this.bindTexture = function ( webglType, webglTexture ) {

		if ( currentTextureSlot === null ) {

			_this.activeTexture();

		}

		var boundTexture = currentBoundTextures[ currentTextureSlot ];

		if ( boundTexture === undefined ) {

			boundTexture = { type: undefined, texture: undefined };
			currentBoundTextures[ currentTextureSlot ] = boundTexture;

		}

		if ( boundTexture.type !== webglType || boundTexture.texture !== webglTexture ) {

			gl.bindTexture( webglType, webglTexture || emptyTextures[ webglType ] );

			boundTexture.type = webglType;
			boundTexture.texture = webglTexture;

		}

	};

	this.compressedTexImage2D = function () {

		try {

			gl.compressedTexImage2D.apply( gl, arguments );

		} catch ( error ) {

			console.error( error );

		}

	};

	this.texImage2D = function () {

		try {

			gl.texImage2D.apply( gl, arguments );

		} catch ( error ) {

			console.error( error );

		}

	};

	// clear values

	this.clearColor = function ( r, g, b, a ) {

		color.set( r, g, b, a );

		if ( currentClearColor.equals( color ) === false ) {

			gl.clearColor( r, g, b, a );
			currentClearColor.copy( color );

		}

	};

	this.clearDepth = function ( depth ) {

		if ( currentClearDepth !== depth ) {

			gl.clearDepth( depth );
			currentClearDepth = depth;

		}

	};

	this.clearStencil = function ( stencil ) {

		if ( currentClearStencil !== stencil ) {

			gl.clearStencil( stencil );
			currentClearStencil = stencil;

		}

	};

	//

	this.scissor = function ( scissor ) {

		if ( currentScissor.equals( scissor ) === false ) {

			gl.scissor( scissor.x, scissor.y, scissor.z, scissor.w );
			currentScissor.copy( scissor );

		}

	};

	this.viewport = function ( viewport ) {

		if ( currentViewport.equals( viewport ) === false ) {

			gl.viewport( viewport.x, viewport.y, viewport.z, viewport.w );
			currentViewport.copy( viewport );

		}

	};

	//

	this.reset = function () {

		for ( var i = 0; i < enabledAttributes.length; i ++ ) {

			if ( enabledAttributes[ i ] === 1 ) {

				gl.disableVertexAttribArray( i );
				enabledAttributes[ i ] = 0;

			}

		}

		capabilities = {};

		compressedTextureFormats = null;

		currentTextureSlot = null;
		currentBoundTextures = {};

		currentBlending = null;

		currentColorWrite = null;
		currentDepthWrite = null;
		currentStencilWrite = null;

		currentFlipSided = null;
		currentCullFace = null;

	};

};
