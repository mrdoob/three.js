/**
 * Created by Daniel on 21.07.15.
 */

CmdSetMaterialMap = function ( object, mapName, newMap ) {

	Cmd.call( this );

	this.type = 'CmdSetMaterialMap';

	this.object = object;
	this.mapName = mapName;
	this.oldMap = object !== undefined ? object.material[ mapName ] : undefined;
	this.newMap = newMap;
	this.objectUuid = object !== undefined ? object.uuid : undefined;

	this.newMapJSON = null;
	if ( newMap !== undefined && newMap !== null ) {

		var meta = {
			geometries: {},
			materials: {},
			textures: {},
			images: {}
		};

		this.newMapJSON = newMap.toJSON( meta );
		this.newMapJSON.images = [];
		this.newMapJSON.images.push( {

			uuid: newMap.image.uuid,
			url: this.getDataURL( newMap.image )

		} );

	}

	this.oldMapJSON = null;
	if ( object !== undefined && object.material[ mapName ] !== null ) {

		var meta = {
			geometries: {},
			materials: {},
			textures: {},
			images: {}
		};

		this.oldMapJSON = this.oldMap.toJSON( meta );
		this.oldMapJSON.images = [];
		this.oldMapJSON.images.push( {

			uuid: this.oldMap.image.uuid,
			url: this.getDataURL( this.oldMap.image )

		} );

	}

};

CmdSetMaterialMap.prototype = {

	execute: function () {

		this.object.material[ this.mapName ] = this.newMap;
		this.object.material.needsUpdate = true;
		this.editor.signals.materialChanged.dispatch( this.object.material );

	},

	undo: function () {

		this.object.material[ this.mapName ] = this.oldMap;
		this.object.material.needsUpdate = true;
		this.editor.signals.materialChanged.dispatch( this.object.material );

	},

	toJSON: function () {

		var output = Cmd.prototype.toJSON.call( this );

		output.objectUuid = this.objectUuid;
		output.mapName = this.mapName;

		output.oldMap = this.oldMapJSON;
		output.newMap = this.newMapJSON;

		return output;

	},

	fromJSON: function ( json ) {

		Cmd.prototype.fromJSON.call( this, json );

		this.objectUuid = json.objectUuid;
		this.mapName = json.mapName;

		this.object = this.editor.objectByUuid( json.objectUuid );

		this.oldMapJSON = json.oldMap;
		this.newMapJSON = json.newMap;

		this.oldMap = this.parseTexture( json.oldMap );
		this.newMap = this.parseTexture( json.newMap );

	},

	parseTexture: function ( json ) {

		var map = null;
		if ( json !== null ) {

			var loader = new THREE.ObjectLoader();
			var images = loader.parseImages( json.images );
			var textures  = loader.parseTextures( [ json ], images );
			map = textures[ json.uuid ];

		}
		return map;

	},

	getDataURL: function ( image ) {

		var canvas;

		if ( image.toDataURL !== undefined ) {

			canvas = image;

		} else {

			canvas = document.createElement( 'canvas' );
			canvas.width = image.width;
			canvas.height = image.height;

			canvas.getContext( '2d' ).drawImage( image, 0, 0, image.width, image.height );

		}

		if ( canvas.width > 2048 || canvas.height > 2048 ) {

			return canvas.toDataURL( 'image/jpeg', 0.6 );

		} else {

			return canvas.toDataURL( 'image/png' );

		}

	}

};
