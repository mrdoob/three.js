import { AddObjectCommand } from '../../commands/AddObjectCommand.js';
import { readAsText } from '../FileUtils.js';
import { FileHandler } from './FileHandler.js';

class FileHandler_VRML extends FileHandler {

	constructor( editor, manager ) {

		super( editor, manager );

	}

	async import( file ) {

		const loader = await this.instantiate( 'three/addons/loaders/VRMLLoader.js' );

		const contents = await readAsText( file );

		const object = loader.parse( contents );

		this.editor.execute( new AddObjectCommand( this.editor, object ) );

	}

}

export { FileHandler_VRML };
