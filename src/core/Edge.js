/**
 * @author alteredq / http://alteredqualia.com/
 * @author mikael emtinger / http://gomo.se/
 */

THREE.Edge = function( v1, v2, vi1, vi2 ) {

	this.vertices = [ v1, v2 ]; // vertex references
	this.vertexIndices = [ vi1, vi2 ]; // vertex indices

	this.faces = []; // face references
	this.faceIndices = [];	// face indices

};
