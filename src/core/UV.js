/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.UV = function ( u, v ) {

	this.set(

		u || 0,
		v || 0

	);

};

THREE.UV.prototype = {

	set : function ( u, v ) {

		this.u = u;
		this.v = v;

		return this;

	},

	copy : function ( uv ) {

		this.set(

			uv.u,
			uv.v

		);

		return this;

	}

};
