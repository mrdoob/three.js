/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.Vertex = function ( position ) {

	this.position = position || new THREE.Vector3();

};

THREE.Vertex.prototype = {

	constructor: THREE.Vertex,

	clone: function () {

		return new THREE.Vertex( this.position.clone() );

	}

};
