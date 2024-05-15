import { AddObjectCommand } from '../../commands/AddObjectCommand.js';
import { readAsText } from '../FileUtils.js';
import { FileHandler } from './FileHandler.js';

class FileHandler_COLLADA extends FileHandler {

	constructor( editor, manager ) {

		super( editor, manager );

	}

	async import( file ) {

		const loader = await this.instantiate( 'three/addons/loaders/ColladaLoader.js' );

		const contents = await readAsText( file );

		const object = loader.parse( contents );

		object.scene.name = file.name;

		this.editor.execute( new AddObjectCommand( this.editor, object.scene ) );

	}

}

export { FileHandler_COLLADA };
