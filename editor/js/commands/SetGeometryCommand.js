import { Command } from '../Command.js';
import { ObjectLoader } from '../../../build/three.module.js';

/**
 * @param editor Editor
 * @param object THREE.Object3D
 * @param newGeometry THREE.Geometry
 * @constructor
 */

class SetGeometryCommand extends Command {

	constructor( editor, object, newGeometry ) {

		super( editor );

		this.type = 'SetGeometryCommand';
		this.name = 'Set Geometry';
		this.updatable = true;

		this.object = object;
		this.oldGeometry = ( object !== undefined ) ? object.geometry : undefined;
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
		output.oldGeometry = this.object.geometry.toJSON();
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
