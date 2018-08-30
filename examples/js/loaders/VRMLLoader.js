/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.VRMLLoader = function ( manager ) {

	this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

THREE.VRMLLoader.prototype = {

	constructor: THREE.VRMLLoader,

	// for IndexedFaceSet support
	isRecordingPoints: false,
	isRecordingFaces: false,
	points: [],
	indexes: [],

	// for Background support
	isRecordingAngles: false,
	isRecordingColors: false,
	angles: [],
	colors: [],

	recordingFieldname: null,

	crossOrigin: 'anonymous',

	load: function ( url, onLoad, onProgress, onError ) {

		var scope = this;

		var loader = new THREE.FileLoader( this.manager );
		loader.load( url, function ( text ) {

			onLoad( scope.parse( text ) );

		}, onProgress, onError );

	},

	setCrossOrigin: function ( value ) {

		this.crossOrigin = value;
		return this;

	},

	parse: function ( data ) {

		var scope = this;
		var texturePath = this.texturePath || '';

		var textureLoader = new THREE.TextureLoader( this.manager );
		textureLoader.setCrossOrigin( this.crossOrigin );

		function parseV2( lines, scene ) {

			var defines = {};
			var float_pattern = /(\b|\-|\+)([\d\.e]+)/;
			var float2_pattern = /([\d\.\+\-e]+)\s+([\d\.\+\-e]+)/g;
			var float3_pattern = /([\d\.\+\-e]+)\s+([\d\.\+\-e]+)\s+([\d\.\+\-e]+)/g;

			/**
			 * Vertically paints the faces interpolating between the
			 * specified colors at the specified angels. This is used for the Background
			 * node, but could be applied to other nodes with multiple faces as well.
			 *
			 * When used with the Background node, default is directionIsDown is true if
			 * interpolating the skyColor down from the Zenith. When interpolationg up from
			 * the Nadir i.e. interpolating the groundColor, the directionIsDown is false.
			 *
			 * The first angle is never specified, it is the Zenith (0 rad). Angles are specified
			 * in radians. The geometry is thought a sphere, but could be anything. The color interpolation
			 * is linear along the Y axis in any case.
			 *
			 * You must specify one more color than you have angles at the beginning of the colors array.
			 * This is the color of the Zenith (the top of the shape).
			 *
			 * @param geometry
			 * @param radius
			 * @param angles
			 * @param colors
			 * @param boolean topDown Whether to work top down or bottom up.
			 */
			function paintFaces( geometry, radius, angles, colors, topDown ) {

				var direction = ( topDown === true ) ? 1 : - 1;

				var coord = [], A = {}, B = {}, applyColor = false;

				for ( var k = 0; k < angles.length; k ++ ) {

					// push the vector at which the color changes

					var vec = {
						x: direction * ( Math.cos( angles[ k ] ) * radius ),
						y: direction * ( Math.sin( angles[ k ] ) * radius )
					};

					coord.push( vec );

				}

				var index = geometry.index;
				var positionAttribute = geometry.attributes.position;
				var colorAttribute = new THREE.BufferAttribute( new Float32Array( geometry.attributes.position.count * 3 ), 3 );

				var position = new THREE.Vector3();
				var color = new THREE.Color();

				for ( var i = 0; i < index.count; i ++ ) {

					var vertexIndex = index.getX( i );

					position.fromBufferAttribute( positionAttribute, vertexIndex );

					for ( var j = 0; j < colors.length; j ++ ) {

						// linear interpolation between aColor and bColor, calculate proportion
						// A is previous point (angle)

						if ( j === 0 ) {

							A.x = 0;
							A.y = ( topDown === true ) ? radius : - 1 * radius;

						} else {

							A.x = coord[ j - 1 ].x;
							A.y = coord[ j - 1 ].y;

						}

						// B is current point (angle)

						B = coord[ j ];

						if ( B !== undefined ) {

							// p has to be between the points A and B which we interpolate

							applyColor = ( topDown === true ) ? ( position.y <= A.y && position.y > B.y ) : ( position.y >= A.y && position.y < B.y );

							if ( applyColor === true ) {

								var aColor = colors[ j ];
								var bColor = colors[ j + 1 ];

								// below is simple linear interpolation

								var t = Math.abs( position.y - A.y ) / ( A.y - B.y );

								// to make it faster, you can only calculate this if the y coord changes, the color is the same for points with the same y

								color.copy( aColor ).lerp( bColor, t );

								colorAttribute.setXYZ( vertexIndex, color.r, color.g, color.b );

							} else {

								var colorIndex = ( topDown === true ) ? colors.length - 1 : 0;
								var c = colors[ colorIndex ];
								colorAttribute.setXYZ( vertexIndex, c.r, c.g, c.b );

							}

						}

					}

				}

				geometry.addAttribute( 'color', colorAttribute );

			}

			var index = [];

			function parseProperty( node, line ) {

				var parts = [], part, property = {}, fieldName;

				/**
				 * Expression for matching relevant information, such as a name or value, but not the separators
				 * @type {RegExp}
				 */
				var regex = /[^\s,\[\]]+/g;

				var point;

				while ( null !== ( part = regex.exec( line ) ) ) {

					parts.push( part[ 0 ] );

				}

				fieldName = parts[ 0 ];


				// trigger several recorders
				switch ( fieldName ) {

					case 'skyAngle':
					case 'groundAngle':
						scope.recordingFieldname = fieldName;
						scope.isRecordingAngles = true;
						scope.angles = [];
						break;

					case 'skyColor':
					case 'groundColor':
						scope.recordingFieldname = fieldName;
						scope.isRecordingColors = true;
						scope.colors = [];
						break;

					case 'point':
						scope.recordingFieldname = fieldName;
						scope.isRecordingPoints = true;
						scope.points = [];
						break;

					case 'coordIndex':
					case 'texCoordIndex':
						scope.recordingFieldname = fieldName;
						scope.isRecordingFaces = true;
						scope.indexes = [];
						break;

				}

				if ( scope.isRecordingFaces ) {

					// the parts hold the indexes as strings
					if ( parts.length > 0 ) {

						for ( var ind = 0; ind < parts.length; ind ++ ) {

							// the part should either be positive integer or -1
							if ( ! /(-?\d+)/.test( parts[ ind ] ) ) {

								continue;

							}

							// end of current face
							if ( parts[ ind ] === '-1' ) {

								if ( index.length > 0 ) {

									scope.indexes.push( index );

								}

								// start new one
								index = [];

							} else {

								index.push( parseInt( parts[ ind ] ) );

							}

						}

					}

					// end
					if ( /]/.exec( line ) ) {

						if ( index.length > 0 ) {

							scope.indexes.push( index );

						}

						// start new one
						index = [];

						scope.isRecordingFaces = false;
						node[ scope.recordingFieldname ] = scope.indexes;

					}

				} else if ( scope.isRecordingPoints ) {

					if ( node.nodeType == 'Coordinate' ) {

						while ( null !== ( parts = float3_pattern.exec( line ) ) ) {

							point = {
								x: parseFloat( parts[ 1 ] ),
								y: parseFloat( parts[ 2 ] ),
								z: parseFloat( parts[ 3 ] )
							};

							scope.points.push( point );

						}

					}

					if ( node.nodeType == 'TextureCoordinate' ) {

						while ( null !== ( parts = float2_pattern.exec( line ) ) ) {

							point = {
								x: parseFloat( parts[ 1 ] ),
								y: parseFloat( parts[ 2 ] )
							};

							scope.points.push( point );

						}

					}

					// end
					if ( /]/.exec( line ) ) {

						scope.isRecordingPoints = false;
						node.points = scope.points;

					}

				} else if ( scope.isRecordingAngles ) {

					// the parts hold the angles as strings
					if ( parts.length > 0 ) {

						for ( var ind = 0; ind < parts.length; ind ++ ) {

							// the part should be a float
							if ( ! float_pattern.test( parts[ ind ] ) ) {

								continue;

							}

							scope.angles.push( parseFloat( parts[ ind ] ) );

						}

					}

					// end
					if ( /]/.exec( line ) ) {

						scope.isRecordingAngles = false;
						node[ scope.recordingFieldname ] = scope.angles;

					}

				} else if ( scope.isRecordingColors ) {

					while ( null !== ( parts = float3_pattern.exec( line ) ) ) {

						var color = {
							r: parseFloat( parts[ 1 ] ),
							g: parseFloat( parts[ 2 ] ),
							b: parseFloat( parts[ 3 ] )
						};

						scope.colors.push( color );

					}

					// end
					if ( /]/.exec( line ) ) {

						scope.isRecordingColors = false;
						node[ scope.recordingFieldname ] = scope.colors;

					}

				} else if ( parts[ parts.length - 1 ] !== 'NULL' && fieldName !== 'children' ) {

					switch ( fieldName ) {

						case 'diffuseColor':
						case 'emissiveColor':
						case 'specularColor':
						case 'color':

							if ( parts.length !== 4 ) {

								console.warn( 'THREE.VRMLLoader: Invalid color format detected for %s.', fieldName );
								break;

							}

							property = {
								r: parseFloat( parts[ 1 ] ),
								g: parseFloat( parts[ 2 ] ),
								b: parseFloat( parts[ 3 ] )
							};

							break;

						case 'location':
						case 'direction':
						case 'translation':
						case 'scale':
						case 'size':
							if ( parts.length !== 4 ) {

								console.warn( 'THREE.VRMLLoader: Invalid vector format detected for %s.', fieldName );
								break;

							}

							property = {
								x: parseFloat( parts[ 1 ] ),
								y: parseFloat( parts[ 2 ] ),
								z: parseFloat( parts[ 3 ] )
							};

							break;

						case 'intensity':
						case 'cutOffAngle':
						case 'radius':
						case 'topRadius':
						case 'bottomRadius':
						case 'height':
						case 'transparency':
						case 'shininess':
						case 'ambientIntensity':
							if ( parts.length !== 2 ) {

								console.warn( 'THREE.VRMLLoader: Invalid single float value specification detected for %s.', fieldName );
								break;

							}

							property = parseFloat( parts[ 1 ] );

							break;

						case 'rotation':
							if ( parts.length !== 5 ) {

								console.warn( 'THREE.VRMLLoader: Invalid quaternion format detected for %s.', fieldName );
								break;

							}

							property = {
								x: parseFloat( parts[ 1 ] ),
								y: parseFloat( parts[ 2 ] ),
								z: parseFloat( parts[ 3 ] ),
								w: parseFloat( parts[ 4 ] )
							};

							break;

						case 'on':
						case 'ccw':
						case 'solid':
						case 'colorPerVertex':
						case 'convex':
							if ( parts.length !== 2 ) {

								console.warn( 'THREE.VRMLLoader: Invalid format detected for %s.', fieldName );
								break;

							}

							property = parts[ 1 ] === 'TRUE' ? true : false;

							break;

					}

					node[ fieldName ] = property;

				}

				return property;

			}

			function getTree( lines ) {

				var tree = { 'string': 'Scene', children: [] };
				var current = tree;
				var matches;
				var specification;

				for ( var i = 0; i < lines.length; i ++ ) {

					var comment = '';

					var line = lines[ i ];

					// omit whitespace only lines
					if ( null !== ( /^\s+?$/g.exec( line ) ) ) {

						continue;

					}

					line = line.trim();

					// skip empty lines
					if ( line === '' ) {

						continue;

					}

					if ( /#/.exec( line ) ) {

						var parts = line.split( '#' );

						// discard everything after the #, it is a comment
						line = parts[ 0 ];

						// well, let's also keep the comment
						comment = parts[ 1 ];

					}

					if ( matches = /([^\s]*){1}(?:\s+)?{/.exec( line ) ) {

						// first subpattern should match the Node name

						var block = { 'nodeType': matches[ 1 ], 'string': line, 'parent': current, 'children': [], 'comment': comment };
						current.children.push( block );
						current = block;

						if ( /}/.exec( line ) ) {

							// example: geometry Box { size 1 1 1 } # all on the same line
							specification = /{(.*)}/.exec( line )[ 1 ];

							// todo: remove once new parsing is complete?
							block.children.push( specification );

							parseProperty( current, specification );

							current = current.parent;

						}

					} else if ( /}/.exec( line ) ) {

						current = current.parent;

					} else if ( line !== '' ) {

						parseProperty( current, line );
						// todo: remove once new parsing is complete? we still do not parse geometry and appearance the new way
						current.children.push( line );

					}

				}

				return tree;

			}

			function parseNode( data, parent ) {

				var object;

				if ( typeof data === 'string' ) {

					if ( /USE/.exec( data ) ) {

						var defineKey = /USE\s+?([^\s]+)/.exec( data )[ 1 ];

						if ( undefined == defines[ defineKey ] ) {

							console.warn( 'THREE.VRMLLoader: %s is not defined.', defineKey );

						} else {

							if ( /appearance/.exec( data ) && defineKey ) {

								parent.material = defines[ defineKey ].clone();

							} else if ( /geometry/.exec( data ) && defineKey ) {

								parent.geometry = defines[ defineKey ].clone();

								// the solid property is not cloned with clone(), is only needed for VRML loading, so we need to transfer it
								if ( undefined !== defines[ defineKey ].solid && defines[ defineKey ].solid === false ) {

									parent.geometry.solid = false;
									parent.material.side = THREE.DoubleSide;

								}

							} else if ( defineKey ) {

								object = defines[ defineKey ].clone();
								parent.add( object );

							}

						}

					}

					return;

				}

				object = parent;

				if ( data.string.indexOf( 'AmbientLight' ) > - 1 && data.nodeType === 'PointLight' ) {

					data.nodeType = 'AmbientLight';

				}

				var l_visible = data.on !== undefined ? data.on : true;
				var l_intensity = data.intensity !== undefined ? data.intensity : 1;
				var l_color = new THREE.Color();

				if ( data.color ) {

					l_color.copy( data.color );

				}

				if ( data.nodeType === 'AmbientLight' ) {

					object = new THREE.AmbientLight( l_color, l_intensity );
					object.visible = l_visible;

					parent.add( object );

				} else if ( data.nodeType === 'PointLight' ) {

					var l_distance = 0;

					if ( data.radius !== undefined && data.radius < 1000 ) {

						l_distance = data.radius;

					}

					object = new THREE.PointLight( l_color, l_intensity, l_distance );
					object.visible = l_visible;

					parent.add( object );

				} else if ( data.nodeType === 'SpotLight' ) {

					var l_intensity = 1;
					var l_distance = 0;
					var l_angle = Math.PI / 3;
					var l_penumbra = 0;
					var l_visible = true;

					if ( data.radius !== undefined && data.radius < 1000 ) {

						l_distance = data.radius;

					}

					if ( data.cutOffAngle !== undefined ) {

						l_angle = data.cutOffAngle;

					}

					object = new THREE.SpotLight( l_color, l_intensity, l_distance, l_angle, l_penumbra );
					object.visible = l_visible;

					parent.add( object );

				} else if ( data.nodeType === 'Transform' || data.nodeType === 'Group' ) {

					object = new THREE.Object3D();

					if ( /DEF/.exec( data.string ) ) {

						object.name = /DEF\s+([^\s]+)/.exec( data.string )[ 1 ];
						defines[ object.name ] = object;

					}

					if ( data.translation !== undefined ) {

						var t = data.translation;

						object.position.set( t.x, t.y, t.z );

					}

					if ( data.rotation !== undefined ) {

						var r = data.rotation;

						object.quaternion.setFromAxisAngle( new THREE.Vector3( r.x, r.y, r.z ), r.w );

					}

					if ( data.scale !== undefined ) {

						var s = data.scale;

						object.scale.set( s.x, s.y, s.z );

					}

					parent.add( object );

				} else if ( data.nodeType === 'Shape' ) {

					object = new THREE.Mesh();

					if ( /DEF/.exec( data.string ) ) {

						object.name = /DEF\s+([^\s]+)/.exec( data.string )[ 1 ];

						defines[ object.name ] = object;

					}

					parent.add( object );

				} else if ( data.nodeType === 'Background' ) {

					var segments = 20;

					// sky (full sphere):

					var radius = 2e4;

					var skyGeometry = new THREE.SphereBufferGeometry( radius, segments, segments );
					var skyMaterial = new THREE.MeshBasicMaterial( { fog: false, side: THREE.BackSide } );

					if ( data.skyColor.length > 1 ) {

						paintFaces( skyGeometry, radius, data.skyAngle, data.skyColor, true );

						skyMaterial.vertexColors = THREE.VertexColors;

					} else {

						var color = data.skyColor[ 0 ];
						skyMaterial.color.setRGB( color.r, color.b, color.g );

					}

					scene.add( new THREE.Mesh( skyGeometry, skyMaterial ) );

					// ground (half sphere):

					if ( data.groundColor !== undefined ) {

						radius = 1.2e4;

						var groundGeometry = new THREE.SphereBufferGeometry( radius, segments, segments, 0, 2 * Math.PI, 0.5 * Math.PI, 1.5 * Math.PI );
						var groundMaterial = new THREE.MeshBasicMaterial( { fog: false, side: THREE.BackSide, vertexColors: THREE.VertexColors } );

						paintFaces( groundGeometry, radius, data.groundAngle, data.groundColor, false );

						scene.add( new THREE.Mesh( groundGeometry, groundMaterial ) );

					}

				} else if ( /geometry/.exec( data.string ) ) {

					if ( data.nodeType === 'Box' ) {

						var s = data.size;

						parent.geometry = new THREE.BoxBufferGeometry( s.x, s.y, s.z );

					} else if ( data.nodeType === 'Cylinder' ) {

						parent.geometry = new THREE.CylinderBufferGeometry( data.radius, data.radius, data.height );

					} else if ( data.nodeType === 'Cone' ) {

						parent.geometry = new THREE.CylinderBufferGeometry( data.topRadius, data.bottomRadius, data.height );

					} else if ( data.nodeType === 'Sphere' ) {

						parent.geometry = new THREE.SphereBufferGeometry( data.radius );

					} else if ( data.nodeType === 'IndexedFaceSet' ) {

						var geometry = new THREE.BufferGeometry();

						var positions = [];
						var uvs = [];

						var position, uv;

						var i, il, j, jl;

						for ( i = 0, il = data.children.length; i < il; i ++ ) {

							var child = data.children[ i ];

							// uvs

							if ( child.nodeType === 'TextureCoordinate' ) {

								if ( child.points ) {

									for ( j = 0, jl = child.points.length; j < jl; j ++ ) {

										uv = child.points[ j ];
										uvs.push( uv.x, uv.y );

									}

								}

							}

							// positions

							if ( child.nodeType === 'Coordinate' ) {

								if ( child.points ) {

									for ( j = 0, jl = child.points.length; j < jl; j ++ ) {

										position = child.points[ j ];
										positions.push( position.x, position.y, position.z );

									}

								}

								if ( child.string.indexOf( 'DEF' ) > - 1 ) {

									var name = /DEF\s+([^\s]+)/.exec( child.string )[ 1 ];

									defines[ name ] = positions.slice( 0 );

								}

								if ( child.string.indexOf( 'USE' ) > - 1 ) {

									var defineKey = /USE\s+([^\s]+)/.exec( child.string )[ 1 ];

									positions = defines[ defineKey ];

								}

							}

						}

						var skip = 0;

						// some shapes only have vertices for use in other shapes

						if ( data.coordIndex ) {

							var newPositions = [];
							var newUvs = [];

							position = new THREE.Vector3();
							uv = new THREE.Vector2();

							for ( i = 0, il = data.coordIndex.length; i < il; i ++ ) {

								var indexes = data.coordIndex[ i ];

								// VRML support multipoint indexed face sets (more then 3 vertices). You must calculate the composing triangles here

								skip = 0;

								while ( indexes.length >= 3 && skip < ( indexes.length - 2 ) ) {

									if ( data.ccw === undefined ) data.ccw = true; // ccw is true by default

									var i1 = indexes[ 0 ];
									var i2 = indexes[ skip + ( data.ccw ? 1 : 2 ) ];
									var i3 = indexes[ skip + ( data.ccw ? 2 : 1 ) ];

									// create non indexed geometry, necessary for face normal generation

									position.fromArray( positions, i1 * 3 );
									uv.fromArray( uvs, i1 * 2 );
									newPositions.push( position.x, position.y, position.z );
									newUvs.push( uv.x, uv.y );

									position.fromArray( positions, i2 * 3 );
									uv.fromArray( uvs, i2 * 2 );
									newPositions.push( position.x, position.y, position.z );
									newUvs.push( uv.x, uv.y );

									position.fromArray( positions, i3 * 3 );
									uv.fromArray( uvs, i3 * 2 );
									newPositions.push( position.x, position.y, position.z );
									newUvs.push( uv.x, uv.y );

									skip ++;

								}

							}

							positions = newPositions;
							uvs = newUvs;

						} else {

							// do not add dummy mesh to the scene

							parent.parent.remove( parent );

						}

						if ( false === data.solid ) {

							parent.material.side = THREE.DoubleSide;

						}

						// we need to store it on the geometry for use with defines
						geometry.solid = data.solid;

						geometry.addAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );

						if ( uvs.length > 0 ) {

							geometry.addAttribute( 'uv', new THREE.Float32BufferAttribute( uvs, 2 ) );

						}

						geometry.computeVertexNormals();
						geometry.computeBoundingSphere();

						// see if it's a define
						if ( /DEF/.exec( data.string ) ) {

							geometry.name = /DEF ([^\s]+)/.exec( data.string )[ 1 ];
							defines[ geometry.name ] = geometry;

						}

						parent.geometry = geometry;

					}

					return;

				} else if ( /appearance/.exec( data.string ) ) {

					for ( var i = 0; i < data.children.length; i ++ ) {

						var child = data.children[ i ];

						if ( child.nodeType === 'Material' ) {

							var material = new THREE.MeshPhongMaterial();

							if ( child.diffuseColor !== undefined ) {

								var d = child.diffuseColor;

								material.color.setRGB( d.r, d.g, d.b );

							}

							if ( child.emissiveColor !== undefined ) {

								var e = child.emissiveColor;

								material.emissive.setRGB( e.r, e.g, e.b );

							}

							if ( child.specularColor !== undefined ) {

								var s = child.specularColor;

								material.specular.setRGB( s.r, s.g, s.b );

							}

							if ( child.transparency !== undefined ) {

								var t = child.transparency;

								// transparency is opposite of opacity
								material.opacity = Math.abs( 1 - t );

								material.transparent = true;

							}

							if ( /DEF/.exec( data.string ) ) {

								material.name = /DEF ([^\s]+)/.exec( data.string )[ 1 ];

								defines[ material.name ] = material;

							}

							parent.material = material;

						}

						if ( child.nodeType === 'ImageTexture' ) {

							var textureName = /"([^"]+)"/.exec( child.children[ 0 ] );

							if ( textureName ) {

								parent.material.name = textureName[ 1 ];

								parent.material.map = textureLoader.load( texturePath + textureName[ 1 ] );

							}

						}

					}

					return;

				}

				for ( var i = 0, l = data.children.length; i < l; i ++ ) {

					parseNode( data.children[ i ], object );

				}

			}

			parseNode( getTree( lines ), scene );

		}

		var scene = new THREE.Scene();

		var lines = data.split( '\n' );

		// some lines do not have breaks

		for ( var i = lines.length - 1; i > - 1; i -- ) {

			var line = lines[ i ];

			// split lines with {..{ or {..[ - some have both
			if ( /{.*[{\[]/.test( line ) ) {

				var parts = line.split( '{' ).join( '{\n' ).split( '\n' );
				parts.unshift( 1 );
				parts.unshift( i );
				lines.splice.apply( lines, parts );

			} else if ( /\].*}/.test( line ) ) {

				// split lines with ]..}
				var parts = line.split( ']' ).join( ']\n' ).split( '\n' );
				parts.unshift( 1 );
				parts.unshift( i );
				lines.splice.apply( lines, parts );

			}

			if ( /}.*}/.test( line ) ) {

				// split lines with }..}
				var parts = line.split( '}' ).join( '}\n' ).split( '\n' );
				parts.unshift( 1 );
				parts.unshift( i );
				lines.splice.apply( lines, parts );

			}

			if ( /^\b[^\s]+\b$/.test( line.trim() ) ) {

				// prevent lines with single words like "coord" or "geometry", see #12209
				lines[ i + 1 ] = line + ' ' + lines[ i + 1 ].trim();
				lines.splice( i, 1 );

			} else if ( ( line.indexOf( 'coord' ) > - 1 ) && ( line.indexOf( '[' ) < 0 ) && ( line.indexOf( '{' ) < 0 ) ) {

				// force the parser to create Coordinate node for empty coords
				// coord USE something -> coord USE something Coordinate {}

				lines[ i ] += ' Coordinate {}';

			}

		}

		var header = lines.shift();

		if ( /V1.0/.exec( header ) ) {

			console.warn( 'THREE.VRMLLoader: V1.0 not supported yet.' );

		} else if ( /V2.0/.exec( header ) ) {

			parseV2( lines, scene );

		}

		return scene;

	}

};
