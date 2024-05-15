import { AddObjectCommand } from '../../commands/AddObjectCommand.js';
import { readAsText } from '../FileUtils.js';
import { FileHandler } from './FileHandler.js';
import * as THREE from 'three';

class FileHandler_SVG extends FileHandler {

	constructor( editor, manager ) {

		super( editor, manager );

	}

	async import( file ) {

		const loader = await this.instantiate( 'three/addons/loaders/SVGLoader.js' );

		const contents = await readAsText( file );

		const paths = loader.parse( contents ).paths;

		//

		const group = new THREE.Group();
		group.name = file.name;
		group.scale.multiplyScalar( 0.1 );
		group.scale.y *= - 1;

		for ( let i = 0; i < paths.length; i ++ ) {

			const path = paths[ i ];

			const material = new THREE.MeshBasicMaterial( {
				color: path.color,
				depthWrite: false
			} );

			const shapes = loader.constructor.createShapes( path );

			for ( let j = 0; j < shapes.length; j ++ ) {

				const shape = shapes[ j ];

				const geometry = new THREE.ShapeGeometry( shape );
				const mesh = new THREE.Mesh( geometry, material );

				group.add( mesh );

			}

		}

		this.editor.execute( new AddObjectCommand( this.editor, group ) );

	}

}

export { FileHandler_SVG };
