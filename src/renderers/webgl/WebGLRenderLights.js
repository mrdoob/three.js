THREE.WebGLRenderLights = function () {

	function init() {

		registerRefreshShadow();

	}

	function registerRefreshShadow() {

		THREE.extend( THREE.Light, '__refreshUniformsShadow', refreshShadowNoop );
		THREE.extend( THREE.SpotLight, '__refreshUniformsShadow', refreshShadowSpot );
		THREE.extend( THREE.DirectionalLight, '__refreshUniformsShadow', refreshShadowDirectional );

	}


	//
	//	SHADOWS
	//


	function refreshShadowNoop ( renderer, uniforms, lightIndex ) {

		return false;

	}

	function refreshShadowSpot ( renderer, uniforms, lightIndex ) {

		var light = this;

		if ( ! light.castShadow ) return false;

		uniforms.shadowMap.value[ lightIndex ] = light.shadowMap;
		uniforms.shadowMapSize.value[ lightIndex ] = light.shadowMapSize;

		uniforms.shadowMatrix.value[ lightIndex ] = light.shadowMatrix;

		uniforms.shadowDarkness.value[ lightIndex ] = light.shadowDarkness;
		uniforms.shadowBias.value[ lightIndex ] = light.shadowBias;

		return true;

	}

	function refreshShadowDirectional ( renderer, uniforms, lightIndex ) {

		var light = this;

		if ( ! light.castShadow || light.shadowCascade ) return false;

		uniforms.shadowMap.value[ lightIndex ] = light.shadowMap;
		uniforms.shadowMapSize.value[ lightIndex ] = light.shadowMapSize;

		uniforms.shadowMatrix.value[ lightIndex ] = light.shadowMatrix;

		uniforms.shadowDarkness.value[ lightIndex ] = light.shadowDarkness;
		uniforms.shadowBias.value[ lightIndex ] = light.shadowBias;

		return true;

	}

	return {

		init: init,

	};

};
