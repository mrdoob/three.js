import Object3DNode from './Object3DNode.js';
import { addNodeClass } from '../core/Node.js';
import { NodeUpdateType } from '../core/constants.js';
//import { sharedUniformGroup } from '../core/UniformGroupNode.js';
import { nodeImmutable } from '../shadernode/ShaderNode.js';

//const cameraGroup = sharedUniformGroup( 'camera' );

class CameraNode extends Object3DNode {

	constructor( scope = CameraNode.POSITION ) {

		super( scope );

		this.updateType = NodeUpdateType.RENDER;

		//this._uniformNode.groupNode = cameraGroup;

	}

	getNodeType( builder ) {

		const scope = this.scope;

		if ( scope === CameraNode.PROJECTION_MATRIX || scope === CameraNode.PROJECTION_MATRIX_INVERSE ) {

			return 'mat4';

		} else if ( scope === CameraNode.NEAR || scope === CameraNode.FAR || scope === CameraNode.LOG_DEPTH ) {

			return 'float';

		}

		return super.getNodeType( builder );

	}

	update( frame ) {

		const camera = frame.camera;
		const uniformNode = this._uniformNode;
		const scope = this.scope;

		//cameraGroup.needsUpdate = true;

		if ( scope === CameraNode.VIEW_MATRIX ) {

			uniformNode.value = camera.matrixWorldInverse;

		} else if ( scope === CameraNode.PROJECTION_MATRIX ) {

			uniformNode.value = camera.projectionMatrix;

		} else if ( scope === CameraNode.PROJECTION_MATRIX_INVERSE ) {

			uniformNode.value = camera.projectionMatrixInverse;

		} else if ( scope === CameraNode.NEAR ) {

			uniformNode.value = camera.near;

		} else if ( scope === CameraNode.FAR ) {

			uniformNode.value = camera.far;

		} else if ( scope === CameraNode.LOG_DEPTH ) {

			uniformNode.value = 2.0 / ( Math.log( camera.far + 1.0 ) / Math.LN2 );

		} else {

			this.object3d = camera;

			super.update( frame );

		}

	}

	generate( builder ) {

		const scope = this.scope;

		if ( scope === CameraNode.PROJECTION_MATRIX || scope === CameraNode.PROJECTION_MATRIX_INVERSE ) {

			this._uniformNode.nodeType = 'mat4';

		} else if ( scope === CameraNode.NEAR || scope === CameraNode.FAR || scope === CameraNode.LOG_DEPTH ) {

			this._uniformNode.nodeType = 'float';

		}

		return super.generate( builder );

	}

}

CameraNode.PROJECTION_MATRIX = 'projectionMatrix';
CameraNode.PROJECTION_MATRIX_INVERSE = 'projectionMatrixInverse';
CameraNode.NEAR = 'near';
CameraNode.FAR = 'far';
CameraNode.LOG_DEPTH = 'logDepth';

export default CameraNode;

export const cameraProjectionMatrix = nodeImmutable( CameraNode, CameraNode.PROJECTION_MATRIX );
export const cameraProjectionMatrixInverse = nodeImmutable( CameraNode, CameraNode.PROJECTION_MATRIX_INVERSE );
export const cameraNear = nodeImmutable( CameraNode, CameraNode.NEAR );
export const cameraFar = nodeImmutable( CameraNode, CameraNode.FAR );
export const cameraLogDepth = nodeImmutable( CameraNode, CameraNode.LOG_DEPTH );
export const cameraViewMatrix = nodeImmutable( CameraNode, CameraNode.VIEW_MATRIX );
export const cameraNormalMatrix = nodeImmutable( CameraNode, CameraNode.NORMAL_MATRIX );
export const cameraWorldMatrix = nodeImmutable( CameraNode, CameraNode.WORLD_MATRIX );
export const cameraPosition = nodeImmutable( CameraNode, CameraNode.POSITION );

addNodeClass( 'CameraNode', CameraNode );
