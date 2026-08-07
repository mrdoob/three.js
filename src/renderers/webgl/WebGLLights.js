import { colorCreate, colorMultiplyScalar } from '../../math/ColorFunctions.js';
import { mat4Copy, mat4Create, mat4ExtractRotation, mat4Identity, mat4PreMultiply } from '../../math/Matrix4Functions.js';
import { vec2Create } from '../../math/Vector2Functions.js';
import { vec3AddScaledVector, vec3ApplyMatrix4, vec3Create, vec3Set, vec3SetFromMatrixPosition, vec3Sub, vec3TransformDirection } from '../../math/Vector3Functions.js';
import { UniformsLib } from '../shaders/UniformsLib.js';
import { RGFormat } from '../../constants.js';

function UniformsCache() {

	const lights = {};

	return {

		get: function ( light ) {

			if ( lights[ light.id ] !== undefined ) {

				return lights[ light.id ];

			}

			let uniforms;

			switch ( light.type ) {

				case 'DirectionalLight':
					uniforms = {
						direction: vec3Create(),
						color: colorCreate()
					};
					break;

				case 'SpotLight':
					uniforms = {
						position: vec3Create(),
						direction: vec3Create(),
						color: colorCreate(),
						distance: 0,
						coneCos: 0,
						penumbraCos: 0,
						decay: 0
					};
					break;

				case 'PointLight':
					uniforms = {
						position: vec3Create(),
						color: colorCreate(),
						distance: 0,
						decay: 0
					};
					break;

				case 'HemisphereLight':
					uniforms = {
						direction: vec3Create(),
						skyColor: colorCreate(),
						groundColor: colorCreate()
					};
					break;

				case 'RectAreaLight':
					uniforms = {
						color: colorCreate(),
						position: vec3Create(),
						halfWidth: vec3Create(),
						halfHeight: vec3Create()
					};
					break;

			}

			lights[ light.id ] = uniforms;

			return uniforms;

		}

	};

}

function ShadowUniformsCache() {

	const lights = {};

	return {

		get: function ( light ) {

			if ( lights[ light.id ] !== undefined ) {

				return lights[ light.id ];

			}

			let uniforms;

			switch ( light.type ) {

				case 'DirectionalLight':
					uniforms = {
						shadowIntensity: 1,
						shadowBias: 0,
						shadowNormalBias: 0,
						shadowRadius: 1,
						shadowMapSize: vec2Create()
					};
					break;

				case 'SpotLight':
					uniforms = {
						shadowIntensity: 1,
						shadowBias: 0,
						shadowNormalBias: 0,
						shadowRadius: 1,
						shadowMapSize: vec2Create()
					};
					break;

				case 'PointLight':
					uniforms = {
						shadowIntensity: 1,
						shadowBias: 0,
						shadowNormalBias: 0,
						shadowRadius: 1,
						shadowMapSize: vec2Create(),
						shadowCameraNear: 1,
						shadowCameraFar: 1000
					};
					break;

				// TODO (abelnation): set RectAreaLight shadow uniforms

			}

			lights[ light.id ] = uniforms;

			return uniforms;

		}

	};

}



let nextVersion = 0;

function shadowCastingAndTexturingLightsFirst( lightA, lightB ) {

	return ( lightB.castShadow ? 2 : 0 ) - ( lightA.castShadow ? 2 : 0 ) + ( lightB.map ? 1 : 0 ) - ( lightA.map ? 1 : 0 );

}

function WebGLLights( extensions ) {

	const cache = new UniformsCache();

	const shadowCache = ShadowUniformsCache();

	const state = {

		version: 0,

		hash: {
			directionalLength: - 1,
			pointLength: - 1,
			spotLength: - 1,
			rectAreaLength: - 1,
			hemiLength: - 1,

			numDirectionalShadows: - 1,
			numPointShadows: - 1,
			numSpotShadows: - 1,
			numSpotMaps: - 1,

			numLightProbes: - 1
		},

		ambient: [ 0, 0, 0 ],
		probe: [],
		directional: [],
		directionalShadow: [],
		directionalShadowMap: [],
		directionalShadowMatrix: [],
		spot: [],
		spotLightMap: [],
		spotShadow: [],
		spotShadowMap: [],
		spotLightMatrix: [],
		rectArea: [],
		rectAreaLTC1: null,
		rectAreaLTC2: null,
		point: [],
		pointShadow: [],
		pointShadowMap: [],
		pointShadowMatrix: [],
		hemi: [],
		numSpotLightShadowsWithMaps: 0,
		numLightProbes: 0

	};

	for ( let i = 0; i < 9; i ++ ) state.probe.push( vec3Create() );

	const vector3 = vec3Create();
	const matrix4 = mat4Create();
	const matrix42 = mat4Create();

	function setup( lights ) {

		let r = 0, g = 0, b = 0;

		for ( let i = 0; i < 9; i ++ ) vec3Set( state.probe[ i ], 0, 0, 0 );

		let directionalLength = 0;
		let pointLength = 0;
		let spotLength = 0;
		let rectAreaLength = 0;
		let hemiLength = 0;

		let numDirectionalShadows = 0;
		let numPointShadows = 0;
		let numSpotShadows = 0;
		let numSpotMaps = 0;
		let numSpotShadowsWithMaps = 0;

		let numLightProbes = 0;

		// ordering : [shadow casting + map texturing, map texturing, shadow casting, none ]
		lights.sort( shadowCastingAndTexturingLightsFirst );

		for ( let i = 0, l = lights.length; i < l; i ++ ) {

			const light = lights[ i ];

			const color = light.color;
			const intensity = light.intensity;
			const distance = light.distance;

			let shadowMap = null;

			if ( light.shadow && light.shadow.map ) {

				if ( light.shadow.map.texture.format === RGFormat ) {

					// VSM uses color texture with blurred mean/std_dev
					shadowMap = light.shadow.map.texture;

				} else {

					// Other types use depth texture
					shadowMap = light.shadow.map.depthTexture || light.shadow.map.texture;

				}

			}

			if ( light.isAmbientLight ) {

				r += color.r * intensity;
				g += color.g * intensity;
				b += color.b * intensity;

			} else if ( light.isLightProbe ) {

				for ( let j = 0; j < 9; j ++ ) {

					vec3AddScaledVector( state.probe[ j ], light.sh.coefficients[ j ], intensity, state.probe[ j ] );

				}

				numLightProbes ++;

			} else if ( light.isDirectionalLight ) {

				const uniforms = cache.get( light );

				colorMultiplyScalar( light.color, light.intensity, uniforms.color );

				if ( light.castShadow ) {

					const shadow = light.shadow;

					const shadowUniforms = shadowCache.get( light );

					shadowUniforms.shadowIntensity = shadow.intensity;
					shadowUniforms.shadowBias = shadow.bias;
					shadowUniforms.shadowNormalBias = shadow.normalBias;
					shadowUniforms.shadowRadius = shadow.radius;
					shadowUniforms.shadowMapSize = shadow.mapSize;

					state.directionalShadow[ directionalLength ] = shadowUniforms;
					state.directionalShadowMap[ directionalLength ] = shadowMap;
					state.directionalShadowMatrix[ directionalLength ] = light.shadow.matrix;

					numDirectionalShadows ++;

				}

				state.directional[ directionalLength ] = uniforms;

				directionalLength ++;

			} else if ( light.isSpotLight ) {

				const uniforms = cache.get( light );

				vec3SetFromMatrixPosition( light.matrixWorld, uniforms.position );

				colorMultiplyScalar( color, intensity, uniforms.color );
				uniforms.distance = distance;

				uniforms.coneCos = Math.cos( light.angle );
				uniforms.penumbraCos = Math.cos( light.angle * ( 1 - light.penumbra ) );
				uniforms.decay = light.decay;

				state.spot[ spotLength ] = uniforms;

				const shadow = light.shadow;

				if ( light.map ) {

					state.spotLightMap[ numSpotMaps ] = light.map;
					numSpotMaps ++;

					// make sure the lightMatrix is up to date
					// TODO : do it if required only
					shadow.updateMatrices( light );

					if ( light.castShadow ) numSpotShadowsWithMaps ++;

				}

				state.spotLightMatrix[ spotLength ] = shadow.matrix;

				if ( light.castShadow ) {

					const shadowUniforms = shadowCache.get( light );

					shadowUniforms.shadowIntensity = shadow.intensity;
					shadowUniforms.shadowBias = shadow.bias;
					shadowUniforms.shadowNormalBias = shadow.normalBias;
					shadowUniforms.shadowRadius = shadow.radius;
					shadowUniforms.shadowMapSize = shadow.mapSize;

					state.spotShadow[ spotLength ] = shadowUniforms;
					state.spotShadowMap[ spotLength ] = shadowMap;

					numSpotShadows ++;

				}

				spotLength ++;

			} else if ( light.isRectAreaLight ) {

				const uniforms = cache.get( light );

				colorMultiplyScalar( color, intensity, uniforms.color );

				vec3Set( uniforms.halfWidth, light.width * 0.5, 0.0, 0.0 );
				vec3Set( uniforms.halfHeight, 0.0, light.height * 0.5, 0.0 );

				state.rectArea[ rectAreaLength ] = uniforms;

				rectAreaLength ++;

			} else if ( light.isPointLight ) {

				const uniforms = cache.get( light );

				colorMultiplyScalar( light.color, light.intensity, uniforms.color );
				uniforms.distance = light.distance;
				uniforms.decay = light.decay;

				if ( light.castShadow ) {

					const shadow = light.shadow;

					const shadowUniforms = shadowCache.get( light );

					shadowUniforms.shadowIntensity = shadow.intensity;
					shadowUniforms.shadowBias = shadow.bias;
					shadowUniforms.shadowNormalBias = shadow.normalBias;
					shadowUniforms.shadowRadius = shadow.radius;
					shadowUniforms.shadowMapSize = shadow.mapSize;
					shadowUniforms.shadowCameraNear = shadow.camera.near;
					shadowUniforms.shadowCameraFar = shadow.camera.far;

					state.pointShadow[ pointLength ] = shadowUniforms;
					state.pointShadowMap[ pointLength ] = shadowMap;
					state.pointShadowMatrix[ pointLength ] = light.shadow.matrix;

					numPointShadows ++;

				}

				state.point[ pointLength ] = uniforms;

				pointLength ++;

			} else if ( light.isHemisphereLight ) {

				const uniforms = cache.get( light );

				colorMultiplyScalar( light.color, intensity, uniforms.skyColor );
				colorMultiplyScalar( light.groundColor, intensity, uniforms.groundColor );

				state.hemi[ hemiLength ] = uniforms;

				hemiLength ++;

			}

		}

		if ( rectAreaLength > 0 ) {

			if ( extensions.has( 'OES_texture_float_linear' ) === true ) {

				state.rectAreaLTC1 = UniformsLib.LTC_FLOAT_1;
				state.rectAreaLTC2 = UniformsLib.LTC_FLOAT_2;

			} else {

				state.rectAreaLTC1 = UniformsLib.LTC_HALF_1;
				state.rectAreaLTC2 = UniformsLib.LTC_HALF_2;

			}

		}

		state.ambient[ 0 ] = r;
		state.ambient[ 1 ] = g;
		state.ambient[ 2 ] = b;

		const hash = state.hash;

		if ( hash.directionalLength !== directionalLength ||
			hash.pointLength !== pointLength ||
			hash.spotLength !== spotLength ||
			hash.rectAreaLength !== rectAreaLength ||
			hash.hemiLength !== hemiLength ||
			hash.numDirectionalShadows !== numDirectionalShadows ||
			hash.numPointShadows !== numPointShadows ||
			hash.numSpotShadows !== numSpotShadows ||
			hash.numSpotMaps !== numSpotMaps ||
			hash.numLightProbes !== numLightProbes ) {

			state.directional.length = directionalLength;
			state.spot.length = spotLength;
			state.rectArea.length = rectAreaLength;
			state.point.length = pointLength;
			state.hemi.length = hemiLength;

			state.directionalShadow.length = numDirectionalShadows;
			state.directionalShadowMap.length = numDirectionalShadows;
			state.pointShadow.length = numPointShadows;
			state.pointShadowMap.length = numPointShadows;
			state.spotShadow.length = numSpotShadows;
			state.spotShadowMap.length = numSpotShadows;
			state.directionalShadowMatrix.length = numDirectionalShadows;
			state.pointShadowMatrix.length = numPointShadows;
			state.spotLightMatrix.length = numSpotShadows + numSpotMaps - numSpotShadowsWithMaps;
			state.spotLightMap.length = numSpotMaps;
			state.numSpotLightShadowsWithMaps = numSpotShadowsWithMaps;
			state.numLightProbes = numLightProbes;

			hash.directionalLength = directionalLength;
			hash.pointLength = pointLength;
			hash.spotLength = spotLength;
			hash.rectAreaLength = rectAreaLength;
			hash.hemiLength = hemiLength;

			hash.numDirectionalShadows = numDirectionalShadows;
			hash.numPointShadows = numPointShadows;
			hash.numSpotShadows = numSpotShadows;
			hash.numSpotMaps = numSpotMaps;

			hash.numLightProbes = numLightProbes;

			state.version = nextVersion ++;

		}

	}

	function setupView( lights, camera ) {

		let directionalLength = 0;
		let pointLength = 0;
		let spotLength = 0;
		let rectAreaLength = 0;
		let hemiLength = 0;

		const viewMatrix = camera.matrixWorldInverse;

		for ( let i = 0, l = lights.length; i < l; i ++ ) {

			const light = lights[ i ];

			if ( light.isDirectionalLight ) {

				const uniforms = state.directional[ directionalLength ];

				vec3SetFromMatrixPosition( light.matrixWorld, uniforms.direction );
				vec3SetFromMatrixPosition( light.target.matrixWorld, vector3 );
				vec3Sub( uniforms.direction, vector3, uniforms.direction );
				vec3TransformDirection( uniforms.direction, viewMatrix, uniforms.direction );

				directionalLength ++;

			} else if ( light.isSpotLight ) {

				const uniforms = state.spot[ spotLength ];

				vec3SetFromMatrixPosition( light.matrixWorld, uniforms.position );
				vec3ApplyMatrix4( uniforms.position, viewMatrix, uniforms.position );

				vec3SetFromMatrixPosition( light.matrixWorld, uniforms.direction );
				vec3SetFromMatrixPosition( light.target.matrixWorld, vector3 );
				vec3Sub( uniforms.direction, vector3, uniforms.direction );
				vec3TransformDirection( uniforms.direction, viewMatrix, uniforms.direction );

				spotLength ++;

			} else if ( light.isRectAreaLight ) {

				const uniforms = state.rectArea[ rectAreaLength ];

				vec3SetFromMatrixPosition( light.matrixWorld, uniforms.position );
				vec3ApplyMatrix4( uniforms.position, viewMatrix, uniforms.position );

				// extract local rotation of light to derive width/height half vectors
				mat4Identity( matrix42 );
				mat4Copy( light.matrixWorld, matrix4 );
				mat4PreMultiply( matrix4, viewMatrix, matrix4 );
				mat4ExtractRotation( matrix4, matrix42 );

				vec3Set( uniforms.halfWidth, light.width * 0.5, 0.0, 0.0 );
				vec3Set( uniforms.halfHeight, 0.0, light.height * 0.5, 0.0 );

				vec3ApplyMatrix4( uniforms.halfWidth, matrix42, uniforms.halfWidth );
				vec3ApplyMatrix4( uniforms.halfHeight, matrix42, uniforms.halfHeight );

				rectAreaLength ++;

			} else if ( light.isPointLight ) {

				const uniforms = state.point[ pointLength ];

				vec3SetFromMatrixPosition( light.matrixWorld, uniforms.position );
				vec3ApplyMatrix4( uniforms.position, viewMatrix, uniforms.position );

				pointLength ++;

			} else if ( light.isHemisphereLight ) {

				const uniforms = state.hemi[ hemiLength ];

				vec3SetFromMatrixPosition( light.matrixWorld, uniforms.direction );
				vec3TransformDirection( uniforms.direction, viewMatrix, uniforms.direction );

				hemiLength ++;

			}

		}

	}

	return {
		setup: setup,
		setupView: setupView,
		state: state
	};

}


export { WebGLLights };
