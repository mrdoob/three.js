import Node from '../core/Node.js';
import AnalyticLightNode from './AnalyticLightNode.js';
import { nodeObject, nodeProxy } from '../shadernode/ShaderNode.js';

const LightNodes = new WeakMap();

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

	fromLights( lights = [] ) {

		const lightNodes = [];

		lights = sortLights( lights );

		for ( const light of lights ) {

			let lightNode = this.getLightNodeByHash( light.uuid );

			if ( lightNode === null ) {

				const lightClass = light.constructor;
				const lightNodeClass = LightNodes.has( lightClass ) ? LightNodes.get( lightClass ) : AnalyticLightNode;

				lightNode = nodeObject( new lightNodeClass( light ) );

			}

			lightNodes.push( lightNode );

		}

		this.lightNodes = lightNodes;
		this._hash = null;

		return this;

	}

}

export default LightsNode;

export const lights = ( lights ) => nodeObject( new LightsNode().fromLights( lights ) );
export const lightsWithoutWrap = nodeProxy( LightsNode );

export function addLightNode( lightClass, lightNodeClass ) {

	if ( LightNodes.has( lightClass ) ) throw new Error( `Redefinition of light node ${ lightNodeClass.name }` );
	if ( typeof lightClass !== 'function' || ! lightClass.name ) throw new Error( `Light ${ lightClass.name } is not a class` );
	if ( typeof lightNodeClass !== 'function' || ! lightNodeClass.name ) throw new Error( `Light node ${ lightNodeClass.name } is not a class` );

	LightNodes.set( lightClass, lightNodeClass );

}
