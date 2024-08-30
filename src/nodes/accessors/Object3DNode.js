import Node, { registerNode } from '../core/Node.js';
import { NodeUpdateType } from '../core/constants.js';
import UniformNode from '../core/UniformNode.js';
import { nodeProxy } from '../tsl/TSLBase.js';

import { Vector3 } from '../../math/Vector3.js';

class Object3DNode extends Node {

	constructor( scope = Object3DNode.VIEW_MATRIX, object3d = null ) {

		super();

		this.scope = scope;
		this.object3d = object3d;

		this.updateType = NodeUpdateType.OBJECT;

		this._uniformNode = new UniformNode( null );

	}

	getNodeType() {

		const scope = this.scope;

		if ( scope === Object3DNode.WORLD_MATRIX || scope === Object3DNode.VIEW_MATRIX ) {

			return 'mat4';

		} else if ( scope === Object3DNode.NORMAL_MATRIX ) {

			return 'mat3';

		} else if ( scope === Object3DNode.POSITION || scope === Object3DNode.VIEW_POSITION || scope === Object3DNode.DIRECTION || scope === Object3DNode.SCALE ) {

			return 'vec3';

		}

	}

	update( frame ) {

		const object = this.object3d;
		const uniformNode = this._uniformNode;
		const scope = this.scope;

		if ( scope === Object3DNode.VIEW_MATRIX ) {

			uniformNode.value = object.modelViewMatrix;

		} else if ( scope === Object3DNode.NORMAL_MATRIX ) {

			uniformNode.value = object.normalMatrix;

		} else if ( scope === Object3DNode.WORLD_MATRIX ) {

			uniformNode.value = object.matrixWorld;

		} else if ( scope === Object3DNode.POSITION ) {

			uniformNode.value = uniformNode.value || new Vector3();

			uniformNode.value.setFromMatrixPosition( object.matrixWorld );

		} else if ( scope === Object3DNode.SCALE ) {

			uniformNode.value = uniformNode.value || new Vector3();

			uniformNode.value.setFromMatrixScale( object.matrixWorld );

		} else if ( scope === Object3DNode.DIRECTION ) {

			uniformNode.value = uniformNode.value || new Vector3();

			object.getWorldDirection( uniformNode.value );

		} else if ( scope === Object3DNode.VIEW_POSITION ) {

			const camera = frame.camera;

			uniformNode.value = uniformNode.value || new Vector3();
			uniformNode.value.setFromMatrixPosition( object.matrixWorld );

			uniformNode.value.applyMatrix4( camera.matrixWorldInverse );

		}

	}

	generate( builder ) {

		const scope = this.scope;

		if ( scope === Object3DNode.WORLD_MATRIX || scope === Object3DNode.VIEW_MATRIX ) {

			this._uniformNode.nodeType = 'mat4';

		} else if ( scope === Object3DNode.NORMAL_MATRIX ) {

			this._uniformNode.nodeType = 'mat3';

		} else if ( scope === Object3DNode.POSITION || scope === Object3DNode.VIEW_POSITION || scope === Object3DNode.DIRECTION || scope === Object3DNode.SCALE ) {

			this._uniformNode.nodeType = 'vec3';

		}

		return this._uniformNode.build( builder );

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

Object3DNode.VIEW_MATRIX = 'viewMatrix';
Object3DNode.NORMAL_MATRIX = 'normalMatrix';
Object3DNode.WORLD_MATRIX = 'worldMatrix';
Object3DNode.POSITION = 'position';
Object3DNode.SCALE = 'scale';
Object3DNode.VIEW_POSITION = 'viewPosition';
Object3DNode.DIRECTION = 'direction';

export default Object3DNode;

Object3DNode.type = /*@__PURE__*/ registerNode( 'Object3D', Object3DNode );

export const objectDirection = /*@__PURE__*/ nodeProxy( Object3DNode, Object3DNode.DIRECTION );
export const objectViewMatrix = /*@__PURE__*/ nodeProxy( Object3DNode, Object3DNode.VIEW_MATRIX );
export const objectNormalMatrix = /*@__PURE__*/ nodeProxy( Object3DNode, Object3DNode.NORMAL_MATRIX );
export const objectWorldMatrix = /*@__PURE__*/ nodeProxy( Object3DNode, Object3DNode.WORLD_MATRIX );
export const objectPosition = /*@__PURE__*/ nodeProxy( Object3DNode, Object3DNode.POSITION );
export const objectScale = /*@__PURE__*/ nodeProxy( Object3DNode, Object3DNode.SCALE );
export const objectViewPosition = /*@__PURE__*/ nodeProxy( Object3DNode, Object3DNode.VIEW_POSITION );
