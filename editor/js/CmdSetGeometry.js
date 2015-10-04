/**
 * Created by Daniel on 21.07.15.
 */

CmdSetGeometry = function ( object, newGeometry ) {

	Cmd.call( this );

	this.type = 'CmdSetGeometry';
	this.name = 'Set Geometry';
	this.updatable = true;

	this.object = object;
	this.objectUuid = ( object !== undefined ) ? object.uuid : undefined;

	this.oldGeometry = ( object !== undefined ) ? object.geometry : undefined;
	this.newGeometry = newGeometry;

	this.oldGeometryJSON = ( object !== undefined ) ? object.geometry.toJSON() : undefined;
	this.newGeometryJSON = ( newGeometry !== undefined ) ? newGeometry.toJSON() : undefined;

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

		output.objectUuid = this.objectUuid;
		output.oldGeometry = this.oldGeometryJSON;
		output.newGeometry = this.newGeometryJSON;

		return output;

	},

	fromJSON: function ( json ) {

		Cmd.prototype.fromJSON.call( this, json );

		this.object = this.editor.objectByUuid( json.objectUuid );
		this.objectUuid = json.objectUuid;
		this.oldGeometryJSON = json.oldGeometry;
		this.newGeometryJSON = json.newGeometry;


		this.oldGeometry = parseGeometry( this.oldGeometryJSON );
		this.newGeometry = parseGeometry( this.newGeometryJSON );

		function parseGeometry ( data ) {

			var loader = new THREE.ObjectLoader();
			return loader.parseGeometries( [ data ] )[ data.uuid ];

		}

	}


};
