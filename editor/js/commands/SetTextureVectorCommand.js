import { Command } from '../Command.js';

class SetTextureVectorCommand extends Command {

	constructor( editor, texture, attributeName, newValue ) {

		super( editor );

		this.type = 'SetTextureVectorCommand';
		this.name = `Set Texture.${attributeName}`;
		this.updatable = true;

		this.texture = texture;

		this.oldValue = ( this.texture !== undefined ) ? this.texture[ attributeName ].toArray() : undefined;
		this.newValue = newValue;

		this.attributeName = attributeName;

	}

	execute() {

		this.texture[ this.attributeName ].fromArray( this.newValue );

		this.editor.signals.textureChanged.dispatch( this.texture );

	}

	undo() {

		this.texture[ this.attributeName ].fromArray( this.oldValue );

		this.editor.signals.textureChanged.dispatch( this.texture );

	}

	update( cmd ) {

		this.newValue = cmd.newValue;

	}

	toJSON() {

		const output = super.toJSON( this );

		output.textureUuid = this.texture.uuid;
		output.attributeName = this.attributeName;
		output.oldValue = this.oldValue;
		output.newValue = this.newValue;

		return output;

	}

	fromJSON( json ) {

		super.fromJSON( json );

		this.texture = this.editor.textures[ json.textureUuid ];
		this.attributeName = json.attributeName;
		this.oldValue = json.oldValue;
		this.newValue = json.newValue;

	}

}

export { SetTextureVectorCommand };
