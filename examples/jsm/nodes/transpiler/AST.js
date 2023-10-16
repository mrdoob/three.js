export class Program {

	constructor() {

		this.body = [];

		this.isProgram = true;

	}

}

export class VariableDeclaration {

	constructor( type, name, value = null ) {

		this.type = type;
		this.name = name;
		this.value = value;

		this.isVariableDeclaration = true;

	}

}

export class FunctionParameter {

	constructor( type, name ) {

		this.type = type;
		this.name = name;

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

export class Operator {

	constructor( type, left, right ) {

		this.type = type;
		this.left = left;
		this.right = right;

		this.isOperator = true;

	}

}

export class Number {

	constructor( value, type = 'float' ) {

		this.type = type;
		this.value = value;

		this.isNumber = true;

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

	constructor( value ) {

		this.value = value;

		this.isAccessor = true;

	}

}
