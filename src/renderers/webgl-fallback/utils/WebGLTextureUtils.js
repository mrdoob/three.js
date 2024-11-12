import { LinearFilter, LinearMipmapLinearFilter, LinearMipmapNearestFilter, NearestFilter, NearestMipmapLinearFilter, NearestMipmapNearestFilter, FloatType, MirroredRepeatWrapping, ClampToEdgeWrapping, RepeatWrapping, SRGBColorSpace, NeverCompare, AlwaysCompare, LessCompare, LessEqualCompare, EqualCompare, GreaterEqualCompare, GreaterCompare, NotEqualCompare } from '../../../constants.js';

let initialized = false, wrappingToGL, filterToGL, compareToGL;

class WebGLTextureUtils {

	constructor( backend ) {

		this.backend = backend;

		this.gl = backend.gl;
		this.extensions = backend.extensions;
		this.defaultTextures = {};

		if ( initialized === false ) {

			this._init( this.gl );

			initialized = true;

		}

	}

	_init( gl ) {

		// Store only WebGL constants here.

		wrappingToGL = {
			[ RepeatWrapping ]: gl.REPEAT,
			[ ClampToEdgeWrapping ]: gl.CLAMP_TO_EDGE,
			[ MirroredRepeatWrapping ]: gl.MIRRORED_REPEAT
		};

		filterToGL = {
			[ NearestFilter ]: gl.NEAREST,
			[ NearestMipmapNearestFilter ]: gl.NEAREST_MIPMAP_NEAREST,
			[ NearestMipmapLinearFilter ]: gl.NEAREST_MIPMAP_LINEAR,

			[ LinearFilter ]: gl.LINEAR,
			[ LinearMipmapNearestFilter ]: gl.LINEAR_MIPMAP_NEAREST,
			[ LinearMipmapLinearFilter ]: gl.LINEAR_MIPMAP_LINEAR
		};

		compareToGL = {
			[ NeverCompare ]: gl.NEVER,
			[ AlwaysCompare ]: gl.ALWAYS,
			[ LessCompare ]: gl.LESS,
			[ LessEqualCompare ]: gl.LEQUAL,
			[ EqualCompare ]: gl.EQUAL,
			[ GreaterEqualCompare ]: gl.GEQUAL,
			[ GreaterCompare ]: gl.GREATER,
			[ NotEqualCompare ]: gl.NOTEQUAL
		};

	}

	filterFallback( f ) {

		const { gl } = this;

		if ( f === NearestFilter || f === NearestMipmapNearestFilter || f === NearestMipmapLinearFilter ) {

			return gl.NEAREST;

		}

		return gl.LINEAR;

	}

	getGLTextureType( texture ) {

		const { gl } = this;

		let glTextureType;

		if ( texture.isCubeTexture === true ) {

			glTextureType = gl.TEXTURE_CUBE_MAP;

		} else if ( texture.isDataArrayTexture === true || texture.isCompressedArrayTexture === true ) {

			glTextureType = gl.TEXTURE_2D_ARRAY;

		} else if ( texture.isData3DTexture === true ) { // TODO: isCompressed3DTexture, wait for #26642

			glTextureType = gl.TEXTURE_3D;

		} else {

			glTextureType = gl.TEXTURE_2D;


		}

		return glTextureType;

	}

	getInternalFormat( internalFormatName, glFormat, glType, colorSpace, forceLinearTransfer = false ) {

		const { gl, extensions } = this;

		if ( internalFormatName !== null ) {

			if ( gl[ internalFormatName ] !== undefined ) return gl[ internalFormatName ];

			console.warn( 'THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format \'' + internalFormatName + '\'' );

		}

		let internalFormat = glFormat;

		if ( glFormat === gl.RED ) {

			if ( glType === gl.FLOAT ) internalFormat = gl.R32F;
			if ( glType === gl.HALF_FLOAT ) internalFormat = gl.R16F;
			if ( glType === gl.UNSIGNED_BYTE ) internalFormat = gl.R8;
			if ( glType === gl.UNSIGNED_SHORT ) internalFormat = gl.R16;
			if ( glType === gl.UNSIGNED_INT ) internalFormat = gl.R32UI;
			if ( glType === gl.BYTE ) internalFormat = gl.R8I;
			if ( glType === gl.SHORT ) internalFormat = gl.R16I;
			if ( glType === gl.INT ) internalFormat = gl.R32I;

		}

		if ( glFormat === gl.RED_INTEGER ) {

			if ( glType === gl.UNSIGNED_BYTE ) internalFormat = gl.R8UI;
			if ( glType === gl.UNSIGNED_SHORT ) internalFormat = gl.R16UI;
			if ( glType === gl.UNSIGNED_INT ) internalFormat = gl.R32UI;
			if ( glType === gl.BYTE ) internalFormat = gl.R8I;
			if ( glType === gl.SHORT ) internalFormat = gl.R16I;
			if ( glType === gl.INT ) internalFormat = gl.R32I;

		}

		if ( glFormat === gl.RG ) {

			if ( glType === gl.FLOAT ) internalFormat = gl.RG32F;
			if ( glType === gl.HALF_FLOAT ) internalFormat = gl.RG16F;
			if ( glType === gl.UNSIGNED_BYTE ) internalFormat = gl.RG8;
			if ( glType === gl.UNSIGNED_SHORT ) internalFormat = gl.RG16;
			if ( glType === gl.UNSIGNED_INT ) internalFormat = gl.RG32UI;
			if ( glType === gl.BYTE ) internalFormat = gl.RG8I;
			if ( glType === gl.SHORT ) internalFormat = gl.RG16I;
			if ( glType === gl.INT ) internalFormat = gl.RG32I;

		}

		if ( glFormat === gl.RG_INTEGER ) {

			if ( glType === gl.UNSIGNED_BYTE ) internalFormat = gl.RG8UI;
			if ( glType === gl.UNSIGNED_SHORT ) internalFormat = gl.RG16UI;
			if ( glType === gl.UNSIGNED_INT ) internalFormat = gl.RG32UI;
			if ( glType === gl.BYTE ) internalFormat = gl.RG8I;
			if ( glType === gl.SHORT ) internalFormat = gl.RG16I;
			if ( glType === gl.INT ) internalFormat = gl.RG32I;

		}

		if ( glFormat === gl.RGB ) {

			if ( glType === gl.FLOAT ) internalFormat = gl.RGB32F;
			if ( glType === gl.HALF_FLOAT ) internalFormat = gl.RGB16F;
			if ( glType === gl.UNSIGNED_BYTE ) internalFormat = gl.RGB8;
			if ( glType === gl.UNSIGNED_SHORT ) internalFormat = gl.RGB16;
			if ( glType === gl.UNSIGNED_INT ) internalFormat = gl.RGB32UI;
			if ( glType === gl.BYTE ) internalFormat = gl.RGB8I;
			if ( glType === gl.SHORT ) internalFormat = gl.RGB16I;
			if ( glType === gl.INT ) internalFormat = gl.RGB32I;
			if ( glType === gl.UNSIGNED_BYTE ) internalFormat = ( colorSpace === SRGBColorSpace && forceLinearTransfer === false ) ? gl.SRGB8 : gl.RGB8;
			if ( glType === gl.UNSIGNED_SHORT_5_6_5 ) internalFormat = gl.RGB565;
			if ( glType === gl.UNSIGNED_SHORT_5_5_5_1 ) internalFormat = gl.RGB5_A1;
			if ( glType === gl.UNSIGNED_SHORT_4_4_4_4 ) internalFormat = gl.RGB4;
			if ( glType === gl.UNSIGNED_INT_5_9_9_9_REV ) internalFormat = gl.RGB9_E5;

		}

		if ( glFormat === gl.RGB_INTEGER ) {

			if ( glType === gl.UNSIGNED_BYTE ) internalFormat = gl.RGB8UI;
			if ( glType === gl.UNSIGNED_SHORT ) internalFormat = gl.RGB16UI;
			if ( glType === gl.UNSIGNED_INT ) internalFormat = gl.RGB32UI;
			if ( glType === gl.BYTE ) internalFormat = gl.RGB8I;
			if ( glType === gl.SHORT ) internalFormat = gl.RGB16I;
			if ( glType === gl.INT ) internalFormat = gl.RGB32I;

		}

		if ( glFormat === gl.RGBA ) {

			if ( glType === gl.FLOAT ) internalFormat = gl.RGBA32F;
			if ( glType === gl.HALF_FLOAT ) internalFormat = gl.RGBA16F;
			if ( glType === gl.UNSIGNED_BYTE ) internalFormat = gl.RGBA8;
			if ( glType === gl.UNSIGNED_SHORT ) internalFormat = gl.RGBA16;
			if ( glType === gl.UNSIGNED_INT ) internalFormat = gl.RGBA32UI;
			if ( glType === gl.BYTE ) internalFormat = gl.RGBA8I;
			if ( glType === gl.SHORT ) internalFormat = gl.RGBA16I;
			if ( glType === gl.INT ) internalFormat = gl.RGBA32I;
			if ( glType === gl.UNSIGNED_BYTE ) internalFormat = ( colorSpace === SRGBColorSpace && forceLinearTransfer === false ) ? gl.SRGB8_ALPHA8 : gl.RGBA8;
			if ( glType === gl.UNSIGNED_SHORT_4_4_4_4 ) internalFormat = gl.RGBA4;
			if ( glType === gl.UNSIGNED_SHORT_5_5_5_1 ) internalFormat = gl.RGB5_A1;

		}

		if ( glFormat === gl.RGBA_INTEGER ) {

			if ( glType === gl.UNSIGNED_BYTE ) internalFormat = gl.RGBA8UI;
			if ( glType === gl.UNSIGNED_SHORT ) internalFormat = gl.RGBA16UI;
			if ( glType === gl.UNSIGNED_INT ) internalFormat = gl.RGBA32UI;
			if ( glType === gl.BYTE ) internalFormat = gl.RGBA8I;
			if ( glType === gl.SHORT ) internalFormat = gl.RGBA16I;
			if ( glType === gl.INT ) internalFormat = gl.RGBA32I;

		}

		if ( glFormat === gl.DEPTH_COMPONENT ) {

			if ( glType === gl.UNSIGNED_INT ) internalFormat = gl.DEPTH24_STENCIL8;
			if ( glType === gl.FLOAT ) internalFormat = gl.DEPTH_COMPONENT32F;

		}

		if ( glFormat === gl.DEPTH_STENCIL ) {

			if ( glType === gl.UNSIGNED_INT_24_8 ) internalFormat = gl.DEPTH24_STENCIL8;

		}

		if ( internalFormat === gl.R16F || internalFormat === gl.R32F ||
			internalFormat === gl.RG16F || internalFormat === gl.RG32F ||
			internalFormat === gl.RGBA16F || internalFormat === gl.RGBA32F ) {

			extensions.get( 'EXT_color_buffer_float' );

		}

		return internalFormat;

	}

	setTextureParameters( textureType, texture ) {

		const { gl, extensions, backend } = this;


		gl.pixelStorei( gl.UNPACK_FLIP_Y_WEBGL, texture.flipY );
		gl.pixelStorei( gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, texture.premultiplyAlpha );
		gl.pixelStorei( gl.UNPACK_ALIGNMENT, texture.unpackAlignment );
		gl.pixelStorei( gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE );

		gl.texParameteri( textureType, gl.TEXTURE_WRAP_S, wrappingToGL[ texture.wrapS ] );
		gl.texParameteri( textureType, gl.TEXTURE_WRAP_T, wrappingToGL[ texture.wrapT ] );

		if ( textureType === gl.TEXTURE_3D || textureType === gl.TEXTURE_2D_ARRAY ) {

			gl.texParameteri( textureType, gl.TEXTURE_WRAP_R, wrappingToGL[ texture.wrapR ] );

		}

		gl.texParameteri( textureType, gl.TEXTURE_MAG_FILTER, filterToGL[ texture.magFilter ] );


		const hasMipmaps = texture.mipmaps !== undefined && texture.mipmaps.length > 0;

		// follow WebGPU backend mapping for texture filtering
		const minFilter = texture.minFilter === LinearFilter && hasMipmaps ? LinearMipmapLinearFilter : texture.minFilter;

		gl.texParameteri( textureType, gl.TEXTURE_MIN_FILTER, filterToGL[ minFilter ] );

		if ( texture.compareFunction ) {

			gl.texParameteri( textureType, gl.TEXTURE_COMPARE_MODE, gl.COMPARE_REF_TO_TEXTURE );
			gl.texParameteri( textureType, gl.TEXTURE_COMPARE_FUNC, compareToGL[ texture.compareFunction ] );

		}

		if ( extensions.has( 'EXT_texture_filter_anisotropic' ) === true ) {

			if ( texture.magFilter === NearestFilter ) return;
			if ( texture.minFilter !== NearestMipmapLinearFilter && texture.minFilter !== LinearMipmapLinearFilter ) return;
			if ( texture.type === FloatType && extensions.has( 'OES_texture_float_linear' ) === false ) return; // verify extension for WebGL 1 and WebGL 2

			if ( texture.anisotropy > 1 ) {

				const extension = extensions.get( 'EXT_texture_filter_anisotropic' );
				gl.texParameterf( textureType, extension.TEXTURE_MAX_ANISOTROPY_EXT, Math.min( texture.anisotropy, backend.getMaxAnisotropy() ) );

			}

		}

	}

	createDefaultTexture( texture ) {

		const { gl, backend, defaultTextures } = this;


		const glTextureType = this.getGLTextureType( texture );

		let textureGPU = defaultTextures[ glTextureType ];

		if ( textureGPU === undefined ) {

			textureGPU = gl.createTexture();

			backend.state.bindTexture( glTextureType, textureGPU );
			gl.texParameteri( glTextureType, gl.TEXTURE_MIN_FILTER, gl.NEAREST );
			gl.texParameteri( glTextureType, gl.TEXTURE_MAG_FILTER, gl.NEAREST );

			// gl.texImage2D( glTextureType, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, data );

			defaultTextures[ glTextureType ] = textureGPU;

		}

		backend.set( texture, {
			textureGPU,
			glTextureType,
			isDefault: true
		} );

	}

	createTexture( texture, options ) {

		const { gl, backend } = this;
		const { levels, width, height, depth } = options;

		const glFormat = backend.utils.convert( texture.format, texture.colorSpace );
		const glType = backend.utils.convert( texture.type );
		const glInternalFormat = this.getInternalFormat( texture.internalFormat, glFormat, glType, texture.colorSpace, texture.isVideoTexture );

		const textureGPU = gl.createTexture();
		const glTextureType = this.getGLTextureType( texture );

		backend.state.bindTexture( glTextureType, textureGPU );

		this.setTextureParameters( glTextureType, texture );

		if ( texture.isDataArrayTexture || texture.isCompressedArrayTexture ) {

			gl.texStorage3D( gl.TEXTURE_2D_ARRAY, levels, glInternalFormat, width, height, depth );

		} else if ( texture.isData3DTexture ) {

			gl.texStorage3D( gl.TEXTURE_3D, levels, glInternalFormat, width, height, depth );

		} else if ( ! texture.isVideoTexture ) {

			gl.texStorage2D( glTextureType, levels, glInternalFormat, width, height );

		}

		backend.set( texture, {
			textureGPU,
			glTextureType,
			glFormat,
			glType,
			glInternalFormat
		} );

	}

	copyBufferToTexture( buffer, texture ) {

		const { gl, backend } = this;

		const { textureGPU, glTextureType, glFormat, glType } = backend.get( texture );

		const { width, height } = texture.source.data;

		gl.bindBuffer( gl.PIXEL_UNPACK_BUFFER, buffer );

		backend.state.bindTexture( glTextureType, textureGPU );

		gl.pixelStorei( gl.UNPACK_FLIP_Y_WEBGL, false );
		gl.pixelStorei( gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false );
		gl.texSubImage2D( glTextureType, 0, 0, 0, width, height, glFormat, glType, 0 );

		gl.bindBuffer( gl.PIXEL_UNPACK_BUFFER, null );

		backend.state.unbindTexture();
		// debug
		// const framebuffer = gl.createFramebuffer();
		// gl.bindFramebuffer( gl.FRAMEBUFFER, framebuffer );
		// gl.framebufferTexture2D( gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, glTextureType, textureGPU, 0 );

		// const readout = new Float32Array( width * height * 4 );

		// const altFormat = gl.getParameter( gl.IMPLEMENTATION_COLOR_READ_FORMAT );
		// const altType = gl.getParameter( gl.IMPLEMENTATION_COLOR_READ_TYPE );

		// gl.readPixels( 0, 0, width, height, altFormat, altType, readout );
		// gl.bindFramebuffer( gl.FRAMEBUFFER, null );
		// console.log( readout );

	}

	updateTexture( texture, options ) {

		const { gl } = this;
		const { width, height } = options;
		const { textureGPU, glTextureType, glFormat, glType, glInternalFormat } = this.backend.get( texture );

		if ( texture.isRenderTargetTexture || ( textureGPU === undefined /* unsupported texture format */ ) )
			return;

		const getImage = ( source ) => {

			if ( source.isDataTexture ) {

				return source.image.data;

			} else if ( ( typeof HTMLImageElement !== 'undefined' && source instanceof HTMLImageElement ) ||
				( typeof HTMLCanvasElement !== 'undefined' && source instanceof HTMLCanvasElement ) ||
				( typeof ImageBitmap !== 'undefined' && source instanceof ImageBitmap ) ||
				source instanceof OffscreenCanvas ) {

				return source;

			}

			return source.data;

		};

		this.backend.state.bindTexture( glTextureType, textureGPU );

		this.setTextureParameters( glTextureType, texture );

		if ( texture.isCompressedTexture ) {

			const mipmaps = texture.mipmaps;
			const image = options.image;

			for ( let i = 0; i < mipmaps.length; i ++ ) {

				const mipmap = mipmaps[ i ];

				if ( texture.isCompressedArrayTexture ) {


					if ( texture.format !== gl.RGBA ) {

						if ( glFormat !== null ) {

							gl.compressedTexSubImage3D( gl.TEXTURE_2D_ARRAY, i, 0, 0, 0, mipmap.width, mipmap.height, image.depth, glFormat, mipmap.data );

						} else {

							console.warn( 'THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()' );

						}

					} else {

						gl.texSubImage3D( gl.TEXTURE_2D_ARRAY, i, 0, 0, 0, mipmap.width, mipmap.height, image.depth, glFormat, glType, mipmap.data );

					}

				} else {

					if ( glFormat !== null ) {

						gl.compressedTexSubImage2D( gl.TEXTURE_2D, i, 0, 0, mipmap.width, mipmap.height, glFormat, mipmap.data );

					} else {

						console.warn( 'Unsupported compressed texture format' );

					}

				}

			}


		} else if ( texture.isCubeTexture ) {

			const images = options.images;

			for ( let i = 0; i < 6; i ++ ) {

				const image = getImage( images[ i ] );

				gl.texSubImage2D( gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, 0, 0, width, height, glFormat, glType, image );

			}

		} else if ( texture.isDataArrayTexture ) {

			const image = options.image;

			gl.texSubImage3D( gl.TEXTURE_2D_ARRAY, 0, 0, 0, 0, image.width, image.height, image.depth, glFormat, glType, image.data );

		} else if ( texture.isData3DTexture ) {

			const image = options.image;

			gl.texSubImage3D( gl.TEXTURE_3D, 0, 0, 0, 0, image.width, image.height, image.depth, glFormat, glType, image.data );

		} else if ( texture.isVideoTexture ) {

			texture.update();

			gl.texImage2D( glTextureType, 0, glInternalFormat, glFormat, glType, options.image );


		} else {

			const image = getImage( options.image );

			gl.texSubImage2D( glTextureType, 0, 0, 0, width, height, glFormat, glType, image );

		}

	}

	generateMipmaps( texture ) {

		const { gl, backend } = this;
		const { textureGPU, glTextureType } = backend.get( texture );

		backend.state.bindTexture( glTextureType, textureGPU );
		gl.generateMipmap( glTextureType );

	}

	deallocateRenderBuffers( renderTarget ) {

		const { gl, backend } = this;

		// remove framebuffer reference
		if ( renderTarget ) {

			const renderContextData = backend.get( renderTarget );

			renderContextData.renderBufferStorageSetup = undefined;

			if ( renderContextData.framebuffers ) {

				for ( const cacheKey in renderContextData.framebuffers ) {

					gl.deleteFramebuffer( renderContextData.framebuffers[ cacheKey ] );

				}

				delete renderContextData.framebuffers;

			}

			if ( renderContextData.depthRenderbuffer ) {

				gl.deleteRenderbuffer( renderContextData.depthRenderbuffer );
				delete renderContextData.depthRenderbuffer;

			}

			if ( renderContextData.stencilRenderbuffer ) {

				gl.deleteRenderbuffer( renderContextData.stencilRenderbuffer );
				delete renderContextData.stencilRenderbuffer;

			}

			if ( renderContextData.msaaFrameBuffer ) {

				gl.deleteFramebuffer( renderContextData.msaaFrameBuffer );
				delete renderContextData.msaaFrameBuffer;

			}

			if ( renderContextData.msaaRenderbuffers ) {

				for ( let i = 0; i < renderContextData.msaaRenderbuffers.length; i ++ ) {

					gl.deleteRenderbuffer( renderContextData.msaaRenderbuffers[ i ] );

				}

				delete renderContextData.msaaRenderbuffers;

			}

		}

	}

	destroyTexture( texture ) {

		const { gl, backend } = this;
		const { textureGPU, renderTarget } = backend.get( texture );

		this.deallocateRenderBuffers( renderTarget );
		gl.deleteTexture( textureGPU );

		backend.delete( texture );

	}

	copyTextureToTexture( srcTexture, dstTexture, srcRegion = null, dstPosition = null, level = 0 ) {

		const { gl, backend } = this;
		const { state } = this.backend;

		const { textureGPU: dstTextureGPU, glTextureType, glType, glFormat } = backend.get( dstTexture );

		let width, height, minX, minY;
		let dstX, dstY;

		if ( srcRegion !== null ) {

			width = srcRegion.max.x - srcRegion.min.x;
			height = srcRegion.max.y - srcRegion.min.y;
			minX = srcRegion.min.x;
			minY = srcRegion.min.y;

		} else {

			width = srcTexture.image.width;
			height = srcTexture.image.height;
			minX = 0;
			minY = 0;

		}

		if ( dstPosition !== null ) {

			dstX = dstPosition.x;
			dstY = dstPosition.y;

		} else {

			dstX = 0;
			dstY = 0;

		}

		state.bindTexture( glTextureType, dstTextureGPU );

		// As another texture upload may have changed pixelStorei
		// parameters, make sure they are correct for the dstTexture
		gl.pixelStorei( gl.UNPACK_ALIGNMENT, dstTexture.unpackAlignment );
		gl.pixelStorei( gl.UNPACK_FLIP_Y_WEBGL, dstTexture.flipY );
		gl.pixelStorei( gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, dstTexture.premultiplyAlpha );
		gl.pixelStorei( gl.UNPACK_ALIGNMENT, dstTexture.unpackAlignment );

		const currentUnpackRowLen = gl.getParameter( gl.UNPACK_ROW_LENGTH );
		const currentUnpackImageHeight = gl.getParameter( gl.UNPACK_IMAGE_HEIGHT );
		const currentUnpackSkipPixels = gl.getParameter( gl.UNPACK_SKIP_PIXELS );
		const currentUnpackSkipRows = gl.getParameter( gl.UNPACK_SKIP_ROWS );
		const currentUnpackSkipImages = gl.getParameter( gl.UNPACK_SKIP_IMAGES );

		const image = srcTexture.isCompressedTexture ? srcTexture.mipmaps[ level ] : srcTexture.image;

		gl.pixelStorei( gl.UNPACK_ROW_LENGTH, image.width );
		gl.pixelStorei( gl.UNPACK_IMAGE_HEIGHT, image.height );
		gl.pixelStorei( gl.UNPACK_SKIP_PIXELS, minX );
		gl.pixelStorei( gl.UNPACK_SKIP_ROWS, minY );

		if ( srcTexture.isRenderTargetTexture || srcTexture.isDepthTexture ) {

			const srcTextureData = backend.get( srcTexture );
			const dstTextureData = backend.get( dstTexture );

			const srcRenderContextData = backend.get( srcTextureData.renderTarget );
			const dstRenderContextData = backend.get( dstTextureData.renderTarget );

			const srcFramebuffer = srcRenderContextData.framebuffers[ srcTextureData.cacheKey ];
			const dstFramebuffer = dstRenderContextData.framebuffers[ dstTextureData.cacheKey ];

			state.bindFramebuffer( gl.READ_FRAMEBUFFER, srcFramebuffer );
			state.bindFramebuffer( gl.DRAW_FRAMEBUFFER, dstFramebuffer );

			let mask = gl.COLOR_BUFFER_BIT;

			if ( srcTexture.isDepthTexture ) mask = gl.DEPTH_BUFFER_BIT;

			gl.blitFramebuffer( minX, minY, width, height, dstX, dstY, width, height, mask, gl.NEAREST );

			state.bindFramebuffer( gl.READ_FRAMEBUFFER, null );
			state.bindFramebuffer( gl.DRAW_FRAMEBUFFER, null );

		} else {

			if ( srcTexture.isDataTexture ) {

				gl.texSubImage2D( gl.TEXTURE_2D, level, dstX, dstY, width, height, glFormat, glType, image.data );

			} else {

				if ( srcTexture.isCompressedTexture ) {

					gl.compressedTexSubImage2D( gl.TEXTURE_2D, level, dstX, dstY, image.width, image.height, glFormat, image.data );

				} else {

					gl.texSubImage2D( gl.TEXTURE_2D, level, dstX, dstY, width, height, glFormat, glType, image );

				}

			}

		}

		gl.pixelStorei( gl.UNPACK_ROW_LENGTH, currentUnpackRowLen );
		gl.pixelStorei( gl.UNPACK_IMAGE_HEIGHT, currentUnpackImageHeight );
		gl.pixelStorei( gl.UNPACK_SKIP_PIXELS, currentUnpackSkipPixels );
		gl.pixelStorei( gl.UNPACK_SKIP_ROWS, currentUnpackSkipRows );
		gl.pixelStorei( gl.UNPACK_SKIP_IMAGES, currentUnpackSkipImages );

		// Generate mipmaps only when copying level 0
		if ( level === 0 && dstTexture.generateMipmaps ) gl.generateMipmap( gl.TEXTURE_2D );

		state.unbindTexture();

	}

	copyFramebufferToTexture( texture, renderContext, rectangle ) {

		const { gl } = this;
		const { state } = this.backend;

		const { textureGPU } = this.backend.get( texture );

		const { x, y, z: width, w: height } = rectangle;

		const requireDrawFrameBuffer = texture.isDepthTexture === true || ( renderContext.renderTarget && renderContext.renderTarget.samples > 0 );

		const srcHeight = renderContext.renderTarget ? renderContext.renderTarget.height : this.backend.gerDrawingBufferSize().y;

		if ( requireDrawFrameBuffer ) {

			const partial = ( x !== 0 || y !== 0 );
			let mask;
			let attachment;

			if ( texture.isDepthTexture === true ) {

				mask = gl.DEPTH_BUFFER_BIT;
				attachment = gl.DEPTH_ATTACHMENT;

				if ( renderContext.stencil ) {

					mask |= gl.STENCIL_BUFFER_BIT;

				}

			} else {

				mask = gl.COLOR_BUFFER_BIT;
				attachment = gl.COLOR_ATTACHMENT0;

			}

			if ( partial ) {

				const renderTargetContextData = this.backend.get( renderContext.renderTarget );

				const fb = renderTargetContextData.framebuffers[ renderContext.getCacheKey() ];
				const msaaFrameBuffer = renderTargetContextData.msaaFrameBuffer;

				state.bindFramebuffer( gl.DRAW_FRAMEBUFFER, fb );
				state.bindFramebuffer( gl.READ_FRAMEBUFFER, msaaFrameBuffer );

				const flippedY = srcHeight - y - height;

				gl.blitFramebuffer( x, flippedY, x + width, flippedY + height, x, flippedY, x + width, flippedY + height, mask, gl.NEAREST );

				state.bindFramebuffer( gl.READ_FRAMEBUFFER, fb );

				state.bindTexture( gl.TEXTURE_2D, textureGPU );

				gl.copyTexSubImage2D( gl.TEXTURE_2D, 0, 0, 0, x, flippedY, width, height );

				state.unbindTexture();

			} else {

				const fb = gl.createFramebuffer();

				state.bindFramebuffer( gl.DRAW_FRAMEBUFFER, fb );

				gl.framebufferTexture2D( gl.DRAW_FRAMEBUFFER, attachment, gl.TEXTURE_2D, textureGPU, 0 );
				gl.blitFramebuffer( 0, 0, width, height, 0, 0, width, height, mask, gl.NEAREST );

				gl.deleteFramebuffer( fb );

			}

		} else {

			state.bindTexture( gl.TEXTURE_2D, textureGPU );
			gl.copyTexSubImage2D( gl.TEXTURE_2D, 0, 0, 0, x, srcHeight - height - y, width, height );

			state.unbindTexture();

		}

		if ( texture.generateMipmaps ) this.generateMipmaps( texture );

		this.backend._setFramebuffer( renderContext );

	}

	// Setup storage for internal depth/stencil buffers and bind to correct framebuffer
	setupRenderBufferStorage( renderbuffer, renderContext ) {

		const { gl } = this;
		const renderTarget = renderContext.renderTarget;

		const { samples, depthTexture, depthBuffer, stencilBuffer, width, height } = renderTarget;

		gl.bindRenderbuffer( gl.RENDERBUFFER, renderbuffer );

		if ( depthBuffer && ! stencilBuffer ) {

			let glInternalFormat = gl.DEPTH_COMPONENT24;

			if ( samples > 0 ) {

				if ( depthTexture && depthTexture.isDepthTexture ) {

					if ( depthTexture.type === gl.FLOAT ) {

						glInternalFormat = gl.DEPTH_COMPONENT32F;

					}

				}

				gl.renderbufferStorageMultisample( gl.RENDERBUFFER, samples, glInternalFormat, width, height );

			} else {

				gl.renderbufferStorage( gl.RENDERBUFFER, glInternalFormat, width, height );

			}

			gl.framebufferRenderbuffer( gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderbuffer );

		} else if ( depthBuffer && stencilBuffer ) {

			if ( samples > 0 ) {

				gl.renderbufferStorageMultisample( gl.RENDERBUFFER, samples, gl.DEPTH24_STENCIL8, width, height );

			} else {

				gl.renderbufferStorage( gl.RENDERBUFFER, gl.DEPTH_STENCIL, width, height );

			}


			gl.framebufferRenderbuffer( gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, renderbuffer );

		}

	}

	async copyTextureToBuffer( texture, x, y, width, height, faceIndex ) {

		const { backend, gl } = this;

		const { textureGPU, glFormat, glType } = this.backend.get( texture );

		const fb = gl.createFramebuffer();

		gl.bindFramebuffer( gl.READ_FRAMEBUFFER, fb );

		const target = texture.isCubeTexture ? gl.TEXTURE_CUBE_MAP_POSITIVE_X + faceIndex : gl.TEXTURE_2D;

		gl.framebufferTexture2D( gl.READ_FRAMEBUFFER, gl.COLOR_ATTACHMENT0, target, textureGPU, 0 );

		const typedArrayType = this._getTypedArrayType( glType );
		const bytesPerTexel = this._getBytesPerTexel( glType, glFormat );

		const elementCount = width * height;
		const byteLength = elementCount * bytesPerTexel;

		const buffer = gl.createBuffer();

		gl.bindBuffer( gl.PIXEL_PACK_BUFFER, buffer );
		gl.bufferData( gl.PIXEL_PACK_BUFFER, byteLength, gl.STREAM_READ );
		gl.readPixels( x, y, width, height, glFormat, glType, 0 );
		gl.bindBuffer( gl.PIXEL_PACK_BUFFER, null );

		await backend.utils._clientWaitAsync();

		const dstBuffer = new typedArrayType( byteLength / typedArrayType.BYTES_PER_ELEMENT );

		gl.bindBuffer( gl.PIXEL_PACK_BUFFER, buffer );
		gl.getBufferSubData( gl.PIXEL_PACK_BUFFER, 0, dstBuffer );
		gl.bindBuffer( gl.PIXEL_PACK_BUFFER, null );

		gl.deleteFramebuffer( fb );

		return dstBuffer;

	}

	_getTypedArrayType( glType ) {

		const { gl } = this;

		if ( glType === gl.UNSIGNED_BYTE ) return Uint8Array;

		if ( glType === gl.UNSIGNED_SHORT_4_4_4_4 ) return Uint16Array;
		if ( glType === gl.UNSIGNED_SHORT_5_5_5_1 ) return Uint16Array;
		if ( glType === gl.UNSIGNED_SHORT_5_6_5 ) return Uint16Array;
		if ( glType === gl.UNSIGNED_SHORT ) return Uint16Array;
		if ( glType === gl.UNSIGNED_INT ) return Uint32Array;

		if ( glType === gl.HALF_FLOAT ) return Uint16Array;
		if ( glType === gl.FLOAT ) return Float32Array;

		throw new Error( `Unsupported WebGL type: ${glType}` );

	}

	_getBytesPerTexel( glType, glFormat ) {

		const { gl } = this;

		let bytesPerComponent = 0;

		if ( glType === gl.UNSIGNED_BYTE ) bytesPerComponent = 1;

		if ( glType === gl.UNSIGNED_SHORT_4_4_4_4 ||
			glType === gl.UNSIGNED_SHORT_5_5_5_1 ||
			glType === gl.UNSIGNED_SHORT_5_6_5 ||
			glType === gl.UNSIGNED_SHORT ||
			glType === gl.HALF_FLOAT ) bytesPerComponent = 2;

		if ( glType === gl.UNSIGNED_INT ||
			glType === gl.FLOAT ) bytesPerComponent = 4;

		if ( glFormat === gl.RGBA ) return bytesPerComponent * 4;
		if ( glFormat === gl.RGB ) return bytesPerComponent * 3;
		if ( glFormat === gl.ALPHA ) return bytesPerComponent;

	}

}

export default WebGLTextureUtils;
