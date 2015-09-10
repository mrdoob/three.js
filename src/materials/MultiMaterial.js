/**
 * @author mrdoob / http://mrdoob.com/
 */

module.exports = MultiMaterial;

var _Math = require( "../math/Math" );

function MultiMaterial( materials ) {

	this.uuid = _Math.generateUUID();

	this.type = "MultiMaterial";

	this.materials = materials instanceof Array ? materials : [];

	this.visible = true;

}

MultiMaterial.prototype = {

	constructor: MultiMaterial,

	toJSON: function () {

		var output = {
			metadata: {
				version: 4.2,
				type: "material",
				generator: "MaterialExporter"
			},
			uuid: this.uuid,
			type: this.type,
			materials: []
		};

		for ( var i = 0, l = this.materials.length; i < l; i ++ ) {

			output.materials.push( this.materials[ i ].toJSON() );

		}

		output.visible = this.visible;

		return output;

	},

	clone: function () {

		var material = new this.constructor();

		for ( var i = 0; i < this.materials.length; i ++ ) {

			material.materials.push( this.materials[ i ].clone() );

		}

		material.visible = this.visible;

		return material;

	}

};
