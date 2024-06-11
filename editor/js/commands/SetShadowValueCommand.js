import { Command } from '../Command.js';

/**
 * @param editor Editor
 * @param object THREE.Object3D
 * @param attributeName string
 * @param newValue number, string, boolean or object
 * @constructor
 */
class SetShadowValueCommand extends Command {

	constructor( editor, object = null, attributeName = '', newValue = null ) {

		super( editor );

		this.type = 'SetShadowValueCommand';
		this.name = editor.strings.getKey( 'command/SetShadowValue' ) + ': ' + attributeName;
		this.updatable = true;

		this.object = object;
		this.attributeName = attributeName;
		this.oldValue = ( object !== null ) ? object.shadow[ attributeName ] : null;
		this.newValue = newValue;

	}

	execute() {

		this.object.shadow[ this.attributeName ] = this.newValue;
		this.editor.signals.objectChanged.dispatch( this.object );

	}

	undo() {

		this.object.shadow[ this.attributeName ] = this.oldValue;
		this.editor.signals.objectChanged.dispatch( this.object );

	}

	update( cmd ) {

		this.newValue = cmd.newValue;

	}

	toJSON() {

		const output = super.toJSON( this );

		output.objectUuid = this.object.uuid;
		output.attributeName = this.attributeName;
		output.oldValue = this.oldValue;
		output.newValue = this.newValue;

		return output;

	}

	fromJSON( json ) {

		super.fromJSON( json );

		this.object = this.editor.objectByUuid( json.objectUuid );
		this.attributeName = json.attributeName;
		this.oldValue = json.oldValue;
		this.newValue = json.newValue;

	}

}

export { SetShadowValueCommand };
