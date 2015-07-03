THREE.WebGLRenderMaterials = function () {

	//
	//	INITIALIZATION
	//

	function init() {

		registerRefreshLights();

	}


	//
	//	LIGHTS
	//

	function registerRefreshLights() {

		function hasLightsCommon() {

			return this.lights;

		}

		function isLambertOrPhong() {

			return true;

		}

		THREE.extend( THREE.Material, '__supportsLights', hasLightsCommon );
		THREE.extend( THREE.MeshLambertMaterial, '__supportsLights', isLambertOrPhong );
		THREE.extend( THREE.MeshPhongMaterial, '__supportsLights', isLambertOrPhong );

	}

	return {

		init: init,

	};

};
