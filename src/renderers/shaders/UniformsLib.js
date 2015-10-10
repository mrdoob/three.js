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

		"directionalLightDirection" : { type: "v3sa", value: [], name: 'hemisphereLights', property: 'direction' },
		"directionalLightColor" : { type: "csa", value: [], name: 'hemisphereLights', property: 'direction' },

		"hemisphereLightDirection" : { type: "v3sa", value: [], name: 'hemisphereLights', property: 'direction' },
		"hemisphereLightSkyColor" : { type: "csa", value: [], name: 'hemisphereLights', property: 'skyColor' },
		"hemisphereLightGroundColor" : { type: "csa", value: [], name: 'hemisphereLights', property: 'groundColor' },

		"pointLightColor" : { type: "csa", value: [], name: 'pointLights', property: 'color' },
		"pointLightPosition" : { type: "v3sa", value: [], name: 'pointLights', property: 'position' },
		"pointLightDistance" : { type: "fsa", value: [], name: 'pointLights', property: 'distance' },
		"pointLightDecay" : { type: "fsa", value: [], name: 'pointLights', property: 'decay' },

		"spotLightColor" : { type: "csa", value: [], name: 'spotLights', property: 'color' },
		"spotLightPosition" : { type: "v3sa", value: [], name: 'spotLights', property: 'position' },
		"spotLightDirection" : { type: "v3sa", value: [], name: 'spotLights', property: 'direction' },
		"spotLightDistance" : { type: "fsa", value: [], name: 'spotLights', property: 'distance' },
		"spotLightAngleCos" : { type: "fsa", value: [], name: 'spotLights', property: 'angleCos' },
		"spotLightExponent" : { type: "fsa", value: [], name: 'spotLights', property: 'exponent' },
		"spotLightDecay" : { type: "fsa", value: [], name: 'spotLights', property: 'decay' }

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
