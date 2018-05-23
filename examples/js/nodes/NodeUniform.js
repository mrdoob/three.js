/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.NodeUniform = function ( params ) {

	params = params || {};

	this.name = params.name;
	this.type = params.type;
	this.node = params.node;
	this.needsUpdate = params.needsUpdate;

};

Object.defineProperties( THREE.NodeUniform.prototype, {
	value: {
		get: function () {

			return this.node.value;

		},
		set: function ( val ) {

			this.node.value = val;

		}
	}
} );
