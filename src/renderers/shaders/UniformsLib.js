/**
 * Uniforms library for shared webgl shaders
 */

THREE.UniformsLib = {

	common: {

		"diffuse": { type: "c", value: new THREE.Color( 0xeeeeee ) },
		"opacity": { type: "f", value: 1.0 },

		"map": { type: "t", value: null },
		"offsetRepeat": { type: "v4", value: new THREE.Vector4( 0, 0, 1, 1 ) },

		"specularMap": { type: "t", value: null },
		"alphaMap": { type: "t", value: null },

		"envMap": { type: "t", value: null },
		"flipEnvMap": { type: "f", value: - 1 },
		"reflectivity": { type: "f", value: 1.0 },
		"refractionRatio": { type: "f", value: 0.98 }

	},

	aomap: {

		"aoMap": { type: "t", value: null },
		"aoMapIntensity": { type: "f", value: 1 }

	},

	lightmap: {

		"lightMap": { type: "t", value: null },
		"lightMapIntensity": { type: "f", value: 1 }

	},

	emissivemap: {

		"emissiveMap": { type: "t", value: null },

	},

	bumpmap: {

		"bumpMap": { type: "t", value: null },
		"bumpScale": { type: "f", value: 1 }

	},

	normalmap: {

		"normalMap": { type: "t", value: null },
		"normalScale": { type: "v2", value: new THREE.Vector2( 1, 1 ) }

	},

	displacementmap: {

		"displacementMap": { type: "t", value: null },
		"displacementScale": { type: "f", value: 1 },
		"displacementBias": { type: "f", value: 0 }

	},

	roughnessmap: {

		"roughnessMap": { type: "t", value: null }

	},

	metalnessmap: {

		"metalnessMap": { type: "t", value: null }

	},

	fog: {

		"fogDensity": { type: "f", value: 0.00025 },
		"fogNear": { type: "f", value: 1 },
		"fogFar": { type: "f", value: 2000 },
		"fogColor": { type: "c", value: new THREE.Color( 0xffffff ) }

	},

	ambient: {

		"ambientLightColor": { type: "fv", value: [] }

	},

	lights: {

		"directionalLights": { type: "sa", value: [], properties: {
			"direction": { type: "v3" },
			"color": { type: "c" },

			"shadow": { type: "i" },
			"shadowBias": { type: "f" },
			"shadowRadius": { type: "f" },
			"shadowMapSize": { type: "v2" }
		} },

		"directionalShadowMap": { type: "tv", value: [] },
		"directionalShadowMatrix": { type: "m4v", value: [] },

		"spotLights": { type: "sa", value: [], properties: {
			"color": { type: "c" },
			"position": { type: "v3" },
			"direction": { type: "v3" },
			"distance": { type: "f" },
			"coneCos": { type: "f" },
			"penumbraCos": { type: "f" },
			"decay": { type: "f" },

			"shadow": { type: "i" },
			"shadowBias": { type: "f" },
			"shadowRadius": { type: "f" },
			"shadowMapSize": { type: "v2" }
		} },

		"spotShadowMap": { type: "tv", value: [] },
		"spotShadowMatrix": { type: "m4v", value: [] },

		"pointLights": { type: "sa", value: [], properties: {
			"color": { type: "c" },
			"position": { type: "v3" },
			"decay": { type: "f" },
			"distance": { type: "f" },

			"shadow": { type: "i" },
			"shadowBias": { type: "f" },
			"shadowRadius": { type: "f" },
			"shadowMapSize": { type: "v2" }
		} },

		"pointShadowMap": { type: "tv", value: [] },
		"pointShadowMatrix": { type: "m4v", value: [] },

		"hemisphereLights": { type: "sa", value: [], properties: {
			"direction": { type: "v3" },
			"skyColor": { type: "c" },
			"groundColor": { type: "c" }
		} }

	},

	points: {

		"diffuse": { type: "c", value: new THREE.Color( 0xeeeeee ) },
		"opacity": { type: "f", value: 1.0 },
		"size": { type: "f", value: 1.0 },
		"scale": { type: "f", value: 1.0 },
		"map": { type: "t", value: null },
		"offsetRepeat": { type: "v4", value: new THREE.Vector4( 0, 0, 1, 1 ) }

	}

};
