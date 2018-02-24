/**
 * @author fernandojsg / http://fernandojsg.com
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
	LINEAR_MIPMAP_LINEAR: 0x2703
};

var THREE_TO_WEBGL = {
	// @TODO Replace with computed property name [THREE.*] when available on es6
	1003: WEBGL_CONSTANTS.NEAREST,
	1004: WEBGL_CONSTANTS.NEAREST_MIPMAP_NEAREST,
	1005: WEBGL_CONSTANTS.NEAREST_MIPMAP_LINEAR,
	1006: WEBGL_CONSTANTS.LINEAR,
	1007: WEBGL_CONSTANTS.LINEAR_MIPMAP_NEAREST,
	1008: WEBGL_CONSTANTS.LINEAR_MIPMAP_LINEAR
};

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
			trs: false,
			onlyVisible: true,
			truncateDrawRange: true,
			embedImages: true,
			animations: [],
			forceIndices: false,
			forcePowerOfTwoTexture: false
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
		var dataViews = [];
		var nodeMap = {};
		var skins = [];
		var cachedData = {

			materials: {},
			textures: {}

		};

		var cachedCanvas;

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
		function stringToArrayBuffer( text, padded ) {
			if ( padded ) {

				var pad = getPaddedBufferSize( text.length ) - text.length;

				for ( var i = 0; i < pad; i++ ) {

					text += ' ';

				}

			}

			if ( window.TextEncoder !== undefined ) {

				return new TextEncoder().encode( text ).buffer;

			}

			var buffer = new ArrayBuffer( text.length );

			var bufferView = new Uint8Array( buffer );

			for ( var i = 0; i < text.length; ++ i ) {

				bufferView[ i ] = text.charCodeAt( i );

			}

			return buffer;

		}

		/**
		 * Get the min and max vectors from the given attribute
		 * @param  {THREE.BufferAttribute} attribute Attribute to find the min/max
		 * @return {Object} Object containing the `min` and `max` values (As an array of attribute.itemSize components)
		 */
		function getMinMax( attribute ) {

			var output = {

				min: new Array( attribute.itemSize ).fill( Number.POSITIVE_INFINITY ),
				max: new Array( attribute.itemSize ).fill( Number.NEGATIVE_INFINITY )

			};

			for ( var i = 0; i < attribute.count; i ++ ) {

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
		 * @returns {ArrayBuffer} The same buffer if it's already aligned to 4-byte boundary or a new buffer
		 */
		function getPaddedArrayBuffer( arrayBuffer ) {
						
			var paddedLength = getPaddedBufferSize( arrayBuffer.byteLength );
			
			if (paddedLength !== arrayBuffer.byteLength ) {
			
				var paddedBuffer = new ArrayBuffer( paddedLength );
				new Uint8Array( paddedBuffer ).set(new Uint8Array(arrayBuffer));
				return paddedBuffer;

			}

			return arrayBuffer;

		}

		/**
		 * Process a buffer to append to the default one.
		 * @param  {THREE.BufferAttribute} attribute     Attribute to store
		 * @param  {Integer} componentType Component type (Unsigned short, unsigned int or float)
		 * @return {Integer}               Index of the buffer created (Currently always 0)
		 */
		function processBuffer( attribute, componentType, start, count ) {

			if ( ! outputJSON.buffers ) {

				outputJSON.buffers = [

					{

						byteLength: 0,
						uri: ''

					}

				];

			}

			var offset = 0;
			var componentSize = componentType === WEBGL_CONSTANTS.UNSIGNED_SHORT ? 2 : 4;

			// Create a new dataview and dump the attribute's array into it
			var byteLength = count * attribute.itemSize * componentSize;

			// adjust required size of array buffer with padding
			// to satisfy gltf requirement that the length is divisible by 4
			byteLength = getPaddedBufferSize( byteLength );

			var dataView = new DataView( new ArrayBuffer( byteLength ) );

			for ( var i = start; i < start + count; i ++ ) {

				for ( var a = 0; a < attribute.itemSize; a ++ ) {

					var value = attribute.array[ i * attribute.itemSize + a ];

					if ( componentType === WEBGL_CONSTANTS.FLOAT ) {

						dataView.setFloat32( offset, value, true );

					} else if ( componentType === WEBGL_CONSTANTS.UNSIGNED_INT ) {

						dataView.setUint32( offset, value, true );

					} else if ( componentType === WEBGL_CONSTANTS.UNSIGNED_SHORT ) {

						dataView.setUint16( offset, value, true );

					}

					offset += componentSize;

				}

			}

			// We just use one buffer
			dataViews.push( dataView );

			// Always using just one buffer
			return 0;

		}

		/**
		 * Process and generate a BufferView
		 * @param  {THREE.BufferAttribute} data
		 * @param  {number} componentType
		 * @param  {number} start
		 * @param  {number} count
		 * @param  {number} target (Optional) Target usage of the BufferView
		 * @return {Object}
		 */
		function processBufferView( data, componentType, start, count, target ) {

			if ( ! outputJSON.bufferViews ) {

				outputJSON.bufferViews = [];

			}

			var componentSize = componentType === WEBGL_CONSTANTS.UNSIGNED_SHORT ? 2 : 4;

			// Create a new dataview and dump the attribute's array into it
			var byteLength = count * data.itemSize * componentSize;

			var gltfBufferView = {

				buffer: processBuffer( data, componentType, start, count ),
				byteOffset: byteOffset,
				byteLength: byteLength

			};

			if ( target !== undefined ) gltfBufferView.target = target;

			if ( target === WEBGL_CONSTANTS.ARRAY_BUFFER ) {

				// Only define byteStride for vertex attributes.
				gltfBufferView.byteStride = data.itemSize * componentSize;

			}

			byteOffset += byteLength;

			outputJSON.bufferViews.push( gltfBufferView );

			// @TODO Ideally we'll have just two bufferviews: 0 is for vertex attributes, 1 for indices
			var output = {

				id: outputJSON.bufferViews.length - 1,
				byteLength: 0

			};

			return output;

		}

		/**
		 * Process attribute to generate an accessor
		 * @param  {THREE.BufferAttribute} attribute Attribute to process
		 * @param  {THREE.BufferGeometry} geometry (Optional) Geometry used for truncated draw range
		 * @return {Integer}           Index of the processed accessor on the "accessors" array
		 */
		function processAccessor( attribute, geometry ) {

			if ( ! outputJSON.accessors ) {

				outputJSON.accessors = [];

			}

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

			} else {

				throw new Error( 'THREE.GLTFExporter: Unsupported bufferAttribute component type.' );

			}

			var minMax = getMinMax( attribute );

			var start = 0;
			var count = attribute.count;

			// @TODO Indexed buffer geometry with drawRange not supported yet
			if ( options.truncateDrawRange && geometry !== undefined && geometry.index === null ) {

				start = geometry.drawRange.start;
				count = geometry.drawRange.count !== Infinity ? geometry.drawRange.count : attribute.count;

			}

			var bufferViewTarget;

			// If geometry isn't provided, don't infer the target usage of the bufferView. For
			// animation samplers, target must not be set.
			if ( geometry !== undefined ) {

				var isVertexAttributes = componentType === WEBGL_CONSTANTS.FLOAT;
				bufferViewTarget = isVertexAttributes ? WEBGL_CONSTANTS.ARRAY_BUFFER : WEBGL_CONSTANTS.ELEMENT_ARRAY_BUFFER;

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

			outputJSON.accessors.push( gltfAccessor );

			return outputJSON.accessors.length - 1;

		}

		/**
		 * Process image
		 * @param  {Texture} map Texture to process
		 * @return {Integer}     Index of the processed texture in the "images" array
		 */
		function processImage( map ) {

			// @TODO Cache

			if ( ! outputJSON.images ) {

				outputJSON.images = [];

			}

			var mimeType = map.format === THREE.RGBAFormat ? 'image/png' : 'image/jpeg';
			var gltfImage = { mimeType: mimeType };

			if ( options.embedImages ) {

				var canvas = cachedCanvas = cachedCanvas || document.createElement( 'canvas' );

				canvas.width = map.image.width;
				canvas.height = map.image.height;

				if ( options.forcePowerOfTwoTexture && ! isPowerOfTwo( map.image ) ) {

					console.warn( 'GLTFExporter: Resized non-power-of-two image.', map.image );

					canvas.width = THREE.Math.floorPowerOfTwo( canvas.width );
					canvas.height = THREE.Math.floorPowerOfTwo( canvas.height );

				}

				var ctx = canvas.getContext( '2d' );

				if ( map.flipY === true ) {

					ctx.translate( 0, canvas.height );
					ctx.scale( 1, - 1 );

				}

				ctx.drawImage( map.image, 0, 0, canvas.width, canvas.height );

				// @TODO Embed in { bufferView } if options.binary set.

				gltfImage.uri = canvas.toDataURL( mimeType );

			} else {

				gltfImage.uri = map.image.src;

			}

			outputJSON.images.push( gltfImage );

			return outputJSON.images.length - 1;

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

			if ( cachedData.textures[ map.uuid ] !== undefined ) {

				return cachedData.textures[ map.uuid ];

			}

			if ( ! outputJSON.textures ) {

				outputJSON.textures = [];

			}

			var gltfTexture = {

				sampler: processSampler( map ),
				source: processImage( map )

			};

			outputJSON.textures.push( gltfTexture );

			var index = outputJSON.textures.length - 1;
			cachedData.textures[ map.uuid ] = index;

			return index;

		}

		/**
		 * Process material
		 * @param  {THREE.Material} material Material to process
		 * @return {Integer}      Index of the processed material in the "materials" array
		 */
		function processMaterial( material ) {

			if ( cachedData.materials[ material.uuid ] !== undefined ) {

				return cachedData.materials[ material.uuid ];

			}

			if ( ! outputJSON.materials ) {

				outputJSON.materials = [];

			}

			if ( material instanceof THREE.ShaderMaterial ) {

				console.warn( 'GLTFExporter: THREE.ShaderMaterial not supported.' );
				return null;

			}


			if ( ! ( material instanceof THREE.MeshStandardMaterial ) ) {

				console.warn( 'GLTFExporter: Currently just THREE.StandardMaterial is supported. Material conversion may lose information.' );

			}

			// @QUESTION Should we avoid including any attribute that has the default value?
			var gltfMaterial = {

				pbrMetallicRoughness: {}

			};

			// pbrMetallicRoughness.baseColorFactor
			var color = material.color.toArray().concat( [ material.opacity ] );

			if ( ! equalArray( color, [ 1, 1, 1, 1 ] ) ) {

				gltfMaterial.pbrMetallicRoughness.baseColorFactor = color;

			}

			if ( material instanceof THREE.MeshStandardMaterial ) {

				gltfMaterial.pbrMetallicRoughness.metallicFactor = material.metalness;
				gltfMaterial.pbrMetallicRoughness.roughnessFactor = material.roughness;

			} else {

				gltfMaterial.pbrMetallicRoughness.metallicFactor = 0.5;
				gltfMaterial.pbrMetallicRoughness.roughnessFactor = 0.5;

			}

			// pbrMetallicRoughness.metallicRoughnessTexture
			if ( material.metalnessMap || material.roughnessMap ) {

				if ( material.metalnessMap === material.roughnessMap ) {

					gltfMaterial.pbrMetallicRoughness.metallicRoughnessTexture = {

						index: processTexture( material.metalnessMap )

					};

				} else {

					console.warn( 'THREE.GLTFExporter: Ignoring metalnessMap and roughnessMap because they are not the same Texture.' );

				}

			}

			// pbrMetallicRoughness.baseColorTexture
			if ( material.map ) {

				gltfMaterial.pbrMetallicRoughness.baseColorTexture = {

					index: processTexture( material.map )

				};

			}

			if ( material instanceof THREE.MeshBasicMaterial ||
				material instanceof THREE.LineBasicMaterial ||
				material instanceof THREE.PointsMaterial ) {

			} else {

				// emissiveFactor
				var emissive = material.emissive.clone().multiplyScalar( material.emissiveIntensity ).toArray();

				if ( ! equalArray( emissive, [ 0, 0, 0 ] ) ) {

					gltfMaterial.emissiveFactor = emissive;

				}

				// emissiveTexture
				if ( material.emissiveMap ) {

					gltfMaterial.emissiveTexture = {

						index: processTexture( material.emissiveMap )

					};

				}

			}

			// normalTexture
			if ( material.normalMap ) {

				gltfMaterial.normalTexture = {

					index: processTexture( material.normalMap )

				};

				if ( material.normalScale.x !== - 1 ) {

					if ( material.normalScale.x !== material.normalScale.y ) {

						console.warn( 'THREE.GLTFExporter: Normal scale components are different, ignoring Y and exporting X.' );

					}

					gltfMaterial.normalTexture.scale = material.normalScale.x;

				}

			}

			// occlusionTexture
			if ( material.aoMap ) {

				gltfMaterial.occlusionTexture = {

					index: processTexture( material.aoMap )

				};

				if ( material.aoMapIntensity !== 1.0 ) {

					gltfMaterial.occlusionTexture.strength = material.aoMapIntensity;

				}

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

			if ( material.name ) {

				gltfMaterial.name = material.name;

			}

			outputJSON.materials.push( gltfMaterial );

			var index = outputJSON.materials.length - 1;
			cachedData.materials[ material.uuid ] = index;

			return index;

		}

		/**
		 * Process mesh
		 * @param  {THREE.Mesh} mesh Mesh to process
		 * @return {Integer}      Index of the processed mesh in the "meshes" array
		 */
		function processMesh( mesh ) {

			if ( ! outputJSON.meshes ) {

				outputJSON.meshes = [];

			}

			var geometry = mesh.geometry;

			var mode;

			// Use the correct mode
			if ( mesh instanceof THREE.LineSegments ) {

				mode = WEBGL_CONSTANTS.LINES;

			} else if ( mesh instanceof THREE.LineLoop ) {

				mode = WEBGL_CONSTANTS.LINE_LOOP;

			} else if ( mesh instanceof THREE.Line ) {

				mode = WEBGL_CONSTANTS.LINE_STRIP;

			} else if ( mesh instanceof THREE.Points ) {

				mode = WEBGL_CONSTANTS.POINTS;

			} else {

				if ( ! geometry.isBufferGeometry ) {

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

			var gltfMesh = {
				primitives: [
					{
						mode: mode,
						attributes: {},
					}
				]
			};

			var material = processMaterial( mesh.material );
			if ( material !== null ) {

				gltfMesh.primitives[ 0 ].material = material;

			}


			if ( geometry.index ) {

				gltfMesh.primitives[ 0 ].indices = processAccessor( geometry.index, geometry );

			} else if ( options.forceIndices ) {

				var numFaces = geometry.attributes.position.count;
				var indices = new Uint32Array( numFaces );
				for ( var i = 0; i < numFaces; i ++ ) {

					indices[ i ] = i;

				}

				gltfMesh.primitives[ 0 ].indices = processAccessor( new THREE.Uint32BufferAttribute( indices, 1 ), geometry );

			}

			// We've just one primitive per mesh
			var gltfAttributes = gltfMesh.primitives[ 0 ].attributes;

			// Conversion between attributes names in threejs and gltf spec
			var nameConversion = {

				uv: 'TEXCOORD_0',
				uv2: 'TEXCOORD_1',
				color: 'COLOR_0',
				skinWeight: 'WEIGHTS_0',
				skinIndex: 'JOINTS_0'

			};

			// @QUESTION Detect if .vertexColors = THREE.VertexColors?
			// For every attribute create an accessor
			for ( var attributeName in geometry.attributes ) {

				var attribute = geometry.attributes[ attributeName ];
				attributeName = nameConversion[ attributeName ] || attributeName.toUpperCase();

				if ( attributeName.substr( 0, 5 ) !== 'MORPH' ) {

					gltfAttributes[ attributeName ] = processAccessor( attribute, geometry );

				}

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

				gltfMesh.primitives[ 0 ].targets = [];

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

						// Three.js morph attribute has absolute values while the one of glTF has relative values.
						//
						// glTF 2.0 Specification:
						// https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#morph-targets

						var baseAttribute = geometry.attributes[ attributeName ];
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

						target[ attributeName.toUpperCase() ] = processAccessor( relativeAttribute, geometry );

					}

					gltfMesh.primitives[ 0 ].targets.push( target );

					weights.push( mesh.morphTargetInfluences[ i ] );
					if ( mesh.morphTargetDictionary !== undefined ) targetNames.push( reverseDictionary[ i ] );

				}

				gltfMesh.weights = weights;

				if ( targetNames.length > 0 ) {

					gltfMesh.extras = {};
					gltfMesh.extras.targetNames = targetNames;

				}

			}

			outputJSON.meshes.push( gltfMesh );

			return outputJSON.meshes.length - 1;

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

			var isOrtho = camera instanceof THREE.OrthographicCamera;

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
					yfov: THREE.Math.degToRad( camera.fov ) / camera.aspect,
					zfar: camera.far <= 0 ? 0.001 : camera.far,
					znear: camera.near < 0 ? 0 : camera.near

				};

			}

			if ( camera.name ) {

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

			var channels = [];
			var samplers = [];

			for ( var i = 0; i < clip.tracks.length; ++ i ) {

				var track = clip.tracks[ i ];
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
						node: nodeMap[ trackNode.uuid ],
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

			var node = outputJSON.nodes[ nodeMap[ object.uuid ] ];

			var skeleton = object.skeleton;
			var rootJoint = object.skeleton.bones[ 0 ];

			if ( rootJoint === undefined ) return null;

			var joints = [];
			var inverseBindMatrices = new Float32Array( skeleton.bones.length * 16 );

			for ( var i = 0; i < skeleton.bones.length; ++ i ) {

				joints.push( nodeMap[ skeleton.bones[ i ].uuid ] );

				skeleton.boneInverses[ i ].toArray( inverseBindMatrices, i * 16 );

			}

			if ( outputJSON.skins === undefined ) {

				outputJSON.skins = [];

			}

			outputJSON.skins.push( {

				inverseBindMatrices: processAccessor( new THREE.BufferAttribute( inverseBindMatrices, 16 ) ),
				joints: joints,
				skeleton: nodeMap[ rootJoint.uuid ]

			} );

			var skinIndex = node.skin = outputJSON.skins.length - 1;

			return skinIndex;

		}

		/**
		 * Process Object3D node
		 * @param  {THREE.Object3D} node Object3D to processNode
		 * @return {Integer}      Index of the node in the nodes list
		 */
		function processNode( object ) {

			if ( object instanceof THREE.Light ) {

				console.warn( 'GLTFExporter: Unsupported node type:', object.constructor.name );
				return null;

			}

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

			if ( object.userData && Object.keys( object.userData ).length > 0 ) {

				try {

					gltfNode.extras = JSON.parse( JSON.stringify( object.userData ) );

				} catch ( e ) {

					throw new Error( 'THREE.GLTFExporter: userData can\'t be serialized' );

				}

			}

			if ( object instanceof THREE.Mesh ||
				object instanceof THREE.Line ||
				object instanceof THREE.Points ) {

				gltfNode.mesh = processMesh( object );

			} else if ( object instanceof THREE.Camera ) {

				gltfNode.camera = processCamera( object );

			}

			if ( object instanceof THREE.SkinnedMesh ) {

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

			var nodeIndex = nodeMap[ object.uuid ] = outputJSON.nodes.length - 1;

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

			if ( scene.name ) {

				gltfScene.name = scene.name;

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

		// Generate buffer
		// Create a new blob with all the dataviews from the buffers
		var blob = new Blob( dataViews, { type: 'application/octet-stream' } );

		// Update the bytlength of the only main buffer and update the uri with the base64 representation of it
		if ( outputJSON.buffers && outputJSON.buffers.length > 0 ) {

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
					delete outputJSON.buffers[ 0 ].uri; // Omitted URI indicates use of binary chunk.
					var jsonChunk = stringToArrayBuffer( JSON.stringify( outputJSON ), true );
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

	}

};