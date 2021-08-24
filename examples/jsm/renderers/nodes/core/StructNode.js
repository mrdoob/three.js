import CodeNode from './CodeNode.js';
import StructVarNode from './StructVarNode.js';

class StructNode extends CodeNode {

	constructor( inputs = {}, name = '' ) {

		super();

		this.inputs = inputs;
		this.name = name;

	}

	getType( builder ) {

		if ( this.name !== '' ) {

			return this.name;

		} else {

			const codeNode = builder.getCodeFromNode( this, 'code' );

			return codeNode.name;

		}

	}

	create( inputs = {} ) {

		return new StructVarNode( this, inputs );

	}

	generate( builder, output ) {

		const type = this.getType( builder );
		const inputs = this.inputs;

		let code = `struct ${type} {\n`;

		for ( const inputName in inputs ) {

			const inputType = inputs[ inputName ];

			code += `\t${inputType} ${inputName};\n`;

		}

		code += `};`;

		this.code = code;

		super.generate( builder, output );

		if ( output === 'var' ) {

			const nodeData = builder.getDataFromNode( this );

			if ( nodeData.index === undefined ) {

				nodeData.index = 0;

			}

			return `structVar${nodeData.index ++}`;

		} else {

			return code;

		}

	}

}

export default StructNode;
