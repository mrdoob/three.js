/**
* @author fordacious / fordacious.github.io
*/

module.exports = WebGLProperties;

function WebGLProperties() {

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

}
