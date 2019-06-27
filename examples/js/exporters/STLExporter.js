/**
 * @author kovacsv / http://kovacsv.hu/
 * @author mrdoob / http://mrdoob.com/
 * @author mudcube / http://mudcu.be/
 * @author Mugen87 / https://github.com/Mugen87
 * @author cioddi / https://github.com/cioddi
 *
 * Usage:
 *  var exporter = new THREE.STLExporter();
 *
 *  // second argument is a list of options
 *  var data = exporter.parse( mesh, { binary: true } );
 *
 */

THREE.STLExporter = function () {};

THREE.STLExporter.prototype = {

	constructor: THREE.STLExporter,

	parse: ( function () {

		var vector = new THREE.Vector3();
		var normalMatrixWorld = new THREE.Matrix3();

		return function parse( scene, options ) {

			if ( options === undefined ) options = {};

			var binary = options.binary !== undefined ? options.binary : false;

			//

			var objects = [];
			var triangles = 0;

			scene.traverse( function ( object ) {

				if ( object.isMesh ) {

					var geometry = object.geometry;

					if ( geometry.isBufferGeometry ) {

						geometry = new THREE.Geometry().fromBufferGeometry( geometry );

					}

					if ( geometry.isGeometry ) {

						triangles += geometry.faces.length;

						objects.push( {

							obj: object,
							geometry: geometry,
							matrixWorld: object.matrixWorld

						} );

					}

				}

			} );

			if ( binary ) {

				var offset = 80; // skip header
				var bufferLength = triangles * 2 + triangles * 3 * 4 * 4 + 80 + 4;
				var arrayBuffer = new ArrayBuffer( bufferLength );
				var output = new DataView( arrayBuffer );
				output.setUint32( offset, triangles, true ); offset += 4;

				for ( var i = 0, il = objects.length; i < il; i ++ ) {

					var object = objects[ i ];

					var vertices = object.geometry.vertices;
					var faces = object.geometry.faces;
					var matrixWorld = object.matrixWorld;

					normalMatrixWorld.getNormalMatrix( matrixWorld );

					for ( var j = 0, jl = faces.length; j < jl; j ++ ) {

						var face = faces[ j ];

						vector.copy( face.normal ).applyMatrix3( normalMatrixWorld ).normalize();

						output.setFloat32( offset, vector.x, true ); offset += 4; // normal
						output.setFloat32( offset, vector.y, true ); offset += 4;
						output.setFloat32( offset, vector.z, true ); offset += 4;

						var indices = [ face.a, face.b, face.c ];

						for ( var k = 0; k < 3; k ++ ) {

							vector.copy( vertices[ indices[ k ] ] ).applyMatrix4( matrixWorld );

              if(
                typeof object.obj.geometry.attributes.skinIndex !== 'undefined' &&
                typeof object.obj.geometry.attributes.skinWeight !== 'undefined' &&
                typeof object.obj.skeleton !== 'undefined'
              ){
                vector = this.boneTransform( object.obj , vertices[ indices[ k ] ] , indices[ k ] );
              }

							output.setFloat32( offset, vector.x, true ); offset += 4; // vertices
							output.setFloat32( offset, vector.y, true ); offset += 4;
							output.setFloat32( offset, vector.z, true ); offset += 4;

						}

						output.setUint16( offset, 0, true ); offset += 2; // attribute byte count

					}

				}

				return output;

			} else {

				var output = '';

				output += 'solid exported\n';

				for ( var i = 0, il = objects.length; i < il; i ++ ) {

					var object = objects[ i ];

					var vertices = object.geometry.vertices;
					var faces = object.geometry.faces;
					var matrixWorld = object.matrixWorld;


					normalMatrixWorld.getNormalMatrix( matrixWorld );

					for ( var j = 0, jl = faces.length; j < jl; j ++ ) {

						var face = faces[ j ];

						vector.copy( face.normal ).applyMatrix3( normalMatrixWorld ).normalize();

						output += '\tfacet normal ' + vector.x + ' ' + vector.y + ' ' + vector.z + '\n';
						output += '\t\touter loop\n';

						var indices = [ face.a, face.b, face.c ];

						for ( var k = 0; k < 3; k ++ ) {

							vector.copy( vertices[ indices[ k ] ] ).applyMatrix4( matrixWorld );

              if(
                typeof object.obj.geometry.attributes.skinIndex !== 'undefined' &&
                typeof object.obj.geometry.attributes.skinWeight !== 'undefined' &&
                typeof object.obj.skeleton !== 'undefined'
              ){
                vector = this.boneTransform( object.obj , vertices[ indices[ k ] ] , indices[ k ] );
              }

							output += '\t\t\tvertex ' + vector.x + ' ' + vector.y + ' ' + vector.z + '\n';

						}

						output += '\t\tendloop\n';
						output += '\tendfacet\n';

					}

				}

				output += 'endsolid exported\n';

				return output;

			}

		};

	}() ),
	boneTransform: ( function() {

		var clone = new THREE.Vector3(), result = new THREE.Vector3(), skinIndices = new THREE.Vector4(), skinWeights = new THREE.Vector4();
		var temp = new THREE.Vector3(), tempMatrix = new THREE.Matrix4(), properties = [ 'x', 'y', 'z', 'w' ];

		return function( object, vertex, index ) {

			if ( object.geometry.isBufferGeometry ) {

				var index4 = index * 4;
				skinIndices.fromArray( object.geometry.attributes.skinIndex.array, index4 );
				skinWeights.fromArray( object.geometry.attributes.skinWeight.array, index4 );

			} else if ( object.geometry.isGeometry ) {

				skinIndices.copy( object.geometry.skinIndices[ index ] );
				skinWeights.copy( object.geometry.skinWeights[ index ] );

			}

			var clone = vertex.clone().applyMatrix4( object.bindMatrix ); result.set( 0, 0, 0 );

      for ( var i = 0; i < 4; i ++ ) {

        var skinWeight = skinWeights[ properties[ i ] ];

        if ( skinWeight != 0 ) {

          var boneIndex = skinIndices[ properties[ i ] ];
          tempMatrix.multiplyMatrices( object.skeleton.bones[ boneIndex ].matrixWorld, object.skeleton.boneInverses[ boneIndex ] );
          result.add( temp.copy( clone ).applyMatrix4( tempMatrix ).multiplyScalar( skinWeight ) );

        }

      }

			return clone.copy( result.applyMatrix4( object.bindMatrixInverse ) );

		};

	} )(),

};
