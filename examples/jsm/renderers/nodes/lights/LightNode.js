import Node from '../core/Node.js';
import Object3DNode from '../accessors/Object3DNode.js';
import NormalNode from '../accessors/NormalNode.js';
import PositionNode from '../accessors/PositionNode.js';
import ColorNode from '../inputs/ColorNode.js';
import FloatNode from '../inputs/FloatNode.js';
import OperatorNode from '../math/OperatorNode.js';
import MathNode from '../math/MathNode.js';

import { Color } from '../../../../../build/three.module.js';

const normalView = new NormalNode( NormalNode.VIEW );
const positionView = new PositionNode( PositionNode.VIEW );
const positionViewDirection = new PositionNode( PositionNode.VIEW_DIRECTION );

class LightNode extends Node {

	constructor( light = null, directFunctionNode = null ) {

		super( 'vec3' );
		
		this.light = light;
		this.directFunctionNode = directFunctionNode;
		
		this.lightPositionView = new Object3DNode( Object3DNode.VIEW_POSITION );
		this.positionView = new PositionNode( PositionNode.VIEW );
		
		this.lVector = new OperatorNode( '-', this.lightPositionView, this.positionView );
		
		this.lightDirection = new MathNode( MathNode.NORMALIZE, this.lVector );
		
		this.color = new ColorNode( new Color( 0xFFFFFF ) );
		
	}
	
	update( frame ) {
		
		this.color.value.copy( this.light.color );
		
	}
	
	generate( builder, output ) {
		
		this.lightPositionView.object3d = this.light;
		
		let directFunctionNode = this.directFunctionNode;
		
		if ( directFunctionNode === null ) {
			
			directFunctionNode = builder.getContextParameter( 'RE_Direct' );
			
		}
		
		const directFunctionCallNode = directFunctionNode.call( {
			// light
			lightPosition: this.lightPositionView,
			lightColor: this.color,
			
			// material
			materialDiffuseColor: new ColorNode( new Color( 0x333333 ) ),
			materialSpecularColor: new ColorNode( new Color( 0x111111 ) ),
			materialSpecularShininess: new FloatNode( 30 ),
			materialSpecularStrength: new FloatNode( 1 )
		} );
		
		return directFunctionCallNode.build( builder, output );
		
	}

}

export default LightNode;
