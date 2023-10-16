const opLib = {
	'=': 'assign',
	'+': 'add',
	'-': 'sub',
	'*': 'mul',
	'/': 'div',
	'%': 'mod'
};

const isNumber = ( value ) => Number.isNaN( parseFloat( value ) ) === false;

class TSLEncoder {

	constructor() {

	}

	emitExpression( node ) {

		let code;

		if ( node.isAccessor || node.isNumber ) {

			code = node.value;

		} else if ( node.isOperator ) {

			const opFn = opLib[ node.type ] || node.type;

			const left = this.emitExpression( node.left );
			const right = this.emitExpression( node.right );

			if ( isNumber( left ) && isNumber( right ) ) {

				return eval( left + node.type + right );

			}

			if ( isNumber( left ) ) {

				code = opFn + '( ' + left + ', ' + right + ' )';

			} else {

				code = left + '.' + opFn + '( ' + right + ' )';

			}

		} else if ( node.isFunctionCall ) {

			const params = [];

			for ( const parameter of node.params ) {

				params.push( this.emitExpression( parameter ) );

			}

			code = `${ node.name }( ${ params.join( ', ' ) } )`;

		} else if ( node.isReturn ) {

			code = `return ${ this.emitExpression( node.value ) }`;

		} else if ( node.isVariableDeclaration ) {

			code = this.emitVariableDeclaration( node );

		} else {

			console.error( 'Unknown node type', node );

		}

		return code;

	}

	emitBody( body, tab = '\t' ) {

		let code = '';

		for ( const statement of body ) {

			code += tab + this.emitExpression( statement ) + ';\n';

		}

		return code;


	}

	emitVariableDeclaration( node ) {

		const { name, /*type,*/ value } = node;

		const valueStr = value ? this.emitExpression( value ) : '';
		//const varStr = `const ${ name } = ${ type }( ${ valueStr } )`;
		const varStr = `const ${ name } = ${ valueStr }`;

		return varStr;

	}

	emitFunctionDeclaration( node ) {

		const { name, type } = node;

		const params = [];
		const inputs = [];

		for ( const param of node.params ) {

			params.push( param.name );
			inputs.push( `{ name: '${ param.name }', type: '${ param.type }' }` );

		}

		const paramsStr = params.length > 0 ? '{ ' + params.join( ', ' ) + ' }' : '';
		const bodyStr = this.emitBody( node.body );

		const funcStr = `const ${ name } = tslFn( ( ${ paramsStr } ) => {

${ bodyStr }
			
} ).setLayout( {
	name: '${ name }',
	type: '${ type }',
	inputs: [\n\t\t${ inputs.join( ',\n\t\t' ) }\n\t]
} );\n\n`;

		return funcStr;

	}

	emit( ast ) {

		let code = '';

		for ( const statement of ast.body ) {

			if ( statement.isFunctionDeclaration ) {

				code += this.emitFunctionDeclaration( statement );

			} else {

				code += this.emitExpression( statement ) + ';\n';

			}

		}

		return code;

	}

}

export default TSLEncoder;
