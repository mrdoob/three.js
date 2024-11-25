export class Program {

	constructor() {

		this.body = [];

		this.isProgram = true;

	}

}

export class VariableDeclaration {

	constructor( type, name, value = null, next = null, immutable = false ) {

		this.type = type;
		this.name = name;
		this.value = value;
		this.next = next;

		this.immutable = immutable;

		this.isVariableDeclaration = true;

	}

}

export class Uniform {

	constructor( type, name ) {

		this.type = type;
		this.name = name;

		this.isUniform = true;

	}

}

export class Varying {

	constructor( type, name ) {

		this.type = type;
		this.name = name;

		this.isVarying = true;

	}

}

export class FunctionParameter {

	constructor( type, name, qualifier = null, immutable = true ) {

		this.type = type;
		this.name = name;
		this.qualifier = qualifier;
		this.immutable = immutable;

		this.isFunctionParameter = true;

	}

}

export class FunctionDeclaration {

	constructor( type, name, params = [] ) {

		this.type = type;
		this.name = name;
		this.params = params;
		this.body = [];

		this.isFunctionDeclaration = true;

	}

}

export class Expression {

	constructor( expression ) {

		this.expression = expression;

		this.isExpression = true;

	}

}

export class Ternary {

	constructor( cond, left, right ) {

		this.cond = cond;
		this.left = left;
		this.right = right;

		this.isTernary = true;

	}

}

export class Operator {

	constructor( type, left, right ) {

		this.type = type;
		this.left = left;
		this.right = right;

		this.isOperator = true;

	}

}


export class Unary {

	constructor( type, expression, after = false ) {

		this.type = type;
		this.expression = expression;
		this.after = after;

		this.isUnary = true;

	}

}

export class Number {

	constructor( value, type = 'float' ) {

		this.type = type;
		this.value = value;

		this.isNumber = true;

	}

}

export class String {

	constructor( value ) {

		this.value = value;

		this.isString = true;

	}

}


export class Conditional {

	constructor( cond = null ) {

		this.cond = cond;

		this.body = [];
		this.elseConditional = null;

		this.isConditional = true;

	}

}

export class FunctionCall {

	constructor( name, params = [] ) {

		this.name = name;
		this.params = params;

		this.isFunctionCall = true;

	}

}

export class Return {

	constructor( value ) {

		this.value = value;

		this.isReturn = true;

	}

}

export class Accessor {

	constructor( property ) {

		this.property = property;

		this.isAccessor = true;

	}

}

export class StaticElement {

	constructor( value ) {

		this.value = value;

		this.isStaticElement = true;

	}

}

export class DynamicElement {

	constructor( value ) {

		this.value = value;

		this.isDynamicElement = true;

	}

}

export class AccessorElements {

	constructor( object, elements = [] ) {

		this.object = object;
		this.elements = elements;

		this.isAccessorElements = true;

	}

}

export class For {

	constructor( initialization, condition, afterthought ) {

		this.initialization = initialization;
		this.condition = condition;
		this.afterthought = afterthought;

		this.body = [];

		this.isFor = true;

	}

}
