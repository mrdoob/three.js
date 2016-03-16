/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.Uniform = function ( type, value , shared ) {

	this.type = type;
	this.value = value;

	this.dynamic = false;

	this.shared = !!shared;

};

THREE.Uniform.prototype = {

	constructor: THREE.Uniform,

	onUpdate: function ( callback ) {

		this.dynamic = true;
		this.onUpdateCallback = callback;

		return this;

	}

};
