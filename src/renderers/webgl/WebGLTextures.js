/**
 * @author mrdoob / http://mrdoob.com/
 */

import { LinearFilter, NearestFilter, RGBFormat, RGBAFormat, DepthFormat, DepthStencilFormat, UnsignedShortType, UnsignedIntType, UnsignedInt248Type, FloatType, HalfFloatType, ClampToEdgeWrapping, NearestMipMapLinearFilter, NearestMipMapNearestFilter } from '../../constants.js';
import { _Math } from '../../math/Math.js';

function WebGLTextures( _gl, extensions, state, properties, capabilities, utils, info ) {

	var _videoTextures = {};
	var _canvas;

	//

	function resizeImage( image, needsPowerOfTwo, needsNewCanvas, maxSize ) {

		var scale = 1;

		// handle case if texture exceeds max size

		if ( image.width > maxSize || image.height > maxSize ) {

			scale = maxSize / Math.max( image.width, image.height );

		}

		// only perform resize if necessary

		if ( scale < 1 || needsPowerOfTwo === true ) {

			// only perform resize for certain image types

			if ( image instanceof HTMLImageElement || image instanceof HTMLCanvasElement || image instanceof ImageBitmap ) {

				if ( _canvas === undefined ) _canvas = document.createElementNS( 'http://www.w3.org/1999/xhtml', 'canvas' );

				// cube textures can't reuse the same canvas

				var canvas = needsNewCanvas ? document.createElementNS( 'http://www.w3.org/1999/xhtml', 'canvas' ) : _canvas;

				var floor = needsPowerOfTwo ? _Math.floorPowerOfTwo : Math.floor;

				canvas.width = floor( scale * image.width );
				canvas.height = floor( scale * image.height );

				var context = canvas.getContext( '2d' );
				context.drawImage( image, 0, 0, canvas.width, canvas.height );

				console.warn( 'THREE.WebGLRenderer: Texture has been resized from (' + image.width + 'x' + image.height + ') to (' + canvas.width + 'x' + canvas.height + ').' );

				return canvas;

			} else {

				if ( 'data' in image ) {

					console.warn( 'THREE.WebGLRenderer: Image in DataTexture is too big (' + image.width + 'x' + image.height + ').' );

				}

				return image;

			}

		}

		return image;

	}

	function isPowerOfTwo( image ) {

		return _Math.isPowerOfTwo( image.width ) && _Math.isPowerOfTwo( image.height );

	}

	function textureNeedsPowerOfTwo( texture ) {

		if ( capabilities.isWebGL2 ) return false;

		return ( texture.wrapS !== ClampToEdgeWrapping || texture.wrapT !== ClampToEdgeWrapping ) ||
			( texture.minFilter !== NearestFilter && texture.minFilter !== LinearFilter );

	}

	function textureNeedsGenerateMipmaps( texture, supportsMips ) {

		return texture.generateMipmaps && supportsMips &&
			texture.minFilter !== NearestFilter && texture.minFilter !== LinearFilter;

	}

	function generateMipmap( target, texture, width, height ) {

		_gl.generateMipmap( target );

		var textureProperties = properties.get( texture );

		// Note: Math.log( x ) * Math.LOG2E used instead of Math.log2( x ) which is not supported by IE11
		textureProperties.__maxMipLevel = Math.log( Math.max( width, height ) ) * Math.LOG2E;

	}

	function getInternalFormat( glFormat, glType ) {

		if ( ! capabilities.isWebGL2 ) return glFormat;

		var internalFormat = glFormat;

		if ( glFormat === _gl.RED ) {

			if ( glType === _gl.FLOAT ) internalFormat = _gl.R32F;
			if ( glType === _gl.HALF_FLOAT ) internalFormat = _gl.R16F;
			if ( glType === _gl.UNSIGNED_BYTE ) internalFormat = _gl.R8;

		}

		if ( glFormat === _gl.RGB ) {

			if ( glType === _gl.FLOAT ) internalFormat = _gl.RGB32F;
			if ( glType === _gl.HALF_FLOAT ) internalFormat = _gl.RGB16F;
			if ( glType === _gl.UNSIGNED_BYTE ) internalFormat = _gl.RGB8;

		}

		if ( glFormat === _gl.RGBA ) {

			if ( glType === _gl.FLOAT ) internalFormat = _gl.RGBA32F;
			if ( glType === _gl.HALF_FLOAT ) internalFormat = _gl.RGBA16F;
			if ( glType === _gl.UNSIGNED_BYTE ) internalFormat = _gl.RGBA8;

		}

		if ( internalFormat === _gl.R16F || internalFormat === _gl.R32F ||
			internalFormat === _gl.RGBA16F || internalFormat === _gl.RGBA32F ) {

			extensions.get( 'EXT_color_buffer_float' );

		} else if ( internalFormat === _gl.RGB16F || internalFormat === _gl.RGB32F ) {

			console.warn( 'THREE.WebGLRenderer: Floating point textures with RGB format not supported. Please use RGBA instead.' );

		}

		return internalFormat;

	}

	// Fallback filters for non-power-of-2 textures

	function filterFallback( f ) {

		if ( f === NearestFilter || f === NearestMipMapNearestFilter || f === NearestMipMapLinearFilter ) {

			return _gl.NEAREST;

		}

		return _gl.LINEAR;

	}

	//

	function onTextureDispose( event ) {

		var texture = event.target;

		texture.removeEventListener( 'dispose', onTextureDispose );

		deallocateTexture( texture );

		if ( texture.isVideoTexture ) {

			delete _videoTextures[ texture.id ];

		}

		info.memory.textures --;

	}

	function onRenderTargetDispose( event ) {

		var renderTarget = event.target;

		renderTarget.removeEventListener( 'dispose', onRenderTargetDispose );

		deallocateRenderTarget( renderTarget );

		info.memory.textures --;

	}

	//

	function deallocateTexture( texture ) {

		var textureProperties = properties.get( texture );

		if ( texture.image && textureProperties.__image__webglTextureCube ) {

			// cube texture

			_gl.deleteTexture( textureProperties.__image__webglTextureCube );

		} else {

			// 2D texture

			if ( textureProperties.__webglInit === undefined ) return;

			_gl.deleteTexture( textureProperties.__webglTexture );

		}

		// remove all webgl properties
		properties.remove( texture );

	}

	function deallocateRenderTarget( renderTarget ) {

		var renderTargetProperties = properties.get( renderTarget );
		var textureProperties = properties.get( renderTarget.texture );

		if ( ! renderTarget ) return;

		if ( textureProperties.__webglTexture !== undefined ) {

			_gl.deleteTexture( textureProperties.__webglTexture );

		}

		if ( renderTarget.depthTexture ) {

			renderTarget.depthTexture.dispose();

		}

		if ( renderTarget.isWebGLRenderTargetCube ) {

			for ( var i = 0; i < 6; i ++ ) {

				_gl.deleteFramebuffer( renderTargetProperties.__webglFramebuffer[ i ] );
				if ( renderTargetProperties.__webglDepthbuffer ) _gl.deleteRenderbuffer( renderTargetProperties.__webglDepthbuffer[ i ] );

			}

		} else {

			_gl.deleteFramebuffer( renderTargetProperties.__webglFramebuffer );
			if ( renderTargetProperties.__webglDepthbuffer ) _gl.deleteRenderbuffer( renderTargetProperties.__webglDepthbuffer );

		}

		properties.remove( renderTarget.texture );
		properties.remove( renderTarget );

	}

	//



	function setTexture2D( texture, slot ) {

		var textureProperties = properties.get( texture );

		if ( texture.isVideoTexture ) updateVideoTexture( texture );

		if ( texture.version > 0 && textureProperties.__version !== texture.version ) {

			var image = texture.image;

			if ( image === undefined ) {

				console.warn( 'THREE.WebGLRenderer: Texture marked for update but image is undefined' );

			} else if ( image.complete === false ) {

				console.warn( 'THREE.WebGLRenderer: Texture marked for update but image is incomplete' );

			} else {

				uploadTexture( textureProperties, texture, slot );
				return;

			}

		}

		state.activeTexture( _gl.TEXTURE0 + slot );
		state.bindTexture( _gl.TEXTURE_2D, textureProperties.__webglTexture );

	}

	function setTexture3D( texture, slot ) {

		var textureProperties = properties.get( texture );

		if ( texture.version > 0 && textureProperties.__version !== texture.version ) {

			uploadTexture( textureProperties, texture, slot );
			return;

		}

		state.activeTexture( _gl.TEXTURE0 + slot );
		state.bindTexture( _gl.TEXTURE_3D, textureProperties.__webglTexture );

	}


	function setTextureCube( texture, slot ) {

		var textureProperties = properties.get( texture );

		if ( texture.image.length === 6 ) {

			if ( texture.version > 0 && textureProperties.__version !== texture.version ) {

				if ( ! textureProperties.__image__webglTextureCube ) {

					texture.addEventListener( 'dispose', onTextureDispose );

					textureProperties.__image__webglTextureCube = _gl.createTexture();

					info.memory.textures ++;

				}

				state.activeTexture( _gl.TEXTURE0 + slot );
				state.bindTexture( _gl.TEXTURE_CUBE_MAP, textureProperties.__image__webglTextureCube );

				_gl.pixelStorei( _gl.UNPACK_FLIP_Y_WEBGL, texture.flipY );

				var isCompressed = ( texture && texture.isCompressedTexture );
				var isDataTexture = ( texture.image[ 0 ] && texture.image[ 0 ].isDataTexture );

				var cubeImage = [];

				for ( var i = 0; i < 6; i ++ ) {

					if ( ! isCompressed && ! isDataTexture ) {

						cubeImage[ i ] = resizeImage( texture.image[ i ], false, true, capabilities.maxCubemapSize );

					} else {

						cubeImage[ i ] = isDataTexture ? texture.image[ i ].image : texture.image[ i ];

					}

				}

				var image = cubeImage[ 0 ],
					supportsMips = isPowerOfTwo( image ) || capabilities.isWebGL2,
					glFormat = utils.convert( texture.format ),
					glType = utils.convert( texture.type ),
					glInternalFormat = getInternalFormat( glFormat, glType );

				setTextureParameters( _gl.TEXTURE_CUBE_MAP, texture, supportsMips );

				for ( var i = 0; i < 6; i ++ ) {

					if ( ! isCompressed ) {

						if ( isDataTexture ) {

							state.texImage2D( _gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, glInternalFormat, cubeImage[ i ].width, cubeImage[ i ].height, 0, glFormat, glType, cubeImage[ i ].data );

						} else {

							state.texImage2D( _gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, glInternalFormat, glFormat, glType, cubeImage[ i ] );

						}

					} else {

						var mipmap, mipmaps = cubeImage[ i ].mipmaps;

						for ( var j = 0, jl = mipmaps.length; j < jl; j ++ ) {

							mipmap = mipmaps[ j ];

							if ( texture.format !== RGBAFormat && texture.format !== RGBFormat ) {

								if ( state.getCompressedTextureFormats().indexOf( glFormat ) > - 1 ) {

									state.compressedTexImage2D( _gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, j, glInternalFormat, mipmap.width, mipmap.height, 0, mipmap.data );

								} else {

									console.warn( 'THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()' );

								}

							} else {

								state.texImage2D( _gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, j, glInternalFormat, mipmap.width, mipmap.height, 0, glFormat, glType, mipmap.data );

							}

						}

					}

				}

				if ( ! isCompressed ) {

					textureProperties.__maxMipLevel = 0;

				} else {

					textureProperties.__maxMipLevel = mipmaps.length - 1;

				}

				if ( textureNeedsGenerateMipmaps( texture, supportsMips ) ) {

					// We assume images for cube map have the same size.
					generateMipmap( _gl.TEXTURE_CUBE_MAP, texture, image.width, image.height );

				}

				textureProperties.__version = texture.version;

				if ( texture.onUpdate ) texture.onUpdate( texture );

			} else {

				state.activeTexture( _gl.TEXTURE0 + slot );
				state.bindTexture( _gl.TEXTURE_CUBE_MAP, textureProperties.__image__webglTextureCube );

			}

		}

	}

	function setTextureCubeDynamic( texture, slot ) {

		state.activeTexture( _gl.TEXTURE0 + slot );
		state.bindTexture( _gl.TEXTURE_CUBE_MAP, properties.get( texture ).__webglTexture );

	}

	function setTextureParameters( textureType, texture, supportsMips ) {

		var extension;

		if ( supportsMips ) {

			_gl.texParameteri( textureType, _gl.TEXTURE_WRAP_S, utils.convert( texture.wrapS ) );
			_gl.texParameteri( textureType, _gl.TEXTURE_WRAP_T, utils.convert( texture.wrapT ) );

			_gl.texParameteri( textureType, _gl.TEXTURE_MAG_FILTER, utils.convert( texture.magFilter ) );
			_gl.texParameteri( textureType, _gl.TEXTURE_MIN_FILTER, utils.convert( texture.minFilter ) );

		} else {

			_gl.texParameteri( textureType, _gl.TEXTURE_WRAP_S, _gl.CLAMP_TO_EDGE );
			_gl.texParameteri( textureType, _gl.TEXTURE_WRAP_T, _gl.CLAMP_TO_EDGE );

			if ( texture.wrapS !== ClampToEdgeWrapping || texture.wrapT !== ClampToEdgeWrapping ) {

				console.warn( 'THREE.WebGLRenderer: Texture is not power of two. Texture.wrapS and Texture.wrapT should be set to THREE.ClampToEdgeWrapping.' );

			}

			_gl.texParameteri( textureType, _gl.TEXTURE_MAG_FILTER, filterFallback( texture.magFilter ) );
			_gl.texParameteri( textureType, _gl.TEXTURE_MIN_FILTER, filterFallback( texture.minFilter ) );

			if ( texture.minFilter !== NearestFilter && texture.minFilter !== LinearFilter ) {

				console.warn( 'THREE.WebGLRenderer: Texture is not power of two. Texture.minFilter should be set to THREE.NearestFilter or THREE.LinearFilter.' );

			}

		}

		extension = extensions.get( 'EXT_texture_filter_anisotropic' );

		if ( extension ) {

			if ( texture.type === FloatType && extensions.get( 'OES_texture_float_linear' ) === null ) return;
			if ( texture.type === HalfFloatType && ( capabilities.isWebGL2 || extensions.get( 'OES_texture_half_float_linear' ) ) === null ) return;

			if ( texture.anisotropy > 1 || properties.get( texture ).__currentAnisotropy ) {

				_gl.texParameterf( textureType, extension.TEXTURE_MAX_ANISOTROPY_EXT, Math.min( texture.anisotropy, capabilities.getMaxAnisotropy() ) );
				properties.get( texture ).__currentAnisotropy = texture.anisotropy;

			}

		}

	}

	function uploadTexture( textureProperties, texture, slot ) {

		var textureType;

		if ( texture.isDataTexture3D ) {

			textureType = _gl.TEXTURE_3D;

		} else {

			textureType = _gl.TEXTURE_2D;

		}


		if ( textureProperties.__webglInit === undefined ) {

			textureProperties.__webglInit = true;

			texture.addEventListener( 'dispose', onTextureDispose );

			textureProperties.__webglTexture = _gl.createTexture();

			info.memory.textures ++;

		}
		state.activeTexture( _gl.TEXTURE0 + slot );


		state.bindTexture( textureType, textureProperties.__webglTexture );



		_gl.pixelStorei( _gl.UNPACK_FLIP_Y_WEBGL, texture.flipY );
		_gl.pixelStorei( _gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, texture.premultiplyAlpha );
		_gl.pixelStorei( _gl.UNPACK_ALIGNMENT, texture.unpackAlignment );

		var needsPowerOfTwo = textureNeedsPowerOfTwo( texture ) && isPowerOfTwo( texture.image ) === false;
		var image = resizeImage( texture.image, needsPowerOfTwo, false, capabilities.maxTextureSize );

		var supportsMips = isPowerOfTwo( image ) || capabilities.isWebGL2,
			glFormat = utils.convert( texture.format ),
			glType = utils.convert( texture.type ),
			glInternalFormat = getInternalFormat( glFormat, glType );

		setTextureParameters( textureType, texture, supportsMips );

		var mipmap, mipmaps = texture.mipmaps;

		if ( texture.isDepthTexture ) {

			// populate depth texture with dummy data

			glInternalFormat = _gl.DEPTH_COMPONENT;

			if ( texture.type === FloatType ) {

				if ( ! capabilities.isWebGL2 ) throw new Error( 'Float Depth Texture only supported in WebGL2.0' );
				glInternalFormat = _gl.DEPTH_COMPONENT32F;

			} else if ( capabilities.isWebGL2 ) {

				// WebGL 2.0 requires signed internalformat for glTexImage2D
				glInternalFormat = _gl.DEPTH_COMPONENT16;

			}

			if ( texture.format === DepthFormat && glInternalFormat === _gl.DEPTH_COMPONENT ) {

				// The error INVALID_OPERATION is generated by texImage2D if format and internalformat are
				// DEPTH_COMPONENT and type is not UNSIGNED_SHORT or UNSIGNED_INT
				// (https://www.khronos.org/registry/webgl/extensions/WEBGL_depth_texture/)
				if ( texture.type !== UnsignedShortType && texture.type !== UnsignedIntType ) {

					console.warn( 'THREE.WebGLRenderer: Use UnsignedShortType or UnsignedIntType for DepthFormat DepthTexture.' );

					texture.type = UnsignedShortType;
					glType = utils.convert( texture.type );

				}

			}

			// Depth stencil textures need the DEPTH_STENCIL internal format
			// (https://www.khronos.org/registry/webgl/extensions/WEBGL_depth_texture/)
			if ( texture.format === DepthStencilFormat ) {

				glInternalFormat = _gl.DEPTH_STENCIL;

				// The error INVALID_OPERATION is generated by texImage2D if format and internalformat are
				// DEPTH_STENCIL and type is not UNSIGNED_INT_24_8_WEBGL.
				// (https://www.khronos.org/registry/webgl/extensions/WEBGL_depth_texture/)
				if ( texture.type !== UnsignedInt248Type ) {

					console.warn( 'THREE.WebGLRenderer: Use UnsignedInt248Type for DepthStencilFormat DepthTexture.' );

					texture.type = UnsignedInt248Type;
					glType = utils.convert( texture.type );

				}

			}

			state.texImage2D( _gl.TEXTURE_2D, 0, glInternalFormat, image.width, image.height, 0, glFormat, glType, null );

		} else if ( texture.isDataTexture ) {

			// use manually created mipmaps if available
			// if there are no manual mipmaps
			// set 0 level mipmap and then use GL to generate other mipmap levels

			if ( mipmaps.length > 0 && supportsMips ) {

				for ( var i = 0, il = mipmaps.length; i < il; i ++ ) {

					mipmap = mipmaps[ i ];
					state.texImage2D( _gl.TEXTURE_2D, i, glInternalFormat, mipmap.width, mipmap.height, 0, glFormat, glType, mipmap.data );

				}

				texture.generateMipmaps = false;
				textureProperties.__maxMipLevel = mipmaps.length - 1;

			} else {

				state.texImage2D( _gl.TEXTURE_2D, 0, glInternalFormat, image.width, image.height, 0, glFormat, glType, image.data );
				textureProperties.__maxMipLevel = 0;

			}

		} else if ( texture.isCompressedTexture ) {

			for ( var i = 0, il = mipmaps.length; i < il; i ++ ) {

				mipmap = mipmaps[ i ];

				if ( texture.format !== RGBAFormat && texture.format !== RGBFormat ) {

					if ( state.getCompressedTextureFormats().indexOf( glFormat ) > - 1 ) {

						state.compressedTexImage2D( _gl.TEXTURE_2D, i, glInternalFormat, mipmap.width, mipmap.height, 0, mipmap.data );

					} else {

						console.warn( 'THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()' );

					}

				} else {

					state.texImage2D( _gl.TEXTURE_2D, i, glInternalFormat, mipmap.width, mipmap.height, 0, glFormat, glType, mipmap.data );

				}

			}

			textureProperties.__maxMipLevel = mipmaps.length - 1;

		} else if ( texture.isDataTexture3D ) {

			state.texImage3D( _gl.TEXTURE_3D, 0, glInternalFormat, image.width, image.height, image.depth, 0, glFormat, glType, image.data );
			textureProperties.__maxMipLevel = 0;

		} else {

			// regular Texture (image, video, canvas)

			// use manually created mipmaps if available
			// if there are no manual mipmaps
			// set 0 level mipmap and then use GL to generate other mipmap levels

			if ( mipmaps.length > 0 && supportsMips ) {

				for ( var i = 0, il = mipmaps.length; i < il; i ++ ) {

					mipmap = mipmaps[ i ];
					state.texImage2D( _gl.TEXTURE_2D, i, glInternalFormat, glFormat, glType, mipmap );

				}

				texture.generateMipmaps = false;
				textureProperties.__maxMipLevel = mipmaps.length - 1;

			} else {

				state.texImage2D( _gl.TEXTURE_2D, 0, glInternalFormat, glFormat, glType, image );
				textureProperties.__maxMipLevel = 0;

			}

		}

		if ( textureNeedsGenerateMipmaps( texture, supportsMips ) ) {

			generateMipmap( _gl.TEXTURE_2D, texture, image.width, image.height );

		}

		textureProperties.__version = texture.version;

		if ( texture.onUpdate ) texture.onUpdate( texture );

	}

	// Render targets

	// Setup storage for target texture and bind it to correct framebuffer
	function setupFrameBufferTexture( framebuffer, renderTarget, attachment, textureTarget ) {

		var glFormat = utils.convert( renderTarget.texture.format );
		var glType = utils.convert( renderTarget.texture.type );
		var glInternalFormat = getInternalFormat( glFormat, glType );
		state.texImage2D( textureTarget, 0, glInternalFormat, renderTarget.width, renderTarget.height, 0, glFormat, glType, null );
		_gl.bindFramebuffer( _gl.FRAMEBUFFER, framebuffer );
		_gl.framebufferTexture2D( _gl.FRAMEBUFFER, attachment, textureTarget, properties.get( renderTarget.texture ).__webglTexture, 0 );
		_gl.bindFramebuffer( _gl.FRAMEBUFFER, null );

	}

	// Setup storage for internal depth/stencil buffers and bind to correct framebuffer
	function setupRenderBufferStorage( renderbuffer, renderTarget, isMultisample ) {

		_gl.bindRenderbuffer( _gl.RENDERBUFFER, renderbuffer );

		if ( renderTarget.depthBuffer && ! renderTarget.stencilBuffer ) {

			if ( isMultisample ) {

				var samples = getRenderTargetSamples( renderTarget );

				_gl.renderbufferStorageMultisample( _gl.RENDERBUFFER, samples, _gl.DEPTH_COMPONENT16, renderTarget.width, renderTarget.height );

			} else {

				_gl.renderbufferStorage( _gl.RENDERBUFFER, _gl.DEPTH_COMPONENT16, renderTarget.width, renderTarget.height );

			}

			_gl.framebufferRenderbuffer( _gl.FRAMEBUFFER, _gl.DEPTH_ATTACHMENT, _gl.RENDERBUFFER, renderbuffer );

		} else if ( renderTarget.depthBuffer && renderTarget.stencilBuffer ) {

			if ( isMultisample ) {

				var samples = getRenderTargetSamples( renderTarget );

				_gl.renderbufferStorageMultisample( _gl.RENDERBUFFER, samples, _gl.DEPTH_STENCIL, renderTarget.width, renderTarget.height );

			} else {

				_gl.renderbufferStorage( _gl.RENDERBUFFER, _gl.DEPTH_STENCIL, renderTarget.width, renderTarget.height );

			}


			_gl.framebufferRenderbuffer( _gl.FRAMEBUFFER, _gl.DEPTH_STENCIL_ATTACHMENT, _gl.RENDERBUFFER, renderbuffer );

		} else {

			var glFormat = utils.convert( renderTarget.texture.format );
			var glType = utils.convert( renderTarget.texture.type );
			var glInternalFormat = getInternalFormat( glFormat, glType );

			if ( isMultisample ) {

				var samples = getRenderTargetSamples( renderTarget );

				_gl.renderbufferStorageMultisample( _gl.RENDERBUFFER, samples, glInternalFormat, renderTarget.width, renderTarget.height );

			} else {

				_gl.renderbufferStorage( _gl.RENDERBUFFER, glInternalFormat, renderTarget.width, renderTarget.height );

			}

		}

		_gl.bindRenderbuffer( _gl.RENDERBUFFER, null );

	}

	// Setup resources for a Depth Texture for a FBO (needs an extension)
	function setupDepthTexture( framebuffer, renderTarget ) {

		var isCube = ( renderTarget && renderTarget.isWebGLRenderTargetCube );
		if ( isCube ) throw new Error( 'Depth Texture with cube render targets is not supported' );

		_gl.bindFramebuffer( _gl.FRAMEBUFFER, framebuffer );

		if ( ! ( renderTarget.depthTexture && renderTarget.depthTexture.isDepthTexture ) ) {

			throw new Error( 'renderTarget.depthTexture must be an instance of THREE.DepthTexture' );

		}

		// upload an empty depth texture with framebuffer size
		if ( ! properties.get( renderTarget.depthTexture ).__webglTexture ||
				renderTarget.depthTexture.image.width !== renderTarget.width ||
				renderTarget.depthTexture.image.height !== renderTarget.height ) {

			renderTarget.depthTexture.image.width = renderTarget.width;
			renderTarget.depthTexture.image.height = renderTarget.height;
			renderTarget.depthTexture.needsUpdate = true;

		}

		setTexture2D( renderTarget.depthTexture, 0 );

		var webglDepthTexture = properties.get( renderTarget.depthTexture ).__webglTexture;

		if ( renderTarget.depthTexture.format === DepthFormat ) {

			_gl.framebufferTexture2D( _gl.FRAMEBUFFER, _gl.DEPTH_ATTACHMENT, _gl.TEXTURE_2D, webglDepthTexture, 0 );

		} else if ( renderTarget.depthTexture.format === DepthStencilFormat ) {

			_gl.framebufferTexture2D( _gl.FRAMEBUFFER, _gl.DEPTH_STENCIL_ATTACHMENT, _gl.TEXTURE_2D, webglDepthTexture, 0 );

		} else {

			throw new Error( 'Unknown depthTexture format' );

		}

	}

	// Setup GL resources for a non-texture depth buffer
	function setupDepthRenderbuffer( renderTarget ) {

		var renderTargetProperties = properties.get( renderTarget );

		var isCube = ( renderTarget.isWebGLRenderTargetCube === true );

		if ( renderTarget.depthTexture ) {

			if ( isCube ) throw new Error( 'target.depthTexture not supported in Cube render targets' );

			setupDepthTexture( renderTargetProperties.__webglFramebuffer, renderTarget );

		} else {

			if ( isCube ) {

				renderTargetProperties.__webglDepthbuffer = [];

				for ( var i = 0; i < 6; i ++ ) {

					_gl.bindFramebuffer( _gl.FRAMEBUFFER, renderTargetProperties.__webglFramebuffer[ i ] );
					renderTargetProperties.__webglDepthbuffer[ i ] = _gl.createRenderbuffer();
					setupRenderBufferStorage( renderTargetProperties.__webglDepthbuffer[ i ], renderTarget );

				}

			} else {

				_gl.bindFramebuffer( _gl.FRAMEBUFFER, renderTargetProperties.__webglFramebuffer );
				renderTargetProperties.__webglDepthbuffer = _gl.createRenderbuffer();
				setupRenderBufferStorage( renderTargetProperties.__webglDepthbuffer, renderTarget );

			}

		}

		_gl.bindFramebuffer( _gl.FRAMEBUFFER, null );

	}

	// Set up GL resources for the render target
	function setupRenderTarget( renderTarget ) {

		var renderTargetProperties = properties.get( renderTarget );
		var textureProperties = properties.get( renderTarget.texture );

		renderTarget.addEventListener( 'dispose', onRenderTargetDispose );

		textureProperties.__webglTexture = _gl.createTexture();

		info.memory.textures ++;

		var isCube = ( renderTarget.isWebGLRenderTargetCube === true );
		var isMultisample = ( renderTarget.isWebGLMultisampleRenderTarget === true );
		var supportsMips = isPowerOfTwo( renderTarget ) || capabilities.isWebGL2;

		// Setup framebuffer

		if ( isCube ) {

			renderTargetProperties.__webglFramebuffer = [];

			for ( var i = 0; i < 6; i ++ ) {

				renderTargetProperties.__webglFramebuffer[ i ] = _gl.createFramebuffer();

			}

		} else {

			renderTargetProperties.__webglFramebuffer = _gl.createFramebuffer();

			if ( isMultisample ) {

				if ( capabilities.isWebGL2 ) {

					renderTargetProperties.__webglMultisampledFramebuffer = _gl.createFramebuffer();
					renderTargetProperties.__webglColorRenderbuffer = _gl.createRenderbuffer();

					_gl.bindRenderbuffer( _gl.RENDERBUFFER, renderTargetProperties.__webglColorRenderbuffer );
					var glFormat = utils.convert( renderTarget.texture.format );
					var glType = utils.convert( renderTarget.texture.type );
					var glInternalFormat = getInternalFormat( glFormat, glType );
					var samples = getRenderTargetSamples( renderTarget );
					_gl.renderbufferStorageMultisample( _gl.RENDERBUFFER, samples, glInternalFormat, renderTarget.width, renderTarget.height );

					_gl.bindFramebuffer( _gl.FRAMEBUFFER, renderTargetProperties.__webglMultisampledFramebuffer );
					_gl.framebufferRenderbuffer( _gl.FRAMEBUFFER, _gl.COLOR_ATTACHMENT0, _gl.RENDERBUFFER, renderTargetProperties.__webglColorRenderbuffer );
					_gl.bindRenderbuffer( _gl.RENDERBUFFER, null );

					if ( renderTarget.depthBuffer ) {

						renderTargetProperties.__webglDepthRenderbuffer = _gl.createRenderbuffer();
						setupRenderBufferStorage( renderTargetProperties.__webglDepthRenderbuffer, renderTarget, true );

					}

					_gl.bindFramebuffer( _gl.FRAMEBUFFER, null );


				} else {

					console.warn( 'THREE.WebGLRenderer: WebGLMultisampleRenderTarget can only be used with WebGL2.' );

				}

			}

		}

		// Setup color buffer

		if ( isCube ) {

			state.bindTexture( _gl.TEXTURE_CUBE_MAP, textureProperties.__webglTexture );
			setTextureParameters( _gl.TEXTURE_CUBE_MAP, renderTarget.texture, supportsMips );

			for ( var i = 0; i < 6; i ++ ) {

				setupFrameBufferTexture( renderTargetProperties.__webglFramebuffer[ i ], renderTarget, _gl.COLOR_ATTACHMENT0, _gl.TEXTURE_CUBE_MAP_POSITIVE_X + i );

			}

			if ( textureNeedsGenerateMipmaps( renderTarget.texture, supportsMips ) ) {

				generateMipmap( _gl.TEXTURE_CUBE_MAP, renderTarget.texture, renderTarget.width, renderTarget.height );

			}

			state.bindTexture( _gl.TEXTURE_CUBE_MAP, null );

		} else {

			state.bindTexture( _gl.TEXTURE_2D, textureProperties.__webglTexture );
			setTextureParameters( _gl.TEXTURE_2D, renderTarget.texture, supportsMips );
			setupFrameBufferTexture( renderTargetProperties.__webglFramebuffer, renderTarget, _gl.COLOR_ATTACHMENT0, _gl.TEXTURE_2D );

			if ( textureNeedsGenerateMipmaps( renderTarget.texture, supportsMips ) ) {

				generateMipmap( _gl.TEXTURE_2D, renderTarget.texture, renderTarget.width, renderTarget.height );

			}

			state.bindTexture( _gl.TEXTURE_2D, null );

		}

		// Setup depth and stencil buffers

		if ( renderTarget.depthBuffer ) {

			setupDepthRenderbuffer( renderTarget );

		}

	}

	function updateRenderTargetMipmap( renderTarget ) {

		var texture = renderTarget.texture;
		var supportsMips = isPowerOfTwo( renderTarget ) || capabilities.isWebGL2;

		if ( textureNeedsGenerateMipmaps( texture, supportsMips ) ) {

			var target = renderTarget.isWebGLRenderTargetCube ? _gl.TEXTURE_CUBE_MAP : _gl.TEXTURE_2D;
			var webglTexture = properties.get( texture ).__webglTexture;

			state.bindTexture( target, webglTexture );
			generateMipmap( target, texture, renderTarget.width, renderTarget.height );
			state.bindTexture( target, null );

		}

	}

	function updateMultisampleRenderTarget( renderTarget ) {

		if ( renderTarget.isWebGLMultisampleRenderTarget ) {

			if ( capabilities.isWebGL2 ) {

				var renderTargetProperties = properties.get( renderTarget );

				_gl.bindFramebuffer( _gl.READ_FRAMEBUFFER, renderTargetProperties.__webglMultisampledFramebuffer );
				_gl.bindFramebuffer( _gl.DRAW_FRAMEBUFFER, renderTargetProperties.__webglFramebuffer );

				var width = renderTarget.width;
				var height = renderTarget.height;
				var mask = _gl.COLOR_BUFFER_BIT;

				if ( renderTarget.depthBuffer ) mask |= _gl.DEPTH_BUFFER_BIT;
				if ( renderTarget.stencilBuffer ) mask |= _gl.STENCIL_BUFFER_BIT;

				_gl.blitFramebuffer( 0, 0, width, height, 0, 0, width, height, mask, _gl.NEAREST );

			} else {

				console.warn( 'THREE.WebGLRenderer: WebGLMultisampleRenderTarget can only be used with WebGL2.' );

			}

		}

	}

	function getRenderTargetSamples( renderTarget ) {

		return ( capabilities.isWebGL2 && renderTarget.isWebGLMultisampleRenderTarget ) ?
			Math.min( capabilities.maxSamples, renderTarget.samples ) : 0;

	}

	function updateVideoTexture( texture ) {

		var id = texture.id;
		var frame = info.render.frame;

		// Check the last frame we updated the VideoTexture

		if ( _videoTextures[ id ] !== frame ) {

			_videoTextures[ id ] = frame;
			texture.update();

		}

	}

	this.setTexture2D = setTexture2D;
	this.setTexture3D = setTexture3D;
	this.setTextureCube = setTextureCube;
	this.setTextureCubeDynamic = setTextureCubeDynamic;
	this.setupRenderTarget = setupRenderTarget;
	this.updateRenderTargetMipmap = updateRenderTargetMipmap;
	this.updateMultisampleRenderTarget = updateMultisampleRenderTarget;

}


export { WebGLTextures };
