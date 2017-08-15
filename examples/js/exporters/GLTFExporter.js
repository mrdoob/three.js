/**
 * @author fernandojsg / http://fernandojsg.com
 */

//------------------------------------------------------------------------------
// GLTF Exporter
//------------------------------------------------------------------------------
THREE.GLTFExporter = function ( renderer ) {

	this.renderer = renderer;

};

THREE.GLTFExporter.prototype = {

	constructor: THREE.GLTFExporter,

	/**
	 * Parse scenes and generate GLTF output
	 * @param  {THREE.Scene or [THREE.Scenes]} input   THREE.Scene or Array of THREE.Scenes
	 * @param  {Function} onDone  Callback on completed
	 * @param  {Object} options options
	 *                          trs: Exports position, rotation and scale instead of matrix
	 */
	parse: function ( input, onDone, options ) {

		options = options || {};

		var glUtils = new THREE.WebGLUtils( this.renderer.context, this.renderer.extensions );
		var gl = this.renderer.context;

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
		/**
		 * Compare two arrays
		 * @param  {Array} array1 Array 1 to compare
		 * @param  {Array} array2 Array 2 to compare
		 * @return {Boolean}        Returns true if both arrays are equal
		 */
		function equalArray ( array1, array2 ) {

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
			var offsetInc = componentType === gl.UNSIGNED_SHORT ? 2 : 4;

			for ( var i = 0; i < attribute.count; i++ ) {

				for (var a = 0; a < attribute.itemSize; a++ ) {

					var value = attribute.array[ i * attribute.itemSize + a ];

					if ( componentType === gl.FLOAT ) {

						dataView.setFloat32( offset, value, true );

					} else if ( componentType === gl.UNSIGNED_INT ) {

						dataView.setUint8( offset, value, true );

					} else if ( componentType === gl.UNSIGNED_SHORT ) {

						dataView.setUint16( offset, value, true );

					}

					offset += offsetInc;

				}

			}

			// We just use one buffer
			dataViews.push( dataView );

			// Always using just one buffer
			return 0;
		}

		/**
		 * Process and generate a BufferView
		 * @param  {[type]} data [description]
		 * @return {[type]}      [description]
		 */
		function processBufferView ( data, componentType ) {

			var isVertexAttributes = componentType === gl.FLOAT;

			if ( !outputJSON.bufferViews ) {

				outputJSON.bufferViews = [];

			}

			var gltfBufferView = {

				buffer: processBuffer( data, componentType ),
				byteOffset: byteOffset,
				byteLength: data.array.byteLength,
				byteStride: data.itemSize * ( componentType === gl.UNSIGNED_SHORT ? 2 : 4 ),
				target: isVertexAttributes ? gl.ARRAY_BUFFER : gl.ELEMENT_ARRAY_BUFFER

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

			var componentType;

			// Detect the component type of the attribute array (float, uint or ushort)
			if ( attribute.array.constructor === Float32Array ) {

				componentType = gl.FLOAT;

			} else if ( attribute.array.constructor === Uint32Array ) {

				componentType = gl.UNSIGNED_INT;

			} else if ( attribute.array.constructor === Uint16Array ) {

				componentType = gl.UNSIGNED_SHORT;

			} else {

				throw new Error( 'THREE.GLTF2Exporter: Unsupported bufferAttribute component type.' );

			}

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

				magFilter: glUtils.convert( map.magFilter ),
				minFilter: glUtils.convert( map.minFilter ),
				wrapS: glUtils.convert( map.wrapS ),
				wrapT: glUtils.convert( map.wrapT )

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

			if ( !( material instanceof THREE.MeshStandardMaterial ) ) {

				console.warn( 'Currently just THREE.StandardMaterial is supported. Material conversion may lose information.' );

			}

			// @QUESTION Should we avoid including any attribute that has the default value?
			var gltfMaterial = {

				pbrMetallicRoughness: {}

			};

			// pbrMetallicRoughness.baseColorFactor
			var color = material.color.toArray().concat( [ material.opacity ] );

			if ( !equalArray( color, [ 1, 1, 1, 1 ] ) ) {

				gltfMaterial.pbrMetallicRoughness.baseColorFactor = color;

			}

			if ( material instanceof THREE.MeshStandardMaterial ) {

				gltfMaterial.pbrMetallicRoughness.metallicFactor = material.metalness;
				gltfMaterial.pbrMetallicRoughness.roughnessFactor = material.roughness;

 			} else {

					gltfMaterial.pbrMetallicRoughness.metallicFactor = 0.5;
					gltfMaterial.pbrMetallicRoughness.roughnessFactor = 0.5;

			}

			// pbrMetallicRoughness.baseColorTexture
			if ( material.map ) {

				gltfMaterial.pbrMetallicRoughness.baseColorTexture = {

					index: processTexture( material.map ),
					texCoord: 0 // @FIXME

				};

			}

			if ( material instanceof THREE.MeshBasicMaterial ||
				material instanceof THREE.LineBasicMaterial ||
				material instanceof THREE.PointsMaterial ) {

			} else {

				// emissiveFactor
				var emissive = material.emissive.clone().multiplyScalar( material.emissiveIntensity ).toArray();

				if ( !equalArray( emissive, [ 0, 0, 0 ] ) ) {

					gltfMaterial.emissiveFactor = emissive;

				}

				// emissiveTexture
				if ( material.emissiveMap ) {

					gltfMaterial.emissiveTexture = {

						index: processTexture( material.emissiveMap ),
						texCoord: 0 // @FIXME

					};

				}

			}

			// normalTexture
			if ( material.normalMap ) {

				gltfMaterial.normalTexture = {

					index: processTexture( material.normalMap ),
					texCoord: 0 // @FIXME

				};

			}

			// occlusionTexture
			if ( material.aoMap ) {

				gltfMaterial.occlusionTexture = {

					index: processTexture( material.aoMap ),
					texCoord: 0 // @FIXME

				};

			}

			// alphaMode
			if ( material.transparent ) {

				gltfMaterial.alphaMode = 'BLEND'; // @FIXME We should detect MASK or BLEND

			}

			// doubleSided
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

			// Use the correct mode
			if ( mesh instanceof THREE.LineSegments ) {

				mode = gl.LINES;

			} else if ( mesh instanceof THREE.LineLoop ) {

				mode = gl.LINE_LOOP;

			} else if ( mesh instanceof THREE.Line ) {

				mode = gl.LINE_STRIP;

			} else if ( mesh instanceof THREE.Points ) {

				mode = gl.POINTS;

			} else {

				if ( !( geometry instanceof THREE.BufferGeometry) ) {

					var geometryTemp = new THREE.BufferGeometry();
					geometryTemp.fromGeometry( geometry );
					geometry = geometryTemp;

				}

				if ( mesh.drawMode === THREE.TriangleFanDrawMode ) {

					console.warn( 'GLTFExporter: TriangleFanDrawMode and wireframe incompatible.' );
					mode = gl.TRIANGLE_FAN;

				} else if ( mesh.drawMode === THREE.TriangleStripDrawMode ) {

					mode = mesh.material.wireframe ? gl.LINE_STRIP : gl.TRIANGLE_STRIP;

				} else {

					mode = mesh.material.wireframe ? gl.LINES : gl.TRIANGLES;

				}

			}

			var gltfMesh = {
				primitives: [
					{
						mode: mode,
						attributes: {},
						material: processMaterial( mesh.material )
					}
				]
			};

			if ( geometry.index ) {

				gltfMesh.primitives[ 0 ].indices = processAccessor( geometry.index );

			}

			// We've just one primitive per mesh
			var gltfAttributes = gltfMesh.primitives[ 0 ].attributes;
			var attributes = geometry.attributes;

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
				gltfAttributes[ attributeName ] = processAccessor( attribute );

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

				};

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

				if ( !equalArray( rotation, [ 0, 0, 0, 1 ] ) ) {

					gltfNode.rotation = rotation;

				}

				if ( !equalArray( position, [ 0, 0, 0 ] ) ) {

					gltfNode.position = position;

				}

				if ( !equalArray( scale, [ 1, 1, 1 ] ) ) {

					gltfNode.scale = scale;

				}

			} else {

				object.updateMatrix();
				if (! equalArray( object.matrix.elements, [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ] ) ) {

					gltfNode.matrix = object.matrix.elements;

				}

			}

			if ( object.name ) {

				gltfNode.name = object.name;

			}

			if ( object.userData && Object.keys( object.userData ).length > 0 ) {

				try {

					gltfNode.extras = JSON.parse( JSON.stringify( object.userData ) );

				} catch (e) {

					throw new Error( 'GLTFExporter: userData can\'t be serialized' );

				}

			}

			if ( object instanceof THREE.Mesh ||
				object instanceof THREE.Line ||
				object instanceof THREE.Points ) {

				gltfNode.mesh = processMesh( object );

			} else if ( object instanceof THREE.Camera ) {

				gltfNode.camera = processCamera( object );

			}

			if ( object.children.length > 0 ) {

				gltfNode.children = [];

				for ( var i = 0, l = object.children.length; i < l; i ++ ) {

					var child = object.children[ i ];
					if ( child instanceof THREE.Mesh ||
						child instanceof THREE.Camera ||
						child instanceof THREE.Group ||
						child instanceof THREE.Line ||
						child instanceof THREE.Points) {

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

				// @TODO We don't process lights yet
				if ( child instanceof THREE.Mesh ||
					child instanceof THREE.Camera ||
					child instanceof THREE.Group ||
					child instanceof THREE.Line ||
					child instanceof THREE.Points) {

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
		if ( outputJSON.buffers && outputJSON.buffers.length > 0 ) {

			outputJSON.buffers[ 0 ].byteLength = blob.size;
			objectURL = URL.createObjectURL( blob );

			var reader = new window.FileReader();
			 reader.readAsDataURL( blob );
			 reader.onloadend = function() {

				 base64data = reader.result;
				 outputJSON.buffers[ 0 ].uri = base64data;
				 onDone( outputJSON );

			 };

		} else {

			onDone ( outputJSON );

		}
	}
};
