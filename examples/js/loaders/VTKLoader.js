/**
 * @author mrdoob / http://mrdoob.com/
 * @author Alex Pletzer
 */

THREE.VTKLoader = function( manager ) {

	this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

THREE.VTKLoader.prototype = {

	constructor: THREE.VTKLoader,

	load: function ( url, onLoad, onProgress, onError ) {

		var scope = this;

		var loader = new THREE.XHRLoader( scope.manager );
		loader.setResponseType( 'arraybuffer' );
		loader.load( url, function( text ) {

			onLoad( scope.parse( text ) );

		}, onProgress, onError );

	},

	parse: function ( data ) {

		function parseASCII( data ) {

			// connectivity of the triangles
			var indices = [];

			// triangles vertices
			var positions = [];

			// red, green, blue colors in the range 0 to 1
			var colors = [];

			// normal vector, one per vertex
			var normals = [];

			var result;

			// pattern for reading vertices, 3 floats or integers
			var pat3Floats = /(\-?\d+\.?[\d\-\+e]*)\s+(\-?\d+\.?[\d\-\+e]*)\s+(\-?\d+\.?[\d\-\+e]*)/g;

			// pattern for connectivity, an integer followed by any number of ints
			// the first integer is the number of polygon nodes
			var patConnectivity = /^(\d+)\s+([\s\d]*)/;

			// indicates start of vertex data section
			var patPOINTS = /^POINTS /;

			// indicates start of polygon connectivity section
			var patPOLYGONS = /^POLYGONS /;

			// indicates start of triangle strips section
			var patTRIANGLE_STRIPS = /^TRIANGLE_STRIPS /;

			// POINT_DATA number_of_values
			var patPOINT_DATA = /^POINT_DATA[ ]+(\d+)/;

			// CELL_DATA number_of_polys
			var patCELL_DATA = /^CELL_DATA[ ]+(\d+)/;

			// Start of color section
			var patCOLOR_SCALARS = /^COLOR_SCALARS[ ]+(\w+)[ ]+3/;

			// NORMALS Normals float
			var patNORMALS = /^NORMALS[ ]+(\w+)[ ]+(\w+)/;

			var inPointsSection = false;
			var inPolygonsSection = false;
			var inTriangleStripSection = false;
			var inPointDataSection = false;
			var inCellDataSection = false;
			var inColorSection = false;
			var inNormalsSection = false;

			var lines = data.split( '\n' );

			for ( var i in lines ) {

				var line = lines[ i ];

				if ( inPointsSection ) {

					// get the vertices
					while ( ( result = pat3Floats.exec( line ) ) !== null ) {

						var x = parseFloat( result[ 1 ] );
						var y = parseFloat( result[ 2 ] );
						var z = parseFloat( result[ 3 ] );
						positions.push( x, y, z );

					}

				} else if ( inPolygonsSection ) {

					if ( ( result = patConnectivity.exec( line ) ) !== null ) {

						// numVertices i0 i1 i2 ...
						var numVertices = parseInt( result[ 1 ] );
						var inds = result[ 2 ].split( /\s+/ );

						if ( numVertices >= 3 ) {

							var i0 = parseInt( inds[ 0 ] );
							var i1, i2;
							var k = 1;
							// split the polygon in numVertices - 2 triangles
							for ( var j = 0; j < numVertices - 2; ++ j ) {

								i1 = parseInt( inds[ k ] );
								i2 = parseInt( inds[ k + 1 ] );
								indices.push( i0, i1, i2 );
								k ++;

							}

						}

					}

				} else if ( inTriangleStripSection ) {

					if ( ( result = patConnectivity.exec( line ) ) !== null ) {

						// numVertices i0 i1 i2 ...
						var numVertices = parseInt( result[ 1 ] );
						var inds = result[ 2 ].split( /\s+/ );

						if ( numVertices >= 3 ) {

							var i0, i1, i2;
							// split the polygon in numVertices - 2 triangles
							for ( var j = 0; j < numVertices - 2; j ++ ) {

								if ( j % 2 === 1 ) {

									i0 = parseInt( inds[ j ] );
									i1 = parseInt( inds[ j + 2 ] );
									i2 = parseInt( inds[ j + 1 ] );
									indices.push( i0, i1, i2 );

								} else {

									i0 = parseInt( inds[ j ] );
									i1 = parseInt( inds[ j + 1 ] );
									i2 = parseInt( inds[ j + 2 ] );
									indices.push( i0, i1, i2 );

								}

							}

						}

					}

				} else if ( inPointDataSection || inCellDataSection ) {

					if ( inColorSection ) {

						// Get the colors

						while ( ( result = pat3Floats.exec( line ) ) !== null ) {

							var r = parseFloat( result[ 1 ] );
							var g = parseFloat( result[ 2 ] );
							var b = parseFloat( result[ 3 ] );
							colors.push( r, g, b );

						}

					} else if ( inNormalsSection ) {

						// Get the normal vectors

						while ( ( result = pat3Floats.exec( line ) ) !== null ) {

							var nx = parseFloat( result[ 1 ] );
							var ny = parseFloat( result[ 2 ] );
							var nz = parseFloat( result[ 3 ] );
							normals.push( nx, ny, nz );

						}

					}

				}

				if ( patPOLYGONS.exec( line ) !== null ) {

					inPolygonsSection = true;
					inPointsSection = false;
					inTriangleStripSection = false;

				} else if ( patPOINTS.exec( line ) !== null ) {

					inPolygonsSection = false;
					inPointsSection = true;
					inTriangleStripSection = false;

				} else if ( patTRIANGLE_STRIPS.exec( line ) !== null ) {

					inPolygonsSection = false;
					inPointsSection = false;
					inTriangleStripSection = true;

				} else if ( patPOINT_DATA.exec( line ) !== null ) {

					inPointDataSection = true;
					inPointsSection = false;
					inPolygonsSection = false;
					inTriangleStripSection = false;

				} else if ( patCELL_DATA.exec( line ) !== null ) {

					inCellDataSection = true;
					inPointsSection = false;
					inPolygonsSection = false;
					inTriangleStripSection = false;

				} else if ( patCOLOR_SCALARS.exec( line ) !== null ) {

					inColorSection = true;
					inNormalsSection = false;
					inPointsSection = false;
					inPolygonsSection = false;
					inTriangleStripSection = false;

				} else if ( patNORMALS.exec( line ) !== null ) {

					inNormalsSection = true;
					inColorSection = false;
					inPointsSection = false;
					inPolygonsSection = false;
					inTriangleStripSection = false;

				}

			}

			var geometry;
			var stagger = 'point';

			if ( colors.length == indices.length ) {

				stagger = 'cell';

			}

			if ( stagger == 'point' ) {

				// Nodal. Use BufferGeometry
				geometry = new THREE.BufferGeometry();
				geometry.setIndex( new THREE.BufferAttribute( new Uint32Array( indices ), 1 ) );
				geometry.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array( positions ), 3 ) );

				if ( colors.length == positions.length ) {

					geometry.addAttribute( 'color', new THREE.BufferAttribute( new Float32Array( colors ), 3 ) );

				}

				if ( normals.length == positions.length ) {

					geometry.addAttribute( 'normal', new THREE.BufferAttribute( new Float32Array( normals ), 3 ) );

				}

			} else {

				// Cell centered colors. The only way to attach a solid color to each triangle
				// is to use Geometry, which is less efficient than BufferGeometry
				geometry = new THREE.Geometry();

				var numTriangles = indices.length / 3;
				var numPoints = positions.length / 3;
				var va, vb, vc;
				var face;
				var ia, ib, ic;
				var x, y, z;
				var r, g, b;

				for ( var j = 0; j < numPoints; ++ j ) {

					x = positions[ 3 * j + 0 ];
					y = positions[ 3 * j + 1 ];
					z = positions[ 3 * j + 2 ];
					geometry.vertices.push( new THREE.Vector3( x, y, z ) );

				}

				for ( var i = 0; i < numTriangles; ++ i ) {

					ia = indices[ 3 * i + 0 ];
					ib = indices[ 3 * i + 1 ];
					ic = indices[ 3 * i + 2 ];
					geometry.faces.push( new THREE.Face3( ia, ib, ic ) );

				}

				if ( colors.length == numTriangles * 3 ) {

					for ( var i = 0; i < numTriangles; ++ i ) {

						face = geometry.faces[ i ];
						r = colors[ 3 * i + 0 ];
						g = colors[ 3 * i + 1 ];
						b = colors[ 3 * i + 2 ];
						face.color = new THREE.Color().setRGB( r, g, b );

					}

				}

			}

			return geometry;

		}

		function parseBinary( data ) {

			var count, pointIndex, i, numberOfPoints, pt, s;
			var buffer = new Uint8Array ( data );
			var dataView = new DataView ( data );

			// Points and normals, by default, are empty
			var points = [];
			var normals = [];
			var indices = [];

			// Going to make a big array of strings
			var vtk = [];
			var index = 0;

			function findString( buffer, start ) {

				var index = start;
				var c = buffer[ index ];
				var s = [];
				while ( c != 10 ) {

					s.push ( String.fromCharCode ( c ) );
					index ++;
					c = buffer[ index ];

				}

				return { start: start,
						end: index,
						next: index + 1,
						parsedString: s.join( '' ) };

			}

			var state, line;

			while ( true ) {

				// Get a string
				state = findString ( buffer, index );
				line = state.parsedString;

				if ( line.indexOf ( "POINTS" ) === 0 ) {

					vtk.push ( line );
					// Add the points
					numberOfPoints = parseInt ( line.split( " " )[ 1 ], 10 );

					// Each point is 3 4-byte floats
					count = numberOfPoints * 4 * 3;

					points = new Float32Array( numberOfPoints * 3 );

					pointIndex = state.next;
					for ( i = 0; i < numberOfPoints; i ++ ) {

						points[ 3 * i ] = dataView.getFloat32( pointIndex, false );
						points[ 3 * i + 1 ] = dataView.getFloat32( pointIndex + 4, false );
						points[ 3 * i + 2 ] = dataView.getFloat32( pointIndex + 8, false );
						pointIndex = pointIndex + 12;

					}
					// increment our next pointer
					state.next = state.next + count + 1;

				} else if ( line.indexOf ( "TRIANGLE_STRIPS" ) === 0 ) {

					var numberOfStrips = parseInt ( line.split( " " )[ 1 ], 10 );
					var size = parseInt ( line.split ( " " )[ 2 ], 10 );
					// 4 byte integers
					count = size * 4;

					indices = new Uint32Array( 3 * size - 9 * numberOfStrips );
					var indicesIndex = 0;

					pointIndex = state.next;
					for ( i = 0; i < numberOfStrips; i ++ ) {

						// For each strip, read the first value, then record that many more points
						var indexCount = dataView.getInt32( pointIndex, false );
						var strip = [];
						pointIndex += 4;
						for ( s = 0; s < indexCount; s ++ ) {

							strip.push ( dataView.getInt32( pointIndex, false ) );
							pointIndex += 4;

						}

						// retrieves the n-2 triangles from the triangle strip
						for ( var j = 0; j < indexCount - 2; j ++ ) {

							if ( j % 2 ) {

								indices[ indicesIndex ++ ] = strip[ j ];
								indices[ indicesIndex ++ ] = strip[ j + 2 ];
								indices[ indicesIndex ++ ] = strip[ j + 1 ];

							} else {


								indices[ indicesIndex ++ ] = strip[ j ];
								indices[ indicesIndex ++ ] = strip[ j + 1 ];
								indices[ indicesIndex ++ ] = strip[ j + 2 ];

							}

						}

					}
					// increment our next pointer
					state.next = state.next + count + 1;

				} else if ( line.indexOf ( "POLYGONS" ) === 0 ) {

					var numberOfStrips = parseInt ( line.split( " " )[ 1 ], 10 );
					var size = parseInt ( line.split ( " " )[ 2 ], 10 );
					// 4 byte integers
					count = size * 4;

					indices = new Uint32Array( 3 * size - 9 * numberOfStrips );
					var indicesIndex = 0;

					pointIndex = state.next;
					for ( i = 0; i < numberOfStrips; i ++ ) {

						// For each strip, read the first value, then record that many more points
						var indexCount = dataView.getInt32( pointIndex, false );
						var strip = [];
						pointIndex += 4;
						for ( s = 0; s < indexCount; s ++ ) {

							strip.push ( dataView.getInt32( pointIndex, false ) );
							pointIndex += 4;

						}
						var i0 = strip[ 0 ];
						// divide the polygon in n-2 triangle
						for ( var j = 1; j < indexCount - 1; j ++ ) {

							indices[ indicesIndex ++ ] = strip[ 0 ];
							indices[ indicesIndex ++ ] = strip[ j ];
							indices[ indicesIndex ++ ] = strip[ j + 1 ];

						}

					}
					// increment our next pointer
					state.next = state.next + count + 1;

				} else if ( line.indexOf ( "POINT_DATA" ) === 0 ) {

					numberOfPoints = parseInt ( line.split( " " )[ 1 ], 10 );

					// Grab the next line
					state = findString ( buffer, state.next );

					// Now grab the binary data
					count = numberOfPoints * 4 * 3;

					normals = new Float32Array( numberOfPoints * 3 );
					pointIndex = state.next;
					for ( i = 0; i < numberOfPoints; i ++ ) {

						normals[ 3 * i ] = dataView.getFloat32( pointIndex, false );
						normals[ 3 * i + 1 ] = dataView.getFloat32( pointIndex + 4, false );
						normals[ 3 * i + 2 ] = dataView.getFloat32( pointIndex + 8, false );
						pointIndex += 12;

					}

					// Increment past our data
					state.next = state.next + count;

				}

				// Increment index
				index = state.next;

				if ( index >= buffer.byteLength ) {

					break;

				}

			}

			var geometry = new THREE.BufferGeometry();
			geometry.setIndex( new THREE.BufferAttribute( indices, 1 ) );
			geometry.addAttribute( 'position', new THREE.BufferAttribute( points, 3 ) );

			if ( normals.length == points.length ) {

				geometry.addAttribute( 'normal', new THREE.BufferAttribute( normals, 3 ) );

			}

			return geometry;

		}

		// get the 5 first lines of the files to check if there is the key word binary

		var meta = String.fromCharCode.apply( null, new Uint8Array( data, 0, 250 ) ).split( '\n' );


		if ( meta[ 2 ].includes( 'ASCII' ) ) {

			var stringFile = '';
			var charArray = new Uint8Array( data );
			for ( var i = 0; i < charArray.length; i ++ ) {

				stringFile += String.fromCharCode( charArray[ i ] );

			}

			return parseASCII( stringFile );

		} else {

			return parseBinary( data );

		}

	}

};

THREE.EventDispatcher.prototype.apply( THREE.VTKLoader.prototype );
