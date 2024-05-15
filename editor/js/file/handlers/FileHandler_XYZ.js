import { AddObjectCommand } from '../../commands/AddObjectCommand.js';
import { readAsText } from '../FileUtils.js';
import { FileHandler } from './FileHandler.js';
import * as THREE from 'three';

class FileHandler_XYZ extends FileHandler {

	constructor( editor, manager ) {

		super( editor, manager );

	}

	async import( file ) {

		const loader = await this.instantiate( 'three/addons/loaders/XYZLoader.js' );

		const contents = await readAsText( file );

		const geometry = loader.parse( contents );

		const material = new THREE.PointsMaterial();
		material.vertexColors = geometry.hasAttribute( 'color' );

		const points = new THREE.Points( geometry, material );
		points.name = file.name;


		this.editor.execute( new AddObjectCommand( this.editor, points ) );

	}

}

export { FileHandler_XYZ };
