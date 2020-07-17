/**
 * @author dforrer / https://github.com/dforrer
 * Developed as part of a project at University of Applied Sciences and Arts Northwestern Switzerland (www.fhnw.ch)
 */

import { Command } from '../Command.js';

import * as THREE from '../../../build/three.module.js';

/**
 * @param editor Editor
 * @param object THREE.Object3D
 * @param newMaterial THREE.Material
 * @constructor
 */
function SetMaterialCommand( editor, object, newMaterial, materialSlot ) {

	Command.call( this, editor );

	this.type = 'SetMaterialCommand';
	this.name = 'New Material';

	this.object = object;
	this.materialSlot = materialSlot;

	this.oldMaterial = this.editor.getObjectMaterial( object, materialSlot );
	this.newMaterial = newMaterial;

}

SetMaterialCommand.prototype = {

	execute: function () {

		this.editor.setObjectMaterial( this.object, this.materialSlot, this.newMaterial );
		this.editor.signals.materialChanged.dispatch( this.newMaterial );

	},

	undo: function () {

		this.editor.setObjectMaterial( this.object, this.materialSlot, this.oldMaterial );
		this.editor.signals.materialChanged.dispatch( this.oldMaterial );

	},

	toJSON: function () {

		var output = Command.prototype.toJSON.call( this );

		output.objectUuid = this.object.uuid;
		output.oldMaterial = this.oldMaterial.toJSON();
		output.newMaterial = this.newMaterial.toJSON();

		return output;

	},

	fromJSON: function ( json ) {

		Command.prototype.fromJSON.call( this, json );

		this.object = this.editor.objectByUuid( json.objectUuid );
		this.oldMaterial = parseMaterial( json.oldMaterial );
		this.newMaterial = parseMaterial( json.newMaterial );

		function parseMaterial( json ) {

			var loader = new THREE.ObjectLoader();
			var images = loader.parseImages( json.images );
			var textures = loader.parseTextures( json.textures, images );
			var materials = loader.parseMaterials( [ json ], textures );
			return materials[ json.uuid ];

		}

	}

};

export { SetMaterialCommand };
