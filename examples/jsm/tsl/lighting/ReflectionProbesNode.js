import { Node, NodeUtils, Vector3 } from 'three/webgpu';
import { cubeTexture, float, Fn, getParallaxCorrectNormal, If, int, materialEnvIntensity, nodeObject, positionWorld, reflectVector, roughnessToMip, uniform, vec3, vec4 } from 'three/tsl';

const _scale = /*@__PURE__*/ new Vector3();

/**
 * Local radiance and coverage from a baked {@link ReflectionProbes} set.
 * RGB is conditional radiance and A is coverage. Compose any environment
 * fallback separately, using the uncovered fraction. Bake the probes first.
 * Rebuild consuming materials when the number of baked probes changes.
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
	 */
	constructor( probes, { position = null, direction = null, roughness = null } = {} ) {

		super( 'vec4' );
		this.positionNode = position;
		this.directionNode = direction;
		this.roughnessNode = roughness;

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
		this._maxLod.value = probes.texture !== null ? probes.texture.mipmaps.length - 1 : 0;

		if ( probes.bakedProbes.length !== this._slots.length ) {

			// the probe count is compiled into the shader
			this.needsUpdate = true;
			return;

		}

		// Captures cannot sample local probes while writing their replacement.
		this._local.value = probes.capturing ? 0 : 1;
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

		if ( this.probes.texture === null ) return vec4( 0 );

		const { context } = builder;
		const position = this.positionNode ?? positionWorld;
		const direction = this.directionNode ?? ( context.getUV ? context.getUV( this, builder ) : reflectVector );
		const roughness = this.roughnessNode ?? ( context.getTextureLevel ? context.getTextureLevel( this ) : 0 );

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
					radiance.addAssign( this._array.sample( corrected ).depth( int( i ) ).level( lod ).rgb.mul( weight ) );

				} );

				remaining.subAssign( weight );

			}

			const coverage = float( this._local ).sub( remaining );
			return vec4( radiance.div( coverage.max( 1e-6 ) ), coverage );

		} )();

	}

}

/**
 * Returns local conditional radiance and coverage, without environment fallback.
 *
 * @tsl
 * @function
 * @param {ReflectionProbes} probes - The baked probe set.
 * @returns {ReflectionProbesNode}
 */
export const reflectionProbes = ( probes ) => nodeObject( new ReflectionProbesNode( probes ) );

/**
 * Local reflection radiance and coverage, without implicit environment fallback.
 * RGB is conditional radiance; alpha is validity independent of intensity.
 *
 * @param {ReflectionProbes} probes - The prepared reflection probes.
 * @return {Function} A specular provider.
 */
export const reflectionProbesSpecular = probes => ( { position, direction, roughness } ) => nodeObject( new ReflectionProbesNode( probes, { position, direction, roughness } ) ).mul( vec4( vec3( materialEnvIntensity ), 1 ) );

/**
 * Broad-lobe local probe irradiance and coverage, without environment fallback.
 *
 * @param {ReflectionProbes} probes - The prepared reflection probes.
 * @return {Function} A diffuse provider.
 */
export const reflectionProbesDiffuse = probes => ( { position, normal } ) => Fn( () => {

	const sample = nodeObject( new ReflectionProbesNode( probes, { position, direction: normal, roughness: float( 1 ) } ) ).toConst();
	return vec4( sample.rgb.mul( Math.PI ).mul( materialEnvIntensity ), sample.a );

} )();

export { ReflectionProbesNode };
