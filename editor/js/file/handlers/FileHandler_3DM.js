import { AddObjectCommand } from '../../commands/AddObjectCommand.js';
import { readAsArrayBuffer } from '../FileUtils.js';
import { FileHandler } from './FileHandler.js';

class FileHandler_3DM extends FileHandler {

	constructor( editor, manager ) {

		super( editor, manager );

	}

	async import( file ) {

		const loader = await this.instantiate( 'three/addons/loaders/3DMLoader.js', 'Rhino3dmLoader' );
		loader.setLibraryPath( '../examples/jsm/libs/rhino3dm/' );

		const contents = await readAsArrayBuffer( file );

		const object = await parseAsync( loader, contents );

		object.name = file.name;

		this.editor.execute( new AddObjectCommand( this.editor, object ) );

	}

}

//

function parseAsync( loader, contents ) {

	return new Promise( ( resolve, reject ) => loader.parse( contents, resolve, reject ) );

}

//

export { FileHandler_3DM };
