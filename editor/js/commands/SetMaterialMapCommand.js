import { Command } from '../Command.js';
import { ObjectLoader } from 'three';

class SetMaterialMapCommand extends Command {

	/**
	 * @param {Editor} editor
	 * @param {THREE.Object3D|null} [object=null]
	 * @param {string} [mapName='']
	 * @param {THREE.Texture|null} [newMap=null]
	 * @param {number} [materialSlot=-1]
	 * @constructor
	 */
	constructor( editor, object = null, mapName = '', newMap = null, materialSlot = - 1 ) {

		super( editor );

		this.type = 'SetMaterialMapCommand';
		this.name = editor.strings.getKey( 'command/SetMaterialMap' ) + ': ' + mapName;

		this.object = object;
		this.materialSlot = materialSlot;

		const material = ( object !== null ) ? editor.getObjectMaterial( object, materialSlot ) : null;

		this.oldMap = ( object !== null ) ? material[ mapName ] : undefined;
		this.newMap = newMap;

		this.mapName = mapName;

	}

	execute() {

		if ( this.oldMap !== null && this.oldMap !== undefined ) this.oldMap.dispose();

		const material = this.editor.getObjectMaterial( this.object, this.materialSlot );

		material[ this.mapName ] = this.newMap;
		material.needsUpdate = true;

		this.editor.signals.materialChanged.dispatch( this.object, this.materialSlot );

	}

	undo() {

		const material = this.editor.getObjectMaterial( this.object, this.materialSlot );

		material[ this.mapName ] = this.oldMap;
		material.needsUpdate = true;

		this.editor.signals.materialChanged.dispatch( this.object, this.materialSlot );

	}

	toJSON() {

		const output = super.toJSON( this );

		output.objectUuid = this.object.uuid;
		output.mapName = this.mapName;
		output.newMap = serializeMap( this.newMap );
		output.oldMap = serializeMap( this.oldMap );
		output.materialSlot = this.materialSlot;

		return output;

		// serializes a map (THREE.Texture)

		function serializeMap( map ) {

			if ( map === null || map === undefined ) return null;

			const meta = {
				geometries: {},
				materials: {},
				textures: {},
				images: {}
			};

			const json = map.toJSON( meta );
			const images = extractFromCache( meta.images );
			if ( images.length > 0 ) json.images = images;
			json.sourceFile = map.sourceFile;

			return json;

		}

		// Note: The function 'extractFromCache' is copied from Object3D.toJSON()

		// extract data from the cache hash
		// remove metadata on each item
		// and return as array
		function extractFromCache( cache ) {

			const values = [];
			for ( const key in cache ) {

				const data = cache[ key ];
				delete data.metadata;
				values.push( data );

			}

			return values;

		}

	}

	fromJSON( json ) {

		super.fromJSON( json );

		this.object = this.editor.objectByUuid( json.objectUuid );
		this.mapName = json.mapName;
		this.oldMap = parseTexture( json.oldMap );
		this.newMap = parseTexture( json.newMap );
		this.materialSlot = json.materialSlot;

		function parseTexture( json ) {

			let map = null;
			if ( json !== null ) {

				const loader = new ObjectLoader();
				const images = loader.parseImages( json.images );
				const textures = loader.parseTextures( [ json ], images );
				map = textures[ json.uuid ];
				map.sourceFile = json.sourceFile;

			}

			return map;

		}

	}

}

export { SetMaterialMapCommand };
