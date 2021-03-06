import Node from '../core/Node.js';
import Object3DNode from '../accessors/Object3DNode.js';
import NormalNode from '../accessors/NormalNode.js';
import PositionNode from '../accessors/PositionNode.js';
import ColorNode from '../inputs/ColorNode.js';
import FloatNode from '../inputs/FloatNode.js';
import OperatorNode from '../math/OperatorNode.js';
import MathNode from '../math/MathNode.js';
import { NodeUpdateType } from '../core/constants.js';
import { punctualLightIntensityToIrradianceFactor } from '../functions/BSDFs.js';

import { Color } from '../../../../../build/three.module.js';

const normalView = new NormalNode( NormalNode.VIEW );
const positionView = new PositionNode( PositionNode.VIEW );
const positionViewDirection = new PositionNode( PositionNode.VIEW_DIRECTION );

class LightNode extends Node {

	constructor( light = null ) {

		super( 'vec3' );
		
		this.updateType = NodeUpdateType.Object;
		
		this.light = light;
		
		this.color = new ColorNode( null );
		
		this.lightCutoffDistance = new FloatNode( 0 );
		this.lightDecayExponent = new FloatNode( 0 );
		
		this.lightPositionView = new Object3DNode( Object3DNode.VIEW_POSITION );
		this.positionView = new PositionNode( PositionNode.VIEW );
		
		this.lVector = new OperatorNode( '-', this.lightPositionView, this.positionView );
		
		this.lightDirection = new MathNode( MathNode.NORMALIZE, this.lVector );
		
		this.lightDistance = new MathNode( MathNode.LENGTH, this.lVector );

		this.lightIntensity = punctualLightIntensityToIrradianceFactor.call({
			lightDistance: this.lightDistance,
			cutoffDistance: this.lightCutoffDistance,
			decayExponent: this.lightDecayExponent
		});
		
		this.lightColor = new OperatorNode( '*', this.color, this.lightIntensity );

	}
	
	update( frame ) {
		
		this.color.value = this.light.color;
		this.lightCutoffDistance.value = this.light.distance;
		this.lightDecayExponent.value = this.light.decay;

	}
	
	generate( builder, output ) {
		
		this.lightPositionView.object3d = this.light;
		
		const directFunctionNode = builder.getContextParameter( 'RE_Direct' );
		const indirectDiffuseFunctionNode = builder.getContextParameter( 'RE_IndirectDiffuse' );
		
		const directFunctionCallNode = directFunctionNode.call( {
			// light
			lightDirection: this.lightDirection,
			lightColor: this.lightColor,
			
			// material
			materialDiffuseColor: new ColorNode( new Color( 0x333333 ) ),
			materialSpecularColor: new ColorNode( new Color( 0x111111 ) ),
			materialSpecularShininess: new FloatNode( 30 ),
			materialSpecularStrength: new FloatNode( 1 )
		} );
		
		const indirectDiffuseFunctionCallNode = indirectDiffuseFunctionNode.call( {
			// light
			lightDirection: this.lightDirection,
			lightColor: this.lightColor,
		} );
		
		builder.addFlowCode( directFunctionCallNode.build( builder ) );
		
		builder.addFlowCode( indirectDiffuseFunctionCallNode.build( builder ) );
		
		return this.color.build( builder, output );
		
	}

}

export default LightNode;
