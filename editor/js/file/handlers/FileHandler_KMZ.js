import { AddObjectCommand } from '../../commands/AddObjectCommand.js';
import { readAsArrayBuffer } from '../FileUtils.js';
import { FileHandler } from './FileHandler.js';

class FileHandler_KMZ extends FileHandler {

	constructor( editor, manager ) {

		super( editor, manager );

	}

	async import( file ) {

		const loader = await this.instantiate( 'three/addons/loaders/KMZLoader.js' );

		const contents = await readAsArrayBuffer( file );

		const collada = loader.parse( contents );

		collada.scene.name = file.name;

		this.editor.execute( new AddObjectCommand( this.editor, collada.scene ) );

	}

}

export { FileHandler_KMZ };
