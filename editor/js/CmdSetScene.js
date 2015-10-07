/**
 * @author dforrer / https://github.com/dforrer
 */

/**
 * @param scene containing children to import
 * @constructor
 */

CmdSetScene = function ( scene ) {

	Cmd.call( this );

	this.type = 'CmdSetScene';
	this.name = 'Set Scene';

	this.cmdArray = [];

	if ( scene !== undefined ) {

		this.cmdArray.push( new CmdSetUuid( this.editor.scene, scene.uuid ) );
		this.cmdArray.push( new CmdSetValue( this.editor.scene, 'name', scene.name ) );
		this.cmdArray.push( new CmdSetValue( this.editor.scene, 'userData', JSON.parse( JSON.stringify( scene.userData ) ) ) );

		while ( scene.children.length > 0 ) {

			var child = scene.children.pop();
			this.cmdArray.push( new CmdAddObject( child ) );

		}

	}
};

CmdSetScene.prototype = {

	execute: function () {

		this.editor.signals.sceneGraphChanged.active = false;

		for ( var i = 0; i < this.cmdArray.length; i ++ ) {

			this.cmdArray[ i ].execute();

		}

		this.editor.signals.sceneGraphChanged.active = true;
		this.editor.signals.sceneGraphChanged.dispatch();

	},

	undo: function () {

		this.editor.signals.sceneGraphChanged.active = false;

		for ( var i = this.cmdArray.length - 1; i >= 0; i -- ) {

			this.cmdArray[ i ].undo();

		}

		this.editor.signals.sceneGraphChanged.active = true;
		this.editor.signals.sceneGraphChanged.dispatch();

	},

	toJSON: function () {

		var output = Cmd.prototype.toJSON.call( this );

		var cmds = [];
		for ( var i = 0; i < this.cmdArray.length; i ++ ) {

			cmds.push( this.cmdArray[ i ].toJSON() );

		}
		output.cmds = cmds;

		return output;

	},

	fromJSON: function ( json ) {

		Cmd.prototype.fromJSON.call( this, json );

		var cmds = json.cmds;
		for ( var i = 0; i < cmds.length; i ++ ) {

			var cmd = new window[ cmds[ i ].type ]();	// creates a new object of type "json.type"
			cmd.fromJSON( cmds[ i ] );
			this.cmdArray.push( cmd );

		}

	}

};
