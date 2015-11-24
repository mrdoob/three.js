/**
 * @author mrdoob / http://mrdoob.com/
 * @author Alex Pletzer
 */

THREE.VTKLoader = function ( manager ) {

	this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

THREE.VTKLoader.prototype = {

	constructor: THREE.VTKLoader,

	load: function ( url, onLoad, onProgress, onError ) {

		// Will we bump into trouble reading the whole file into memory?
		var scope = this;
		var loader = new THREE.XHRLoader( scope.manager );
		loader.load( url, function ( text ) {

			onLoad( scope.parse( text ) );

		},

		onProgress, onError );

	},

	parse: function ( data ) {

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
							i2 = parseInt( inds[ k  + 1 ] );
							indices.push( i0, i1, i2 );
							k ++;

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

			} else if ( patPOINTS.exec( line ) !== null ) {

				inPolygonsSection = false;
				inPointsSection = true;

			} else if ( patPOINT_DATA.exec( line ) !== null ) {

				inPointDataSection = true;
				inPointsSection = false;
				inPolygonsSection = false;

			} else if ( patCELL_DATA.exec( line ) !== null ) {

				inCellDataSection = true;
				inPointsSection = false;
				inPolygonsSection = false;

			} else if ( patCOLOR_SCALARS.exec( line ) !== null ) {

				inColorSection = true;
				inNormalsSection = false;
				inPointsSection = false;
				inPolygonsSection = false;

			} else if ( patNORMALS.exec( line ) !== null ) {

				inNormalsSection = true;
				inColorSection = false;
				inPointsSection = false;
				inPolygonsSection = false;

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
			geometry.setIndex( new THREE.BufferAttribute( new ( indices.length > 65535 ? Uint32Array : Uint16Array )( indices ), 1 ) );
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

};

THREE.EventDispatcher.prototype.apply( THREE.VTKLoader.prototype );
