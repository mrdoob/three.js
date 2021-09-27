import CodeNode from './CodeNode.js';

class ConstNode extends CodeNode {

	constructor( code = '', type = '', name = '' ) {

		super( code, type );

		this.includes = [];

		this.name = name;

	}

	generate( builder ) {

		const code = super.generate( builder );

		const nodeCode = builder.getCodeFromNode( this, this.getNodeType( builder ) );

		if ( this.name !== '' ) {

			// use a custom property name

			nodeCode.name = this.name;

		}

		const propertyName = builder.getPropertyName( nodeCode );

		nodeCode.code = `#define ${propertyName} ${code}`;

		return propertyName;

	}

}

export default ConstNode;
