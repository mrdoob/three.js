import AnalyticLightNode from './AnalyticLightNode.js';
import { getDistanceAttenuation } from './LightUtils.js';
import { uniform } from '../core/UniformNode.js';
import { smoothstep } from '../math/MathNode.js';
import { renderGroup } from '../core/UniformGroupNode.js';
import { lightTargetDirection, lightProjectionUV } from '../accessors/Lights.js';
import { texture } from '../accessors/TextureNode.js';

/**
 * Module for representing spot lights as nodes.
 *
 * @augments AnalyticLightNode
 */
class SpotLightNode extends AnalyticLightNode {

	static get type() {

		return 'SpotLightNode';

	}

	/**
	 * Constructs a new spot light node.
	 *
	 * @param {?SpotLight} [light=null] - The spot light source.
	 */
	constructor( light = null ) {

		super( light );

		/**
		 * Uniform node representing the cone cosine.
		 *
		 * @type {UniformNode<float>}
		 */
		this.coneCosNode = uniform( 0 ).setGroup( renderGroup );

		/**
		 * Uniform node representing the penumbra cosine.
		 *
		 * @type {UniformNode<float>}
		 */
		this.penumbraCosNode = uniform( 0 ).setGroup( renderGroup );

		/**
		 * Uniform node representing the cutoff distance.
		 *
		 * @type {UniformNode<float>}
		 */
		this.cutoffDistanceNode = uniform( 0 ).setGroup( renderGroup );

		/**
		 * Uniform node representing the decay exponent.
		 *
		 * @type {UniformNode<float>}
		 */
		this.decayExponentNode = uniform( 0 ).setGroup( renderGroup );

		/**
		 * Uniform node representing the light color.
		 *
		 * @type {UniformNode<Color>}
		 */
		this.colorNode = uniform( this.color ).setGroup( renderGroup );

	}

	/**
	 * Overwritten to updated spot light specific uniforms.
	 *
	 * @param {NodeFrame} frame - A reference to the current node frame.
	 */
	update( frame ) {

		super.update( frame );

		const { light } = this;

		this.coneCosNode.value = Math.cos( light.angle );
		this.penumbraCosNode.value = Math.cos( light.angle * ( 1 - light.penumbra ) );

		this.cutoffDistanceNode.value = light.distance;
		this.decayExponentNode.value = light.decay;

	}

	/**
	 * Computes the spot attenuation for the given angle.
	 *
	 * @param {NodeBuilder} builder - The node builder.
	 * @param {Node<float>} angleCosine - The angle to compute the spot attenuation for.
	 * @return {Node<float>} The spot attenuation.
	 */
	getSpotAttenuation( builder, angleCosine ) {

		const { coneCosNode, penumbraCosNode } = this;

		return smoothstep( coneCosNode, penumbraCosNode, angleCosine );

	}

	getLightCoord( builder ) {

		const properties = builder.getNodeProperties( this );
		let projectionUV = properties.projectionUV;

		if ( projectionUV === undefined ) {

			projectionUV = lightProjectionUV( this.light, builder.context.positionWorld );

			properties.projectionUV = projectionUV;

		}

		return projectionUV;

	}

	setupDirect( builder ) {

		const { colorNode, cutoffDistanceNode, decayExponentNode, light } = this;

		const lightVector = this.getLightVector( builder );

		const lightDirection = lightVector.normalize();
		const angleCos = lightDirection.dot( lightTargetDirection( light ) );

		const spotAttenuation = this.getSpotAttenuation( builder, angleCos );

		const lightDistance = lightVector.length();

		const lightAttenuation = getDistanceAttenuation( {
			lightDistance,
			cutoffDistance: cutoffDistanceNode,
			decayExponent: decayExponentNode
		} );

		let lightColor = colorNode.mul( spotAttenuation ).mul( lightAttenuation );

		let projected, lightCoord;

		if ( light.colorNode ) {

			lightCoord = this.getLightCoord( builder );
			projected = light.colorNode( lightCoord );

		} else if ( light.map ) {

			lightCoord = this.getLightCoord( builder );
			projected = texture( light.map, lightCoord.xy ).onRenderUpdate( () => light.map );

		}

		if ( projected ) {

			const inSpotLightMap = lightCoord.mul( 2. ).sub( 1. ).abs().lessThan( 1. ).all();

			lightColor = inSpotLightMap.select( lightColor.mul( projected ), lightColor );

		}

		return { lightColor, lightDirection };

	}

}

export default SpotLightNode;
