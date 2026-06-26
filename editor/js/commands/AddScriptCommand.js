import { Command } from '../Command.js';

class AddScriptCommand extends Command {

	/**
	 * @param {Editor} editor
	 * @param {THREE.Object3D|null} [object=null]
	 * @param {string} [script='']
	 * @constructor
	 */
	constructor( editor, object = null, script = '' ) {

		super( editor );

		this.type = 'AddScriptCommand';
		this.name = editor.strings.getKey( 'command/AddScript' );

		this.object = object;
		this.script = script;

	}

	execute() {

		if ( this.editor.scripts[ this.object.uuid ] === undefined ) {

			this.editor.scripts[ this.object.uuid ] = [];

		}

		this.editor.scripts[ this.object.uuid ].push( this.script );

		this.editor.signals.scriptAdded.dispatch( this.script );

	}

	undo() {

		if ( this.editor.scripts[ this.object.uuid ] === undefined ) return;

		const index = this.editor.scripts[ this.object.uuid ].indexOf( this.script );

		if ( index !== - 1 ) {

			this.editor.scripts[ this.object.uuid ].splice( index, 1 );

		}

		this.editor.signals.scriptRemoved.dispatch( this.script );

	}

	toJSON() {

		const output = super.toJSON( this );

		output.objectUuid = this.object.uuid;
		output.script = this.script;

		return output;

	}

	fromJSON( json ) {

		super.fromJSON( json );

		this.script = json.script;
		this.object = this.editor.objectByUuid( json.objectUuid );

	}

}

export { AddScriptCommand };
