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

var ScaleGeometryCommand = function ( object, x, y, z ) {

	Command.call( this );

	this.type = 'ScaleGeometryCommand';
	this.name = 'Scale Geometry';

	this.object = object;
	this.x = x;
	this.y = y;
	this.z = z;

	// Can't undo scale if the scale was zero. So, just keep a copy of the original.
	this.originalGeometry = object.geometry.clone();

};

ScaleGeometryCommand.prototype = {

	execute: function () {

		this.object.geometry.scale( this.x, this.y, this.z );
		this.editor.signals.objectChanged.dispatch( this.object );
		this.editor.signals.geometryChanged.dispatch();
		this.editor.signals.sceneGraphChanged.dispatch();

	},

	undo: function () {

		// this.object.geometry.scale( (this.x === 0) ? 1 : (1 / this.x), (this.y === 0) ? 0 : (1 / this.y), (this.z === 0) ? 0 : (1 / this.z));
		this.object.geometry.copy( this.originalGeometry );
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
		output.order = this.order;

		return output;

	},

	fromJSON: function ( json ) {

		Command.prototype.fromJSON.call( this, json );

		this.object = this.editor.objectByUuid( json.objectUuid );
		this.x = json.x;
		this.y = json.y;
		this.z = json.z;
		this.order = json.order;

	}

};
