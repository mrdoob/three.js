class NodeBuilderState {

	constructor( vertexShader, fragmentShader, computeShader, nodeAttributes, bindings, updateNodes, updateBeforeNodes, transforms = [] ) {

		this.vertexShader = vertexShader;
		this.fragmentShader = fragmentShader;
		this.computeShader = computeShader;
		this.transforms = transforms;

		this.nodeAttributes = nodeAttributes;
		this.bindings = bindings;

		this.updateNodes = updateNodes;
		this.updateBeforeNodes = updateBeforeNodes;

		this.usedTimes = 0;

	}

	createBindings() {

		const bindingsArray = [];

		for ( const instanceBinding of this.bindings ) {

			let binding = instanceBinding;

			if ( instanceBinding.shared !== true ) {

				binding = instanceBinding.clone();

			}

			bindingsArray.push( binding );

		}

		return bindingsArray;

	}

}

export default NodeBuilderState;
