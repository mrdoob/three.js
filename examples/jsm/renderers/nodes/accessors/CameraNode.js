import Object3DNode from './Object3DNode.js';
import Matrix4Node from '../inputs/Matrix4Node.js';

class CameraNode extends Object3DNode {

	static PROJECTION_MATRIX = 'projectionMatrix';

	constructor( scope = CameraNode.POSITION ) {

		super( scope );

	}

	getType( builder ) {

		const scope = this.scope;

		if ( scope === CameraNode.PROJECTION_MATRIX ) {

			return 'mat4';

		}

		return super.getType( builder );

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

	generate( builder, output ) {

		const nodeData = builder.getDataFromNode( this );

		let inputNode = this._inputNode;

		if ( nodeData.inputNode === undefined ) {

			const scope = this.scope;

			if ( scope === CameraNode.PROJECTION_MATRIX ) {

				if ( inputNode === null || inputNode.isMatrix4Node !== true ) {

					inputNode = new Matrix4Node( null );

				}

			} else {

				return super.generate( builder, output );

			}

			this._inputNode = inputNode;

			nodeData.inputNode = inputNode;

		}

		return inputNode.build( builder, output );

	}

}

export default CameraNode;
