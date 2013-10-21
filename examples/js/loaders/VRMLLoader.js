/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.VRMLLoader = function () {};

THREE.VRMLLoader.prototype = {

	constructor: THREE.VRMLLoader,

	load: function ( url, callback ) {

		var scope = this;
		var request = new XMLHttpRequest();

		request.addEventListener( 'load', function ( event ) {

			var object = scope.parse( event.target.responseText );

			scope.dispatchEvent( { type: 'load', content: object } );

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
                var matches;

				for ( var i = 0; i < lines.length; i ++ ) {

                    var comment = '';

					var line = lines[ i ];

                    // omit whitespace only lines
                    if ( null !== ( result = /^\s+?$/g.exec( line ) ) ) {
                        continue;
                    }

					if ( /#/.exec( line ) ) {

                        var parts = line.split('#');

                        // discard everything after the #, it is a comment
                        line = parts[0];

                        // well, let's also keep the comment
                        comment = parts[1];
					}
                    // todo: add collection like coordIndex and colorIndex who are delimited by [ ]
                    if ( matches = /([^\s]*){1}\s?{/.exec( line ) ) { // first subpattern should match the Node name

						var block = { 'nodeType' : matches[1], 'string': line, 'parent': current, 'children': [],'comment' : comment };
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
			var float_pattern = /\s+([\d|\.|\+|\-|e]+)/;
			var float3_pattern = /\s+([\d|\.|\+|\-|e]+),?\s+([\d|\.|\+|\-|e]+),?\s+([\d|\.|\+|\-|e]+)/;
			var float4_pattern = /\s+([\d|\.|\+|\-|e]+),?\s+([\d|\.|\+|\-|e]+),?\s+([\d|\.|\+|\-|e]+),?\s+([\d|\.|\+|\-|e]+)/;

			var parseNode = function ( data, parent ) {

				// console.log( data );

				if ( typeof data === 'string' ) {

					if ( /USE/.exec( data ) ) {

                        var defineKey = /USE\s+?(\w+)/.exec( data )[ 1 ];

                        if (undefined == defines[defineKey]) {
                            debugger;
                            console.warn(defineKey + ' is not defined.');

                        } else {

                            if ( /appearance/.exec( data ) && defineKey ) {

                                parent.material = defines[ defineKey].clone();

                            } else if ( /geometry/.exec( data ) && defineKey ) {

                                parent.geometry = defines[ defineKey].clone();

                            } else if (defineKey){
                                var object = defines[ defineKey ].clone();
                                parent.add( object );

                            }

                        }

					}

					return;

				}

				var object = parent;

				if ( /Transform/.exec( data.string ) || /Group/.exec( data.string ) ) {
					object = new THREE.Object3D();

					if ( /DEF/.exec( data.string ) ) {

						object.name = /DEF\s+(\w+)/.exec( data.string )[ 1 ];
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

                            var quaternion = new THREE.Quaternion();

                            var x =  parseFloat( result[ 1 ] );
                            var y = parseFloat(result[ 2 ]);
                            var z = parseFloat(result[ 3 ]);
                            var w = parseFloat(result[ 4 ]);

                            object.quaternion.setFromAxisAngle( new THREE.Vector3( x, y, z), w );
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

						var result = /radius\s+([\d|\.|\+|\-|e]+)/.exec( data.children[ 0 ] );

						parent.geometry = new THREE.SphereGeometry( parseFloat( result[ 1 ] ) );

					} else if ( /IndexedFaceSet/.exec( data.string ) ) {

                        var geometry = new THREE.Geometry();

                        var isRecordingCoordinates = false;

                        for (var i = 0, j = data.children.length; i < j; i++) {

                            var child = data.children[i];

                            var result;
                            var vec;

                            if ( /Coordinate/.exec (child.string)) {

                                for (var k = 0, l = child.children.length; k < l; k++) {

                                    var point = child.children[k];

                                    if (null != (result = float3_pattern.exec(point))) {

                                        vec = new THREE.Vector3(
                                            parseFloat(result[1]),
                                            parseFloat(result[2]),
                                            parseFloat(result[3])
                                        );

                                        geometry.vertices.push( vec );
                                    }
                                }
                            }

                            if (/coordIndex/.exec(child)) {
                                isRecordingCoordinates = true;
                            }

                            var coordIndex = false;
                            var points =  [];
                            var skip = 0;
                            var regex = /(-?\d+)/g;
                            // read this: http://math.hws.edu/eck/cs424/notes2013/16_Threejs_Advanced.html
                            while ( isRecordingCoordinates && null != (coordIndex = regex.exec(child) ) ) {
                                // parse coordIndex lines
                                coordIndex = parseInt(coordIndex, 10);

                                points.push(coordIndex);

                                // -1 indicates end of face points
                                if (coordIndex === -1) {
                                    // reset the collection
                                    points = [];
                                }

                                // vrml support multipoint indexed face sets (more then 3 vertices). You must calculate the composing triangles here

                                skip = points.length -3;
                                skip = skip < 0 ? 0 : skip;

                                // Face3 only works with triangles, but IndexedFaceSet allows shapes with more then three vertices, build them of triangles
                                if (points.length >= 3) {
                                    var face = new THREE.Face3(
                                        points[0],
                                        points[skip + 1],
                                        points[skip + 2],
                                        null // normal, will be added later
                                        // todo: pass in the color
                                    );

                                    geometry.faces.push(face);

                                    }

                            }

                            // stop recording if a ] is encountered after recording was turned on
                            isRecordingCoordinates = (isRecordingCoordinates && null === (/]/.exec(child) ) );

                        }

                        geometry.computeFaceNormals();
                        //geometry.computeVertexNormals(); // does not show
                        geometry.computeBoundingSphere();

                        // see if it's a define
                        if ( /DEF/.exec( data.string ) ) {
                            geometry.name = /DEF (\w+)/.exec( data.string )[ 1 ];
                            defines[ geometry.name ] = geometry;
                        }

                        parent.geometry = geometry;
					}

					return;

				} else if ( /appearance/.exec( data.string ) ) {

					for ( var i = 0; i < data.children.length; i ++ ) {

						var child = data.children[ i ];

						if ( /Material/.exec( child.string ) ) {

							var material = new THREE.MeshPhongMaterial();
                            material.side = THREE.DoubleSide;

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

									var result = /\s+([\d|\.|\+|\-|e]+)/.exec( parameter );
                                    // transparency is opposite of opacity
									material.opacity = Math.abs( 1 - parseFloat( result[ 1 ] ) );
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
