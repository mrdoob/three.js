import AnalyticLightNode from './AnalyticLightNode.js';
import { getDistanceAttenuation } from './LightUtils.js';
import { uniform } from '../core/UniformNode.js';
import { smoothstep } from '../math/MathNode.js';
import { positionView } from '../accessors/Position.js';
import { renderGroup } from '../core/UniformGroupNode.js';
import { lightViewPosition, lightTargetDirection, lightProjectionUV } from '../accessors/Lights.js';
import { texture } from '../accessors/TextureNode.js';

class SpotLightNode extends AnalyticLightNode {

	static get type() {

		return 'SpotLightNode';

	}

	constructor( light = null ) {

		super( light );

		this.coneCosNode = uniform( 0 ).setGroup( renderGroup );
		this.penumbraCosNode = uniform( 0 ).setGroup( renderGroup );

		this.cutoffDistanceNode = uniform( 0 ).setGroup( renderGroup );
		this.decayExponentNode = uniform( 0 ).setGroup( renderGroup );

	}

	update( frame ) {

		super.update( frame );

		const { light } = this;

		this.coneCosNode.value = Math.cos( light.angle );
		this.penumbraCosNode.value = Math.cos( light.angle * ( 1 - light.penumbra ) );

		this.cutoffDistanceNode.value = light.distance;
		this.decayExponentNode.value = light.decay;

	}

	getSpotAttenuation( angleCosine ) {

		const { coneCosNode, penumbraCosNode } = this;

		return smoothstep( coneCosNode, penumbraCosNode, angleCosine );

	}

	setup( builder ) {

		super.setup( builder );

		const lightingModel = builder.context.lightingModel;

		const { colorNode, cutoffDistanceNode, decayExponentNode, light } = this;

		const lVector = lightViewPosition( light ).sub( positionView ); // @TODO: Add it into LightNode

		const lightDirection = lVector.normalize();
		const angleCos = lightDirection.dot( lightTargetDirection( light ) );
		const spotAttenuation = this.getSpotAttenuation( angleCos );

		const lightDistance = lVector.length();

		const lightAttenuation = getDistanceAttenuation( {
			lightDistance,
			cutoffDistance: cutoffDistanceNode,
			decayExponent: decayExponentNode
		} );

		let lightColor = colorNode.mul( spotAttenuation ).mul( lightAttenuation );

		if ( light.map ) {

			const spotLightCoord = lightProjectionUV( light );
			const projectedTexture = texture( light.map, spotLightCoord.xy ).onRenderUpdate( () => light.map );

			const inSpotLightMap = spotLightCoord.mul( 2. ).sub( 1. ).abs().lessThan( 1. ).all();

			lightColor = inSpotLightMap.select( lightColor.mul( projectedTexture ), lightColor );

		}

		const reflectedLight = builder.context.reflectedLight;

		lightingModel.direct( {
			lightDirection,
			lightColor,
			reflectedLight
		}, builder.stack, builder );

	}

}

export default SpotLightNode;
