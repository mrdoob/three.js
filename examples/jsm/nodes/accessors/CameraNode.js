import Object3DNode from './Object3DNode.js';
import { addNodeClass } from '../core/Node.js';
import { nodeImmutable } from '../shadernode/ShaderNode.js';

class CameraNode extends Object3DNode {

	constructor( scope = CameraNode.POSITION ) {

		super( scope );

	}

	getNodeType( builder ) {

		const scope = this.scope;

		if ( scope === CameraNode.PROJECTION_MATRIX ) {

			return 'mat4';

		}

		return super.getNodeType( builder );

	}

	update( frame ) {

		const camera = frame.camera;
		const uniformNode = this._uniformNode;
		const scope = this.scope;

		if ( scope === CameraNode.PROJECTION_MATRIX ) {

			uniformNode.value = camera.projectionMatrix;

		} else if ( scope === CameraNode.VIEW_MATRIX ) {

			uniformNode.value = camera.matrixWorldInverse;

		} else {

			this.object3d = camera;

			super.update( frame );

		}

	}

	generate( builder ) {

		const scope = this.scope;

		if ( scope === CameraNode.PROJECTION_MATRIX ) {

			this._uniformNode.nodeType = 'mat4';

		}

		return super.generate( builder );

	}

}

CameraNode.PROJECTION_MATRIX = 'projectionMatrix';

export default CameraNode;

export const cameraProjectionMatrix = nodeImmutable( CameraNode, CameraNode.PROJECTION_MATRIX );
export const cameraViewMatrix = nodeImmutable( CameraNode, CameraNode.VIEW_MATRIX );
export const cameraNormalMatrix = nodeImmutable( CameraNode, CameraNode.NORMAL_MATRIX );
export const cameraWorldMatrix = nodeImmutable( CameraNode, CameraNode.WORLD_MATRIX );
export const cameraPosition = nodeImmutable( CameraNode, CameraNode.POSITION );

addNodeClass( CameraNode );
