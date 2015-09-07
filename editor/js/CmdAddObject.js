/**
 * Created by Daniel on 20.07.15.
 */

CmdAddObject = function ( object ) {

	Cmd.call( this );

	this.type = 'CmdAddObject';

	this.object = object;
	if ( object !== undefined ) {

		object.updateMatrixWorld( true );

		meta = {
			geometries: {},
			materials: {},
			textures: {},
			images: {}
		};
		this.objectJSON = object.toJSON( meta );

		if ( object.geometry !== undefined ) {

			this.objectJSON.geometries = [ object.geometry.toJSON( meta ) ];

		}

		if ( object.material !== undefined ) {

			this.objectJSON.materials = [ object.material.toJSON( meta ) ];

		}

	}

};

CmdAddObject.prototype = {

	execute: function () {

		this.editor.addObject( this.object );

	},

	undo: function () {

		this.editor.removeObject( this.object );
		this.editor.deselect();

	},

	toJSON: function () {

		var output = Cmd.prototype.toJSON.call( this );

		output.object = this.objectJSON;

		return output;

	},

	fromJSON: function ( json ) {

		Cmd.prototype.fromJSON.call( this, json );

		this.objectJSON = json.object;
		this.object = this.editor.objectByUuid( json.object.object.uuid );

		if ( this.object === undefined ) {

			var loader = new THREE.ObjectLoader();
			this.object = loader.parse( json.object );

		}

	}

};
