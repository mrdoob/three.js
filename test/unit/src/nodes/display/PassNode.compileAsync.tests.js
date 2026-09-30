import { pass } from '../../../../../src/nodes/display/PassNode.js';
import { BoxGeometry } from '../../../../../src/geometries/BoxGeometry.js';
import { DirectionalLight } from '../../../../../src/lights/DirectionalLight.js';
import { InstancedMesh } from '../../../../../src/objects/InstancedMesh.js';
import { Mesh } from '../../../../../src/objects/Mesh.js';
import MeshStandardNodeMaterial from '../../../../../src/materials/nodes/MeshStandardNodeMaterial.js';
import { PerspectiveCamera } from '../../../../../src/cameras/PerspectiveCamera.js';
import RenderPipeline from '../../../../../src/renderers/common/RenderPipeline.js';
import { Scene } from '../../../../../src/scenes/Scene.js';
import WebGPURenderer from '../../../../../src/renderers/webgpu/WebGPURenderer.js';

// PassNode.compileAsync() must prepare what the pass's first render uses. The pass renders inside
// the render that reads it (a RenderPipeline's quad), one call depth below, and render contexts are
// keyed by call depth, so a precompile at the top level builds render objects no render uses (#34681).

const BACKENDS = { webgpu: {}, webgl: { forceWebGL: true } };

function setup() {

	const scene = new Scene();
	scene.add( new DirectionalLight() );

	const box = new Mesh( new BoxGeometry(), new MeshStandardNodeMaterial() );
	box.name = 'box';

	const instances = new InstancedMesh( new BoxGeometry(), new MeshStandardNodeMaterial(), 3 );
	instances.name = 'instances';

	scene.add( box, instances );

	const camera = new PerspectiveCamera();
	camera.position.z = 5;

	return { scene, camera };

}

async function firstRenderBuilds( options, initFirst ) {

	const renderer = new WebGPURenderer( { antialias: false, ...options } );
	if ( initFirst ) await renderer.init();

	const { scene, camera } = setup();
	const scenePass = pass( scene, camera );
	const renderPipeline = new RenderPipeline( renderer, scenePass );

	const built = [];
	renderer.debug.onNodeBuilderCreated = ( builder, renderObject ) => built.push( renderObject.object.name );

	await scenePass.compileAsync( renderer ); // initializes the renderer when it has not been

	const compiled = built.splice( 0 );

	renderPipeline.render();

	renderer.dispose();

	return { compiled, rendered: built };

}

export default QUnit.module( 'Nodes', () => {

	QUnit.module( 'Display', () => {

		QUnit.module( 'PassNode', () => {

			for ( const [ backend, options ] of Object.entries( BACKENDS ) ) {

				for ( const initFirst of [ true, false ] ) {

					QUnit.test( `compileAsync() prepares the first render of the pass (${ backend }, renderer ${ initFirst ? 'initialized' : 'not yet initialized' })`, async ( assert ) => {

						const { compiled, rendered } = await firstRenderBuilds( options, initFirst );

						assert.deepEqual( compiled.sort(), [ 'box', 'instances' ], 'compileAsync() builds the scene' );
						assert.notOk( rendered.includes( 'box' ) || rendered.includes( 'instances' ), `the first render builds nothing of the scene again (built: ${ rendered.join( ', ' ) })` );

					} );

				}

			}

		} );

	} );

} );
