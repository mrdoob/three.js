import Node from '../core/Node.js';
import { nodeObject } from '../tsl/TSLBase.js';

class ComputeBuiltinNode extends Node {

	static get type() {

		return 'ComputeBuiltinNode';

	}

	constructor( builtinName, nodeType ) {

		super( nodeType );

		this._builtinName = builtinName;

	}

	getHash( builder ) {

		return this.getBuiltinName( builder );

	}

	getNodeType( /*builder*/ ) {

		return this.nodeType;

	}

	setBuiltinName( builtinName ) {

		this._builtinName = builtinName;

		return this;

	}

	getBuiltinName( /*builder*/ ) {

		return this._builtinName;

	}

	hasBuiltin( builder ) {

		builder.hasBuiltin( this._builtinName );

	}

	generate( builder, output ) {

		const builtinName = this.getBuiltinName( builder );
		const nodeType = this.getNodeType( builder );

		if ( builder.shaderStage === 'compute' ) {

			return builder.format( builtinName, nodeType, output );

		} else {

			console.warn( `ComputeBuiltinNode: Compute built-in value ${builtinName} can not be accessed in the ${builder.shaderStage} stage` );
			return builder.generateConst( nodeType );

		}

	}

	serialize( data ) {

		super.serialize( data );

		data.global = this.global;
		data._builtinName = this._builtinName;

	}

	deserialize( data ) {

		super.deserialize( data );

		this.global = data.global;
		this._builtinName = data._builtinName;

	}

}

export default ComputeBuiltinNode;

const computeBuiltin = ( name, nodeType ) => nodeObject( new ComputeBuiltinNode( name, nodeType ) );

export const numWorkgroups = /*@__PURE__*/ computeBuiltin( 'numWorkgroups', 'uvec3' );
export const workgroupId = /*@__PURE__*/ computeBuiltin( 'workgroupId', 'uvec3' );
export const localId = /*@__PURE__*/ computeBuiltin( 'localId', 'uvec3' );
export const subgroupSize = /*@__PURE__*/ computeBuiltin( 'subgroupSize', 'uint' );

