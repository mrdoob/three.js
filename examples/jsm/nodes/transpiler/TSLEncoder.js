const opLib = {
	'=': 'assign',
	'+': 'add',
	'-': 'sub',
	'*': 'mul',
	'/': 'div',
	'%': 'remainder',
	'<': 'lessThan',
	'>': 'greaterThan',
	'<=': 'lessThanEqual',
	'>=': 'greaterThanEqual',
	'==': 'equal',
	'&&': 'and',
	'||': 'or',
	'^^': 'xor',
	'&': 'bitAnd',
	'|': 'bitOr',
	'^': 'bitXor',
	'<<': 'shiftLeft',
	'>>': 'shiftRight',
	'+=': 'addAssign',
	'-=': 'subAssign',
	'*=': 'mulAssign',
	'/=': 'divAssign',
	'%=': 'remainderAssign'
};

const unaryLib = {
	'+': '', // positive
	'-': 'negate',
	'~': 'bitNot',
	'!': 'not',
	'++': 'increment', // incrementBefore
	'--': 'decrement' // decrementBefore
};

const isPrimitive = ( value ) => /^(true|false|-?\d)/.test( value );

class TSLEncoder {

	constructor() {

		this.tab = '';

	}

	emitExpression( node ) {

		let code;

		if ( node.isAccessor || node.isNumber ) {

			code = node.value;

		} else if ( node.isOperator ) {

			const opFn = opLib[ node.type ] || node.type;

			const left = this.emitExpression( node.left );
			const right = this.emitExpression( node.right );

			if ( isPrimitive( left ) && isPrimitive( right ) ) {

				return eval( left + node.type + right );

			}

			if ( isPrimitive( left ) ) {

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

		} else if ( node.isConditional ) {

			code = this.emitConditional( node );

		} else if ( node.isUnary ) {

			code = unaryLib[ node.type ] + '( ' + this.emitExpression( node.expression ) + ' )';

		} else {

			console.error( 'Unknown node type', node );

		}

		if ( ! code ) code = '// unknown keyword';

		return code;

	}

	emitBody( body ) {

		const lines = [];

		this.tab += '\t';

		for ( const statement of body ) {

			let code = this.emitExpression( statement );

			if ( statement.isConditional ) {

				code = '\n' + this.tab + code + ';';

				if ( statement !== body[ body.length - 1 ] ) {

					code += '\n';

				}

			} else {

				code = this.tab + code + ';';

			}

			lines.push( code );

		}

		this.tab = this.tab.slice( 0, - 1 );

		return lines.join( '\n' );


	}

	emitConditional( node ) {

		const condStr = this.emitExpression( node.cond );
		const bodyStr = this.emitBody( node.body );

		let ifStr = `If ( ${ condStr }, () => {

${ bodyStr } 

${ this.tab }} )`;

		let current = node;

		while ( current.elseConditional ) {

			const elseBodyStr = this.emitBody( current.elseConditional.body );

			if ( current.elseConditional.cond ) {

				const elseCondStr = this.emitExpression( current.elseConditional.cond );

				ifStr += `.elseif( ( ${ elseCondStr } ) => {

${ elseBodyStr }

${ this.tab }} )`;

			} else {

				ifStr += `.else( () => {

${ elseBodyStr }

${ this.tab }} )`;

			}

			current = current.elseConditional;


		}

		return ifStr;

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

			let str = `{ name: '${ param.name }', type: '${ param.type }'`;

			if ( param.qualifier ) {

				str += ', qualifier: \'' + param.qualifier + '\'';

			}

			inputs.push( str + ' }' );
			params.push( param.name );

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
