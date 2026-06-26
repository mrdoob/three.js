import { Command } from '../Command.js';
import { ObjectLoader } from 'three';

class SetGeometryCommand extends Command {

	/**
	 * @param {Editor} editor
	 * @param {THREE.Object3D|null} [object=null]
	 * @param {THREE.Geometry|null} [newGeometry=null]
	 * @constructor
	 */
	constructor( editor, object = null, newGeometry = null ) {

		super( editor );

		this.type = 'SetGeometryCommand';
		this.name = editor.strings.getKey( 'command/SetGeometry' );
		this.updatable = true;

		this.object = object;
		this.oldGeometry = ( object !== null ) ? object.geometry : null;
		this.newGeometry = newGeometry;

	}

	execute() {

		this.object.geometry.dispose();
		this.object.geometry = this.newGeometry;
		this.object.geometry.computeBoundingSphere();

		this.editor.signals.geometryChanged.dispatch( this.object );
		this.editor.signals.sceneGraphChanged.dispatch();

	}

	undo() {

		this.object.geometry.dispose();
		this.object.geometry = this.oldGeometry;
		this.object.geometry.computeBoundingSphere();

		this.editor.signals.geometryChanged.dispatch( this.object );
		this.editor.signals.sceneGraphChanged.dispatch();

	}

	update( cmd ) {

		this.newGeometry = cmd.newGeometry;

	}

	toJSON() {

		const output = super.toJSON( this );

		output.objectUuid = this.object.uuid;
		output.oldGeometry = this.oldGeometry.toJSON();
		output.newGeometry = this.newGeometry.toJSON();

		return output;

	}

	fromJSON( json ) {

		super.fromJSON( json );

		this.object = this.editor.objectByUuid( json.objectUuid );

		this.oldGeometry = parseGeometry( json.oldGeometry );
		this.newGeometry = parseGeometry( json.newGeometry );

		function parseGeometry( data ) {

			const loader = new ObjectLoader();
			return loader.parseGeometries( [ data ] )[ data.uuid ];

		}

	}

}

export { SetGeometryCommand };
