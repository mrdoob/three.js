/**
 * @author kovacsv / http://kovacsv.hu/
 * @author mrdoob / http://mrdoob.com/
 * @author mudcube / http://mudcu.be/
 */
 
THREE.STLBinaryExporter = function () {};

THREE.STLBinaryExporter.prototype = {

	constructor: THREE.STLBinaryExporter,

	parse: ( function () {

		var vector = new THREE.Vector3();
		var normalMatrixWorld = new THREE.Matrix3();

		return function ( scene ) {

			var triangles = 0;
			scene.traverse( function ( object ) {
				if ( !(object instanceof THREE.Mesh) ) return;
				triangles += object.geometry.faces.length;
			});

			var offset = 80; // skip header
			var bufferLength = triangles * 2 + triangles * 3 * 4 * 4 + 80 + 4;
			var arrayBuffer = new ArrayBuffer(bufferLength);
			var output = new DataView(arrayBuffer);
			output.setUint32(offset, triangles, true); offset += 4;

			scene.traverse( function ( object ) {

				if ( !(object instanceof THREE.Mesh) ) return;
				if ( !(object.geometry instanceof THREE.Geometry )) return;

				var geometry = object.geometry;
				var matrixWorld = object.matrixWorld;

				var vertices = geometry.vertices;
				var faces = geometry.faces;

				normalMatrixWorld.getNormalMatrix( matrixWorld );

				for ( var i = 0, l = faces.length; i < l; i ++ ) {

					var face = faces[ i ];

					vector.copy( face.normal ).applyMatrix3( normalMatrixWorld ).normalize();

					output.setFloat32(offset, vector.x, true); offset += 4; // normal
					output.setFloat32(offset, vector.y, true); offset += 4;
					output.setFloat32(offset, vector.z, true); offset += 4;

					var indices = [ face.a, face.b, face.c ];

					for ( var j = 0; j < 3; j ++ ) {

						vector.copy( vertices[ indices[ j ] ] ).applyMatrix4( matrixWorld );

						output.setFloat32(offset, vector.x, true); offset += 4; // vertices
						output.setFloat32(offset, vector.y, true); offset += 4;
						output.setFloat32(offset, vector.z, true); offset += 4;

					}

					output.setUint16(offset, 0, true); offset += 2; // attribute byte count					

				}

			} );
			
			return output;

		};

	}() )

};