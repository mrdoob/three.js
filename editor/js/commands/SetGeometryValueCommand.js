/**
 * @author dforrer / https://github.com/dforrer
 * Developed as part of a project at University of Applied Sciences and Arts Northwestern Switzerland (www.fhnw.ch)
 */

/**
 * @param object THREE.Object3D
 * @param attributeName string
 * @param newValue number, string, boolean or object
 * @constructor
 */

var SetGeometryValueCommand = function ( object, attributeName, newValue ) {

	Command.call( this );

	this.type = 'SetGeometryValueCommand';
	this.name = 'Set Geometry.' + attributeName;

	this.object = object;
	this.attributeName = attributeName;
	this.oldValue = ( object !== undefined ) ? object.geometry[ attributeName ] : undefined;
	this.newValue = newValue;

};

SetGeometryValueCommand.prototype = {

	execute: function () {

		this.object.geometry[ this.attributeName ] = this.newValue;
		this.editor.signals.objectChanged.dispatch( this.object );
		this.editor.signals.geometryChanged.dispatch();
		this.editor.signals.sceneGraphChanged.dispatch();

	},

	undo: function () {

		this.object.geometry[ this.attributeName ] = this.oldValue;
		this.editor.signals.objectChanged.dispatch( this.object );
		this.editor.signals.geometryChanged.dispatch();
		this.editor.signals.sceneGraphChanged.dispatch();

	},

	toJSON: function () {

		var output = Command.prototype.toJSON.call( this );

		output.objectUuid = this.object.uuid;
		output.attributeName = this.attributeName;
		output.oldValue = this.oldValue;
		output.newValue = this.newValue;

		return output;

	},

	fromJSON: function ( json ) {

		Command.prototype.fromJSON.call( this, json );

		this.object = this.editor.objectByUuid( json.objectUuid );
		this.attributeName = json.attributeName;
		this.oldValue = json.oldValue;
		this.newValue = json.newValue;

	}

};
