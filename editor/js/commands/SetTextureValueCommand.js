import { Command } from '../Command.js';

/**
 * @param editor Editor
 * @param texture THREE.Texture
 * @param attributeName string
 * @param newValue number, string, boolean or object
 * @constructor
 */
class SetTextureValueCommand extends Command {

	constructor( editor, texture, attributeName, newValue ) {

		super( editor );

		this.type = 'SetTextureValueCommand';
		this.name = `Set Texture.${attributeName}`;
		this.updatable = true;

		this.texture = texture;

		this.oldValue = ( this.texture !== undefined ) ? this.texture[ attributeName ] : undefined;
		this.newValue = newValue;

		this.attributeName = attributeName;

	}

	execute( ) {

		this.texture[ this.attributeName ] = this.newValue;
		this.texture.needsUpdate = true;
		this.editor.signals.textureChanged.dispatch();

	}

	undo( ) {

		this.texture[ this.attributeName ] = this.oldValue;
		this.texture.needsUpdate = true;
		this.editor.signals.textureChanged.dispatch();

	}

	update( cmd ) {

		this.newValue = cmd.newValue;

	}

	toJSON( ) {

		const output = super.toJSON( this );

		output.textureUuid = this.texture.uuid;
		output.attributeName = this.attributeName;
		output.oldValue = this.oldValue;
		output.newValue = this.newValue;

		return output;

	}

	fromJSON( json ) {

		super.fromJSON( json );

		this.attributeName = json.attributeName;
		this.oldValue = json.oldValue;
		this.newValue = json.newValue;
		this.texture = this.editor.textures[ json.textureUuid ];

	}

}

export { SetTextureValueCommand };
