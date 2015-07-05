/**
* @author fordacious / fordacious.github.io
*/

THREE.WebGLProperties = function () {

	var properties = {};

	this.get = function ( object ) {

		if ( properties[ object.uuid ] === undefined ) {

			properties[ object.uuid ] = {};

		}

		return properties[ object.uuid ];

	};

	this.delete = function ( object ) {

		delete properties[ object.uuid ];

	};

	this.clear = function () {

		properties = {};

	};

};
