/**
 * Created by Daniel on 20.07.15.
 */

CmdAddObject = function ( object ) {

	Cmd.call( this );

	this.type = 'CmdAddObject';
	this.name = 'Add object';

	this.object = object;
	if ( object !== undefined ) {

		object.updateMatrixWorld( true );

		meta = {
			geometries: {},
			materials: {},
			textures: {},
			images: {}
		};
		var json = object.toJSON( meta );

		var geometries = extractFromCache( meta.geometries );
		var materials = extractFromCache( meta.materials );
		var textures = extractFromCache( meta.textures );
		var images = extractFromCache( meta.images );

		if ( geometries.length > 0 ) json.geometries = geometries;
		if ( materials.length > 0 ) json.materials = materials;
		if ( textures.length > 0 ) json.textures = textures;
		if ( images.length > 0 ) json.images = images;

		this.objectJSON = json;

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
