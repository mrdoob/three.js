/**
 * Uniforms library for shared webgl shaders
 */

THREE.UniformsLib = {

	common: {

		"diffuse": { value: new THREE.Color( 0xeeeeee ) },
		"opacity": { value: 1.0 },

		"map": { value: null },
		"offsetRepeat": { value: new THREE.Vector4( 0, 0, 1, 1 ) },

		"specularMap": { value: null },
		"alphaMap": { value: null },

		"envMap": { value: null },
		"flipEnvMap": { value: - 1 },
		"reflectivity": { value: 1.0 },
		"refractionRatio": { value: 0.98 }

	},

	aomap: {

		"aoMap": { value: null },
		"aoMapIntensity": { value: 1 }

	},

	lightmap: {

		"lightMap": { value: null },
		"lightMapIntensity": { value: 1 }

	},

	emissivemap: {

		"emissiveMap": { value: null }

	},

	bumpmap: {

		"bumpMap": { value: null },
		"bumpScale": { value: 1 }

	},

	normalmap: {

		"normalMap": { value: null },
		"normalScale": { value: new THREE.Vector2( 1, 1 ) }

	},

	displacementmap: {

		"displacementMap": { value: null },
		"displacementScale": { value: 1 },
		"displacementBias": { value: 0 }

	},

	roughnessmap: {

		"roughnessMap": { value: null }

	},

	metalnessmap: {

		"metalnessMap": { value: null }

	},

	fog: {

		"fogDensity": { value: 0.00025 },
		"fogNear": { value: 1 },
		"fogFar": { value: 2000 },
		"fogColor": { value: new THREE.Color( 0xffffff ) }

	},

	lights: {

		"ambientLightColor": { value: [] },

		"directionalLights": { value: [], properties: {
			"direction": {},
			"color": {},

			"shadow": {},
			"shadowBias": {},
			"shadowRadius": {},
			"shadowMapSize": {}
		} },

		"directionalShadowMap": { value: [] },
		"directionalShadowMatrix": { value: [] },

		"spotLights": { value: [], properties: {
			"color": {},
			"position": {},
			"direction": {},
			"distance": {},
			"coneCos": {},
			"penumbraCos": {},
			"decay": {},

			"shadow": {},
			"shadowBias": {},
			"shadowRadius": {},
			"shadowMapSize": {}
		} },

		"spotShadowMap": { value: [] },
		"spotShadowMatrix": { value: [] },

		"pointLights": { value: [], properties: {
			"color": {},
			"position": {},
			"decay": {},
			"distance": {},

			"shadow": {},
			"shadowBias": {},
			"shadowRadius": {},
			"shadowMapSize": {}
		} },

		"pointShadowMap": { value: [] },
		"pointShadowMatrix": { value: [] },

		"hemisphereLights": { value: [], properties: {
			"direction": {},
			"skyColor": {},
			"groundColor": {}
		} }

	},

	points: {

		"diffuse": { value: new THREE.Color( 0xeeeeee ) },
		"opacity": { value: 1.0 },
		"size": { value: 1.0 },
		"scale": { value: 1.0 },
		"map": { value: null },
		"offsetRepeat": { value: new THREE.Vector4( 0, 0, 1, 1 ) }

	}

};
