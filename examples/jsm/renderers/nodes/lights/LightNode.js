import Node from '../core/Node.js';
import Object3DNode from '../accessors/Object3DNode.js';
import PositionNode from '../accessors/PositionNode.js';
import ColorNode from '../inputs/ColorNode.js';
import FloatNode from '../inputs/FloatNode.js';
import OperatorNode from '../math/OperatorNode.js';
import MathNode from '../math/MathNode.js';
import { NodeUpdateType } from '../core/constants.js';
import { punctualLightIntensityToIrradianceFactor } from '../functions/BSDFs.js';

import { Color } from 'three';

class LightNode extends Node {

	constructor( light = null ) {

		super( 'vec3' );

		this.updateType = NodeUpdateType.Object;

		this.light = light;

		this.color = new ColorNode( new Color() );

		this.lightCutoffDistance = new FloatNode( 0 );
		this.lightDecayExponent = new FloatNode( 0 );

		this.lightPositionView = new Object3DNode( Object3DNode.VIEW_POSITION );
		this.positionView = new PositionNode( PositionNode.VIEW );

		this.lVector = new OperatorNode( '-', this.lightPositionView, this.positionView );

		this.lightDirection = new MathNode( MathNode.NORMALIZE, this.lVector );

		this.lightDistance = new MathNode( MathNode.LENGTH, this.lVector );

		this.lightIntensity = punctualLightIntensityToIrradianceFactor.call( {
			lightDistance: this.lightDistance,
			cutoffDistance: this.lightCutoffDistance,
			decayExponent: this.lightDecayExponent
		} );

		this.lightColor = new OperatorNode( '*', this.color, this.lightIntensity );

	}

	update( /* frame */ ) {

		this.color.value.copy( this.light.color ).multiplyScalar( this.light.intensity );
		this.lightCutoffDistance.value = this.light.distance;
		this.lightDecayExponent.value = this.light.decay;

	}

	generate( builder, output ) {

		this.lightPositionView.object3d = this.light;

		const directFunctionNode = builder.getContextParameter( 'RE_Direct' );
		const indirectDiffuseFunctionNode = builder.getContextParameter( 'RE_IndirectDiffuse' );

		const directFunctionCallNode = directFunctionNode.call( {
			lightDirection: this.lightDirection,
			lightColor: this.lightColor
		} );

		const indirectDiffuseFunctionCallNode = indirectDiffuseFunctionNode.call( {
			lightDirection: this.lightDirection,
			lightColor: this.lightColor
		} );

		builder.addFlowCode( directFunctionCallNode.build( builder ) );

		builder.addFlowCode( indirectDiffuseFunctionCallNode.build( builder ) );

		return this.color.build( builder, output );

	}

}

export default LightNode;
