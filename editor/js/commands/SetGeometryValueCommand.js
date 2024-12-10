import { Command } from '../Command.js';

class SetGeometryValueCommand extends Command {

	/**
	 * @param {Editor} editor
	 * @param {THREE.Object3D|null} [object=null]
	 * @param {String} [attributeName='']
	 * @param {Number|String|Boolean|Object|null} [newValue=null]
	 * @constructor
	 */
	constructor( editor, object = null, attributeName = '', newValue = null ) {

		super( editor );

		this.type = 'SetGeometryValueCommand';
		this.name = editor.strings.getKey( 'command/SetGeometryValue' ) + ': ' + attributeName;

		this.object = object;
		this.attributeName = attributeName;
		this.oldValue = ( object !== null ) ? object.geometry[ attributeName ] : null;
		this.newValue = newValue;

	}

	execute() {

		this.object.geometry[ this.attributeName ] = this.newValue;
		this.editor.signals.objectChanged.dispatch( this.object );
		this.editor.signals.geometryChanged.dispatch();
		this.editor.signals.sceneGraphChanged.dispatch();

	}

	undo() {

		this.object.geometry[ this.attributeName ] = this.oldValue;
		this.editor.signals.objectChanged.dispatch( this.object );
		this.editor.signals.geometryChanged.dispatch();
		this.editor.signals.sceneGraphChanged.dispatch();

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

export { SetGeometryValueCommand };
