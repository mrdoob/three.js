import { AddObjectCommand } from '../../commands/AddObjectCommand.js';
import { FileHandler } from './FileHandler.js';
import { unzipSync, strFromU8 } from 'three/addons/libs/fflate.module.js';
import { FileManager } from '../FileManager.js';
import { FileImporter } from '../FileImporter.js';
import { readAsArrayBuffer } from '../FileUtils.js';

class FileHandler_ZIP extends FileHandler {

	constructor( editor, manager ) {

		super( editor, manager );

	}

	async import( file ) {

		const contents = await readAsArrayBuffer( file );

		const zip = unzipSync( new Uint8Array( contents ) );

		const files = Object.entries( zip ).map( ( [ pathname, u8a ] ) => new File( [ u8a ], pathname ) );

		const manager = new FileManager( files );

		// Poly

		if ( zip[ 'model.obj' ] && zip[ 'materials.mtl' ] ) {

			const { MTLLoader } = await import( 'three/addons/loaders/MTLLoader.js' );
			const { OBJLoader } = await import( 'three/addons/loaders/OBJLoader.js' );

			const materials = new MTLLoader( manager ).parse( strFromU8( zip[ 'materials.mtl' ] ) );
			const object = new OBJLoader().setMaterials( materials ).parse( strFromU8( zip[ 'model.obj' ] ) );

			this.editor.execute( new AddObjectCommand( this.editor, object ) );
			return;

		}

		//

		const importer = new FileImporter( this.editor );

		await importer.import( files, manager );

	}

}

export { FileHandler_ZIP };
