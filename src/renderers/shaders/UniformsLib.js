/**
 * Uniforms library for shared webgl shaders
 */

THREE.UniformsLib = {

	common: {

		"diffuse" : { type: "c", value: new THREE.Color( 0xeeeeee ) },
		"opacity" : { type: "f", value: 1.0 },

		"map" : { type: "t", value: null },
		"offsetRepeat" : { type: "v4", value: new THREE.Vector4( 0, 0, 1, 1 ) },

		"specularMap" : { type: "t", value: null },
		"alphaMap" : { type: "t", value: null },

		"envMap" : { type: "t", value: null },
		"flipEnvMap" : { type: "f", value: - 1 },
		"reflectivity" : { type: "f", value: 1.0 },
		"refractionRatio" : { type: "f", value: 0.98 }

	},

	aomap: {

		"aoMap" : { type: "t", value: null },
		"aoMapIntensity" : { type: "f", value: 1 },

	},

	lightmap: {

		"lightMap" : { type: "t", value: null },
		"lightMapIntensity" : { type: "f", value: 1 },

	},

	emissivemap: {

		"emissiveMap" : { type: "t", value: null },

	},

	bumpmap: {

		"bumpMap" : { type: "t", value: null },
		"bumpScale" : { type: "f", value: 1 }

	},

	normalmap: {

		"normalMap" : { type: "t", value: null },
		"normalScale" : { type: "v2", value: new THREE.Vector2( 1, 1 ) }

	},

	displacementmap: {

		"displacementMap" : { type: "t", value: null },
		"displacementScale" : { type: "f", value: 1 },
		"displacementBias" : { type: "f", value: 0 }

	},

	fog : {

		"fogDensity" : { type: "f", value: 0.00025 },
		"fogNear" : { type: "f", value: 1 },
		"fogFar" : { type: "f", value: 2000 },
		"fogColor" : { type: "c", value: new THREE.Color( 0xffffff ) }

	},

	lights: {

		"ambientLightColor" : { type: "fv", value: [] },

		"directionalLightDirection" : { type: "fv", value: [] },
		"directionalLightColor" : { type: "fv", value: [] },

		"hemisphereLightDirection" : { type: "fv", value: [], array: 'hemisphereLights', property: 'direction' },
		"hemisphereLightSkyColor" : { type: "fv", value: [], array: 'hemisphereLights', property: 'skyColor' },
		"hemisphereLightGroundColor" : { type: "fv", value: [], array: 'hemisphereLights', property: 'groundColor' },

		"pointLightColor" : { type: "fv", value: [], array: 'pointLights', property: 'color' },
		"pointLightPosition" : { type: "fv", value: [], array: 'pointLights', property: 'position' },
		"pointLightDistance" : { type: "fv1", value: [], array: 'pointLights', property: 'distance' },
		"pointLightDecay" : { type: "fv1", value: [], array: 'pointLights', property: 'decay' },

		"spotLightColor" : { type: "fv", value: [], array: 'spotLights', property: 'color' },
		"spotLightPosition" : { type: "fv", value: [], array: 'spotLights', property: 'position' },
		"spotLightDirection" : { type: "fv", value: [], array: 'spotLights', property: 'direction' },
		"spotLightDistance" : { type: "fv1", value: [], array: 'spotLights', property: 'distance' },
		"spotLightAngleCos" : { type: "fv1", value: [], array: 'spotLights', property: 'angleCos' },
		"spotLightExponent" : { type: "fv1", value: [], array: 'spotLights', property: 'exponent' },
		"spotLightDecay" : { type: "fv1", value: [], array: 'spotLights', property: 'decay' }

	},

	points: {

		"psColor" : { type: "c", value: new THREE.Color( 0xeeeeee ) },
		"opacity" : { type: "f", value: 1.0 },
		"size" : { type: "f", value: 1.0 },
		"scale" : { type: "f", value: 1.0 },
		"map" : { type: "t", value: null },
		"offsetRepeat" : { type: "v4", value: new THREE.Vector4( 0, 0, 1, 1 ) },

		"fogDensity" : { type: "f", value: 0.00025 },
		"fogNear" : { type: "f", value: 1 },
		"fogFar" : { type: "f", value: 2000 },
		"fogColor" : { type: "c", value: new THREE.Color( 0xffffff ) }

	},

	shadowmap: {

		"shadowMap": { type: "tv", value: [] },
		"shadowMapSize": { type: "v2v", value: [] },

		"shadowBias" : { type: "fv1", value: [] },
		"shadowDarkness": { type: "fv1", value: [] },

		"shadowMatrix" : { type: "m4v", value: [] }

	}

};
