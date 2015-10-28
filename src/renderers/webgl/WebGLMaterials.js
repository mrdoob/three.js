/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.WebGLMaterials = function () {

	var properties = {};

	this.get = function ( material ) {

		var uuid = material.uuid;
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
