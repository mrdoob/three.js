import {
	Color,
	FrontSide,
	Mesh,
	Vector3,
	NodeMaterial
} from 'three/webgpu';

import { Fn, abs, add, cameraPosition, cameraViewMatrix, clamp, div, inverseSqrt, normalize, positionWorld, smoothstep, sqrt, sub, time, texture, vec2, vec3, max, dot, uniform, reflector, mul, mix } from 'three/tsl';

/**
 * A basic flat, reflective water effect.
 *
 * Note that this class can only be used with {@link WebGPURenderer}.
 * When using {@link WebGLRenderer}, use {@link Water}.
 *
 * References:
 *
 * - [Flat mirror for three.js](https://github.com/Slayvin)
 * - [An implementation of water shader based on the flat mirror](https://home.adelphi.edu/~stemkoski/)
 * - [Water shader explanations in WebGL](http://29a.ch/slides/2012/webglwater/ )
 *
 * @augments Mesh
 * @three_import import { WaterMesh } from 'three/addons/objects/WaterMesh.js';
 */
class WaterMesh extends Mesh {

	/**
	 * Constructs a new water mesh.
	 *
	 * @param {BufferGeometry} geometry - The water mesh's geometry.
	 * @param {WaterMesh~Options} [options] - The configuration options.
	 */
	constructor( geometry, options = {} ) {

		const material = new NodeMaterial();

		super( geometry, material );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isWaterMesh = true;

		// Uniforms

		/**
		 * The water's normal map.
		 *
		 * @type {TextureNode}
		 */
		this.waterNormals = texture( options.waterNormals );

		/**
		 * The alpha value.
		 *
		 * @type {UniformNode<float>}
		 * @default 1
		 */
		this.alpha = uniform( options.alpha !== undefined ? options.alpha : 1.0 );

		/**
		 * The size value.
		 *
		 * @type {UniformNode<float>}
		 * @default 1
		 */
		this.size = uniform( options.size !== undefined ? options.size : 1.0 );

		/**
		 * The sun color.
		 *
		 * @type {UniformNode<color>}
		 * @default 0xffffff
		 */
		this.sunColor = uniform( new Color( options.sunColor !== undefined ? options.sunColor : 0xffffff ) );

		/**
		 * The sun direction.
		 *
		 * @type {UniformNode<vec3>}
		 * @default (0.70707,0.70707,0.0)
		 */
		this.sunDirection = uniform( options.sunDirection !== undefined ? options.sunDirection : new Vector3( 0.70707, 0.70707, 0.0 ) );

		/**
		 * The water color.
		 *
		 * @type {UniformNode<color>}
		 * @default 0x7f7f7f
		 */
		this.waterColor = uniform( new Color( options.waterColor !== undefined ? options.waterColor : 0x7f7f7f ) );

		/**
		 * The distortion scale.
		 *
		 * @type {UniformNode<float>}
		 * @default 20
		 */
		this.distortionScale = uniform( options.distortionScale !== undefined ? options.distortionScale : 20.0 );

		// TSL

		const getNoise = Fn( ( [ uv ] ) => {

			const offset = time;

			const r1 = vec2( uv.x.mul( 0.8 ).sub( uv.y.mul( 0.6 ) ), uv.x.mul( 0.6 ).add( uv.y.mul( 0.8 ) ) );
			const r2 = vec2( uv.x.mul( 0.38461538 ).add( uv.y.mul( 0.92307692 ) ), uv.y.mul( 0.38461538 ).sub( uv.x.mul( 0.92307692 ) ) );
			const r3 = vec2( uv.y.mul( 0.88235294 ).sub( uv.x.mul( 0.47058824 ) ), uv.y.mul( - 0.47058824 ).sub( uv.x.mul( 0.88235294 ) ) );

			const uv0 = uv.mul( 1 / 960 ).add( offset.mul( vec2( 0.011, 0.010 ) ) ).add( vec2( 0.13, 0.37 ) ).toVar();
			const uv1 = r1.mul( 1 / 290 ).add( offset.mul( vec2( 0.021, - 0.018 ) ) ).add( vec2( 0.41, 0.73 ) ).toVar();
			const uv2 = r2.mul( 1 / 97 ).add( offset.mul( vec2( - 0.034, 0.036 ) ) ).add( vec2( 0.67, 0.19 ) ).toVar();
			const uv3 = r3.mul( 1 / 31 ).add( offset.mul( vec2( 0.058, - 0.064 ) ) ).add( vec2( 0.83, 0.53 ) ).toVar();

			const noise = this.waterNormals.sample( uv0 ).mul( 0.16 )
				.add( this.waterNormals.sample( uv1 ).mul( 0.30 ) )
				.add( this.waterNormals.sample( uv2 ).mul( 0.34 ) )
				.add( this.waterNormals.sample( uv3 ).mul( 0.20 ) );

			return noise.mul( 2.0 ).sub( 1.0 );

		} );

		const noise = getNoise( positionWorld.xz.mul( this.size ) );
		const rawNormal = normalize( noise.xzy.mul( vec3( 1.5, 1.0, 1.5 ) ) );

		const worldToEye = cameraPosition.sub( positionWorld );
		const invDistance = inverseSqrt( dot( worldToEye, worldToEye ) );
		const eyeDirection = worldToEye.mul( invDistance );

		const NoV = dot( eyeDirection, rawNormal );
		const surfaceNormal = normalize( rawNormal.add( eyeDirection.mul( max( 0.0, sub( 0.02, NoV ) ) ) ) );

		const NoL = max( dot( surfaceNormal, this.sunDirection ), 0.0 );

		const halfVector = normalize( this.sunDirection.add( eyeDirection ) );
		const NoH = max( dot( surfaceNormal, halfVector ), 0.0 );
		const clampedNoV = max( dot( surfaceNormal, eyeDirection ), 0.001 );
		const VoH = max( dot( eyeDirection, halfVector ), 0.0 );

		const roughness = sub( 0.14, invDistance.mul( 0.095 ).div( invDistance.add( 0.004 ) ) );
		const a = roughness.mul( roughness );
		const a2 = a.mul( a );
		const d = NoH.mul( a2 ).sub( NoH ).mul( NoH ).add( 1.0 );
		const D = a2.div( d.mul( d ).mul( 3.14159265 ).add( 1e-7 ) );

		const Vis = div( 0.5, mix( NoL.mul( clampedNoV ).mul( 2.0 ), NoL.add( clampedNoV ), a ) );

		const oneMinusVoH = sub( 1.0, VoH );
		const oneMinusVoH2 = oneMinusVoH.mul( oneMinusVoH );
		const F = add( 0.02, mul( 0.98, oneMinusVoH2.mul( oneMinusVoH2 ).mul( oneMinusVoH ) ) );

		const sunFade = smoothstep( - 0.02, 0.02, this.sunDirection.y );
		const spec = D.mul( Vis ).mul( F ).mul( NoL ).mul( sunFade ).mul( 3.0 );
		const specularLight = spec.div( spec.mul( 0.08 ).add( 1.0 ) ).mul( this.sunColor );

		const viewRight = vec2( cameraViewMatrix[ 0 ].x, cameraViewMatrix[ 2 ].x );
		const normalTilt = vec2(
			surfaceNormal.x.mul( viewRight.x ).add( surfaceNormal.z.mul( viewRight.y ) ),
			surfaceNormal.z.mul( viewRight.x ).sub( surfaceNormal.x.mul( viewRight.y ) )
		);
		const grazing = clamp( eyeDirection.y.mul( 3.0 ), 0.0, 1.0 );
		const reflTilt = vec2(
			normalTilt.x.mul( max( eyeDirection.y, 0.15 ) ),
			mix( abs( normalTilt.y ), normalTilt.y, grazing )
		);
		const distortion = vec2( reflTilt.x.negate(), reflTilt.y ).mul( add( 0.001, invDistance ) ).mul( this.distortionScale );

		const mirrorSampler = reflector( {
			resolutionScale: options.resolutionScale !== undefined ? options.resolutionScale : 0.5,
			bounces: false
		} );
		mirrorSampler.uvNode = mirrorSampler.uvNode.add( distortion );
		this.add( mirrorSampler.target );

		this._reflector = mirrorSampler.reflector;

		// Material

		material.side = options.side !== undefined ? options.side : FrontSide;
		material.fog = options.fog === true;
		material.transparent = options.alpha !== undefined && options.alpha < 1.0;

		material.opacityNode = this.alpha;

		material.colorNode = Fn( () => {

			const theta = max( dot( eyeDirection, surfaceNormal ), 0.0 );
			const oneMinusTheta = sub( 1.0, theta );
			const oneMinusTheta2 = oneMinusTheta.mul( oneMinusTheta );
			const reflectance = add( 0.02, mul( 0.98, oneMinusTheta2.mul( oneMinusTheta2 ).mul( oneMinusTheta ) ) );

			const twilight = smoothstep( - 0.1, 0.05, this.sunDirection.y );
			const upwelling = this.waterColor.mul( this.sunColor ).mul( twilight.mul( add( 0.35, max( this.sunDirection.y, 0.0 ).mul( 0.65 ) ) ).mul( add( 0.35, theta.mul( 0.65 ) ) ) );
			const crestSlope = max( 0.0, normalTilt.y );
			const backSun = max( 0.0, dot( eyeDirection.negate(), normalize( this.sunDirection.add( vec3( surfaceNormal.x, 0.0, surfaceNormal.z ).mul( 0.6 ) ) ) ) );
			const backSun2 = backSun.mul( backSun );
			const sssFactor = crestSlope.mul( backSun2.mul( backSun2 ) ).mul( twilight );
			const subsurface = upwelling.add( sqrt( max( this.waterColor, vec3( 0.0 ) ) ).mul( this.sunColor ).mul( sssFactor.mul( 0.35 ) ) );

			const albedo = mix( subsurface, mirrorSampler.rgb, reflectance ).add( specularLight );

			return albedo;

		} )();

	}

	/**
	 * The effect's resolution scale.
	 *
	 * @type {number}
	 * @default 0.5
	 */
	get resolutionScale() {

		return this._reflector.resolutionScale;

	}

	set resolutionScale( value ) {

		this._reflector.resolutionScale = value;

	}

}

/**
 * Constructor options of `WaterMesh`.
 *
 * @typedef {Object} WaterMesh~Options
 * @property {number} [resolutionScale=0.5] - The resolution scale.
 * @property {?Texture} [waterNormals=null] - The water's normal map.
 * @property {number} [alpha=1] - The alpha value.
 * @property {number} [size=1] - The size value.
 * @property {number|Color|string} [sunColor=0xffffff] - The sun color.
 * @property {Vector3} [sunDirection=(0.70707,0.70707,0.0)] - The sun direction.
 * @property {number|Color|string} [waterColor=0x7F7F7F] - The water color.
 * @property {number} [distortionScale=20] - The distortion scale.
 * @property {(FrontSide|BackSide|DoubleSide)} [side=FrontSide] - The water material's `side` property.
 * @property {boolean} [fog=false] - Whether the water should be affected by fog or not.
 **/

export { WaterMesh };
