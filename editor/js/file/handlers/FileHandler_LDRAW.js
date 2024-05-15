import { AddObjectCommand } from '../../commands/AddObjectCommand.js';
import { readAsText } from '../FileUtils.js';
import { FileHandler } from './FileHandler.js';

class FileHandler_LDRAW extends FileHandler {

	constructor( editor, manager ) {

		super( editor, manager );

	}

	async import( file ) {

		const loader = await this.instantiate( 'three/addons/loaders/LDrawLoader.js' );
		loader.setPath( '../../examples/models/ldraw/officialLibrary/' );

		const contents = await readAsText( file );

		const group = await parseAsync( loader, contents );

		group.name = file.name;
		// Convert from LDraw coordinates: rotate 180 degrees around OX
		group.rotation.x = Math.PI;

		this.editor.execute( new AddObjectCommand( this.editor, group ) );

	}

}

//

function parseAsync( loader, contents ) {

	return new Promise( ( resolve, reject ) => loader.parse( contents, resolve, reject ) );

}

//

export { FileHandler_LDRAW };
