/**
 * @author dforrer / https://github.com/dforrer
 */

/**
 * @param object THREE.Object3D
 * @param newMaterial THREE.Material
 * @constructor
 */

CmdSetMaterial = function ( object, newMaterial ) {

	Cmd.call( this );

	this.type = 'CmdSetMaterial';
	this.name = 'New Material';

	this.object = object;
	this.oldMaterial = ( object !== undefined ) ? object.material : undefined;
	this.newMaterial = newMaterial;

};

CmdSetMaterial.prototype = {

	execute: function () {

		this.object.material = this.newMaterial;
		this.editor.signals.materialChanged.dispatch( this.newMaterial );

	},

	undo: function () {

		this.object.material = this.oldMaterial;
		this.editor.signals.materialChanged.dispatch( this.oldMaterial );

	},

	toJSON: function () {

		var output = Cmd.prototype.toJSON.call( this );

		output.objectUuid = this.object.uuid;
		output.oldMaterial = serializeMaterial( this.oldMaterial );
		output.newMaterial = serializeMaterial( this.newMaterial );

		return output;


		function serializeMaterial ( material ) {

			if ( material === undefined ) return null;

			var meta = {
				geometries: {},
				materials: {},
				textures: {},
				images: {}
			};

			var json = {};
			json.materials = [ material.toJSON( meta ) ];

			var textures = extractFromCache( meta.textures );
			var images = extractFromCache( meta.images );

			if ( textures.length > 0 ) json.textures = textures;
			if ( images.length > 0 ) json.images = images;

			return json;

		}

		// Note: The function 'extractFromCache' is copied from Object3D.toJSON()

		// extract data from the cache hash
		// remove metadata on each item
		// and return as array
		function extractFromCache ( cache ) {

			var values = [];
			for ( var key in cache ) {

				var data = cache[ key ];
				delete data.metadata;
				values.push( data );

			}
			return values;

		}

	},

	fromJSON: function ( json ) {

		Cmd.prototype.fromJSON.call( this, json );

		this.object = this.editor.objectByUuid( json.objectUuid );
		this.oldMaterial = parseMaterial( json.oldMaterial );
		this.newMaterial = parseMaterial( json.newMaterial );


		function parseMaterial ( json ) {

			var loader = new THREE.ObjectLoader();
			var images = loader.parseImages( json.images );
			var textures  = loader.parseTextures( json.textures, images );
			var materials = loader.parseMaterials( json.materials, textures );
			return materials[ json.materials[ 0 ].uuid ];

		}

	}

};
