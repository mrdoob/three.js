import { AddObjectCommand } from '../../commands/AddObjectCommand.js';
import { readAsArrayBuffer } from '../FileUtils.js';
import { FileHandler } from './FileHandler.js';

class FileHandler_PCD extends FileHandler {

	constructor( editor, manager ) {

		super( editor, manager );

	}

	async import( file ) {

		const loader = await this.instantiate( 'three/addons/loaders/PCDLoader.js' );

		const contents = await readAsArrayBuffer( file );

		const points = loader.parse( contents );
		points.name = file.name;

		this.editor.execute( new AddObjectCommand( this.editor, points ) );

	}

}

export { FileHandler_PCD };
