import TempNode from '../core/TempNode.js';
import { cameraProjectionMatrix } from './Camera.js';
import { positionLocal } from './Position.js';
import { nodeProxy, varying } from '../tsl/TSLBase.js';

class ModelViewProjectionNode extends TempNode {

	static get type() {

		return 'ModelViewProjectionNode';

	}

	constructor( positionNode = null ) {

		super( 'vec4' );

		this.positionNode = positionNode;

	}

	setup( builder ) {

		if ( builder.shaderStage === 'fragment' ) {

			return varying( builder.context.mvp );

		}

		const position = this.positionNode || positionLocal;
		const modelViewMatrix = builder.renderer.nodes.modelViewMatrix;

		return cameraProjectionMatrix.mul( modelViewMatrix ).mul( position );

	}

}

export default ModelViewProjectionNode;

export const modelViewProjection = /*@__PURE__*/ nodeProxy( ModelViewProjectionNode );
