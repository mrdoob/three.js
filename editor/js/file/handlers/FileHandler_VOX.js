import { AddObjectCommand } from '../../commands/AddObjectCommand.js';
import { readAsArrayBuffer } from '../FileUtils.js';
import { FileHandler } from './FileHandler.js';
import * as THREE from 'three';

class FileHandler_VOX extends FileHandler {

	constructor( editor, manager ) {

		super( editor, manager );

	}

	async import( file ) {

		const { VOXLoader, VOXMesh } = await import( 'three/addons/loaders/VOXLoader.js' );

		const contents = await readAsArrayBuffer( file );

		const chunks = new VOXLoader( this.manager ).parse( contents );

		const group = new THREE.Group();
		group.name = file.name;

		for ( let i = 0; i < chunks.length; i ++ ) {

			const chunk = chunks[ i ];

			const mesh = new VOXMesh( chunk );
			group.add( mesh );

		}

		this.editor.execute( new AddObjectCommand( this.editor, group ) );

	}

}

export { FileHandler_VOX };
