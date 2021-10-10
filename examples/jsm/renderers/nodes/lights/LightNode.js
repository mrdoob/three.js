import Node from '../core/Node.js';
import Object3DNode from '../accessors/Object3DNode.js';
import PositionNode from '../accessors/PositionNode.js';
import ColorNode from '../inputs/ColorNode.js';
import FloatNode from '../inputs/FloatNode.js';
import OperatorNode from '../math/OperatorNode.js';
import MathNode from '../math/MathNode.js';
import { NodeUpdateType } from '../core/constants.js';
import { getDistanceAttenuation } from '../functions/BSDFs.js';

import { Color } from 'three';

class LightNode extends Node {

	constructor( light = null ) {

		super( 'vec3' );

		this.updateType = NodeUpdateType.Object;

		this.light = light;

		this.color = new ColorNode( new Color() );

		this.lightCutoffDistance = new FloatNode( 0 );
		this.lightDecayExponent = new FloatNode( 0 );

	}

	update( /* frame */ ) {

		this.color.value.copy( this.light.color ).multiplyScalar( this.light.intensity );
		this.lightCutoffDistance.value = this.light.distance;
		this.lightDecayExponent.value = this.light.decay;

	}

	generate( builder ) {

		const type = this.getNodeType( builder );

		const lightPositionView = new Object3DNode( Object3DNode.VIEW_POSITION );
		const positionView = new PositionNode( PositionNode.VIEW );

		const lVector = new OperatorNode( '-', lightPositionView, positionView );

		const lightDirection = new MathNode( MathNode.NORMALIZE, lVector );

		const lightDistance = new MathNode( MathNode.LENGTH, lVector );

		const lightAttenuation = getDistanceAttenuation( {
			lightDistance,
			cutoffDistance: this.lightCutoffDistance,
			decayExponent: this.lightDecayExponent
		} );

		const lightColor = new OperatorNode( '*', this.color, lightAttenuation );

		lightPositionView.object3d = this.light;

		const lightingModelFunction = builder.getContextValue( 'lightingModel' );

		if ( lightingModelFunction !== undefined ) {

			const directDiffuse = builder.getContextValue( 'directDiffuse' );
			const directSpecular = builder.getContextValue( 'directSpecular' );

			lightingModelFunction( {
				lightDirection,
				lightColor,
				directDiffuse,
				directSpecular
			}, builder );

		}

		return this.color.build( builder, type );

	}

}

export default LightNode;
