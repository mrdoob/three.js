/**
 * Created by Daniel on 21.07.15.
 */

CmdSetGeometry = function ( object, newGeometry ) {

	Cmd.call( this );

	this.type = 'CmdSetGeometry';
	this.name = 'Set Geometry';
	this.updatable = true;

	this.object = object;
	this.oldGeometry = ( object !== undefined ) ? object.geometry : undefined;
	this.newGeometry = newGeometry;

};

CmdSetGeometry.prototype = {

	execute: function () {

		this.object.geometry.dispose();
		this.object.geometry = this.newGeometry;
		this.object.geometry.computeBoundingSphere();

		this.editor.signals.geometryChanged.dispatch( this.object );
		this.editor.signals.sceneGraphChanged.dispatch();

	},

	undo: function () {

		this.object.geometry.dispose();
		this.object.geometry = this.oldGeometry;
		this.object.geometry.computeBoundingSphere();

		this.editor.signals.geometryChanged.dispatch( this.object );
		this.editor.signals.sceneGraphChanged.dispatch();

	},

	update: function ( cmd ) {

		this.newGeometry = cmd.newGeometry;
		this.newGeometryJSON = cmd.newGeometry.toJSON();

	},

	toJSON: function () {

		var output = Cmd.prototype.toJSON.call( this );

		output.objectUuid = this.object.uuid;
		output.oldGeometry = this.object.geometry.toJSON();
		output.newGeometry = this.newGeometry.toJSON();

		return output;

	},

	fromJSON: function ( json ) {

		Cmd.prototype.fromJSON.call( this, json );

		this.object = this.editor.objectByUuid( json.objectUuid );

		this.oldGeometry = parseGeometry( json.oldGeometry );
		this.newGeometry = parseGeometry( json.newGeometry );

		function parseGeometry ( data ) {

			var loader = new THREE.ObjectLoader();
			return loader.parseGeometries( [ data ] )[ data.uuid ];

		}

	}

};
