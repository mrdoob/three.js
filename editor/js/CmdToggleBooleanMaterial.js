/**
 * Created by Daniel on 21.07.15.
 */

CmdToggleBooleanMaterial = function ( object, attributeName ) {

	Cmd.call( this );

	this.type = 'CmdToggleBooleanMaterial';

	this.object = object;
	this.attributeName = attributeName;
	this.objectUuid = object !== undefined ? object.uuid : undefined;

};

CmdToggleBooleanMaterial.prototype = {

	execute: function () {

		this.object.material[ this.attributeName ] = !this.object.material[ this.attributeName ];
		this.editor.signals.materialChanged.dispatch( this.object.material );

	},

	undo: function () {

		this.object.material[ this.attributeName ] = !this.object.material[ this.attributeName ];
		this.editor.signals.materialChanged.dispatch( this.object.material );

	},

	toJSON: function () {

		var output = Cmd.prototype.toJSON.call( this );

		output.objectUuid = this.objectUuid;
		output.attributeName = this.attributeName;

		return output;

	},

	fromJSON: function ( json ) {

		Cmd.prototype.fromJSON.call( this, json );

		this.object = this.editor.objectByUuid( json.objectUuid );
		this.objectUuid = json.objectUuid;
		this.attributeName = json.attributeName;

	}

};
