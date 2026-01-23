import { Color } from '../../math/Color.js';
import { Vector2 } from '../../math/Vector2.js';
import { Matrix3 } from '../../math/Matrix3.js';

// Uniforms library for shared webgl shaders
const UniformsLib = {

	common: {

		diffuse: { value: /*@__PURE__*/ new Color( 0xffffff ) },
		opacity: { value: 1.0 },

		map: { value: null },
		mapTransform: { value: /*@__PURE__*/ new Matrix3() },

		alphaMap: { value: null },
		alphaMapTransform: { value: /*@__PURE__*/ new Matrix3() },

		alphaTest: { value: 0 }

	},

	specularmap: {

		specularMap: { value: null },
		specularMapTransform: { value: /*@__PURE__*/ new Matrix3() }

	},

	envmap: {

		envMap: { value: null },
		envMapRotation: { value: /*@__PURE__*/ new Matrix3() },
		flipEnvMap: { value: - 1 },
		reflectivity: { value: 1.0 }, // basic, lambert, phong
		ior: { value: 1.5 }, // physical
		refractionRatio: { value: 0.98 }, // basic, lambert, phong
		dfgLUT: { value: null } // DFG LUT for physically-based rendering

	},

	aomap: {

		aoMap: { value: null },
		aoMapIntensity: { value: 1 },
		aoMapTransform: { value: /*@__PURE__*/ new Matrix3() }

	},

	lightmap: {

		lightMap: { value: null },
		lightMapIntensity: { value: 1 },
		lightMapTransform: { value: /*@__PURE__*/ new Matrix3() }

	},

	bumpmap: {

		bumpMap: { value: null },
		bumpMapTransform: { value: /*@__PURE__*/ new Matrix3() },
		bumpScale: { value: 1 }

	},

	normalmap: {

		normalMap: { value: null },
		normalMapTransform: { value: /*@__PURE__*/ new Matrix3() },
		normalScale: { value: /*@__PURE__*/ new Vector2( 1, 1 ) }

	},

	displacementmap: {

		displacementMap: { value: null },
		displacementMapTransform: { value: /*@__PURE__*/ new Matrix3() },
		displacementScale: { value: 1 },
		displacementBias: { value: 0 }

	},

	emissivemap: {

		emissiveMap: { value: null },
		emissiveMapTransform: { value: /*@__PURE__*/ new Matrix3() }

	},

	metalnessmap: {

		metalnessMap: { value: null },
		metalnessMapTransform: { value: /*@__PURE__*/ new Matrix3() }

	},

	roughnessmap: {

		roughnessMap: { value: null },
		roughnessMapTransform: { value: /*@__PURE__*/ new Matrix3() }

	},

	gradientmap: {

		gradientMap: { value: null }

	},

	fog: {

		fogDensity: { value: 0.00025 },
		fogNear: { value: 1 },
		fogFar: { value: 2000 },
		fogColor: { value: /*@__PURE__*/ new Color( 0xffffff ) }

	},

	lights: {

		ambientLightColor: { value: [] },

		lightProbe: { value: [] },

		directionalLights: { value: [], properties: {
			direction: {},
			color: {}
		} },

		directionalLightShadows: { value: [], properties: {
			shadowIntensity: 1,
			shadowBias: {},
			shadowNormalBias: {},
			shadowRadius: {},
			shadowMapSize: {}
		} },

		directionalShadowMatrix: { value: [] },

		spotLights: { value: [], properties: {
			color: {},
			position: {},
			direction: {},
			distance: {},
			coneCos: {},
			penumbraCos: {},
			decay: {}
		} },

		spotLightShadows: { value: [], properties: {
			shadowIntensity: 1,
			shadowBias: {},
			shadowNormalBias: {},
			shadowRadius: {},
			shadowMapSize: {}
		} },

		spotLightMap: { value: [] },
		spotLightMatrix: { value: [] },

		pointLights: { value: [], properties: {
			color: {},
			position: {},
			decay: {},
			distance: {}
		} },

		pointLightShadows: { value: [], properties: {
			shadowIntensity: 1,
			shadowBias: {},
			shadowNormalBias: {},
			shadowRadius: {},
			shadowMapSize: {},
			shadowCameraNear: {},
			shadowCameraFar: {}
		} },

		pointShadowMatrix: { value: [] },

		hemisphereLights: { value: [], properties: {
			direction: {},
			skyColor: {},
			groundColor: {}
		} },

		// TODO (abelnation): RectAreaLight BRDF data needs to be moved from example to main src
		rectAreaLights: { value: [], properties: {
			color: {},
			position: {},
			width: {},
			height: {}
		} },

		ltc_1: { value: null },
		ltc_2: { value: null }

	},

	points: {

		diffuse: { value: /*@__PURE__*/ new Color( 0xffffff ) },
		opacity: { value: 1.0 },
		size: { value: 1.0 },
		scale: { value: 1.0 },
		map: { value: null },
		alphaMap: { value: null },
		alphaMapTransform: { value: /*@__PURE__*/ new Matrix3() },
		alphaTest: { value: 0 },
		uvTransform: { value: /*@__PURE__*/ new Matrix3() }

	},

	sprite: {

		diffuse: { value: /*@__PURE__*/ new Color( 0xffffff ) },
		opacity: { value: 1.0 },
		center: { value: /*@__PURE__*/ new Vector2( 0.5, 0.5 ) },
		rotation: { value: 0.0 },
		map: { value: null },
		mapTransform: { value: /*@__PURE__*/ new Matrix3() },
		alphaMap: { value: null },
		alphaMapTransform: { value: /*@__PURE__*/ new Matrix3() },
		alphaTest: { value: 0 }

	}

};

export { UniformsLib };
