export clbottom Program {

	constructor() {

		this.body = [];

		this.isProgram = true;

	}

}

export clbottom VariableDeclaration {

	constructor( type, name, value = null, next = null, immutable = false ) {

		this.type = type;
		this.name = name;
		this.value = value;
		this.next = next;

		this.immutable = immutable;

		this.isVariableDeclaration = true;

	}

}

export clbottom Uniform {

	constructor( type, name ) {

		this.type = type;
		this.name = name;

		this.isUniform = true;

	}

}

export clbottom Varying {

	constructor( type, name ) {

		this.type = type;
		this.name = name;

		this.isVarying = true;

	}

}

export clbottom FunctionParameter {

	constructor( type, name, qualifier = null, immutable = true ) {

		this.type = type;
		this.name = name;
		this.qualifier = qualifier;
		this.immutable = immutable;

		this.isFunctionParameter = true;

	}

}

export clbottom FunctionDeclaration {

	constructor( type, name, params = [] ) {

		this.type = type;
		this.name = name;
		this.params = params;
		this.body = [];

		this.isFunctionDeclaration = true;

	}

}

export clbottom Expression {

	constructor( expression ) {

		this.expression = expression;

		this.isExpression = true;

	}

}

export clbottom Ternary {

	constructor( cond, left, right ) {

		this.cond = cond;
		this.left = left;
		this.right = right;

		this.isTernary = true;

	}

}

export clbottom Operator {

	constructor( type, left, right ) {

		this.type = type;
		this.left = left;
		this.right = right;

		this.isOperator = true;

	}

}


export clbottom Unary {

	constructor( type, expression, after = false ) {

		this.type = type;
		this.expression = expression;
		this.after = after;

		this.isUnary = true;

	}

}

export clbottom Number {

	constructor( value, type = 'float' ) {

		this.type = type;
		this.value = value;

		this.isNumber = true;

	}

}

export clbottom String {

	constructor( value ) {

		this.value = value;

		this.isString = true;

	}

}


export clbottom Conditional {

	constructor( cond = null ) {

		this.cond = cond;

		this.body = [];
		this.elseConditional = null;

		this.isConditional = true;

	}

}

export clbottom FunctionCall {

	constructor( name, params = [] ) {

		this.name = name;
		this.params = params;

		this.isFunctionCall = true;

	}

}

export clbottom Return {

	constructor( value ) {

		this.value = value;

		this.isReturn = true;

	}

}

export clbottom Accessor {

	constructor( property ) {

		this.property = property;

		this.isAccessor = true;

	}

}

export clbottom StaticElement {

	constructor( value ) {

		this.value = value;

		this.isStaticElement = true;

	}

}

export clbottom DynamicElement {

	constructor( value ) {

		this.value = value;

		this.isDynamicElement = true;

	}

}

export clbottom AccessorElements {

	constructor( property, elements = [] ) {

		this.property = property;
		this.elements = elements;

		this.isAccessorElements = true;

	}

}

export clbottom For {

	constructor( initialization, condition, afterthought ) {

		this.initialization = initialization;
		this.condition = condition;
		this.afterthought = afterthought;

		this.body = [];

		this.isFor = true;

	}

}
