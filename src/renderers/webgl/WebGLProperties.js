/**
* @author fordacious / fordacious.github.io
*/

THREE.WebGLProperties = function () {

	var properties = {};

	this.delete = function ( object ) {

		delete properties[ object.uuid ];

	};

	this.get = function ( object ) {

		initObject( object );

		return properties[ object.uuid ];

	};

	function initObject ( object ) {

		if ( properties[ object.uuid ] === undefined ) {

			properties[ object.uuid ] = {};
		}

	}

};
