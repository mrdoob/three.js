import { Node, error, warn } from 'three/webgpu';
import { nodeImmutable, invocationLocalIndex, subgroupSize, uint } from 'three/tsl';

/**
 * The name of the WGSL language feature that provides the
 * `subgroup_id` and `num_subgroups` compute built-ins.
 *
 * @type {string}
 */
const WGSL_LANGUAGE_FEATURE = 'subgroup_id';

/**
 * Whether the renderer has the `subgroups` device feature. Required both
 * for the native language-extension built-ins and for the fallback formula
 * (`local_invocation_index / subgroup_size`).
 *
 * @param {Renderer} renderer - The renderer.
 * @returns {boolean}
 */
function hasSubgroupsFeature( renderer ) {

	return renderer.backend.isWebGPUBackend === true && renderer.hasFeature( 'subgroups' ) === true;

}

/**
 * Whether the current renderer can bind the native WGSL built-ins.
 *
 * @param {Renderer} renderer - The renderer.
 * @returns {boolean}
 */
function hasNativeSupport( renderer ) {

	if ( hasSubgroupsFeature( renderer ) !== true ) return false;

	if ( typeof navigator === 'undefined' || navigator.gpu === undefined ) return false;

	const languageFeatures = navigator.gpu.wgslLanguageFeatures;

	return languageFeatures !== undefined && languageFeatures.has( WGSL_LANGUAGE_FEATURE );

}

/**
 * TSL node for one of the compute built-ins provided by WGSL's
 * `subgroup_id` language extension.
 *
 * These are not exported from `three/tsl`. Import them from this module.
 * Native WGSL built-ins are used when advertised, otherwise:
 *
 * `subgroup_id ≈ local_invocation_index / subgroup_size`
 * `num_subgroups ≈ ceil(workgroup_size / subgroup_size)`
 *
 * The reconstruction is inexact when a workgroup's last subgroup is not full.
 * Both paths still require the `subgroups` GPU device feature; there is no
 * WebGL fallback.
 *
 * @augments Node
 * @three_import import { subgroupIndex, numSubgroups } from 'three/addons/tsl/gpgpu/SubgroupIdNode.js';
 */
class SubgroupIdNode extends Node {

	static get type() {

		return 'SubgroupIdNode';

	}

	/**
	 * @param {('subgroupIndex'|'numSubgroups')} scope - Which built-in to expose.
	 */
	constructor( scope ) {

		super( 'uint' );

		/**
		 * @type {('subgroupIndex'|'numSubgroups')}
		 */
		this.scope = scope;

		/**
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isSubgroupIdNode = true;

	}

	getHash() {

		return `subgroup-id-${ this.scope }`;

	}

	setup( builder ) {

		if ( builder.shaderStage !== 'compute' ) {

			warn( `TSL: "${ this.scope }" can only be accessed in the compute stage` );

			return uint( 0 );

		}

		if ( hasSubgroupsFeature( builder.renderer ) !== true ) {

			error( 'TSL: subgroup_id built-ins require the WebGPU "subgroups" device feature. There is no WebGL fallback.' );

			return uint( 0 );

		}

		if ( hasNativeSupport( builder.renderer ) && typeof builder.getBuiltin === 'function' ) {

			return super.setup( builder );

		}

		if ( this.scope === SubgroupIdNode.NUM_SUBGROUPS ) {

			const [ x, y, z ] = builder.compute.workgroupSize;
			const volume = uint( x * y * z );

			return volume.add( subgroupSize ).sub( uint( 1 ) ).div( subgroupSize );

		}

		return invocationLocalIndex.div( subgroupSize );

	}

	generate( builder, output ) {

		const properties = builder.getNodeProperties( this );

		if ( properties.outputNode ) {

			return super.generate( builder, output );

		}

		if ( typeof builder.enableSubGroups === 'function' ) {

			builder.enableSubGroups();

		}

		const { name, property } = this._getBuiltin();

		return builder.format( builder.getBuiltin( name, property, 'u32', 'attribute' ), 'uint', output );

	}

	/**
	 * @private
	 * @returns {{ name: string, property: string }}
	 */
	_getBuiltin() {

		if ( this.scope === SubgroupIdNode.NUM_SUBGROUPS ) {

			return { name: 'num_subgroups', property: 'numSubgroups' };

		}

		return { name: 'subgroup_id', property: 'subgroupIndex' };

	}

	serialize( data ) {

		super.serialize( data );

		data.scope = this.scope;

	}

	deserialize( data ) {

		super.deserialize( data );

		this.scope = data.scope;

	}

	static get SUBGROUP_INDEX() {

		return 'subgroupIndex';

	}

	static get NUM_SUBGROUPS() {

		return 'numSubgroups';

	}

}

export default SubgroupIdNode;

/**
 * Index of the current invocation's subgroup within its workgroup.
 * Equivalent to WGSL's `subgroup_id`.
 *
 * Not exported from `three/tsl`; import it from this module.
 *
 * @tsl
 * @type {SubgroupIdNode}
 */
export const subgroupIndex = /*@__PURE__*/ nodeImmutable( SubgroupIdNode, SubgroupIdNode.SUBGROUP_INDEX );

/**
 * Number of subgroups in the current workgroup.
 * Equivalent to WGSL's `num_subgroups`.
 *
 * @tsl
 * @type {SubgroupIdNode}
 */
export const numSubgroups = /*@__PURE__*/ nodeImmutable( SubgroupIdNode, SubgroupIdNode.NUM_SUBGROUPS );
