/**
* @author fordacious / fordacious.github.io
*/

THREE.WebGLProperties = function () {

	var properties = {};

	this.get = function ( object ) {

		var uuid = object.uuid;
		var map = properties[ uuid ];

		if ( map === undefined ) {

			map = {};
			properties[ uuid ] = map;

		}

		return map;

	};

	this.delete = function ( object ) {

		delete properties[ object.uuid ];

	};

	this.clear = function () {

		properties = {};

	};

};
