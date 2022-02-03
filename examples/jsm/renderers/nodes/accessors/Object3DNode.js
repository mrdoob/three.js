import Node from '../core/Node.js';
import Matrix4Node from '../inputs/Matrix4Node.js';
import Matrix3Node from '../inputs/Matrix3Node.js';
import Vector3Node from '../inputs/Vector3Node.js';
import { NodeUpdateType } from '../core/constants.js';

class Object3DNode extends Node {

	static VIEW_MATRIX = 'viewMatrix';
	static NORMAL_MATRIX = 'normalMatrix';
	static WORLD_MATRIX = 'worldMatrix';
	static POSITION = 'position';
	static VIEW_POSITION = 'viewPosition';

	constructor( scope = Object3DNode.VIEW_MATRIX, object3d = null ) {

		super();

		this.scope = scope;
		this.object3d = object3d;

		this.updateType = NodeUpdateType.Object;

		this._inputNode = null;

	}

	getNodeType() {

		const scope = this.scope;

		if ( scope === Object3DNode.WORLD_MATRIX || scope === Object3DNode.VIEW_MATRIX ) {

			return 'mat4';

		} else if ( scope === Object3DNode.NORMAL_MATRIX ) {

			return 'mat3';

		} else if ( scope === Object3DNode.POSITION || scope === Object3DNode.VIEW_POSITION ) {

			return 'vec3';

		}

	}

	update( frame ) {

		const object = this.object3d !== null ? this.object3d : frame.object;
		const inputNode = this._inputNode;
		const camera = frame.camera;
		const scope = this.scope;

		if ( scope === Object3DNode.VIEW_MATRIX ) {

			inputNode.value = object.modelViewMatrix;

		} else if ( scope === Object3DNode.NORMAL_MATRIX ) {

			inputNode.value = object.normalMatrix;

		} else if ( scope === Object3DNode.WORLD_MATRIX ) {

			inputNode.value = object.matrixWorld;

		} else if ( scope === Object3DNode.POSITION ) {

			inputNode.value.setFromMatrixPosition( object.matrixWorld );

		} else if ( scope === Object3DNode.VIEW_POSITION ) {

			inputNode.value.setFromMatrixPosition( object.matrixWorld );

			inputNode.value.applyMatrix4( camera.matrixWorldInverse );

		}

	}

	generate( builder ) {

		const scope = this.scope;

		if ( scope === Object3DNode.WORLD_MATRIX || scope === Object3DNode.VIEW_MATRIX ) {

			this._inputNode = new Matrix4Node( /*null*/ );

		} else if ( scope === Object3DNode.NORMAL_MATRIX ) {

			this._inputNode = new Matrix3Node( /*null*/ );

		} else if ( scope === Object3DNode.POSITION || scope === Object3DNode.VIEW_POSITION ) {

			this._inputNode = new Vector3Node();

		}

		return this._inputNode.build( builder );

	}

}

export default Object3DNode;
