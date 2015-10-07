/**
 * @author dforrer / https://github.com/dforrer
 */

/**
 * @param object THREE.Object3D
 * @param newRotation THREE.Euler
 * @param optionalOldRotation THREE.Euler
 * @constructor
 */

CmdSetRotation = function ( object, newRotation, optionalOldRotation ) {

	Cmd.call( this );

	this.type = 'CmdSetRotation';
	this.name = 'Set Rotation';
	this.updatable = true;

	this.object = object;

	if ( object !== undefined && newRotation !== undefined) {

		this.oldRotation = object.rotation.clone();
		this.newRotation = newRotation.clone();

	}

	if ( optionalOldRotation !== undefined ) {

		this.oldRotation = optionalOldRotation.clone();

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

		output.objectUuid = this.object.uuid;
		output.oldRotation = this.oldRotation.toArray();
		output.newRotation = this.newRotation.toArray();

		return output;

	},

	fromJSON: function ( json ) {

		Cmd.prototype.fromJSON.call( this, json );

		this.object = this.editor.objectByUuid( json.objectUuid );
		this.oldRotation = new THREE.Euler().fromArray(json.oldRotation);
		this.newRotation = new THREE.Euler().fromArray(json.newRotation);

	}

};