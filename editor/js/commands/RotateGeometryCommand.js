/**
 * @author Temdog007 / https://github.com/Temdog007
 */

/**
 * @param object THREE.Object3D
 * @param x number
 * @param y number
 * @param z number
 * @param order string 'XYZ', 'XZY', 'YXZ', etc
 * @constructor
 */

var RotateGeometryCommand = function ( object, x, y, z, order ) {

	Command.call( this );

	this.type = 'RotateGeometryCommand';
	this.name = 'Rotate Geometry';

	this.object = object;
	this.x = x;
	this.y = y;
	this.z = z;
	this.order = ( order !== undefined ) ? order : 'XYZ';

};

RotateGeometryCommand.prototype = {

	rotate: function ( flipped ) {

		flipped = ( flipped !== undefined ) ? flipped : false;

		if ( this.order == 'XYZ' ) {

			if ( flipped ) {

				this.object.geometry.rotateZ( - this.z );
				this.object.geometry.rotateY( - this.y );
				this.object.geometry.rotateX( - this.x );

			} else {

				this.object.geometry.rotateX( this.x );
				this.object.geometry.rotateY( this.y );
				this.object.geometry.rotateZ( this.z );

			}

		} else if ( this.order == 'XZY' ) {

			if ( flipped ) {

				this.object.geometry.rotateY( - this.y );
				this.object.geometry.rotateZ( - this.z );
				this.object.geometry.rotateX( - this.x );

			} else {

				this.object.geometry.rotateX( this.x );
				this.object.geometry.rotateZ( this.z );
				this.object.geometry.rotateY( this.y );

			}

		} else if ( this.order == 'YXZ' ) {

			if ( flipped ) {

				this.object.geometry.rotateZ( - this.z );
				this.object.geometry.rotateX( - this.x );
				this.object.geometry.rotateY( - this.y );

			} else {

				this.object.geometry.rotateY( this.y );
				this.object.geometry.rotateX( this.x );
				this.object.geometry.rotateZ( this.z );

			}

		} else if ( this.order == 'YZX' ) {

			if ( flipped ) {

				this.object.geometry.rotateX( - this.x );
				this.object.geometry.rotateZ( - this.z );
				this.object.geometry.rotateY( - this.y );

			} else {

				this.object.geometry.rotateY( this.y );
				this.object.geometry.rotateZ( this.z );
				this.object.geometry.rotateX( this.x );

			}

		} else if ( this.order == 'ZXY' ) {

			if ( flipped ) {

				this.object.geometry.rotateY( - this.y );
				this.object.geometry.rotateX( - this.x );
				this.object.geometry.rotateZ( - this.z );

			} else {

				this.object.geometry.rotateZ( this.z );
				this.object.geometry.rotateX( this.x );
				this.object.geometry.rotateY( this.y );

			}

		} else if ( this.order == 'ZYX' ) {

			if ( flipped ) {

				this.object.geometry.rotateX( - this.x );
				this.object.geometry.rotateY( - this.y );
				this.object.geometry.rotateZ( - this.z );

			} else {

				this.object.geometry.rotateZ( this.z );
				this.object.geometry.rotateY( this.y );
				this.object.geometry.rotateX( this.x );

			}

		}

	},

	execute: function () {

		this.rotate( false );

		this.editor.signals.objectChanged.dispatch( this.object );
		this.editor.signals.geometryChanged.dispatch();
		this.editor.signals.sceneGraphChanged.dispatch();

	},

	undo: function () {

		this.rotate( true );

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
