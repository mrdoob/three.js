/**
* @author mrdoob / http://mrdoob.com/
*/

THREE.WebGLLights = function () {

	var lights = {};

	this.get = function ( light ) {

		if ( lights[ light.id ] !== undefined ) {

			return lights[ light.id ];

		}

		var uniforms;

		switch ( light.type ) {

			case 'HemisphereLight':
				uniforms = {
					direction: new THREE.Vector3(),
					skyColor: new THREE.Color(),
					groundColor: new THREE.Color()
				};
				break;

			case 'DirectionalLight':
				uniforms = {
					direction: new THREE.Vector3(),
					color: new THREE.Color(),
					shadow: - 1
				};
				break;

			case 'PointLight':
				uniforms = {
					position: new THREE.Vector3(),
					color: new THREE.Color(),
					distance: 0,
					decay: 0,
					shadow: - 1
				};
				break;

			case 'SpotLight':
				uniforms = {
					position: new THREE.Vector3(),
					direction: new THREE.Vector3(),
					color: new THREE.Color(),
					distance: 0,
					angleCos: 0,
					exponent: 0,
					decay: 0,
					shadow: - 1
				};
				break;

		}

		lights[ light.id ] = uniforms;

		return uniforms;

	};

};
