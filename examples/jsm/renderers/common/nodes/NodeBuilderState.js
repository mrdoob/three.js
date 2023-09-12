class NodeBuilderState {

	constructor( vertexShader, fragmentShader, computeShader, nodeAttributes, bindings, updateNodes, updateBeforeNodes ) {

		this.vertexShader = vertexShader;
		this.fragmentShader = fragmentShader;
		this.computeShader = computeShader;

		this.nodeAttributes = nodeAttributes;
		this.bindings = bindings;

		this.updateNodes = updateNodes;
		this.updateBeforeNodes = updateBeforeNodes;

		this.usedTimes = 0;

	}

	createBindings() {

		const bindingsArray = [];

		for ( const binding of this.bindings ) {

			bindingsArray.push( binding.clone() );

		}

		return bindingsArray;

	}

}

export default NodeBuilderState;
