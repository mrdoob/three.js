import BindGroup from '../BindGroup.js';

class NodeBuilderState {

	constructor( vertexShader, fragmentShader, computeShader, nodeAttributes, bindings, updateNodes, updateBeforeNodes, updateAfterNodes, monitor, transforms = [] ) {

		this.vertexShader = vertexShader;
		this.fragmentShader = fragmentShader;
		this.computeShader = computeShader;
		this.transforms = transforms;

		this.nodeAttributes = nodeAttributes;
		this.bindings = bindings;

		this.updateNodes = updateNodes;
		this.updateBeforeNodes = updateBeforeNodes;
		this.updateAfterNodes = updateAfterNodes;

		this.monitor = monitor;

		this.usedTimes = 0;

	}

	createBindings() {

		const bindings = [];

		for ( const instanceGroup of this.bindings ) {

			const shared = instanceGroup.bindings[ 0 ].groupNode.shared;

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
