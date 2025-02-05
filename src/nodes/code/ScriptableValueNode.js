import Node from '../core/Node.js';
import { arrayBufferToBase64, base64ToArrayBuffer } from '../core/NodeUtils.js';
import { nodeProxy, float } from '../tsl/TSLBase.js';

import { EventDispatcher } from '../../core/EventDispatcher.js';

/**
 * `ScriptableNode` uses this class to manage script inputs and outputs.
 *
 * @augments Node
 */
class ScriptableValueNode extends Node {

	static get type() {

		return 'ScriptableValueNode';

	}

	/**
	 * Constructs a new scriptable node.
	 *
	 * @param {any} [value=null] - The value.
	 */
	constructor( value = null ) {

		super();

		/**
		 * A reference to the value.
		 *
		 * @private
		 * @default null
		 */
		this._value = value;

		/**
		 * Depending on the type of `_value`, this property might cache parsed data.
		 *
		 * @private
		 * @default null
		 */
		this._cache = null;

		/**
		 * If this node represents an input, this property represents the input type.
		 *
		 * @type {?string}
		 * @default null
		 */
		this.inputType = null;

		/**
		 * If this node represents an output, this property represents the output type.
		 *
		 * @type {?string}
		 * @default null
		 */
		this.outputType = null;

		/**
		 * An event dispatcher for managing events.
		 *
		 * @type {EventDispatcher}
		 */
		this.events = new EventDispatcher();

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isScriptableValueNode = true;

	}

	/**
	 * Whether this node represents an output or not.
	 *
	 * @type {boolean}
	 * @readonly
	 * @default true
	 */
	get isScriptableOutputNode() {

		return this.outputType !== null;

	}

	set value( val ) {

		if ( this._value === val ) return;

		if ( this._cache && this.inputType === 'URL' && this.value.value instanceof ArrayBuffer ) {

			URL.revokeObjectURL( this._cache );

			this._cache = null;

		}

		this._value = val;

		this.events.dispatchEvent( { type: 'change' } );

		this.refresh();

	}

	/**
	 * The node's value.
	 *
	 * @type {any}
	 */
	get value() {

		return this._value;

	}

	/**
	 * Dispatches the `refresh` event.
	 */
	refresh() {

		this.events.dispatchEvent( { type: 'refresh' } );

	}

	/**
	 * The `value` property usually represents a node or even binary data in form of array buffers.
	 * In this case, this method tries to return the actual value behind the complex type.
	 *
	 * @return {any} The value.
	 */
	getValue() {

		const value = this.value;

		if ( value && this._cache === null && this.inputType === 'URL' && value.value instanceof ArrayBuffer ) {

			this._cache = URL.createObjectURL( new Blob( [ value.value ] ) );

		} else if ( value && value.value !== null && value.value !== undefined && (
			( ( this.inputType === 'URL' || this.inputType === 'String' ) && typeof value.value === 'string' ) ||
			( this.inputType === 'Number' && typeof value.value === 'number' ) ||
			( this.inputType === 'Vector2' && value.value.isVector2 ) ||
			( this.inputType === 'Vector3' && value.value.isVector3 ) ||
			( this.inputType === 'Vector4' && value.value.isVector4 ) ||
			( this.inputType === 'Color' && value.value.isColor ) ||
			( this.inputType === 'Matrix3' && value.value.isMatrix3 ) ||
			( this.inputType === 'Matrix4' && value.value.isMatrix4 )
		) ) {

			return value.value;

		}

		return this._cache || value;

	}

	/**
	 * Overwritten since the node type is inferred from the value.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {string} The node type.
	 */
	getNodeType( builder ) {

		return this.value && this.value.isNode ? this.value.getNodeType( builder ) : 'float';

	}

	setup() {

		return this.value && this.value.isNode ? this.value : float();

	}

	serialize( data ) {

		super.serialize( data );

		if ( this.value !== null ) {

			if ( this.inputType === 'ArrayBuffer' ) {

				data.value = arrayBufferToBase64( this.value );

			} else {

				data.value = this.value ? this.value.toJSON( data.meta ).uuid : null;

			}

		} else {

			data.value = null;

		}

		data.inputType = this.inputType;
		data.outputType = this.outputType;

	}

	deserialize( data ) {

		super.deserialize( data );

		let value = null;

		if ( data.value !== null ) {

			if ( data.inputType === 'ArrayBuffer' ) {

				value = base64ToArrayBuffer( data.value );

			} else if ( data.inputType === 'Texture' ) {

				value = data.meta.textures[ data.value ];

			} else {

				value = data.meta.nodes[ data.value ] || null;

			}

		}

		this.value = value;

		this.inputType = data.inputType;
		this.outputType = data.outputType;

	}

}

export default ScriptableValueNode;

/**
 * TSL function for creating a scriptable value node.
 *
 * @tsl
 * @function
 * @param {any} [value=null] - The value.
 * @returns {ScriptableValueNode}
 */
export const scriptableValue = /*@__PURE__*/ nodeProxy( ScriptableValueNode );
