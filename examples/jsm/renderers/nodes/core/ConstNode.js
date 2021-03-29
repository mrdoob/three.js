import CodeNode from './CodeNode.js';

class ConstNode extends CodeNode {

	constructor( code = '', type = '', name = '' ) {

		super( code, type );

		this.includes = [];

		this.name = name;

	}

	generate( builder, output ) {

		const code = super.generate( builder );

		const type = this.getType( builder );
		const nodeCode = builder.getCodeFromNode( this, type );

		if ( this.name !== '' ) {

			// use a custom property name

			nodeCode.name = this.name;

		}

		const propertyName = builder.getPropertyName( nodeCode );

		nodeCode.code = `#define ${propertyName} ${code}`;

		return builder.format( propertyName, type, output );

	}

}

export default ConstNode;
