/**
 * @author fernandojsg / http://fernandojsg.com
 * @author Don McCurdy / https://www.donmccurdy.com
 * @author Takahiro / https://github.com/takahirox
 */

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
THREE_TO_WEBGL[ THREE.NearestMipMapNearestFilter ] = WEBGL_CONSTANTS.NEAREST_MIPMAP_NEAREST;
THREE_TO_WEBGL[ THREE.NearestMipMapLinearFilter ] = WEBGL_CONSTANTS.NEAREST_MIPMAP_LINEAR;
THREE_TO_WEBGL[ THREE.LinearFilter ] = WEBGL_CONSTANTS.LINEAR;
THREE_TO_WEBGL[ THREE.LinearMipMapNearestFilter ] = WEBGL_CONSTANTS.LINEAR_MIPMAP_NEAREST;
THREE_TO_WEBGL[ THREE.LinearMipMapLinearFilter ] = WEBGL_CONSTANTS.LINEAR_MIPMAP_LINEAR;

THREE_TO_WEBGL[ THREE.ClampToEdgeWrapping ] = WEBGL_CONSTANTS.CLAMP_TO_EDGE;
THREE_TO_WEBGL[ THREE.RepeatWrapping ] = WEBGL_CONSTANTS.REPEAT;
THREE_TO_WEBGL[ THREE.MirroredRepeatWrapping ] = WEBGL_CONSTANTS.MIRRORED_REPEAT;

var PATH_PROPERTIES = {
	scale: 'scale',
	position: 'translation',
	quaternion: 'rotation',
	morphTargetInfluences: 'weights'
};

//------------------------------------------------------------------------------
// GLTF Exporter
//------------------------------------------------------------------------------
THREE.GLTFExporter = function () {};

THREE.GLTFExporter.prototype = {

	constructor: THREE.GLTFExporter,

	/**
	 * Parse scenes and generate GLTF output
	 * @param  {THREE.Scene or [THREE.Scenes]} input   THREE.Scene or Array of THREE.Scenes
	 * @param  {Function} onDone  Callback on completed
	 * @param  {Object} options options
	 */
	parse: function ( input, onDone, options ) {

		var DEFAULT_OPTIONS = {
			binary: false,
			trs: false,
			onlyVisible: true,
			truncateDrawRange: true,
			embedImages: true,
			animations: [],
			forceIndices: false,
			forcePowerOfTwoTextures: false,
			includeCustomExtensions: false
		};

		options = Object.assign( {}, DEFAULT_OPTIONS, options );

		if ( options.animations.length > 0 ) {

			// Only TRS properties, and not matrices, may be targeted by animation.
			options.trs = true;

		}

		var outputJSON = {

			asset: {

				version: "2.0",
				generator: "THREE.GLTFExporter"

			}

		};

		var byteOffset = 0;
		var buffers = [];
		var pending = [];
		var nodeMap = new Map();
		var skins = [];
		var extensionsUsed = {};
		var cachedData = {

			meshes: new Map(),
			attributes: new Map(),
			attributesNormalized: new Map(),
			materials: new Map(),
			textures: new Map(),
			images: new Map()

		};

		var cachedCanvas;

		var uids = new Map();
		var uid = 0;

		/**
		 * Assign and return a temporal unique id for an object
		 * especially which doesn't have .uuid
		 * @param  {Object} object
		 * @return {Integer}
		 */
		function getUID( object ) {

			if ( ! uids.has( object ) ) uids.set( object, uid ++ );

			return uids.get( object );

		}

		/**
		 * Compare two arrays
		 */
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

					var value = attribute.array[ i * attribute.itemSize + a ];
					output.min[ a ] = Math.min( output.min[ a ], value );
					output.max[ a ] = Math.max( output.max[ a ], value );

				}

			}

			return output;

		}

		/**
		 * Checks if image size is POT.
		 *
		 * @param {Image} image The image to be checked.
		 * @returns {Boolean} Returns true if image size is POT.
		 *
		 */
		function isPowerOfTwo( image ) {

			return THREE.Math.isPowerOfTwo( image.width ) && THREE.Math.isPowerOfTwo( image.height );

		}

		/**
		 * Checks if normal attribute values are normalized.
		 *
		 * @param {THREE.BufferAttribute} normal
		 * @returns {Boolean}
		 *
		 */
		function isNormalizedNormalAttribute( normal ) {

			if ( cachedData.attributesNormalized.has( normal ) ) {

				return false;

			}

			var v = new THREE.Vector3();

			for ( var i = 0, il = normal.count; i < il; i ++ ) {

				// 0.0005 is from glTF-validator
				if ( Math.abs( v.fromArray( normal.array, i * 3 ).length() - 1.0 ) > 0.0005 ) return false;

			}

			return true;

		}

		/**
		 * Creates normalized normal buffer attribute.
		 *
		 * @param {THREE.BufferAttribute} normal
		 * @returns {THREE.BufferAttribute}
		 *
		 */
		function createNormalizedNormalAttribute( normal ) {

			if ( cachedData.attributesNormalized.has( normal ) ) {

				return cachedData.attributesNormalized.get( normal );

			}

			var attribute = normal.clone();

			var v = new THREE.Vector3();

			for ( var i = 0, il = attribute.count; i < il; i ++ ) {

				v.fromArray( attribute.array, i * 3 );

				if ( v.x === 0 && v.y === 0 && v.z === 0 ) {

					// if values can't be normalized set (1, 0, 0)
					v.setX( 1.0 );

				} else {

					v.normalize();

				}

				v.toArray( attribute.array, i * 3 );

			}

			cachedData.attributesNormalized.set( normal, attribute );

			return attribute;

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

		/**
		 * Serializes a userData.
		 *
		 * @param {THREE.Object3D|THREE.Material} object
		 * @param {Object} gltfProperty
		 */
		function serializeUserData( object, gltfProperty ) {

			if ( Object.keys( object.userData ).length === 0 ) {

				return;

			}

			try {

				var json = JSON.parse( JSON.stringify( object.userData ) );

				if ( options.includeCustomExtensions && json.gltfExtensions ) {

					if ( gltfProperty.extensions === undefined ) {

						gltfProperty.extensions = {};

					}

					for ( var extensionName in json.gltfExtensions ) {

						gltfProperty.extensions[ extensionName ] = json.gltfExtensions[ extensionName ];
						extensionsUsed[ extensionName ] = true;

					}

					delete json.gltfExtensions;

				}

				if ( Object.keys( json ).length > 0 ) {

					gltfProperty.extras = json;

				}

			} catch ( error ) {

				console.warn( 'THREE.GLTFExporter: userData of \'' + object.name + '\' ' +
					'won\'t be serialized because of JSON.stringify error - ' + error.message );

			}

		}

		/**
		 * Applies a texture transform, if present, to the map definition. Requires
		 * the KHR_texture_transform extension.
		 */
		function applyTextureTransform( mapDef, texture ) {

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
				extensionsUsed[ 'KHR_texture_transform' ] = true;

			}

		}

		/**
		 * Process a buffer to append to the default one.
		 * @param  {ArrayBuffer} buffer
		 * @return {Integer}
		 */
		function processBuffer( buffer ) {

			if ( ! outputJSON.buffers ) {

				outputJSON.buffers = [ { byteLength: 0 } ];

			}

			// All buffers are merged before export.
			buffers.push( buffer );

			return 0;

		}

		/**
		 * Process and generate a BufferView
		 * @param  {THREE.BufferAttribute} attribute
		 * @param  {number} componentType
		 * @param  {number} start
		 * @param  {number} count
		 * @param  {number} target (Optional) Target usage of the BufferView
		 * @return {Object}
		 */
		function processBufferView( attribute, componentType, start, count, target ) {

			if ( ! outputJSON.bufferViews ) {

				outputJSON.bufferViews = [];

			}

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

					// @TODO Fails on InterleavedBufferAttribute, and could probably be
					// optimized for normal BufferAttribute.
					var value = attribute.array[ i * attribute.itemSize + a ];

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

			var gltfBufferView = {

				buffer: processBuffer( dataView.buffer ),
				byteOffset: byteOffset,
				byteLength: byteLength

			};

			if ( target !== undefined ) gltfBufferView.target = target;

			if ( target === WEBGL_CONSTANTS.ARRAY_BUFFER ) {

				// Only define byteStride for vertex attributes.
				gltfBufferView.byteStride = attribute.itemSize * componentSize;

			}

			byteOffset += byteLength;

			outputJSON.bufferViews.push( gltfBufferView );

			// @TODO Merge bufferViews where possible.
			var output = {

				id: outputJSON.bufferViews.length - 1,
				byteLength: 0

			};

			return output;

		}

		/**
		 * Process and generate a BufferView from an image Blob.
		 * @param {Blob} blob
		 * @return {Promise<Integer>}
		 */
		function processBufferViewImage( blob ) {

			if ( ! outputJSON.bufferViews ) {

				outputJSON.bufferViews = [];

			}

			return new Promise( function ( resolve ) {

				var reader = new window.FileReader();
				reader.readAsArrayBuffer( blob );
				reader.onloadend = function () {

					var buffer = getPaddedArrayBuffer( reader.result );

					var bufferView = {
						buffer: processBuffer( buffer ),
						byteOffset: byteOffset,
						byteLength: buffer.byteLength
					};

					byteOffset += buffer.byteLength;

					outputJSON.bufferViews.push( bufferView );

					resolve( outputJSON.bufferViews.length - 1 );

				};

			} );

		}

		/**
		 * Process attribute to generate an accessor
		 * @param  {THREE.BufferAttribute} attribute Attribute to process
		 * @param  {THREE.BufferGeometry} geometry (Optional) Geometry used for truncated draw range
		 * @param  {Integer} start (Optional)
		 * @param  {Integer} count (Optional)
		 * @return {Integer}           Index of the processed accessor on the "accessors" array
		 */
		function processAccessor( attribute, geometry, start, count ) {

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
			if ( count === 0 ) {

				return null;

			}

			var minMax = getMinMax( attribute, start, count );

			var bufferViewTarget;

			// If geometry isn't provided, don't infer the target usage of the bufferView. For
			// animation samplers, target must not be set.
			if ( geometry !== undefined ) {

				bufferViewTarget = attribute === geometry.index ? WEBGL_CONSTANTS.ELEMENT_ARRAY_BUFFER : WEBGL_CONSTANTS.ARRAY_BUFFER;

			}

			var bufferView = processBufferView( attribute, componentType, start, count, bufferViewTarget );

			var gltfAccessor = {

				bufferView: bufferView.id,
				byteOffset: bufferView.byteOffset,
				componentType: componentType,
				count: count,
				max: minMax.max,
				min: minMax.min,
				type: types[ attribute.itemSize ]

			};

			if ( ! outputJSON.accessors ) {

				outputJSON.accessors = [];

			}

			outputJSON.accessors.push( gltfAccessor );

			return outputJSON.accessors.length - 1;

		}

		/**
		 * Process image
		 * @param  {Image} image to process
		 * @param  {Integer} format of the image (e.g. THREE.RGBFormat, THREE.RGBAFormat etc)
		 * @param  {Boolean} flipY before writing out the image
		 * @return {Integer}     Index of the processed texture in the "images" array
		 */
		function processImage( image, format, flipY ) {

			if ( ! cachedData.images.has( image ) ) {

				cachedData.images.set( image, {} );

			}

			var cachedImages = cachedData.images.get( image );
			var mimeType = format === THREE.RGBAFormat ? 'image/png' : 'image/jpeg';
			var key = mimeType + ":flipY/" + flipY.toString();

			if ( cachedImages[ key ] !== undefined ) {

				return cachedImages[ key ];

			}

			if ( ! outputJSON.images ) {

				outputJSON.images = [];

			}

			var gltfImage = { mimeType: mimeType };

			if ( options.embedImages ) {

				var canvas = cachedCanvas = cachedCanvas || document.createElement( 'canvas' );

				canvas.width = image.width;
				canvas.height = image.height;

				if ( options.forcePowerOfTwoTextures && ! isPowerOfTwo( image ) ) {

					console.warn( 'GLTFExporter: Resized non-power-of-two image.', image );

					canvas.width = THREE.Math.floorPowerOfTwo( canvas.width );
					canvas.height = THREE.Math.floorPowerOfTwo( canvas.height );

				}

				var ctx = canvas.getContext( '2d' );

				if ( flipY === true ) {

					ctx.translate( 0, canvas.height );
					ctx.scale( 1, - 1 );

				}

				ctx.drawImage( image, 0, 0, canvas.width, canvas.height );

				if ( options.binary === true ) {

					pending.push( new Promise( function ( resolve ) {

						canvas.toBlob( function ( blob ) {

							processBufferViewImage( blob ).then( function ( bufferViewIndex ) {

								gltfImage.bufferView = bufferViewIndex;

								resolve();

							} );

						}, mimeType );

					} ) );

				} else {

					gltfImage.uri = canvas.toDataURL( mimeType );

				}

			} else {

				gltfImage.uri = image.src;

			}

			outputJSON.images.push( gltfImage );

			var index = outputJSON.images.length - 1;
			cachedImages[ key ] = index;

			return index;

		}

		/**
		 * Process sampler
		 * @param  {Texture} map Texture to process
		 * @return {Integer}     Index of the processed texture in the "samplers" array
		 */
		function processSampler( map ) {

			if ( ! outputJSON.samplers ) {

				outputJSON.samplers = [];

			}

			var gltfSampler = {

				magFilter: THREE_TO_WEBGL[ map.magFilter ],
				minFilter: THREE_TO_WEBGL[ map.minFilter ],
				wrapS: THREE_TO_WEBGL[ map.wrapS ],
				wrapT: THREE_TO_WEBGL[ map.wrapT ]

			};

			outputJSON.samplers.push( gltfSampler );

			return outputJSON.samplers.length - 1;

		}

		/**
		 * Process texture
		 * @param  {Texture} map Map to process
		 * @return {Integer}     Index of the processed texture in the "textures" array
		 */
		function processTexture( map ) {

			if ( cachedData.textures.has( map ) ) {

				return cachedData.textures.get( map );

			}

			if ( ! outputJSON.textures ) {

				outputJSON.textures = [];

			}

			var gltfTexture = {

				sampler: processSampler( map ),
				source: processImage( map.image, map.format, map.flipY )

			};

			outputJSON.textures.push( gltfTexture );

			var index = outputJSON.textures.length - 1;
			cachedData.textures.set( map, index );

			return index;

		}

		/**
		 * Process material
		 * @param  {THREE.Material} material Material to process
		 * @return {Integer}      Index of the processed material in the "materials" array
		 */
		function processMaterial( material ) {

			if ( cachedData.materials.has( material ) ) {

				return cachedData.materials.get( material );

			}

			if ( ! outputJSON.materials ) {

				outputJSON.materials = [];

			}

			if ( material.isShaderMaterial ) {

				console.warn( 'GLTFExporter: THREE.ShaderMaterial not supported.' );
				return null;

			}

			// @QUESTION Should we avoid including any attribute that has the default value?
			var gltfMaterial = {

				pbrMetallicRoughness: {}

			};

			if ( material.isMeshBasicMaterial ) {

				gltfMaterial.extensions = { KHR_materials_unlit: {} };

				extensionsUsed[ 'KHR_materials_unlit' ] = true;

			} else if ( ! material.isMeshStandardMaterial ) {

				console.warn( 'GLTFExporter: Use MeshStandardMaterial or MeshBasicMaterial for best results.' );

			}

			// pbrMetallicRoughness.baseColorFactor
			var color = material.color.toArray().concat( [ material.opacity ] );

			if ( ! equalArray( color, [ 1, 1, 1, 1 ] ) ) {

				gltfMaterial.pbrMetallicRoughness.baseColorFactor = color;

			}

			if ( material.isMeshStandardMaterial ) {

				gltfMaterial.pbrMetallicRoughness.metallicFactor = material.metalness;
				gltfMaterial.pbrMetallicRoughness.roughnessFactor = material.roughness;

			} else if ( material.isMeshBasicMaterial ) {

				gltfMaterial.pbrMetallicRoughness.metallicFactor = 0.0;
				gltfMaterial.pbrMetallicRoughness.roughnessFactor = 0.9;

			} else {

				gltfMaterial.pbrMetallicRoughness.metallicFactor = 0.5;
				gltfMaterial.pbrMetallicRoughness.roughnessFactor = 0.5;

			}

			// pbrMetallicRoughness.metallicRoughnessTexture
			if ( material.metalnessMap || material.roughnessMap ) {

				if ( material.metalnessMap === material.roughnessMap ) {

					var metalRoughMapDef = { index: processTexture( material.metalnessMap ) };
					applyTextureTransform( metalRoughMapDef, material.metalnessMap );
					gltfMaterial.pbrMetallicRoughness.metallicRoughnessTexture = metalRoughMapDef;

				} else {

					console.warn( 'THREE.GLTFExporter: Ignoring metalnessMap and roughnessMap because they are not the same Texture.' );

				}

			}

			// pbrMetallicRoughness.baseColorTexture
			if ( material.map ) {

				var baseColorMapDef = { index: processTexture( material.map ) };
				applyTextureTransform( baseColorMapDef, material.map );
				gltfMaterial.pbrMetallicRoughness.baseColorTexture = baseColorMapDef;

			}

			if ( material.isMeshBasicMaterial ||
				material.isLineBasicMaterial ||
				material.isPointsMaterial ) {

			} else {

				// emissiveFactor
				var emissive = material.emissive.clone().multiplyScalar( material.emissiveIntensity ).toArray();

				if ( ! equalArray( emissive, [ 0, 0, 0 ] ) ) {

					gltfMaterial.emissiveFactor = emissive;

				}

				// emissiveTexture
				if ( material.emissiveMap ) {

					var emissiveMapDef = { index: processTexture( material.emissiveMap ) };
					applyTextureTransform( emissiveMapDef, material.emissiveMap );
					gltfMaterial.emissiveTexture = emissiveMapDef;

				}

			}

			// normalTexture
			if ( material.normalMap ) {

				var normalMapDef = { index: processTexture( material.normalMap ) };

				if ( material.normalScale.x !== - 1 ) {

					if ( material.normalScale.x !== material.normalScale.y ) {

						console.warn( 'THREE.GLTFExporter: Normal scale components are different, ignoring Y and exporting X.' );

					}

					normalMapDef.scale = material.normalScale.x;

				}

				applyTextureTransform( normalMapDef, material.normalMap );

				gltfMaterial.normalTexture = normalMapDef;

			}

			// occlusionTexture
			if ( material.aoMap ) {

				var occlusionMapDef = {
					index: processTexture( material.aoMap ),
					texCoord: 1
				};

				if ( material.aoMapIntensity !== 1.0 ) {

					occlusionMapDef.strength = material.aoMapIntensity;

				}

				applyTextureTransform( occlusionMapDef, material.aoMap );

				gltfMaterial.occlusionTexture = occlusionMapDef;

			}

			// alphaMode
			if ( material.transparent || material.alphaTest > 0.0 ) {

				gltfMaterial.alphaMode = material.opacity < 1.0 ? 'BLEND' : 'MASK';

				// Write alphaCutoff if it's non-zero and different from the default (0.5).
				if ( material.alphaTest > 0.0 && material.alphaTest !== 0.5 ) {

					gltfMaterial.alphaCutoff = material.alphaTest;

				}

			}

			// doubleSided
			if ( material.side === THREE.DoubleSide ) {

				gltfMaterial.doubleSided = true;

			}

			if ( material.name !== '' ) {

				gltfMaterial.name = material.name;

			}

			serializeUserData( material, gltfMaterial );

			outputJSON.materials.push( gltfMaterial );

			var index = outputJSON.materials.length - 1;
			cachedData.materials.set( material, index );

			return index;

		}

		/**
		 * Process mesh
		 * @param  {THREE.Mesh} mesh Mesh to process
		 * @return {Integer}      Index of the processed mesh in the "meshes" array
		 */
		function processMesh( mesh ) {

			var cacheKey = mesh.geometry.uuid + ':' + mesh.material.uuid;
			if ( cachedData.meshes.has( cacheKey ) ) {

				return cachedData.meshes.get( cacheKey );

			}

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

				if ( ! geometry.isBufferGeometry ) {

					console.warn( 'GLTFExporter: Exporting THREE.Geometry will increase file size. Use THREE.BufferGeometry instead.' );

					var geometryTemp = new THREE.BufferGeometry();
					geometryTemp.fromGeometry( geometry );
					geometry = geometryTemp;

				}

				if ( mesh.drawMode === THREE.TriangleFanDrawMode ) {

					console.warn( 'GLTFExporter: TriangleFanDrawMode and wireframe incompatible.' );
					mode = WEBGL_CONSTANTS.TRIANGLE_FAN;

				} else if ( mesh.drawMode === THREE.TriangleStripDrawMode ) {

					mode = mesh.material.wireframe ? WEBGL_CONSTANTS.LINE_STRIP : WEBGL_CONSTANTS.TRIANGLE_STRIP;

				} else {

					mode = mesh.material.wireframe ? WEBGL_CONSTANTS.LINES : WEBGL_CONSTANTS.TRIANGLES;

				}

			}

			var gltfMesh = {};

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

			if ( originalNormal !== undefined && ! isNormalizedNormalAttribute( originalNormal ) ) {

				console.warn( 'THREE.GLTFExporter: Creating normalized normal attribute from the non-normalized one.' );

				geometry.addAttribute( 'normal', createNormalizedNormalAttribute( originalNormal ) );

			}

			// @QUESTION Detect if .vertexColors = THREE.VertexColors?
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
				if ( ! validVertexAttributes.test( attributeName ) ) {

					attributeName = '_' + attributeName;

				}

				if ( cachedData.attributes.has( getUID( attribute ) ) ) {

					attributes[ attributeName ] = cachedData.attributes.get( getUID( attribute ) );
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

				var accessor = processAccessor( modifiedAttribute || attribute, geometry );
				if ( accessor !== null ) {

					attributes[ attributeName ] = accessor;
					cachedData.attributes.set( getUID( attribute ), accessor );

				}

			}

			if ( originalNormal !== undefined ) geometry.addAttribute( 'normal', originalNormal );

			// Skip if no exportable attributes found
			if ( Object.keys( attributes ).length === 0 ) {

				return null;

			}

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

						if ( cachedData.attributes.has( getUID( attribute ) ) ) {

							target[ gltfAttributeName ] = cachedData.attributes.get( getUID( attribute ) );
							continue;

						}

						// Clones attribute not to override
						var relativeAttribute = attribute.clone();

						for ( var j = 0, jl = attribute.count; j < jl; j ++ ) {

							relativeAttribute.setXYZ(
								j,
								attribute.getX( j ) - baseAttribute.getX( j ),
								attribute.getY( j ) - baseAttribute.getY( j ),
								attribute.getZ( j ) - baseAttribute.getZ( j )
							);

						}

						target[ gltfAttributeName ] = processAccessor( relativeAttribute, geometry );
						cachedData.attributes.set( getUID( baseAttribute ), target[ gltfAttributeName ] );

					}

					targets.push( target );

					weights.push( mesh.morphTargetInfluences[ i ] );
					if ( mesh.morphTargetDictionary !== undefined ) targetNames.push( reverseDictionary[ i ] );

				}

				gltfMesh.weights = weights;

				if ( targetNames.length > 0 ) {

					gltfMesh.extras = {};
					gltfMesh.extras.targetNames = targetNames;

				}

			}

			var forceIndices = options.forceIndices;
			var isMultiMaterial = Array.isArray( mesh.material );

			if ( isMultiMaterial && geometry.groups.length === 0 ) return null;

			if ( ! forceIndices && geometry.index === null && isMultiMaterial ) {

				// temporal workaround.
				console.warn( 'THREE.GLTFExporter: Creating index for non-indexed multi-material mesh.' );
				forceIndices = true;

			}

			var didForceIndices = false;

			if ( geometry.index === null && forceIndices ) {

				var indices = [];

				for ( var i = 0, il = geometry.attributes.position.count; i < il; i ++ ) {

					indices[ i ] = i;

				}

				geometry.setIndex( indices );

				didForceIndices = true;

			}

			var materials = isMultiMaterial ? mesh.material : [ mesh.material ];
			var groups = isMultiMaterial ? geometry.groups : [ { materialIndex: 0, start: undefined, count: undefined } ];

			for ( var i = 0, il = groups.length; i < il; i ++ ) {

				var primitive = {
					mode: mode,
					attributes: attributes,
				};

				serializeUserData( geometry, primitive );

				if ( targets.length > 0 ) primitive.targets = targets;

				if ( geometry.index !== null ) {

					var key = getUID( geometry.index );

					if ( groups[ i ].start !== undefined || groups[ i ] !== undefined ) {

						key += ':' + groups[ i ].start + ':' + groups[ i ].count;

					}

					if ( cachedData.attributes.has( key ) ) {

						primitive.indices = cachedData.attributes.get( key );

					} else {

						primitive.indices = processAccessor( geometry.index, geometry, groups[ i ].start, groups[ i ].count );
						cachedData.attributes.set( key, primitive.indices );

					}

					if ( primitive.indices === null ) delete primitive.indices;

				}

				var material = processMaterial( materials[ groups[ i ].materialIndex ] );

				if ( material !== null ) {

					primitive.material = material;

				}

				primitives.push( primitive );

			}

			if ( didForceIndices ) {

				geometry.setIndex( null );

			}

			gltfMesh.primitives = primitives;

			if ( ! outputJSON.meshes ) {

				outputJSON.meshes = [];

			}

			outputJSON.meshes.push( gltfMesh );

			var index = outputJSON.meshes.length - 1;
			cachedData.meshes.set( cacheKey, index );

			return index;

		}

		/**
		 * Process camera
		 * @param  {THREE.Camera} camera Camera to process
		 * @return {Integer}      Index of the processed mesh in the "camera" array
		 */
		function processCamera( camera ) {

			if ( ! outputJSON.cameras ) {

				outputJSON.cameras = [];

			}

			var isOrtho = camera.isOrthographicCamera;

			var gltfCamera = {

				type: isOrtho ? 'orthographic' : 'perspective'

			};

			if ( isOrtho ) {

				gltfCamera.orthographic = {

					xmag: camera.right * 2,
					ymag: camera.top * 2,
					zfar: camera.far <= 0 ? 0.001 : camera.far,
					znear: camera.near < 0 ? 0 : camera.near

				};

			} else {

				gltfCamera.perspective = {

					aspectRatio: camera.aspect,
					yfov: THREE.Math.degToRad( camera.fov ),
					zfar: camera.far <= 0 ? 0.001 : camera.far,
					znear: camera.near < 0 ? 0 : camera.near

				};

			}

			if ( camera.name !== '' ) {

				gltfCamera.name = camera.type;

			}

			outputJSON.cameras.push( gltfCamera );

			return outputJSON.cameras.length - 1;

		}

		/**
		 * Creates glTF animation entry from AnimationClip object.
		 *
		 * Status:
		 * - Only properties listed in PATH_PROPERTIES may be animated.
		 *
		 * @param {THREE.AnimationClip} clip
		 * @param {THREE.Object3D} root
		 * @return {number}
		 */
		function processAnimation( clip, root ) {

			if ( ! outputJSON.animations ) {

				outputJSON.animations = [];

			}

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

					input: processAccessor( new THREE.BufferAttribute( track.times, inputItemSize ) ),
					output: processAccessor( new THREE.BufferAttribute( track.values, outputItemSize ) ),
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

			outputJSON.animations.push( {

				name: clip.name || 'clip_' + outputJSON.animations.length,
				samplers: samplers,
				channels: channels

			} );

			return outputJSON.animations.length - 1;

		}

		function processSkin( object ) {

			var node = outputJSON.nodes[ nodeMap.get( object ) ];

			var skeleton = object.skeleton;
			var rootJoint = object.skeleton.bones[ 0 ];

			if ( rootJoint === undefined ) return null;

			var joints = [];
			var inverseBindMatrices = new Float32Array( skeleton.bones.length * 16 );

			for ( var i = 0; i < skeleton.bones.length; ++ i ) {

				joints.push( nodeMap.get( skeleton.bones[ i ] ) );

				skeleton.boneInverses[ i ].toArray( inverseBindMatrices, i * 16 );

			}

			if ( outputJSON.skins === undefined ) {

				outputJSON.skins = [];

			}

			outputJSON.skins.push( {

				inverseBindMatrices: processAccessor( new THREE.BufferAttribute( inverseBindMatrices, 16 ) ),
				joints: joints,
				skeleton: nodeMap.get( rootJoint )

			} );

			var skinIndex = node.skin = outputJSON.skins.length - 1;

			return skinIndex;

		}

		function processLight( light ) {

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

			var lights = outputJSON.extensions[ 'KHR_lights_punctual' ].lights;
			lights.push( lightDef );
			return lights.length - 1;

		}

		/**
		 * Process Object3D node
		 * @param  {THREE.Object3D} node Object3D to processNode
		 * @return {Integer}      Index of the node in the nodes list
		 */
		function processNode( object ) {

			if ( ! outputJSON.nodes ) {

				outputJSON.nodes = [];

			}

			var gltfNode = {};

			if ( options.trs ) {

				var rotation = object.quaternion.toArray();
				var position = object.position.toArray();
				var scale = object.scale.toArray();

				if ( ! equalArray( rotation, [ 0, 0, 0, 1 ] ) ) {

					gltfNode.rotation = rotation;

				}

				if ( ! equalArray( position, [ 0, 0, 0 ] ) ) {

					gltfNode.translation = position;

				}

				if ( ! equalArray( scale, [ 1, 1, 1 ] ) ) {

					gltfNode.scale = scale;

				}

			} else {

				object.updateMatrix();
				if ( ! equalArray( object.matrix.elements, [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ] ) ) {

					gltfNode.matrix = object.matrix.elements;

				}

			}

			// We don't export empty strings name because it represents no-name in Three.js.
			if ( object.name !== '' ) {

				gltfNode.name = String( object.name );

			}

			serializeUserData( object, gltfNode );

			if ( object.isMesh || object.isLine || object.isPoints ) {

				var mesh = processMesh( object );

				if ( mesh !== null ) {

					gltfNode.mesh = mesh;

				}

			} else if ( object.isCamera ) {

				gltfNode.camera = processCamera( object );

			} else if ( object.isDirectionalLight || object.isPointLight || object.isSpotLight ) {

				if ( ! extensionsUsed[ 'KHR_lights_punctual' ] ) {

					outputJSON.extensions = outputJSON.extensions || {};
					outputJSON.extensions[ 'KHR_lights_punctual' ] = { lights: [] };
					extensionsUsed[ 'KHR_lights_punctual' ] = true;

				}

				gltfNode.extensions = gltfNode.extensions || {};
				gltfNode.extensions[ 'KHR_lights_punctual' ] = { light: processLight( object ) };

			} else if ( object.isLight ) {

				console.warn( 'THREE.GLTFExporter: Only directional, point, and spot lights are supported.', object );
				return null;

			}

			if ( object.isSkinnedMesh ) {

				skins.push( object );

			}

			if ( object.children.length > 0 ) {

				var children = [];

				for ( var i = 0, l = object.children.length; i < l; i ++ ) {

					var child = object.children[ i ];

					if ( child.visible || options.onlyVisible === false ) {

						var node = processNode( child );

						if ( node !== null ) {

							children.push( node );

						}

					}

				}

				if ( children.length > 0 ) {

					gltfNode.children = children;

				}


			}

			outputJSON.nodes.push( gltfNode );

			var nodeIndex = outputJSON.nodes.length - 1;
			nodeMap.set( object, nodeIndex );

			return nodeIndex;

		}

		/**
		 * Process Scene
		 * @param  {THREE.Scene} node Scene to process
		 */
		function processScene( scene ) {

			if ( ! outputJSON.scenes ) {

				outputJSON.scenes = [];
				outputJSON.scene = 0;

			}

			var gltfScene = {

				nodes: []

			};

			if ( scene.name !== '' ) {

				gltfScene.name = scene.name;

			}

			if ( scene.userData && Object.keys( scene.userData ).length > 0 ) {

				gltfScene.extras = serializeUserData( scene );

			}

			outputJSON.scenes.push( gltfScene );

			var nodes = [];

			for ( var i = 0, l = scene.children.length; i < l; i ++ ) {

				var child = scene.children[ i ];

				if ( child.visible || options.onlyVisible === false ) {

					var node = processNode( child );

					if ( node !== null ) {

						nodes.push( node );

					}

				}

			}

			if ( nodes.length > 0 ) {

				gltfScene.nodes = nodes;

			}

			serializeUserData( scene, gltfScene );

		}

		/**
		 * Creates a THREE.Scene to hold a list of objects and parse it
		 * @param  {Array} objects List of objects to process
		 */
		function processObjects( objects ) {

			var scene = new THREE.Scene();
			scene.name = 'AuxScene';

			for ( var i = 0; i < objects.length; i ++ ) {

				// We push directly to children instead of calling `add` to prevent
				// modify the .parent and break its original scene and hierarchy
				scene.children.push( objects[ i ] );

			}

			processScene( scene );

		}

		function processInput( input ) {

			input = input instanceof Array ? input : [ input ];

			var objectsWithoutScene = [];

			for ( var i = 0; i < input.length; i ++ ) {

				if ( input[ i ] instanceof THREE.Scene ) {

					processScene( input[ i ] );

				} else {

					objectsWithoutScene.push( input[ i ] );

				}

			}

			if ( objectsWithoutScene.length > 0 ) {

				processObjects( objectsWithoutScene );

			}

			for ( var i = 0; i < skins.length; ++ i ) {

				processSkin( skins[ i ] );

			}

			for ( var i = 0; i < options.animations.length; ++ i ) {

				processAnimation( options.animations[ i ], input[ 0 ] );

			}

		}

		processInput( input );

		Promise.all( pending ).then( function () {

			// Merge buffers.
			var blob = new Blob( buffers, { type: 'application/octet-stream' } );

			// Declare extensions.
			var extensionsUsedList = Object.keys( extensionsUsed );
			if ( extensionsUsedList.length > 0 ) outputJSON.extensionsUsed = extensionsUsedList;

			if ( outputJSON.buffers && outputJSON.buffers.length > 0 ) {

				// Update bytelength of the single buffer.
				outputJSON.buffers[ 0 ].byteLength = blob.size;

				var reader = new window.FileReader();

				if ( options.binary === true ) {

					// https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#glb-file-format-specification

					var GLB_HEADER_BYTES = 12;
					var GLB_HEADER_MAGIC = 0x46546C67;
					var GLB_VERSION = 2;

					var GLB_CHUNK_PREFIX_BYTES = 8;
					var GLB_CHUNK_TYPE_JSON = 0x4E4F534A;
					var GLB_CHUNK_TYPE_BIN = 0x004E4942;

					reader.readAsArrayBuffer( blob );
					reader.onloadend = function () {

						// Binary chunk.
						var binaryChunk = getPaddedArrayBuffer( reader.result );
						var binaryChunkPrefix = new DataView( new ArrayBuffer( GLB_CHUNK_PREFIX_BYTES ) );
						binaryChunkPrefix.setUint32( 0, binaryChunk.byteLength, true );
						binaryChunkPrefix.setUint32( 4, GLB_CHUNK_TYPE_BIN, true );

						// JSON chunk.
						var jsonChunk = getPaddedArrayBuffer( stringToArrayBuffer( JSON.stringify( outputJSON ) ), 0x20 );
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

					reader.readAsDataURL( blob );
					reader.onloadend = function () {

						var base64data = reader.result;
						outputJSON.buffers[ 0 ].uri = base64data;
						onDone( outputJSON );

					};

				}

			} else {

				onDone( outputJSON );

			}

		} );

	}

};

THREE.GLTFExporter.Utils = {

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

				mergedTrack.name = '.morphTargetInfluences';
				mergedTrack.values = values;

				mergedTracks[ sourceTrackNode.uuid ] = mergedTrack;
				tracks.push( mergedTrack );

				continue;

			}

			var mergedKeyframeIndex = 0;
			var sourceKeyframeIndex = 0;
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
