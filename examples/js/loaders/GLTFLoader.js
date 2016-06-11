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

		// meshes

		var meshes = json.meshes;

		for ( var meshId in meshes ) {

			var mesh = meshes[ meshId ];

			var geometries = {
				name: mesh.name,
				array: []
			};

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

				geometries.array.push( geometry );

			}

			library.meshes[ meshId ] = geometries;

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

					var geometries = library.meshes[ meshId ];

					var group = new THREE.Group();
					group.name = geometries.name;
					object.add( group );

					var array = geometries.array;

					for ( var j = 0; j < array.length; j ++ ) {

						group.add( new THREE.Mesh( array[ j ], new THREE.MeshNormalMaterial() ) );

					}

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
