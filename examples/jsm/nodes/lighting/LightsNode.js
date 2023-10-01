import Node from '../core/Node.js';
import AnalyticLightNode from './AnalyticLightNode.js';
import { nodeObject, nodeProxy, vec3 } from '../shadernode/ShaderNode.js';

const LightNodes = new WeakMap();

const sortLights = ( lights ) => {

	return lights.sort( ( a, b ) => a.id - b.id );

};

class LightsNode extends Node {

	constructor( lightNodes = [] ) {

		super( 'vec3' );

		this.totalDiffuseNode = vec3().temp( 'totalDiffuse' );
		this.totalSpecularNode = vec3().temp( 'totalSpecular' );

		this.outgoingLightNode = vec3().temp( 'outgoingLight' );

		this.lightNodes = lightNodes;

		this._hash = null;

	}

	get hasLight() {

		return this.lightNodes.length > 0;

	}

	setup( builder ) {

		const context = builder.context;
		const lightingModel = context.lightingModel;

		let outgoingLightNode = this.outgoingLightNode;

		if ( lightingModel ) {

			const { lightNodes, totalDiffuseNode, totalSpecularNode } = this;

			context.outgoingLight = outgoingLightNode;

			const stack = builder.addStack();

			//

			lightingModel.start( context, stack, builder );

			// lights

			for ( const lightNode of lightNodes ) {

				lightNode.build( builder );
	
			}

			//

			lightingModel.indirectDiffuse( context, stack, builder );
			lightingModel.indirectSpecular( context, stack, builder );
			lightingModel.ambientOcclusion( context, stack, builder );

			//

			const { backdrop, backdropAlpha } = context;
			const { directDiffuse, directSpecular, indirectDiffuse, indirectSpecular } = context.reflectedLight;

			let totalDiffuse = directDiffuse.add( indirectDiffuse );

			if ( backdrop !== null ) {

				totalDiffuse = vec3( backdropAlpha !== null ? backdropAlpha.mix( totalDiffuse, backdrop ) : backdrop );
	
			}

			stack.assign( totalDiffuseNode, totalDiffuse );
			stack.assign( totalSpecularNode, directSpecular.add( indirectSpecular ) );

			stack.assign( outgoingLightNode, totalDiffuseNode.add( totalSpecularNode ) );

			//

			lightingModel.finish( context, stack, builder );

			//

			outgoingLightNode = outgoingLightNode.bypass( builder.removeStack() );

		}

		return outgoingLightNode;

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

	if ( LightNodes.has( lightClass ) ) throw new Error( `Redefinition of light node ${ lightNodeClass.type }` );
	if ( typeof lightClass !== 'function' ) throw new Error( `Light ${ lightClass.name } is not a class` );
	if ( typeof lightNodeClass !== 'function' || ! lightNodeClass.type ) throw new Error( `Light node ${ lightNodeClass.type } is not a class` );

	LightNodes.set( lightClass, lightNodeClass );

}
