( function () {

	class GLTFExporter {

		constructor() {

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
			this.register( function ( writer ) {

				return new GLTFMaterialsTransmissionExtension( writer );

			} );
			this.register( function ( writer ) {

				return new GLTFMaterialsVolumeExtension( writer );

			} );
			this.register( function ( writer ) {

				return new GLTFMaterialsClearcoatExtension( writer );

			} );
			this.register( function ( writer ) {

				return new GLTFMaterialsIridescenceExtension( writer );

			} );

		}

		register( callback ) {

			if ( this.pluginCallbacks.indexOf( callback ) === - 1 ) {

				this.pluginCallbacks.push( callback );

			}

			return this;

		}

		unregister( callback ) {

			if ( this.pluginCallbacks.indexOf( callback ) !== - 1 ) {

				this.pluginCallbacks.splice( this.pluginCallbacks.indexOf( callback ), 1 );

			}

			return this;

		}
		/**
   * Parse scenes and generate GLTF output
   * @param  {Scene or [THREE.Scenes]} input   THREE.Scene or Array of THREE.Scenes
   * @param  {Function} onDone  Callback on completed
   * @param  {Function} onError  Callback on errors
   * @param  {Object} options options
   */


		parse( input, onDone, onError, options ) {

			if ( typeof onError === 'object' ) {

				console.warn( 'THREE.GLTFExporter: parse() expects options as the fourth argument now.' );
				options = onError;

			}

			const writer = new GLTFWriter();
			const plugins = [];

			for ( let i = 0, il = this.pluginCallbacks.length; i < il; i ++ ) {

				plugins.push( this.pluginCallbacks[ i ]( writer ) );

			}

			writer.setPlugins( plugins );
			writer.write( input, onDone, options ).catch( onError );

		}

		parseAsync( input, options ) {

			const scope = this;
			return new Promise( function ( resolve, reject ) {

				scope.parse( input, resolve, reject, options );

			} );

		}

	} //------------------------------------------------------------------------------
	// Constants
	//------------------------------------------------------------------------------


	const WEBGL_CONSTANTS = {
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
	const THREE_TO_WEBGL = {};
	THREE_TO_WEBGL[ THREE.NearestFilter ] = WEBGL_CONSTANTS.NEAREST;
	THREE_TO_WEBGL[ THREE.NearestMipmapNearestFilter ] = WEBGL_CONSTANTS.NEAREST_MIPMAP_NEAREST;
	THREE_TO_WEBGL[ THREE.NearestMipmapLinearFilter ] = WEBGL_CONSTANTS.NEAREST_MIPMAP_LINEAR;
	THREE_TO_WEBGL[ THREE.LinearFilter ] = WEBGL_CONSTANTS.LINEAR;
	THREE_TO_WEBGL[ THREE.LinearMipmapNearestFilter ] = WEBGL_CONSTANTS.LINEAR_MIPMAP_NEAREST;
	THREE_TO_WEBGL[ THREE.LinearMipmapLinearFilter ] = WEBGL_CONSTANTS.LINEAR_MIPMAP_LINEAR;
	THREE_TO_WEBGL[ THREE.ClampToEdgeWrapping ] = WEBGL_CONSTANTS.CLAMP_TO_EDGE;
	THREE_TO_WEBGL[ THREE.RepeatWrapping ] = WEBGL_CONSTANTS.REPEAT;
	THREE_TO_WEBGL[ THREE.MirroredRepeatWrapping ] = WEBGL_CONSTANTS.MIRRORED_REPEAT;
	const PATH_PROPERTIES = {
		scale: 'scale',
		position: 'translation',
		quaternion: 'rotation',
		morphTargetInfluences: 'weights'
	}; // GLB constants
	// https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#glb-file-format-specification

	const GLB_HEADER_BYTES = 12;
	const GLB_HEADER_MAGIC = 0x46546C67;
	const GLB_VERSION = 2;
	const GLB_CHUNK_PREFIX_BYTES = 8;
	const GLB_CHUNK_TYPE_JSON = 0x4E4F534A;
	const GLB_CHUNK_TYPE_BIN = 0x004E4942; //------------------------------------------------------------------------------
	// Utility functions
	//------------------------------------------------------------------------------

	/**
 * Compare two arrays
 * @param  {Array} array1 Array 1 to compare
 * @param  {Array} array2 Array 2 to compare
 * @return {Boolean}        Returns true if both arrays are equal
 */

	function equalArray( array1, array2 ) {

		return array1.length === array2.length && array1.every( function ( element, index ) {

			return element === array2[ index ];

		} );

	}
	/**
 * Converts a string to an ArrayBuffer.
 * @param  {string} text
 * @return {ArrayBuffer}
 */


	function stringToArrayBuffer( text ) {

		return new TextEncoder().encode( text ).buffer;

	}
	/**
 * Is identity matrix
 *
 * @param {Matrix4} matrix
 * @returns {Boolean} Returns true, if parameter is identity matrix
 */


	function isIdentityMatrix( matrix ) {

		return equalArray( matrix.elements, [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ] );

	}
	/**
 * Get the min and max vectors from the given attribute
 * @param  {BufferAttribute} attribute Attribute to find the min/max in range from start to start + count
 * @param  {Integer} start
 * @param  {Integer} count
 * @return {Object} Object containing the `min` and `max` values (As an array of attribute.itemSize components)
 */


	function getMinMax( attribute, start, count ) {

		const output = {
			min: new Array( attribute.itemSize ).fill( Number.POSITIVE_INFINITY ),
			max: new Array( attribute.itemSize ).fill( Number.NEGATIVE_INFINITY )
		};

		for ( let i = start; i < start + count; i ++ ) {

			for ( let a = 0; a < attribute.itemSize; a ++ ) {

				let value;

				if ( attribute.itemSize > 4 ) {

					// no support for interleaved data for itemSize > 4
					value = attribute.array[ i * attribute.itemSize + a ];

				} else {

					if ( a === 0 ) value = attribute.getX( i ); else if ( a === 1 ) value = attribute.getY( i ); else if ( a === 2 ) value = attribute.getZ( i ); else if ( a === 3 ) value = attribute.getW( i );

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


	function getPaddedArrayBuffer( arrayBuffer, paddingByte = 0 ) {

		const paddedLength = getPaddedBufferSize( arrayBuffer.byteLength );

		if ( paddedLength !== arrayBuffer.byteLength ) {

			const array = new Uint8Array( paddedLength );
			array.set( new Uint8Array( arrayBuffer ) );

			if ( paddingByte !== 0 ) {

				for ( let i = arrayBuffer.byteLength; i < paddedLength; i ++ ) {

					array[ i ] = paddingByte;

				}

			}

			return array.buffer;

		}

		return arrayBuffer;

	}

	function getCanvas() {

		if ( typeof document === 'undefined' && typeof OffscreenCanvas !== 'undefined' ) {

			return new OffscreenCanvas( 1, 1 );

		}

		return document.createElement( 'canvas' );

	}

	function getToBlobPromise( canvas, mimeType ) {

		if ( canvas.toBlob !== undefined ) {

			return new Promise( resolve => canvas.toBlob( resolve, mimeType ) );

		}

		let quality; // Blink's implementation of convertToBlob seems to default to a quality level of 100%
		// Use the Blink default quality levels of toBlob instead so that file sizes are comparable.

		if ( mimeType === 'image/jpeg' ) {

			quality = 0.92;

		} else if ( mimeType === 'image/webp' ) {

			quality = 0.8;

		}

		return canvas.convertToBlob( {
			type: mimeType,
			quality: quality
		} );

	}
	/**
 * Writer
 */


	class GLTFWriter {

		constructor() {

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

		setPlugins( plugins ) {

			this.plugins = plugins;

		}
		/**
   * Parse scenes and generate GLTF output
   * @param  {Scene or [THREE.Scenes]} input   THREE.Scene or Array of THREE.Scenes
   * @param  {Function} onDone  Callback on completed
   * @param  {Object} options options
   */


		async write( input, onDone, options ) {

			this.options = Object.assign( {}, {
				// default options
				binary: false,
				trs: false,
				onlyVisible: true,
				truncateDrawRange: true,
				maxTextureSize: Infinity,
				animations: [],
				includeCustomExtensions: false
			}, options );

			if ( this.options.animations.length > 0 ) {

				// Only TRS properties, and not matrices, may be targeted by animation.
				this.options.trs = true;

			}

			this.processInput( input );
			await Promise.all( this.pending );
			const writer = this;
			const buffers = writer.buffers;
			const json = writer.json;
			options = writer.options;
			const extensionsUsed = writer.extensionsUsed; // Merge buffers.

			const blob = new Blob( buffers, {
				type: 'application/octet-stream'
			} ); // Declare extensions.

			const extensionsUsedList = Object.keys( extensionsUsed );
			if ( extensionsUsedList.length > 0 ) json.extensionsUsed = extensionsUsedList; // Update bytelength of the single buffer.

			if ( json.buffers && json.buffers.length > 0 ) json.buffers[ 0 ].byteLength = blob.size;

			if ( options.binary === true ) {

				// https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#glb-file-format-specification
				const reader = new FileReader();
				reader.readAsArrayBuffer( blob );

				reader.onloadend = function () {

					// Binary chunk.
					const binaryChunk = getPaddedArrayBuffer( reader.result );
					const binaryChunkPrefix = new DataView( new ArrayBuffer( GLB_CHUNK_PREFIX_BYTES ) );
					binaryChunkPrefix.setUint32( 0, binaryChunk.byteLength, true );
					binaryChunkPrefix.setUint32( 4, GLB_CHUNK_TYPE_BIN, true ); // JSON chunk.

					const jsonChunk = getPaddedArrayBuffer( stringToArrayBuffer( JSON.stringify( json ) ), 0x20 );
					const jsonChunkPrefix = new DataView( new ArrayBuffer( GLB_CHUNK_PREFIX_BYTES ) );
					jsonChunkPrefix.setUint32( 0, jsonChunk.byteLength, true );
					jsonChunkPrefix.setUint32( 4, GLB_CHUNK_TYPE_JSON, true ); // GLB header.

					const header = new ArrayBuffer( GLB_HEADER_BYTES );
					const headerView = new DataView( header );
					headerView.setUint32( 0, GLB_HEADER_MAGIC, true );
					headerView.setUint32( 4, GLB_VERSION, true );
					const totalByteLength = GLB_HEADER_BYTES + jsonChunkPrefix.byteLength + jsonChunk.byteLength + binaryChunkPrefix.byteLength + binaryChunk.byteLength;
					headerView.setUint32( 8, totalByteLength, true );
					const glbBlob = new Blob( [ header, jsonChunkPrefix, jsonChunk, binaryChunkPrefix, binaryChunk ], {
						type: 'application/octet-stream'
					} );
					const glbReader = new FileReader();
					glbReader.readAsArrayBuffer( glbBlob );

					glbReader.onloadend = function () {

						onDone( glbReader.result );

					};

				};

			} else {

				if ( json.buffers && json.buffers.length > 0 ) {

					const reader = new FileReader();
					reader.readAsDataURL( blob );

					reader.onloadend = function () {

						const base64data = reader.result;
						json.buffers[ 0 ].uri = base64data;
						onDone( json );

					};

				} else {

					onDone( json );

				}

			}

		}
		/**
   * Serializes a userData.
   *
   * @param {THREE.Object3D|THREE.Material} object
   * @param {Object} objectDef
   */


		serializeUserData( object, objectDef ) {

			if ( Object.keys( object.userData ).length === 0 ) return;
			const options = this.options;
			const extensionsUsed = this.extensionsUsed;

			try {

				const json = JSON.parse( JSON.stringify( object.userData ) );

				if ( options.includeCustomExtensions && json.gltfExtensions ) {

					if ( objectDef.extensions === undefined ) objectDef.extensions = {};

					for ( const extensionName in json.gltfExtensions ) {

						objectDef.extensions[ extensionName ] = json.gltfExtensions[ extensionName ];
						extensionsUsed[ extensionName ] = true;

					}

					delete json.gltfExtensions;

				}

				if ( Object.keys( json ).length > 0 ) objectDef.extras = json;

			} catch ( error ) {

				console.warn( 'THREE.GLTFExporter: userData of \'' + object.name + '\' ' + 'won\'t be serialized because of JSON.stringify error - ' + error.message );

			}

		}
		/**
   * Returns ids for buffer attributes.
   * @param  {Object} object
   * @return {Integer}
   */


		getUID( attribute, isRelativeCopy = false ) {

			if ( this.uids.has( attribute ) === false ) {

				const uids = new Map();
				uids.set( true, this.uid ++ );
				uids.set( false, this.uid ++ );
				this.uids.set( attribute, uids );

			}

			const uids = this.uids.get( attribute );
			return uids.get( isRelativeCopy );

		}
		/**
   * Checks if normal attribute values are normalized.
   *
   * @param {BufferAttribute} normal
   * @returns {Boolean}
   */


		isNormalizedNormalAttribute( normal ) {

			const cache = this.cache;
			if ( cache.attributesNormalized.has( normal ) ) return false;
			const v = new THREE.Vector3();

			for ( let i = 0, il = normal.count; i < il; i ++ ) {

				// 0.0005 is from glTF-validator
				if ( Math.abs( v.fromBufferAttribute( normal, i ).length() - 1.0 ) > 0.0005 ) return false;

			}

			return true;

		}
		/**
   * Creates normalized normal buffer attribute.
   *
   * @param {BufferAttribute} normal
   * @returns {BufferAttribute}
   *
   */


		createNormalizedNormalAttribute( normal ) {

			const cache = this.cache;
			if ( cache.attributesNormalized.has( normal ) ) return cache.attributesNormalized.get( normal );
			const attribute = normal.clone();
			const v = new THREE.Vector3();

			for ( let i = 0, il = attribute.count; i < il; i ++ ) {

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

		}
		/**
   * Applies a texture transform, if present, to the map definition. Requires
   * the KHR_texture_transform extension.
   *
   * @param {Object} mapDef
   * @param {THREE.Texture} texture
   */


		applyTextureTransform( mapDef, texture ) {

			let didTransform = false;
			const transformDef = {};

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

		}

		buildMetalRoughTexture( metalnessMap, roughnessMap ) {

			if ( metalnessMap === roughnessMap ) return metalnessMap;

			function getEncodingConversion( map ) {

				if ( map.encoding === THREE.sRGBEncoding ) {

					return function SRGBToLinear( c ) {

						return c < 0.04045 ? c * 0.0773993808 : Math.pow( c * 0.9478672986 + 0.0521327014, 2.4 );

					};

				}

				return function LinearToLinear( c ) {

					return c;

				};

			}

			console.warn( 'THREE.GLTFExporter: Merged metalnessMap and roughnessMap textures.' );
			const metalness = metalnessMap?.image;
			const roughness = roughnessMap?.image;
			const width = Math.max( metalness?.width || 0, roughness?.width || 0 );
			const height = Math.max( metalness?.height || 0, roughness?.height || 0 );
			const canvas = getCanvas();
			canvas.width = width;
			canvas.height = height;
			const context = canvas.getContext( '2d' );
			context.fillStyle = '#00ffff';
			context.fillRect( 0, 0, width, height );
			const composite = context.getImageData( 0, 0, width, height );

			if ( metalness ) {

				context.drawImage( metalness, 0, 0, width, height );
				const convert = getEncodingConversion( metalnessMap );
				const data = context.getImageData( 0, 0, width, height ).data;

				for ( let i = 2; i < data.length; i += 4 ) {

					composite.data[ i ] = convert( data[ i ] / 256 ) * 256;

				}

			}

			if ( roughness ) {

				context.drawImage( roughness, 0, 0, width, height );
				const convert = getEncodingConversion( roughnessMap );
				const data = context.getImageData( 0, 0, width, height ).data;

				for ( let i = 1; i < data.length; i += 4 ) {

					composite.data[ i ] = convert( data[ i ] / 256 ) * 256;

				}

			}

			context.putImageData( composite, 0, 0 ); //

			const reference = metalnessMap || roughnessMap;
			const texture = reference.clone();
			texture.source = new THREE.Source( canvas );
			texture.encoding = THREE.LinearEncoding;
			return texture;

		}
		/**
   * Process a buffer to append to the default one.
   * @param  {ArrayBuffer} buffer
   * @return {Integer}
   */


		processBuffer( buffer ) {

			const json = this.json;
			const buffers = this.buffers;
			if ( ! json.buffers ) json.buffers = [ {
				byteLength: 0
			} ]; // All buffers are merged before export.

			buffers.push( buffer );
			return 0;

		}
		/**
   * Process and generate a BufferView
   * @param  {BufferAttribute} attribute
   * @param  {number} componentType
   * @param  {number} start
   * @param  {number} count
   * @param  {number} target (Optional) Target usage of the BufferView
   * @return {Object}
   */


		processBufferView( attribute, componentType, start, count, target ) {

			const json = this.json;
			if ( ! json.bufferViews ) json.bufferViews = []; // Create a new dataview and dump the attribute's array into it

			let componentSize;

			if ( componentType === WEBGL_CONSTANTS.UNSIGNED_BYTE ) {

				componentSize = 1;

			} else if ( componentType === WEBGL_CONSTANTS.UNSIGNED_SHORT ) {

				componentSize = 2;

			} else {

				componentSize = 4;

			}

			const byteLength = getPaddedBufferSize( count * attribute.itemSize * componentSize );
			const dataView = new DataView( new ArrayBuffer( byteLength ) );
			let offset = 0;

			for ( let i = start; i < start + count; i ++ ) {

				for ( let a = 0; a < attribute.itemSize; a ++ ) {

					let value;

					if ( attribute.itemSize > 4 ) {

						// no support for interleaved data for itemSize > 4
						value = attribute.array[ i * attribute.itemSize + a ];

					} else {

						if ( a === 0 ) value = attribute.getX( i ); else if ( a === 1 ) value = attribute.getY( i ); else if ( a === 2 ) value = attribute.getZ( i ); else if ( a === 3 ) value = attribute.getW( i );

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

			const bufferViewDef = {
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
			json.bufferViews.push( bufferViewDef ); // @TODO Merge bufferViews where possible.

			const output = {
				id: json.bufferViews.length - 1,
				byteLength: 0
			};
			return output;

		}
		/**
   * Process and generate a BufferView from an image Blob.
   * @param {Blob} blob
   * @return {Promise<Integer>}
   */


		processBufferViewImage( blob ) {

			const writer = this;
			const json = writer.json;
			if ( ! json.bufferViews ) json.bufferViews = [];
			return new Promise( function ( resolve ) {

				const reader = new FileReader();
				reader.readAsArrayBuffer( blob );

				reader.onloadend = function () {

					const buffer = getPaddedArrayBuffer( reader.result );
					const bufferViewDef = {
						buffer: writer.processBuffer( buffer ),
						byteOffset: writer.byteOffset,
						byteLength: buffer.byteLength
					};
					writer.byteOffset += buffer.byteLength;
					resolve( json.bufferViews.push( bufferViewDef ) - 1 );

				};

			} );

		}
		/**
   * Process attribute to generate an accessor
   * @param  {BufferAttribute} attribute Attribute to process
   * @param  {THREE.BufferGeometry} geometry (Optional) Geometry used for truncated draw range
   * @param  {Integer} start (Optional)
   * @param  {Integer} count (Optional)
   * @return {Integer|null} Index of the processed accessor on the "accessors" array
   */


		processAccessor( attribute, geometry, start, count ) {

			const options = this.options;
			const json = this.json;
			const types = {
				1: 'SCALAR',
				2: 'VEC2',
				3: 'VEC3',
				4: 'VEC4',
				16: 'MAT4'
			};
			let componentType; // Detect the component type of the attribute array (float, uint or ushort)

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
			if ( count === undefined ) count = attribute.count; // @TODO Indexed buffer geometry with drawRange not supported yet

			if ( options.truncateDrawRange && geometry !== undefined && geometry.index === null ) {

				const end = start + count;
				const end2 = geometry.drawRange.count === Infinity ? attribute.count : geometry.drawRange.start + geometry.drawRange.count;
				start = Math.max( start, geometry.drawRange.start );
				count = Math.min( end, end2 ) - start;
				if ( count < 0 ) count = 0;

			} // Skip creating an accessor if the attribute doesn't have data to export


			if ( count === 0 ) return null;
			const minMax = getMinMax( attribute, start, count );
			let bufferViewTarget; // If geometry isn't provided, don't infer the target usage of the bufferView. For
			// animation samplers, target must not be set.

			if ( geometry !== undefined ) {

				bufferViewTarget = attribute === geometry.index ? WEBGL_CONSTANTS.ELEMENT_ARRAY_BUFFER : WEBGL_CONSTANTS.ARRAY_BUFFER;

			}

			const bufferView = this.processBufferView( attribute, componentType, start, count, bufferViewTarget );
			const accessorDef = {
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

		}
		/**
   * Process image
   * @param  {Image} image to process
   * @param  {Integer} format of the image (THREE.RGBAFormat)
   * @param  {Boolean} flipY before writing out the image
   * @param  {String} mimeType export format
   * @return {Integer}     Index of the processed texture in the "images" array
   */


		processImage( image, format, flipY, mimeType = 'image/png' ) {

			const writer = this;
			const cache = writer.cache;
			const json = writer.json;
			const options = writer.options;
			const pending = writer.pending;
			if ( ! cache.images.has( image ) ) cache.images.set( image, {} );
			const cachedImages = cache.images.get( image );
			const key = mimeType + ':flipY/' + flipY.toString();
			if ( cachedImages[ key ] !== undefined ) return cachedImages[ key ];
			if ( ! json.images ) json.images = [];
			const imageDef = {
				mimeType: mimeType
			};
			const canvas = getCanvas();
			canvas.width = Math.min( image.width, options.maxTextureSize );
			canvas.height = Math.min( image.height, options.maxTextureSize );
			const ctx = canvas.getContext( '2d' );

			if ( flipY === true ) {

				ctx.translate( 0, canvas.height );
				ctx.scale( 1, - 1 );

			}

			if ( image.data !== undefined ) {

				// THREE.DataTexture
				if ( format !== THREE.RGBAFormat ) {

					console.error( 'GLTFExporter: Only THREE.RGBAFormat is supported.' );

				}

				if ( image.width > options.maxTextureSize || image.height > options.maxTextureSize ) {

					console.warn( 'GLTFExporter: Image size is bigger than maxTextureSize', image );

				}

				const data = new Uint8ClampedArray( image.height * image.width * 4 );

				for ( let i = 0; i < data.length; i += 4 ) {

					data[ i + 0 ] = image.data[ i + 0 ];
					data[ i + 1 ] = image.data[ i + 1 ];
					data[ i + 2 ] = image.data[ i + 2 ];
					data[ i + 3 ] = image.data[ i + 3 ];

				}

				ctx.putImageData( new ImageData( data, image.width, image.height ), 0, 0 );

			} else {

				ctx.drawImage( image, 0, 0, canvas.width, canvas.height );

			}

			if ( options.binary === true ) {

				pending.push( getToBlobPromise( canvas, mimeType ).then( blob => writer.processBufferViewImage( blob ) ).then( bufferViewIndex => {

					imageDef.bufferView = bufferViewIndex;

				} ) );

			} else {

				if ( canvas.toDataURL !== undefined ) {

					imageDef.uri = canvas.toDataURL( mimeType );

				} else {

					pending.push( getToBlobPromise( canvas, mimeType ).then( blob => new FileReader().readAsDataURL( blob ) ).then( dataURL => {

						imageDef.uri = dataURL;

					} ) );

				}

			}

			const index = json.images.push( imageDef ) - 1;
			cachedImages[ key ] = index;
			return index;

		}
		/**
   * Process sampler
   * @param  {Texture} map Texture to process
   * @return {Integer}     Index of the processed texture in the "samplers" array
   */


		processSampler( map ) {

			const json = this.json;
			if ( ! json.samplers ) json.samplers = [];
			const samplerDef = {
				magFilter: THREE_TO_WEBGL[ map.magFilter ],
				minFilter: THREE_TO_WEBGL[ map.minFilter ],
				wrapS: THREE_TO_WEBGL[ map.wrapS ],
				wrapT: THREE_TO_WEBGL[ map.wrapT ]
			};
			return json.samplers.push( samplerDef ) - 1;

		}
		/**
   * Process texture
   * @param  {Texture} map Map to process
   * @return {Integer} Index of the processed texture in the "textures" array
   */


		processTexture( map ) {

			const cache = this.cache;
			const json = this.json;
			if ( cache.textures.has( map ) ) return cache.textures.get( map );
			if ( ! json.textures ) json.textures = [];
			let mimeType = map.userData.mimeType;
			if ( mimeType === 'image/webp' ) mimeType = 'image/png';
			const textureDef = {
				sampler: this.processSampler( map ),
				source: this.processImage( map.image, map.format, map.flipY, mimeType )
			};
			if ( map.name ) textureDef.name = map.name;

			this._invokeAll( function ( ext ) {

				ext.writeTexture && ext.writeTexture( map, textureDef );

			} );

			const index = json.textures.push( textureDef ) - 1;
			cache.textures.set( map, index );
			return index;

		}
		/**
   * Process material
   * @param  {THREE.Material} material Material to process
   * @return {Integer|null} Index of the processed material in the "materials" array
   */


		processMaterial( material ) {

			const cache = this.cache;
			const json = this.json;
			if ( cache.materials.has( material ) ) return cache.materials.get( material );

			if ( material.isShaderMaterial ) {

				console.warn( 'GLTFExporter: THREE.ShaderMaterial not supported.' );
				return null;

			}

			if ( ! json.materials ) json.materials = []; // @QUESTION Should we avoid including any attribute that has the default value?

			const materialDef = {
				pbrMetallicRoughness: {}
			};

			if ( material.isMeshStandardMaterial !== true && material.isMeshBasicMaterial !== true ) {

				console.warn( 'GLTFExporter: Use MeshStandardMaterial or MeshBasicMaterial for best results.' );

			} // pbrMetallicRoughness.baseColorFactor


			const color = material.color.toArray().concat( [ material.opacity ] );

			if ( ! equalArray( color, [ 1, 1, 1, 1 ] ) ) {

				materialDef.pbrMetallicRoughness.baseColorFactor = color;

			}

			if ( material.isMeshStandardMaterial ) {

				materialDef.pbrMetallicRoughness.metallicFactor = material.metalness;
				materialDef.pbrMetallicRoughness.roughnessFactor = material.roughness;

			} else {

				materialDef.pbrMetallicRoughness.metallicFactor = 0.5;
				materialDef.pbrMetallicRoughness.roughnessFactor = 0.5;

			} // pbrMetallicRoughness.metallicRoughnessTexture


			if ( material.metalnessMap || material.roughnessMap ) {

				const metalRoughTexture = this.buildMetalRoughTexture( material.metalnessMap, material.roughnessMap );
				const metalRoughMapDef = {
					index: this.processTexture( metalRoughTexture )
				};
				this.applyTextureTransform( metalRoughMapDef, metalRoughTexture );
				materialDef.pbrMetallicRoughness.metallicRoughnessTexture = metalRoughMapDef;

			} // pbrMetallicRoughness.baseColorTexture or pbrSpecularGlossiness diffuseTexture


			if ( material.map ) {

				const baseColorMapDef = {
					index: this.processTexture( material.map )
				};
				this.applyTextureTransform( baseColorMapDef, material.map );
				materialDef.pbrMetallicRoughness.baseColorTexture = baseColorMapDef;

			}

			if ( material.emissive ) {

				// note: emissive components are limited to stay within the 0 - 1 range to accommodate glTF spec. see #21849 and #22000.
				const emissive = material.emissive.clone().multiplyScalar( material.emissiveIntensity );
				const maxEmissiveComponent = Math.max( emissive.r, emissive.g, emissive.b );

				if ( maxEmissiveComponent > 1 ) {

					emissive.multiplyScalar( 1 / maxEmissiveComponent );
					console.warn( 'THREE.GLTFExporter: Some emissive components exceed 1; emissive has been limited' );

				}

				if ( maxEmissiveComponent > 0 ) {

					materialDef.emissiveFactor = emissive.toArray();

				} // emissiveTexture


				if ( material.emissiveMap ) {

					const emissiveMapDef = {
						index: this.processTexture( material.emissiveMap )
					};
					this.applyTextureTransform( emissiveMapDef, material.emissiveMap );
					materialDef.emissiveTexture = emissiveMapDef;

				}

			} // normalTexture


			if ( material.normalMap ) {

				const normalMapDef = {
					index: this.processTexture( material.normalMap )
				};

				if ( material.normalScale && material.normalScale.x !== 1 ) {

					// glTF normal scale is univariate. Ignore `y`, which may be flipped.
					// Context: https://github.com/mrdoob/three.js/issues/11438#issuecomment-507003995
					normalMapDef.scale = material.normalScale.x;

				}

				this.applyTextureTransform( normalMapDef, material.normalMap );
				materialDef.normalTexture = normalMapDef;

			} // occlusionTexture


			if ( material.aoMap ) {

				const occlusionMapDef = {
					index: this.processTexture( material.aoMap ),
					texCoord: 1
				};

				if ( material.aoMapIntensity !== 1.0 ) {

					occlusionMapDef.strength = material.aoMapIntensity;

				}

				this.applyTextureTransform( occlusionMapDef, material.aoMap );
				materialDef.occlusionTexture = occlusionMapDef;

			} // alphaMode


			if ( material.transparent ) {

				materialDef.alphaMode = 'BLEND';

			} else {

				if ( material.alphaTest > 0.0 ) {

					materialDef.alphaMode = 'MASK';
					materialDef.alphaCutoff = material.alphaTest;

				}

			} // doubleSided


			if ( material.side === THREE.DoubleSide ) materialDef.doubleSided = true;
			if ( material.name !== '' ) materialDef.name = material.name;
			this.serializeUserData( material, materialDef );

			this._invokeAll( function ( ext ) {

				ext.writeMaterial && ext.writeMaterial( material, materialDef );

			} );

			const index = json.materials.push( materialDef ) - 1;
			cache.materials.set( material, index );
			return index;

		}
		/**
   * Process mesh
   * @param  {THREE.Mesh} mesh Mesh to process
   * @return {Integer|null} Index of the processed mesh in the "meshes" array
   */


		processMesh( mesh ) {

			const cache = this.cache;
			const json = this.json;
			const meshCacheKeyParts = [ mesh.geometry.uuid ];

			if ( Array.isArray( mesh.material ) ) {

				for ( let i = 0, l = mesh.material.length; i < l; i ++ ) {

					meshCacheKeyParts.push( mesh.material[ i ].uuid );

				}

			} else {

				meshCacheKeyParts.push( mesh.material.uuid );

			}

			const meshCacheKey = meshCacheKeyParts.join( ':' );
			if ( cache.meshes.has( meshCacheKey ) ) return cache.meshes.get( meshCacheKey );
			const geometry = mesh.geometry;
			let mode; // Use the correct mode

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

			const meshDef = {};
			const attributes = {};
			const primitives = [];
			const targets = []; // Conversion between attributes names in threejs and gltf spec

			const nameConversion = {
				uv: 'TEXCOORD_0',
				uv2: 'TEXCOORD_1',
				color: 'COLOR_0',
				skinWeight: 'WEIGHTS_0',
				skinIndex: 'JOINTS_0'
			};
			const originalNormal = geometry.getAttribute( 'normal' );

			if ( originalNormal !== undefined && ! this.isNormalizedNormalAttribute( originalNormal ) ) {

				console.warn( 'THREE.GLTFExporter: Creating normalized normal attribute from the non-normalized one.' );
				geometry.setAttribute( 'normal', this.createNormalizedNormalAttribute( originalNormal ) );

			} // @QUESTION Detect if .vertexColors = true?
			// For every attribute create an accessor


			let modifiedAttribute = null;

			for ( let attributeName in geometry.attributes ) {

				// Ignore morph target attributes, which are exported later.
				if ( attributeName.slice( 0, 5 ) === 'morph' ) continue;
				const attribute = geometry.attributes[ attributeName ];
				attributeName = nameConversion[ attributeName ] || attributeName.toUpperCase(); // Prefix all geometry attributes except the ones specifically
				// listed in the spec; non-spec attributes are considered custom.

				const validVertexAttributes = /^(POSITION|NORMAL|TANGENT|TEXCOORD_\d+|COLOR_\d+|JOINTS_\d+|WEIGHTS_\d+)$/;
				if ( ! validVertexAttributes.test( attributeName ) ) attributeName = '_' + attributeName;

				if ( cache.attributes.has( this.getUID( attribute ) ) ) {

					attributes[ attributeName ] = cache.attributes.get( this.getUID( attribute ) );
					continue;

				} // JOINTS_0 must be UNSIGNED_BYTE or UNSIGNED_SHORT.


				modifiedAttribute = null;
				const array = attribute.array;

				if ( attributeName === 'JOINTS_0' && ! ( array instanceof Uint16Array ) && ! ( array instanceof Uint8Array ) ) {

					console.warn( 'GLTFExporter: Attribute "skinIndex" converted to type UNSIGNED_SHORT.' );
					modifiedAttribute = new THREE.BufferAttribute( new Uint16Array( array ), attribute.itemSize, attribute.normalized );

				}

				const accessor = this.processAccessor( modifiedAttribute || attribute, geometry );

				if ( accessor !== null ) {

					attributes[ attributeName ] = accessor;
					cache.attributes.set( this.getUID( attribute ), accessor );

				}

			}

			if ( originalNormal !== undefined ) geometry.setAttribute( 'normal', originalNormal ); // Skip if no exportable attributes found

			if ( Object.keys( attributes ).length === 0 ) return null; // Morph targets

			if ( mesh.morphTargetInfluences !== undefined && mesh.morphTargetInfluences.length > 0 ) {

				const weights = [];
				const targetNames = [];
				const reverseDictionary = {};

				if ( mesh.morphTargetDictionary !== undefined ) {

					for ( const key in mesh.morphTargetDictionary ) {

						reverseDictionary[ mesh.morphTargetDictionary[ key ] ] = key;

					}

				}

				for ( let i = 0; i < mesh.morphTargetInfluences.length; ++ i ) {

					const target = {};
					let warned = false;

					for ( const attributeName in geometry.morphAttributes ) {

						// glTF 2.0 morph supports only POSITION/NORMAL/TANGENT.
						// Three.js doesn't support TANGENT yet.
						if ( attributeName !== 'position' && attributeName !== 'normal' ) {

							if ( ! warned ) {

								console.warn( 'GLTFExporter: Only POSITION and NORMAL morph are supported.' );
								warned = true;

							}

							continue;

						}

						const attribute = geometry.morphAttributes[ attributeName ][ i ];
						const gltfAttributeName = attributeName.toUpperCase(); // Three.js morph attribute has absolute values while the one of glTF has relative values.
						//
						// glTF 2.0 Specification:
						// https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#morph-targets

						const baseAttribute = geometry.attributes[ attributeName ];

						if ( cache.attributes.has( this.getUID( attribute, true ) ) ) {

							target[ gltfAttributeName ] = cache.attributes.get( this.getUID( attribute, true ) );
							continue;

						} // Clones attribute not to override


						const relativeAttribute = attribute.clone();

						if ( ! geometry.morphTargetsRelative ) {

							for ( let j = 0, jl = attribute.count; j < jl; j ++ ) {

								relativeAttribute.setXYZ( j, attribute.getX( j ) - baseAttribute.getX( j ), attribute.getY( j ) - baseAttribute.getY( j ), attribute.getZ( j ) - baseAttribute.getZ( j ) );

							}

						}

						target[ gltfAttributeName ] = this.processAccessor( relativeAttribute, geometry );
						cache.attributes.set( this.getUID( baseAttribute, true ), target[ gltfAttributeName ] );

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

			const isMultiMaterial = Array.isArray( mesh.material );
			if ( isMultiMaterial && geometry.groups.length === 0 ) return null;
			const materials = isMultiMaterial ? mesh.material : [ mesh.material ];
			const groups = isMultiMaterial ? geometry.groups : [ {
				materialIndex: 0,
				start: undefined,
				count: undefined
			} ];

			for ( let i = 0, il = groups.length; i < il; i ++ ) {

				const primitive = {
					mode: mode,
					attributes: attributes
				};
				this.serializeUserData( geometry, primitive );
				if ( targets.length > 0 ) primitive.targets = targets;

				if ( geometry.index !== null ) {

					let cacheKey = this.getUID( geometry.index );

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

				const material = this.processMaterial( materials[ groups[ i ].materialIndex ] );
				if ( material !== null ) primitive.material = material;
				primitives.push( primitive );

			}

			meshDef.primitives = primitives;
			if ( ! json.meshes ) json.meshes = [];

			this._invokeAll( function ( ext ) {

				ext.writeMesh && ext.writeMesh( mesh, meshDef );

			} );

			const index = json.meshes.push( meshDef ) - 1;
			cache.meshes.set( meshCacheKey, index );
			return index;

		}
		/**
   * Process camera
   * @param  {THREE.Camera} camera Camera to process
   * @return {Integer}      Index of the processed mesh in the "camera" array
   */


		processCamera( camera ) {

			const json = this.json;
			if ( ! json.cameras ) json.cameras = [];
			const isOrtho = camera.isOrthographicCamera;
			const cameraDef = {
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

			} // Question: Is saving "type" as name intentional?


			if ( camera.name !== '' ) cameraDef.name = camera.type;
			return json.cameras.push( cameraDef ) - 1;

		}
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


		processAnimation( clip, root ) {

			const json = this.json;
			const nodeMap = this.nodeMap;
			if ( ! json.animations ) json.animations = [];
			clip = GLTFExporter.Utils.mergeMorphTargetTracks( clip.clone(), root );
			const tracks = clip.tracks;
			const channels = [];
			const samplers = [];

			for ( let i = 0; i < tracks.length; ++ i ) {

				const track = tracks[ i ];
				const trackBinding = THREE.PropertyBinding.parseTrackName( track.name );
				let trackNode = THREE.PropertyBinding.findNode( root, trackBinding.nodeName );
				const trackProperty = PATH_PROPERTIES[ trackBinding.propertyName ];

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

				const inputItemSize = 1;
				let outputItemSize = track.values.length / track.times.length;

				if ( trackProperty === PATH_PROPERTIES.morphTargetInfluences ) {

					outputItemSize /= trackNode.morphTargetInfluences.length;

				}

				let interpolation; // @TODO export CubicInterpolant(InterpolateSmooth) as CUBICSPLINE
				// Detecting glTF cubic spline interpolant by checking factory method's special property
				// GLTFCubicSplineInterpolant is a custom interpolant and track doesn't return
				// valid value from .getInterpolation().

				if ( track.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline === true ) {

					interpolation = 'CUBICSPLINE'; // itemSize of CUBICSPLINE keyframe is 9
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

		}
		/**
   * @param {THREE.Object3D} object
   * @return {number|null}
   */


		processSkin( object ) {

			const json = this.json;
			const nodeMap = this.nodeMap;
			const node = json.nodes[ nodeMap.get( object ) ];
			const skeleton = object.skeleton;
			if ( skeleton === undefined ) return null;
			const rootJoint = object.skeleton.bones[ 0 ];
			if ( rootJoint === undefined ) return null;
			const joints = [];
			const inverseBindMatrices = new Float32Array( skeleton.bones.length * 16 );
			const temporaryBoneInverse = new THREE.Matrix4();

			for ( let i = 0; i < skeleton.bones.length; ++ i ) {

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
			const skinIndex = node.skin = json.skins.length - 1;
			return skinIndex;

		}
		/**
   * Process Object3D node
   * @param  {THREE.Object3D} node Object3D to processNode
   * @return {Integer} Index of the node in the nodes list
   */


		processNode( object ) {

			const json = this.json;
			const options = this.options;
			const nodeMap = this.nodeMap;
			if ( ! json.nodes ) json.nodes = [];
			const nodeDef = {};

			if ( options.trs ) {

				const rotation = object.quaternion.toArray();
				const position = object.position.toArray();
				const scale = object.scale.toArray();

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

			} // We don't export empty strings name because it represents no-name in Three.js.


			if ( object.name !== '' ) nodeDef.name = String( object.name );
			this.serializeUserData( object, nodeDef );

			if ( object.isMesh || object.isLine || object.isPoints ) {

				const meshIndex = this.processMesh( object );
				if ( meshIndex !== null ) nodeDef.mesh = meshIndex;

			} else if ( object.isCamera ) {

				nodeDef.camera = this.processCamera( object );

			}

			if ( object.isSkinnedMesh ) this.skins.push( object );

			if ( object.children.length > 0 ) {

				const children = [];

				for ( let i = 0, l = object.children.length; i < l; i ++ ) {

					const child = object.children[ i ];

					if ( child.visible || options.onlyVisible === false ) {

						const nodeIndex = this.processNode( child );
						if ( nodeIndex !== null ) children.push( nodeIndex );

					}

				}

				if ( children.length > 0 ) nodeDef.children = children;

			}

			this._invokeAll( function ( ext ) {

				ext.writeNode && ext.writeNode( object, nodeDef );

			} );

			const nodeIndex = json.nodes.push( nodeDef ) - 1;
			nodeMap.set( object, nodeIndex );
			return nodeIndex;

		}
		/**
   * Process THREE.Scene
   * @param  {Scene} node THREE.Scene to process
   */


		processScene( scene ) {

			const json = this.json;
			const options = this.options;

			if ( ! json.scenes ) {

				json.scenes = [];
				json.scene = 0;

			}

			const sceneDef = {};
			if ( scene.name !== '' ) sceneDef.name = scene.name;
			json.scenes.push( sceneDef );
			const nodes = [];

			for ( let i = 0, l = scene.children.length; i < l; i ++ ) {

				const child = scene.children[ i ];

				if ( child.visible || options.onlyVisible === false ) {

					const nodeIndex = this.processNode( child );
					if ( nodeIndex !== null ) nodes.push( nodeIndex );

				}

			}

			if ( nodes.length > 0 ) sceneDef.nodes = nodes;
			this.serializeUserData( scene, sceneDef );

		}
		/**
   * Creates a THREE.Scene to hold a list of objects and parse it
   * @param  {Array} objects List of objects to process
   */


		processObjects( objects ) {

			const scene = new THREE.Scene();
			scene.name = 'AuxScene';

			for ( let i = 0; i < objects.length; i ++ ) {

				// We push directly to children instead of calling `add` to prevent
				// modify the .parent and break its original scene and hierarchy
				scene.children.push( objects[ i ] );

			}

			this.processScene( scene );

		}
		/**
   * @param {THREE.Object3D|Array<THREE.Object3D>} input
   */


		processInput( input ) {

			const options = this.options;
			input = input instanceof Array ? input : [ input ];

			this._invokeAll( function ( ext ) {

				ext.beforeParse && ext.beforeParse( input );

			} );

			const objectsWithoutScene = [];

			for ( let i = 0; i < input.length; i ++ ) {

				if ( input[ i ] instanceof THREE.Scene ) {

					this.processScene( input[ i ] );

				} else {

					objectsWithoutScene.push( input[ i ] );

				}

			}

			if ( objectsWithoutScene.length > 0 ) this.processObjects( objectsWithoutScene );

			for ( let i = 0; i < this.skins.length; ++ i ) {

				this.processSkin( this.skins[ i ] );

			}

			for ( let i = 0; i < options.animations.length; ++ i ) {

				this.processAnimation( options.animations[ i ], input[ 0 ] );

			}

			this._invokeAll( function ( ext ) {

				ext.afterParse && ext.afterParse( input );

			} );

		}

		_invokeAll( func ) {

			for ( let i = 0, il = this.plugins.length; i < il; i ++ ) {

				func( this.plugins[ i ] );

			}

		}

	}
	/**
 * Punctual Lights Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_lights_punctual
 */


	class GLTFLightExtension {

		constructor( writer ) {

			this.writer = writer;
			this.name = 'KHR_lights_punctual';

		}

		writeNode( light, nodeDef ) {

			if ( ! light.isLight ) return;

			if ( ! light.isDirectionalLight && ! light.isPointLight && ! light.isSpotLight ) {

				console.warn( 'THREE.GLTFExporter: Only directional, point, and spot lights are supported.', light );
				return;

			}

			const writer = this.writer;
			const json = writer.json;
			const extensionsUsed = writer.extensionsUsed;
			const lightDef = {};
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

				console.warn( 'THREE.GLTFExporter: Light decay may be lost. glTF is physically-based, ' + 'and expects light.decay=2.' );

			}

			if ( light.target && ( light.target.parent !== light || light.target.position.x !== 0 || light.target.position.y !== 0 || light.target.position.z !== - 1 ) ) {

				console.warn( 'THREE.GLTFExporter: Light direction may be lost. For best results, ' + 'make light.target a child of the light with position 0,0,-1.' );

			}

			if ( ! extensionsUsed[ this.name ] ) {

				json.extensions = json.extensions || {};
				json.extensions[ this.name ] = {
					lights: []
				};
				extensionsUsed[ this.name ] = true;

			}

			const lights = json.extensions[ this.name ].lights;
			lights.push( lightDef );
			nodeDef.extensions = nodeDef.extensions || {};
			nodeDef.extensions[ this.name ] = {
				light: lights.length - 1
			};

		}

	}
	/**
 * Unlit Materials Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_unlit
 */


	class GLTFMaterialsUnlitExtension {

		constructor( writer ) {

			this.writer = writer;
			this.name = 'KHR_materials_unlit';

		}

		writeMaterial( material, materialDef ) {

			if ( ! material.isMeshBasicMaterial ) return;
			const writer = this.writer;
			const extensionsUsed = writer.extensionsUsed;
			materialDef.extensions = materialDef.extensions || {};
			materialDef.extensions[ this.name ] = {};
			extensionsUsed[ this.name ] = true;
			materialDef.pbrMetallicRoughness.metallicFactor = 0.0;
			materialDef.pbrMetallicRoughness.roughnessFactor = 0.9;

		}

	}
	/**
 * Specular-Glossiness Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/main/extensions/2.0/Archived/KHR_materials_pbrSpecularGlossiness
 */


	class GLTFMaterialsPBRSpecularGlossiness {

		constructor( writer ) {

			this.writer = writer;
			this.name = 'KHR_materials_pbrSpecularGlossiness';

		}

		writeMaterial( material, materialDef ) {

			if ( ! material.isGLTFSpecularGlossinessMaterial ) return;
			const writer = this.writer;
			const extensionsUsed = writer.extensionsUsed;
			const extensionDef = {};

			if ( materialDef.pbrMetallicRoughness.baseColorFactor ) {

				extensionDef.diffuseFactor = materialDef.pbrMetallicRoughness.baseColorFactor;

			}

			const specularFactor = [ 1, 1, 1 ];
			material.specular.toArray( specularFactor, 0 );
			extensionDef.specularFactor = specularFactor;
			extensionDef.glossinessFactor = material.glossiness;

			if ( materialDef.pbrMetallicRoughness.baseColorTexture ) {

				extensionDef.diffuseTexture = materialDef.pbrMetallicRoughness.baseColorTexture;

			}

			if ( material.specularMap ) {

				const specularMapDef = {
					index: writer.processTexture( material.specularMap )
				};
				writer.applyTextureTransform( specularMapDef, material.specularMap );
				extensionDef.specularGlossinessTexture = specularMapDef;

			}

			materialDef.extensions = materialDef.extensions || {};
			materialDef.extensions[ this.name ] = extensionDef;
			extensionsUsed[ this.name ] = true;

		}

	}
	/**
 * Clearcoat Materials Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_clearcoat
 */


	class GLTFMaterialsClearcoatExtension {

		constructor( writer ) {

			this.writer = writer;
			this.name = 'KHR_materials_clearcoat';

		}

		writeMaterial( material, materialDef ) {

			if ( ! material.isMeshPhysicalMaterial ) return;
			const writer = this.writer;
			const extensionsUsed = writer.extensionsUsed;
			const extensionDef = {};
			extensionDef.clearcoatFactor = material.clearcoat;

			if ( material.clearcoatMap ) {

				const clearcoatMapDef = {
					index: writer.processTexture( material.clearcoatMap )
				};
				writer.applyTextureTransform( clearcoatMapDef, material.clearcoatMap );
				extensionDef.clearcoatTexture = clearcoatMapDef;

			}

			extensionDef.clearcoatRoughnessFactor = material.clearcoatRoughness;

			if ( material.clearcoatRoughnessMap ) {

				const clearcoatRoughnessMapDef = {
					index: writer.processTexture( material.clearcoatRoughnessMap )
				};
				writer.applyTextureTransform( clearcoatRoughnessMapDef, material.clearcoatRoughnessMap );
				extensionDef.clearcoatRoughnessTexture = clearcoatRoughnessMapDef;

			}

			if ( material.clearcoatNormalMap ) {

				const clearcoatNormalMapDef = {
					index: writer.processTexture( material.clearcoatNormalMap )
				};
				writer.applyTextureTransform( clearcoatNormalMapDef, material.clearcoatNormalMap );
				extensionDef.clearcoatNormalTexture = clearcoatNormalMapDef;

			}

			materialDef.extensions = materialDef.extensions || {};
			materialDef.extensions[ this.name ] = extensionDef;
			extensionsUsed[ this.name ] = true;

		}

	}
	/**
 * Iridescence Materials Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_iridescence
 */


	class GLTFMaterialsIridescenceExtension {

		constructor( writer ) {

			this.writer = writer;
			this.name = 'KHR_materials_iridescence';

		}

		writeMaterial( material, materialDef ) {

			if ( ! material.isMeshPhysicalMaterial ) return;
			const writer = this.writer;
			const extensionsUsed = writer.extensionsUsed;
			const extensionDef = {};
			extensionDef.iridescenceFactor = material.iridescence;

			if ( material.iridescenceMap ) {

				const iridescenceMapDef = {
					index: writer.processTexture( material.iridescenceMap )
				};
				writer.applyTextureTransform( iridescenceMapDef, material.iridescenceMap );
				extensionDef.iridescenceTexture = iridescenceMapDef;

			}

			extensionDef.iridescenceIor = material.iridescenceIOR;
			extensionDef.iridescenceThicknessMinimum = material.iridescenceThicknessRange[ 0 ];
			extensionDef.iridescenceThicknessMaximum = material.iridescenceThicknessRange[ 1 ];

			if ( material.iridescenceThicknessMap ) {

				const iridescenceThicknessMapDef = {
					index: writer.processTexture( material.iridescenceThicknessMap )
				};
				writer.applyTextureTransform( iridescenceThicknessMapDef, material.iridescenceThicknessMap );
				extensionDef.iridescenceThicknessTexture = iridescenceThicknessMapDef;

			}

			materialDef.extensions = materialDef.extensions || {};
			materialDef.extensions[ this.name ] = extensionDef;
			extensionsUsed[ this.name ] = true;

		}

	}
	/**
 * Transmission Materials Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_transmission
 */


	class GLTFMaterialsTransmissionExtension {

		constructor( writer ) {

			this.writer = writer;
			this.name = 'KHR_materials_transmission';

		}

		writeMaterial( material, materialDef ) {

			if ( ! material.isMeshPhysicalMaterial || material.transmission === 0 ) return;
			const writer = this.writer;
			const extensionsUsed = writer.extensionsUsed;
			const extensionDef = {};
			extensionDef.transmissionFactor = material.transmission;

			if ( material.transmissionMap ) {

				const transmissionMapDef = {
					index: writer.processTexture( material.transmissionMap )
				};
				writer.applyTextureTransform( transmissionMapDef, material.transmissionMap );
				extensionDef.transmissionTexture = transmissionMapDef;

			}

			materialDef.extensions = materialDef.extensions || {};
			materialDef.extensions[ this.name ] = extensionDef;
			extensionsUsed[ this.name ] = true;

		}

	}
	/**
 * Materials Volume Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_volume
 */


	class GLTFMaterialsVolumeExtension {

		constructor( writer ) {

			this.writer = writer;
			this.name = 'KHR_materials_volume';

		}

		writeMaterial( material, materialDef ) {

			if ( ! material.isMeshPhysicalMaterial || material.transmission === 0 ) return;
			const writer = this.writer;
			const extensionsUsed = writer.extensionsUsed;
			const extensionDef = {};
			extensionDef.thicknessFactor = material.thickness;

			if ( material.thicknessMap ) {

				const thicknessMapDef = {
					index: writer.processTexture( material.thicknessMap )
				};
				writer.applyTextureTransform( thicknessMapDef, material.thicknessMap );
				extensionDef.thicknessTexture = thicknessMapDef;

			}

			extensionDef.attenuationDistance = material.attenuationDistance;
			extensionDef.attenuationColor = material.attenuationColor.toArray();
			materialDef.extensions = materialDef.extensions || {};
			materialDef.extensions[ this.name ] = extensionDef;
			extensionsUsed[ this.name ] = true;

		}

	}
	/**
 * Static utility functions
 */


	GLTFExporter.Utils = {
		insertKeyframe: function ( track, time ) {

			const tolerance = 0.001; // 1ms

			const valueSize = track.getValueSize();
			const times = new track.TimeBufferType( track.times.length + 1 );
			const values = new track.ValueBufferType( track.values.length + valueSize );
			const interpolant = track.createInterpolant( new track.ValueBufferType( valueSize ) );
			let index;

			if ( track.times.length === 0 ) {

				times[ 0 ] = time;

				for ( let i = 0; i < valueSize; i ++ ) {

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

				for ( let i = 0; i < track.times.length; i ++ ) {

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

			const tracks = [];
			const mergedTracks = {};
			const sourceTracks = clip.tracks;

			for ( let i = 0; i < sourceTracks.length; ++ i ) {

				let sourceTrack = sourceTracks[ i ];
				const sourceTrackBinding = THREE.PropertyBinding.parseTrackName( sourceTrack.name );
				const sourceTrackNode = THREE.PropertyBinding.findNode( root, sourceTrackBinding.nodeName );

				if ( sourceTrackBinding.propertyName !== 'morphTargetInfluences' || sourceTrackBinding.propertyIndex === undefined ) {

					// Tracks that don't affect morph targets, or that affect all morph targets together, can be left as-is.
					tracks.push( sourceTrack );
					continue;

				}

				if ( sourceTrack.createInterpolant !== sourceTrack.InterpolantFactoryMethodDiscrete && sourceTrack.createInterpolant !== sourceTrack.InterpolantFactoryMethodLinear ) {

					if ( sourceTrack.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline ) {

						// This should never happen, because glTF morph target animations
						// affect all targets already.
						throw new Error( 'THREE.GLTFExporter: Cannot merge tracks with glTF CUBICSPLINE interpolation.' );

					}

					console.warn( 'THREE.GLTFExporter: Morph target interpolation mode not yet supported. Using LINEAR instead.' );
					sourceTrack = sourceTrack.clone();
					sourceTrack.setInterpolation( THREE.InterpolateLinear );

				}

				const targetCount = sourceTrackNode.morphTargetInfluences.length;
				const targetIndex = sourceTrackNode.morphTargetDictionary[ sourceTrackBinding.propertyIndex ];

				if ( targetIndex === undefined ) {

					throw new Error( 'THREE.GLTFExporter: Morph target name not found: ' + sourceTrackBinding.propertyIndex );

				}

				let mergedTrack; // If this is the first time we've seen this object, create a new
				// track to store merged keyframe data for each morph target.

				if ( mergedTracks[ sourceTrackNode.uuid ] === undefined ) {

					mergedTrack = sourceTrack.clone();
					const values = new mergedTrack.ValueBufferType( targetCount * mergedTrack.times.length );

					for ( let j = 0; j < mergedTrack.times.length; j ++ ) {

						values[ j * targetCount + targetIndex ] = mergedTrack.values[ j ];

					} // We need to take into consideration the intended target node
					// of our original un-merged morphTarget animation.


					mergedTrack.name = ( sourceTrackBinding.nodeName || '' ) + '.morphTargetInfluences';
					mergedTrack.values = values;
					mergedTracks[ sourceTrackNode.uuid ] = mergedTrack;
					tracks.push( mergedTrack );
					continue;

				}

				const sourceInterpolant = sourceTrack.createInterpolant( new sourceTrack.ValueBufferType( 1 ) );
				mergedTrack = mergedTracks[ sourceTrackNode.uuid ]; // For every existing keyframe of the merged track, write a (possibly
				// interpolated) value from the source track.

				for ( let j = 0; j < mergedTrack.times.length; j ++ ) {

					mergedTrack.values[ j * targetCount + targetIndex ] = sourceInterpolant.evaluate( mergedTrack.times[ j ] );

				} // For every existing keyframe of the source track, write a (possibly
				// new) keyframe to the merged track. Values from the previous loop may
				// be written again, but keyframes are de-duplicated.


				for ( let j = 0; j < sourceTrack.times.length; j ++ ) {

					const keyframeIndex = this.insertKeyframe( mergedTrack, sourceTrack.times[ j ] );
					mergedTrack.values[ keyframeIndex * targetCount + targetIndex ] = sourceTrack.values[ j ];

				}

			}

			clip.tracks = tracks;
			return clip;

		}
	};

	THREE.GLTFExporter = GLTFExporter;

} )();
