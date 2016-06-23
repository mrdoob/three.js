/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.Uniform = function ( type, value ) {

	this.type = type;
	this.value = value;

	this.dynamic = false;

};

THREE.Uniform.prototype = {

	constructor: THREE.Uniform,

	onUpdate: function ( callback ) {

		this.dynamic = true;
		this.onUpdateCallback = callback;

		return this;

	}

};
