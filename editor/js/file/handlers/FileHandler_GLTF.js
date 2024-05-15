import { AddObjectCommand } from '../../commands/AddObjectCommand.js';
import { readAsArrayBuffer } from '../FileUtils.js';
import { FileHandler } from './FileHandler.js';

class FileHandler_GLTF extends FileHandler {

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

async function createGLTFLoader( editor, manager ) {

	const { GLTFLoader } = await import( 'three/addons/loaders/GLTFLoader.js' );
	const { DRACOLoader } = await import( 'three/addons/loaders/DRACOLoader.js' );
	const { KTX2Loader } = await import( 'three/addons/loaders/KTX2Loader.js' );
	const { MeshoptDecoder } = await import( 'three/addons/libs/meshopt_decoder.module.js' );

	const dracoLoader = new DRACOLoader();
	dracoLoader.setDecoderPath( '../examples/jsm/libs/draco/gltf/' );

	const ktx2Loader = new KTX2Loader( manager );
	ktx2Loader.setTranscoderPath( '../examples/jsm/libs/basis/' );

	editor.signals.rendererDetectKTX2Support.dispatch( ktx2Loader );

	const loader = new GLTFLoader( manager );
	loader.setDRACOLoader( dracoLoader );
	loader.setKTX2Loader( ktx2Loader );
	loader.setMeshoptDecoder( MeshoptDecoder );

	return loader;

}

export { FileHandler_GLTF, createGLTFLoader };
