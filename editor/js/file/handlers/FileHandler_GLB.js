import { AddObjectCommand } from '../../commands/AddObjectCommand.js';
import { readAsArrayBuffer } from '../FileUtils.js';
import { FileHandler } from './FileHandler.js';
import { createGLTFLoader } from './FileHandler_GLTF.js';

class FileHandler_GLB extends FileHandler {

	constructor( editor, manager ) {

		super( editor, manager );

	}

	async import( file ) {

		const loader = await createGLTFLoader( this.editor, this.manager );

		const contents = await readAsArrayBuffer( file );

		const result = await loader.parseAsync( contents );

		const scene = result.scene;
		scene.name = file.name;

		scene.animations.push( ...result.animations );
		this.editor.execute( new AddObjectCommand( this.editor, scene ) );

		loader.dracoLoader.dispose();
		loader.ktx2Loader.dispose();

	}

}

export { FileHandler_GLB };
