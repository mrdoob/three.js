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
	indexes : [],

	// for Background support
	isRecordingAngles: false,
	isRecordingColors: false,
	angles: [],
	colors: [],

	recordingFieldname: null,

	load: function ( url, onLoad, onProgress, onError ) {

		var scope = this;

		var loader = new THREE.XHRLoader( this.manager );
		loader.load( url, function ( text ) {

			onLoad( scope.parse( text ) );

		}, onProgress, onError );

	},

	setCrossOrigin: function ( value ) {

		this.crossOrigin = value;

	},

	parse: function ( data ) {

		var texturePath = this.texturePath || '';

		var textureLoader = new THREE.TextureLoader( this.manager );
		textureLoader.setCrossOrigin( this.crossOrigin );

		var parseV1 = function ( lines, scene ) {

			console.warn( 'VRML V1.0 not supported yet' );

		};

		var parseV2 = function ( lines, scene ) {

			var defines = {};
			var float_pattern = /(\b|\-|\+)([\d\.e]+)/;
			var float2_pattern = /([\d\.\+\-e]+)\s+([\d\.\+\-e]+)/g;
			var float3_pattern = /([\d\.\+\-e]+)\s+([\d\.\+\-e]+)\s+([\d\.\+\-e]+)/g;

			/**
			* Interpolates colors a and b following their relative distance
			* expressed by t.
			*
			* @param float a
			* @param float b
			* @param float t
			* @returns {Color}
			*/
			var interpolateColors = function( a, b, t ) {

				var deltaR = a.r - b.r;
				var deltaG = a.g - b.g;
				var deltaB = a.b - b.b;

				var c = new THREE.Color();

				c.r = a.r - t * deltaR;
				c.g = a.g - t * deltaG;
				c.b = a.b - t * deltaB;

				return c;

			};

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
			 * @param boolean directionIsDown Whether to work bottom up or top down.
			 */
			var paintFaces = function ( geometry, radius, angles, colors, directionIsDown ) {

				var f, n, p, vertexIndex, color;

				var direction = directionIsDown ? 1 : - 1;

				var faceIndices = [ 'a', 'b', 'c', 'd' ];

				var coord = [ ], aColor, bColor, t = 1, A = {}, B = {}, applyColor = false, colorIndex;

				for ( var k = 0; k < angles.length; k ++ ) {

					var vec = { };

					// push the vector at which the color changes
					vec.y = direction * ( Math.cos( angles[ k ] ) * radius );

					vec.x = direction * ( Math.sin( angles[ k ] ) * radius );

					coord.push( vec );

				}

				// painting the colors on the faces
				for ( var i = 0; i < geometry.faces.length ; i ++ ) {

					f  = geometry.faces[ i ];

					n = ( f instanceof THREE.Face3 ) ? 3 : 4;

					for ( var j = 0; j < n; j ++ ) {

						vertexIndex = f[ faceIndices[ j ] ];

						p = geometry.vertices[ vertexIndex ];

						for ( var index = 0; index < colors.length; index ++ ) {

							// linear interpolation between aColor and bColor, calculate proportion
							// A is previous point (angle)
							if ( index === 0 ) {

								A.x = 0;
								A.y = directionIsDown ? radius : - 1 * radius;

							} else {

								A.x = coord[ index - 1 ].x;
								A.y = coord[ index - 1 ].y;

							}

							// B is current point (angle)
							B = coord[ index ];

							if ( undefined !== B ) {

								// p has to be between the points A and B which we interpolate
								applyColor = directionIsDown ? p.y <= A.y && p.y > B.y : p.y >= A.y && p.y < B.y;

								if ( applyColor ) {

									bColor = colors[ index + 1 ];

									aColor = colors[ index ];

									// below is simple linear interpolation
									t = Math.abs( p.y - A.y ) / ( A.y - B.y );

									// to make it faster, you can only calculate this if the y coord changes, the color is the same for points with the same y
									color = interpolateColors( aColor, bColor, t );

									f.vertexColors[ j ] = color;

								}

							} else if ( undefined === f.vertexColors[ j ] ) {

								colorIndex = directionIsDown ? colors.length - 1 : 0;
								f.vertexColors[ j ] = colors[ colorIndex ];

							}

						}

					}

				}

			};

			var index = [];

			var parseProperty = function ( node, line ) {

				var parts = [], part, property = {}, fieldName;

				/**
				 * Expression for matching relevant information, such as a name or value, but not the separators
				 * @type {RegExp}
				 */
				var regex = /[^\s,\[\]]+/g;

				var point, angles, colors;

				while ( null != ( part = regex.exec( line ) ) ) {

					parts.push( part[ 0 ] );

				}

				fieldName = parts[ 0 ];


				// trigger several recorders
				switch ( fieldName ) {
					case 'skyAngle':
					case 'groundAngle':
						this.recordingFieldname = fieldName;
						this.isRecordingAngles = true;
						this.angles = [];
						break;
					case 'skyColor':
					case 'groundColor':
						this.recordingFieldname = fieldName;
						this.isRecordingColors = true;
						this.colors = [];
						break;
					case 'point':
						this.recordingFieldname = fieldName;
						this.isRecordingPoints = true;
						this.points = [];
						break;
					case 'coordIndex':
					case 'texCoordIndex':
						this.recordingFieldname = fieldName;
						this.isRecordingFaces = true;
						this.indexes = [];
				}

				if ( this.isRecordingFaces ) {

					// the parts hold the indexes as strings
					if ( parts.length > 0 ) {

						for ( var ind = 0; ind < parts.length; ind ++ ) {

							// the part should either be positive integer or -1
							if ( ! /(-?\d+)/.test( parts[ ind ] ) ) {

								continue;

							}

							// end of current face
							if ( parts[ ind ] === "-1" ) {

								if ( index.length > 0 ) {

									this.indexes.push( index );

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

							this.indexes.push( index );

						}

						// start new one
						index = [];

						this.isRecordingFaces = false;
						node[this.recordingFieldname] = this.indexes;

					}

				} else if ( this.isRecordingPoints ) {

					if ( node.nodeType == 'Coordinate' )

					while ( null !== ( parts = float3_pattern.exec( line ) ) ) {

						point = {
							x: parseFloat( parts[ 1 ] ),
							y: parseFloat( parts[ 2 ] ),
							z: parseFloat( parts[ 3 ] )
						};

						this.points.push( point );

					}

					if ( node.nodeType == 'TextureCoordinate' )

					while ( null !== ( parts = float2_pattern.exec( line ) ) ) {

						point = {
							x: parseFloat( parts[ 1 ] ),
							y: parseFloat( parts[ 2 ] )
						};

						this.points.push( point );

					}

					// end
					if ( /]/.exec( line ) ) {

						this.isRecordingPoints = false;
						node.points = this.points;

					}

				} else if ( this.isRecordingAngles ) {

					// the parts hold the angles as strings
					if ( parts.length > 0 ) {

						for ( var ind = 0; ind < parts.length; ind ++ ) {

							// the part should be a float
							if ( ! float_pattern.test( parts[ ind ] ) ) {

								continue;

							}

							this.angles.push( parseFloat( parts[ ind ] ) );

						}

					}

					// end
					if ( /]/.exec( line ) ) {

						this.isRecordingAngles = false;
						node[ this.recordingFieldname ] = this.angles;

					}

				} else if ( this.isRecordingColors ) {

					while ( null !== ( parts = float3_pattern.exec( line ) ) ) {

						color = {
							r: parseFloat( parts[ 1 ] ),
							g: parseFloat( parts[ 2 ] ),
							b: parseFloat( parts[ 3 ] )
						};

						this.colors.push( color );

					}

					// end
					if ( /]/.exec( line ) ) {

						this.isRecordingColors = false;
						node[ this.recordingFieldname ] = this.colors;

					}

				} else if ( parts[ parts.length - 1 ] !== 'NULL' && fieldName !== 'children' ) {

					switch ( fieldName ) {

						case 'diffuseColor':
						case 'emissiveColor':
						case 'specularColor':
						case 'color':

							if ( parts.length != 4 ) {

								console.warn( 'Invalid color format detected for ' + fieldName );
								break;

							}

							property = {
								r: parseFloat( parts[ 1 ] ),
								g: parseFloat( parts[ 2 ] ),
								b: parseFloat( parts[ 3 ] )
							};

							break;

						case 'translation':
						case 'scale':
						case 'size':
							if ( parts.length != 4 ) {

								console.warn( 'Invalid vector format detected for ' + fieldName );
								break;

							}

							property = {
								x: parseFloat( parts[ 1 ] ),
								y: parseFloat( parts[ 2 ] ),
								z: parseFloat( parts[ 3 ] )
							};

							break;

						case 'radius':
						case 'topRadius':
						case 'bottomRadius':
						case 'height':
						case 'transparency':
						case 'shininess':
						case 'ambientIntensity':
							if ( parts.length != 2 ) {

								console.warn( 'Invalid single float value specification detected for ' + fieldName );
								break;

							}

							property = parseFloat( parts[ 1 ] );

							break;

						case 'rotation':
							if ( parts.length != 5 ) {

								console.warn( 'Invalid quaternion format detected for ' + fieldName );
								break;

							}

							property = {
								x: parseFloat( parts[ 1 ] ),
								y: parseFloat( parts[ 2 ] ),
								z: parseFloat( parts[ 3 ] ),
								w: parseFloat( parts[ 4 ] )
							};

							break;

						case 'ccw':
						case 'solid':
						case 'colorPerVertex':
						case 'convex':
							if ( parts.length != 2 ) {

								console.warn( 'Invalid format detected for ' + fieldName );
								break;

							}

							property = parts[ 1 ] === 'TRUE' ? true : false;

							break;
					}

					node[ fieldName ] = property;

				}

				return property;

			};

			var getTree = function ( lines ) {

				var tree = { 'string': 'Scene', children: [] };
				var current = tree;
				var matches;
				var specification;

				for ( var i = 0; i < lines.length; i ++ ) {

					var comment = '';

					var line = lines[ i ];

					// omit whitespace only lines
					if ( null !== ( result = /^\s+?$/g.exec( line ) ) ) {

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

						var block = { 'nodeType' : matches[ 1 ], 'string': line, 'parent': current, 'children': [], 'comment' : comment };
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

			};

			var parseNode = function ( data, parent ) {

				// console.log( data );

				if ( typeof data === 'string' ) {

					if ( /USE/.exec( data ) ) {

						var defineKey = /USE\s+?([^\s]+)/.exec( data )[ 1 ];

						if ( undefined == defines[ defineKey ] ) {

							console.warn( defineKey + ' is not defined.' );

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

								var object = defines[ defineKey ].clone();
								parent.add( object );

							}

						}

					}

					return;

				}

				var object = parent;

				if ( 'Transform' === data.nodeType || 'Group' === data.nodeType ) {

					object = new THREE.Object3D();

					if ( /DEF/.exec( data.string ) ) {

						object.name = /DEF\s+([^\s]+)/.exec( data.string )[ 1 ];
						defines[ object.name ] = object;

					}

					if ( undefined !== data[ 'translation' ] ) {

						var t = data.translation;

						object.position.set( t.x, t.y, t.z );

					}

					if ( undefined !== data.rotation ) {

						var r = data.rotation;

						object.quaternion.setFromAxisAngle( new THREE.Vector3( r.x, r.y, r.z ), r.w );

					}

					if ( undefined !== data.scale ) {

						var s = data.scale;

						object.scale.set( s.x, s.y, s.z );

					}

					parent.add( object );

				} else if ( 'Shape' === data.nodeType ) {

					object = new THREE.Mesh();

					if ( /DEF/.exec( data.string ) ) {

						object.name = /DEF\s+([^\s]+)/.exec( data.string )[ 1 ];

						defines[ object.name ] = object;

					}

					parent.add( object );

				} else if ( 'Background' === data.nodeType ) {

					var segments = 20;

					// sky (full sphere):

					var radius = 2e4;

					var skyGeometry = new THREE.SphereGeometry( radius, segments, segments );
					var skyMaterial = new THREE.MeshBasicMaterial( { fog: false, side: THREE.BackSide } );

					if ( data.skyColor.length > 1 ) {

						paintFaces( skyGeometry, radius, data.skyAngle, data.skyColor, true );

						skyMaterial.vertexColors = THREE.VertexColors

					} else {

						var color = data.skyColor[ 0 ];
						skyMaterial.color.setRGB( color.r, color.b, color.g );

					}

					scene.add( new THREE.Mesh( skyGeometry, skyMaterial ) );

					// ground (half sphere):

					if ( data.groundColor !== undefined ) {

						radius = 1.2e4;

						var groundGeometry = new THREE.SphereGeometry( radius, segments, segments, 0, 2 * Math.PI, 0.5 * Math.PI, 1.5 * Math.PI );
						var groundMaterial = new THREE.MeshBasicMaterial( { fog: false, side: THREE.BackSide, vertexColors: THREE.VertexColors } );

						paintFaces( groundGeometry, radius, data.groundAngle, data.groundColor, false );

						scene.add( new THREE.Mesh( groundGeometry, groundMaterial ) );

					}

				} else if ( /geometry/.exec( data.string ) ) {

					if ( 'Box' === data.nodeType ) {

						var s = data.size;

						parent.geometry = new THREE.BoxGeometry( s.x, s.y, s.z );

					} else if ( 'Cylinder' === data.nodeType ) {

						parent.geometry = new THREE.CylinderGeometry( data.radius, data.radius, data.height );

					} else if ( 'Cone' === data.nodeType ) {

						parent.geometry = new THREE.CylinderGeometry( data.topRadius, data.bottomRadius, data.height );

					} else if ( 'Sphere' === data.nodeType ) {

						parent.geometry = new THREE.SphereGeometry( data.radius );

					} else if ( 'IndexedFaceSet' === data.nodeType ) {

						var geometry = new THREE.Geometry();

						var indexes, uvIndexes, uvs;

						for ( var i = 0, j = data.children.length; i < j; i ++ ) {

							var child = data.children[ i ];

							var vec;

							if ( 'TextureCoordinate' === child.nodeType ) {

								uvs = child.points;

							}


							if ( 'Coordinate' === child.nodeType ) {

								if ( child.points ) {

									for ( var k = 0, l = child.points.length; k < l; k ++ ) {

										var point = child.points[ k ];

										vec = new THREE.Vector3( point.x, point.y, point.z );

										geometry.vertices.push( vec );

									}

								}

								if ( child.string.indexOf ( 'DEF' ) > -1 ) {

									var name = /DEF\s+([^\s]+)/.exec( child.string )[ 1 ];

									defines[ name ] = geometry.vertices;

								}

								if ( child.string.indexOf ( 'USE' ) > -1 ) {

									var defineKey = /USE\s+([^\s]+)/.exec( child.string )[ 1 ];

									geometry.vertices = defines[ defineKey ];
								}

							}

						}

						var skip = 0;

						// some shapes only have vertices for use in other shapes
						if ( data.coordIndex ) {

							// read this: http://math.hws.edu/eck/cs424/notes2013/16_Threejs_Advanced.html
							for ( var i = 0, j = data.coordIndex.length; i < j; i ++ ) {

								indexes = data.coordIndex[ i ]; if ( data.texCoordIndex ) uvIndexes = data.texCoordIndex[ i ];

								// vrml support multipoint indexed face sets (more then 3 vertices). You must calculate the composing triangles here
								skip = 0;

								// Face3 only works with triangles, but IndexedFaceSet allows shapes with more then three vertices, build them of triangles
								while ( indexes.length >= 3 && skip < ( indexes.length - 2 ) ) {

									var face = new THREE.Face3(
										indexes[ 0 ],
										indexes[ skip + (data.ccw ? 1 : 2) ],
										indexes[ skip + (data.ccw ? 2 : 1) ],
										null // normal, will be added later
										// todo: pass in the color, if a color index is present
									);

									if ( uvs && uvIndexes ) {
										geometry.faceVertexUvs [0].push( [
											new THREE.Vector2 (
												uvs[ uvIndexes[ 0 ] ].x ,
												uvs[ uvIndexes[ 0 ] ].y
											) ,
											new THREE.Vector2 (
												uvs[ uvIndexes[ skip + (data.ccw ? 1 : 2) ] ].x ,
												uvs[ uvIndexes[ skip + (data.ccw ? 1 : 2) ] ].y
											) ,
											new THREE.Vector2 (
												uvs[ uvIndexes[ skip + (data.ccw ? 2 : 1) ] ].x ,
												uvs[ uvIndexes[ skip + (data.ccw ? 2 : 1) ] ].y
											)
										] );
									}

									skip ++;

									geometry.faces.push( face );

								}


							}

						} else {

							// do not add dummy mesh to the scene
							parent.parent.remove( parent );

						}

						if ( false === data.solid ) {

							parent.material.side = THREE.DoubleSide;

						}

						// we need to store it on the geometry for use with defines
						geometry.solid = data.solid;

						geometry.computeFaceNormals();
						//geometry.computeVertexNormals(); // does not show
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

						if ( 'Material' === child.nodeType ) {

							var material = new THREE.MeshPhongMaterial();

							if ( undefined !== child.diffuseColor ) {

								var d = child.diffuseColor;

								material.color.setRGB( d.r, d.g, d.b );

							}

							if ( undefined !== child.emissiveColor ) {

								var e = child.emissiveColor;

								material.emissive.setRGB( e.r, e.g, e.b );

							}

							if ( undefined !== child.specularColor ) {

								var s = child.specularColor;

								material.specular.setRGB( s.r, s.g, s.b );

							}

							if ( undefined !== child.transparency ) {

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

						if ( 'ImageTexture' === child.nodeType ) {

							var textureName = /"([^"]+)"/.exec(child.children[ 0 ]);

							if (textureName) {

								parent.material.name = textureName[ 1 ];

								parent.material.map = textureLoader.load( texturePath + textureName[ 1 ] );

							}

						}

					}

					return;

				}

				for ( var i = 0, l = data.children.length; i < l; i ++ ) {

					var child = data.children[ i ];

					parseNode( data.children[ i ], object );

				}

			};

			parseNode( getTree( lines ), scene );

		};

		var scene = new THREE.Scene();

		var lines = data.split( '\n' );

		// some lines do not have breaks
		for (var i = lines.length -1; i > -1; i--) {

			// split lines with {..{ or {..[ - some have both
			if (/{.*[{\[]/.test (lines[i])) {
				var parts = lines[i].split ('{').join ('{\n').split ('\n');
				parts.unshift(1);
				parts.unshift(i);
				lines.splice.apply(lines, parts);
			} else

			// split lines with ]..}
			if (/\].*}/.test (lines[i])) {
				var parts = lines[i].split (']').join (']\n').split ('\n');
				parts.unshift(1);
				parts.unshift(i);
				lines.splice.apply(lines, parts);
			}

			// split lines with }..}
			if (/}.*}/.test (lines[i])) {
				var parts = lines[i].split ('}').join ('}\n').split ('\n');
				parts.unshift(1);
				parts.unshift(i);
				lines.splice.apply(lines, parts);
			}

			// force the parser to create Coordinate node for empty coords
			// coord USE something -> coord USE something Coordinate {}
			if((lines[i].indexOf ('coord') > -1) && (lines[i].indexOf ('[') < 0) && (lines[i].indexOf ('{') < 0)) {
				lines[i] += ' Coordinate {}';
			}
		}

		var header = lines.shift();

		if ( /V1.0/.exec( header ) ) {

			parseV1( lines, scene );

		} else if ( /V2.0/.exec( header ) ) {

			parseV2( lines, scene );

		}

		return scene;

	}

};
