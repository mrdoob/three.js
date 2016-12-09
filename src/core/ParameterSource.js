
function MaterialParameter( value ) {

	this.value = value;

	if ( typeof value === "number" ) {

		this.version = value;

	} else {

		this.version = ++MaterialParameter.version;
	}

}

MaterialParameter.version = 0;

MaterialParameter.prototype = {

	constructor: MaterialParameter,

	setValue: function ( value ) {

		this.value = value;
		this.version = value;

	},

	getValue: function () {

		return this.value;

	},

	setObjectValue: function ( value ) {

		this.value = value;
		this.version = ++MaterialParameter.version;

	},

	getObjectValue: function () {

		this.version = ++MaterialParameter.version;

		return this.value;

	},

}

function DerivedMaterialParameter( value, getFunc ) {

	this._value = value;
	this.getFunc = getFunc;

	if ( typeof value === "number" ) {

		this.version = getFunc ( value );

	} else {

		this.version = ++MaterialParameter.version;
	}

	Object.defineProperty( this, 'value', {
		get: function () { return getFunc( this._value ) }
	} );

}


DerivedMaterialParameter.prototype = {

	constructor: MaterialParameter,

	setValue: function ( value ) {

		this._value = value;
		this.version = this.getFunc( value );

	},

	getValue: function () {

		return this._value;

	},

	setObjectValue: function ( value ) {

		this._value = value;
		this.version = ++MaterialParameter.version;

	},

	getObjectValue: function () {

		this.version = ++MaterialParameter.version;

		return this._value;

	},

}

function ParameterSource() {}

Object.assign( ParameterSource.prototype, {

	addParameter: function ( name, value, alias, getFunc ) {

		if ( this._parameters === undefined ) this._parameters = {};

		var parameter = getFunc === undefined ? new MaterialParameter( value ) : new DerivedMaterialParameter( value, getFunc );
		var shaderName = ! alias ? name : alias;

		this._parameters[ shaderName ] = parameter;

		var get;

		if ( typeof value === "number" ) {

			Object.defineProperty( this, name, {
				set: function( value ) { parameter.setValue( value ) },
				get: function () { return parameter.getValue() }
			} );

		} else {

			Object.defineProperty( this, name, {
				set: function( value ) { parameter.setObjectValue( value ) },
				get: function () { return parameter.getObjectValue() }
			} );

		}


	},

	addParameterRO: function ( name, value, alias, getFunc ) {

		if ( this._parameters === undefined ) this._parameters = {};

		var parameter = getFunc === undefined ? new MaterialParameter( value ) : new DerivedMaterialParameter( value, getFunc );
		var shaderName = ! alias ? name : alias;

		this._parameters[ shaderName ] = parameter;

		Object.defineProperty( this, name, {
			get: function() { return parameter.getObjectValue() }
		} );

	},

	getParameter: function( name ) {

		if ( this._parameters === undefined ) this._parameters = {};

		return this._parameters[ name ];

	}

} );

export { ParameterSource };
