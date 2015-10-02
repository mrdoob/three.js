/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.ColladaLoader = function ( manager ) {

	this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

THREE.ColladaLoader.prototype = {

	constructor: THREE.ColladaLoader,

	load: function ( url, onLoad, onProgress, onError ) {

		var scope = this;

		var loader = new THREE.XHRLoader( scope.manager );
		loader.setCrossOrigin( this.crossOrigin );
		loader.load( url, function ( text ) {

			onLoad( scope.parse( text ) );

		}, onProgress, onError );

	},

	options: {

		set convertUpAxis ( value ) {
			console.log( 'ColladaLoder.options.convertUpAxis: TODO' );
		}

	},

	setCrossOrigin: function ( value ) {

		this.crossOrigin = value;

	},

	parse: function ( text ) {

		function parseFloats( text ) {

			var parts = text.trim().split( /\s+/ );
			var array = new Array( parts.length );

			for ( var i = 0, l = parts.length; i < l; i ++ ) {
				array[ i ] = parseFloat( parts[ i ] );
			}

			return array;

		}

		function parseInts( text ) {

			var parts = text.trim().split( /\s+/ );
			var array = new Array( parts.length );

			for ( var i = 0, l = parts.length; i < l; i ++ ) {
				array[ i ] = parseInt( parts[ i ] );
			}

			return array;

		}

		function parseId( text ) {

			return text.substring( 1 );

		}

		// cameras

		function parseCamerasLibrary( xml ) {

			var library = {};

			var cameras = xml.getElementsByTagName( 'library_cameras' )[ 0 ];

			if ( cameras !== undefined ) {

				var elements = cameras.getElementsByTagName( 'camera' );

				for ( var i = 0; i < elements.length; i ++ ) {

					var element = elements[ i ];
					library[ element.getAttribute( 'id' ) ] = parseCamera( element );

				}

			}

			return library;

		}

		function parseCamera( xml ) {

			console.log( 'ColladaLoader.parseCamera: TODO')

			var camera = new THREE.PerspectiveCamera();
			camera.name = xml.getAttribute( 'name' );
			return camera;

		}

		// geometries

		function parseGeometriesLibrary( xml ) {

			var library = {};

			var geometries = xml.getElementsByTagName( 'library_geometries' )[ 0 ];
			var elements = geometries.getElementsByTagName( 'geometry' );

			for ( var i = 0; i < elements.length; i ++ ) {

				var element = elements[ i ];
				var mesh = parseMesh( element.getElementsByTagName( 'mesh' )[ 0 ] );

				library[ element.getAttribute( 'id' ) ] = createGeometry( mesh );

			}

			return library;

		}

		function parseMesh( xml ) {

			var mesh = {
				sources: {}
			};

			for ( var i = 0; i < xml.childNodes.length; i ++ ) {

				var child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'source':
						mesh.sources[ child.getAttribute( 'id' ) ] = parseFloats( child.getElementsByTagName( 'float_array' )[ 0 ].textContent );
						break;

					case 'vertices':
						mesh.sources[ child.getAttribute( 'id' ) ] = mesh.sources[ parseId( child.getElementsByTagName( 'input' )[ 0 ].getAttribute( 'source' ) ) ];
						break;

					case 'polylist':
					case 'triangles':
						mesh.primitive = parsePrimitive( child );
						break;

					default:
						console.log( child );

				}

			}

			return mesh;

		}

		function parsePrimitive( xml ) {

			var primitive = {
				inputs: {},
				stride: 0
			};

			for ( var i = 0; i < xml.childNodes.length; i ++ ) {

				var child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'input':
						var id = parseId( child.getAttribute( 'source' ) );
						var semantic = child.getAttribute( 'semantic' );
						var offset = parseInt( child.getAttribute( 'offset' ) );
						primitive.inputs[ semantic ] = { id: id, offset: offset };
						primitive.stride = Math.max( primitive.stride, offset + 1 );
						break;

					case 'vcount':
						primitive.vcount = parseInts( child.textContent );
						break;

					case 'p':
						primitive.p = parseInts( child.textContent );
						break;

				}

			}

			return primitive;

		}

		function createGeometry( mesh ) {

			if ( mesh.primitive === undefined ) return;

			var sources = mesh.sources;
			var primitive = mesh.primitive;

			var inputs = primitive.inputs;
			var stride = primitive.stride;
			var vcount = primitive.vcount;

			var vcount = primitive.vcount;
			var indices = primitive.p;

			var geometry = new THREE.BufferGeometry();

			for ( var name in inputs ) {

				var input = inputs[ name ];

				var source = sources[ input.id ];
				var offset = input.offset;

				var array = [];

				function pushVector( i ) {

					var index = indices[ i + offset ] * 3;
					array.push( source[ index + 0 ], source[ index + 1 ], source[ index + 2 ] );

				}

				if ( primitive.vcount !== undefined ) {

					var index = 0;

					for ( var i = 0, l = vcount.length; i < l; i ++ ) {

						var count = vcount[ i ];

						if ( count === 4 ) {

							var a = index + stride * 0;
							var b = index + stride * 1;
							var c = index + stride * 2;
							var d = index + stride * 3;

							pushVector( a );
							pushVector( b );
							pushVector( d );

							pushVector( b );
							pushVector( c );
							pushVector( d );

						} else if ( count === 3 ) {

							var a = index + stride * 0;
							var b = index + stride * 1;
							var c = index + stride * 2;

							pushVector( a );
							pushVector( b );
							pushVector( c );

						} else {

							console.log( 'ColladaLoader.createGeometry:', count, 'not supported.' );

						}

						index += stride * count;

					}

				} else {

					for ( var i = 0, l = indices.length; i < l; i += stride ) {

						pushVector( i );

					}

				}

				switch ( name )	{

					case 'VERTEX':
						geometry.addAttribute( 'position', new THREE.Float32Attribute( array, 3 ) );
						break;

					case 'NORMAL':
						geometry.addAttribute( 'normal', new THREE.Float32Attribute( array, 3 ) );
						break;

				}

			}

			return geometry;

		}

		// nodes

		function parseNodesLibrary( xml ) {

			var library = {};
			return library;

		}

		var material = new THREE.MeshPhongMaterial();
		var matrix = new THREE.Matrix4();
		var vector = new THREE.Vector3();

		function parseNode( xml ) {

			var node = {
				name: xml.getAttribute( 'name' ),
				matrix: new THREE.Matrix4(),
				children: []
			};

			for ( var i = 0; i < xml.childNodes.length; i ++ ) {

				var child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'instance_camera':
						node.camera = camerasLibrary[ parseId( child.getAttribute( 'url' ) ) ];
						break;

					case 'instance_geometry':
						node.geometry = geometriesLibrary[ parseId( child.getAttribute( 'url' ) ) ];
						break;

					case 'matrix':
						var array = parseFloats( child.textContent );
						node.matrix.multiply( matrix.fromArray( array ) );
						break;

					case 'node':
						node.children.push( parseNode( child ) );
						break;

					case 'translate':
						var array = parseFloats( child.textContent );
						vector.fromArray( array );
						node.matrix.multiply( matrix.makeTranslation( vector.x, vector.y, vector.z ) );
						break;

					case 'rotate':
						var array = parseFloats( child.textContent );
						var angle = THREE.Math.degToRad( array[ 3 ] );
						node.matrix.multiply( matrix.makeRotationAxis( vector.fromArray( array ), angle ) );
						break;

					case 'scale':
						var array = parseFloats( child.textContent );
						node.matrix.scale( vector.fromArray( array ) );
						break;

					case 'extra':
						break;

					default:
						console.log( child );
						break;

				}

			}

			var object;

			if ( node.camera !== undefined ) {

				object = node.camera;

			} else if ( node.geometry !== undefined ) {

				object = new THREE.Mesh( node.geometry, material );

			} else {

				object = new THREE.Group();

			}

			object.name = node.name;
			node.matrix.decompose( object.position, object.quaternion, object.scale );

			var children = node.children;

			for ( var i = 0, l = children.length; i < l; i ++ ) {

				object.add( node.children[ i ] );

			}

			return object;

		}

		// visual scenes

		function parseVisualScenesLibrary( xml ) {

			var library = {};

			var visualScenes = xml.getElementsByTagName( 'library_visual_scenes' )[ 0 ];
			var elements = visualScenes.getElementsByTagName( 'visual_scene' );

			for ( var i = 0; i < elements.length; i ++ ) {

				var element = elements[ i ];
				library[ element.getAttribute( 'id' ) ] = parseVisualScene( element );

			}

			return library;

		}

		function parseVisualScene( xml ) {

			var group = new THREE.Group();
			group.name = xml.getAttribute( 'name' );

			var elements = xml.getElementsByTagName( 'node' );

			for ( var i = 0; i < elements.length; i ++ ) {

				var element = elements[ i ];
				group.add( parseNode( element ) );

			}

			return group;

		}

		// scenes

		function parseScene( xml ) {

			var scene = xml.getElementsByTagName( 'scene' )[ 0 ];
			var instance = scene.getElementsByTagName( 'instance_visual_scene' )[ 0 ];
			return visualScenesLibrary[ parseId( instance.getAttribute( 'url' ) ) ];

		}

		console.time( 'ColladaLoader2' );

		var xml = new DOMParser().parseFromString( text, 'text/xml' );

		var camerasLibrary = parseCamerasLibrary( xml );
		var geometriesLibrary = parseGeometriesLibrary( xml );
		var nodesLibrary = parseNodesLibrary( xml );
		var visualScenesLibrary = parseVisualScenesLibrary( xml );
		var scene = parseScene( xml );

		console.timeEnd( 'ColladaLoader2' );

		// console.log( scene );

		return {
			animations: [],
			kinematics: { joints: [] },
			scene: scene
		};

	}

};
