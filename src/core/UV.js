/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.UV = function ( u, v ) {

	this.u = u || 0;
	this.v = v || 0;

};

THREE.UV.prototype = {

	copy: function ( uv ) {

		this.u = uv.u;
		this.v = uv.v;

	},

	toString: function () {

		return 'THREE.UV (' + this.u + ', ' + this.v + ')';

	}

}
