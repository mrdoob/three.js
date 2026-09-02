import { Node, warn } from 'three/webgpu';
import { nodeImmutable, instanceIndex, workgroupId, numWorkgroups, uint } from 'three/tsl';

/**
 * The name of the WGSL language feature that provides the
 * `global_invocation_index` and `workgroup_index` compute built-ins.
 *
 * @type {string}
 */
const WGSL_LANGUAGE_FEATURE = 'linear_indexing';

/**
 * Whether the current renderer can bind the native WGSL built-ins.
 *
 * When this is `false` (WebGL backend, or a WebGPU backend/browser that
 * doesn't advertise the language feature) the nodes fall back to the same
 * 3D linearization Three.js already emits for `instanceIndex`.
 *
 * @param {Renderer} renderer - The renderer.
 * @returns {boolean} Whether the native built-ins can be used.
 */
function hasNativeSupport( renderer ) {

	if ( renderer.backend.isWebGPUBackend !== true ) return false;

	if ( typeof navigator === 'undefined' || navigator.gpu === undefined ) return false;

	const languageFeatures = navigator.gpu.wgslLanguageFeatures;

	return languageFeatures !== undefined && languageFeatures.has( WGSL_LANGUAGE_FEATURE );

}

/**
 * Linearized workgroup index reconstructed from the 3D `workgroup_id` grid.
 * Equivalent to WGSL's `workgroup_index` built-in.
 *
 * @param {NodeBuilder} builder - The current node builder.
 * @returns {Node<uint>}
 */
function emulatedWorkgroupIndex( builder ) {

	if ( builder.renderer.backend.isWebGPUBackend !== true ) {

		const [ x, y, z ] = builder.compute.workgroupSize;

		return instanceIndex.div( uint( x * y * z ) );

	}

	return workgroupId.x.add( workgroupId.y.mul( numWorkgroups.x ) ).add( workgroupId.z.mul( numWorkgroups.x ).mul( numWorkgroups.y ) );

}

/**
 * TSL node for one of the compute built-ins provided by WGSL's
 * `linear_indexing` language extension.
 *
 * On the WebGPU backend, when the browser advertises `linear_indexing`, these
 * map onto `@builtin(global_invocation_index)` and `@builtin(workgroup_index)`.
 * Otherwise they fall back to manual index calculation from the 3D grid
 * (`global_invocation_id` / `workgroup_id`), which is also what the WebGL
 * backend uses.
 *
 * @augments Node
 * @three_import import { globalInvocationIndex, workgroupIndex } from 'three/addons/tsl/gpgpu/LinearIndexingNode.js';
 */
class LinearIndexingNode extends Node {

	static get type() {

		return 'LinearIndexingNode';

	}

	/**
	 * @param {('globalInvocation'|'workgroup')} scope - Which built-in to expose.
	 */
	constructor( scope ) {

		super( 'uint' );

		/**
		 * @type {('globalInvocation'|'workgroup')}
		 */
		this.scope = scope;

		/**
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isLinearIndexingNode = true;

	}

	getHash() {

		return `linear-indexing-${ this.scope }`;

	}

	setup( builder ) {

		if ( builder.shaderStage !== 'compute' ) {

			warn( `TSL: "${ this.scope }" linear indexing can only be accessed in the compute stage` );

			return uint( 0 );

		}

		if ( hasNativeSupport( builder.renderer ) && typeof builder.getBuiltin === 'function' ) {

			return super.setup( builder );

		}

		if ( this.scope === LinearIndexingNode.GLOBAL_INVOCATION ) {

			// `instanceIndex` is already the linearized global invocation index
			// on both backends (ALU prologue on WGSL, `gl_InstanceID` on GLSL).
			return instanceIndex;

		}

		return emulatedWorkgroupIndex( builder );

	}

	generate( builder, output ) {

		const properties = builder.getNodeProperties( this );

		if ( properties.outputNode ) {

			return super.generate( builder, output );

		}

		const { name, property } = this._getBuiltin();

		return builder.format( builder.getBuiltin( name, property, 'u32', 'attribute' ), 'uint', output );

	}

	/**
	 * @private
	 * @returns {{ name: string, property: string }}
	 */
	_getBuiltin() {

		if ( this.scope === LinearIndexingNode.WORKGROUP ) {

			return { name: 'workgroup_index', property: 'workgroupIndex' };

		}

		return { name: 'global_invocation_index', property: 'globalInvocationIndex' };

	}

	serialize( data ) {

		super.serialize( data );

		data.scope = this.scope;

	}

	deserialize( data ) {

		super.deserialize( data );

		this.scope = data.scope;

	}

	static get GLOBAL_INVOCATION() {

		return 'globalInvocation';

	}

	static get WORKGROUP() {

		return 'workgroup';

	}

}

export default LinearIndexingNode;

/**
 * Linear position of the current invocation within the total compute grid.
 * Equivalent to WGSL's `global_invocation_index`, and to TSL `instanceIndex`
 * in a compute shader.
 *
 * @tsl
 * @type {LinearIndexingNode}
 */
export const globalInvocationIndex = /*@__PURE__*/ nodeImmutable( LinearIndexingNode, LinearIndexingNode.GLOBAL_INVOCATION );

/**
 * Linear position of the current workgroup within the compute grid.
 * Equivalent to WGSL's `workgroup_index`.
 *
 * @tsl
 * @type {LinearIndexingNode}
 */
export const workgroupIndex = /*@__PURE__*/ nodeImmutable( LinearIndexingNode, LinearIndexingNode.WORKGROUP );
