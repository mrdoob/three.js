import Node from '../core/Node.js';
import { NodeUpdateType } from '../core/constants.js';
import UniformNode from '../core/UniformNode.js';
import { nodeProxy } from '../tsl/TSLBase.js';
import { Vector3 } from '../../math/Vector3.js';

/** @module Object3DNode **/

/**
 * This node can be used to access transformation related metrics of 3D objects.
 * Depending on the selected scope, a different metric is represented as a uniform
 * in the shader. The following scopes are supported:
 *
 * - `POSITION`: The object's position in world space.
 * - `VIEW_POSITION`: The object's position in view/camera space.
 * - `DIRECTION`: The object's direction in world space.
 * - `SCALE`: The object's scale in world space.
 * - `WORLD_MATRIX`: The object's matrix in world space.
 *
 * @augments Node
 */
class Object3DNode extends Node {

	static get type() {

		return 'Object3DNode';

	}

	/**
	 * Constructs a new object 3D node.
	 *
	 * @param {('position'|'viewPosition'|'direction'|'scale'|'worldMatrix')} scope - The node represents a different type of transformation depending on the scope.
	 * @param {Object3D?} [object3d=null] - The 3D object.
	 */
	constructor( scope, object3d = null ) {

		super();

		/**
		 * The node reports a different type of transformation depending on the scope.
		 *
		 * @type {('position'|'viewPosition'|'direction'|'scale'|'worldMatrix')}
		 */
		this.scope = scope;

		/**
		 * The 3D object.
		 *
		 * @type {Object3D?}
		 * @default null
		 */
		this.object3d = object3d;

		/**
		 * Overwritten since this type of node is updated per object.
		 *
		 * @type {String}
		 * @default 'object'
		 */
		this.updateType = NodeUpdateType.OBJECT;

		/**
		 * Holds the value of the node as a uniform.
		 *
		 * @private
		 * @type {UniformNode}
		 */
		this._uniformNode = new UniformNode( null );

	}

	/**
	 * Overwritten since the node type is inferred from the scope.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {String} The node type.
	 */
	getNodeType() {

		const scope = this.scope;

		if ( scope === Object3DNode.WORLD_MATRIX ) {

			return 'mat4';

		} else if ( scope === Object3DNode.POSITION || scope === Object3DNode.VIEW_POSITION || scope === Object3DNode.DIRECTION || scope === Object3DNode.SCALE ) {

			return 'vec3';

		}

	}

	/**
	 * Updates the uniform value depending on the scope.
	 *
	 * @param {NodeFrame} frame - The current node frame.
	 */
	update( frame ) {

		const object = this.object3d;
		const uniformNode = this._uniformNode;
		const scope = this.scope;

		if ( scope === Object3DNode.WORLD_MATRIX ) {

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

	/**
	 * Generates the code snippet of the uniform node. The node type of the uniform
	 * node also depends on the selected scope.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {String} The generated code snippet.
	 */
	generate( builder ) {

		const scope = this.scope;

		if ( scope === Object3DNode.WORLD_MATRIX ) {

			this._uniformNode.nodeType = 'mat4';

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

Object3DNode.WORLD_MATRIX = 'worldMatrix';
Object3DNode.POSITION = 'position';
Object3DNode.SCALE = 'scale';
Object3DNode.VIEW_POSITION = 'viewPosition';
Object3DNode.DIRECTION = 'direction';

export default Object3DNode;

/**
 * TSL function for creating an object 3D node that represents the object's direction in world space.
 *
 * @function
 * @param {Object3D?} [object3d=null] - The 3D object.
 * @returns {Object3DNode<vec3>}
 */
export const objectDirection = /*@__PURE__*/ nodeProxy( Object3DNode, Object3DNode.DIRECTION );

/**
 * TSL function for creating an object 3D node that represents the object's world matrix.
 *
 * @function
 * @param {Object3D?} [object3d=null] - The 3D object.
 * @returns {Object3DNode<mat4>}
 */
export const objectWorldMatrix = /*@__PURE__*/ nodeProxy( Object3DNode, Object3DNode.WORLD_MATRIX );

/**
 * TSL function for creating an object 3D node that represents the object's position in world space.
 *
 * @function
 * @param {Object3D?} [object3d=null] - The 3D object.
 * @returns {Object3DNode<vec3>}
 */
export const objectPosition = /*@__PURE__*/ nodeProxy( Object3DNode, Object3DNode.POSITION );

/**
 * TSL function for creating an object 3D node that represents the object's scale in world space.
 *
 * @function
 * @param {Object3D?} [object3d=null] - The 3D object.
 * @returns {Object3DNode<vec3>}
 */
export const objectScale = /*@__PURE__*/ nodeProxy( Object3DNode, Object3DNode.SCALE );

/**
 * TSL function for creating an object 3D node that represents the object's position in view/camera space.
 *
 * @function
 * @param {Object3D?} [object3d=null] - The 3D object.
 * @returns {Object3DNode<vec3>}
 */
export const objectViewPosition = /*@__PURE__*/ nodeProxy( Object3DNode, Object3DNode.VIEW_POSITION );
