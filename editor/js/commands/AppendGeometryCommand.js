/**
 * @author Temdog007 / https://github.com/Temdog007
 */

/**
 * @param object THREE.Object3D
 * @param newGeometry THREE.Geometry
 * @constructor
 */

var AppendGeometryCommand = function ( object, newGeometry ) {

	Command.call( this, object, newGeometry );

	this.type = 'AppendGeometryCommand';
	this.name = 'Append Geometry';
	
	this.object = object;
	this.oldGeometry = ( object !== undefined ) ? object.geometry : undefined;
	this.newGeometry = newGeometry;
};

AppendGeometryCommand.prototype = {

	execute: function () {

		// All buffer geometries in list must have the same attributes or else null is returned.
		var g = THREE.BufferGeometryUtils.mergeBufferGeometries( [ this.object.geometry, this.newGeometry ] );

		this.object.geometry.dispose();
		this.object.geometry = g !== null ? g : this.newGeometry.clone();
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

	toJSON: function () {

		var output = Command.prototype.toJSON.call( this );

		output.objectUuid = this.object.uuid;
		output.oldGeometry = this.object.geometry.toJSON();
		output.newGeometry = this.newGeometry.toJSON();

		return output;

	},

	fromJSON: function ( json ) {

		Command.prototype.fromJSON.call( this, json );

		this.object = this.editor.objectByUuid( json.objectUuid );

		this.oldGeometry = parseGeometry( json.oldGeometry );
		this.newGeometry = parseGeometry( json.newGeometry );

		function parseGeometry ( data ) {

			var loader = new THREE.ObjectLoader();
			return loader.parseGeometries( [ data ] )[ data.uuid ];

		}

	}
};
