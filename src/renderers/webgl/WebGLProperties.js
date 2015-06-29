/**
* @author fordacious / fordacious.github.io
*/

THREE.WebGLProperties = function () {

	var properties = {};

	this.deleteProperties = function ( object ) {

		delete properties[ object.uuid ];

	};

	this.getProperties = function ( object ) {

		initObject( object );

		return properties[ object.uuid ];

	};

	this.propertiesExist = function ( object ) {

		return properties[ object.uuid ] !== undefined;

	}

	function initObject ( object ) {

		if ( properties[ object.uuid ] === undefined ) {

			properties[ object.uuid ] = {};

		}

	}

};
