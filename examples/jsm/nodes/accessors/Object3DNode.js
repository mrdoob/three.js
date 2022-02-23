import Node from '../core/Node.js';
import Matrix4Node from '../inputs/Matrix4Node.js';
import Matrix3Node from '../inputs/Matrix3Node.js';
import Vector3Node from '../inputs/Vector3Node.js';
import { NodeUpdateType } from '../core/constants.js';

class Object3DNode extends Node {

	static ViewMatrix = 'viewMatrix';
	static NormalMatrix = 'normalMatrix';
	static WorldMatrix = 'worldMatrix';
	static Position = 'position';
	static ViewPosition = 'viewPosition';

	constructor( scope = Object3DNode.ViewMatrix, object3d = null ) {

		super();

		this.scope = scope;
		this.object3d = object3d;

		this.updateType = NodeUpdateType.Object;

		this._inputNode = null;

	}

	getNodeType() {

		const scope = this.scope;

		if ( scope === Object3DNode.WorldMatrix || scope === Object3DNode.ViewMatrix ) {

			return 'mat4';

		} else if ( scope === Object3DNode.NormalMatrix ) {

			return 'mat3';

		} else if ( scope === Object3DNode.Position || scope === Object3DNode.ViewPosition ) {

			return 'vec3';

		}

	}

	update( frame ) {

		const object = this.object3d !== null ? this.object3d : frame.object;
		const inputNode = this._inputNode;
		const camera = frame.camera;
		const scope = this.scope;

		if ( scope === Object3DNode.ViewMatrix ) {

			inputNode.value = object.modelViewMatrix;

		} else if ( scope === Object3DNode.NormalMatrix ) {

			inputNode.value = object.normalMatrix;

		} else if ( scope === Object3DNode.WorldMatrix ) {

			inputNode.value = object.matrixWorld;

		} else if ( scope === Object3DNode.Position ) {

			inputNode.value.setFromMatrixPosition( object.matrixWorld );

		} else if ( scope === Object3DNode.ViewPosition ) {

			inputNode.value.setFromMatrixPosition( object.matrixWorld );

			inputNode.value.applyMatrix4( camera.matrixWorldInverse );

		}

	}

	generate( builder ) {

		const scope = this.scope;

		if ( scope === Object3DNode.WorldMatrix || scope === Object3DNode.ViewMatrix ) {

			this._inputNode = new Matrix4Node( /*null*/ );

		} else if ( scope === Object3DNode.NormalMatrix ) {

			this._inputNode = new Matrix3Node( /*null*/ );

		} else if ( scope === Object3DNode.Position || scope === Object3DNode.ViewPosition ) {

			this._inputNode = new Vector3Node();

		}

		return this._inputNode.build( builder );

	}

	serialize( data ) {

		super.serialize( data );

		data.scope = this.scope;

	}

	deserialize( data ) {

		super.deserialize( data );

		this.scope = data.scope;

	}

}

export default Object3DNode;
