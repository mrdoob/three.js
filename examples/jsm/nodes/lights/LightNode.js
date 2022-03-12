import Node from '../core/Node.js';
import Object3DNode from '../accessors/Object3DNode.js';
import PositionNode from '../accessors/PositionNode.js';
import UniformNode from '../core/UniformNode.js';
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

		this._colorNode = new UniformNode( new Color() );

		this._lightCutoffDistanceNode = new UniformNode( 0 );
		this._lightDecayExponentNode = new UniformNode( 0 );

	}

	getHash( /*builder*/ ) {

		return this.light.uuid;

	}

	update( /* frame */ ) {

		this._colorNode.value.copy( this.light.color ).multiplyScalar( this.light.intensity );
		this._lightCutoffDistanceNode.value = this.light.distance;
		this._lightDecayExponentNode.value = this.light.decay;

	}

	generate( builder ) {

		const lightPositionView = new Object3DNode( Object3DNode.VIEW_POSITION );
		const positionView = new PositionNode( PositionNode.VIEW );

		const lVector = new OperatorNode( '-', lightPositionView, positionView );

		const lightDirection = new MathNode( MathNode.NORMALIZE, lVector );

		const lightDistance = new MathNode( MathNode.LENGTH, lVector );

		const lightAttenuation = getDistanceAttenuation( {
			lightDistance,
			cutoffDistance: this._lightCutoffDistanceNode,
			decayExponent: this._lightDecayExponentNode
		} );

		const lightColor = new OperatorNode( '*', this._colorNode, lightAttenuation );

		lightPositionView.object3d = this.light;

		const lightingModelFunction = builder.context.lightingModel;

		if ( lightingModelFunction !== undefined ) {

			const directDiffuse = builder.context.directDiffuse;
			const directSpecular = builder.context.directSpecular;

			lightingModelFunction( {
				lightDirection,
				lightColor,
				directDiffuse,
				directSpecular
			}, builder );

		}

	}

}

export default LightNode;
