/**
 * Loads a Wavefront .obj file with materials
 *
 * @author mrdoob / http://mrdoob.com/
 * @author angelxuanchang
 */

THREE.OBJMTLLoader = function ( ) {

	THREE.EventTarget.call( this );

};

THREE.OBJMTLLoader.prototype = {

	constructor: THREE.OBJMTLLoader,

	/**
	 * Load a Wavefront OBJ file with materials (MTL file)
	 *
	 * Loading progress is indicated by the following events:
	 *   "load" event (successful loading): type = 'load', content = THREE.Object3D
	 *   "error" event (error loading): type = 'load', message
	 *   "progress" event (progress loading): type = 'progress', loaded, total
	 *
	 * If the MTL file cannot be loaded, then a MeshLambertMaterial is used as a default
	 * @param url - Location of OBJ file to load
	 * @param mtlfileurl - MTL file to load (optional, if not specified, attempts to use MTL specified in OBJ file)
	 * @param options - Options on how to interpret the material (see THREE.MTLLoader.MaterialCreator )
	 */

	load: function ( url, mtlfileurl, options ) {

		var scope = this;
		var xhr = new XMLHttpRequest();

		var mtlDone;           // Is the MTL done (true if no MTL, error loading MTL, or MTL actually loaded)
		var obj3d;             // Loaded model (from obj file)
		var materialsCreator;  // Material creator is created when MTL file is loaded

		// Loader for MTL

		var mtlLoader = new THREE.MTLLoader( url.substr( 0, url.lastIndexOf( "/" ) + 1 ), options );
		mtlLoader.addEventListener( 'load', waitReady );
		mtlLoader.addEventListener( 'error', waitReady );

		// Try to load mtlfile

		if ( mtlfileurl ) {

			mtlLoader.load( mtlfileurl );
			mtlDone = false;

		} else {

			mtlDone = true;

		}

		function waitReady( event ) {

			if ( event.type === 'load' ) {

				if ( event.content instanceof THREE.MTLLoader.MaterialCreator ) {

					// MTL file is loaded

					mtlDone = true;
					materialsCreator = event.content;
					materialsCreator.preload();

				} else {

					// OBJ file is loaded

					if ( event.target.status === 200 || event.target.status === 0 ) {

						var objContent = event.target.responseText;

						if ( mtlfileurl ) {

							// Parse with passed in MTL file

							obj3d = scope.parse( objContent );

						} else {

							// No passed in MTL file, look for mtlfile in obj file

							obj3d = scope.parse( objContent, function( mtlfile ) {

								mtlDone = false;
								mtlLoader.load( mtlLoader.baseUrl + mtlfile );

							} );

						}

					} else {

						// Error loading OBJ file....

						scope.dispatchEvent( {
							type: 'error',
							message: 'Couldn\'t load URL [' + url + ']',
							response: event.target.responseText } );

					}

				}

			} else if ( event.type === 'error' ) {

				// MTL failed to load -- oh well, we will just not have material ...

				mtlDone = true;

			}

			if ( mtlDone && obj3d ) {

				// MTL file is loaded and OBJ file is loaded
				// Apply materials to model

				if ( materialsCreator ) {

					obj3d.traverse( function( object ) {

						if ( object instanceof THREE.Mesh ) {

							if ( object.material.name ) {

								var material = materialsCreator.create( object.material.name );
								if ( material ) {

									object.material = material;

								}

							}

						}

					} );

				}

				// Notify listeners

				scope.dispatchEvent( { type: 'load', content: obj3d } );
			}

		}

		xhr.addEventListener( 'load', waitReady, false );

		xhr.addEventListener( 'progress', function ( event ) {

			scope.dispatchEvent( { type: 'progress', loaded: event.loaded, total: event.total } );

		}, false );

		xhr.addEventListener( 'error', function () {

			scope.dispatchEvent( { type: 'error', message: 'Couldn\'t load URL [' + url + ']' } );

		}, false );

		xhr.open( 'GET', url, true );
		xhr.send( null );

	},

	/**
	 * Parses loaded .obj file
	 * @param data - content of .obj file
	 * @param mtllibCallback - callback to handle mtllib declaration (optional)
	 * @return {THREE.Object3D} - Object3D (with default material)
	 */

	parse: function ( data, mtllibCallback ) {

		function vector( x, y, z ) {

			return new THREE.Vector3( x, y, z );

		}

		function uv( u, v ) {

			return new THREE.UV( u, v );

		}

		function face3( a, b, c, normals ) {

			return new THREE.Face3( a, b, c, normals );

		}

		function face4( a, b, c, d, normals ) {

			return new THREE.Face4( a, b, c, d, normals );

		}

		function finalize_mesh( group, mesh_info ) {

			mesh_info.geometry.computeCentroids();
			mesh_info.geometry.computeFaceNormals();
			mesh_info.geometry.computeBoundingSphere();
			group.add( new THREE.Mesh( mesh_info.geometry, mesh_info.material ) );

		}

		var vertices = [];
		var normals = [];
		var uvs = [];

		// v float float float

		var vertex_pattern = /v( +[\d|\.|\+|\-|e]+)( [\d|\.|\+|\-|e]+)( [\d|\.|\+|\-|e]+)/;

		// vn float float float

		var normal_pattern = /vn( +[\d|\.|\+|\-|e]+)( [\d|\.|\+|\-|e]+)( [\d|\.|\+|\-|e]+)/;

		// vt float float

		var uv_pattern = /vt( +[\d|\.|\+|\-|e]+)( [\d|\.|\+|\-|e]+)/;

		// f vertex vertex vertex ...

		var face_pattern1 = /f( +[\d]+)( [\d]+)( [\d]+)( [\d]+)?/;

		// f vertex/uv vertex/uv vertex/uv ...

		var face_pattern2 = /f( +([\d]+)\/([\d]+))( ([\d]+)\/([\d]+))( ([\d]+)\/([\d]+))( ([\d]+)\/([\d]+))?/;

		// f vertex/uv/normal vertex/uv/normal vertex/uv/normal ...

		var face_pattern3 = /f( +([\d]+)\/([\d]+)\/([\d]+))( ([\d]+)\/([\d]+)\/([\d]+))( ([\d]+)\/([\d]+)\/([\d]+))( ([\d]+)\/([\d]+)\/([\d]+))?/;

		// f vertex//normal vertex//normal vertex//normal ...

		var face_pattern4 = /f( +([\d]+)\/\/([\d]+))( ([\d]+)\/\/([\d]+))( ([\d]+)\/\/([\d]+))( ([\d]+)\/\/([\d]+))?/;

		var final_model = new THREE.Object3D();

		var geometry = new THREE.Geometry();
		geometry.vertices = vertices;

		var cur_mesh = {

			material: new THREE.MeshLambertMaterial(),
			geometry: geometry

		};

		var lines = data.split( "\n" );

		for ( var i = 0; i < lines.length; i ++ ) {

			var line = lines[ i ];
			line = line.trim();

			// temporary variable storing pattern matching result

			var result;

			if ( line.length === 0 || line.charAt( 0 ) === '#' ) {

				continue;

			} else if ( ( result = vertex_pattern.exec( line ) ) !== null ) {

				// ["v 1.0 2.0 3.0", "1.0", "2.0", "3.0"]

				vertices.push( vector(
					parseFloat( result[ 1 ] ),
					parseFloat( result[ 2 ] ),
					parseFloat( result[ 3 ] )
				) );

			} else if ( ( result = normal_pattern.exec( line ) ) !== null ) {

				// ["vn 1.0 2.0 3.0", "1.0", "2.0", "3.0"]

				normals.push( vector(
					parseFloat( result[ 1 ] ),
					parseFloat( result[ 2 ] ),
					parseFloat( result[ 3 ] )
				) );

			} else if ( ( result = uv_pattern.exec( line ) ) !== null ) {

				// ["vt 0.1 0.2", "0.1", "0.2"]

				uvs.push( uv(
					parseFloat( result[ 1 ] ),
					parseFloat( result[ 2 ] )
				) );

			} else if ( ( result = face_pattern1.exec( line ) ) !== null ) {

				// ["f 1 2 3", "1", "2", "3", undefined]

				if ( result[ 4 ] === undefined ) {

					geometry.faces.push( face3(
						parseInt( result[ 1 ] ) - 1,
						parseInt( result[ 2 ] ) - 1,
						parseInt( result[ 3 ] ) - 1
					) );

				} else {

					geometry.faces.push( face4(
						parseInt( result[ 1 ] ) - 1,
						parseInt( result[ 2 ] ) - 1,
						parseInt( result[ 3 ] ) - 1,
						parseInt( result[ 4 ] ) - 1
					) );

				}

			} else if ( ( result = face_pattern2.exec( line ) ) !== null ) {

				// ["f 1/1 2/2 3/3", " 1/1", "1", "1", " 2/2", "2", "2", " 3/3", "3", "3", undefined, undefined, undefined]

				if ( result[ 10 ] === undefined ) {

					geometry.faces.push( face3(
						parseInt( result[ 2 ] ) - 1,
						parseInt( result[ 5 ] ) - 1,
						parseInt( result[ 8 ] ) - 1
					) );

					geometry.faceVertexUvs[ 0 ].push( [
						uvs[ parseInt( result[ 3 ] ) - 1 ],
						uvs[ parseInt( result[ 6 ] ) - 1 ],
						uvs[ parseInt( result[ 9 ] ) - 1 ]
					] );

				} else {

					geometry.faces.push( face4(
						parseInt( result[ 2 ] ) - 1,
						parseInt( result[ 5 ] ) - 1,
						parseInt( result[ 8 ] ) - 1,
						parseInt( result[ 11 ] ) - 1
					) );

					geometry.faceVertexUvs[ 0 ].push( [
						uvs[ parseInt( result[ 3 ] ) - 1 ],
						uvs[ parseInt( result[ 6 ] ) - 1 ],
						uvs[ parseInt( result[ 9 ] ) - 1 ],
						uvs[ parseInt( result[ 12 ] ) - 1 ]
					] );

				}

			} else if ( ( result = face_pattern3.exec( line ) ) !== null ) {

				// ["f 1/1/1 2/2/2 3/3/3", " 1/1/1", "1", "1", "1", " 2/2/2", "2", "2", "2", " 3/3/3", "3", "3", "3", undefined, undefined, undefined, undefined]

				if ( result[ 13 ] === undefined ) {

					geometry.faces.push( face3(
						parseInt( result[ 2 ] ) - 1,
						parseInt( result[ 6 ] ) - 1,
						parseInt( result[ 10 ] ) - 1,
						[
							normals[ parseInt( result[ 4 ] ) - 1 ],
							normals[ parseInt( result[ 8 ] ) - 1 ],
							normals[ parseInt( result[ 12 ] ) - 1 ]
						]
					) );

					geometry.faceVertexUvs[ 0 ].push( [
						uvs[ parseInt( result[ 3 ] ) - 1 ],
						uvs[ parseInt( result[ 7 ] ) - 1 ],
						uvs[ parseInt( result[ 11 ] ) - 1 ]
					] );

				} else {

					geometry.faces.push( face4(
						parseInt( result[ 2 ] ) - 1,
						parseInt( result[ 6 ] ) - 1,
						parseInt( result[ 10 ] ) - 1,
						parseInt( result[ 14 ] ) - 1,
						[
							normals[ parseInt( result[ 4 ] ) - 1 ],
							normals[ parseInt( result[ 8 ] ) - 1 ],
							normals[ parseInt( result[ 12 ] ) - 1 ],
							normals[ parseInt( result[ 16 ] ) - 1 ]
						]
					) );

					geometry.faceVertexUvs[ 0 ].push( [
						uvs[ parseInt( result[ 3 ] ) - 1 ],
						uvs[ parseInt( result[ 7 ] ) - 1 ],
						uvs[ parseInt( result[ 11 ] ) - 1 ],
						uvs[ parseInt( result[ 15 ] ) - 1 ]
					] );

				}

			} else if ( ( result = face_pattern4.exec( line ) ) !== null ) {

				// ["f 1//1 2//2 3//3", " 1//1", "1", "1", " 2//2", "2", "2", " 3//3", "3", "3", undefined, undefined, undefined]

				if ( result[ 10 ] === undefined ) {

					geometry.faces.push( face3(
						parseInt( result[ 2 ] ) - 1,
						parseInt( result[ 5 ] ) - 1,
						parseInt( result[ 8 ] ) - 1,
						[
							normals[ parseInt( result[ 3 ] ) - 1 ],
							normals[ parseInt( result[ 6 ] ) - 1 ],
							normals[ parseInt( result[ 9 ] ) - 1 ]
						]
					) );

				} else {

					geometry.faces.push( face4(
						parseInt( result[ 2 ] ) - 1,
						parseInt( result[ 5 ] ) - 1,
						parseInt( result[ 8 ] ) - 1,
						parseInt( result[ 11 ] ) - 1,
						[
							normals[ parseInt( result[ 3 ] ) - 1 ],
							normals[ parseInt( result[ 6 ] ) - 1 ],
							normals[ parseInt( result[ 9 ] ) - 1 ],
							normals[ parseInt( result[ 12 ] ) - 1 ]
						]
					) );

				}

			} else if ( line.startsWith( "usemtl " ) ) {

				var material_name = line.substring( 7 );
				material_name = material_name.trim();

				var material = new THREE.MeshLambertMaterial();
				material.name = material_name;

				if ( geometry.faces.length > 0 ) {

					// Finalize previous geometry and add to model

					finalize_mesh( final_model, cur_mesh );
					geometry = new THREE.Geometry();
					geometry.vertices = vertices;

					cur_mesh = {  geometry: geometry };

				}

				cur_mesh.material = material;
				//material_index = materialsCreator.getIndex( material_name );

			} else if ( line.startsWith( "g " ) ) {

				// Polygon group for object

				var group_name = line.substring( 2 );
				group_name = group_name.trim();

			} else if ( line.startsWith( "o " ) ) {

				// Object

				var object_name = line.substring(2);
				object_name = object_name.trim();

			} else if ( line.startsWith( "s ") ) {

				// Smooth shading

			} else if ( line.startsWith( "mtllib ") ) {

				// mtl file

				if ( mtllibCallback ) {

					var mtlfile = line.substring( 7 );
					mtlfile = mtlfile.trim();
					mtllibCallback( mtlfile );

				}

			} else {

				console.error( "Unhandled line " + line );

			}

		}

		finalize_mesh( final_model, cur_mesh );

		return final_model;

	}

};
