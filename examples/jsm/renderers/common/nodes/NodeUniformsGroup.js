import UniformsGroup from '../UniformsGroup.js';

let id = 0;

class NodeUniformsGroup extends UniformsGroup {

	constructor( name, groupNode ) {

		super( name );

		this.id = id ++;
		this.groupNode = groupNode;

		this.isNodeUniformsGroup = true;

	}

	get shared() {

		return this.groupNode.shared;

	}

	getNodes() {

		const nodes = [];

		for ( const uniform of this.uniforms ) {

			const node = uniform.nodeUniform.node;

			if ( ! node ) throw new Error( 'NodeUniformsGroup: Uniform has no node.' );

			nodes.push( node );

		}

		return nodes;

	}

}

export default NodeUniformsGroup;
