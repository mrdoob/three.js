import { REVISION } from 'three';
import { getNodeElement } from 'three/nodes';

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
		this.imports = new Set();
		this.layoutsCode = '';

	}

	addImport( name ) {

		// import only if it's a node

		if ( getNodeElement( name ) !== undefined ) {

			this.imports.add( name );

		}

	}

	emitExpression( node ) {

		let code;

		if ( node.isAccessor || node.isNumber ) {

			if ( node.isAccessor ) this.addImport( node.value.split( '.' )[ 0 ] );

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

			this.addImport( node.name );

			code = `${ node.name }( ${ params.join( ', ' ) } )`;

		} else if ( node.isReturn ) {

			code = `return ${ this.emitExpression( node.value ) }`;

		} else if ( node.isFor ) {

			code = this.emitFor( node );

		} else if ( node.isVariableDeclaration ) {

			code = this.emitVariableDeclaration( node );

		} else if ( node.isConditional ) {

			code = this.emitConditional( node );

		} else if ( node.isUnary && node.expression.isNumber ) {

			code = node.type + node.expression.value;

		} else if ( node.isUnary ) {

			let type = unaryLib[ node.type ];

			if ( node.after === false && ( node.type === '++' || node.type === '--' ) ) {

				type += 'Before';

			}

			code = type + '( ' + this.emitExpression( node.expression ) + ' )';

		} else {

			console.error( 'Unknown node type', node );

		}

		if ( ! code ) code = '// unknown statement';

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

			} else if ( statement.isFor ) {

				code = '\n' + this.tab + code + '\n';

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

		let ifStr = `If( ${ condStr }, () => {

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

	emitLoop( node ) {

		const start = this.emitExpression( node.initialization.value );
		const end = this.emitExpression( node.condition.right );
		const name = node.initialization.name;
		const nameParam = name !== 'i' ? `, name: '${ name }'` : '';

		let loopStr = `loop( { start: ${ start }, end: ${ end + nameParam } }, ( { ${ name } } ) => {\n\n`;

		loopStr += this.emitBody( node.body ) + '\n\n';

		loopStr += this.tab + '} );\n\n';

		return loopStr;

	}

	emitFor( node ) {

		const { initialization, condition, afterthought } = node;

		if ( ( initialization && initialization.isVariableDeclaration && initialization.next === null ) &&
			( condition && condition.type === '<' && condition.left.isAccessor ) &&
			( afterthought && afterthought.type === '++' ) &&
			( initialization.name === condition.left.value ) &&
			( initialization.name === afterthought.expression.value )
		) {

			return this.emitLoop( node );

		}

		return this.emitForWhile( node );

	}

	emitForWhile( node ) {

		const initialization = this.emitExpression( node.initialization );
		const condition = this.emitExpression( node.condition );
		const afterthought = this.emitExpression( node.afterthought );

		this.tab += '\t';

		let forStr = '{\n\n' + this.tab + initialization + ';\n\n';
		forStr += `${ this.tab }While( ${ condition }, () => {\n\n`;

		forStr += this.emitBody( node.body ) + '\n\n';

		forStr += this.tab + '\t' + afterthought + ';\n\n';

		forStr += this.tab + '} );\n\n';

		this.tab = this.tab.slice( 0, - 1 );

		forStr += this.tab + '}';

		return forStr;

	}

	emitVariableDeclaration( node, isRoot = true ) {

		const { name, type, value, next } = node;

		const valueStr = value ? this.emitExpression( value ) : '';

		let varStr = isRoot ? 'const ' : '';
		varStr += name;

		if ( value ) {

			varStr += ` = ${ type }( ${ valueStr } )`;

		} else {

			varStr += ` = ${ type }()`;

		}

		if ( next ) {

			varStr += ', ' + this.emitVariableDeclaration( next, false );

		}

		this.addImport( type );

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

} )\n\n`;

		this.layoutsCode += `${ name }.setLayout( {
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

		const imports = [ ...this.imports ];

		const header = '// Three.js Transpiler r' + REVISION + '\n\n';
		const importStr = imports.length > 0 ? 'import { ' + imports.join( ', ' ) + ' } from \'three/nodes\';\n\n' : '';

		const layouts = this.layoutsCode.length > 0 ? '\n\n// layouts\n\n' + this.layoutsCode : '';

		return header + importStr + code + layouts;

	}

}

export default TSLEncoder;
