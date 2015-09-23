/**
 * Created by Daniel on 23.07.15.
 */

CmdSetScale = function ( object, newScaleVector, oldScaleVector ) {

	Cmd.call( this );

	this.type = 'CmdSetScale';
	this.updatable = true;

	this.object = object;
	this.objectUuid = object !== undefined ? object.uuid : undefined;

	if ( object !== undefined && newScaleVector !== undefined ) {

		this.oldScale = object.scale.clone();
		this.newScale = newScaleVector.clone();

	}

	if ( oldScaleVector !== undefined ) {

		this.oldScale = oldScaleVector.clone();

	}
};

CmdSetScale.prototype = {

	execute: function () {

		this.object.scale.copy( this.newScale );
		this.object.updateMatrixWorld( true );
		this.editor.signals.objectChanged.dispatch( this.object );

	},

	undo: function () {

		this.object.scale.copy( this.oldScale );
		this.object.updateMatrixWorld( true );
		this.editor.signals.objectChanged.dispatch( this.object );

	},

	update: function ( command ) {

		this.newScale.copy( command.newScale );

	},

	toJSON: function () {

		var output = Cmd.prototype.toJSON.call( this );

		output.objectUuid = this.objectUuid;
		output.oldScale = this.oldScale.toArray();
		output.newScale = this.newScale.toArray();

		return output;

	},

	fromJSON: function ( json ) {

		Cmd.prototype.fromJSON.call( this, json );

		this.object = this.editor.objectByUuid( json.objectUuid );
		this.objectUuid = json.objectUuid;
		this.oldScale = new THREE.Vector3().fromArray(json.oldScale);
		this.newScale = new THREE.Vector3().fromArray(json.newScale);

	}

};