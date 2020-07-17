/**
 * @author dforrer / https://github.com/dforrer
 * Developed as part of a project at University of Applied Sciences and Arts Northwestern Switzerland (www.fhnw.ch)
 */

import { Command } from '../Command.js';
import { SetUuidCommand } from './SetUuidCommand.js';
import { SetValueCommand } from './SetValueCommand.js';
import { AddObjectCommand } from './AddObjectCommand.js';

/**
 * @param editor Editor
 * @param scene containing children to import
 * @constructor
 */
function SetSceneCommand( editor, scene ) {

	Command.call( this, editor );

	this.type = 'SetSceneCommand';
	this.name = 'Set Scene';

	this.cmdArray = [];

	if ( scene !== undefined ) {

		this.cmdArray.push( new SetUuidCommand( this.editor, this.editor.scene, scene.uuid ) );
		this.cmdArray.push( new SetValueCommand( this.editor, this.editor.scene, 'name', scene.name ) );
		this.cmdArray.push( new SetValueCommand( this.editor, this.editor.scene, 'userData', JSON.parse( JSON.stringify( scene.userData ) ) ) );

		while ( scene.children.length > 0 ) {

			var child = scene.children.pop();
			this.cmdArray.push( new AddObjectCommand( this.editor, child ) );

		}

	}

}

SetSceneCommand.prototype = {

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

		var output = Command.prototype.toJSON.call( this );

		var cmds = [];
		for ( var i = 0; i < this.cmdArray.length; i ++ ) {

			cmds.push( this.cmdArray[ i ].toJSON() );

		}
		output.cmds = cmds;

		return output;

	},

	fromJSON: function ( json ) {

		Command.prototype.fromJSON.call( this, json );

		var cmds = json.cmds;
		for ( var i = 0; i < cmds.length; i ++ ) {

			var cmd = new window[ cmds[ i ].type ]();	// creates a new object of type "json.type"
			cmd.fromJSON( cmds[ i ] );
			this.cmdArray.push( cmd );

		}

	}

};

export { SetSceneCommand };
