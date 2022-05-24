import Node from '../core/Node.js';
import LightingNode from './LightingNode.js';

const references = new WeakMap();

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

	construct( builder ) {

		const lightNodes = this.lightNodes;

		for ( const lightNode of lightNodes ) {

			lightNode.build( builder );

		}

	}

	getHash( builder ) {

		if ( this._hash === null ) {

			let hash = '';

			const lightNodes = this.lightNodes;

			for ( const lightNode of lightNodes ) {

				hash += lightNode.getHash( builder ) + ' ';

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

				const lightClass = light.constructor;
				const lightNodeClass = references.has( lightClass ) ? references.get( lightClass ) : LightingNode;

				lightNode = new lightNodeClass( light );

			}

			lightNodes.push( lightNode );

		}

		this.lightNodes = lightNodes;
		this._hash = null;

		return this;

	}

	static setReference( lightClass, lightNodeClass ) {

		references.set( lightClass, lightNodeClass );

	}

}

export default LightsNode;
