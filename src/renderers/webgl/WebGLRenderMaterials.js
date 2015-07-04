THREE.WebGLRenderMaterials = function () {

	//
	//	INITIALIZATION
	//

	function init() {

		registerRefreshLights();
		registerRefreshUniforms();

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


	//
	//	UNIFORMS
	//

	function registerRefreshUniforms() {

		THREE.extend( THREE.Material, '__refreshUniforms', refreshUniformsNoop );
		THREE.extend( THREE.LineBasicMaterial, '__refreshUniforms', refreshUniformsLine );
		THREE.extend( THREE.LineDashedMaterial, '__refreshUniforms', refreshUniformsDash );
		THREE.extend( THREE.PointCloudMaterial, '__refreshUniforms', refreshUniformsParticle );
		THREE.extend( THREE.MeshBasicMaterial, '__refreshUniforms', refreshUniformsBasic );
		THREE.extend( THREE.MeshLambertMaterial, '__refreshUniforms', refreshUniformsLambert );
		THREE.extend( THREE.MeshPhongMaterial, '__refreshUniforms', refreshUniformsPhong );
		THREE.extend( THREE.MeshDepthMaterial, '__refreshUniforms', refreshUniformsDepth );
		THREE.extend( THREE.MeshNormalMaterial, '__refreshUniforms', refreshUniformsNormal );

	}

	// Uniforms (refresh uniforms objects)

	function refreshUniformsCommon ( material, uniforms ) {

		uniforms.opacity.value = material.opacity;

		uniforms.diffuse.value = material.color;

		uniforms.map.value = material.map;
		uniforms.specularMap.value = material.specularMap;
		uniforms.alphaMap.value = material.alphaMap;

		if ( material.bumpMap ) {

			uniforms.bumpMap.value = material.bumpMap;
			uniforms.bumpScale.value = material.bumpScale;

		}

		if ( material.normalMap ) {

			uniforms.normalMap.value = material.normalMap;
			uniforms.normalScale.value.copy( material.normalScale );

		}

		// uv repeat and offset setting priorities
		// 1. color map
		// 2. specular map
		// 3. normal map
		// 4. bump map
		// 5. alpha map
		// 6. emissive map

		var uvScaleMap;

		if ( material.map ) {

			uvScaleMap = material.map;

		} else if ( material.specularMap ) {

			uvScaleMap = material.specularMap;

		} else if ( material.normalMap ) {

			uvScaleMap = material.normalMap;

		} else if ( material.bumpMap ) {

			uvScaleMap = material.bumpMap;

		} else if ( material.alphaMap ) {

			uvScaleMap = material.alphaMap;

		} else if ( material.emissiveMap ) {

			uvScaleMap = material.emissiveMap;

		}

		if ( uvScaleMap !== undefined ) {

			var offset = uvScaleMap.offset;
			var repeat = uvScaleMap.repeat;

			uniforms.offsetRepeat.value.set( offset.x, offset.y, repeat.x, repeat.y );

		}

		uniforms.envMap.value = material.envMap;
		uniforms.flipEnvMap.value = ( material.envMap instanceof THREE.WebGLRenderTargetCube ) ? 1 : - 1;

		uniforms.reflectivity.value = material.reflectivity;
		uniforms.refractionRatio.value = material.refractionRatio;

	}

	function refreshUniformsNoop ( renderer, uniforms ) {

	}

	function refreshUniformsLine ( renderer, uniforms ) {

		var material = this;

		uniforms.diffuse.value = material.color;
		uniforms.opacity.value = material.opacity;

	}

	function refreshUniformsDash ( renderer, uniforms ) {

		var material = this;
		refreshUniformsLine( renderer, uniforms );

		uniforms.dashSize.value = material.dashSize;
		uniforms.totalSize.value = material.dashSize + material.gapSize;
		uniforms.scale.value = material.scale;

	}

	function refreshUniformsParticle ( renderer, uniforms ) {

		var material = this;

		uniforms.psColor.value = material.color;
		uniforms.opacity.value = material.opacity;
		uniforms.size.value = material.size;
		uniforms.scale.value = _canvas.height / 2.0; // TODO: Cache this.

		uniforms.map.value = material.map;

		if ( material.map !== null ) {

			var offset = material.map.offset;
			var repeat = material.map.repeat;

			uniforms.offsetRepeat.value.set( offset.x, offset.y, repeat.x, repeat.y );

		}

	}

	function refreshUniformsBasic ( renderer, uniforms ) {

		var material = this;
		refreshUniformsCommon( material, uniforms );

		uniforms.aoMap.value = material.aoMap;
		uniforms.aoMapIntensity.value = material.aoMapIntensity;

	}

	function refreshUniformsLambert ( renderer, uniforms ) {

		var material = this;
		refreshUniformsCommon( material, uniforms );

		uniforms.emissive.value = material.emissive;

	}

	function refreshUniformsPhong ( renderer, uniforms ) {

		var material = this;
		refreshUniformsCommon( material, uniforms );

		uniforms.shininess.value = material.shininess;

		uniforms.emissive.value = material.emissive;
		uniforms.specular.value = material.specular;

		uniforms.lightMap.value = material.lightMap;
		uniforms.lightMapIntensity.value = material.lightMapIntensity;

		uniforms.aoMap.value = material.aoMap;
		uniforms.aoMapIntensity.value = material.aoMapIntensity;

		uniforms.emissiveMap.value = material.emissiveMap;

	}

	function refreshUniformsDepth ( renderer, uniforms ) {

		var material = this;
		uniforms.mNear.value = camera.near;
		uniforms.mFar.value = camera.far;
		uniforms.opacity.value = material.opacity;

	}

	function refreshUniformsNormal ( renderer, uniforms ) {

		var material = this;
		uniforms.opacity.value = material.opacity;

	}

	return {

		init: init,

	};

};
