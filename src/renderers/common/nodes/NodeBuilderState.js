import BindGroup from '../BindGroup.js';

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
	 * @param {String?} vertexShader - The native vertex shader code.
	 * @param {String?} fragmentShader - The native fragment shader code.
	 * @param {String?} computeShader - The native compute shader code.
	 * @param {Array<NodeAttribute>} nodeAttributes - An array of node attributes.
	 * @param {Array<BindGroup>} bindings - An array of bind groups.
	 * @param {Array<Node>} updateNodes - An array of nodes that implement their `update()` method.
	 * @param {Array<Node>} updateBeforeNodes - An array of nodes that implement their `updateBefore()` method.
	 * @param {Array<Node>} updateAfterNodes - An array of nodes that implement their `updateAfter()` method.
	 * @param {NodeMaterialObserver} monitor - A node material observer.
	 * @param {Array<Object>} transforms - An array with transform attribute objects. Only relevant when using compute shaders with WebGL 2.
	 */
	constructor( vertexShader, fragmentShader, computeShader, nodeAttributes, bindings, updateNodes, updateBeforeNodes, updateAfterNodes, monitor, transforms = [] ) {

		/**
		 * The native vertex shader code.
		 *
		 * @type {String}
		 */
		this.vertexShader = vertexShader;

		/**
		 * The native fragment shader code.
		 *
		 * @type {String}
		 */
		this.fragmentShader = fragmentShader;

		/**
		 * The native compute shader code.
		 *
		 * @type {String}
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
		this.monitor = monitor;

		/**
		 * How often this state is used by render objects.
		 *
		 * @type {Number}
		 */
		this.usedTimes = 0;

	}

	/**
	 * This method is used to create a array of bind groups based
	 * on the existing bind groups of this state. Shared groups are
	 * not cloned.
	 *
	 * @return {Array<BindGroup>} A array of bind groups.
	 */
	createBindings() {

		const bindings = [];

		for ( const instanceGroup of this.bindings ) {

			const shared = instanceGroup.bindings[ 0 ].groupNode.shared; // TODO: Is it safe to always check the first binding in the group?

			if ( shared !== true ) {

				const bindingsGroup = new BindGroup( instanceGroup.name, [], instanceGroup.index, instanceGroup );
				bindings.push( bindingsGroup );

				for ( const instanceBinding of instanceGroup.bindings ) {

					bindingsGroup.bindings.push( instanceBinding.clone() );

				}

			} else {

				bindings.push( instanceGroup );

			}

		}

		return bindings;

	}

}

export default NodeBuilderState;
