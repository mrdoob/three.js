/**
 * Created by Daniel on 23.07.15.
 */

CmdSetPosition = function ( object, newPositionVector, oldPositionVector ) {

	Cmd.call( this );

	this.type = 'CmdSetPosition';
	this.updatable = true;

	this.object = object;
	this.objectUuid = object !== undefined ? object.uuid : undefined;

	if (object !== undefined && newPositionVector !== undefined) {

		this.oldPosition = object.position.clone();
		this.newPosition = newPositionVector.clone();

	}

	if (oldPositionVector !== undefined) {

		this.oldPosition = oldPositionVector.clone();

	}

};
CmdSetPosition.prototype = {

	execute: function () {

		this.object.position.copy( this.newPosition );
		this.object.updateMatrixWorld( true );
		this.editor.signals.objectChanged.dispatch( this.object );

	},

	undo: function () {

		this.object.position.copy( this.oldPosition );
		this.object.updateMatrixWorld( true );
		this.editor.signals.objectChanged.dispatch( this.object );

	},

	update: function ( command ) {

		this.newPosition.copy( command.newPosition );

	},

	toJSON: function () {

		var output = Cmd.prototype.toJSON.call( this );

		output.objectUuid = this.objectUuid;
		output.oldPosition = this.oldPosition.toArray();
		output.newPosition = this.newPosition.toArray();

		return output;

	},

	fromJSON: function ( json ) {

		Cmd.prototype.fromJSON.call( this, json );

		this.object = this.editor.objectByUuid( json.objectUuid );
		this.objectUuid = json.objectUuid;
		this.oldPosition = new THREE.Vector3().fromArray(json.oldPosition);
		this.newPosition = new THREE.Vector3().fromArray(json.newPosition);

	}

};