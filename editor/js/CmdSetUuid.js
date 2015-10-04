/**
 * Created by Daniel on 21.07.15.
 */

CmdSetUuid = function ( object, newUuid ) {

	Cmd.call( this );

	this.type = 'CmdSetUuid';
	this.name = 'Update UUID';

	this.object = object;

	this.oldUuid = ( object !== undefined ) ? object.uuid : undefined;
	this.newUuid = newUuid;

};

CmdSetUuid.prototype = {

	init: function () {

		if ( this.object === undefined ) {

			this.object = this.editor.objectByUuid( this.oldUuid );

		}
		if ( this.object === undefined ) {

			this.object = this.editor.objectByUuid( this.newUuid );

		}

	},

	execute: function () {

		this.init();

		this.object.uuid = this.newUuid;
		this.editor.signals.objectChanged.dispatch( this.object );
		this.editor.signals.sceneGraphChanged.dispatch();
		this.editor.signals.updateSidebar.dispatch();

	},

	undo: function () {

		this.init();

		this.object.uuid = this.oldUuid;
		this.editor.signals.objectChanged.dispatch( this.object );
		this.editor.signals.sceneGraphChanged.dispatch();
		this.editor.signals.updateSidebar.dispatch();

	},

	toJSON: function () {

		var output = Cmd.prototype.toJSON.call( this );

		output.oldUuid = this.oldUuid;
		output.newUuid = this.newUuid;

		return output;

	},

	fromJSON: function ( json ) {

		Cmd.prototype.fromJSON.call( this, json );

		this.oldUuid = json.oldUuid;
		this.newUuid = json.newUuid;

	}

};
