/**
 * @author Temdog007 / https://github.com/Temdog007
 */

/**
 * @param object THREE.Object3D
 * @constructor
 */

var CenterGeometryCommand = function ( object ) {

	Command.call( this );

	this.type = 'CenterGeometryCommand';
	this.name = 'Center Geometry';

	this.object = object;
	this.originalGeometry = object.geometry.clone();

};

CenterGeometryCommand.prototype = {

	execute: function () {

		this.object.geometry.center();
		this.editor.signals.objectChanged.dispatch( this.object );
		this.editor.signals.geometryChanged.dispatch();
		this.editor.signals.sceneGraphChanged.dispatch();

	},

	undo: function () {

		this.object.geometry.copy( this.originalGeometry );
		this.editor.signals.objectChanged.dispatch( this.object );
		this.editor.signals.geometryChanged.dispatch();
		this.editor.signals.sceneGraphChanged.dispatch();

	},

	toJSON: function () {

		var output = Command.prototype.toJSON.call( this );

		output.objectUuid = this.object.uuid;

		return output;

	},

	fromJSON: function ( json ) {

		Command.prototype.fromJSON.call( this, json );

		this.object = this.editor.objectByUuid( json.objectUuid );

	}

};
