import { Command } from '../Command.js';

const VECTOR_KEYS = [ 'offset', 'repeat', 'center' ];

class SetTextureParametersCommand extends Command {

	/**
	 * @param {Editor} editor
	 * @param {THREE.Texture} texture
	 * @param {Object} newParameters
	 * @constructor
	 */
	constructor( editor, texture = null, newParameters = {} ) {

		super( editor );

		this.type = 'SetTextureParametersCommand';
		this.name = editor.strings.getKey( 'command/SetTextureParameters' );

		this.texture = texture;

		this.oldParameters = ( texture !== null ) ? extractParameters( texture, newParameters ) : {};
		this.newParameters = newParameters;

	}

	execute() {

		applyParameters( this.texture, this.newParameters );
		this.editor.signals.sceneGraphChanged.dispatch();

	}

	undo() {

		applyParameters( this.texture, this.oldParameters );
		this.editor.signals.sceneGraphChanged.dispatch();

	}

	toJSON() {

		const output = super.toJSON( this );

		output.textureUuid = this.texture.uuid;
		output.oldParameters = this.oldParameters;
		output.newParameters = this.newParameters;

		return output;

	}

	fromJSON( json ) {

		super.fromJSON( json );

		this.texture = findTextureByUuid( this.editor, json.textureUuid );
		this.oldParameters = json.oldParameters;
		this.newParameters = json.newParameters;

	}

}

function extractParameters( texture, reference ) {

	const result = {};

	for ( const key in reference ) {

		const value = texture[ key ];

		if ( VECTOR_KEYS.includes( key ) ) {

			result[ key ] = { x: value.x, y: value.y };

		} else {

			result[ key ] = value;

		}

	}

	return result;

}

function applyParameters( texture, parameters ) {

	for ( const key in parameters ) {

		const value = parameters[ key ];

		if ( VECTOR_KEYS.includes( key ) ) {

			texture[ key ].set( value.x, value.y );

		} else {

			texture[ key ] = value;

		}

	}

	texture.needsUpdate = true;

}

function findTextureByUuid( editor, uuid ) {

	let result = null;

	editor.scene.traverse( ( object ) => {

		if ( object.material === undefined ) return;

		const materials = Array.isArray( object.material ) ? object.material : [ object.material ];

		for ( const material of materials ) {

			for ( const key in material ) {

				const value = material[ key ];

				if ( value && value.isTexture === true && value.uuid === uuid ) {

					result = value;

				}

			}

		}

	} );

	return result;

}

export { SetTextureParametersCommand };
