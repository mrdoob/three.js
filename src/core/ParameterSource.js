
function MaterialParameter( parent, name ) {

	this.parent = parent;
	this.name = name;

}

MaterialParameter.prototype = {

	constructor: MaterialParameter,

	getValue: function () {

		return this.parent[ this.name ];

	}

}

function DerivedMaterialParameter( parent, name, getFunc ) {

	this.parent = parent;
	this.name = name;
	this.getFunc = getFunc;

}

DerivedMaterialParameter.prototype = {

	constructor: DerivedMaterialParameter,

	getValue: function () {

		var parent = this.parent;

		return this.getFunc( parent, parent[ this.name ] );

	}

}

function ParameterSource() {}

Object.assign( ParameterSource.prototype, {

	addParameters: function ( parameterList ) {

		for ( var i = 0, l = parameterList.length; i < l; i++ ) {

			this.addParameter( parameterList[ i ] );

		}

	},

	addParameter: function ( name, value, alias, getFunc ) {

		if ( this._parameters === undefined ) this._parameters = {};

		var parameter = getFunc === undefined ? new MaterialParameter( this, name ) : new DerivedMaterialParameter( this, name, getFunc );
		var shaderName = ! alias ? name : alias;

		this._parameters[ shaderName ] = parameter;

		this[ name ] = value;

	},

	getParameter: function( name ) {

		if ( this._parameters === undefined ) this._parameters = {};

		return this._parameters[ name ];

	}

} );

export { ParameterSource };
