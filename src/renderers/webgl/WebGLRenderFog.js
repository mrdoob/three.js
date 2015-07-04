THREE.WebGLRenderFog = function () {

	//
	//	INITIALIZATION
	//

	function init() {

		registerFog();

	}

	function registerFog() {

		THREE.extend( THREE.Fog, '__refreshUniformsFog', refreshUniformsFog );
		THREE.extend( THREE.FogExp2, '__refreshUniformsFog', refreshUniformsFogExp2 );

	}
	

	//
	//	FOG
	//

	function refreshUniformsFog ( renderer, uniforms ) {

		var fog = this;

		uniforms.fogColor.value = fog.color;
		uniforms.fogNear.value = fog.near;
		uniforms.fogFar.value = fog.far;

	}

	function refreshUniformsFogExp2 ( renderer, uniforms ) {

		var fog = this;

		uniforms.fogColor.value = fog.color;
		uniforms.fogDensity.value = fog.density;

	}

	return {

		init: init,

	};

};
