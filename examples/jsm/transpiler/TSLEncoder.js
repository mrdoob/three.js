import { REVISION } from 'three/webgpu';
import * as TSL from 'three/tsl';

import { VariableDeclaration, Accessor } from './AST.js';
import { isExpression, isPrimitive } from './TranspilerUtils.js';

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
	'!=': 'notEqual',
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

const textureLookupFunctions = [ 'texture', 'texture2D', 'texture3D', 'textureCube', 'textureLod', 'texelFetch', 'textureGrad' ];

class TSLEncoder {

	constructor() {

		this.tab = '';
		this.imports = new Set();
		this.global = new Set();
		this.overloadings = new Map();
		this.iife = false;
		this.reference = false;

		this.block = null;

	}

	addImport( name ) {

		// import only if it's a node

		name = name.split( '.' )[ 0 ];

		if ( TSL[ name ] !== undefined && this.global.has( name ) === false ) {

			this.imports.add( name );

		}

	}

	emitUniform( node ) {

		let code = `const ${ node.name } = `;
		this.global.add( node.name );

		if ( this.reference === true ) {

			this.addImport( 'reference' );

			//code += `reference( '${ node.name }', '${ node.type }', uniforms )`;

			// legacy
			code += `reference( 'value', '${ node.type }', uniforms[ '${ node.name }' ] )`;

		} else {

			if ( node.type === 'texture' ) {

				this.addImport( 'texture' );

				code += 'texture( /* <THREE.Texture> */ )';

			} else if ( node.type === 'cubeTexture' ) {

				this.addImport( 'cubeTexture' );

				code += 'cubeTexture( /* <THREE.CubeTexture> */ )';

			} else if ( node.type === 'texture3D' ) {

				this.addImport( 'texture3D' );

				code += 'texture3D( /* <THREE.Data3DTexture> */ )';

			} else {

				// default uniform

				this.addImport( 'uniform' );

				code += `uniform( '${ node.type }' )`;

			}

		}

		return code;

	}

	emitExpression( node, output = null ) {

		let code;

		if ( node.isAccessor ) {

			if ( node.linker.reference === null ) {

				this.addImport( node.property );

			}

			code = node.property;

		} else if ( node.isNumber ) {

			code = node.value;

		} else if ( node.isString ) {

			code = '\'' + node.value + '\'';

		} else if ( node.isOperator ) {

			const opFn = opLib[ node.type ] || node.type;

			const left = this.emitExpression( node.left, output );
			const right = this.emitExpression( node.right, output );

			if ( node.isNumericExpression ) {

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

			// handle texture lookup function calls in separate branch

			if ( textureLookupFunctions.includes( node.name ) ) {

				code = `${ params[ 0 ] }.sample( ${ params[ 1 ] } )`;

				if ( node.name === 'texture' || node.name === 'texture2D' || node.name === 'texture3D' || node.name === 'textureCube' ) {

					if ( params.length === 3 ) {

						code += `.bias( ${ params[ 2 ] } )`;

					}

				} else if ( node.name === 'textureLod' ) {

					code += `.level( ${ params[ 2 ] } )`;

				} else if ( node.name === 'textureGrad' ) {

					code += `.grad( ${ params[ 2 ] }, ${ params[ 3 ] } )`;

				} else if ( node.name === 'texelFetch' ) {

					code += '.setSampler( false )';

				}

			} else {

				this.addImport( node.name );

				const paramsStr = params.length > 0 ? ' ' + params.join( ', ' ) + ' ' : '';

				code = `${ node.name }(${ paramsStr })`;

			}

		} else if ( node.isReturn ) {

			code = 'return';

			if ( node.value ) {

				code += ' ' + this.emitExpression( node.value );

			}

		} else if ( node.isDiscard ) {

			this.addImport( 'Discard' );

			code = 'Discard()';

		} else if ( node.isBreak ) {

			this.addImport( 'Break' );

			code = 'Break()';

		} else if ( node.isContinue ) {

			this.addImport( 'Continue' );

			code = 'Continue()';

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

		} else if ( node.isWhile ) {

			code = this.emitWhile( node );

		} else if ( node.isSwitch ) {

			code = this.emitSwitch( node );

		} else if ( node.isVariableDeclaration ) {

			code = this.emitVariables( node );

		} else if ( node.isUniform ) {

			code = this.emitUniform( node );

		} else if ( node.isVarying ) {

			code = this.emitVarying( node );

		} else if ( node.isTernary ) {

			code = this.emitTernary( node );

		} else if ( node.isConditional ) {

			code = this.emitConditional( node );

		} else if ( node.isUnary && node.expression.isNumber && node.type === '-' ) {

			code = '- ' + node.expression.value;

			if ( node.expression.type !== 'float' ) {

				code = node.expression.type + '( ' + code + ' )';

				this.addImport( node.expression.type );

			}

		} else if ( node.isUnary ) {

			let type = unaryLib[ node.type ];

			if ( node.hasAssignment ) {

				if ( node.after === false && ( node.type === '++' || node.type === '--' ) ) {

					type += 'Before';

				}

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

		let code = '';

		this.tab += '\t';

		for ( const statement of body ) {

			code += this.emitExtraLine( statement, body );

			if ( statement.isComment ) {

				code += this.emitComment( statement, body );

				continue;

			}

			if ( this.block && this.block.isSwitchCase ) {

				if ( statement.isBreak ) continue; // skip break statements in switch cases

			}

			code += this.tab + this.emitExpression( statement );

			if ( code.slice( - 1 ) !== '}' ) code += ';';

			code += '\n';

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

		const nameParam = name !== 'i' ? `, name: '${ name }'` : '';
		const typeParam = type !== 'int' ? `, type: '${ type }'` : '';
		const conditionParam = condition !== '<' ? `, condition: '${ condition }'` : '';

		let updateParam = '';

		if ( node.afterthought.isUnary ) {

			if ( node.afterthought.type !== '++' ) {

				updateParam = `, update: '${ node.afterthought.type }'`;

			}

		} else if ( node.afterthought.isOperator ) {

			if ( node.afterthought.right.isAccessor || node.afterthought.right.isNumber ) {

				updateParam = `, update: ${ this.emitExpression( node.afterthought.right ) }`;

			} else {

				updateParam = `, update: ( { i } ) => ${ this.emitExpression( node.afterthought ) }`;

			}

		}

		let loopStr = `Loop( { start: ${ start }, end: ${ end + nameParam + typeParam + conditionParam + updateParam } }, ( { ${ name } } ) => {\n\n`;

		loopStr += this.emitBody( node.body ) + '\n\n';

		loopStr += this.tab + '} )';

		this.imports.add( 'Loop' );

		return loopStr;

	}


	emitSwitch( switchNode ) {

		const discriminantString = this.emitExpression( switchNode.discriminant );

		this.tab += '\t';

		let switchString = `Switch( ${ discriminantString } )\n${ this.tab }`;

		const previousBlock = this.block;

		for ( const switchCase of switchNode.cases ) {

			this.block = switchCase;

			let caseBodyString;

			if ( ! switchCase.isDefault ) {

				const caseConditions = [ ];

				for ( const condition of switchCase.conditions ) {

					caseConditions.push( this.emitExpression( condition ) );

				}

				caseBodyString = this.emitBody( switchCase.body );

				switchString += `.Case( ${ caseConditions.join( ', ' ) }, `;

			} else {

				caseBodyString = this.emitBody( switchCase.body );

				switchString += '.Default( ';

			}

			switchString += `() => {

${ caseBodyString }

${ this.tab }} )`;

		}

		this.block = previousBlock;

		this.tab = this.tab.slice( 0, - 1 );

		this.imports.add( 'Switch' );

		return switchString;

	}

	emitFor( node ) {

		const { initialization, condition, afterthought } = node;

		if ( ( initialization && initialization.isVariableDeclaration && initialization.next === null ) &&
			( condition && condition.left.isAccessor && condition.left.property === initialization.name ) &&
			( afterthought && (
				( afterthought.isUnary && ( initialization.name === afterthought.expression.property ) ) ||
				( afterthought.isOperator && ( initialization.name === afterthought.left.property ) )
			) )
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
		forStr += `${ this.tab }Loop( ${ condition }, () => {\n\n`;

		forStr += this.emitBody( node.body ) + '\n\n';

		forStr += this.tab + '\t' + afterthought + ';\n\n';

		forStr += this.tab + '} )\n\n';

		this.tab = this.tab.slice( 0, - 1 );

		forStr += this.tab + '}';

		this.imports.add( 'Loop' );

		return forStr;

	}

	emitWhile( node ) {

		const condition = this.emitExpression( node.condition );

		let whileStr = `Loop( ${ condition }, () => {\n\n`;

		whileStr += this.emitBody( node.body ) + '\n\n';

		whileStr += this.tab + '} )';

		this.imports.add( 'Loop' );

		return whileStr;

	}

	emitVariables( node, isRoot = true ) {

		const { name, type, value, next } = node;

		let varStr = isRoot ? 'const ' : '';
		varStr += name;

		if ( value ) {

			let valueStr = this.emitExpression( value );

			if ( value.isNumericExpression ) {

				// convert JS primitive to node

				valueStr = `${ type }( ${ valueStr } )`;

				this.addImport( type );

			}

			varStr += ' = ' + valueStr;

		} else {

			varStr += ` = property( '${ type }' )`;

			this.addImport( 'property' );

		}

		if ( next ) {

			varStr += ', ' + this.emitVariables( next, false );

		}

		if ( node.needsToVar ) {

			varStr = varStr + '.toVar()';

		}

		return varStr;

	}

	emitVarying( node ) {

		const { name, type } = node;

		this.addImport( 'varying' );
		this.addImport( type );

		return `const ${ name } = varying( ${ type }(), '${ name }' )`;

	}

	emitOverloadingFunction( nodes ) {

		const { name } = nodes[ 0 ];

		this.addImport( 'overloadingFn' );

		const prefix = this.iife === false ? 'export ' : '';

		return `${ prefix }const ${ name } = /*@__PURE__*/ overloadingFn( [ ${ nodes.map( node => node.name + '_' + nodes.indexOf( node ) ).join( ', ' ) } ] );\n`;

	}

	emitFunction( node ) {

		const { name, type } = node;

		const params = [];
		const inputs = [];
		const mutableParams = [];

		let hasPointer = false;

		for ( const param of node.params ) {

			let name = param.name;

			if ( param.linker.assignments.length > 0 ) {

				name = name + '_immutable';

				mutableParams.push( param );

			}

			if ( param.qualifier ) {

				if ( param.qualifier === 'inout' || param.qualifier === 'out' ) {

					hasPointer = true;

				}

			}

			inputs.push( param.name + ': \'' + param.type + '\'' );
			params.push( name );

		}

		for ( const param of mutableParams ) {

			const mutableParam = new VariableDeclaration( param.type, param.name, new Accessor( param.name + '_immutable' ), null, true );
			mutableParam.parent = param.parent; // link to the original node
			mutableParam.linker.assignments.push( mutableParam );
			mutableParam.needsToVar = true; // force var declaration

			node.body.unshift( mutableParam );

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

		let funcStr = `${ prefix }const ${ fnName } = /*@__PURE__*/ Fn( (${ paramsStr }) => {

${ bodyStr }

${ this.tab }}`;

		if ( node.layout !== false && hasPointer === false ) {

			funcStr += ', { ' + inputs.join( ', ' ) + ', return: \'' + type + '\' }';

		}

		funcStr += ' );\n';

		this.imports.add( 'Fn' );

		this.global.add( node.name );

		if ( overloadingNodes !== null ) {

			funcStr += '\n' + this.emitOverloadingFunction( overloadingNodes );

		}

		return funcStr;

	}

	emitComment( statement, body ) {

		const index = body.indexOf( statement );
		const previous = body[ index - 1 ];
		const next = body[ index + 1 ];

		let output = '';

		if ( previous && isExpression( previous ) ) {

			output += '\n';

		}

		output += this.tab + statement.comment.replace( /\n/g, '\n' + this.tab ) + '\n';

		if ( next && isExpression( next ) ) {

			output += '\n';

		}

		return output;

	}

	emitExtraLine( statement, body ) {

		const index = body.indexOf( statement );
		const previous = body[ index - 1 ];

		if ( previous === undefined ) return '';

		if ( statement.isReturn ) return '\n';

		const lastExp = isExpression( previous );
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

			code += this.emitExtraLine( statement, ast.body );

			if ( statement.isComment ) {

				code += this.emitComment( statement, ast.body );

				continue;

			}

			if ( statement.isFunctionDeclaration ) {

				code += this.tab + this.emitFunction( statement );

			} else {

				code += this.tab + this.emitExpression( statement ) + ';\n';

			}

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
