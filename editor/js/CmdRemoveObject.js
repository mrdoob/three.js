/**
 * Created by Daniel on 20.07.15.
 */

CmdRemoveObject = function ( object ) {

	Cmd.call( this );

	this.type = 'CmdRemoveObject';

	this.object = object;
	this.parent = object !== undefined ? object.parent : undefined;
	this.parentUuid = object !== undefined ? object.parent.uuid : undefined;

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

CmdRemoveObject.prototype = {

	execute: function () {

		this.index = this.parent.children.indexOf( this.object );

		var scope = this.editor;
		this.object.traverse( function ( child ) {

			scope.removeHelper( child );

		} );

		this.parent.remove( this.object );

		this.editor.signals.objectRemoved.dispatch( this.object );
		this.editor.signals.sceneGraphChanged.dispatch();

	},

	undo: function () {

		var scope = this.editor;

		this.object.traverse( function ( child ) {

			if ( child.geometry !== undefined ) scope.addGeometry( child.geometry );
			if ( child.material !== undefined ) scope.addMaterial( child.material );

			scope.addHelper( child );

		} );

		this.parent.children.splice( this.index, 0, this.object );
		this.object.parent = this.parent;

		this.editor.signals.objectAdded.dispatch( this.object );
		this.editor.signals.sceneGraphChanged.dispatch();

	},

	toJSON: function () {

		var output = Cmd.prototype.toJSON.call( this );

		output.object = this.objectJSON;
		output.index = this.index;
		output.parentUuid = this.parentUuid;

		return output;

	},

	fromJSON: function ( json ) {

		Cmd.prototype.fromJSON.call( this, json );

		this.parent = this.editor.objectByUuid( json.parentUuid );
		if ( this.parent === undefined ) {

			this.parent = this.editor.scene;

		}
		this.parentUuid = json.parentUuid;

		this.index = json.index;
		this.object = this.editor.objectByUuid( json.object.object.uuid );

		if ( this.object === undefined ) {

			var loader = new THREE.ObjectLoader();
			this.object = loader.parse( json.object );

		}
		this.objectJSON = json.object;

	}

};