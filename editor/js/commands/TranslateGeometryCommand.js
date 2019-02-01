/**
 * @author Temdog007 / https://github.com/Temdog007
 */

/**
 * @param object THREE.Object3D
 * @param x number
 * @param y number
 * @param z number
 * @constructor
 */

var TranslateGeometryCommand = function ( object, x, y, z ) {

	Command.call( this );

	this.type = 'TranslateGeometryCommand';
	this.name = 'Translate Geometry';

	this.object = object;
	this.x = x;
	this.y = y;
	this.z = z;

};

TranslateGeometryCommand.prototype = {

	execute: function () {

		this.object.geometry.translate( this.x, this.y, this.z );
		this.editor.signals.objectChanged.dispatch( this.object );
		this.editor.signals.geometryChanged.dispatch();
		this.editor.signals.sceneGraphChanged.dispatch();

	},

	undo: function () {

		this.object.geometry.translate( - this.x, - this.y, - this.z );
		this.editor.signals.objectChanged.dispatch( this.object );
		this.editor.signals.geometryChanged.dispatch();
		this.editor.signals.sceneGraphChanged.dispatch();

	},

	toJSON: function () {

		var output = Command.prototype.toJSON.call( this );

		output.objectUuid = this.object.uuid;
		output.x = this.x;
		output.y = this.y;
		output.z = this.z;

		return output;

	},

	fromJSON: function ( json ) {

		Command.prototype.fromJSON.call( this, json );

		this.object = this.editor.objectByUuid( json.objectUuid );
		this.x = json.x;
		this.y = json.y;
		this.z = json.z;

	}

};
