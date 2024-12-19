import { Command } from '../Command.js';

class RemoveScriptCommand extends Command {

	/**
	 * @param {Editor} editor
	 * @param {THREE.Object3D|null} [object=null]
	 * @param {String} [script='']
	 * @constructor
	 */
	constructor( editor, object = null, script = '' ) {

		super( editor );

		this.type = 'RemoveScriptCommand';
		this.name = editor.strings.getKey( 'command/RemoveScript' );

		this.object = object;
		this.script = script;

		if ( this.object !== null && this.script !== '' ) {

			this.index = this.editor.scripts[ this.object.uuid ].indexOf( this.script );

		}

	}

	execute() {

		if ( this.editor.scripts[ this.object.uuid ] === undefined ) return;

		if ( this.index !== - 1 ) {

			this.editor.scripts[ this.object.uuid ].splice( this.index, 1 );

		}

		this.editor.signals.scriptRemoved.dispatch( this.script );

	}

	undo() {

		if ( this.editor.scripts[ this.object.uuid ] === undefined ) {

			this.editor.scripts[ this.object.uuid ] = [];

		}

		this.editor.scripts[ this.object.uuid ].splice( this.index, 0, this.script );

		this.editor.signals.scriptAdded.dispatch( this.script );

	}

	toJSON() {

		const output = super.toJSON( this );

		output.objectUuid = this.object.uuid;
		output.script = this.script;
		output.index = this.index;

		return output;

	}

	fromJSON( json ) {

		super.fromJSON( json );

		this.script = json.script;
		this.index = json.index;
		this.object = this.editor.objectByUuid( json.objectUuid );

	}

}

export { RemoveScriptCommand };
