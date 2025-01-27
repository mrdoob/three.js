import { REVISION } from 'three/webgpu';
import * as TSL from 'three/tsl';

import { VariableDeclaration, Accessor } from './AST.js';

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
	'%=': 'remainderAssign',
	'^=': 'bitXorAssign',
	'&=': 'bitAndAssign',
	'|=': 'bitOrAssign',
	'<<=': 'shiftLeftAssign',
	'>>=': 'shiftRightAssign'
};

const unaryLib = {
	'+': '', // positive
	'-': 'negate',
	'~': 'bitNot',
	'!': 'not',
	'++': 'increment', // incrementBefore
	'--': 'decrement' // decrementBefore
};

const isPrimitive = ( value ) => /^(true|false|-?(\d|\.\d))/.test( value );

class TSLEncoder {

	constructor() {

		this.tab = '';
		this.imports = new Set();
		this.global = new Set();
		this.overloadings = new Map();
		this.iife = false;
		this.uniqueNames = false;
		this.reference = false;

		this._currentProperties = {};
		this._lastStatement = null;

	}

	addImport( name ) {

		// import only if it's a node

		name = name.split( '.' )[ 0 ];

		if ( TSL[ name ] !== undefined && this.global.has( name ) === false && this._currentProperties[ name ] === undefined ) {

			this.imports.add( name );

		}

	}

	emitUniform( node ) {

		let code = `const ${ node.name } = `;

		if ( this.reference === true ) {

			this.addImport( 'reference' );

			this.global.add( node.name );

			//code += `reference( '${ node.name }', '${ node.type }', uniforms )`;

			// legacy
			code += `reference( 'value', '${ node.type }', uniforms[ '${ node.name }' ] )`;

		} else {

			this.addImport( 'uniform' );

			this.global.add( node.name );

			code += `uniform( '${ node.type }' )`;

		}

		return code;

	}

	emitExpression( node ) {

		let code;

		/*@TODO: else if ( node.isVarying ) {

			code = this.emitVarying( node );

		}*/

		if ( node.isAccessor ) {

			this.addImport( node.property );

			code = node.property;

		} else if ( node.isNumber ) {

			if ( node.type === 'int' || node.type === 'uint' ) {

				code = node.type + '( ' + node.value + ' )';

				this.addImport( node.type );

			} else {

				code = node.value;

			}

		} else if ( node.isString ) {

			code = '\'' + node.value + '\'';

		} else if ( node.isOperator ) {

			const opFn = opLib[ node.type ] || node.type;

			const left = this.emitExpression( node.left );
			const right = this.emitExpression( node.right );

			if ( isPrimitive( left ) && isPrimitive( right ) ) {

				return left + ' ' + node.type + ' ' + right;

			}

			if ( isPrimitive( left ) ) {

				code = opFn + '( ' + left + ', ' + right + ' )';

				this.addImport( opFn );

			} else if ( opFn === '.' ) {

				code = left + opFn + right;

			} else {

				code = left + '.' + opFn + '( ' + right + ' )';

			}

		} else if ( node.isFunctionCall ) {

			const params = [];

			for ( const parameter of node.params ) {

				params.push( this.emitExpression( parameter ) );

			}

			this.addImport( node.name );

			const paramsStr = params.length > 0 ? ' ' + params.join( ', ' ) + ' ' : '';

			code = `${ node.name }(${ paramsStr })`;

		} else if ( node.isReturn ) {

			code = 'return';

			if ( node.value ) {

				code += ' ' + this.emitExpression( node.value );

			}

		} else if ( node.isAccessorElements ) {

			code = this.emitExpression( node.object );

			for ( const element of node.elements ) {

				if ( element.isStaticElement ) {

					code += '.' + this.emitExpression( element.value );

				} else if ( element.isDynamicElement ) {

					const value = this.emitExpression( element.value );

					if ( isPrimitive( value ) ) {

						code += `[ ${ value } ]`;

					} else {

						code += `.element( ${ value } )`;

					}

				}

			}

		} else if ( node.isDynamicElement ) {

			code = this.emitExpression( node.value );

		} else if ( node.isStaticElement ) {

			code = this.emitExpression( node.value );

		} else if ( node.isFor ) {

			code = this.emitFor( node );

		} else if ( node.isVariableDeclaration ) {

			code = this.emitVariables( node );

		} else if ( node.isUniform ) {

			code = this.emitUniform( node );

		} else if ( node.isTernary ) {

			code = this.emitTernary( node );

		} else if ( node.isConditional ) {

			code = this.emitConditional( node );

		} else if ( node.isUnary && node.expression.isNumber ) {

			code = node.expression.type + '( ' + node.type + ' ' + node.expression.value + ' )';

			this.addImport( node.expression.type );

		} else if ( node.isUnary ) {

			let type = unaryLib[ node.type ];

			if ( node.after === false && ( node.type === '++' || node.type === '--' ) ) {

				type += 'Before';

			}

			const exp = this.emitExpression( node.expression );

			if ( isPrimitive( exp ) ) {

				this.addImport( type );

				code = type + '( ' + exp + ' )';

			} else {

				code = exp + '.' + type + '()';

			}

		} else {

			console.warn( 'Unknown node type', node );

		}

		if ( ! code ) code = '/* unknown statement */';

		return code;

	}

	emitBody( body ) {

		this.setLastStatement( null );

		let code = '';

		this.tab += '\t';

		for ( const statement of body ) {

			code += this.emitExtraLine( statement );
			code += this.tab + this.emitExpression( statement );

			if ( code.slice( - 1 ) !== '}' ) code += ';';

			code += '\n';

			this.setLastStatement( statement );

		}

		code = code.slice( 0, - 1 ); // remove the last extra line

		this.tab = this.tab.slice( 0, - 1 );

		return code;


	}

	emitTernary( node ) {

		const condStr = this.emitExpression( node.cond );
		const leftStr = this.emitExpression( node.left );
		const rightStr = this.emitExpression( node.right );

		this.addImport( 'select' );

		return `select( ${ condStr }, ${ leftStr }, ${ rightStr } )`;

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

				ifStr += `.ElseIf( ${ elseCondStr }, () => {

${ elseBodyStr }

${ this.tab }} )`;

			} else {

				ifStr += `.Else( () => {

${ elseBodyStr }

${ this.tab }} )`;

			}

			current = current.elseConditional;


		}

		this.imports.add( 'If' );

		return ifStr;

	}

	emitLoop( node ) {

		const start = this.emitExpression( node.initialization.value );
		const end = this.emitExpression( node.condition.right );

		const name = node.initialization.name;
		const type = node.initialization.type;
		const condition = node.condition.type;
		const update = node.afterthought.type;

		const nameParam = name !== 'i' ? `, name: '${ name }'` : '';
		const typeParam = type !== 'int' ? `, type: '${ type }'` : '';
		const conditionParam = condition !== '<' ? `, condition: '${ condition }'` : '';
		const updateParam = update !== '++' ? `, update: '${ update }'` : '';

		let loopStr = `Loop( { start: ${ start }, end: ${ end + nameParam + typeParam + conditionParam + updateParam } }, ( { ${ name } } ) => {\n\n`;

		loopStr += this.emitBody( node.body ) + '\n\n';

		loopStr += this.tab + '} )';

		this.imports.add( 'Loop' );

		return loopStr;

	}

	emitFor( node ) {

		const { initialization, condition, afterthought } = node;

		if ( ( initialization && initialization.isVariableDeclaration && initialization.next === null ) &&
			( condition && condition.left.isAccessor && condition.left.property === initialization.name ) &&
			( afterthought && afterthought.isUnary ) &&
			( initialization.name === afterthought.expression.property )
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

		forStr += this.tab + '} )\n\n';

		this.tab = this.tab.slice( 0, - 1 );

		forStr += this.tab + '}';

		this.imports.add( 'While' );

		return forStr;

	}

	emitVariables( node, isRoot = true ) {

		const { name, type, value, next } = node;

		const valueStr = value ? this.emitExpression( value ) : '';

		let varStr = isRoot ? 'const ' : '';
		varStr += name;

		if ( value ) {

			if ( value.isFunctionCall && value.name === type ) {

				varStr += ' = ' + valueStr;

			} else {

				varStr += ` = ${ type }( ${ valueStr } )`;

			}

		} else {

			varStr += ` = ${ type }()`;

		}

		if ( node.immutable === false ) {

			varStr += '.toVar()';

		}

		if ( next ) {

			varStr += ', ' + this.emitVariables( next, false );

		}

		this.addImport( type );

		return varStr;

	}

	/*emitVarying( node ) { }*/

	emitOverloadingFunction( nodes ) {

		const { name } = nodes[ 0 ];

		this.addImport( 'overloadingFn' );

		const prefix = this.iife === false ? 'export ' : '';

		return `${ prefix }const ${ name } = /*#__PURE__*/ overloadingFn( [ ${ nodes.map( node => node.name + '_' + nodes.indexOf( node ) ).join( ', ' ) } ] );\n`;

	}

	emitFunction( node ) {

		const { name, type } = node;

		this._currentProperties = { name: node };

		const params = [];
		const inputs = [];
		const mutableParams = [];

		let hasPointer = false;

		for ( const param of node.params ) {

			let str = `{ name: '${ param.name }', type: '${ param.type }'`;

			let name = param.name;

			if ( param.immutable === false && ( param.qualifier !== 'inout' && param.qualifier !== 'out' ) ) {

				name = name + '_immutable';

				mutableParams.push( param );

			}

			if ( param.qualifier ) {

				if ( param.qualifier === 'inout' || param.qualifier === 'out' ) {

					hasPointer = true;

				}

				str += ', qualifier: \'' + param.qualifier + '\'';

			}

			inputs.push( str + ' }' );
			params.push( name );

			this._currentProperties[ name ] = param;

		}

		for ( const param of mutableParams ) {

			node.body.unshift( new VariableDeclaration( param.type, param.name, new Accessor( param.name + '_immutable' ) ) );

		}

		const paramsStr = params.length > 0 ? ' [ ' + params.join( ', ' ) + ' ] ' : '';
		const bodyStr = this.emitBody( node.body );

		let fnName = name;
		let overloadingNodes = null;

		if ( this.overloadings.has( name ) ) {

			const overloadings = this.overloadings.get( name );

			if ( overloadings.length > 1 ) {

				const index = overloadings.indexOf( node );

				fnName += '_' + index;

				if ( index === overloadings.length - 1 ) {

					overloadingNodes = overloadings;

				}

			}

		}

		const prefix = this.iife === false ? 'export ' : '';

		let funcStr = `${ prefix }const ${ fnName } = /*#__PURE__*/ Fn( (${ paramsStr }) => {

${ bodyStr }

${ this.tab }} )`;

		const layoutInput = inputs.length > 0 ? '\n\t\t' + this.tab + inputs.join( ',\n\t\t' + this.tab ) + '\n\t' + this.tab : '';

		if ( node.layout !== false && hasPointer === false ) {

			const uniqueName = this.uniqueNames ? fnName + '_' + Math.random().toString( 36 ).slice( 2 ) : fnName;

			funcStr += `.setLayout( {
${ this.tab }\tname: '${ uniqueName }',
${ this.tab }\ttype: '${ type }',
${ this.tab }\tinputs: [${ layoutInput }]
${ this.tab }} )`;

		}

		funcStr += ';\n';

		this.imports.add( 'Fn' );

		this.global.add( node.name );

		if ( overloadingNodes !== null ) {

			funcStr += '\n' + this.emitOverloadingFunction( overloadingNodes );

		}

		return funcStr;

	}

	setLastStatement( statement ) {

		this._lastStatement = statement;

	}

	emitExtraLine( statement ) {

		const last = this._lastStatement;
		if ( last === null ) return '';

		if ( statement.isReturn ) return '\n';

		const isExpression = ( st ) => st.isFunctionDeclaration !== true && st.isFor !== true && st.isConditional !== true;
		const lastExp = isExpression( last );
		const currExp = isExpression( statement );

		if ( lastExp !== currExp || ( ! lastExp && ! currExp ) ) return '\n';

		return '';

	}

	emit( ast ) {

		let code = '\n';

		if ( this.iife ) this.tab += '\t';

		const overloadings = this.overloadings;

		for ( const statement of ast.body ) {

			if ( statement.isFunctionDeclaration ) {

				if ( overloadings.has( statement.name ) === false ) {

					overloadings.set( statement.name, [] );

				}

				overloadings.get( statement.name ).push( statement );

			}

		}

		for ( const statement of ast.body ) {

			code += this.emitExtraLine( statement );

			if ( statement.isFunctionDeclaration ) {

				code += this.tab + this.emitFunction( statement );

			} else {

				code += this.tab + this.emitExpression( statement ) + ';\n';

			}

			this.setLastStatement( statement );

		}

		const imports = [ ...this.imports ];
		const exports = [ ...this.global ];

		let header = '// Three.js Transpiler r' + REVISION + '\n\n';
		let footer = '';

		if ( this.iife ) {

			header += '( function ( TSL, uniforms ) {\n\n';

			header += imports.length > 0 ? '\tconst { ' + imports.join( ', ' ) + ' } = TSL;\n' : '';
			footer += exports.length > 0 ? '\treturn { ' + exports.join( ', ' ) + ' };\n' : '';

			footer += '\n} );';

		} else {

			header += imports.length > 0 ? 'import { ' + imports.join( ', ' ) + ' } from \'three/tsl\';\n' : '';

		}

		return header + code + footer;

	}

}

export default TSLEncoder;
