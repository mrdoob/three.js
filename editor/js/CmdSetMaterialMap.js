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
/*
	if ( object !== undefined ) {

		meta = {
			geometries: {},
			materials: {},
			textures: {},
			images: {}
		};

		this.newMapJSON = newMap.toJSON( meta );
		this.newMapJSON.images = [ newMap.image.toJSON( meta ) ];

		if ( object.material[ mapName ] !== null ) {

			this.oldMapJSON = object.material[ mapName ].toJSON( meta );
			this.oldMapJSON.textures = [ object.material[ mapName ].texture.toJSON( meta ) ];
		}

	}
*/

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

		this.oldMap = this.parseTexture( json.oldMap );
		this.newMap = this.parseTexture( json.newMap );

		this.oldMapJSON = json.oldMap;
		this.newMapJSON = json.newMap;

	},

	parseTexture: function ( data, images ) {

		var loader = new THREE.ObjectLoader();
		return loader.parseTextures( [ data ] )[ data.uuid ];

	}

};
