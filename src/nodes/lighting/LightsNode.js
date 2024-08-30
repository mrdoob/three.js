import Node, { registerNode } from '../core/Node.js';
import { nodeObject, nodeProxy, vec3 } from '../tsl/TSLBase.js';

const sortLights = ( lights ) => {

	return lights.sort( ( a, b ) => a.id - b.id );

};

const getLightNodeById = ( id, lightNodes ) => {

	for ( const lightNode of lightNodes ) {

		if ( lightNode.isAnalyticLightNode && lightNode.light.id === id ) {

			return lightNode;

		}

	}

	return null;

};

class LightsNode extends Node {

	constructor( lights = [] ) {

		super( 'vec3' );

		this.totalDiffuseNode = vec3().toVar( 'totalDiffuse' );
		this.totalSpecularNode = vec3().toVar( 'totalSpecular' );

		this.outgoingLightNode = vec3().toVar( 'outgoingLight' );

		this._lights = lights;

		this._lightNodes = null;
		this._lightNodesHash = null;

		this.global = true;

	}

	getHash( builder ) {

		if ( this._lightNodesHash === null ) {

			if ( this._lightNodes === null ) this.setupLightsNode( builder );

			const hash = [];

			for ( const lightNode of this._lightNodes ) {

				hash.push( lightNode.getHash() );

			}

			this._lightNodesHash = 'lights-' + hash.join( ',' );

		}

		return this._lightNodesHash;

	}

	analyze( builder ) {

		const properties = builder.getDataFromNode( this );

		for ( const node of properties.nodes ) {

			node.build( builder );

		}

	}

	setupLightsNode( builder ) {

		const lightNodes = [];

		const previousLightNodes = this._lightNodes;

		const lights = sortLights( this._lights );
		const nodeLibrary = builder.renderer.nodes.library;

		for ( const light of lights ) {

			if ( light.isNode ) {

				lightNodes.push( nodeObject( light ) );

			} else {

				let lightNode = null;

				if ( previousLightNodes !== null ) {

					lightNode = getLightNodeById( light.id, previousLightNodes ); // resuse existing light node

				}

				if ( lightNode === null ) {

					const lightNodeClass = nodeLibrary.getLightNodeClass( light.constructor );

					if ( lightNodeClass === undefined ) {

						console.warn( `LightsNode.setupNodeLights: Light node not found for ${ light.constructor.name }` );
						continue;

					}

					lightNodes.push( nodeObject( new lightNodeClass( light ) ) );

				}

			}

		}

		this._lightNodes = lightNodes;

	}

	setup( builder ) {

		if ( this._lightNodes === null ) this.setupLightsNode( builder );

		const context = builder.context;
		const lightingModel = context.lightingModel;

		let outgoingLightNode = this.outgoingLightNode;

		if ( lightingModel ) {

			const { _lightNodes, totalDiffuseNode, totalSpecularNode } = this;

			context.outgoingLight = outgoingLightNode;

			const stack = builder.addStack();

			//

			const properties = builder.getDataFromNode( this );
			properties.nodes = stack.nodes;

			//

			lightingModel.start( context, stack, builder );

			// lights

			for ( const lightNode of _lightNodes ) {

				lightNode.build( builder );

			}

			//

			lightingModel.indirect( context, stack, builder );

			//

			const { backdrop, backdropAlpha } = context;
			const { directDiffuse, directSpecular, indirectDiffuse, indirectSpecular } = context.reflectedLight;

			let totalDiffuse = directDiffuse.add( indirectDiffuse );

			if ( backdrop !== null ) {

				if ( backdropAlpha !== null ) {

					totalDiffuse = vec3( backdropAlpha.mix( totalDiffuse, backdrop ) );

				} else {

					totalDiffuse = vec3( backdrop );

				}

				context.material.transparent = true;

			}

			totalDiffuseNode.assign( totalDiffuse );
			totalSpecularNode.assign( directSpecular.add( indirectSpecular ) );

			outgoingLightNode.assign( totalDiffuseNode.add( totalSpecularNode ) );

			//

			lightingModel.finish( context, stack, builder );

			//

			outgoingLightNode = outgoingLightNode.bypass( builder.removeStack() );

		}

		return outgoingLightNode;

	}

	setLights( lights ) {

		this._lights = lights;

		this._lightNodes = null;
		this._lightNodesHash = null;

		return this;

	}

	getLights() {

		return this._lights;

	}

}

export default LightsNode;

LightsNode.type = /*@__PURE__*/ registerNode( 'Lights', LightsNode );

export const lights = /*@__PURE__*/ nodeProxy( LightsNode );
