import {
	Color,
	FrontSide,
	Mesh,
	Vector3,
	NodeMaterial
} from 'three/webgpu';

import { Fn, add, cameraPosition, cameraViewMatrix, inverseSqrt, normalize, positionWorld, sub, time, texture, vec2, vec3, max, dot, reflect, pow, uniform, reflector, mul, mix } from 'three/tsl';

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
		 * If `material.transparent` is not set to `true` (automatically enabled when constructed with `alpha < 1`),
		 * the water will remain fully opaque.
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

			const uv0 = uv.mul( 1 / 103 ).add( offset.mul( vec2( 1 / 17, 1 / 29 ) ) ).toVar();
			const uv1 = uv.mul( 1 / 107 ).sub( offset.mul( vec2( - 1 / 19, 1 / 31 ) ) ).toVar();
			const uv2 = uv.mul( vec2( 1 / 8907.0, 1 / 9803.0 ) ).add( offset.mul( vec2( 1 / 101, 1 / 97 ) ) ).toVar();
			const uv3 = uv.mul( vec2( 1 / 1091.0, 1 / 1027.0 ) ).sub( offset.mul( vec2( 1 / 109, - 1 / 113 ) ) ).toVar();

			const sample0 = this.waterNormals.sample( uv0 );
			const sample1 = this.waterNormals.sample( uv1 );
			const sample2 = this.waterNormals.sample( uv2 );
			const sample3 = this.waterNormals.sample( uv3 );

			const noise = sample0.add( sample1 ).add( sample2 ).add( sample3 );

			return noise.mul( 0.5 ).sub( 1 );

		} );

		const noise = getNoise( positionWorld.xz.mul( this.size ) );
		const surfaceNormal = normalize( noise.xzy.mul( vec3( 1.5, 1.0, 1.5 ) ) );

		const worldToEye = cameraPosition.sub( positionWorld );
		const invDistance = inverseSqrt( dot( worldToEye, worldToEye ) );
		const eyeDirection = worldToEye.mul( invDistance );

		const reflection = reflect( this.sunDirection.negate(), surfaceNormal );
		const direction = max( 0.0, dot( eyeDirection, reflection ) );
		const specularLight = pow( direction, 100 ).mul( this.sunColor ).mul( 2.0 );
		const diffuseLight = max( dot( this.sunDirection, surfaceNormal ), 0.0 ).mul( this.sunColor ).mul( 0.5 );

		const viewRight = vec2( cameraViewMatrix[ 0 ].x, cameraViewMatrix[ 2 ].x );
		const normalTilt = vec2(
			surfaceNormal.x.mul( viewRight.x ).add( surfaceNormal.z.mul( viewRight.y ) ),
			surfaceNormal.z.mul( viewRight.x ).sub( surfaceNormal.x.mul( viewRight.y ) )
		);
		const distortion = vec2( normalTilt.x.negate(), normalTilt.y ).mul( add( 0.001, invDistance ) ).mul( this.distortionScale );

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
			const scatter = this.waterColor.mul( theta );
			const albedo = mix( diffuseLight.mul( 0.3 ).add( scatter ), mirrorSampler.rgb.add( specularLight ), reflectance );

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
