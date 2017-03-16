/**
 * @author TheCodeCrafter
 */

THREE.MAXConverter(source) {
	
	var container = new THREE.Group();
	
	var request = new XMLHttpRequest();
	request.open("GET", location + "/" + source);
	request.onreadystatechange = function () {
		if (request.readyState == 4) {
			 return handleLoadedModel(JSON.parse(request.responseText));
		}
	}
	request.send();

	var m = new THREE.Mesh(); // a global var to hold our model data

	function handleLoadedModel(object, renderer) {
		
		if ( object.vertices.length === 0 ) continue;

		var buffergeometry = new THREE.BufferGeometry();

		buffergeometry.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array( object.normals.length ), 3 ) );
		
		if ( geometry.normals.length > 0 ) {

				buffergeometry.addAttribute( 'normal', new THREE.BufferAttribute( new Float32Array( geometry.normals ), 3 ) ); ) );

			} else {

				buffergeometry.computeVertexNormals();

			}

			if ( geometry.uvs.length > 0 ) {

				buffergeometry.addAttribute( 'uv', new THREE.BufferAttribute( new Float32Array( geometry.uvs ), 2 ) );

			}
		
		var mesh;
		
		mesh = ( new THREE.Mesh( buffergeometry, new THREE.BasicMeshMaterial() ) );
		
		return mesh;
	}
}

/// USAGE:
// var model = new THREE.MaxConverter('objects/obj.3ds');
// Immediatly ready for scene addition using:
// scene.add(model);
