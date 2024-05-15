import { AddObjectCommand } from '../../commands/AddObjectCommand.js';
import { readAsText } from '../FileUtils.js';
import { FileHandler } from './FileHandler.js';
import * as THREE from 'three';

class FileHandler_JS extends FileHandler {

	constructor( editor, manager ) {

		super( editor, manager );

		this.texturePath = '';

	}

	async import( file ) {

		const contents = await readAsText( file );

		// 2.0

		if ( contents.indexOf( 'postMessage' ) !== - 1 ) {

			await parseAsync( this.editor, this.texturePath, contents );

			return;

		}

		// >= 3.0

		let data;

		try {

			data = JSON.parse( contents );

		} catch ( error ) {

			alert( error );
			return;

		}

		handleJSON( this.editor, this.texturePath, data );

	}

}

//

function parseAsync( editor, texturePath, contents ) {

	return new Promise( ( resolve, reject ) => {

		const blob = new Blob( [ contents ], { type: 'text/javascript' } );
		const url = URL.createObjectURL( blob );

		const worker = new Worker( url );

		worker.onmessage = function ( event ) {

			event.data.metadata = { version: 2 };
			handleJSON( editor, texturePath, event.data );
			resolve();

		};

		worker.postMessage( Date.now() );

		worker.onerror = reject;

	} );

}

//

function handleJSON( editor, texturePath, data ) {

	if ( data.metadata === undefined ) { // 2.0

		data.metadata = { type: 'Geometry' };

	}

	if ( data.metadata.type === undefined ) { // 3.0

		data.metadata.type = 'Geometry';

	}

	if ( data.metadata.formatVersion !== undefined ) {

		data.metadata.version = data.metadata.formatVersion;

	}

	switch ( data.metadata.type.toLowerCase() ) {

		case 'buffergeometry':

		{

			const loader = new THREE.BufferGeometryLoader();
			const result = loader.parse( data );

			const mesh = new THREE.Mesh( result );

			editor.execute( new AddObjectCommand( editor, mesh ) );

			break;

		}

		case 'geometry':

			console.error( 'Loader: "Geometry" is no longer supported.' );

			break;

		case 'object':

		{

			const loader = new THREE.ObjectLoader();
			loader.setResourcePath( texturePath );

			loader.parse( data, function ( result ) {

				editor.execute( new AddObjectCommand( editor, result ) );

			} );

			break;

		}

		case 'app':

			editor.fromJSON( data );

			break;

	}

}

//

export { FileHandler_JS };
