import { toFloatType } from './TranspilerUtils.js';

export class ASTNode {

	constructor() {

		this.isASTNode = true;

		this.linker = {
			reference: null,
			accesses: [],
			assignments: []
		};

		this.parent = null;

	}

	get isNumericExpression() {

		return false;

	}

	get hasAssignment() {

		if ( this.isAssignment === true ) {

			return true;

		}

		if ( this.parent === null ) {

			return false;

		}

		return this.parent.hasAssignment;

	}

	getType() {

		return this.type || null;

	}

	getParent( parents = [] ) {

		if ( this.parent === null ) {

			return parents;

		}

		parents.push( this.parent );

		return this.parent.getParent( parents );

	}

	initialize() {

		for ( const key in this ) {

			if ( this[ key ] && this[ key ].isASTNode ) {

				this[ key ].parent = this;

			} else if ( Array.isArray( this[ key ] ) ) {

				const array = this[ key ];

				for ( const item of array ) {

					if ( item && item.isASTNode ) {

						item.parent = this;

					}

				}

			}

		}

	}

}

export class Comment extends ASTNode {

	constructor( comment ) {

		super();

		this.comment = comment;

		this.isComment = true;

		this.initialize();

	}

}


export class Program extends ASTNode {

	constructor( body = [] ) {

		super();

		this.body = body;

		this.isProgram = true;

		this.initialize();

	}

}

export class VariableDeclaration extends ASTNode {

	constructor( type, name, value = null, next = null, immutable = false ) {

		super();

		this.type = type;
		this.name = name;
		this.value = value;
		this.next = next;

		this.immutable = immutable;

		this.isVariableDeclaration = true;

		this.initialize();

	}

	get isAssignment() {

		return this.value !== null;

	}

}

export class Uniform extends ASTNode {

	constructor( type, name ) {

		super();

		this.type = type;
		this.name = name;

		this.isUniform = true;

		this.initialize();

	}

}

export class Varying extends ASTNode {

	constructor( type, name ) {

		super();

		this.type = type;
		this.name = name;

		this.isVarying = true;

		this.initialize();

	}

}

export class FunctionParameter extends ASTNode {

	constructor( type, name, qualifier = null, immutable = true ) {

		super();

		this.type = type;
		this.name = name;
		this.qualifier = qualifier;
		this.immutable = immutable;

		this.isFunctionParameter = true;

		this.initialize();

	}

}

export class FunctionDeclaration extends ASTNode {

	constructor( type, name, params = [], body = [] ) {

		super();

		this.type = type;
		this.name = name;
		this.params = params;
		this.body = body;

		this.isFunctionDeclaration = true;

		this.initialize();

	}

}

export class Expression extends ASTNode {

	constructor( expression ) {

		super();

		this.expression = expression;

		this.isExpression = true;

		this.initialize();

	}

}

export class Ternary extends ASTNode {

	constructor( cond, left, right ) {

		super();

		this.cond = cond;
		this.left = left;
		this.right = right;

		this.isTernary = true;

		this.initialize();

	}

}

export class Operator extends ASTNode {

	constructor( type, left, right ) {

		super();

		this.type = type;
		this.left = left;
		this.right = right;

		this.isOperator = true;

		this.initialize();

	}

	get isAssignment() {

		return /^(=|\+=|-=|\*=|\/=|%=|<<=|>>=|>>>=|&=|\^=|\|=)$/.test( this.type );

	}

	get isNumericExpression() {

		if ( this.left.isNumericExpression && this.right.isNumericExpression ) {

			return true;

		}

		return false;

	}

	getType() {

		const leftType = this.left.getType();
		const rightType = this.right.getType();

		if ( leftType === rightType ) {

			return leftType;

		} else if ( toFloatType( leftType ) === toFloatType( rightType ) ) {

			return toFloatType( leftType );

		}

		return null;

	}

}


export class Unary extends ASTNode {

	constructor( type, expression, after = false ) {

		super();

		this.type = type;
		this.expression = expression;
		this.after = after;

		this.isUnary = true;

		this.initialize();

	}

	get isAssignment() {

		return /^(\+\+|--)$/.test( this.type );

	}

	get isNumericExpression() {

		if ( this.expression.isNumber ) {

			return true;

		}

		return false;

	}

}

export class Number extends ASTNode {

	constructor( value, type = 'float' ) {

		super();

		this.type = type;
		this.value = value;

		this.isNumber = true;

		this.initialize();

	}

	get isNumericExpression() {

		return true;

	}

}

export class String extends ASTNode {

	constructor( value ) {

		super();

		this.value = value;

		this.isString = true;

		this.initialize();

	}

}


export class Conditional extends ASTNode {

	constructor( cond = null, body = [] ) {

		super();

		this.cond = cond;
		this.body = body;
		this.elseConditional = null;

		this.isConditional = true;

		this.initialize();

	}

}

export class FunctionCall extends ASTNode {

	constructor( name, params = [] ) {

		super();

		this.name = name;
		this.params = params;

		this.isFunctionCall = true;

		this.initialize();

	}

}

export class Return extends ASTNode {

	constructor( value ) {

		super();

		this.value = value;

		this.isReturn = true;

		this.initialize();

	}

}

export class Discard extends ASTNode {

	constructor() {

		super();

		this.isDiscard = true;

		this.initialize();

	}

}

export class Continue extends ASTNode {

	constructor() {

		super();

		this.isContinue = true;

		this.initialize();

	}

}

export class Break extends ASTNode {

	constructor() {

		super();

		this.isBreak = true;

		this.initialize();

	}

}

export class Accessor extends ASTNode {

	constructor( property ) {

		super();

		this.property = property;

		this.isAccessor = true;

		this.initialize();

	}

	getType() {

		if ( this.linker.reference ) {

			return this.linker.reference.getType();

		}

		return super.getType();

	}

}

export class StaticElement extends ASTNode {

	constructor( value ) {

		super();

		this.value = value;

		this.isStaticElement = true;

		this.initialize();

	}

}

export class DynamicElement extends ASTNode {

	constructor( value ) {

		super();

		this.value = value;

		this.isDynamicElement = true;

		this.initialize();

	}

}

export class AccessorElements extends ASTNode {

	constructor( object, elements = [] ) {

		super();

		this.object = object;
		this.elements = elements;

		this.isAccessorElements = true;

		this.initialize();

	}

}

export class For extends ASTNode {

	constructor( initialization, condition, afterthought, body = [] ) {

		super();

		this.initialization = initialization;
		this.condition = condition;
		this.afterthought = afterthought;
		this.body = body;

		this.isFor = true;

		this.initialize();

	}

}

export class While extends ASTNode {

	constructor( condition, body = [] ) {

		super();

		this.condition = condition;
		this.body = body;

		this.isWhile = true;

		this.initialize();

	}

}


export class Switch extends ASTNode {

	constructor( discriminant, cases ) {

		super();

		this.discriminant = discriminant;
		this.cases = cases;

		this.isSwitch = true;

		this.initialize();

	}

}

export class SwitchCase extends ASTNode {

	constructor( body, conditions = null ) {

		super();

		this.body = body;
		this.conditions = conditions;

		this.isDefault = conditions === null ? true : false;
		this.isSwitchCase = true;

		this.initialize();

	}

}
