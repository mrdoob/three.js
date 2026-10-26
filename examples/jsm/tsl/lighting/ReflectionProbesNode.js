import { Node, NodeUtils, Vector3 } from 'three/webgpu';
import { cubeTexture, float, Fn, getParallaxCorrectNormal, If, int, materialEnvIntensity, materialEnvRotation, nodeObject, positionWorld, reflectVector, roughnessToMip, uniform, vec3, vec4 } from 'three/tsl';

const _scale = /*@__PURE__*/ new Vector3();

/**
 * Environment radiance from a baked {@link ReflectionProbes} set, with per-pixel
 * volume weights and box projection. Assign it to `scene.environmentNode` so
 * every physical material samples it with its own roughness and normal. Bake
 * the probes before creating the node.
 *
 * @augments Node
 * @three_import import { reflectionProbes } from 'three/addons/tsl/lighting/ReflectionProbesNode.js';
 */
class ReflectionProbesNode extends Node {

	static get type() {

		return 'ReflectionProbesNode';

	}

	/**
	 * Constructs a new reflection probes node.
	 *
	 * @param {ReflectionProbes} probes - The baked probe set.
	 * @param {Object} [options] - Sampling options.
	 * @param {?Node<vec3>} [options.position=null] - World-space query position.
	 * @param {?Node<vec3>} [options.direction=null] - World-space sampling direction.
	 * @param {?Node<float>} [options.roughness=null] - Perceptual roughness.
	 * @param {boolean} [options.localOnly=false] - Return local radiance and coverage without the environment.
	 * @param {boolean} [options.environmentOnly=false] - Return only the cached environment.
	 */
	constructor( probes, { position = null, direction = null, roughness = null, localOnly = false, environmentOnly = false } = {} ) {

		super( localOnly ? 'vec4' : 'vec3' );
		this.positionNode = position;
		this.directionNode = direction;
		this.roughnessNode = roughness;
		this.localOnly = localOnly;
		this.environmentOnly = environmentOnly;

		/**
		 * The probe set.
		 *
		 * @type {ReflectionProbes}
		 */
		this.probes = probes;

		this.updateBeforeType = 'render';

		this._array = cubeTexture( probes.texture );
		this._array.mergeable = false;
		this._maxLod = uniform( 0 );
		this._local = uniform( 1 );
		this._boxProjection = uniform( 1 );
		this._slots = [];

	}

	customCacheKey() {

		// keep the id so separate probe sets don't share compiled uniforms
		return NodeUtils.hash( super.customCacheKey(), this.probes.bakedProbes.length );

	}

	updateBefore() {

		const probes = this.probes;

		// a re-bake disposes the previous texture, so switch even before a recompile
		this._array.value = probes.texture;
		this._maxLod.value = probes.texture.mipmaps.length - 1;

		if ( probes.bakedProbes.length !== this._slots.length ) {

			// the probe count is compiled into the shader
			this.needsUpdate = true;
			return;

		}

		// Captures cannot sample local probes while writing their replacement.
		this._local.value = this.environmentOnly || probes.capturing ? 0 : 1;
		this._boxProjection.value = probes.boxProjection ? 1 : 0;

		for ( let i = 0; i < this._slots.length; i ++ ) {

			const slot = this._slots[ i ];
			const probe = probes.bakedProbes[ i ];

			probe.getWorldPosition( slot.position.value );
			probe.getWorldScale( _scale );

			slot.extent.value.copy( probe.influenceSize ).multiply( _scale ).multiplyScalar( 0.5 );
			slot.fade.value = probe.blendDistance;
			slot.projectionSize.value.copy( probe.projectionSize ?? probe.influenceSize ).multiply( _scale );
			slot.projectionOffset.value.copy( probe.projectionOffset ).multiply( _scale );

		}

	}

	setup( builder ) {

		// All material programs must keep referencing the uniforms updated by updateBefore().
		this._slots = this.probes.bakedProbes.map( ( probe, i ) => this._slots[ i ] ?? ( {
			position: uniform( new Vector3() ),
			extent: uniform( new Vector3() ),
			fade: uniform( 0.5 ),
			projectionSize: uniform( new Vector3() ),
			projectionOffset: uniform( new Vector3() )
		} ) );

		this.updateBefore();

		const { context } = builder;
		const position = this.positionNode ?? positionWorld;
		const direction = this.directionNode ?? ( context.getUV ? context.getUV( this, builder ) : reflectVector );
		const roughness = this.roughnessNode ?? ( context.getTextureLevel ? context.getTextureLevel( this ) : 0 );

		if ( this.environmentOnly ) {

			return this._array.sample( materialEnvRotation.mul( direction ) ).depth( int( 0 ) ).level( roughnessToMip( roughness, this._maxLod ) ).rgb;

		}

		return Fn( () => {

			const lod = roughnessToMip( roughness, this._maxLod );
			const radiance = vec3( 0 ).toVar();
			const remaining = float( this._local ).toVar();

			for ( let i = 0; i < this._slots.length; i ++ ) {

				const slot = this._slots[ i ];
				const local = position.sub( slot.position );
				const d = slot.extent.sub( local.abs() );
				// negative outside the box, so the clamped fade is zero there
				const distance = d.x.min( d.y ).min( d.z );
				const weight = distance.div( slot.fade.max( 1e-6 ) ).clamp().mul( remaining ).toVar();

				If( weight.greaterThan( 0 ), () => {

					const insideProjection = local.sub( slot.projectionOffset ).abs().lessThanEqual( slot.projectionSize.mul( 0.5 ) ).all();
					// the box hit point, relative to the capture point rather than the box center
					const projected = getParallaxCorrectNormal( direction, slot.projectionSize, slot.position.add( slot.projectionOffset ), position ).add( slot.projectionOffset );
					const corrected = this._boxProjection.greaterThan( 0 ).and( insideProjection ).select( projected, direction );
					radiance.addAssign( this._array.sample( corrected ).depth( int( i + 1 ) ).level( lod ).rgb.mul( weight ) );

				} );

				remaining.subAssign( weight );

			}

			if ( this.localOnly ) {

				const coverage = float( this._local ).sub( remaining );
				return vec4( radiance.div( coverage.max( 1e-6 ) ), coverage );

			}

			const environmentWeight = remaining.add( this._local.oneMinus() );
			radiance.addAssign( this._array.sample( materialEnvRotation.mul( direction ) ).depth( int( 0 ) ).level( lod ).rgb.mul( environmentWeight ) );

			return radiance;

		} )();

	}

}

/**
 * TSL function for creating a reflection probes node.
 *
 * @tsl
 * @function
 * @param {ReflectionProbes} probes - The baked probe set.
 * @returns {ReflectionProbesNode}
 */
export const reflectionProbes = ( probes ) => nodeObject( new ReflectionProbesNode( probes ) );

/**
 * Returns only the cached environment, for explicit environment fallback adapters.
 *
 * @param {ReflectionProbes} probes - The prepared reflection probes.
 * @return {Node<vec3>} The filtered cached environment.
 */
export const reflectionProbesEnvironment = probes => nodeObject( new ReflectionProbesNode( probes, { environmentOnly: true } ) );

/**
 * Local reflection radiance and coverage, without implicit environment fallback.
 * RGB is conditional radiance; alpha is validity independent of intensity.
 *
 * @param {ReflectionProbes} probes - The prepared reflection probes.
 * @return {Function} A specular provider.
 */
export const reflectionProbesSpecular = probes => ( { position, direction, roughness } ) => nodeObject( new ReflectionProbesNode( probes, { position, direction, roughness, localOnly: true } ) ).mul( vec4( vec3( materialEnvIntensity ), 1 ) );

/**
 * Broad-lobe local probe irradiance and coverage, without environment fallback.
 *
 * @param {ReflectionProbes} probes - The prepared reflection probes.
 * @return {Function} A diffuse provider.
 */
export const reflectionProbesDiffuse = probes => ( { position, normal } ) => Fn( () => {

	const sample = nodeObject( new ReflectionProbesNode( probes, { position, direction: normal, roughness: float( 1 ), localOnly: true } ) ).toConst();
	return vec4( sample.rgb.mul( Math.PI ).mul( materialEnvIntensity ), sample.a );

} )();

export { ReflectionProbesNode };
