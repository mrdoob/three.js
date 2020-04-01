/**
 * @author mrdoob / http://mrdoob.com/
 */

import { Color } from '../../math/Color.js';
import { Matrix4 } from '../../math/Matrix4.js';
import { Vector2 } from '../../math/Vector2.js';
import { Vector3 } from '../../math/Vector3.js';

class UniformsCache {

	constructor() {

		this.lights = {};

	}

	get( light ) {

		if ( this.lights[ light.id ] !== undefined ) {

			return this.lights[ light.id ];

		}

		var uniforms;

		switch ( light.type ) {

			case 'DirectionalLight':
				uniforms = {
					direction: new Vector3(),
					color: new Color()
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
					decay: 0
				};
				break;

			case 'PointLight':
				uniforms = {
					position: new Vector3(),
					color: new Color(),
					distance: 0,
					decay: 0
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
				};
				break;

		}

		this.lights[ light.id ] = uniforms;

		return uniforms;

	}

}

class ShadowUniformsCache {

	constructor() {

		this.lights = {};

	}

	get( light ) {

		if ( this.lights[ light.id ] !== undefined ) {

			return this.lights[ light.id ];

		}

		var uniforms;

		switch ( light.type ) {

			case 'DirectionalLight':
				uniforms = {
					shadowBias: 0,
					shadowRadius: 1,
					shadowMapSize: new Vector2()
				};
				break;

			case 'SpotLight':
				uniforms = {
					shadowBias: 0,
					shadowRadius: 1,
					shadowMapSize: new Vector2()
				};
				break;

			case 'PointLight':
				uniforms = {
					shadowBias: 0,
					shadowRadius: 1,
					shadowMapSize: new Vector2(),
					shadowCameraNear: 1,
					shadowCameraFar: 1000
				};
				break;

			// TODO (abelnation): set RectAreaLight shadow uniforms

		}

		this.lights[ light.id ] = uniforms;

		return uniforms;

	}

}

function shadowCastingLightsFirst( lightA, lightB ) {

	return ( lightB.castShadow ? 1 : 0 ) - ( lightA.castShadow ? 1 : 0 );

}

class WebGLLights {

	constructor() {

		this.nextVersion = 0;
		this.cache = new UniformsCache();

		this.shadowCache = new ShadowUniformsCache();

		this.state = {

			version: 0,

			hash: {
				directionalLength: - 1,
				pointLength: - 1,
				spotLength: - 1,
				rectAreaLength: - 1,
				hemiLength: - 1,

				numDirectionalShadows: - 1,
				numPointShadows: - 1,
				numSpotShadows: - 1
			},

			ambient: [ 0, 0, 0 ],
			probe: [],
			directional: [],
			directionalShadow: [],
			directionalShadowMap: [],
			directionalShadowMatrix: [],
			spot: [],
			spotShadow: [],
			spotShadowMap: [],
			spotShadowMatrix: [],
			rectArea: [],
			point: [],
			pointShadow: [],
			pointShadowMap: [],
			pointShadowMatrix: [],
			hemi: []

		};

		for ( var i = 0; i < 9; i ++ ) this.state.probe.push( new Vector3() );

		this.vector3 = new Vector3();
		this.matrix4 = new Matrix4();
		this.matrix42 = new Matrix4();

	}

	setup( lights, shadows, camera ) {

		var r = 0, g = 0, b = 0;

		for ( var i = 0; i < 9; i ++ ) this.state.probe[ i ].set( 0, 0, 0 );

		var directionalLength = 0;
		var pointLength = 0;
		var spotLength = 0;
		var rectAreaLength = 0;
		var hemiLength = 0;

		var numDirectionalShadows = 0;
		var numPointShadows = 0;
		var numSpotShadows = 0;

		var viewMatrix = camera.matrixWorldInverse;

		lights.sort( shadowCastingLightsFirst );

		for ( var i = 0, l = lights.length; i < l; i ++ ) {

			var light = lights[ i ];

			var color = light.color;
			var intensity = light.intensity;
			var distance = light.distance;

			var shadowMap = ( light.shadow && light.shadow.map ) ? light.shadow.map.texture : null;

			if ( light.isAmbientLight ) {

				r += color.r * intensity;
				g += color.g * intensity;
				b += color.b * intensity;

			} else if ( light.isLightProbe ) {

				for ( var j = 0; j < 9; j ++ ) {

					this.state.probe[ j ].addScaledVector( light.sh.coefficients[ j ], intensity );

				}

			} else if ( light.isDirectionalLight ) {

				var uniforms = this.cache.get( light );

				uniforms.color.copy( light.color ).multiplyScalar( light.intensity );
				uniforms.direction.setFromMatrixPosition( light.matrixWorld );
				this.vector3.setFromMatrixPosition( light.target.matrixWorld );
				uniforms.direction.sub( this.vector3 );
				uniforms.direction.transformDirection( viewMatrix );

				if ( light.castShadow ) {

					var shadow = light.shadow;

					var shadowUniforms = this.shadowCache.get( light );

					shadowUniforms.shadowBias = shadow.bias;
					shadowUniforms.shadowRadius = shadow.radius;
					shadowUniforms.shadowMapSize = shadow.mapSize;

					this.state.directionalShadow[ directionalLength ] = shadowUniforms;
					this.state.directionalShadowMap[ directionalLength ] = shadowMap;
					this.state.directionalShadowMatrix[ directionalLength ] = light.shadow.matrix;

					numDirectionalShadows ++;

				}

				this.state.directional[ directionalLength ] = uniforms;

				directionalLength ++;

			} else if ( light.isSpotLight ) {

				var uniforms = this.cache.get( light );

				uniforms.position.setFromMatrixPosition( light.matrixWorld );
				uniforms.position.applyMatrix4( viewMatrix );

				uniforms.color.copy( color ).multiplyScalar( intensity );
				uniforms.distance = distance;

				uniforms.direction.setFromMatrixPosition( light.matrixWorld );
				this.vector3.setFromMatrixPosition( light.target.matrixWorld );
				uniforms.direction.sub( this.vector3 );
				uniforms.direction.transformDirection( viewMatrix );

				uniforms.coneCos = Math.cos( light.angle );
				uniforms.penumbraCos = Math.cos( light.angle * ( 1 - light.penumbra ) );
				uniforms.decay = light.decay;

				if ( light.castShadow ) {

					var shadow = light.shadow;

					var shadowUniforms = this.shadowCache.get( light );

					shadowUniforms.shadowBias = shadow.bias;
					shadowUniforms.shadowRadius = shadow.radius;
					shadowUniforms.shadowMapSize = shadow.mapSize;

					this.state.spotShadow[ spotLength ] = shadowUniforms;
					this.state.spotShadowMap[ spotLength ] = shadowMap;
					this.state.spotShadowMatrix[ spotLength ] = light.shadow.matrix;

					numSpotShadows ++;

				}

				this.state.spot[ spotLength ] = uniforms;

				spotLength ++;

			} else if ( light.isRectAreaLight ) {

				var uniforms = this.cache.get( light );

				// (a) intensity is the total visible light emitted
				//uniforms.color.copy( color ).multiplyScalar( intensity / ( light.width * light.height * Math.PI ) );

				// (b) intensity is the brightness of the light
				uniforms.color.copy( color ).multiplyScalar( intensity );

				uniforms.position.setFromMatrixPosition( light.matrixWorld );
				uniforms.position.applyMatrix4( viewMatrix );

				// extract local rotation of light to derive width/height half vectors
				this.matrix42.identity();
				this.matrix4.copy( light.matrixWorld );
				this.matrix4.premultiply( viewMatrix );
				this.matrix42.extractRotation( this.matrix4 );

				uniforms.halfWidth.set( light.width * 0.5, 0.0, 0.0 );
				uniforms.halfHeight.set( 0.0, light.height * 0.5, 0.0 );

				uniforms.halfWidth.applyMatrix4( this.matrix42 );
				uniforms.halfHeight.applyMatrix4( this.matrix42 );

				// TODO (abelnation): RectAreaLight distance?
				// uniforms.distance = distance;

				this.state.rectArea[ rectAreaLength ] = uniforms;

				rectAreaLength ++;

			} else if ( light.isPointLight ) {

				var uniforms = this.cache.get( light );

				uniforms.position.setFromMatrixPosition( light.matrixWorld );
				uniforms.position.applyMatrix4( viewMatrix );

				uniforms.color.copy( light.color ).multiplyScalar( light.intensity );
				uniforms.distance = light.distance;
				uniforms.decay = light.decay;

				if ( light.castShadow ) {

					var shadow = light.shadow;

					var shadowUniforms = this.shadowCache.get( light );

					shadowUniforms.shadowBias = shadow.bias;
					shadowUniforms.shadowRadius = shadow.radius;
					shadowUniforms.shadowMapSize = shadow.mapSize;
					shadowUniforms.shadowCameraNear = shadow.camera.near;
					shadowUniforms.shadowCameraFar = shadow.camera.far;

					this.state.pointShadow[ pointLength ] = shadowUniforms;
					this.state.pointShadowMap[ pointLength ] = shadowMap;
					this.state.pointShadowMatrix[ pointLength ] = light.shadow.matrix;

					numPointShadows ++;

				}

				this.state.point[ pointLength ] = uniforms;

				pointLength ++;

			} else if ( light.isHemisphereLight ) {

				var uniforms = this.cache.get( light );

				uniforms.direction.setFromMatrixPosition( light.matrixWorld );
				uniforms.direction.transformDirection( viewMatrix );
				uniforms.direction.normalize();

				uniforms.skyColor.copy( light.color ).multiplyScalar( intensity );
				uniforms.groundColor.copy( light.groundColor ).multiplyScalar( intensity );

				this.state.hemi[ hemiLength ] = uniforms;

				hemiLength ++;

			}

		}

		this.state.ambient[ 0 ] = r;
		this.state.ambient[ 1 ] = g;
		this.state.ambient[ 2 ] = b;

		var hash = this.state.hash;

		if ( hash.directionalLength !== directionalLength ||
			hash.pointLength !== pointLength ||
			hash.spotLength !== spotLength ||
			hash.rectAreaLength !== rectAreaLength ||
			hash.hemiLength !== hemiLength ||
			hash.numDirectionalShadows !== numDirectionalShadows ||
			hash.numPointShadows !== numPointShadows ||
			hash.numSpotShadows !== numSpotShadows ) {

			this.state.directional.length = directionalLength;
			this.state.spot.length = spotLength;
			this.state.rectArea.length = rectAreaLength;
			this.state.point.length = pointLength;
			this.state.hemi.length = hemiLength;

			this.state.directionalShadow.length = numDirectionalShadows;
			this.state.directionalShadowMap.length = numDirectionalShadows;
			this.state.pointShadow.length = numPointShadows;
			this.state.pointShadowMap.length = numPointShadows;
			this.state.spotShadow.length = numSpotShadows;
			this.state.spotShadowMap.length = numSpotShadows;
			this.state.directionalShadowMatrix.length = numDirectionalShadows;
			this.state.pointShadowMatrix.length = numPointShadows;
			this.state.spotShadowMatrix.length = numSpotShadows;

			hash.directionalLength = directionalLength;
			hash.pointLength = pointLength;
			hash.spotLength = spotLength;
			hash.rectAreaLength = rectAreaLength;
			hash.hemiLength = hemiLength;

			hash.numDirectionalShadows = numDirectionalShadows;
			hash.numPointShadows = numPointShadows;
			hash.numSpotShadows = numSpotShadows;

			this.state.version = this.nextVersion ++;

		}

	}

}


export { WebGLLights };
