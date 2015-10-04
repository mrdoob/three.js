/**
 * Created by Daniel on 21.07.15.
 */

CmdSetGeometryValue = function ( object, attributeName, newValue ) {

	Cmd.call( this );

	this.type = 'CmdSetGeometryValue';
	this.name = 'Set Geometry.' + attributeName;

	this.object = object;
	this.attributeName = attributeName;
	this.oldValue = object !== undefined ? object.geometry[ attributeName ] : undefined;
	this.newValue = newValue;
	this.objectUuid = object !== undefined ? object.uuid : undefined;

};

CmdSetGeometryValue.prototype = {

	execute: function () {

		this.object.geometry[ this.attributeName ] = this.newValue;
		this.editor.signals.objectChanged.dispatch( this.object );
		this.editor.signals.sceneGraphChanged.dispatch();
		this.editor.signals.updateSidebar.dispatch();

	},

	undo: function () {

		this.object.geometry[ this.attributeName ] = this.oldValue;
		this.editor.signals.objectChanged.dispatch( this.object );
		this.editor.signals.sceneGraphChanged.dispatch();
		this.editor.signals.updateSidebar.dispatch();

	},

	toJSON: function () {

		var output = Cmd.prototype.toJSON.call( this );

		output.objectUuid = this.objectUuid;
		output.attributeName = this.attributeName;
		output.oldValue = this.oldValue;
		output.newValue = this.newValue;

		return output;

	},

	fromJSON: function ( json ) {

		Cmd.prototype.fromJSON.call( this, json );

		this.objectUuid = json.objectUuid;
		this.attributeName = json.attributeName;
		this.oldValue = json.oldValue;
		this.newValue = json.newValue;
		this.object = this.editor.objectByUuid( json.objectUuid );

	}

};
