import { AddObjectCommand } from '../../commands/AddObjectCommand.js';
import { readAsArrayBuffer } from '../FileUtils.js';
import { FileHandler } from './FileHandler.js';
import * as THREE from 'three';

class FileHandler_MD2 extends FileHandler {

	constructor( editor, manager ) {

		super( editor, manager );

	}

	async import( file ) {

		const loader = await this.instantiate( 'three/addons/loaders/MD2Loader.js' );

		const contents = await readAsArrayBuffer( file );

		const geometry = loader.parse( contents );
		const material = new THREE.MeshStandardMaterial();

		const mesh = new THREE.Mesh( geometry, material );
		mesh.mixer = new THREE.AnimationMixer( mesh );
		mesh.name = file.name;

		mesh.animations.push( ...geometry.animations );
		this.editor.execute( new AddObjectCommand( this.editor, mesh ) );

	}

}

export { FileHandler_MD2 };
