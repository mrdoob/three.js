/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.OBJExporter = function () {};

THREE.OBJExporter.prototype = {

	constructor: THREE.OBJExporter,
	
	// offset values for multiple meshes
	vOffset: 0,
	vtOffset: 0,
	vnOffset: 0,

	output: '# obj generated from [application name] \n \n',

	parse: function ( geometry ) {

		console.log( geometry );

		var newOutput = '';

		// vertices
		
		for ( var i = 0, l = geometry.vertices.length; i < l; i ++ ) {

			var vertex = geometry.vertices[ i ];
			newOutput += 'v ' + vertex.x + ' ' + vertex.y + ' ' + vertex.z + '\n';

		}

		// normals
		
		for ( var i = 0, l = geometry.faces.length; i < l; i ++ ) {

			var normals = geometry.faces[ i ].vertexNormals;

			for ( var j = 0; j < normals.length; j ++ ) {

				var normal = normals[ j ];
				newOutput += 'vn ' + normal.x + ' ' + normal.y + ' ' + normal.z + '\n';

			}

		}

		// uvs
		
		for ( var i = 0, l = geometry.faceVertexUvs[ 0 ].length; i < l; i ++ ) {

			var vertexUvs = geometry.faceVertexUvs[ 0 ][ i ];

			for ( var j = 0; j < vertexUvs.length; j ++ ) {

				var uv = vertexUvs[ j ];
				newOutput += 'vt ' + uv.x + ' ' + uv.y + '\n';

			}

		}

		// faces
		
		for ( var i = 0, j = 1, l = geometry.faces.length; i < l; i ++, j += 3 ) {

			var face = geometry.faces[ i ];

			var vo = this.vOffset, vto = this.vtOffset, vno = this.vnOffset;

			newOutput += 'f ';
			newOutput += ( face.a + 1 + vo) + '/' + ( j + vto) + '/' + ( j + vno) + ' ';
			newOutput += ( face.b + 1 + vo) + '/' + ( j + 1 + vto) + '/' + ( j + 1 + vno) + ' ';
			newOutput += ( face.c + 1 + vo) + '/' + ( j + 2  + vto) + '/' + ( j + 2 + vno ) + '\n';

		}

		return newOutput;

	},

	parseMultiple: function( meshes ) {

		var numberOfMeshes = meshes.length;

		for ( var g = 0; g < numberOfMeshes; g++) {

			var currentGeometry = meshes[g];

			// include mesh name, if it is present
			this.output += currentGeometry.name || 'o mesh-' + g + '\n';

			this.output += this.parse( currentGeometry );

			// if there are multiple meshes
			// update offset values for next mesh export
			if (numberOfMeshes > 0) {

				this.vOffset += currentGeometry.vertices.length;
				this.vtOffset += (currentGeometry.faceVertexUvs[0].length * 3);
				this.vnOffset += (currentGeometry.faces.length * 3);

		    this.output += '\n';

			}
			
		}

		return this.output;
	}

}
