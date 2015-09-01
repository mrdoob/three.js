/**
 * @author mrdoob / http://mrdoob.com/
 * edited by dforrer on 20.07.15.
 */

History = function ( editor ) {

	this.editor = editor;
	this.undos = [];
	this.redos = [];
	this.lastCmdTime = new Date();
	this.idCounter = 0;

};

History.prototype = {

	execute: function ( cmd ) {

		var lastCmd = this.undos[ this.undos.length - 1 ];
		var timeDifference = new Date().getTime() - this.lastCmdTime.getTime();

		if ( lastCmd != null &&
			lastCmd.updatable &&
			lastCmd.object === cmd.object &&
			lastCmd.type == cmd.type &&
			timeDifference < 500 ) {

			// command objects have the same type and are less than 0.5 second apart
			lastCmd.update( cmd );
			cmd = lastCmd;

		} else {

			this.undos.push( cmd );
			cmd.editor = this.editor;
			cmd.id = ++this.idCounter;

		}
		cmd.execute();

		this.lastCmdTime = new Date();

		// clearing all the redo-commands

		this.redos = [];
		this.editor.signals.historyChanged.dispatch( cmd );

	},

	undo: function () {

		var cmd = undefined;

		if ( this.undos.length > 0 ) {

			var cmd = this.undos.pop();

			if ( cmd.serialized ) {

				var json = cmd;
				cmd = new window[ json.type ]();	// creates a new object of type "json.type"
				cmd.editor = this.editor;
				cmd.fromJSON( json );

			}

		}

		if ( cmd !== undefined ) {

			cmd.undo();
			console.log('Type: Undo ' + cmd.type );
			this.redos.push( cmd );
			this.editor.signals.historyChanged.dispatch( cmd );

		}

		return cmd;

	},

	redo: function () {

		var cmd = undefined;

		if ( this.redos.length > 0 ) {

			var cmd = this.redos.pop();

			if ( cmd.serialized ) {

				var json = cmd;
				cmd = new window[ json.type ]();	// creates a new object of type "json.type"
				cmd.editor = this.editor;
				cmd.fromJSON( json );

			}

		}

		if ( cmd !== undefined ) {

			cmd.execute();
			console.log('Type: Redo ' + cmd.type );
			this.undos.push( cmd );
			this.editor.signals.historyChanged.dispatch( cmd );

		}

		return cmd;

	},

	toJSON: function () {

		var history = {};

		// Append Undos to History

		var undos = [];

		for ( var i = 0 ; i < this.undos.length; i++ ) {

			var cmd = this.undos[ i ];

			if ( cmd.serialized ) {

				undos.push( cmd );	// add without serializing

			} else {

				undos.push( cmd.toJSON() );

			}

		}

		history.undos = undos;

		// Append Redos to History

		var redos = [];

		for ( var i = 0 ; i < this.redos.length; i++ ) {

			var cmd = this.redos[ i ];

			if ( cmd.serialized ) {

				redos.push( cmd );	// add without serializing

			} else {

				redos.push( cmd.toJSON() );

			}


		}

		history.redos = redos;

		return history;

	},

	fromJSON: function ( json ) {

		if ( json === undefined ) return;

		for ( var i = 0; i < json.undos.length ; i++ ) {

			json.undos[ i ].serialized = true;
			this.undos.push( json.undos[ i ] );

			this.idCounter = json.undos[ i ].id > this.idCounter ? json.undos[ i ].id : this.idCounter; // set last used idCounter

		}

		for ( var i = 0; i < json.redos.length ; i++ ) {

			json.redos[ i ].serialized = true;
			this.redos.push( json.redos[ i ] );

			this.idCounter = json.redos[ i ].id > this.idCounter ? json.redos[ i ].id : this.idCounter; // set last used idCounter

		}

		this.editor.signals.historyChanged.dispatch();

	},

	clear: function () {

		this.undos = [];
		this.redos = [];
		this.idCounter = 0;

		this.editor.signals.historyChanged.dispatch();

	},

	goToState: function ( id ) {

		this.editor.signals.sceneGraphChanged.active = false;
		this.editor.signals.historyChanged.active = false;

		var cmd = this.undos.length > 0 ? this.undos[ this.undos.length - 1 ] : undefined;	// next cmd to pop

		if ( cmd === undefined || id > cmd.id ) {

			cmd = this.redo();
			while ( id > cmd.id ) {

				cmd = this.redo();

			}

		} else {

			while ( true ) {

				cmd = this.undos[ this.undos.length - 1 ];	// next cmd to pop

				if ( cmd === undefined || id === cmd.id ) break;

				cmd = this.undo();

			}

		}

		this.editor.signals.sceneGraphChanged.active = true;
		this.editor.signals.historyChanged.active = true;

		this.editor.signals.sceneGraphChanged.dispatch();
		this.editor.signals.historyChanged.dispatch( cmd );

	}

};
