import Object3DNode from './Object3DNode.js';

class CameraNode extends Object3DNode {

	static PROJECTION_MATRIX = 'projectionMatrix';

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

export default CameraNode;
