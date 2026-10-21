import { ArrayCamera } from '../../../../../src/cameras/ArrayCamera.js';
import { PerspectiveCamera } from '../../../../../src/cameras/PerspectiveCamera.js';
import { RenderTarget } from '../../../../../src/core/RenderTarget.js';
import { BoxGeometry } from '../../../../../src/geometries/BoxGeometry.js';
import { Mesh } from '../../../../../src/objects/Mesh.js';
import { WebGPUCoordinateSystem } from '../../../../../src/constants.js';
import RenderContexts from '../../../../../src/renderers/common/RenderContexts.js';
import WebGPUBackend from '../../../../../src/renderers/webgpu/WebGPUBackend.js';

function createCamera( x ) {

	const camera = new PerspectiveCamera( 45, 1, 0.1, 100 );
	camera.coordinateSystem = WebGPUCoordinateSystem;
	camera.position.x = x;
	camera.updateProjectionMatrix();
	camera.updateMatrixWorld();
	return camera;

}

function createBackend() {

	const backend = new WebGPUBackend();
	backend.renderer = { getPixelRatio: () => 1 };
	backend.device = { createCommandEncoder: () => ( { beginRenderPass: () => ( {} ) } ) };
	backend.getOcclusionData = () => ( {} );
	backend._getRenderPassDescriptor = () => ( { colorAttachments: [] } );
	backend.initTimestampQuery = () => {};

	backend._createArrayCameraLayerDescriptors = () => {};

	backend._updateArrayCameraLayerDescriptors = () => {};

	backend.pipelineUtils = { createBundleEncoder: () => ( {} ) };
	return backend;

}

function draw( backend, context, object ) {

	const camera = context.camera;
	backend.get( camera ).indexesGPU = camera.cameras.map( () => ( {} ) );
	const pipeline = {};
	backend.get( pipeline ).pipeline = {};
	const passes = [];
	backend._draw = ( renderObject, info, data, pipelineGPU, bindings, vertexBuffers, drawParams, pass ) => passes.push( pass );
	backend.draw( {
		object, context, pipeline, camera,
		getDrawParameters: () => ( {} ),
		getBindings: () => [],
		getVertexBuffers: () => [],
		getBindingGroup: () => null
	}, {} );
	return passes;

}

export default QUnit.module( 'Renderers', () => {

	QUnit.module( 'WebGPUBackend', () => {

		QUnit.test( 'ArrayCamera culling across shared render targets', ( assert ) => {

			const backend = createBackend();
			const contexts = new RenderContexts( { getClearDepth: () => 1, getClearStencil: () => 0 } );
			const target = new RenderTarget( 16, 16 );
			const layeredTarget = new RenderTarget( 16, 16 );
			const context = contexts.get( target );
			assert.strictEqual( contexts.get( layeredTarget ), context, 'Compatible targets share a context' );
			Object.assign( context, { textures: [], depth: false, stencil: false, occlusionQueryCount: 0, renderTarget: target } );
			context.camera = new ArrayCamera( [ createCamera( 0 ) ] );
			backend.beginRender( context );

			const object = new Mesh( new BoxGeometry() );
			object.position.set( 100, 0, - 5 );
			object.updateMatrixWorld();
			assert.strictEqual( draw( backend, context, object ).length, 0, 'Ordinary render rejects an invisible object' );

			context.renderTarget = layeredTarget;
			context.depthTexture = { isArrayTexture: true };
			backend.get( context.depthTexture ).texture = {};
			context.camera = new ArrayCamera( [ createCamera( 100 ), createCamera( 0 ) ] );
			backend.beginRender( context );
			const data = backend.get( context );
			assert.deepEqual( draw( backend, context, object ), [ data.bundleEncoders[ 0 ] ], 'Layered render uses the new cameras and camera count' );

			object.frustumCulled = false;
			assert.strictEqual( draw( backend, context, object ).length, 2, 'frustumCulled=false draws every matching layer' );
			object.frustumCulled = true;

			context.camera = new ArrayCamera( [ createCamera( 0 ), createCamera( 100 ), createCamera( 100 ) ] );
			backend.beginRender( context );
			assert.strictEqual( draw( backend, context, object ).length, 2, 'Consecutive layered renders update camera counts and frustums' );

			context.renderTarget = target;
			context.depthTexture = null;
			context.camera = new ArrayCamera( [ createCamera( 100 ) ] );
			backend.beginRender( context );
			assert.strictEqual( draw( backend, context, object ).length, 1, 'Switching back to an ordinary target updates culling' );

		} );

		QUnit.test( 'Fresh layered ArrayCamera render culls per layer', ( assert ) => {

			const backend = createBackend();
			const contexts = new RenderContexts( { getClearDepth: () => 1, getClearStencil: () => 0 } );
			const context = contexts.get( new RenderTarget( 16, 16 ) );
			Object.assign( context, {
				textures: [], depth: false, stencil: false, occlusionQueryCount: 0,
				camera: new ArrayCamera( [ createCamera( 0 ), createCamera( 100 ) ] ),
				depthTexture: { isArrayTexture: true }
			} );
			backend.get( context.depthTexture ).texture = {};
			backend.beginRender( context );
			const object = new Mesh( new BoxGeometry() );
			object.position.set( 0, 0, - 5 );
			object.updateMatrixWorld();
			assert.strictEqual( draw( backend, context, object ).length, 1, 'Only the visible layer is drawn on the first render' );

		} );

	} );

} );
