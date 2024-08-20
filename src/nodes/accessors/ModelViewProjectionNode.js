import TempNode from '../core/TempNode.js';
import { cameraProjectionMatrix } from './CameraNode.js';
import { modelViewMatrix } from './ModelNode.js';
import { positionLocal } from './PositionNode.js';
import { nodeProxy, varying } from '../tsl/TSLBase.js';

class ModelViewProjectionNode extends TempNode {

	constructor( positionNode = null ) {

		super( 'vec4' );

		this.positionNode = positionNode;

	}

	setup( builder ) {

		if ( builder.shaderStage === 'fragment' ) {

			return varying( builder.context.mvp );

		}

		const position = this.positionNode || positionLocal;

		return cameraProjectionMatrix.mul( modelViewMatrix ).mul( position );

	}

}

export default ModelViewProjectionNode;

export const modelViewProjection = nodeProxy( ModelViewProjectionNode );
