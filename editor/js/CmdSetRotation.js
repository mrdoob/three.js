/**
 * Created by Daniel on 23.07.15.
 */

CmdSetRotation = function ( object, newRotationEuler, oldRotationEuler ) {

	Cmd.call( this );

	this.type = 'CmdSetRotation';
	this.name = 'Set Rotation';
	this.updatable = true;

	this.object = object;
	this.objectUuid = object !== undefined ? object.uuid : undefined;

	if ( object !== undefined && newRotationEuler !== undefined) {

		this.oldRotation = object.rotation.clone();
		this.newRotation = newRotationEuler.clone();

	}

	if ( oldRotationEuler !== undefined ) {

		this.oldRotation = oldRotationEuler.clone();

	}

};

CmdSetRotation.prototype = {

	execute: function () {

		this.object.rotation.copy( this.newRotation );
		this.object.updateMatrixWorld( true );
		this.editor.signals.objectChanged.dispatch( this.object );

	},

	undo: function () {

		this.object.rotation.copy( this.oldRotation );
		this.object.updateMatrixWorld( true );
		this.editor.signals.objectChanged.dispatch( this.object );

	},

	update: function ( command ) {

		this.newRotation.copy( command.newRotation );

	},

	toJSON: function () {

		var output = Cmd.prototype.toJSON.call( this );

		output.objectUuid = this.objectUuid;
		output.oldRotation = this.oldRotation.toArray();
		output.newRotation = this.newRotation.toArray();

		return output;

	},

	fromJSON: function ( json ) {

		Cmd.prototype.fromJSON.call( this, json );

		this.object = this.editor.objectByUuid( json.objectUuid );
		this.objectUuid = json.objectUuid;
		this.oldRotation = new THREE.Euler().fromArray(json.oldRotation);
		this.newRotation = new THREE.Euler().fromArray(json.newRotation);

	}

};