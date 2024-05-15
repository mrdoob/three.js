import { AddObjectCommand } from '../../commands/AddObjectCommand.js';
import { readAsArrayBuffer } from '../FileUtils.js';
import { FileHandler } from './FileHandler.js';

class FileHandler_FBX extends FileHandler {

	constructor( editor, manager ) {

		super( editor, manager );

	}

	async import( file ) {

		const loader = await this.instantiate( 'three/addons/loaders/FBXLoader.js' );

		const contents = await readAsArrayBuffer( file );

		const object = loader.parse( contents );

		this.editor.execute( new AddObjectCommand( this.editor, object ) );

	}

}

export { FileHandler_FBX };
