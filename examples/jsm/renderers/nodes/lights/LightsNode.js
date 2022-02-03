import Node from '../core/Node.js';
import LightNode from './LightNode.js';

class LightsNode extends Node {

	constructor( lightNodes = [] ) {

		super( 'vec3' );

		this.lightNodes = lightNodes;

	}

	generate( builder ) {

		const lightNodes = this.lightNodes;

		for ( const lightNode of lightNodes ) {

			lightNode.build( builder );

		}

		return 'vec3( 0.0 )';

	}

	static fromLights( lights ) {

		const lightNodes = [];

		for ( const light of lights ) {

			lightNodes.push( new LightNode( light ) );

		}

		return new LightsNode( lightNodes );

	}

}

export default LightsNode;
