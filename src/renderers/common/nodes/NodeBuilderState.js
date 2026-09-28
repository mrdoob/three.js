import BindGroup from '../BindGroup.js';
import NodeUniform from '../../../nodes/core/NodeUniform.js';

/**
 * This module represents the state of a node builder after it was
 * used to build the nodes for a render object. The state holds the
 * results of the build for further processing in the renderer.
 *
 * Render objects with identical cache keys share the same node builder state.
 *
 * @private
 */
class NodeBuilderState {

	/**
	 * Constructs a new node builder state.
	 *
	 * @param {string} vertexShader - The native vertex shader code.
	 * @param {string} fragmentShader - The native fragment shader code.
	 * @param {string} computeShader - The native compute shader code.
	 * @param {Array<NodeAttribute>} nodeAttributes - An array of node attributes.
	 * @param {Array<BindGroup>} bindings - An array of bind groups.
	 * @param {Array<Node>} updateNodes - An array of nodes that implement their `update()` method.
	 * @param {Array<Node>} updateBeforeNodes - An array of nodes that implement their `updateBefore()` method.
	 * @param {Array<Node>} updateAfterNodes - An array of nodes that implement their `updateAfter()` method.
	 * @param {NodeMaterialObserver} observer - A node material observer.
	 * @param {boolean} hardwareClipping - Whether the built material uses hardware clipping or not.
	 * @param {Array<Object>} transforms - An array with transform attribute objects. Only relevant when using compute shaders with WebGL 2.
	 */
	constructor( vertexShader, fragmentShader, computeShader, nodeAttributes, bindings, updateNodes, updateBeforeNodes, updateAfterNodes, observer, hardwareClipping, transforms = [] ) {

		/**
		 * The native vertex shader code.
		 *
		 * @type {string}
		 */
		this.vertexShader = vertexShader;

		/**
		 * The native fragment shader code.
		 *
		 * @type {string}
		 */
		this.fragmentShader = fragmentShader;

		/**
		 * The native compute shader code.
		 *
		 * @type {string}
		 */
		this.computeShader = computeShader;

		/**
		 * An array with transform attribute objects.
		 * Only relevant when using compute shaders with WebGL 2.
		 *
		 * @type {Array<Object>}
		 */
		this.transforms = transforms;

		/**
		 * An array of node attributes representing
		 * the attributes of the shaders.
		 *
		 * @type {Array<NodeAttribute>}
		 */
		this.nodeAttributes = nodeAttributes;

		/**
		 * An array of bind groups representing the uniform or storage
		 * buffers, texture or samplers of the shader.
		 *
		 * @type {Array<BindGroup>}
		 */
		this.bindings = bindings;

		/**
		 * An array of nodes that implement their `update()` method.
		 *
		 * @type {Array<Node>}
		 */
		this.updateNodes = updateNodes;

		/**
		 * An array of nodes that implement their `updateBefore()` method.
		 *
		 * @type {Array<Node>}
		 */
		this.updateBeforeNodes = updateBeforeNodes;

		/**
		 * An array of nodes that implement their `updateAfter()` method.
		 *
		 * @type {Array<Node>}
		 */
		this.updateAfterNodes = updateAfterNodes;

		/**
		 * A node material observer.
		 *
		 * @type {NodeMaterialObserver}
		 */
		this.observer = observer;

		/**
		 * Whether the built material uses hardware clipping or not.
		 *
		 * @type {boolean}
		 */
		this.hardwareClipping = hardwareClipping;

		/**
		 * The value keyed uniforms of the built material, see {@link NodeMaterial#getUniformNodes}.
		 *
		 * @type {Array<UniformNode>}
		 */
		this.uniformNodes = [];

		/**
		 * How often this state is used by render objects.
		 *
		 * @type {number}
		 */
		this.usedTimes = 0;

	}

	/**
	 * This method is used to create a array of bind groups based
	 * on the existing bind groups of this state. Shared groups are
	 * not cloned. Uniforms of the built material are mapped to the given
	 * material's uniforms, so materials sharing this state keep their own values.
	 *
	 * @param {?Material} [material=null] - The material of the render object.
	 * @return {Array<BindGroup>} A array of bind groups.
	 */
	createBindings( material = null ) {

		const uniformNodes = this.uniformNodes.length > 0 && material.isNodeMaterial === true ? material.getUniformNodes() : null;

		const bindings = [];

		for ( const instanceGroup of this.bindings ) {

			const shared = instanceGroup.bindings[ 0 ].groupNode.shared; // All bindings in the group must have the same groupNode.

			if ( shared !== true ) {

				const bindingsGroup = new BindGroup( instanceGroup.name, [] );
				bindings.push( bindingsGroup );

				for ( const instanceBinding of instanceGroup.bindings ) {

					const binding = instanceBinding.clone();

					if ( uniformNodes !== null && binding.isNodeUniformsGroup === true ) {

						binding.uniforms = binding.uniforms.map( uniform => {

							const index = this.uniformNodes.indexOf( uniform.nodeUniform.node );

							if ( index === - 1 || uniformNodes[ index ] === uniform.nodeUniform.node ) return uniform;

							const { name, type } = uniform.nodeUniform;

							return new uniform.constructor( new NodeUniform( name, type, uniformNodes[ index ] ) );

						} );

					}

					bindingsGroup.bindings.push( binding );

				}

			} else {

				bindings.push( instanceGroup );

			}

		}

		return bindings;

	}

}

export default NodeBuilderState;
