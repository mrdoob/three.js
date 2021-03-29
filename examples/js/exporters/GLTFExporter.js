THREE.GLTFExporter = ( function () {

	function GLTFExporter() {

		this.pluginCallbacks = [];

		this.register( function ( writer ) {

			return new GLTFLightExtension( writer );

		} );

		this.register( function ( writer ) {

			return new GLTFMaterialsUnlitExtension( writer );

		} );

		this.register( function ( writer ) {

			return new GLTFMaterialsPBRSpecularGlossiness( writer );

		} );

	}

	GLTFExporter.prototype = {

		constructor: GLTFExporter,

		register: function ( callback ) {

			if ( this.pluginCallbacks.indexOf( callback ) === - 1 ) {

				this.pluginCallbacks.push( callback );

			}

			return this;

		},

		unregister: function ( callback ) {

			if ( this.pluginCallbacks.indexOf( callback ) !== - 1 ) {

				this.pluginCallbacks.splice( this.pluginCallbacks.indexOf( callback ), 1 );

			}

			return this;

		},

		/**
		 * Parse scenes and generate GLTF output
		 * @param  {THREE.Scene or [THREE.Scenes]} input   THREE.Scene or Array of THREE.Scenes
		 * @param  {Function} onDone  Callback on completed
		 * @param  {Object} options options
		 */
		parse: function ( input, onDone, options ) {

			var writer = new GLTFWriter();
			var plugins = [];

			for ( var i = 0, il = this.pluginCallbacks.length; i < il; i ++ ) {

				plugins.push( this.pluginCallbacks[ i ]( writer ) );

			}

			writer.setPlugins( plugins );
			writer.write( input, onDone, options );

		}

	};

	//------------------------------------------------------------------------------
	// Constants
	//------------------------------------------------------------------------------

	var WEBGL_CONSTANTS = {
		POINTS: 0x0000,
		LINES: 0x0001,
		LINE_LOOP: 0x0002,
		LINE_STRIP: 0x0003,
		TRIANGLES: 0x0004,
		TRIANGLE_STRIP: 0x0005,
		TRIANGLE_FAN: 0x0006,

		UNSIGNED_BYTE: 0x1401,
		UNSIGNED_SHORT: 0x1403,
		FLOAT: 0x1406,
		UNSIGNED_INT: 0x1405,
		ARRAY_BUFFER: 0x8892,
		ELEMENT_ARRAY_BUFFER: 0x8893,

		NEAREST: 0x2600,
		LINEAR: 0x2601,
		NEAREST_MIPMAP_NEAREST: 0x2700,
		LINEAR_MIPMAP_NEAREST: 0x2701,
		NEAREST_MIPMAP_LINEAR: 0x2702,
		LINEAR_MIPMAP_LINEAR: 0x2703,

		CLAMP_TO_EDGE: 33071,
		MIRRORED_REPEAT: 33648,
		REPEAT: 10497
	};

	var THREE_TO_WEBGL = {};

	THREE_TO_WEBGL[ THREE.NearestFilter ] = WEBGL_CONSTANTS.NEAREST;
	THREE_TO_WEBGL[ THREE.NearestMipmapNearestFilter ] = WEBGL_CONSTANTS.NEAREST_MIPMAP_NEAREST;
	THREE_TO_WEBGL[ THREE.NearestMipmapLinearFilter ] = WEBGL_CONSTANTS.NEAREST_MIPMAP_LINEAR;
	THREE_TO_WEBGL[ THREE.LinearFilter ] = WEBGL_CONSTANTS.LINEAR;
	THREE_TO_WEBGL[ THREE.LinearMipmapNearestFilter ] = WEBGL_CONSTANTS.LINEAR_MIPMAP_NEAREST;
	THREE_TO_WEBGL[ THREE.LinearMipmapLinearFilter ] = WEBGL_CONSTANTS.LINEAR_MIPMAP_LINEAR;

	THREE_TO_WEBGL[ THREE.ClampToEdgeWrapping ] = WEBGL_CONSTANTS.CLAMP_TO_EDGE;
	THREE_TO_WEBGL[ THREE.RepeatWrapping ] = WEBGL_CONSTANTS.REPEAT;
	THREE_TO_WEBGL[ THREE.MirroredRepeatWrapping ] = WEBGL_CONSTANTS.MIRRORED_REPEAT;

	var PATH_PROPERTIES = {
		scale: 'scale',
		position: 'translation',
		quaternion: 'rotation',
		morphTargetInfluences: 'weights'
	};

	// GLB constants
	// https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#glb-file-format-specification

	var GLB_HEADER_BYTES = 12;
	var GLB_HEADER_MAGIC = 0x46546C67;
	var GLB_VERSION = 2;

	var GLB_CHUNK_PREFIX_BYTES = 8;
	var GLB_CHUNK_TYPE_JSON = 0x4E4F534A;
	var GLB_CHUNK_TYPE_BIN = 0x004E4942;

	//------------------------------------------------------------------------------
	// Utility functions
	//------------------------------------------------------------------------------

	/**
	 * Compare two arrays
	 * @param  {Array} array1 Array 1 to compare
	 * @param  {Array} array2 Array 2 to compare
	 * @return {Boolean}        Returns true if both arrays are equal
	 */
	function equalArray( array1, array2 ) {

		return ( array1.length === array2.length ) && array1.every( function ( element, index ) {

			return element === array2[ index ];

		} );

	}

	/**
	 * Converts a string to an ArrayBuffer.
	 * @param  {string} text
	 * @return {ArrayBuffer}
	 */
	function stringToArrayBuffer( text ) {

		if ( window.TextEncoder !== undefined ) {

			return new TextEncoder().encode( text ).buffer;

		}

		var array = new Uint8Array( new ArrayBuffer( text.length ) );

		for ( var i = 0, il = text.length; i < il; i ++ ) {

			var value = text.charCodeAt( i );

			// Replacing multi-byte character with space(0x20).
			array[ i ] = value > 0xFF ? 0x20 : value;

		}

		return array.buffer;

	}

	/**
	 * Is identity matrix
	 *
	 * @param {THREE.Matrix4} matrix
	 * @returns {Boolean} Returns true, if parameter is identity matrix
	 */
	function isIdentityMatrix( matrix ) {

		return equalArray( matrix.elements, [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ] );

	}

	/**
	 * Get the min and max vectors from the given attribute
	 * @param  {THREE.BufferAttribute} attribute Attribute to find the min/max in range from start to start + count
	 * @param  {Integer} start
	 * @param  {Integer} count
	 * @return {Object} Object containing the `min` and `max` values (As an array of attribute.itemSize components)
	 */
	function getMinMax( attribute, start, count ) {

		var output = {

			min: new Array( attribute.itemSize ).fill( Number.POSITIVE_INFINITY ),
			max: new Array( attribute.itemSize ).fill( Number.NEGATIVE_INFINITY )

		};

		for ( var i = start; i < start + count; i ++ ) {

			for ( var a = 0; a < attribute.itemSize; a ++ ) {

				var value;

				if ( attribute.itemSize > 4 ) {

					 // no support for interleaved data for itemSize > 4

					value = attribute.array[ i * attribute.itemSize + a ];

				} else {

					if ( a === 0 ) value = attribute.getX( i );
					else if ( a === 1 ) value = attribute.getY( i );
					else if ( a === 2 ) value = attribute.getZ( i );
					else if ( a === 3 ) value = attribute.getW( i );

				}

				output.min[ a ] = Math.min( output.min[ a ], value );
				output.max[ a ] = Math.max( output.max[ a ], value );

			}

		}

		return output;

	}

	/**
	 * Get the required size + padding for a buffer, rounded to the next 4-byte boundary.
	 * https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#data-alignment
	 *
	 * @param {Integer} bufferSize The size the original buffer.
	 * @returns {Integer} new buffer size with required padding.
	 *
	 */
	function getPaddedBufferSize( bufferSize ) {

		return Math.ceil( bufferSize / 4 ) * 4;

	}

	/**
	 * Returns a buffer aligned to 4-byte boundary.
	 *
	 * @param {ArrayBuffer} arrayBuffer Buffer to pad
	 * @param {Integer} paddingByte (Optional)
	 * @returns {ArrayBuffer} The same buffer if it's already aligned to 4-byte boundary or a new buffer
	 */
	function getPaddedArrayBuffer( arrayBuffer, paddingByte ) {

		paddingByte = paddingByte || 0;

		var paddedLength = getPaddedBufferSize( arrayBuffer.byteLength );

		if ( paddedLength !== arrayBuffer.byteLength ) {

			var array = new Uint8Array( paddedLength );
			array.set( new Uint8Array( arrayBuffer ) );

			if ( paddingByte !== 0 ) {

				for ( var i = arrayBuffer.byteLength; i < paddedLength; i ++ ) {

					array[ i ] = paddingByte;

				}

			}

			return array.buffer;

		}

		return arrayBuffer;

	}

	var cachedCanvas = null;

	/**
	 * Writer
	 */
	function GLTFWriter() {

		this.plugins = [];

		this.options = {};
		this.pending = [];
		this.buffers = [];

		this.byteOffset = 0;
		this.buffers = [];
		this.nodeMap = new Map();
		this.skins = [];
		this.extensionsUsed = {};

		this.uids = new Map();
		this.uid = 0;

		this.json = {
			asset: {
				version: '2.0',
				generator: 'THREE.GLTFExporter'
			}
		};

		this.cache = {
			meshes: new Map(),
			attributes: new Map(),
			attributesNormalized: new Map(),
			materials: new Map(),
			textures: new Map(),
			images: new Map()
		};

	}

	GLTFWriter.prototype = {

		constructor: GLTFWriter,

		setPlugins: function ( plugins ) {

			this.plugins = plugins;

		},

		/**
		 * Parse scenes and generate GLTF output
		 * @param  {THREE.Scene or [THREE.Scenes]} input   THREE.Scene or Array of THREE.Scenes
		 * @param  {Function} onDone  Callback on completed
		 * @param  {Object} options options
		 */
		write: function ( input, onDone, options ) {

			this.options = Object.assign( {}, {
				// default options
				binary: false,
				trs: false,
				onlyVisible: true,
				truncateDrawRange: true,
				embedImages: true,
				maxTextureSize: Infinity,
				animations: [],
				includeCustomExtensions: false
			}, options );

			if ( this.options.animations.length > 0 ) {

				// Only TRS properties, and not matrices, may be targeted by animation.
				this.options.trs = true;

			}

			this.processInput( input );

			var writer = this;

			Promise.all( this.pending ).then( function () {

				var buffers = writer.buffers;
				var json = writer.json;
				var options = writer.options;
				var extensionsUsed = writer.extensionsUsed;

				// Merge buffers.
				var blob = new Blob( buffers, { type: 'application/octet-stream' } );

				// Declare extensions.
				var extensionsUsedList = Object.keys( extensionsUsed );

				if ( extensionsUsedList.length > 0 ) json.extensionsUsed = extensionsUsedList;

				// Update bytelength of the single buffer.
				if ( json.buffers && json.buffers.length > 0 ) json.buffers[ 0 ].byteLength = blob.size;

				if ( options.binary === true ) {

					// https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#glb-file-format-specification

					var reader = new window.FileReader();
					reader.readAsArrayBuffer( blob );
					reader.onloadend = function () {

						// Binary chunk.
						var binaryChunk = getPaddedArrayBuffer( reader.result );
						var binaryChunkPrefix = new DataView( new ArrayBuffer( GLB_CHUNK_PREFIX_BYTES ) );
						binaryChunkPrefix.setUint32( 0, binaryChunk.byteLength, true );
						binaryChunkPrefix.setUint32( 4, GLB_CHUNK_TYPE_BIN, true );

						// JSON chunk.
						var jsonChunk = getPaddedArrayBuffer( stringToArrayBuffer( JSON.stringify( json ) ), 0x20 );
						var jsonChunkPrefix = new DataView( new ArrayBuffer( GLB_CHUNK_PREFIX_BYTES ) );
						jsonChunkPrefix.setUint32( 0, jsonChunk.byteLength, true );
						jsonChunkPrefix.setUint32( 4, GLB_CHUNK_TYPE_JSON, true );

						// GLB header.
						var header = new ArrayBuffer( GLB_HEADER_BYTES );
						var headerView = new DataView( header );
						headerView.setUint32( 0, GLB_HEADER_MAGIC, true );
						headerView.setUint32( 4, GLB_VERSION, true );
						var totalByteLength = GLB_HEADER_BYTES
							+ jsonChunkPrefix.byteLength + jsonChunk.byteLength
							+ binaryChunkPrefix.byteLength + binaryChunk.byteLength;
						headerView.setUint32( 8, totalByteLength, true );

						var glbBlob = new Blob( [
							header,
							jsonChunkPrefix,
							jsonChunk,
							binaryChunkPrefix,
							binaryChunk
						], { type: 'application/octet-stream' } );

						var glbReader = new window.FileReader();
						glbReader.readAsArrayBuffer( glbBlob );
						glbReader.onloadend = function () {

							onDone( glbReader.result );

						};

					};

				} else {

					if ( json.buffers && json.buffers.length > 0 ) {

						var reader = new window.FileReader();
						reader.readAsDataURL( blob );
						reader.onloadend = function () {

							var base64data = reader.result;
							json.buffers[ 0 ].uri = base64data;
							onDone( json );

						};

					} else {

						onDone( json );

					}

				}

			} );

		},

		/**
		 * Serializes a userData.
		 *
		 * @param {THREE.Object3D|THREE.Material} object
		 * @param {Object} objectDef
		 */
		serializeUserData: function ( object, objectDef ) {

			if ( Object.keys( object.userData ).length === 0 ) return;

			var options = this.options;
			var extensionsUsed = this.extensionsUsed;

			try {

				var json = JSON.parse( JSON.stringify( object.userData ) );

				if ( options.includeCustomExtensions && json.gltfExtensions ) {

					if ( objectDef.extensions === undefined ) objectDef.extensions = {};

					for ( var extensionName in json.gltfExtensions ) {

						objectDef.extensions[ extensionName ] = json.gltfExtensions[ extensionName ];
						extensionsUsed[ extensionName ] = true;

					}

					delete json.gltfExtensions;

				}

				if ( Object.keys( json ).length > 0 ) objectDef.extras = json;

			} catch ( error ) {

				console.warn( 'THREE.GLTFExporter: userData of \'' + object.name + '\' ' +
					'won\'t be serialized because of JSON.stringify error - ' + error.message );

			}

		},

		/**
		 * Assign and return a temporal unique id for an object
		 * especially which doesn't have .uuid
		 * @param  {Object} object
		 * @return {Integer}
		 */
		getUID: function ( object ) {

			if ( ! this.uids.has( object ) ) this.uids.set( object, this.uid ++ );

			return this.uids.get( object );

		},

		/**
		 * Checks if normal attribute values are normalized.
		 *
		 * @param {THREE.BufferAttribute} normal
		 * @returns {Boolean}
		 */
		isNormalizedNormalAttribute: function ( normal ) {

			var cache = this.cache;

			if ( cache.attributesNormalized.has( normal ) ) return false;

			var v = new THREE.Vector3();

			for ( var i = 0, il = normal.count; i < il; i ++ ) {

				// 0.0005 is from glTF-validator
				if ( Math.abs( v.fromBufferAttribute( normal, i ).length() - 1.0 ) > 0.0005 ) return false;

			}

			return true;

		},

		/**
		 * Creates normalized normal buffer attribute.
		 *
		 * @param {THREE.BufferAttribute} normal
		 * @returns {THREE.BufferAttribute}
		 *
		 */
		createNormalizedNormalAttribute: function ( normal ) {

			var cache = this.cache;

			if ( cache.attributesNormalized.has( normal ) )	return cache.attributesNormalized.get( normal );

			var attribute = normal.clone();
			var v = new THREE.Vector3();

			for ( var i = 0, il = attribute.count; i < il; i ++ ) {

				v.fromBufferAttribute( attribute, i );

				if ( v.x === 0 && v.y === 0 && v.z === 0 ) {

					// if values can't be normalized set (1, 0, 0)
					v.setX( 1.0 );

				} else {

					v.normalize();

				}

				attribute.setXYZ( i, v.x, v.y, v.z );

			}

			cache.attributesNormalized.set( normal, attribute );

			return attribute;

		},

		/**
		 * Applies a texture transform, if present, to the map definition. Requires
		 * the KHR_texture_transform extension.
		 *
		 * @param {Object} mapDef
		 * @param {THREE.Texture} texture
		 */
		applyTextureTransform: function ( mapDef, texture ) {

			var didTransform = false;
			var transformDef = {};

			if ( texture.offset.x !== 0 || texture.offset.y !== 0 ) {

				transformDef.offset = texture.offset.toArray();
				didTransform = true;

			}

			if ( texture.rotation !== 0 ) {

				transformDef.rotation = texture.rotation;
				didTransform = true;

			}

			if ( texture.repeat.x !== 1 || texture.repeat.y !== 1 ) {

				transformDef.scale = texture.repeat.toArray();
				didTransform = true;

			}

			if ( didTransform ) {

				mapDef.extensions = mapDef.extensions || {};
				mapDef.extensions[ 'KHR_texture_transform' ] = transformDef;
				this.extensionsUsed[ 'KHR_texture_transform' ] = true;

			}

		},

		/**
		 * Process a buffer to append to the default one.
		 * @param  {ArrayBuffer} buffer
		 * @return {Integer}
		 */
		processBuffer: function ( buffer ) {

			var json = this.json;
			var buffers = this.buffers;

			if ( ! json.buffers ) json.buffers = [ { byteLength: 0 } ];

			// All buffers are merged before export.
			buffers.push( buffer );

			return 0;

		},

		/**
		 * Process and generate a BufferView
		 * @param  {THREE.BufferAttribute} attribute
		 * @param  {number} componentType
		 * @param  {number} start
		 * @param  {number} count
		 * @param  {number} target (Optional) Target usage of the BufferView
		 * @return {Object}
		 */
		processBufferView: function ( attribute, componentType, start, count, target ) {

			var json = this.json;

			if ( ! json.bufferViews ) json.bufferViews = [];

			// Create a new dataview and dump the attribute's array into it

			var componentSize;

			if ( componentType === WEBGL_CONSTANTS.UNSIGNED_BYTE ) {

				componentSize = 1;

			} else if ( componentType === WEBGL_CONSTANTS.UNSIGNED_SHORT ) {

				componentSize = 2;

			} else {

				componentSize = 4;

			}

			var byteLength = getPaddedBufferSize( count * attribute.itemSize * componentSize );
			var dataView = new DataView( new ArrayBuffer( byteLength ) );
			var offset = 0;

			for ( var i = start; i < start + count; i ++ ) {

				for ( var a = 0; a < attribute.itemSize; a ++ ) {

					var value;

					if ( attribute.itemSize > 4 ) {

						 // no support for interleaved data for itemSize > 4

						value = attribute.array[ i * attribute.itemSize + a ];

					} else {

						if ( a === 0 ) value = attribute.getX( i );
						else if ( a === 1 ) value = attribute.getY( i );
						else if ( a === 2 ) value = attribute.getZ( i );
						else if ( a === 3 ) value = attribute.getW( i );

					}

					if ( componentType === WEBGL_CONSTANTS.FLOAT ) {

						dataView.setFloat32( offset, value, true );

					} else if ( componentType === WEBGL_CONSTANTS.UNSIGNED_INT ) {

						dataView.setUint32( offset, value, true );

					} else if ( componentType === WEBGL_CONSTANTS.UNSIGNED_SHORT ) {

						dataView.setUint16( offset, value, true );

					} else if ( componentType === WEBGL_CONSTANTS.UNSIGNED_BYTE ) {

						dataView.setUint8( offset, value );

					}

					offset += componentSize;

				}

			}

			var bufferViewDef = {

				buffer: this.processBuffer( dataView.buffer ),
				byteOffset: this.byteOffset,
				byteLength: byteLength

			};

			if ( target !== undefined ) bufferViewDef.target = target;

			if ( target === WEBGL_CONSTANTS.ARRAY_BUFFER ) {

				// Only define byteStride for vertex attributes.
				bufferViewDef.byteStride = attribute.itemSize * componentSize;

			}

			this.byteOffset += byteLength;

			json.bufferViews.push( bufferViewDef );

			// @TODO Merge bufferViews where possible.
			var output = {

				id: json.bufferViews.length - 1,
				byteLength: 0

			};

			return output;

		},

		/**
		 * Process and generate a BufferView from an image Blob.
		 * @param {Blob} blob
		 * @return {Promise<Integer>}
		 */
		processBufferViewImage: function ( blob ) {

			var writer = this;
			var json = writer.json;

			if ( ! json.bufferViews ) json.bufferViews = [];

			return new Promise( function ( resolve ) {

				var reader = new window.FileReader();
				reader.readAsArrayBuffer( blob );
				reader.onloadend = function () {

					var buffer = getPaddedArrayBuffer( reader.result );

					var bufferViewDef = {
						buffer: writer.processBuffer( buffer ),
						byteOffset: writer.byteOffset,
						byteLength: buffer.byteLength
					};

					writer.byteOffset += buffer.byteLength;
					resolve( json.bufferViews.push( bufferViewDef ) - 1 );

				};

			} );

		},

		/**
		 * Process attribute to generate an accessor
		 * @param  {THREE.BufferAttribute} attribute Attribute to process
		 * @param  {THREE.BufferGeometry} geometry (Optional) Geometry used for truncated draw range
		 * @param  {Integer} start (Optional)
		 * @param  {Integer} count (Optional)
		 * @return {Integer|null} Index of the processed accessor on the "accessors" array
		 */
		processAccessor: function ( attribute, geometry, start, count ) {

			var options = this.options;
			var json = this.json;

			var types = {

				1: 'SCALAR',
				2: 'VEC2',
				3: 'VEC3',
				4: 'VEC4',
				16: 'MAT4'

			};

			var componentType;

			// Detect the component type of the attribute array (float, uint or ushort)
			if ( attribute.array.constructor === Float32Array ) {

				componentType = WEBGL_CONSTANTS.FLOAT;

			} else if ( attribute.array.constructor === Uint32Array ) {

				componentType = WEBGL_CONSTANTS.UNSIGNED_INT;

			} else if ( attribute.array.constructor === Uint16Array ) {

				componentType = WEBGL_CONSTANTS.UNSIGNED_SHORT;

			} else if ( attribute.array.constructor === Uint8Array ) {

				componentType = WEBGL_CONSTANTS.UNSIGNED_BYTE;

			} else {

				throw new Error( 'THREE.GLTFExporter: Unsupported bufferAttribute component type.' );

			}

			if ( start === undefined ) start = 0;
			if ( count === undefined ) count = attribute.count;

			// @TODO Indexed buffer geometry with drawRange not supported yet
			if ( options.truncateDrawRange && geometry !== undefined && geometry.index === null ) {

				var end = start + count;
				var end2 = geometry.drawRange.count === Infinity
					? attribute.count
					: geometry.drawRange.start + geometry.drawRange.count;

				start = Math.max( start, geometry.drawRange.start );
				count = Math.min( end, end2 ) - start;

				if ( count < 0 ) count = 0;

			}

			// Skip creating an accessor if the attribute doesn't have data to export
			if ( count === 0 ) return null;

			var minMax = getMinMax( attribute, start, count );
			var bufferViewTarget;

			// If geometry isn't provided, don't infer the target usage of the bufferView. For
			// animation samplers, target must not be set.
			if ( geometry !== undefined ) {

				bufferViewTarget = attribute === geometry.index ? WEBGL_CONSTANTS.ELEMENT_ARRAY_BUFFER : WEBGL_CONSTANTS.ARRAY_BUFFER;

			}

			var bufferView = this.processBufferView( attribute, componentType, start, count, bufferViewTarget );

			var accessorDef = {

				bufferView: bufferView.id,
				byteOffset: bufferView.byteOffset,
				componentType: componentType,
				count: count,
				max: minMax.max,
				min: minMax.min,
				type: types[ attribute.itemSize ]

			};

			if ( attribute.normalized === true ) accessorDef.normalized = true;
			if ( ! json.accessors ) json.accessors = [];

			return json.accessors.push( accessorDef ) - 1;

		},

		/**
		 * Process image
		 * @param  {Image} image to process
		 * @param  {Integer} format of the image (e.g. THREE.RGBFormat, THREE.RGBAFormat etc)
		 * @param  {Boolean} flipY before writing out the image
		 * @return {Integer}     Index of the processed texture in the "images" array
		 */
		processImage: function ( image, format, flipY ) {

			var writer = this;
			var cache = writer.cache;
			var json = writer.json;
			var options = writer.options;
			var pending = writer.pending;

			if ( ! cache.images.has( image ) ) cache.images.set( image, {} );

			var cachedImages = cache.images.get( image );
			var mimeType = format === THREE.RGBAFormat ? 'image/png' : 'image/jpeg';
			var key = mimeType + ':flipY/' + flipY.toString();

			if ( cachedImages[ key ] !== undefined ) return cachedImages[ key ];

			if ( ! json.images ) json.images = [];

			var imageDef = { mimeType: mimeType };

			if ( options.embedImages ) {

				var canvas = cachedCanvas = cachedCanvas || document.createElement( 'canvas' );

				canvas.width = Math.min( image.width, options.maxTextureSize );
				canvas.height = Math.min( image.height, options.maxTextureSize );

				var ctx = canvas.getContext( '2d' );

				if ( flipY === true ) {

					ctx.translate( 0, canvas.height );
					ctx.scale( 1, - 1 );

				}

				if ( ( typeof HTMLImageElement !== 'undefined' && image instanceof HTMLImageElement ) ||
					( typeof HTMLCanvasElement !== 'undefined' && image instanceof HTMLCanvasElement ) ||
					( typeof OffscreenCanvas !== 'undefined' && image instanceof OffscreenCanvas ) ||
					( typeof ImageBitmap !== 'undefined' && image instanceof ImageBitmap ) ) {

					ctx.drawImage( image, 0, 0, canvas.width, canvas.height );

				} else {

					if ( format !== THREE.RGBAFormat && format !== THREE.RGBFormat ) {

						console.error( 'GLTFExporter: Only RGB and RGBA formats are supported.' );

					}

					if ( image.width > options.maxTextureSize || image.height > options.maxTextureSize ) {

						console.warn( 'GLTFExporter: Image size is bigger than maxTextureSize', image );

					}

					var data = image.data;

					if ( format === THREE.RGBFormat ) {

						data = new Uint8ClampedArray( image.height * image.width * 4 );

						for ( var i = 0, j = 0; i < data.length; i += 4, j += 3 ) {

							data[ i + 0 ] = image.data[ j + 0 ];
							data[ i + 1 ] = image.data[ j + 1 ];
							data[ i + 2 ] = image.data[ j + 2 ];
							data[ i + 3 ] = 255;

						}

					}

					ctx.putImageData( new ImageData( data, image.width, image.height ), 0, 0 );

				}

				if ( options.binary === true ) {

					pending.push( new Promise( function ( resolve ) {

						canvas.toBlob( function ( blob ) {

							writer.processBufferViewImage( blob ).then( function ( bufferViewIndex ) {

								imageDef.bufferView = bufferViewIndex;
								resolve();

							} );

						}, mimeType );

					} ) );

				} else {

					imageDef.uri = canvas.toDataURL( mimeType );

				}

			} else {

				imageDef.uri = image.src;

			}

			var index = json.images.push( imageDef ) - 1;
			cachedImages[ key ] = index;
			return index;

		},

		/**
		 * Process sampler
		 * @param  {Texture} map Texture to process
		 * @return {Integer}     Index of the processed texture in the "samplers" array
		 */
		processSampler: function ( map ) {

			var json = this.json;

			if ( ! json.samplers ) json.samplers = [];

			var samplerDef = {
				magFilter: THREE_TO_WEBGL[ map.magFilter ],
				minFilter: THREE_TO_WEBGL[ map.minFilter ],
				wrapS: THREE_TO_WEBGL[ map.wrapS ],
				wrapT: THREE_TO_WEBGL[ map.wrapT ]
			};

			return json.samplers.push( samplerDef ) - 1;

		},

		/**
		 * Process texture
		 * @param  {Texture} map Map to process
		 * @return {Integer} Index of the processed texture in the "textures" array
		 */
		processTexture: function ( map ) {

			var cache = this.cache;
			var json = this.json;

			if ( cache.textures.has( map ) ) return cache.textures.get( map );

			if ( ! json.textures ) json.textures = [];

			var textureDef = {
				sampler: this.processSampler( map ),
				source: this.processImage( map.image, map.format, map.flipY )
			};

			if ( map.name ) textureDef.name = map.name;

			this._invokeAll( function ( ext ) {

				ext.writeTexture && ext.writeTexture( map, textureDef );

			} );

			var index = json.textures.push( textureDef ) - 1;
			cache.textures.set( map, index );
			return index;

		},

		/**
		 * Process material
		 * @param  {THREE.Material} material Material to process
		 * @return {Integer|null} Index of the processed material in the "materials" array
		 */
		processMaterial: function ( material ) {

			var cache = this.cache;
			var json = this.json;

			if ( cache.materials.has( material ) ) return cache.materials.get( material );

			if ( material.isShaderMaterial ) {

				console.warn( 'GLTFExporter: THREE.ShaderMaterial not supported.' );
				return null;

			}

			if ( ! json.materials ) json.materials = [];

			// @QUESTION Should we avoid including any attribute that has the default value?
			var materialDef = {	pbrMetallicRoughness: {} };

			if ( material.isMeshStandardMaterial !== true && material.isMeshBasicMaterial !== true ) {

				console.warn( 'GLTFExporter: Use MeshStandardMaterial or MeshBasicMaterial for best results.' );

			}

			// pbrMetallicRoughness.baseColorFactor
			var color = material.color.toArray().concat( [ material.opacity ] );

			if ( ! equalArray( color, [ 1, 1, 1, 1 ] ) ) {

				materialDef.pbrMetallicRoughness.baseColorFactor = color;

			}

			if ( material.isMeshStandardMaterial ) {

				materialDef.pbrMetallicRoughness.metallicFactor = material.metalness;
				materialDef.pbrMetallicRoughness.roughnessFactor = material.roughness;

			} else {

				materialDef.pbrMetallicRoughness.metallicFactor = 0.5;
				materialDef.pbrMetallicRoughness.roughnessFactor = 0.5;

			}

			// pbrMetallicRoughness.metallicRoughnessTexture
			if ( material.metalnessMap || material.roughnessMap ) {

				if ( material.metalnessMap === material.roughnessMap ) {

					var metalRoughMapDef = { index: this.processTexture( material.metalnessMap ) };
					this.applyTextureTransform( metalRoughMapDef, material.metalnessMap );
					materialDef.pbrMetallicRoughness.metallicRoughnessTexture = metalRoughMapDef;

				} else {

					console.warn( 'THREE.GLTFExporter: Ignoring metalnessMap and roughnessMap because they are not the same Texture.' );

				}

			}

			// pbrMetallicRoughness.baseColorTexture or pbrSpecularGlossiness diffuseTexture
			if ( material.map ) {

				var baseColorMapDef = { index: this.processTexture( material.map ) };
				this.applyTextureTransform( baseColorMapDef, material.map );
				materialDef.pbrMetallicRoughness.baseColorTexture = baseColorMapDef;

			}

			if ( material.emissive ) {

				// emissiveFactor
				var emissive = material.emissive.clone().multiplyScalar( material.emissiveIntensity ).toArray();

				if ( ! equalArray( emissive, [ 0, 0, 0 ] ) ) {

					materialDef.emissiveFactor = emissive;

				}

				// emissiveTexture
				if ( material.emissiveMap ) {

					var emissiveMapDef = { index: this.processTexture( material.emissiveMap ) };
					this.applyTextureTransform( emissiveMapDef, material.emissiveMap );
					materialDef.emissiveTexture = emissiveMapDef;

				}

			}

			// normalTexture
			if ( material.normalMap ) {

				var normalMapDef = { index: this.processTexture( material.normalMap ) };

				if ( material.normalScale && material.normalScale.x !== - 1 ) {

					if ( material.normalScale.x !== material.normalScale.y ) {

						console.warn( 'THREE.GLTFExporter: Normal scale components are different, ignoring Y and exporting X.' );

					}

					normalMapDef.scale = material.normalScale.x;

				}

				this.applyTextureTransform( normalMapDef, material.normalMap );
				materialDef.normalTexture = normalMapDef;

			}

			// occlusionTexture
			if ( material.aoMap ) {

				var occlusionMapDef = {
					index: this.processTexture( material.aoMap ),
					texCoord: 1
				};

				if ( material.aoMapIntensity !== 1.0 ) {

					occlusionMapDef.strength = material.aoMapIntensity;

				}

				this.applyTextureTransform( occlusionMapDef, material.aoMap );
				materialDef.occlusionTexture = occlusionMapDef;

			}

			// alphaMode
			if ( material.transparent ) {

				materialDef.alphaMode = 'BLEND';

			} else {

				if ( material.alphaTest > 0.0 ) {

					materialDef.alphaMode = 'MASK';
					materialDef.alphaCutoff = material.alphaTest;

				}

			}

			// doubleSided
			if ( material.side === THREE.DoubleSide ) materialDef.doubleSided = true;
			if ( material.name !== '' ) materialDef.name = material.name;

			this.serializeUserData( material, materialDef );

			this._invokeAll( function ( ext ) {

				ext.writeMaterial && ext.writeMaterial( material, materialDef );

			} );

			var index = json.materials.push( materialDef ) - 1;
			cache.materials.set( material, index );
			return index;

		},

		/**
		 * Process mesh
		 * @param  {THREE.Mesh} mesh Mesh to process
		 * @return {Integer|null} Index of the processed mesh in the "meshes" array
		 */
		processMesh: function ( mesh ) {

			var cache = this.cache;
			var json = this.json;

			var meshCacheKeyParts = [ mesh.geometry.uuid ];

			if ( Array.isArray( mesh.material ) ) {

				for ( var i = 0, l = mesh.material.length; i < l; i ++ ) {

					meshCacheKeyParts.push( mesh.material[ i ].uuid	);

				}

			} else {

				meshCacheKeyParts.push( mesh.material.uuid );

			}

			var meshCacheKey = meshCacheKeyParts.join( ':' );

			if ( cache.meshes.has( meshCacheKey ) ) return cache.meshes.get( meshCacheKey );

			var geometry = mesh.geometry;
			var mode;

			// Use the correct mode
			if ( mesh.isLineSegments ) {

				mode = WEBGL_CONSTANTS.LINES;

			} else if ( mesh.isLineLoop ) {

				mode = WEBGL_CONSTANTS.LINE_LOOP;

			} else if ( mesh.isLine ) {

				mode = WEBGL_CONSTANTS.LINE_STRIP;

			} else if ( mesh.isPoints ) {

				mode = WEBGL_CONSTANTS.POINTS;

			} else {

				mode = mesh.material.wireframe ? WEBGL_CONSTANTS.LINES : WEBGL_CONSTANTS.TRIANGLES;

			}

			if ( geometry.isBufferGeometry !== true ) {

				throw new Error( 'THREE.GLTFExporter: Geometry is not of type THREE.BufferGeometry.' );

			}

			var meshDef = {};
			var attributes = {};
			var primitives = [];
			var targets = [];

			// Conversion between attributes names in threejs and gltf spec
			var nameConversion = {
				uv: 'TEXCOORD_0',
				uv2: 'TEXCOORD_1',
				color: 'COLOR_0',
				skinWeight: 'WEIGHTS_0',
				skinIndex: 'JOINTS_0'
			};

			var originalNormal = geometry.getAttribute( 'normal' );

			if ( originalNormal !== undefined && ! this.isNormalizedNormalAttribute( originalNormal ) ) {

				console.warn( 'THREE.GLTFExporter: Creating normalized normal attribute from the non-normalized one.' );

				geometry.setAttribute( 'normal', this.createNormalizedNormalAttribute( originalNormal ) );

			}

			// @QUESTION Detect if .vertexColors = true?
			// For every attribute create an accessor
			var modifiedAttribute = null;

			for ( var attributeName in geometry.attributes ) {

				// Ignore morph target attributes, which are exported later.
				if ( attributeName.substr( 0, 5 ) === 'morph' ) continue;

				var attribute = geometry.attributes[ attributeName ];
				attributeName = nameConversion[ attributeName ] || attributeName.toUpperCase();

				// Prefix all geometry attributes except the ones specifically
				// listed in the spec; non-spec attributes are considered custom.
				var validVertexAttributes =
						/^(POSITION|NORMAL|TANGENT|TEXCOORD_\d+|COLOR_\d+|JOINTS_\d+|WEIGHTS_\d+)$/;

				if ( ! validVertexAttributes.test( attributeName ) ) attributeName = '_' + attributeName;

				if ( cache.attributes.has( this.getUID( attribute ) ) ) {

					attributes[ attributeName ] = cache.attributes.get( this.getUID( attribute ) );
					continue;

				}

				// JOINTS_0 must be UNSIGNED_BYTE or UNSIGNED_SHORT.
				modifiedAttribute = null;
				var array = attribute.array;

				if ( attributeName === 'JOINTS_0' &&
					! ( array instanceof Uint16Array ) &&
					! ( array instanceof Uint8Array ) ) {

					console.warn( 'GLTFExporter: Attribute "skinIndex" converted to type UNSIGNED_SHORT.' );
					modifiedAttribute = new THREE.BufferAttribute( new Uint16Array( array ), attribute.itemSize, attribute.normalized );

				}

				var accessor = this.processAccessor( modifiedAttribute || attribute, geometry );

				if ( accessor !== null ) {

					attributes[ attributeName ] = accessor;
					cache.attributes.set( this.getUID( attribute ), accessor );

				}

			}

			if ( originalNormal !== undefined ) geometry.setAttribute( 'normal', originalNormal );

			// Skip if no exportable attributes found
			if ( Object.keys( attributes ).length === 0 ) return null;

			// Morph targets
			if ( mesh.morphTargetInfluences !== undefined && mesh.morphTargetInfluences.length > 0 ) {

				var weights = [];
				var targetNames = [];
				var reverseDictionary = {};

				if ( mesh.morphTargetDictionary !== undefined ) {

					for ( var key in mesh.morphTargetDictionary ) {

						reverseDictionary[ mesh.morphTargetDictionary[ key ] ] = key;

					}

				}

				for ( var i = 0; i < mesh.morphTargetInfluences.length; ++ i ) {

					var target = {};
					var warned = false;

					for ( var attributeName in geometry.morphAttributes ) {

						// glTF 2.0 morph supports only POSITION/NORMAL/TANGENT.
						// Three.js doesn't support TANGENT yet.

						if ( attributeName !== 'position' && attributeName !== 'normal' ) {

							if ( ! warned ) {

								console.warn( 'GLTFExporter: Only POSITION and NORMAL morph are supported.' );
								warned = true;

							}

							continue;

						}

						var attribute = geometry.morphAttributes[ attributeName ][ i ];
						var gltfAttributeName = attributeName.toUpperCase();

						// Three.js morph attribute has absolute values while the one of glTF has relative values.
						//
						// glTF 2.0 Specification:
						// https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#morph-targets

						var baseAttribute = geometry.attributes[ attributeName ];

						if ( cache.attributes.has( this.getUID( attribute ) ) ) {

							target[ gltfAttributeName ] = cache.attributes.get( this.getUID( attribute ) );
							continue;

						}

						// Clones attribute not to override
						var relativeAttribute = attribute.clone();

						if ( ! geometry.morphTargetsRelative ) {

							for ( var j = 0, jl = attribute.count; j < jl; j ++ ) {

								relativeAttribute.setXYZ(
									j,
									attribute.getX( j ) - baseAttribute.getX( j ),
									attribute.getY( j ) - baseAttribute.getY( j ),
									attribute.getZ( j ) - baseAttribute.getZ( j )
								);

							}

						}

						target[ gltfAttributeName ] = this.processAccessor( relativeAttribute, geometry );
						cache.attributes.set( this.getUID( baseAttribute ), target[ gltfAttributeName ] );

					}

					targets.push( target );

					weights.push( mesh.morphTargetInfluences[ i ] );

					if ( mesh.morphTargetDictionary !== undefined ) targetNames.push( reverseDictionary[ i ] );

				}

				meshDef.weights = weights;

				if ( targetNames.length > 0 ) {

					meshDef.extras = {};
					meshDef.extras.targetNames = targetNames;

				}

			}

			var isMultiMaterial = Array.isArray( mesh.material );

			if ( isMultiMaterial && geometry.groups.length === 0 ) return null;

			var materials = isMultiMaterial ? mesh.material : [ mesh.material ];
			var groups = isMultiMaterial ? geometry.groups : [ { materialIndex: 0, start: undefined, count: undefined } ];

			for ( var i = 0, il = groups.length; i < il; i ++ ) {

				var primitive = {
					mode: mode,
					attributes: attributes,
				};

				this.serializeUserData( geometry, primitive );

				if ( targets.length > 0 ) primitive.targets = targets;

				if ( geometry.index !== null ) {

					var cacheKey = this.getUID( geometry.index );

					if ( groups[ i ].start !== undefined || groups[ i ].count !== undefined ) {

						cacheKey += ':' + groups[ i ].start + ':' + groups[ i ].count;

					}

					if ( cache.attributes.has( cacheKey ) ) {

						primitive.indices = cache.attributes.get( cacheKey );

					} else {

						primitive.indices = this.processAccessor( geometry.index, geometry, groups[ i ].start, groups[ i ].count );
						cache.attributes.set( cacheKey, primitive.indices );

					}

					if ( primitive.indices === null ) delete primitive.indices;

				}

				var material = this.processMaterial( materials[ groups[ i ].materialIndex ] );

				if ( material !== null ) primitive.material = material;

				primitives.push( primitive );

			}

			meshDef.primitives = primitives;

			if ( ! json.meshes ) json.meshes = [];

			this._invokeAll( function ( ext ) {

				ext.writeMesh && ext.writeMesh( mesh, meshDef );

			} );

			var index = json.meshes.push( meshDef ) - 1;
			cache.meshes.set( meshCacheKey, index );
			return index;

		},

		/**
		 * Process camera
		 * @param  {THREE.Camera} camera Camera to process
		 * @return {Integer}      Index of the processed mesh in the "camera" array
		 */
		processCamera: function ( camera ) {

			var json = this.json;

			if ( ! json.cameras ) json.cameras = [];

			var isOrtho = camera.isOrthographicCamera;

			var cameraDef = {
				type: isOrtho ? 'orthographic' : 'perspective'
			};

			if ( isOrtho ) {

				cameraDef.orthographic = {
					xmag: camera.right * 2,
					ymag: camera.top * 2,
					zfar: camera.far <= 0 ? 0.001 : camera.far,
					znear: camera.near < 0 ? 0 : camera.near
				};

			} else {

				cameraDef.perspective = {
					aspectRatio: camera.aspect,
					yfov: THREE.MathUtils.degToRad( camera.fov ),
					zfar: camera.far <= 0 ? 0.001 : camera.far,
					znear: camera.near < 0 ? 0 : camera.near
				};

			}

			// Question: Is saving "type" as name intentional?
			if ( camera.name !== '' ) cameraDef.name = camera.type;

			return json.cameras.push( cameraDef ) - 1;

		},

		/**
		 * Creates glTF animation entry from AnimationClip object.
		 *
		 * Status:
		 * - Only properties listed in PATH_PROPERTIES may be animated.
		 *
		 * @param {THREE.AnimationClip} clip
		 * @param {THREE.Object3D} root
		 * @return {number|null}
		 */
		processAnimation: function ( clip, root ) {

			var json = this.json;
			var nodeMap = this.nodeMap;

			if ( ! json.animations ) json.animations = [];

			clip = THREE.GLTFExporter.Utils.mergeMorphTargetTracks( clip.clone(), root );

			var tracks = clip.tracks;
			var channels = [];
			var samplers = [];

			for ( var i = 0; i < tracks.length; ++ i ) {

				var track = tracks[ i ];
				var trackBinding = THREE.PropertyBinding.parseTrackName( track.name );
				var trackNode = THREE.PropertyBinding.findNode( root, trackBinding.nodeName );
				var trackProperty = PATH_PROPERTIES[ trackBinding.propertyName ];

				if ( trackBinding.objectName === 'bones' ) {

					if ( trackNode.isSkinnedMesh === true ) {

						trackNode = trackNode.skeleton.getBoneByName( trackBinding.objectIndex );

					} else {

						trackNode = undefined;

					}

				}

				if ( ! trackNode || ! trackProperty ) {

					console.warn( 'THREE.GLTFExporter: Could not export animation track "%s".', track.name );
					return null;

				}

				var inputItemSize = 1;
				var outputItemSize = track.values.length / track.times.length;

				if ( trackProperty === PATH_PROPERTIES.morphTargetInfluences ) {

					outputItemSize /= trackNode.morphTargetInfluences.length;

				}

				var interpolation;

				// @TODO export CubicInterpolant(InterpolateSmooth) as CUBICSPLINE

				// Detecting glTF cubic spline interpolant by checking factory method's special property
				// GLTFCubicSplineInterpolant is a custom interpolant and track doesn't return
				// valid value from .getInterpolation().
				if ( track.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline === true ) {

					interpolation = 'CUBICSPLINE';

					// itemSize of CUBICSPLINE keyframe is 9
					// (VEC3 * 3: inTangent, splineVertex, and outTangent)
					// but needs to be stored as VEC3 so dividing by 3 here.
					outputItemSize /= 3;

				} else if ( track.getInterpolation() === THREE.InterpolateDiscrete ) {

					interpolation = 'STEP';

				} else {

					interpolation = 'LINEAR';

				}

				samplers.push( {
					input: this.processAccessor( new THREE.BufferAttribute( track.times, inputItemSize ) ),
					output: this.processAccessor( new THREE.BufferAttribute( track.values, outputItemSize ) ),
					interpolation: interpolation
				} );

				channels.push( {
					sampler: samplers.length - 1,
					target: {
						node: nodeMap.get( trackNode ),
						path: trackProperty
					}
				} );

			}

			json.animations.push( {
				name: clip.name || 'clip_' + json.animations.length,
				samplers: samplers,
				channels: channels
			} );

			return json.animations.length - 1;

		},

		/**
		 * @param {THREE.Object3D} object
		 * @return {number|null}
		 */
		 processSkin: function ( object ) {

			var json = this.json;
			var nodeMap = this.nodeMap;

			var node = json.nodes[ nodeMap.get( object ) ];

			var skeleton = object.skeleton;

			if ( skeleton === undefined ) return null;

			var rootJoint = object.skeleton.bones[ 0 ];

			if ( rootJoint === undefined ) return null;

			var joints = [];
			var inverseBindMatrices = new Float32Array( skeleton.bones.length * 16 );
			var temporaryBoneInverse = new THREE.Matrix4();

			for ( var i = 0; i < skeleton.bones.length; ++ i ) {

				joints.push( nodeMap.get( skeleton.bones[ i ] ) );
				temporaryBoneInverse.copy( skeleton.boneInverses[ i ] );
				temporaryBoneInverse.multiply( object.bindMatrix ).toArray( inverseBindMatrices, i * 16 );

			}

			if ( json.skins === undefined ) json.skins = [];

			json.skins.push( {
				inverseBindMatrices: this.processAccessor( new THREE.BufferAttribute( inverseBindMatrices, 16 ) ),
				joints: joints,
				skeleton: nodeMap.get( rootJoint )
			} );

			var skinIndex = node.skin = json.skins.length - 1;

			return skinIndex;

		},

		/**
		 * Process Object3D node
		 * @param  {THREE.Object3D} node Object3D to processNode
		 * @return {Integer} Index of the node in the nodes list
		 */
		processNode: function ( object ) {

			var json = this.json;
			var options = this.options;
			var nodeMap = this.nodeMap;

			if ( ! json.nodes ) json.nodes = [];

			var nodeDef = {};

			if ( options.trs ) {

				var rotation = object.quaternion.toArray();
				var position = object.position.toArray();
				var scale = object.scale.toArray();

				if ( ! equalArray( rotation, [ 0, 0, 0, 1 ] ) ) {

					nodeDef.rotation = rotation;

				}

				if ( ! equalArray( position, [ 0, 0, 0 ] ) ) {

					nodeDef.translation = position;

				}

				if ( ! equalArray( scale, [ 1, 1, 1 ] ) ) {

					nodeDef.scale = scale;

				}

			} else {

				if ( object.matrixAutoUpdate ) {

					object.updateMatrix();

				}

				if ( isIdentityMatrix( object.matrix ) === false ) {

					nodeDef.matrix = object.matrix.elements;

				}

			}

			// We don't export empty strings name because it represents no-name in Three.js.
			if ( object.name !== '' ) nodeDef.name = String( object.name );

			this.serializeUserData( object, nodeDef );

			if ( object.isMesh || object.isLine || object.isPoints ) {

				var meshIndex = this.processMesh( object );

				if ( meshIndex !== null ) nodeDef.mesh = meshIndex;

			} else if ( object.isCamera ) {

				nodeDef.camera = this.processCamera( object );

			}

			if ( object.isSkinnedMesh ) this.skins.push( object );

			if ( object.children.length > 0 ) {

				var children = [];

				for ( var i = 0, l = object.children.length; i < l; i ++ ) {

					var child = object.children[ i ];

					if ( child.visible || options.onlyVisible === false ) {

						var nodeIndex = this.processNode( child );

						if ( nodeIndex !== null ) children.push( nodeIndex );

					}

				}

				if ( children.length > 0 ) nodeDef.children = children;

			}

			this._invokeAll( function ( ext ) {

				ext.writeNode && ext.writeNode( object, nodeDef );

			} );

			var nodeIndex = json.nodes.push( nodeDef ) - 1;
			nodeMap.set( object, nodeIndex );
			return nodeIndex;

		},

		/**
		 * Process Scene
		 * @param  {THREE.Scene} node Scene to process
		 */
		processScene: function ( scene ) {

			var json = this.json;
			var options = this.options;

			if ( ! json.scenes ) {

				json.scenes = [];
				json.scene = 0;

			}

			var sceneDef = {};

			if ( scene.name !== '' ) sceneDef.name = scene.name;

			json.scenes.push( sceneDef );

			var nodes = [];

			for ( var i = 0, l = scene.children.length; i < l; i ++ ) {

				var child = scene.children[ i ];

				if ( child.visible || options.onlyVisible === false ) {

					var nodeIndex = this.processNode( child );

					if ( nodeIndex !== null ) nodes.push( nodeIndex );

				}

			}

			if ( nodes.length > 0 ) sceneDef.nodes = nodes;

			this.serializeUserData( scene, sceneDef );

		},

		/**
		 * Creates a THREE.Scene to hold a list of objects and parse it
		 * @param  {Array} objects List of objects to process
		 */
		processObjects: function ( objects ) {

			var scene = new THREE.Scene();
			scene.name = 'AuxScene';

			for ( var i = 0; i < objects.length; i ++ ) {

				// We push directly to children instead of calling `add` to prevent
				// modify the .parent and break its original scene and hierarchy
				scene.children.push( objects[ i ] );

			}

			this.processScene( scene );

		},

		/**
		 * @param {THREE.Object3D|Array<THREE.Object3D>} input
		 */
		processInput: function ( input ) {

			var options = this.options;

			input = input instanceof Array ? input : [ input ];

			this._invokeAll( function ( ext ) {

				ext.beforeParse && ext.beforeParse( input );

			} );

			var objectsWithoutScene = [];

			for ( var i = 0; i < input.length; i ++ ) {

				if ( input[ i ] instanceof THREE.Scene ) {

					this.processScene( input[ i ] );

				} else {

					objectsWithoutScene.push( input[ i ] );

				}

			}

			if ( objectsWithoutScene.length > 0 ) this.processObjects( objectsWithoutScene );

			for ( var i = 0; i < this.skins.length; ++ i ) {

				this.processSkin( this.skins[ i ] );

			}

			for ( var i = 0; i < options.animations.length; ++ i ) {

				this.processAnimation( options.animations[ i ], input[ 0 ] );

			}

			this._invokeAll( function ( ext ) {

				ext.afterParse && ext.afterParse( input );

			} );

		},

		_invokeAll: function ( func ) {

			for ( var i = 0, il = this.plugins.length; i < il; i ++ ) {

				func( this.plugins[ i ] );

			}

		}

	};

	/**
	 * Punctual Lights Extension
	 *
	 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_lights_punctual
	 */
	function GLTFLightExtension( writer ) {

		this.writer = writer;
		this.name = 'KHR_lights_punctual';

	}

	GLTFLightExtension.prototype = {

		constructor: GLTFLightExtension,

		writeNode: function ( light, nodeDef ) {

			if ( ! light.isLight ) return;

			if ( ! light.isDirectionalLight && ! light.isPointLight && ! light.isSpotLight ) {

				console.warn( 'THREE.GLTFExporter: Only directional, point, and spot lights are supported.', light );
				return;

			}

			var writer = this.writer;
			var json = writer.json;
			var extensionsUsed = writer.extensionsUsed;

			var lightDef = {};

			if ( light.name ) lightDef.name = light.name;

			lightDef.color = light.color.toArray();

			lightDef.intensity = light.intensity;

			if ( light.isDirectionalLight ) {

				lightDef.type = 'directional';

			} else if ( light.isPointLight ) {

				lightDef.type = 'point';

				if ( light.distance > 0 ) lightDef.range = light.distance;

			} else if ( light.isSpotLight ) {

				lightDef.type = 'spot';

				if ( light.distance > 0 ) lightDef.range = light.distance;

				lightDef.spot = {};
				lightDef.spot.innerConeAngle = ( light.penumbra - 1.0 ) * light.angle * - 1.0;
				lightDef.spot.outerConeAngle = light.angle;

			}

			if ( light.decay !== undefined && light.decay !== 2 ) {

				console.warn( 'THREE.GLTFExporter: Light decay may be lost. glTF is physically-based, '
					+ 'and expects light.decay=2.' );

			}

			if ( light.target
					&& ( light.target.parent !== light
					|| light.target.position.x !== 0
					|| light.target.position.y !== 0
					|| light.target.position.z !== - 1 ) ) {

				console.warn( 'THREE.GLTFExporter: Light direction may be lost. For best results, '
					+ 'make light.target a child of the light with position 0,0,-1.' );

			}

			if ( ! extensionsUsed[ this.name ] ) {

				json.extensions = json.extensions || {};
				json.extensions[ this.name ] = { lights: [] };
				extensionsUsed[ this.name ] = true;

			}

			var lights = json.extensions[ this.name ].lights;
			lights.push( lightDef );

			nodeDef.extensions = nodeDef.extensions || {};
			nodeDef.extensions[ this.name ] = { light: lights.length - 1 };

		}

	};

	/**
	 * Unlit Materials Extension
	 *
	 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_unlit
	 */
	function GLTFMaterialsUnlitExtension( writer ) {

		this.writer = writer;
		this.name = 'KHR_materials_unlit';

	}

	GLTFMaterialsUnlitExtension.prototype = {

		constructor: GLTFMaterialsUnlitExtension,

		writeMaterial: function ( material, materialDef ) {

			if ( ! material.isMeshBasicMaterial ) return;

			var writer = this.writer;
			var extensionsUsed = writer.extensionsUsed;

			materialDef.extensions = materialDef.extensions || {};
			materialDef.extensions[ this.name ] = {};

			extensionsUsed[ this.name ] = true;

			materialDef.pbrMetallicRoughness.metallicFactor = 0.0;
			materialDef.pbrMetallicRoughness.roughnessFactor = 0.9;

		}

	};

	/**
	 * Specular-Glossiness Extension
	 *
	 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_pbrSpecularGlossiness
	 */
	function GLTFMaterialsPBRSpecularGlossiness( writer ) {

		this.writer = writer;
		this.name = 'KHR_materials_pbrSpecularGlossiness';

	}

	GLTFMaterialsPBRSpecularGlossiness.prototype = {

		constructor: GLTFMaterialsPBRSpecularGlossiness,

		writeMaterial: function ( material, materialDef ) {

			if ( ! material.isGLTFSpecularGlossinessMaterial ) return;

			var writer = this.writer;
			var extensionsUsed = writer.extensionsUsed;

			var extensionDef = {};

			if ( materialDef.pbrMetallicRoughness.baseColorFactor ) {

				extensionDef.diffuseFactor = materialDef.pbrMetallicRoughness.baseColorFactor;

			}

			var specularFactor = [ 1, 1, 1 ];
			material.specular.toArray( specularFactor, 0 );
			extensionDef.specularFactor = specularFactor;
			extensionDef.glossinessFactor = material.glossiness;

			if ( materialDef.pbrMetallicRoughness.baseColorTexture ) {

				extensionDef.diffuseTexture = materialDef.pbrMetallicRoughness.baseColorTexture;

			}

			if ( material.specularMap ) {

				var specularMapDef = { index: writer.processTexture( material.specularMap ) };
				writer.applyTextureTransform( specularMapDef, material.specularMap );
				extensionDef.specularGlossinessTexture = specularMapDef;

			}

			materialDef.extensions = materialDef.extensions || {};
			materialDef.extensions[ this.name ] = extensionDef;
			extensionsUsed[ this.name ] = true;

		}

	};

	/**
	 * Static utility functions
	 */
	GLTFExporter.Utils = {

		insertKeyframe: function ( track, time ) {

			var tolerance = 0.001; // 1ms
			var valueSize = track.getValueSize();

			var times = new track.TimeBufferType( track.times.length + 1 );
			var values = new track.ValueBufferType( track.values.length + valueSize );
			var interpolant = track.createInterpolant( new track.ValueBufferType( valueSize ) );

			var index;

			if ( track.times.length === 0 ) {

				times[ 0 ] = time;

				for ( var i = 0; i < valueSize; i ++ ) {

					values[ i ] = 0;

				}

				index = 0;

			} else if ( time < track.times[ 0 ] ) {

				if ( Math.abs( track.times[ 0 ] - time ) < tolerance ) return 0;

				times[ 0 ] = time;
				times.set( track.times, 1 );

				values.set( interpolant.evaluate( time ), 0 );
				values.set( track.values, valueSize );

				index = 0;

			} else if ( time > track.times[ track.times.length - 1 ] ) {

				if ( Math.abs( track.times[ track.times.length - 1 ] - time ) < tolerance ) {

					return track.times.length - 1;

				}

				times[ times.length - 1 ] = time;
				times.set( track.times, 0 );

				values.set( track.values, 0 );
				values.set( interpolant.evaluate( time ), track.values.length );

				index = times.length - 1;

			} else {

				for ( var i = 0; i < track.times.length; i ++ ) {

					if ( Math.abs( track.times[ i ] - time ) < tolerance ) return i;

					if ( track.times[ i ] < time && track.times[ i + 1 ] > time ) {

						times.set( track.times.slice( 0, i + 1 ), 0 );
						times[ i + 1 ] = time;
						times.set( track.times.slice( i + 1 ), i + 2 );

						values.set( track.values.slice( 0, ( i + 1 ) * valueSize ), 0 );
						values.set( interpolant.evaluate( time ), ( i + 1 ) * valueSize );
						values.set( track.values.slice( ( i + 1 ) * valueSize ), ( i + 2 ) * valueSize );

						index = i + 1;

						break;

					}

				}

			}

			track.times = times;
			track.values = values;

			return index;

		},

		mergeMorphTargetTracks: function ( clip, root ) {

			var tracks = [];
			var mergedTracks = {};
			var sourceTracks = clip.tracks;

			for ( var i = 0; i < sourceTracks.length; ++ i ) {

				var sourceTrack = sourceTracks[ i ];
				var sourceTrackBinding = THREE.PropertyBinding.parseTrackName( sourceTrack.name );
				var sourceTrackNode = THREE.PropertyBinding.findNode( root, sourceTrackBinding.nodeName );

				if ( sourceTrackBinding.propertyName !== 'morphTargetInfluences' || sourceTrackBinding.propertyIndex === undefined ) {

					// Tracks that don't affect morph targets, or that affect all morph targets together, can be left as-is.
					tracks.push( sourceTrack );
					continue;

				}

				if ( sourceTrack.createInterpolant !== sourceTrack.InterpolantFactoryMethodDiscrete
					&& sourceTrack.createInterpolant !== sourceTrack.InterpolantFactoryMethodLinear ) {

					if ( sourceTrack.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline ) {

						// This should never happen, because glTF morph target animations
						// affect all targets already.
						throw new Error( 'THREE.GLTFExporter: Cannot merge tracks with glTF CUBICSPLINE interpolation.' );

					}

					console.warn( 'THREE.GLTFExporter: Morph target interpolation mode not yet supported. Using LINEAR instead.' );

					sourceTrack = sourceTrack.clone();
					sourceTrack.setInterpolation( THREE.InterpolateLinear );

				}

				var targetCount = sourceTrackNode.morphTargetInfluences.length;
				var targetIndex = sourceTrackNode.morphTargetDictionary[ sourceTrackBinding.propertyIndex ];

				if ( targetIndex === undefined ) {

					throw new Error( 'THREE.GLTFExporter: Morph target name not found: ' + sourceTrackBinding.propertyIndex );

				}

				var mergedTrack;

				// If this is the first time we've seen this object, create a new
				// track to store merged keyframe data for each morph target.
				if ( mergedTracks[ sourceTrackNode.uuid ] === undefined ) {

					mergedTrack = sourceTrack.clone();

					var values = new mergedTrack.ValueBufferType( targetCount * mergedTrack.times.length );

					for ( var j = 0; j < mergedTrack.times.length; j ++ ) {

						values[ j * targetCount + targetIndex ] = mergedTrack.values[ j ];

					}

					// We need to take into consideration the intended target node
					// of our original un-merged morphTarget animation.
					mergedTrack.name = ( sourceTrackBinding.nodeName || '' ) + '.morphTargetInfluences';
					mergedTrack.values = values;

					mergedTracks[ sourceTrackNode.uuid ] = mergedTrack;
					tracks.push( mergedTrack );

					continue;

				}

				var sourceInterpolant = sourceTrack.createInterpolant( new sourceTrack.ValueBufferType( 1 ) );

				mergedTrack = mergedTracks[ sourceTrackNode.uuid ];

				// For every existing keyframe of the merged track, write a (possibly
				// interpolated) value from the source track.
				for ( var j = 0; j < mergedTrack.times.length; j ++ ) {

					mergedTrack.values[ j * targetCount + targetIndex ] = sourceInterpolant.evaluate( mergedTrack.times[ j ] );

				}

				// For every existing keyframe of the source track, write a (possibly
				// new) keyframe to the merged track. Values from the previous loop may
				// be written again, but keyframes are de-duplicated.
				for ( var j = 0; j < sourceTrack.times.length; j ++ ) {

					var keyframeIndex = this.insertKeyframe( mergedTrack, sourceTrack.times[ j ] );
					mergedTrack.values[ keyframeIndex * targetCount + targetIndex ] = sourceTrack.values[ j ];

				}

			}

			clip.tracks = tracks;

			return clip;

		}

	};

	return GLTFExporter;

} )();
