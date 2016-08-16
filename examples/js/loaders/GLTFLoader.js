/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.GLTFLoader = function ( manager ) {

	this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

THREE.GLTFLoader.prototype = {

	constructor: THREE.GLTFLoader,

	load: function ( url, onLoad, onProgress, onError ) {

		var scope = this;

		var loader = new THREE.XHRLoader( scope.manager );
		loader.load( url, function ( text ) {

			onLoad( scope.parse( JSON.parse( text ) ) );

		}, onProgress, onError );

	},

	setCrossOrigin: function ( value ) {

		this.crossOrigin = value;

	},

	parse: function ( json ) {

		function stringToArrayBuffer( string ) {

			var bytes = atob( string );
			var buffer = new ArrayBuffer( bytes.length );
			var bufferView = new Uint8Array( buffer );

			for ( var i = 0; i < bytes.length; i ++ ) {

				bufferView[ i ] = bytes.charCodeAt( i );

			}

			return buffer;

		}

		console.time( 'GLTFLoader' );

		var library = {
			buffers: {},
			bufferViews: {},
			accessors: {},
			textures: {},
			materials: {},
			meshes: {},
			nodes: {},
			scenes: {}
		};

		// buffers

		var buffers = json.buffers;

		for ( var bufferId in buffers ) {

			var buffer = buffers[ bufferId ];

			if ( buffer.type === 'arraybuffer' ) {

				var header = 'data:application/octet-stream;base64,';

				if ( buffer.uri.indexOf( header ) === 0 ) {

					library.buffers[ bufferId ] = stringToArrayBuffer( buffer.uri.substr( header.length ) );

				}

			}

		}

		// buffer views

		var bufferViews = json.bufferViews;

		for ( var bufferViewId in bufferViews ) {

			var bufferView = bufferViews[ bufferViewId ];
			var arraybuffer = library.buffers[ bufferView.buffer ];

			library.bufferViews[ bufferViewId ] = arraybuffer.slice( bufferView.byteOffset, bufferView.byteOffset + bufferView.byteLength );

		}

		// accessors

		var COMPONENT_TYPES = {
			5120: Int8Array,
			5121: Uint8Array,
			5122: Int16Array,
			5123: Uint16Array,
			5125: Uint32Array,
			5126: Float32Array,
		};

		var TYPE_SIZES = {
			'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4,
			'MAT2': 4, 'MAT3': 9, 'MAT4': 16
		};

		var accessors = json.accessors;

		for ( var accessorId in accessors ) {

			var accessor = accessors[ accessorId ];

			var arraybuffer = library.bufferViews[ accessor.bufferView ];
			var itemSize = TYPE_SIZES[ accessor.type ];
			var TypedArray = COMPONENT_TYPES[ accessor.componentType ];

			var array = new TypedArray( arraybuffer, accessor.byteOffset, accessor.count * itemSize );

			library.accessors[ accessorId ] = new THREE.BufferAttribute( array, itemSize );

		}

		// textures

		var FILTERS = {
			9728: THREE.NearestFilter,
			9729: THREE.LinearFilter,
			9984: THREE.NearestMipMapNearestFilter,
			9985: THREE.LinearMipMapNearestFilter,
			9986: THREE.NearestMipMapLinearFilter,
			9987: THREE.LinearMipMapLinearFilter
		};

		var WRAPPINGS = {
			33071: THREE.ClampToEdgeWrapping,
			33648: THREE.MirroredRepeatWrapping,
			10497: THREE.RepeatWrapping
		};

		var textures = json.textures;

		for ( var textureId in textures ) {

			var texture = textures[ textureId ];

			var _texture = new THREE.Texture();
			_texture.flipY = false;

			if ( texture.source ) {

				var source = json.images[ texture.source ];

				_texture.image = new Image();
				_texture.image.src = source.uri;
				_texture.needsUpdate = true;

			}

			if ( texture.sampler ) {

				var sampler = json.samplers[ texture.sampler ];

				_texture.magFilter = FILTERS[ sampler.magFilter ];
				_texture.minFilter = FILTERS[ sampler.minFilter ];
				_texture.wrapS = WRAPPINGS[ sampler.wrapS ];
				_texture.wrapT = WRAPPINGS[ sampler.wrapT ];

			}

			library.textures[ textureId ] = _texture;

		}

		// materials

		var materials = json.materials;

		for ( var materialId in materials ) {

			var material = materials[ materialId ];

			var _material = new THREE.MeshPhongMaterial();
			_material.name = material.name;

			var values = material.values;

			if ( Array.isArray( values.diffuse ) ) {

					_material.color.fromArray( values.diffuse );

			} else if ( typeof( values.diffuse ) === 'string' ) {

					_material.map = library.textures[ values.diffuse ];

			}

			if ( Array.isArray( values.emission ) ) _material.emissive.fromArray( values.emission );
			if ( Array.isArray( values.specular ) ) _material.specular.fromArray( values.specular );

			if ( values.shininess !== undefined ) _material.shininess = values.shininess;


			library.materials[ materialId ] = _material;

		}

		// meshes

		var meshes = json.meshes;

		for ( var meshId in meshes ) {

			var mesh = meshes[ meshId ];

			var group = new THREE.Group();
			group.name = mesh.name;

			var primitives = mesh.primitives;

			for ( var i = 0; i < primitives.length; i ++ ) {

				var primitive = primitives[ i ];
				var attributes = primitive.attributes;

				var geometry = new THREE.BufferGeometry();

				if ( primitive.indices ) {

					geometry.setIndex( library.accessors[ primitive.indices ] );

				}

				for ( var attributeId in attributes ) {

					var attribute = attributes[ attributeId ];
					var bufferAttribute = library.accessors[ attribute ];

					switch ( attributeId ) {

						case 'POSITION':
							geometry.addAttribute( 'position', bufferAttribute );
							break;

						case 'NORMAL':
							geometry.addAttribute( 'normal', bufferAttribute );
							break;

						case 'TEXCOORD_0':
							geometry.addAttribute( 'uv', bufferAttribute );
							break;

					}

				}

				var material = library.materials[ primitive.material ];

				group.add( new THREE.Mesh( geometry, material ) );

			}

			library.meshes[ meshId ] = group;

		}

		// nodes

		var nodes = json.nodes;
		var matrix = new THREE.Matrix4();

		for ( var nodeId in nodes ) {

			var node = nodes[ nodeId ];

			var object = new THREE.Group();
			object.name = node.name;

			if ( node.translation !== undefined ) {

				object.position.fromArray( node.translation );

			}

			if ( node.rotation !== undefined ) {

				object.quaternion.fromArray( node.rotation );

			}

			if ( node.scale !== undefined ) {

				object.scale.fromArray( node.scale );

			}

			if ( node.matrix !== undefined ) {

				matrix.fromArray( node.matrix );
				matrix.decompose( object.position, object.quaternion, object.scale );

			}

			if ( node.meshes !== undefined ) {

				for ( var i = 0; i < node.meshes.length; i ++ ) {

					var meshId = node.meshes[ i ];
					var group = library.meshes[ meshId ];

					object.add( group.clone() );

				}

			}

			library.nodes[ nodeId ] = object;

		}

		for ( var nodeId in nodes ) {

			var node = nodes[ nodeId ];

			for ( var i = 0; i < node.children.length; i ++ ) {

				var child = node.children[ i ];

				library.nodes[ nodeId ].add( library.nodes[ child ] );

			}

		}

		// scenes

		var scenes = json.scenes;

		for ( var sceneId in scenes ) {

			var scene = scenes[ sceneId ];
			var container = new THREE.Scene();

			for ( var i = 0; i < scene.nodes.length; i ++ ) {

				var node = scene.nodes[ i ];
				container.add( library.nodes[ node ] );

			}

			library.scenes[ sceneId ] = container;

		}

		console.timeEnd( 'GLTFLoader' );

		return {

			scene: library.scenes[ json.scene ]

		};

	}

};
