import Object3DNode from './Object3DNode.js';
import Matrix4Node from '../inputs/Matrix4Node.js';

class CameraNode extends Object3DNode {

	static PROJECTION_MATRIX = 'projectionMatrix';

	constructor( scope = CameraNode.POSITION ) {

		super( scope );

		this._inputNode = null;

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
		const inputNode = this._inputNode;
		const scope = this.scope;

		if ( scope === CameraNode.PROJECTION_MATRIX ) {

			inputNode.value = camera.projectionMatrix;

		} else if ( scope === CameraNode.VIEW_MATRIX ) {

			inputNode.value = camera.matrixWorldInverse;

		} else {

			super.update( frame );

		}

	}

	generate( builder ) {

		const scope = this.scope;

		if ( scope === CameraNode.PROJECTION_MATRIX ) {

			this._inputNode = new Matrix4Node( null );

		}

		return super.generate( builder );

	}

}

export default CameraNode;
