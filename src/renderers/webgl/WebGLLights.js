/**
 * @author mrdoob / http://mrdoob.com/
 */

import { Color } from '../../math/Color.js';
import { Matrix4 } from '../../math/Matrix4.js';
import { Vector2 } from '../../math/Vector2.js';
import { Vector3 } from '../../math/Vector3.js';
import { NumberOfLightTypes } from '../../constants.js';

function UniformsCache() {

	var lights = {};

	return {

		get: function ( light ) {

			if ( lights[ light.id ] !== undefined ) {

				return lights[ light.id ];

			}

			var uniforms;

			switch ( light.type ) {

				case 'DirectionalLight':
					uniforms = {
						direction: new Vector3(),
						color: new Color(),

						shadow: false,
						shadowBias: 0,
						shadowRadius: 1,
						shadowMapSize: new Vector2()
					};
					break;

				case 'SpotLight':
					uniforms = {
						position: new Vector3(),
						direction: new Vector3(),
						color: new Color(),
						distance: 0,
						coneCos: 0,
						penumbraCos: 0,
						decay: 0,

						shadow: false,
						shadowBias: 0,
						shadowRadius: 1,
						shadowMapSize: new Vector2()
					};
					break;

				case 'PointLight':
					uniforms = {
						position: new Vector3(),
						color: new Color(),
						distance: 0,
						decay: 0,

						shadow: false,
						shadowBias: 0,
						shadowRadius: 1,
						shadowMapSize: new Vector2(),
						shadowCameraNear: 1,
						shadowCameraFar: 1000
					};
					break;

				case 'HemisphereLight':
					uniforms = {
						direction: new Vector3(),
						skyColor: new Color(),
						groundColor: new Color()
					};
					break;

				case 'RectAreaLight':
					uniforms = {
						color: new Color(),
						position: new Vector3(),
						halfWidth: new Vector3(),
						halfHeight: new Vector3()
						// TODO (abelnation): set RectAreaLight shadow uniforms
					};
					break;

			}

			lights[ light.id ] = uniforms;

			return uniforms;

		}

	};

}

var nextVersion = 0;

function shadowCastingLightsFirst( lightA, lightB ) {

	return ( lightB.castShadow ? 1 : 0 ) - ( lightA.castShadow ? 1 : 0 );

}

function WebGLLights() {

	var cache = new UniformsCache();

	var state = {

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
		},

		config: new Uint16Array( 32 * NumberOfLightTypes ),
		ambientAffectedLayers: [],
		ambient: [ 0, 0, 0 ],
		probe: [],
		directional: [],
		directionalAffectedLayers: [],
		directionalShadowMap: [],
		directionalShadowMatrix: [],
		spot: [],
		spotAffectedLayers: [],
		spotShadowMap: [],
		spotShadowMatrix: [],
		rectArea: [],
		rectAreaAffectedLayers: [],
		point: [],
		pointAffectedLayers: [],
		pointShadowMap: [],
		pointShadowMatrix: [],
		hemi: [],
		hemiAffectedLayers: [],

		numDirectionalShadows: - 1,
		numPointShadows: - 1,
		numSpotShadows: - 1

	};

	for ( var i = 0; i < 9; i ++ ) state.probe.push( new Vector3() );

	var vector3 = new Vector3();
	var matrix4 = new Matrix4();
	var matrix42 = new Matrix4();

	function setup( lights, shadows, camera ) {


		for ( var i = 0; i < 9; i ++ ) state.probe[ i ].set( 0, 0, 0 );

		var directionalLength = 0;
		var pointLength = 0;
		var spotLength = 0;
		var rectAreaLength = 0;
		var hemiLength = 0;
		var ambientLength = 0;

		var numDirectionalShadows = 0;
		var numPointShadows = 0;
		var numSpotShadows = 0;

		var viewMatrix = camera.matrixWorldInverse;

		var affectedLayers;

		lights.sort( shadowCastingLightsFirst );

		for ( var i = 0, l = lights.length; i < l; i ++ ) {

			var light = lights[ i ];

			var color = light.color;
			var intensity = light.intensity;
			var distance = light.distance;

			affectedLayers = light.layers;

			var shadowMap = ( light.shadow && light.shadow.map ) ? light.shadow.map.texture : null;

			if ( light.isAmbientLight ) {

				color = color.clone().multiplyScalar( intensity );
				state.ambientAffectedLayers[ ambientLength ] = affectedLayers;
				state.ambient[ ambientLength ] = color;
				addLightToLightConfig( affectedLayers, state.config, 0, false );
				ambientLength ++;

			} else if ( light.isLightProbe ) {

				for ( var j = 0; j < 9; j ++ ) {

					state.probe[ j ].addScaledVector( light.sh.coefficients[ j ], intensity );

				}

			} else if ( light.isDirectionalLight ) {

				var uniforms = cache.get( light );

				uniforms.color.copy( light.color ).multiplyScalar( light.intensity );
				uniforms.direction.setFromMatrixPosition( light.matrixWorld );
				vector3.setFromMatrixPosition( light.target.matrixWorld );
				uniforms.direction.sub( vector3 );
				uniforms.direction.transformDirection( viewMatrix );

				uniforms.shadow = light.castShadow;

				if ( light.castShadow ) {

					var shadow = light.shadow;

					uniforms.shadowBias = shadow.bias;
					uniforms.shadowRadius = shadow.radius;
					uniforms.shadowMapSize = shadow.mapSize;

					state.directionalShadowMap[ directionalLength ] = shadowMap;
					state.directionalShadowMatrix[ directionalLength ] = light.shadow.matrix;

					numDirectionalShadows ++;

				}

				state.directionalAffectedLayers[ directionalLength ] = affectedLayers;
				state.directional[ directionalLength ] = uniforms;

				addLightToLightConfig( affectedLayers, state.config, 1, light.castShadow );
				directionalLength ++;

			} else if ( light.isSpotLight ) {

				var uniforms = cache.get( light );

				uniforms.position.setFromMatrixPosition( light.matrixWorld );
				uniforms.position.applyMatrix4( viewMatrix );

				uniforms.color.copy( color ).multiplyScalar( intensity );
				uniforms.distance = distance;

				uniforms.direction.setFromMatrixPosition( light.matrixWorld );
				vector3.setFromMatrixPosition( light.target.matrixWorld );
				uniforms.direction.sub( vector3 );
				uniforms.direction.transformDirection( viewMatrix );

				uniforms.coneCos = Math.cos( light.angle );
				uniforms.penumbraCos = Math.cos( light.angle * ( 1 - light.penumbra ) );
				uniforms.decay = light.decay;

				uniforms.shadow = light.castShadow;

				if ( light.castShadow ) {

					var shadow = light.shadow;

					uniforms.shadowBias = shadow.bias;
					uniforms.shadowRadius = shadow.radius;
					uniforms.shadowMapSize = shadow.mapSize;

					state.spotShadowMap[ spotLength ] = shadowMap;
					state.spotShadowMatrix[ spotLength ] = light.shadow.matrix;

					numSpotShadows ++;

				}

				state.spotAffectedLayers[ spotLength ] = affectedLayers;
				state.spot[ spotLength ] = uniforms;

				addLightToLightConfig( affectedLayers, state.config, 2, light.castShadow );
				spotLength ++;

			} else if ( light.isRectAreaLight ) {

				var uniforms = cache.get( light );

				// (a) intensity is the total visible light emitted
				//uniforms.color.copy( color ).multiplyScalar( intensity / ( light.width * light.height * Math.PI ) );

				// (b) intensity is the brightness of the light
				uniforms.color.copy( color ).multiplyScalar( intensity );

				uniforms.position.setFromMatrixPosition( light.matrixWorld );
				uniforms.position.applyMatrix4( viewMatrix );

				// extract local rotation of light to derive width/height half vectors
				matrix42.identity();
				matrix4.copy( light.matrixWorld );
				matrix4.premultiply( viewMatrix );
				matrix42.extractRotation( matrix4 );

				uniforms.halfWidth.set( light.width * 0.5, 0.0, 0.0 );
				uniforms.halfHeight.set( 0.0, light.height * 0.5, 0.0 );

				uniforms.halfWidth.applyMatrix4( matrix42 );
				uniforms.halfHeight.applyMatrix4( matrix42 );

				// TODO (abelnation): RectAreaLight distance?
				// uniforms.distance = distance;
				state.rectAreaAffectedLayers[ rectAreaLength ] = affectedLayers;
				state.rectArea[ rectAreaLength ] = uniforms;

				addLightToLightConfig( affectedLayers, state.config, 3, light.castShadow );
				rectAreaLength ++;

			} else if ( light.isPointLight ) {

				var uniforms = cache.get( light );

				uniforms.position.setFromMatrixPosition( light.matrixWorld );
				uniforms.position.applyMatrix4( viewMatrix );

				uniforms.color.copy( light.color ).multiplyScalar( light.intensity );
				uniforms.distance = light.distance;
				uniforms.decay = light.decay;

				uniforms.shadow = light.castShadow;

				if ( light.castShadow ) {

					var shadow = light.shadow;

					uniforms.shadowBias = shadow.bias;
					uniforms.shadowRadius = shadow.radius;
					uniforms.shadowMapSize = shadow.mapSize;
					uniforms.shadowCameraNear = shadow.camera.near;
					uniforms.shadowCameraFar = shadow.camera.far;

					state.pointShadowMap[ pointLength ] = shadowMap;
					state.pointShadowMatrix[ pointLength ] = light.shadow.matrix;

					numPointShadows ++;

				}

				state.pointAffectedLayers[ pointLength ] = affectedLayers;
				state.point[ pointLength ] = uniforms;

				addLightToLightConfig( affectedLayers, state.config, 4, light.castShadow );
				pointLength ++;

			} else if ( light.isHemisphereLight ) {

				var uniforms = cache.get( light );

				uniforms.direction.setFromMatrixPosition( light.matrixWorld );
				uniforms.direction.transformDirection( viewMatrix );
				uniforms.direction.normalize();

				uniforms.skyColor.copy( light.color ).multiplyScalar( intensity );
				uniforms.groundColor.copy( light.groundColor ).multiplyScalar( intensity );

				state.hemiAffectedLayers[ hemiLength ] = affectedLayers;
				state.hemi[ hemiLength ] = uniforms;

				addLightToLightConfig( affectedLayers, state.config, 5, light.castShadow );
				hemiLength ++;

			}

		}


		var hash = state.hash;

		if ( hash.directionalLength !== directionalLength ||
			hash.pointLength !== pointLength ||
			hash.spotLength !== spotLength ||
			hash.rectAreaLength !== rectAreaLength ||
			hash.hemiLength !== hemiLength ||
			hash.numDirectionalShadows !== numDirectionalShadows ||
			hash.numPointShadows !== numPointShadows ||
			hash.numSpotShadows !== numSpotShadows ) {

			state.ambient.length = ambientLength;
			state.directional.length = directionalLength;
			state.spot.length = spotLength;
			state.rectArea.length = rectAreaLength;
			state.point.length = pointLength;
			state.hemi.length = hemiLength;

			state.directionalShadowMap.length = numDirectionalShadows;
			state.pointShadowMap.length = numPointShadows;
			state.spotShadowMap.length = numSpotShadows;
			state.directionalShadowMatrix.length = numDirectionalShadows;
			state.pointShadowMatrix.length = numPointShadows;
			state.spotShadowMatrix.length = numSpotShadows;

			hash.directionalLength = directionalLength;
			hash.pointLength = pointLength;
			hash.spotLength = spotLength;
			hash.rectAreaLength = rectAreaLength;
			hash.hemiLength = hemiLength;
			hash.shadowsLength = shadows.length;

			hash.numDirectionalShadows = numDirectionalShadows;
			hash.numPointShadows = numPointShadows;
			hash.numSpotShadows = numSpotShadows;

			state.version = nextVersion ++;

		}

	}

	// Function used to count lights per type and per layer using a flat array.

	function addLightToLightConfig( layers, config, typeIndex, castShadow ) {

		var i = 0, mask = 0, index = 0;
		for ( i = 0; i < 32; i ++ ) {

			mask = 1 << i;
			if ( mask & layers.mask && castShadow ) {

				index = i * NumberOfLightTypes + typeIndex;
				config[ index ] ++;

			}

		}

	}

	return {
		setup: setup,
		state: state
	};

}


export { WebGLLights };
