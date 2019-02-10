/**
 * @author dforrer / https://github.com/dforrer
 * Developed as part of a project at University of Applied Sciences and Arts Northwestern Switzerland (www.fhnw.ch)
 */

/**
 * @param editor Editor
 * @param object THREE.Object3D
 * @param parent THREE.Object3D
 * @constructor
 */

var AddObjectCommand = function ( editor, object, parent ) {

	Command.call( this, editor );

	this.type = 'AddObjectCommand';

	this.object = object;
	this.parent = ( parent !== undefined ) ? parent : undefined;
	if ( object !== undefined ) {

		this.name = 'Add Object: ' + object.name;

	}

};

AddObjectCommand.prototype = {

	execute: function () {

		this.editor.addObject( this.object, this.parent );
		this.editor.select( this.object );

	},

	undo: function () {

		this.editor.removeObject( this.object );
		this.editor.deselect();

	},

	toJSON: function () {

		var output = Command.prototype.toJSON.call( this );
		output.object = this.object.toJSON();
		if ( this.parent !== undefined ) {

			output.parent = this.parent.toJSON();

		}

		return output;

	},

	fromJSON: function ( json ) {

		Command.prototype.fromJSON.call( this, json );

		this.object = this.editor.objectByUuid( json.object.object.uuid );
		this.parent = this.editor.objectByUuid( json.parent.object.uuid );

		var loader = new THREE.ObjectLoader();
		if ( this.object === undefined ) {

			this.object = loader.parse( json.object );

		}

		if ( this.parent === undefined && json.parent !== undefined ) {

			this.parent = loader.parse( json.parent );

		}

	}

};
