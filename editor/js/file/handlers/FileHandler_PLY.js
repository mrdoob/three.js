import { AddObjectCommand } from '../../commands/AddObjectCommand.js';
import { readAsArrayBuffer } from '../FileUtils.js';
import { FileHandler } from './FileHandler.js';
import * as THREE from 'three';

class FileHandler_PLY extends FileHandler {

	constructor( editor, manager ) {

		super( editor, manager );

	}

	async import( file ) {

		const loader = await this.instantiate( 'three/addons/loaders/PLYLoader.js' );

		const contents = await readAsArrayBuffer( file );

		const geometry = loader.parse( contents );

		let object;

		if ( geometry.index !== null ) {

			const material = new THREE.MeshStandardMaterial();

			object = new THREE.Mesh( geometry, material );
			object.name = file.name;

		} else {

			const material = new THREE.PointsMaterial( { size: 0.01 } );
			material.vertexColors = geometry.hasAttribute( 'color' );

			object = new THREE.Points( geometry, material );
			object.name = file.name;

		}

		this.editor.execute( new AddObjectCommand( this.editor, object ) );

	}

}

export { FileHandler_PLY };
