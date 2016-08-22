/**
 * @author fordacious / fordacious.github.io
 */

function WebGLProperties() {

	var properties = {};

	return {

		get: function ( object ) {

			var uuid = object.uuid;
			var map = properties[ uuid ];

			if ( map === undefined ) {

				map = {};
				properties[ uuid ] = map;

			}

			return map;

		},

		delete: function ( object ) {

			delete properties[ object.uuid ];

		},

		clear: function () {

			properties = {};

		}

	};

}

export { WebGLProperties };
