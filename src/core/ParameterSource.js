
function MaterialParameter( value ) {

	this.value = value;
	this.version = ++MaterialParameter.version;

}

MaterialParameter.version = 0;

MaterialParameter.prototype = {

	constructor: MaterialParameter,

	setValue: function ( value ) {

//		console.log(" setting value ", value );

		this.value = value;
		this.version = ++MaterialParameter.version;

	},

	getValue: function () {

		this.version = ++MaterialParameter.version;

		return this.value;

	}

}

function ParameterSource() {}

Object.assign( ParameterSource.prototype, {

	addParameter: function ( name, value, alias ) {

		if ( this._parameters === undefined ) this._parameters = {};

		var parameter = new MaterialParameter( value );
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
