import { REVISION } from 'three/webgpu';

import { VariableDeclaration, Accessor } from './AST.js';
import { isExpression } from './TranspilerUtils.js';

// Note: This is a simplified list. A complete implementation would need more mappings.
const typeMap = {
	'float': 'f32',
	'int': 'i32',
	'uint': 'u32',
	'bool': 'bool',
	'vec2': 'vec2f',
	'ivec2': 'vec2i',
	'uvec2': 'vec2u',
	'bvec2': 'vec2b',
	'vec3': 'vec3f',
	'ivec3': 'vec3i',
	'uvec3': 'vec3u',
	'bvec3': 'vec3b',
	'vec4': 'vec4f',
	'ivec4': 'vec4i',
	'uvec4': 'vec4u',
	'bvec4': 'vec4b',
	'mat3': 'mat3x3<f32>',
	'mat4': 'mat4x4<f32>',
	'texture': 'texture_2d<f32>',
	'textureCube': 'texture_cube<f32>',
	'texture3D': 'texture_3d<f32>',
};

// GLSL to WGSL built-in function mapping
const wgslLib = {
	'abs': 'abs',
	'acos': 'acos',
	'asin': 'asin',
	'atan': 'atan',
	'atan2': 'atan2',
	'ceil': 'ceil',
	'clamp': 'clamp',
	'cos': 'cos',
	'cross': 'cross',
	'degrees': 'degrees',
	'distance': 'distance',
	'dot': 'dot',
	'exp': 'exp',
	'exp2': 'exp2',
	'faceforward': 'faceForward',
	'floor': 'floor',
	'fract': 'fract',
	'inverse': 'inverse',
	'inversesqrt': 'inverseSqrt',
	'length': 'length',
	'log': 'log',
	'log2': 'log2',
	'max': 'max',
	'min': 'min',
	'mix': 'mix',
	'normalize': 'normalize',
	'pow': 'pow',
	'radians': 'radians',
	'reflect': 'reflect',
	'refract': 'refract',
	'round': 'round',
	'sign': 'sign',
	'sin': 'sin',
	'smoothstep': 'smoothstep',
	'sqrt': 'sqrt',
	'step': 'step',
	'tan': 'tan',
	'transpose': 'transpose',
	'trunc': 'trunc',
	'dFdx': 'dpdx',
	'dFdy': 'dpdy',
	'fwidth': 'fwidth',
	// Texture functions are handled separately
	'texture': 'textureSample',
	'texture2D': 'textureSample',
	'texture3D': 'textureSample',
	'textureCube': 'textureSample',
	'textureLod': 'textureSampleLevel',
	'texelFetch': 'textureLoad',
	'textureGrad': 'textureSampleGrad',
	'floatBitsToInt': 'bitcast<i32>',
	'floatBitsToUint': 'bitcast<u32>',
	'intBitsToFloat': 'bitcast<f32>',
	'uintBitsToFloat': 'bitcast<f32>',
};

class WGSLEncoder {

	constructor() {

		this.tab = '';
		this.functions = new Map();
		this.uniforms = [];
		this.varyings = [];
		this.structs = new Map();
		this.polyfills = new Map();

		// Assume a single group for simplicity
		this.groupIndex = 0;

	}

	getWgslType( type ) {

		return typeMap[ type ] || type;

	}

	emitExpression( node ) {

		if ( ! node ) return '';

		let code;

		if ( node.isAccessor ) {

			// Check if this accessor is part of a uniform struct
			const uniform = this.uniforms.find( u => u.name === node.property );

			if ( uniform && ! uniform.type.includes( 'texture' ) ) {

				return `uniforms.${node.property}`;

			}

			code = node.property;

		} else if ( node.isNumber ) {

			code = node.value;

			// WGSL requires floating point numbers to have a decimal
			if ( node.type === 'float' && ! code.includes( '.' ) ) {

				code += '.0';

			}

		} else if ( node.isOperator ) {

			const left = this.emitExpression( node.left );
			const right = this.emitExpression( node.right );

			code = `${ left } ${ node.type } ${ right }`;

			if ( node.parent.isAssignment !== true && node.parent.isOperator ) {

				code = `( ${ code } )`;

			}

		} else if ( node.isFunctionCall ) {

			const fnName = wgslLib[ node.name ] || node.name;

			if ( fnName === 'mod' ) {

				const snippets = node.params.map( p => this.emitExpression( p ) );
				const types = node.params.map( p => p.getType() );

				const modFnName = 'mod_' + types.join( '_' );

				if ( this.polyfills.has( modFnName ) === false ) {

					this.polyfills.set( modFnName, `fn ${ modFnName }( x: ${ this.getWgslType( types[ 0 ] ) }, y: ${ this.getWgslType( types[ 1 ] ) } ) -> ${ this.getWgslType( types[ 0 ] ) } {

	return x - y * floor( x / y );

}` );

				}

				code = `${ modFnName }( ${ snippets.join( ', ' ) } )`;

			} else if ( fnName.startsWith( 'bitcast' ) ) {

				const params = node.params.map( p => this.emitExpression( p ) ).join( ',' );
				const types = node.params.map( p => p.getType() );

				if ( /.*vec[234]/.test( types[ 0 ] ) ) {

					const conversionType = fnName.substring( 8, fnName.length - 1 );
					const vectorType = types[ 0 ].substring( - 1 );

					code = `bitcast<${ vectorType }<${ conversionType }>>`;

				} else {

					code = fnName;

				}

				code += `( ${ params } )`;

			} else if ( fnName.startsWith( 'texture' ) ) {

				// Handle texture functions separately due to sampler handling

				code = this.emitTextureAccess( node );

			} else {

				const params = node.params.map( p => this.emitExpression( p ) );

				if ( typeMap[ fnName ] ) {

					// Handle type constructors like vec3(...)

					code = this.getWgslType( fnName );

				} else {

					code = fnName;

				}

				if ( params.length > 0 ) {

					code += '( ' + params.join( ', ' ) + ' )';

				} else {

					code += '()';

				}

			}

		} else if ( node.isReturn ) {

			code = 'return';

			if ( node.value ) {

				code += ' ' + this.emitExpression( node.value );

			}

		} else if ( node.isDiscard ) {

			code = 'discard';

		} else if ( node.isBreak ) {

			if ( node.parent.isSwitchCase !== true ) {

				code = 'break';

			}

		} else if ( node.isContinue ) {

			code = 'continue';

		} else if ( node.isAccessorElements ) {

			code = this.emitExpression( node.object );

			for ( const element of node.elements ) {

				const value = this.emitExpression( element.value );

				if ( element.isStaticElement ) {

					code += '.' + value;

				} else if ( element.isDynamicElement ) {

					code += `[${value}]`;

				}

			}

		} else if ( node.isFor ) {

			code = this.emitFor( node );

		} else if ( node.isWhile ) {

			code = this.emitWhile( node );

		} else if ( node.isSwitch ) {

			code = this.emitSwitch( node );

		} else if ( node.isVariableDeclaration ) {

			code = this.emitVariables( node );

		} else if ( node.isUniform ) {

			this.uniforms.push( node );
			return ''; // Defer emission to the header

		} else if ( node.isVarying ) {

			this.varyings.push( node );
			return ''; // Defer emission to the header

		} else if ( node.isStructDefinition ) {

			code = this.emitStructDefinition( node );

		} else if ( node.isTernary ) {

			const cond = this.emitExpression( node.cond );
			const left = this.emitExpression( node.left );
			const right = this.emitExpression( node.right );

			// WGSL's equivalent to the ternary operator is select(false_val, true_val, condition)
			code = `select( ${ right }, ${ left }, ${ cond } )`;

		} else if ( node.isConditional ) {

			code = this.emitConditional( node );

		} else if ( node.isUnary ) {

			const expr = this.emitExpression( node.expression );

			if ( node.type === '++' || node.type === '--' ) {

				const op = node.type === '++' ? '+' : '-';

				code = `${ expr } = ${ expr } ${ op } 1`;

			} else {

				code = `${ node.type }${ expr }`;

			}

		} else {

			console.warn( 'Unknown node type in WGSL Encoder:', node );

			code = `/* unknown node: ${ node.constructor.name } */`;

		}

		return code;

	}

	emitTextureAccess( node ) {

		const wgslFn = wgslLib[ node.name ];
		const textureName = this.emitExpression( node.params[ 0 ] );
		const uv = this.emitExpression( node.params[ 1 ] );

		// WGSL requires explicit samplers. We assume a naming convention.
		const samplerName = `${textureName}_sampler`;

		let code;

		switch ( node.name ) {

			case 'texture':
			case 'texture2D':
			case 'texture3D':
			case 'textureCube':
				// format: textureSample(texture, sampler, coords, [offset])
				code = `${wgslFn}(${textureName}, ${samplerName}, ${uv}`;
				// Handle optional bias parameter (note: WGSL uses textureSampleBias)
				if ( node.params.length === 3 ) {

					const bias = this.emitExpression( node.params[ 2 ] );
					code = `textureSampleBias(${textureName}, ${samplerName}, ${uv}, ${bias})`;

				} else {

					code += ')';

				}

				break;

			case 'textureLod':
				// format: textureSampleLevel(texture, sampler, coords, level)
				const lod = this.emitExpression( node.params[ 2 ] );
				code = `${wgslFn}(${textureName}, ${samplerName}, ${uv}, ${lod})`;
				break;

			case 'textureGrad':
				// format: textureSampleGrad(texture, sampler, coords, ddx, ddy)
				const ddx = this.emitExpression( node.params[ 2 ] );
				const ddy = this.emitExpression( node.params[ 3 ] );
				code = `${wgslFn}(${textureName}, ${samplerName}, ${uv}, ${ddx}, ${ddy})`;
				break;

			case 'texelFetch':
				// format: textureLoad(texture, coords, [level])
				const coords = this.emitExpression( node.params[ 1 ] ); // should be ivec
				const lodFetch = node.params.length > 2 ? this.emitExpression( node.params[ 2 ] ) : '0';
				code = `${wgslFn}(${textureName}, ${coords}, ${lodFetch})`;
				break;

			default:
				code = `/* unsupported texture op: ${node.name} */`;

		}

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

			const statementCode = this.emitExpression( statement );

			if ( statementCode ) {

				code += this.tab + statementCode;

				if ( ! statementCode.endsWith( '}' ) && ! statementCode.endsWith( '{' ) ) {

					code += ';';

				}

				code += '\n';

			}

		}

		this.tab = this.tab.slice( 0, - 1 );
		return code.slice( 0, - 1 ); // remove the last extra line

	}

	emitConditional( node ) {

		const condStr = this.emitExpression( node.cond );
		const bodyStr = this.emitBody( node.body );

		let ifStr = `if ( ${ condStr } ) {\n\n${ bodyStr }\n\n${ this.tab }}`;

		let current = node;

		while ( current.elseConditional ) {

			current = current.elseConditional;
			const elseBodyStr = this.emitBody( current.body );

			if ( current.cond ) { // This is an 'else if'

				const elseCondStr = this.emitExpression( current.cond );

				ifStr += ` else if ( ${ elseCondStr } ) {\n\n${ elseBodyStr }\n\n${ this.tab }}`;

			} else { // This is an 'else'

				ifStr += ` else {\n\n${ elseBodyStr }\n\n${ this.tab }}`;

			}

		}

		return ifStr;

	}

	emitFor( node ) {

		const init = this.emitExpression( node.initialization );
		const cond = this.emitExpression( node.condition );
		const after = this.emitExpression( node.afterthought );
		const body = this.emitBody( node.body );

		return `for ( ${ init }; ${ cond }; ${ after } ) {\n\n${ body }\n\n${ this.tab }}`;

	}

	emitWhile( node ) {

		const cond = this.emitExpression( node.condition );
		const body = this.emitBody( node.body );

		return `while ( ${ cond } ) {\n\n${ body }\n\n${ this.tab }}`;

	}

	emitSwitch( node ) {

		const discriminant = this.emitExpression( node.discriminant );

		let switchStr = `switch ( ${ discriminant } ) {\n\n`;

		this.tab += '\t';

		for ( const switchCase of node.cases ) {

			const body = this.emitBody( switchCase.body );

			if ( switchCase.isDefault ) {

				switchStr += `${ this.tab }default: {\n\n${ body }\n\n${ this.tab }}\n\n`;

			} else {

				const cases = switchCase.conditions.map( c => this.emitExpression( c ) ).join( ', ' );

				switchStr += `${ this.tab }case ${ cases }: {\n\n${ body }\n\n${ this.tab }}\n\n`;

			}

		}

		this.tab = this.tab.slice( 0, - 1 );

		switchStr += `${this.tab}}`;

		return switchStr;

	}

	emitVariables( node ) {

		const declarations = [];

		let current = node;

		while ( current ) {

			const type = this.getWgslType( current.type );

			let valueStr = '';

			if ( current.value ) {

				valueStr = ` = ${this.emitExpression( current.value )}`;

			}

			// The AST linker tracks if a variable is ever reassigned.
			// If so, use 'var'; otherwise, use 'let'.

			let keyword;

			if ( current.linker ) {

				if ( current.linker.assignments.length > 0 ) {

					keyword = 'var'; // Reassigned variable

				} else {

					if ( current.value && current.value.isNumericExpression ) {

						keyword = 'const'; // Immutable numeric expression

					} else {

						keyword = 'let'; // Immutable variable

					}

				}

			}

			declarations.push( `${ keyword } ${ current.name }: ${ type }${ valueStr }` );

			current = current.next;

		}

		// In WGSL, multiple declarations in one line are not supported, so join with semicolons.
		return declarations.join( ';\n' + this.tab );

	}

	emitStructDefinition( node ) {

		const { name, members } = node;

		let structString = `struct ${ name } {\n`;

		for ( let i = 0; i < members.length; i += 1 ) {

			const member = members[ i ];

			structString += `${ this.tab }\t${ member.name }: ${ this.getWgslType( member.type ) }`;

			const delimiter = ( i != members.length - 1 ) ? ',\n' : '\n';
			structString += delimiter;

		}

		structString += this.tab + '}';

		return structString;

	}

	emitFunction( node ) {

		const name = node.name;
		const returnType = this.getWgslType( node.type );

		const params = [];
		// We will prepend to a copy of the body, not the original AST node.
		const body = [ ...node.body ];

		for ( const param of node.params ) {

			const paramName = param.name;
			let paramType = this.getWgslType( param.type );

			// Handle 'inout' and 'out' qualifiers using pointers. They are already mutable.
			if ( param.qualifier === 'inout' || param.qualifier === 'out' ) {

				paramType = `ptr<function, ${paramType}>`;
				params.push( `${paramName}: ${paramType}` );
				continue;

			}

			// If the parameter is reassigned within the function, we need to
			// create a local, mutable variable that shadows the parameter's name.
			if ( param.linker && param.linker.assignments.length > 0 ) {

				// 1. Rename the incoming parameter to avoid name collision.
				const immutableParamName = `${paramName}_in`;
				params.push( `${immutableParamName}: ${paramType}` );

				// 2. Create a new Accessor node for the renamed immutable parameter.
				const immutableAccessor = new Accessor( immutableParamName );
				immutableAccessor.isAccessor = true;
				immutableAccessor.property = immutableParamName;

				// 3. Create a new VariableDeclaration node for the mutable local variable.
				// This new variable will have the original parameter's name.
				const mutableVar = new VariableDeclaration( param.type, param.name, immutableAccessor );

				// 4. Mark this new variable as mutable so `emitVariables` uses `var`.
				mutableVar.linker = { assignments: [ true ] };

				// 5. Prepend this new declaration to the function's body.
				body.unshift( mutableVar );

			} else {

				// This parameter is not reassigned, so treat it as a normal immutable parameter.
				params.push( `${paramName}: ${paramType}` );

			}

		}

		const paramsStr = params.length > 0 ? ' ' + params.join( ', ' ) + ' ' : '';
		const returnStr = ( returnType && returnType !== 'void' ) ? ` -> ${returnType}` : '';

		// Emit the function body, which now includes our injected variable declarations.
		const bodyStr = this.emitBody( body );

		return `fn ${name}(${paramsStr})${returnStr} {\n\n${bodyStr}\n\n${this.tab}}`;

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

		const header = '// Three.js Transpiler r' + REVISION + '\n\n';

		let globals = '';
		let functions = '';
		let dependencies = '';

		// 1. Pre-process to find all global declarations
		for ( const statement of ast.body ) {

			if ( statement.isFunctionDeclaration ) {

				this.functions.set( statement.name, statement );

			} else if ( statement.isUniform ) {

				this.uniforms.push( statement );

			} else if ( statement.isVarying ) {

				this.varyings.push( statement );

			}

		}

		// 2. Build resource bindings (uniforms, textures, samplers)
		if ( this.uniforms.length > 0 ) {

			let bindingIndex = 0;
			const uniformStructMembers = [];
			const textureGlobals = [];

			for ( const uniform of this.uniforms ) {

				// Textures are declared as separate global variables, not in the UBO
				if ( uniform.type.includes( 'texture' ) ) {

					textureGlobals.push( `@group(${this.groupIndex}) @binding(${bindingIndex ++}) var ${uniform.name}: ${this.getWgslType( uniform.type )};` );
					textureGlobals.push( `@group(${this.groupIndex}) @binding(${bindingIndex ++}) var ${uniform.name}_sampler: sampler;` );

				} else {

					uniformStructMembers.push( `\t${uniform.name}: ${this.getWgslType( uniform.type )},` );

				}

			}

			// Create a UBO struct if there are any non-texture uniforms
			if ( uniformStructMembers.length > 0 ) {

				globals += 'struct Uniforms {\n';
				globals += uniformStructMembers.join( '\n' );
				globals += '\n};\n';
				globals += `@group(${this.groupIndex}) @binding(${bindingIndex ++}) var<uniform> uniforms: Uniforms;\n\n`;

			}

			// Add the texture and sampler globals
			globals += textureGlobals.join( '\n' ) + '\n\n';

		}

		// 3. Build varying structs for stage I/O
		// This is a simplification; a full implementation would need to know the shader stage.
		if ( this.varyings.length > 0 ) {

			globals += 'struct Varyings {\n';
			let location = 0;
			for ( const varying of this.varyings ) {

				globals += `\t@location(${location ++}) ${varying.name}: ${this.getWgslType( varying.type )},\n`;

			}

			globals += '};\n\n';

		}

		// 4. Emit all functions and other global statements
		for ( const statement of ast.body ) {

			functions += this.emitExtraLine( statement, ast.body );

			if ( statement.isFunctionDeclaration ) {

				functions += this.emitFunction( statement ) + '\n';

			} else if ( statement.isComment ) {

				functions += this.emitComment( statement, ast.body );

			} else if ( ! statement.isUniform && ! statement.isVarying ) {

				// Handle other top-level statements like 'const'
				functions += this.emitExpression( statement ) + ';\n';

			}

		}

		// 4. Build dependencies
		for ( const value of this.polyfills.values() ) {

			dependencies = `${ value }\n\n`;

		}

		return header + dependencies + globals + functions.trimEnd() + '\n';

	}

}

export default WGSLEncoder;
