import {
	Color,
	Mesh,
	Vector2,
	Vector3,
	NodeMaterial,
	NodeUpdateType,
	Node
} from 'three/webgpu';

import { Fn, vec2, viewportSafeUV, viewportSharedTexture, reflector, float, abs, inverseSqrt, sub, texture, uniform, vec4, cameraPosition, cameraViewMatrix, positionWorld, uv, mix, vec3, normalize, max, dot, screenUV } from 'three/tsl';

/** @module Water2Mesh */

/**
 * An advanced water effect that supports reflections, refractions and flow maps.
 *
 * Note that this class can only be used with {@link WebGPURenderer}.
 * When using {@link WebGLRenderer}, use {@link module:Water2}.
 *
 * References:
 *
 * - {@link https://alex.vlachos.com/graphics/Vlachos-SIGGRAPH10-WaterFlow.pdf}
 * - {@link http://graphicsrunner.blogspot.de/2010/08/water-using-flow-maps.html}
 *
 * @augments Mesh
 * @three_import import { WaterMesh } from 'three/addons/objects/Water2Mesh.js';
 */
class WaterMesh extends Mesh {

	/**
	 * Constructs a new water mesh.
	 *
	 * @param {BufferGeometry} geometry - The water's geometry.
	 * @param {module:Water2Mesh~Options} [options] - The configuration options.
	 */
	constructor( geometry, options = {} ) {

		const material = new NodeMaterial();
		material.transparent = true;

		super( geometry, material );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isWater = true;

		material.colorNode = new WaterNode( options, this );

		this._reflector = material.colorNode._reflectionSampler.reflector;

	}

	/**
	 * The effect's resolution scale.
	 *
	 * @type {number}
	 * @default 1
	 */
	get resolutionScale() {

		return this._reflector.resolutionScale;

	}

	set resolutionScale( value ) {

		this._reflector.resolutionScale = value;

	}

}

class WaterNode extends Node {

	constructor( options, waterBody ) {

		super( 'vec4' );

		this.waterBody = waterBody;

		this.normalMap0 = texture( options.normalMap0 );
		this.normalMap1 = texture( options.normalMap1 );
		this.flowMap = texture( options.flowMap );

		this.color = uniform( options.color !== undefined ? new Color( options.color ) : new Color( 0xffffff ) );
		this.flowDirection = uniform( options.flowDirection !== undefined ? options.flowDirection : new Vector2( 1, 0 ) );
		this.flowSpeed = uniform( options.flowSpeed !== undefined ? options.flowSpeed : 0.03 );
		this.reflectivity = uniform( options.reflectivity !== undefined ? options.reflectivity : 0.02 );
		this.scale = uniform( options.scale !== undefined ? options.scale : 1 );
		this.flowConfig = uniform( new Vector3() );

		this.updateBeforeType = NodeUpdateType.RENDER;

		this._cycle = 0.15; // a cycle of a flow map phase
		this._halfCycle = this._cycle * 0.5;

		this._USE_FLOW = options.flowMap !== undefined;

		this._reflectionSampler = reflector( {
			resolutionScale: options.resolutionScale !== undefined ? options.resolutionScale : 1,
			bounces: false
		} );
		this._defaultReflectorUV = this._reflectionSampler.uvNode;
		waterBody.add( this._reflectionSampler.target );

	}

	updateFlow( delta ) {

		this.flowConfig.value.x += this.flowSpeed.value * delta; // flowMapOffset0
		this.flowConfig.value.y = this.flowConfig.value.x + this._halfCycle; // flowMapOffset1

		// Important: The distance between offsets should be always the value of "halfCycle".
		// Moreover, both offsets should be in the range of [ 0, cycle ].
		// This approach ensures a smooth water flow and avoids "reset" effects.

		if ( this.flowConfig.value.x >= this._cycle ) {

			this.flowConfig.value.x = 0;
			this.flowConfig.value.y = this._halfCycle;

		} else if ( this.flowConfig.value.y >= this._cycle ) {

			this.flowConfig.value.y = this.flowConfig.value.y - this._cycle;

		}

		this.flowConfig.value.z = this._halfCycle;

	}

	updateBefore( frame ) {

		this.updateFlow( frame.deltaTime );

	}

	setup() {

		const outputNode = Fn( () => {

			const flowMapOffset0 = this.flowConfig.x;
			const flowMapOffset1 = this.flowConfig.y;
			const halfCycle = this.flowConfig.z;

			const worldToEye = cameraPosition.sub( positionWorld );
			const distSq = dot( worldToEye, worldToEye );
			const invDistance = inverseSqrt( distSq );
			const toEye = worldToEye.mul( invDistance );
			const distance = distSq.mul( invDistance );

			let flow;

			if ( this._USE_FLOW === true ) {

				flow = this.flowMap.rg.mul( 2 ).sub( 1 );

			} else {

				flow = vec2( this.flowDirection.x, this.flowDirection.y );

			}

			flow.x.mulAssign( - 1 );

			// sample normal maps (distort uvs with flowdata)

			const uvs = uv();

			const normalUv0 = uvs.mul( this.scale ).add( flow.mul( flowMapOffset0 ) );
			const normalUv1 = uvs.mul( this.scale ).add( flow.mul( flowMapOffset1 ) );

			const normalColor0 = this.normalMap0.sample( normalUv0 );
			const normalColor1 = this.normalMap1.sample( normalUv1 );

			// linear interpolate to get the final normal color
			const flowLerp = abs( halfCycle.sub( flowMapOffset0 ) ).div( halfCycle );
			const normalColor = mix( normalColor0, normalColor1, flowLerp );

			// calculate normal vector
			const normal = normalize( vec3( normalColor.r.mul( 2 ).sub( 1 ), normalColor.b, normalColor.g.mul( 2 ).sub( 1 ) ) );

			// calculate the fresnel term to blend reflection and refraction maps
			const theta = max( dot( toEye, normal ), 0 );
			const oneMinusTheta = sub( 1.0, theta );
			const oneMinusTheta2 = oneMinusTheta.mul( oneMinusTheta );
			const reflectance = oneMinusTheta2.mul( oneMinusTheta2 ).mul( oneMinusTheta ).mul( sub( 1.0, this.reflectivity ) ).add( this.reflectivity );

			// reflector, refractor

			const viewRight = vec2( cameraViewMatrix[ 0 ].x, cameraViewMatrix[ 2 ].x );
			const normalTilt = vec2(
				normal.x.mul( viewRight.x ).add( normal.z.mul( viewRight.y ) ),
				normal.z.mul( viewRight.x ).sub( normal.x.mul( viewRight.y ) )
			);
			const offset = normalTilt.mul( float( 0.05 ).div( float( 1.0 ).add( distance.mul( 0.02 ) ) ) ).toVar();

			const reflectionSampler = this._reflectionSampler;
			reflectionSampler.uvNode = this._defaultReflectorUV.add( vec2( offset.x.negate(), offset.y ) );

			const refractorUV = screenUV.sub( offset );
			const refractionSampler = viewportSharedTexture( viewportSafeUV( refractorUV ) );

			// tint transmitted light only; dielectric surface reflections stay achromatic

			return vec4( mix( refractionSampler.rgb.mul( this.color ), reflectionSampler.rgb, reflectance ), 1.0 );

		} )();

		return outputNode;

	}

}

/**
 * Constructor options of `WaterMesh`.
 *
 * @typedef {Object} module:Water2Mesh~Options
 * @property {number|Color|string} [color=0xFFFFFF] - The water color.
 * @property {number} [resolutionScale=1] - The resolution scale.
 * @property {Vector2} [flowDirection=(1,0)] - The water's flow direction.
 * @property {number} [flowSpeed=0.03] - The water's flow speed.
 * @property {number} [reflectivity=0.02] - The water's reflectivity.
 * @property {number} [scale=1] - The water's scale.
 * @property {?Texture} [flowMap=null] - The flow map. If no flow map is assigned, the water flow is defined by `flowDirection`.
 * @property {Texture} normalMap0 - The first water normal map.
 * @property {Texture} normalMap1 - The second water normal map.
 **/

export { WaterMesh };
