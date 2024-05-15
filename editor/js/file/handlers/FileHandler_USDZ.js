import { AddObjectCommand } from '../../commands/AddObjectCommand.js';
import { readAsArrayBuffer } from '../FileUtils.js';
import { FileHandler } from './FileHandler.js';

class FileHandler_USDZ extends FileHandler {

	constructor( editor, manager ) {

		super( editor, manager );

	}

	async import( file ) {

		const loader = await this.instantiate( 'three/addons/loaders/USDZLoader.js' );

		const contents = await readAsArrayBuffer( file );

		const group = loader.parse( contents );
		group.name = file.name;

		this.editor.execute( new AddObjectCommand( this.editor, group ) );

	}

}

export { FileHandler_USDZ };
