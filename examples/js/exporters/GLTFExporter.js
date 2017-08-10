/**
 * @author fernandojsg / http://fernandojsg.com
 */

// @TODO Should be accessible from the renderer itself instead of duplicating it here
function paramThreeToGL( p ) {

	var extension;

	if ( p === THREE.RepeatWrapping ) return WebGLConstants.REPEAT;
	if ( p === THREE.ClampToEdgeWrapping ) return WebGLConstants.CLAMP_TO_EDGE;
	if ( p === THREE.MirroredRepeatWrapping ) return WebGLConstants.MIRRORED_REPEAT;

	if ( p === THREE.NearestFilter ) return WebGLConstants.NEAREST;
	if ( p === THREE.NearestMipMapNearestFilter ) return WebGLConstants.NEAREST_MIPMAP_NEAREST;
	if ( p === THREE.NearestMipMapLinearFilter ) return WebGLConstants.NEAREST_MIPMAP_LINEAR;

	if ( p === THREE.LinearFilter ) return WebGLConstants.LINEAR;
	if ( p === THREE.LinearMipMapNearestFilter ) return WebGLConstants.LINEAR_MIPMAP_NEAREST;
	if ( p === THREE.LinearMipMapLinearFilter ) return WebGLConstants.LINEAR_MIPMAP_LINEAR;
	return 0;
}

// @TODO Move it to constants.js ?
var WebGLConstants = {
	POINTS: 0x0000,
	LINES: 0x0001,
	LINE_LOOP: 0x0002,
	LINE_STRIP: 0x0003,
	TRIANGLES: 0x0004,
	TRIANGLE_STRIP: 0x0005,
	TRIANGLE_FAN: 0x0006,

	ARRAY_BUFFER: 0x8892,
	ELEMENT_ARRAY_BUFFER: 0x8893,

	BYTE: 0x1400,
	UNSIGNED_BYTE: 0x1401,
	SHORT: 0x1402,
	UNSIGNED_SHORT: 0x1403,
	INT: 0x1404,
	UNSIGNED_INT: 0x1405,
	FLOAT: 0x1406,

	NEAREST: 0x2600,
	LINEAR: 0x2601,
	NEAREST_MIPMAP_NEAREST: 0x2700,
	LINEAR_MIPMAP_NEAREST: 0x2701,
	NEAREST_MIPMAP_LINEAR: 0x2702,
	LINEAR_MIPMAP_LINEAR: 0x2703,

	REPEAT: 0x2901,
	CLAMP_TO_EDGE: 0x812F,
	MIRRORED_REPEAT: 0x8370,
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
	 * @param  {[type]} onDone  Callback on completed
	 * @param  {[type]} options options
	 *                          trs: Exports position, rotation and scale instead of matrix
	 */
	parse: function ( input, onDone, options) {
		options = options || {};

		var outputJSON = {
			asset: {
				version: "2.0",
				generator: "THREE.JS GLTFExporter" // @QUESTION Does it support spaces?
		 	}
    };

		var byteOffset = 0;
		var dataViews = [];

		/**
		 * Compare two arrays
		 */
		function sameArray ( array1, array2 ) {
			return ( array1.length === array2.length ) && array1.every( function( element, index ) {
    		return element === array2[ index ];
			});
		}

		/**
		 * Get the min and he max vectors from the given attribute
		 * @param  {THREE.WebGLAttribute} attribute Attribute to find the min/max
		 * @return {Object} Object containing the `min` and `max` values (As an array of attribute.itemSize components)
		 */
		function getMinMax ( attribute ) {
			var output = {
				min: new Array( attribute.itemSize ).fill( Number.POSITIVE_INFINITY ),
				max: new Array( attribute.itemSize ).fill( Number.NEGATIVE_INFINITY )
			};

			for ( var i = 0; i < attribute.count; i++ ) {
				for ( var a = 0; a < attribute.itemSize; a++ ) {
					var value = attribute.array[ i * attribute.itemSize + a ];
					output.min[ a ] = Math.min( output.min[ a ], value );
					output.max[ a ] = Math.max( output.max[ a ], value );
				}
			}

			return output;
		}

		/**
		 * Add extension to the extensions array
		 * @param {String} extensionName Extension name
		 */
		function addExtension ( extensionName ) {
			if ( !outputJSON.extensionsUsed ) {
				outputJSON.extensionsUsed = [];
			}

			if ( outputJSON.extensionsUsed.indexOf( extensionName ) !== -1 ) {
				outputJSON.extensionsUsed.push( extensionName );
			}
		}

		/**
		 * Process a buffer to append to the default one.
		 * @param  {THREE.BufferAttribute} attribute     Attribute to store
		 * @param  {Integer} componentType Component type (Unsigned short, unsigned int or float)
		 * @return {Integer}               Index of the buffer created (Currently always 0)
		 */
		function processBuffer ( attribute, componentType ) {
			if ( !outputJSON.buffers ) {
				outputJSON.buffers = [
					{
						byteLength: 0,
						uri: ''
					}
				];
			}

			// Create a new dataview and dump the attribute's array into it
			var dataView = new DataView( new ArrayBuffer( attribute.array.byteLength ) );

			var offset = 0;
			var offsetInc = componentType === WebGLConstants.UNSIGNED_SHORT ? 2 : 4;

			for ( var i = 0; i < attribute.count; i++ ) {
				for (var a = 0; a < attribute.itemSize; a++ ) {
					var value = attribute.array[ i * attribute.itemSize + a ];
					if ( componentType === WebGLConstants.FLOAT ) {
						dataView.setFloat32( offset, value, true );
					} else if ( componentType === WebGLConstants.UNSIGNED_INT ) {
						dataView.setUint8( offset, value, true );
					} else if ( componentType === WebGLConstants.UNSIGNED_SHORT ) {
						dataView.setUint16( offset, value, true );
					}
					offset += offsetInc;
				}
			}

			// We just use one buffer
			dataViews.push( dataView );

			return 0;
		}

		/**
		 * Process and generate a BufferView
		 * @param  {[type]} data [description]
		 * @return {[type]}      [description]
		 */
		function processBufferView ( data, componentType ) {
			var isVertexAttributes = componentType === WebGLConstants.FLOAT;
			if ( !outputJSON.bufferViews ) {
				outputJSON.bufferViews = [];
			}

			var gltfBufferView = {
				buffer: processBuffer( data, componentType ),
				byteOffset: byteOffset,
				byteLength: data.array.byteLength,
				byteStride: data.itemSize * ( componentType === WebGLConstants.UNSIGNED_SHORT ? 2 : 4 ),
				target: isVertexAttributes ? WebGLConstants.ARRAY_BUFFER : WebGLConstants.ELEMENT_ARRAY_BUFFER
			};

			byteOffset += data.array.byteLength;

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
		 * @param  {THREE.WebGLAttribute} attribute Attribute to process
		 * @return {Integer}           Index of the processed accessor on the "accessors" array
		 */
		function processAccessor ( attribute ) {
			if ( !outputJSON.accessors ) {
				outputJSON.accessors = [];
			}

			var types = [
				'SCALAR',
				'VEC2',
				'VEC3',
				'VEC4'
			];

			// Detect the component type of the attribute array (float, uint or ushort)
			var componentType = attribute instanceof THREE.Float32BufferAttribute ? WebGLConstants.FLOAT :
				( attribute instanceof THREE.Uint32BufferAttribute ? WebGLConstants.UNSIGNED_INT : WebGLConstants.UNSIGNED_SHORT );

			var minMax = getMinMax( attribute );
			var bufferView = processBufferView( attribute, componentType );

			var gltfAccessor = {
				bufferView: bufferView.id,
				byteOffset: bufferView.byteOffset,
				componentType: componentType,
				count: attribute.count,
				max: minMax.max,
				min: minMax.min,
				type: types[ attribute.itemSize - 1 ]
			};

			outputJSON.accessors.push( gltfAccessor );

			return outputJSON.accessors.length - 1;
		}

		/**
		 * Process image
		 * @param  {Texture} map Texture to process
		 * @return {Integer}     Index of the processed texture in the "images" array
		 */
		function processImage ( map ) {
			if ( !outputJSON.images ) {
				outputJSON.images = [];
			}

			var gltfImage = {};

			if ( options.embedImages ) {
				// @TODO { bufferView, mimeType }
			} else {
				// @TODO base64 based on options
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
		function processSampler ( map ) {
			if ( !outputJSON.samplers ) {
				outputJSON.samplers = [];
			}

			var gltfSampler = {
				magFilter: paramThreeToGL( map.magFilter ),
				minFilter: paramThreeToGL( map.minFilter ),
				wrapS: paramThreeToGL( map.wrapS ),
				wrapT: paramThreeToGL( map.wrapT )
			};

			outputJSON.samplers.push( gltfSampler );

			return outputJSON.samplers.length - 1;
		}

		/**
		 * Process texture
		 * @param  {Texture} map Map to process
		 * @return {Integer}     Index of the processed texture in the "textures" array
		 */
		function processTexture ( map ) {
			if (!outputJSON.textures) {
				outputJSON.textures = [];
			}

			var gltfTexture = {
				sampler: processSampler( map ),
				source: processImage( map )
			};

			outputJSON.textures.push( gltfTexture );

			return outputJSON.textures.length - 1;
		}

		/**
		 * Process material
		 * @param  {THREE.Material} material Material to process
		 * @return {Integer}      Index of the processed material in the "materials" array
		 */
		function processMaterial ( material ) {
			if ( !outputJSON.materials ) {
				outputJSON.materials = [];
			}

			if ( !material instanceof THREE.MeshStandardMaterial ) {
				throw 'Currently just support THREE.StandardMaterial is supported';
			}

			// @QUESTION Should we avoid including any attribute that has the default value?
			var gltfMaterial = {
				pbrMetallicRoughness: {
					baseColorFactor: material.color.toArray().concat( [ material.opacity ] ),
					metallicFactor: material.metalness,
					roughnessFactor: material.roughness
				}
			};

			if ( material.map ) {
				gltfMaterial.pbrMetallicRoughness.baseColorTexture = {
					index: processTexture( material.map ),
					texCoord: 0 // @FIXME
				}
			}

			if ( material.side === THREE.DoubleSide ) {
				gltfMaterial.doubleSided = true;
			}

			if ( material.name ) {
				gltfMaterial.name = material.name;
			}

			outputJSON.materials.push( gltfMaterial );

			return outputJSON.materials.length - 1;
		}

		/**
		 * Process mesh
		 * @param  {THREE.Mesh} mesh Mesh to process
		 * @return {Integer}      Index of the processed mesh in the "meshes" array
		 */
		function processMesh( mesh ) {
			if ( !outputJSON.meshes ) {
				outputJSON.meshes = [];
			}

			var geometry = mesh.geometry;

			// @FIXME Select the correct mode based on the mesh
			var mode = WebGLConstants.TRIANGLES;

			var gltfMesh = {
				primitives: [
					{
						mode: mode,
						attributes: {},
						material: processMaterial( mesh.material ),
					 	indices: processAccessor( geometry.index )
					}
				]
			};

			// We've just one primitive per mesh
			var gltfAttributes = gltfMesh.primitives[ 0 ].attributes;
			var attributes = geometry.attributes;

			// Conversion between attributes names in threejs and gltf spec
			var nameConversion = {
				uv: 'TEXCOORD_0',
				uv2: 'TEXCOORD_1',
				color: 'COLOR_0'
			};

			// For every attribute create an accessor
			for ( attributeName in geometry.attributes ) {
				var attribute = geometry.attributes[ attributeName ];
				attributeName = nameConversion[ attributeName ] || attributeName.toUpperCase()
				gltfAttributes[ attributeName ] = processAccessor( attribute );
			}

			// @todo Not really necessary, isn't it?
			if ( geometry.type ) {
				gltfMesh.name = geometry.type;
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
			if ( !outputJSON.cameras ) {
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
					zfar: camera.far,
					znear: camera.near

				}

			} else {

				gltfCamera.perspective = {

					aspectRatio: camera.aspect,
					yfov: THREE.Math.degToRad( camera.fov ) / camera.aspect,
					zfar: camera.far,
					znear: camera.near

				};

			}

			if ( camera.name ) {
				gltfCamera.name = camera.type;
			}

			outputJSON.cameras.push( gltfCamera );

			return outputJSON.cameras.length - 1;
		}

		/**
		 * Process Object3D node
		 * @param  {THREE.Object3D} node Object3D to processNode
		 * @return {Integer}      Index of the node in the nodes list
		 */
		function processNode ( object ) {

			if ( !outputJSON.nodes ) {
				outputJSON.nodes = [];
			}

			var gltfNode = {};

			if ( options.trs ) {
				var rotation = object.quaternion.toArray();
				var position = object.position.toArray();
				var scale = object.scale.toArray();

				if ( !sameArray( rotation, [ 0, 0, 0, 1 ] ) ) {
					gltfNode.rotation = rotation;
				}

				if ( !sameArray( position, [ 0, 0, 0 ] ) ) {
					gltfNode.position = position;
				}

				if ( !sameArray( scale, [ 1, 1, 1 ] ) ) {
					gltfNode.scale = scale;
				}

			} else {
				object.updateMatrix();
				if (! sameArray( object.matrix.elements, [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ] ) ) {
					gltfNode.matrix = object.matrix.elements;
				}
			};

			if ( object.name ) {
				gltfNode.name = object.name;
			}

			if ( object instanceof THREE.Mesh ) {
				gltfNode.mesh = processMesh( object );
			} else if ( object instanceof THREE.Camera ) {
				gltfNode.camera = processCamera( object );
			}

			if ( object.children.length > 0 ) {
				gltfNode.children = [];

				for ( var i = 0, l = object.children.length; i < l; i ++ ) {
					var child = object.children[ i ];
					if ( child instanceof THREE.Mesh ) {
						gltfNode.children.push( processNode( child ) );
					}
				}
			}

			outputJSON.nodes.push( gltfNode );

			return outputJSON.nodes.length - 1;
		}

		/**
		 * Process Scene
		 * @param  {THREE.Scene} node Scene to process
		 */
		function processScene( scene ) {
			if ( !outputJSON.scenes ) {
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

			for ( var i = 0, l = scene.children.length; i < l; i ++ ) {
				var child = scene.children[ i ];

				// @TODO Right now we just process meshes and lights
				if ( child instanceof THREE.Mesh || child instanceof THREE.Camera ) {
					gltfScene.nodes.push( processNode( child ) );
				}
			}
		}

		// Process the scene/s
		if ( input instanceof Array ) {
			for ( i = 0; i < input.length; i++ ) {
				processScene( input[ i ] );
			}
		} else {
			processScene( input );
		}

		// Generate buffer
		// Create a new blob with all the dataviews from the buffers
		var blob = new Blob( dataViews, { type: 'application/octet-binary' } );

		// Update the bytlength of the only main buffer and update the uri with the base64 representation of it
		outputJSON.buffers[ 0 ].byteLength = blob.size;
		objectURL = URL.createObjectURL( blob );

		var reader = new window.FileReader();
		 reader.readAsDataURL( blob );
		 reader.onloadend = function() {
			 base64data = reader.result;
			 outputJSON.buffers[ 0 ].uri = base64data;
			 onDone( outputJSON );
		 }
	}
};
