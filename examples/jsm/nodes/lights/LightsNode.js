import Node from '../core/Node.js';
import LightNode from './LightNode.js';

const sortLights = ( lights ) => {

	return lights.sort( ( a, b ) => a.id - b.id );

};

class LightsNode extends Node {

	constructor( lightNodes = [] ) {

		super( 'vec3' );

		this.lightNodes = lightNodes;

		this._hash = null;

	}

	get hasLight() {

		return this.lightNodes.length > 0;

	}

	generate( builder ) {

		const lightNodes = this.lightNodes;

		for ( const lightNode of lightNodes ) {

			lightNode.build( builder );

		}

		return 'vec3( 0.0 )';

	}

	getHash( /*builder*/ ) {

		if ( this._hash === null ) {

			let hash = '';
			
			const lightNodes = this.lightNodes;

			for ( const lightNode of lightNodes ) {

				hash += lightNode.light.uuid + ' ';

			}
			
			this._hash = hash;
			
		}

		return this._hash;

	}

	getLightNodeByHash( hash ) {

		const lightNodes = this.lightNodes;

		for ( const lightNode of lightNodes ) {

			if ( lightNode.light.uuid === hash ) {

				return lightNode;

			}

		}

		return null;

	}

	fromLights( lights ) {

		const lightNodes = [];

		lights = sortLights( lights );

		for ( const light of lights ) {

			let lightNode = this.getLightNodeByHash( light.uuid );

			if ( lightNode === null ) {

				lightNode = new LightNode( light );

			}

			lightNodes.push( lightNode );

		}

		this.lightNodes = lightNodes;
		this._hash = null;

		return this;

	}

}

export default LightsNode;
