import InputNode from './InputNode.js';

class UniformNode extends InputNode {

	constructor( value, nodeType = null ) {

		super( value, nodeType );

		this.isUniformNode = true;

	}

	getUniformHash( builder ) {

		return this.getHash( builder );

	}

	construct( builder ) {

		const hash = this.getUniformHash( builder );

		let sharedNode = builder.getNodeFromHash( hash );

		if ( sharedNode === undefined ) {

			builder.setHashNode( this, hash );

			sharedNode = this;

		}

		const sharedNodeType = sharedNode.getInputType( builder );

		this._nodeUniform = builder.getUniformFromNode( sharedNode, builder.shaderStage, sharedNodeType );

		return null;

	}

	generate( builder, output ) {

		if ( this._nodeUniform === undefined ) this.construct( builder ); // just-in-case -- this line shouldn't be required

		const type = this.getNodeType( builder );

		const propertyName = builder.getPropertyName( this._nodeUniform );

		return builder.format( propertyName, type, output );

	}

}

export default UniformNode;
