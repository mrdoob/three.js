import BindGroup from '../BindGroup.js';

class NodeBuilderState {

	constructor( vertexShader, fragmentShader, computeShader, nodeAttributes, bindings, updateNodes, updateBeforeNodes, updateAfterNodes, instanceBindGroups = true, transforms = [] ) {

		this.vertexShader = vertexShader;
		this.fragmentShader = fragmentShader;
		this.computeShader = computeShader;
		this.transforms = transforms;

		this.nodeAttributes = nodeAttributes;
		this.bindings = bindings;

		this.updateNodes = updateNodes;
		this.updateBeforeNodes = updateBeforeNodes;
		this.updateAfterNodes = updateAfterNodes;

		this.instanceBindGroups = instanceBindGroups;

		this.usedTimes = 0;

	}

	createBindings() {

		const bindings = [];

		for ( const instanceGroup of this.bindings ) {

			const shared = this.instanceBindGroups && instanceGroup.bindings[ 0 ].groupNode.shared;

			if ( shared !== true ) {

				const bindingsGroup = new BindGroup( instanceGroup.name );
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
