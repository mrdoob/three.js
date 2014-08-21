/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.Script = function ( source ) {

	this.uuid = THREE.Math.generateUUID();
	this.source = source;

};

THREE.Script.prototype = {

	constructor: THREE.Script,

	clone: function () {

		return new THREE.Script( this.source );

	}

};