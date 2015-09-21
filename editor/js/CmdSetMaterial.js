/**
 * Created by Daniel on 21.07.15.
 */

CmdSetMaterial = function ( object, newMaterial ) {

	Cmd.call( this );

	this.type = 'CmdSetMaterial';

	this.object = object;
	this.objectUuid = object !== undefined ? object.uuid : undefined;

	this.oldMaterial = object !== undefined ? object.material : undefined;
	this.newMaterial = newMaterial;

	meta = {
		geometries: {},
		materials: {},
		textures: {},
		images: {}
	};

	this.oldMaterialJSON = object !== undefined ? object.material.toJSON( meta ) : undefined;
	this.newMaterialJSON = newMaterial !== undefined ? newMaterial.toJSON( meta ) : undefined;

};

CmdSetMaterial.prototype = {

	execute: function () {

		this.object.material = this.newMaterial;
		this.editor.signals.materialChanged.dispatch( this.newMaterial );

	},

	undo: function () {

		this.object.material = this.oldMaterial;
		this.editor.signals.materialChanged.dispatch( this.oldMaterial );

	},

	toJSON: function () {

		var output = Cmd.prototype.toJSON.call( this );

		output.objectUuid = this.objectUuid;
		output.oldMaterial = this.oldMaterialJSON;
		output.newMaterial = this.newMaterialJSON;

		return output;

	},

	fromJSON: function ( json ) {

		Cmd.prototype.fromJSON.call( this, json );

		this.object = this.editor.objectByUuid( json.objectUuid );
		this.objectUuid = json.objectUuid;

		this.oldMaterial = this.parseMaterial( json.oldMaterial );
		this.newMaterial = this.parseMaterial( json.newMaterial );

		this.oldMaterialJSON = json.oldMaterial;
		this.newMaterialJSON = json.newMaterial;

	},

	parseMaterial: function ( data ) {

		var loader = new THREE.ObjectLoader();
		return loader.parseMaterials( [ data ] )[ data.uuid ];

	}

};
