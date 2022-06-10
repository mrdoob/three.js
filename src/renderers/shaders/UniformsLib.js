import { Color } from '../../math/Color.js';
import { Vector2 } from '../../math/Vector2.js';
import { Matrix3 } from '../../math/Matrix3.js';

/**
 * Uniforms library for shared webgl shaders
 */

class UniformsLib {

	static common = {

		diffuse: { value: /*@__PURE__*/ new Color( 0xffffff ) },
		opacity: { value: 1.0 },

		map: { value: null },
		uvTransform: { value: /*@__PURE__*/ new Matrix3() },
		uv2Transform: { value: /*@__PURE__*/ new Matrix3() },

		alphaMap: { value: null },
		alphaTest: { value: 0 }

	};

	static specularmap = {

		specularMap: { value: null },

	};

	static envmap = {

		envMap: { value: null },
		flipEnvMap: { value: - 1 },
		reflectivity: { value: 1.0 }, // basic, lambert, phong
		ior: { value: 1.5 }, // physical
		refractionRatio: { value: 0.98 } // basic, lambert, phong

	};

	static aomap = {

		aoMap: { value: null },
		aoMapIntensity: { value: 1 }

	};

	static lightmap = {

		lightMap: { value: null },
		lightMapIntensity: { value: 1 }

	};

	static emissivemap = {

		emissiveMap: { value: null }

	};

	static bumpmap = {

		bumpMap: { value: null },
		bumpScale: { value: 1 }

	};

	static normalmap = {

		normalMap: { value: null },
		normalScale: { value: /*@__PURE__*/ new Vector2( 1, 1 ) }

	};

	static displacementmap = {

		displacementMap: { value: null },
		displacementScale: { value: 1 },
		displacementBias: { value: 0 }

	};

	static roughnessmap = {

		roughnessMap: { value: null }

	};

	static metalnessmap = {

		metalnessMap: { value: null }

	};

	static gradientmap = {

		gradientMap: { value: null }

	};

	static fog = {

		fogDensity: { value: 0.00025 },
		fogNear: { value: 1 },
		fogFar: { value: 2000 },
		fogColor: { value: /*@__PURE__*/ new Color( 0xffffff ) }

	};

	static lights = {

		ambientLightColor: { value: [] },

		lightProbe: { value: [] },

		directionalLights: { value: [], properties: {
			direction: {},
			color: {}
		} },

		directionalLightShadows: { value: [], properties: {
			shadowBias: {},
			shadowNormalBias: {},
			shadowRadius: {},
			shadowMapSize: {}
		} },

		directionalShadowMap: { value: [] },
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
			shadowBias: {},
			shadowNormalBias: {},
			shadowRadius: {},
			shadowMapSize: {}
		} },

		spotShadowMap: { value: [] },
		spotShadowMatrix: { value: [] },

		pointLights: { value: [], properties: {
			color: {},
			position: {},
			decay: {},
			distance: {}
		} },

		pointLightShadows: { value: [], properties: {
			shadowBias: {},
			shadowNormalBias: {},
			shadowRadius: {},
			shadowMapSize: {},
			shadowCameraNear: {},
			shadowCameraFar: {}
		} },

		pointShadowMap: { value: [] },
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

	};

	static points = {

		diffuse: { value: /*@__PURE__*/ new Color( 0xffffff ) },
		opacity: { value: 1.0 },
		size: { value: 1.0 },
		scale: { value: 1.0 },
		map: { value: null },
		alphaMap: { value: null },
		alphaTest: { value: 0 },
		uvTransform: { value: /*@__PURE__*/ new Matrix3() }

	};

	static sprite = {

		diffuse: { value: /*@__PURE__*/ new Color( 0xffffff ) },
		opacity: { value: 1.0 },
		center: { value: /*@__PURE__*/ new Vector2( 0.5, 0.5 ) },
		rotation: { value: 0.0 },
		map: { value: null },
		alphaMap: { value: null },
		alphaTest: { value: 0 },
		uvTransform: { value: /*@__PURE__*/ new Matrix3() }

	};

}

export { UniformsLib };
