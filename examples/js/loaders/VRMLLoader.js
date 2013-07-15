/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.VRMLLoader = function () {};

THREE.VRMLLoader.prototype = {

	constructor: THREE.VTKLoader,

	load: function ( url, callback ) {

		var scope = this;
		var request = new XMLHttpRequest();

		request.addEventListener( 'load', function ( event ) {

			var object = scope.parse( event.target.responseText );

			scope.dispatchEvent( { type: 'load', content: object } );

			if ( callback ) callback( geometry );

		}, false );

		request.addEventListener( 'progress', function ( event ) {

			scope.dispatchEvent( { type: 'progress', loaded: event.loaded, total: event.total } );

		}, false );

		request.addEventListener( 'error', function () {

			scope.dispatchEvent( { type: 'error', message: 'Couldn\'t load URL [' + url + ']' } );

		}, false );

		request.open( 'GET', url, true );
		request.send( null );

	},

	parse: function ( data ) {

		var parseV1 = function ( lines, scene ) {

			console.warn( 'VRML V1.0 not supported yet' );

		};

		var parseV2 = function ( lines, scene ) {

			var getTree = function ( lines ) {

				var tree = { 'string': 'Scene', children: [] };
				var current = tree;

				for ( var i = 0; i < lines.length; i ++ ) {

					var line = lines[ i ];

					if ( /^#/.exec( line ) ) {

						continue;

					} else if ( /{/.exec( line ) ) {

						var block = { 'string': line, 'parent': current, 'children': [] };
						current.children.push( block );
						current = block;

						if ( /}/.exec( line ) ) {

							block.children.push( /{(.*)}/.exec( line )[ 1 ] );
							current = current.parent;

						}

					} else if ( /}/.exec( line ) ) {

						current = current.parent;

					} else if ( line !== '' ) {

						current.children.push( line );

					}

				}

				return tree;

			}

			var defines = {};
			var float_pattern = /( +[\d|\.|\+|\-|e]+)/;
			var float3_pattern = /( +[\d|\.|\+|\-|e]+),?( +[\d|\.|\+|\-|e]+),?( +[\d|\.|\+|\-|e]+)/;
			var float4_pattern = /( +[\d|\.|\+|\-|e]+),?( +[\d|\.|\+|\-|e]+),?( +[\d|\.|\+|\-|e]+),?( +[\d|\.|\+|\-|e]+)/;

			var parseNode = function ( data, parent ) {

				// console.log( data );

				if ( typeof data === 'string' ) {

					if ( /USE/.exec( data ) ) {

						if ( /appearance/.exec( data ) ) {

							parent.material = defines[ /USE (\w+)/.exec( data )[ 1 ] ].clone();

						} else {

							var object = defines[ /USE (\w+)/.exec( data )[ 1 ] ].clone();
							parent.add( object );

						}

					}

					return;

				}

				var object = parent;

				if ( /Transform/.exec( data.string ) || /Group/.exec( data.string ) ) {

					object = new THREE.Object3D();

					if ( /DEF/.exec( data.string ) ) {

						object.name = /DEF (\w+)/.exec( data.string )[ 1 ];
						defines[ object.name ] = object;

					}

					for ( var i = 0, j = data.children.length; i < j; i ++ ) {

						var child = data.children[ i ];

						if ( /translation/.exec( child ) ) {

							var result = float3_pattern.exec( child );

							object.position.set(
								parseFloat( result[ 1 ] ),
								parseFloat( result[ 2 ] ),
								parseFloat( result[ 3 ] )
							);

						} else if ( /rotation/.exec( child ) ) {

							var result = float4_pattern.exec( child );

							object.rotation.set(
								parseFloat( result[ 1 ] ),
								parseFloat( result[ 2 ] ),
								parseFloat( result[ 3 ] )
							).multiplyScalar( result[ 4 ] );

						} else if ( /scale/.exec( child ) ) {

							var result = float3_pattern.exec( child );

							object.scale.set(
								parseFloat( result[ 1 ] ),
								parseFloat( result[ 2 ] ),
								parseFloat( result[ 3 ] )
							);

						}

					}

					parent.add( object );

				} else if ( /Shape/.exec( data.string ) ) {

					object = new THREE.Mesh();

					if ( /DEF/.exec( data.string ) ) {

						object.name = /DEF (\w+)/.exec( data.string )[ 1 ];
						defines[ object.name ] = object;

					}

					parent.add( object );

				} else if ( /geometry/.exec( data.string ) ) {

					if ( /Box/.exec( data.string ) ) {

						var width = 1, height = 1, depth = 1;

						for ( var i = 0, j = data.children.length; i < j; i ++ ) {

							var child = data.children[ i ];

							if ( /size/.exec( child ) ) {

								var result = float3_pattern.exec( child );

								width = parseFloat( result[ 1 ] );
								height = parseFloat( result[ 2 ] );
								depth = parseFloat( result[ 3 ] );

							}

						}

						parent.geometry = new THREE.CubeGeometry( width, height, depth );

					} else if ( /Cylinder/.exec( data.string ) ) {

						var radius = 1, height = 1;

						for ( var i = 0, j = data.children.length; i < j; i ++ ) {

							var child = data.children[ i ];

							if ( /radius/.exec( child ) ) {

								radius = parseFloat( float_pattern.exec( child )[ 1 ] );

							} else if ( /height/.exec( child ) ) {

								height = parseFloat( float_pattern.exec( child )[ 1 ] );

							}

						}

						parent.geometry = new THREE.CylinderGeometry( radius, radius, height );

					} else if ( /Cone/.exec( data.string ) ) {

						var topRadius = 0, bottomRadius = 1, height = 1;

						for ( var i = 0, j = data.children.length; i < j; i ++ ) {

							var child = data.children[ i ];

							if ( /bottomRadius/.exec( child ) ) {

								bottomRadius = parseFloat( float_pattern.exec( child )[ 1 ] );

							} else if ( /height/.exec( child ) ) {

								height = parseFloat( float_pattern.exec( child )[ 1 ] );

							}

						}

						parent.geometry = new THREE.CylinderGeometry( topRadius, bottomRadius, height );

					} else if ( /Sphere/.exec( data.string ) ) {

						var result = /radius( +[\d|\.|\+|\-|e]+)/.exec( data.children[ 0 ] );

						parent.geometry = new THREE.SphereGeometry( parseFloat( result[ 1 ] ) );

					}

					return;

				} else if ( /appearance/.exec( data.string ) ) {

					for ( var i = 0; i < data.children.length; i ++ ) {

						var child = data.children[ i ];

						if ( /Material/.exec( child.string ) ) {

							var material = new THREE.MeshPhongMaterial();

							for ( var j = 0; j < child.children.length; j ++ ) {

								var parameter = child.children[ j ];

								if ( /diffuseColor/.exec( parameter ) ) {

									var result = float3_pattern.exec( parameter );

									material.color.setRGB(
										parseFloat( result[ 1 ] ),
										parseFloat( result[ 2 ] ),
										parseFloat( result[ 3 ] )
									);

								} else if ( /emissiveColor/.exec( parameter ) ) {

									var result = float3_pattern.exec( parameter );

									material.emissive.setRGB(
										parseFloat( result[ 1 ] ),
										parseFloat( result[ 2 ] ),
										parseFloat( result[ 3 ] )
									);

								} else if ( /specularColor/.exec( parameter ) ) {

									var result = float3_pattern.exec( parameter );

									material.specular.setRGB(
										parseFloat( result[ 1 ] ),
										parseFloat( result[ 2 ] ),
										parseFloat( result[ 3 ] )
									);

								} else if ( /transparency/.exec( parameter ) ) {

									var result = /( +[\d|\.|\+|\-|e]+)/.exec( parameter );

									material.opacity = parseFloat( result[ 1 ] );
									material.transparent = true;

								}

							}

							if ( /DEF/.exec( data.string ) ) {

								material.name = /DEF (\w+)/.exec( data.string )[ 1 ];
								defines[ material.name ] = material;

							}

							parent.material = material;

						}

					}

					return;

				}

				for ( var i = 0, l = data.children.length; i < l; i ++ ) {

					var child = data.children[ i ];

					parseNode( data.children[ i ], object );

				}

			}

			parseNode( getTree( lines ), scene );

		};

		var scene = new THREE.Scene();

		var lines = data.split( '\n' );
		var header = lines.shift();

		if ( /V1.0/.exec( header ) ) {

			parseV1( lines, scene );

		} else if ( /V2.0/.exec( header ) ) {

			parseV2( lines, scene );

		}

		return scene;

	}

};

THREE.EventDispatcher.prototype.apply( THREE.VRMLLoader.prototype );
