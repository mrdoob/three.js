import { AddObjectCommand } from '../../commands/AddObjectCommand.js';
import { readAsArrayBuffer } from '../FileUtils.js';
import { FileHandler } from './FileHandler.js';

class FileHandler_3MF extends FileHandler {

	constructor( editor, manager ) {

		super( editor, manager );

	}

	async import( file ) {

		const loader = await this.instantiate( 'three/addons/loaders/3MFLoader.js', 'ThreeMFLoader' );

		const contents = await readAsArrayBuffer( file );

		const object = loader.parse( contents );

		this.editor.execute( new AddObjectCommand( this.editor, object ) );

	}

}

export { FileHandler_3MF };
