/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.OBJLoader = function ( manager ) {

	this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

	this.materials = null;

	this.regexp = {
		// v float float float
		vertex_pattern           : /^v\s+([\d|\.|\+|\-|e|E]+)\s+([\d|\.|\+|\-|e|E]+)\s+([\d|\.|\+|\-|e|E]+)/,
		// vn float float float
		normal_pattern           : /^vn\s+([\d|\.|\+|\-|e|E]+)\s+([\d|\.|\+|\-|e|E]+)\s+([\d|\.|\+|\-|e|E]+)/,
		// vt float float
		uv_pattern               : /^vt\s+([\d|\.|\+|\-|e|E]+)\s+([\d|\.|\+|\-|e|E]+)/,
		// f vertex vertex vertex
		face_vertex              : /^f\s+(-?\d+)\s+(-?\d+)\s+(-?\d+)(?:\s+(-?\d+))?/,
		// f vertex/uv vertex/uv vertex/uv
		face_vertex_uv           : /^f\s+(-?\d+)\/(-?\d+)\s+(-?\d+)\/(-?\d+)\s+(-?\d+)\/(-?\d+)(?:\s+(-?\d+)\/(-?\d+))?/,
		// f vertex/uv/normal vertex/uv/normal vertex/uv/normal
		face_vertex_uv_normal    : /^f\s+(-?\d+)\/(-?\d+)\/(-?\d+)\s+(-?\d+)\/(-?\d+)\/(-?\d+)\s+(-?\d+)\/(-?\d+)\/(-?\d+)(?:\s+(-?\d+)\/(-?\d+)\/(-?\d+))?/,
		// f vertex//normal vertex//normal vertex//normal
		face_vertex_normal       : /^f\s+(-?\d+)\/\/(-?\d+)\s+(-?\d+)\/\/(-?\d+)\s+(-?\d+)\/\/(-?\d+)(?:\s+(-?\d+)\/\/(-?\d+))?/,
		// o object_name | g group_name
		object_pattern           : /^[og]\s*(.+)?/,
		// s boolean
		smoothing_pattern        : /^s\s+(\d+|on|off)/,
		// mtllib file_reference
		material_library_pattern : /^mtllib /,
		// usemtl material_name
		material_use_pattern     : /^usemtl /
	};

};

THREE.OBJLoader.prototype = {

	constructor: THREE.OBJLoader,

	load: function ( url, onLoad, onProgress, onError ) {

		var scope = this;

		var loader = new THREE.XHRLoader( scope.manager );
		loader.setPath( this.path );
		loader.load( url, function ( text ) {

			onLoad( scope.parse( text ) );

		}, onProgress, onError );

	},

	setPath: function ( value ) {

		this.path = value;

	},

	setMaterials: function ( materials ) {

		this.materials = materials;

	},

	_createParserState : function()
	{
		var state = {
			objects  : [],
			object   : {},

			vertices : [],
			normals  : [],
			uvs      : [],

			materialLibraries : [],

			startObject : function(name, fromDeclaration)
			{
				// If the current object (initial from reset) is not from a g/o declaration in the parsed
				// file. We need to use it for the first parsed g/o to keep things in sync.
				if ( this.object && this.object.fromDeclaration === false ) {
					this.object.name = name;
					this.object.fromDeclaration = (fromDeclaration !== false);
					return;
				}

				this.object = {
					name : name || '',
					geometry : {
						vertices : [],
						normals  : [],
						uvs      : []
					},
					material : {
						name   : '',
						smooth : true
					},
					fromDeclaration : (fromDeclaration !== false)
				};
				this.objects.push(this.object);
			},

			parseVertexIndex : function( value ) {

				var index = parseInt( value, 10 );
				return ( index >= 0 ? index - 1 : index + this.vertices.length / 3 ) * 3;

			},

			parseNormalIndex : function( value ) {

				var index = parseInt( value, 10 );
				return ( index >= 0 ? index - 1 : index + this.normals.length / 3 ) * 3;

			},

			parseUVIndex : function( value ) {

				var index = parseInt( value, 10 );
				return ( index >= 0 ? index - 1 : index + this.uvs.length / 2 ) * 2;

			},

			addVertex : function( a, b, c ) {

				var src = this.vertices;
				this.object.geometry.vertices.push(src[ a ]);
				this.object.geometry.vertices.push(src[ a + 1 ]);
				this.object.geometry.vertices.push(src[ a + 2 ]);
				this.object.geometry.vertices.push(src[ b ]);
				this.object.geometry.vertices.push(src[ b + 1 ]);
				this.object.geometry.vertices.push(src[ b + 2 ]);
				this.object.geometry.vertices.push(src[ c ]);
				this.object.geometry.vertices.push(src[ c + 1 ]);
				this.object.geometry.vertices.push(src[ c + 2 ]);

			},

			addNormal : function( a, b, c ) {

				var src = this.normals;
				this.object.geometry.normals.push(src[ a ]);
				this.object.geometry.normals.push(src[ a + 1 ]);
				this.object.geometry.normals.push(src[ a + 2 ]);
				this.object.geometry.normals.push(src[ b ]);
				this.object.geometry.normals.push(src[ b + 1 ]);
				this.object.geometry.normals.push(src[ b + 2 ]);
				this.object.geometry.normals.push(src[ c ]);
				this.object.geometry.normals.push(src[ c + 1 ]);
				this.object.geometry.normals.push(src[ c + 2 ]);

			},

			addUV : function( a, b, c ) {

				var src = this.uvs;
				this.object.geometry.uvs.push(src[ a ]);
				this.object.geometry.uvs.push(src[ a + 1 ]);
				this.object.geometry.uvs.push(src[ b ]);
				this.object.geometry.uvs.push(src[ b + 1 ]);
				this.object.geometry.uvs.push(src[ c ]);
				this.object.geometry.uvs.push(src[ c + 1 ]);

			},

			addFace : function( a, b, c, d, ua, ub, uc, ud, na, nb, nc, nd ) {

				var ia = this.parseVertexIndex( a );
				var ib = this.parseVertexIndex( b );
				var ic = this.parseVertexIndex( c );
				var id;

				if ( d === undefined ) {

					this.addVertex( ia, ib, ic );

				} else {

					id = this.parseVertexIndex( d );

					this.addVertex( ia, ib, id );
					this.addVertex( ib, ic, id );

				}

				if ( ua !== undefined ) {

					ia = this.parseUVIndex( ua );
					ib = this.parseUVIndex( ub );
					ic = this.parseUVIndex( uc );

					if ( d === undefined ) {

						this.addUV( ia, ib, ic );

					} else {

						id = this.parseUVIndex( ud );

						this.addUV( ia, ib, id );
						this.addUV( ib, ic, id );

					}

				}

				if ( na !== undefined ) {

					ia = this.parseNormalIndex( na );
					ib = this.parseNormalIndex( nb );
					ic = this.parseNormalIndex( nc );

					if ( d === undefined ) {

						this.addNormal( ia, ib, ic );

					} else {

						id = this.parseNormalIndex( nd );

						this.addNormal( ia, ib, id );
						this.addNormal( ib, ic, id );

					}

				}

			}
		};

		state.startObject('', false);
		return state;
	},

	parse: function ( text ) {

		console.time( 'OBJLoader' );

		var state = this._createParserState();

		if ( text.indexOf('\r\n') !== -1 ) {
			// This is faster than String.split with regex that splits on both
			text = text.replace('\r\n', '\n');
		}

		var lines = text.split( '\n' );

		// Faster to just trim left side of the line. Use if available.
		var trimLeft = (typeof ''.trimLeft === 'function');

		for ( var i = 0; i < lines.length; i ++ ) {

			var line = lines[ i ];
			if (trimLeft)
				line = line.trimLeft();
			else
				line = line.trim();

			var lineLength = line.length;
			if ( lineLength === 0 ) {
				continue;
			}

			var lineFirstChar = line.charAt( 0 );
			if ( lineFirstChar === '#' ) {
				// @todo invoke passed in handler if any
				continue;
			}

			var result = [];
			if ( lineFirstChar === 'v' ) {

				var lineSecondChar = line.charAt( 1 );

				if ( lineSecondChar === ' ' && ( result = this.regexp.vertex_pattern.exec( line ) ) !== null ) {

					// 0                  1      2      3
					// ["v 1.0 2.0 3.0", "1.0", "2.0", "3.0"]

					state.vertices.push(
						parseFloat( result[ 1 ] ),
						parseFloat( result[ 2 ] ),
						parseFloat( result[ 3 ] )
					);

				} else if ( lineSecondChar === 'n' && ( result = this.regexp.normal_pattern.exec( line ) ) !== null ) {

					// 0                   1      2      3
					// ["vn 1.0 2.0 3.0", "1.0", "2.0", "3.0"]

					state.normals.push(
						parseFloat( result[ 1 ] ),
						parseFloat( result[ 2 ] ),
						parseFloat( result[ 3 ] )
					);

				} else if ( lineSecondChar === 't' && ( result = this.regexp.uv_pattern.exec( line ) ) !== null ) {

					// 0               1      2
					// ["vt 0.1 0.2", "0.1", "0.2"]

					state.uvs.push(
						parseFloat( result[ 1 ] ),
						parseFloat( result[ 2 ] )
					);

				} else {

					throw new Error( "Unexpected vertex/normal/uv line: '" + line  + "'");

				}

			} else if ( lineFirstChar === "f" ) {

				if ( ( result = this.regexp.face_vertex_uv_normal.exec( line ) ) !== null ) {

					// f vertex/uv/normal vertex/uv/normal vertex/uv/normal
					// 0                        1    2    3    4    5    6    7    8    9   10         11         12
					// ["f 1/1/1 2/2/2 3/3/3", "1", "1", "1", "2", "2", "2", "3", "3", "3", undefined, undefined, undefined]

					state.addFace(
						result[ 1 ], result[ 4 ], result[ 7 ], result[ 10 ],
						result[ 2 ], result[ 5 ], result[ 8 ], result[ 11 ],
						result[ 3 ], result[ 6 ], result[ 9 ], result[ 12 ]
					);

				} else if ( ( result = this.regexp.face_vertex_uv.exec( line ) ) !== null ) {

					// f vertex/uv vertex/uv vertex/uv
					// 0                  1    2    3    4    5    6   7          8
					// ["f 1/1 2/2 3/3", "1", "1", "2", "2", "3", "3", undefined, undefined]

					state.addFace(
						result[ 1 ], result[ 3 ], result[ 5 ], result[ 7 ],
						result[ 2 ], result[ 4 ], result[ 6 ], result[ 8 ]
					);

				} else if ( ( result = this.regexp.face_vertex_normal.exec( line ) ) !== null ) {

					// f vertex//normal vertex//normal vertex//normal
					// 0                     1    2    3    4    5    6   7          8
					// ["f 1//1 2//2 3//3", "1", "1", "2", "2", "3", "3", undefined, undefined]

					state.addFace(
						result[ 1 ], result[ 3 ], result[ 5 ], result[ 7 ],
						undefined, undefined, undefined, undefined,
						result[ 2 ], result[ 4 ], result[ 6 ], result[ 8 ]
					);

				} else if ( ( result = this.regexp.face_vertex.exec( line ) ) !== null ) {

					// f vertex vertex vertex
					// 0            1    2    3   4
					// ["f 1 2 3", "1", "2", "3", undefined]

					state.addFace(
						result[ 1 ], result[ 2 ], result[ 3 ], result[ 4 ]
					);

				} else {

					throw new Error( "Unexpected face line: '" + line  + "'");

				}

			} else if ( ( result = this.regexp.object_pattern.exec( line ) ) !== null ) {

				// o object_name
				// or
				// g group_name

				var name = result[ 0 ].substr( 1 ).trim();
				state.startObject(name);

			} else if ( this.regexp.material_use_pattern.test( line ) ) {

				// material

				state.object.material.name = line.substring( 7 ).trim();

			} else if ( this.regexp.material_library_pattern.test( line ) ) {

				// mtl file

				state.materialLibraries.push( line.substring( 7 ).trim() );

			} else if ( ( result = this.regexp.smoothing_pattern.exec( line ) ) !== null ) {

				// smooth shading

				var value = result[ 1 ].trim().toLowerCase();
				state.object.material.smooth = ( value === '1' || value === 'on' );

			} else {

				// Handle null terminated files without exception
				if (line === "\0")
					continue;

				throw new Error( "Unexpected line: '" + line  + "'");

			}

		}

		var container = new THREE.Group();
		container.materialLibraries = [].concat(state.materialLibraries);

		for ( var i = 0, l = state.objects.length; i < l; i ++ ) {

			var object = state.objects[ i ];
			var geometry = object.geometry;

			var buffergeometry = new THREE.BufferGeometry();

			buffergeometry.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array( geometry.vertices ), 3 ) );

			if ( geometry.normals.length > 0 ) {

				buffergeometry.addAttribute( 'normal', new THREE.BufferAttribute( new Float32Array( geometry.normals ), 3 ) );

			} else {

				buffergeometry.computeVertexNormals();

			}

			if ( geometry.uvs.length > 0 ) {

				buffergeometry.addAttribute( 'uv', new THREE.BufferAttribute( new Float32Array( geometry.uvs ), 2 ) );

			}

			var material;

			if ( this.materials !== null ) {

				material = this.materials.create( object.material.name );

			}

			if ( !material ) {

				material = new THREE.MeshPhongMaterial();
				material.name = object.material.name;

			}

			material.shading = object.material.smooth ? THREE.SmoothShading : THREE.FlatShading;

			var mesh = new THREE.Mesh( buffergeometry, material );
			mesh.name = object.name;

			container.add( mesh );

		}

		console.timeEnd( 'OBJLoader' );

		return container;

	}

};
