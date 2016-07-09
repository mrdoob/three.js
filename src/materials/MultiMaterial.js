import { _Math } from '../math/Math';

/**
 * @author mrdoob / http://mrdoob.com/
 */

function MultiMaterial ( materials ) {
	this.isMultiMaterial = true;

	this.uuid = _Math.generateUUID();

	this.type = 'MultiMaterial';

	this.materials = materials instanceof Array ? materials : [];

	this.visible = true;

};

MultiMaterial.prototype = {

	constructor: MultiMaterial,

	toJSON: function ( meta ) {

		var output = {
			metadata: {
				version: 4.2,
				type: 'material',
				generator: 'MaterialExporter'
			},
			uuid: this.uuid,
			type: this.type,
			materials: []
		};

		var materials = this.materials;

		for ( var i = 0, l = materials.length; i < l; i ++ ) {

			var material = materials[ i ].toJSON( meta );
			delete material.metadata;

			output.materials.push( material );

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


export { MultiMaterial };