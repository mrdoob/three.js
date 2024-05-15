import { AddObjectCommand } from '../../commands/AddObjectCommand.js';
import { readAsArrayBuffer } from '../FileUtils.js';
import { FileHandler } from './FileHandler.js';
import * as THREE from 'three';

class FileHandler_VTK extends FileHandler {

	constructor( editor, manager ) {

		super( editor, manager );

	}

	async import( file ) {

		const loader = await this.instantiate( 'three/addons/loaders/VTKLoader.js' );

		const contents = await readAsArrayBuffer( file );

		const geometry = loader.parse( contents );
		const material = new THREE.MeshStandardMaterial();

		const mesh = new THREE.Mesh( geometry, material );
		mesh.name = file.name;

		this.editor.execute( new AddObjectCommand( this.editor, mesh ) );

	}

}

export { FileHandler_VTK };
