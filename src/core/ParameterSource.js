
function MaterialParameter( value, func ) {

	this.value = value;

	if ( typeof value === "number" ) {

		this.version = value;

	} else {

		this.version = ++MaterialParameter.version;
	}

	if ( func === undefined ) {

		Object.defineProperty( this, 'rendererValue', {
			value: this.value
		} );

	} else {

		Object.defineProperty( this, 'rendererValue', {
			value: func( this.value )
		} );

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


function ParameterSource() {}

Object.assign( ParameterSource.prototype, {

	addParameter: function ( name, value, alias ) {

		if ( this._parameters === undefined ) this._parameters = {};

		var parameter = new MaterialParameter( value );
		var shaderName = alias === undefined ? name : alias;

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

	addParameterRO: function ( name, value, alias ) {

		if ( this._parameters === undefined ) this._parameters = {};

		var parameter = new MaterialParameter( value );
		var shaderName = alias === undefined ? name : alias;

		this._parameters[ shaderName ] = parameter;

		Object.defineProperty( this, name, {
			get: function() { return parameter.getObjectValue() }
		} );

	},

	addDerivedParameter: function ( name, value, func ) {

		if ( this._parameters === undefined ) this._parameters = {};

		var parameter = new MaterialParameter( value, func );
		var shaderName = alias === undefined ? name : alias;

		this._parameters[ shaderName ] = parameter;

		Object.defineProperty( this, name, {
			set: function( value ) { parameter.setValue( value ) },
			get: function() { return parameter.getValue() }
		} );

	},

	getParameter: function( name ) {

		if ( this._parameters === undefined ) this._parameters = {};

		return this._parameters[ name ];

	}

} );

export { ParameterSource };
