import RenderObjects from '../../../../src/renderers/common/RenderObjects.js';
import NodeMaterialDebug from '../../../../src/renderers/common/NodeMaterialDebug.js';
import { BufferGeometry } from '../../../../src/core/BufferGeometry.js';
import { MeshBasicMaterial } from '../../../../src/materials/MeshBasicMaterial.js';
import { PerspectiveCamera } from '../../../../src/cameras/PerspectiveCamera.js';
import { Mesh } from '../../../../src/objects/Mesh.js';
import { Scene } from '../../../../src/scenes/Scene.js';

function createRenderer( events ) {

	const renderer = {
		backend: { isWebGPUBackend: false },
		contextNode: { id: 1, version: 0 },
		shadowMap: { enabled: false, type: 1 },
		debug: {
			traceNodeMaterialInvalidation: false,
			onNodeMaterialInvalidation: events ? ( event ) => events.push( event ) : null
		},
		getOutputRenderTarget() {

			return null;

		}
	};

	renderer._nodeMaterialDebug = events ? new NodeMaterialDebug( renderer ) : null;
	renderer._getNodeMaterialDebug = () => renderer._nodeMaterialDebug;

	return renderer;

}

function createNodes() {

	return {
		getCacheKey: () => 0,
		getEnvironmentNode: () => null,
		getFogNode: () => null,
		delete: () => {}
	};

}

function createRenderObjects( events, nodes = createNodes() ) {

	return new RenderObjects(
		createRenderer( events ),
		nodes,
		{},
		{ delete: () => {} },
		{ deleteForRender: () => {} },
		{}
	);

}

function createState() {

	const material = new MeshBasicMaterial();
	const object = new Mesh( new BufferGeometry(), material );
	const scene = new Scene();
	const camera = new PerspectiveCamera();
	const lights = [];
	const lightsNode = {
		getLights() {

			return lights;

		},
		getCacheKey() {

			return lights.map( ( light ) => `${ light.type }:${ light.id }:${ light.castShadow === true ? 1 : 0 }` ).join( '|' );

		}
	};

	return {
		object,
		material,
		scene,
		camera,
		lights,
		lightsNode,
		renderContext: { id: 1 },
		clippingContext: { cacheKey: '' }
	};

}

export default QUnit.module( 'Renderers', () => {

	QUnit.module( 'RenderObjects', () => {

		QUnit.test( 'reports the cache contributor that invalidates a node material', ( assert ) => {

			const events = [];
			const renderObjects = createRenderObjects( events );
			const { object, material, scene, camera, lightsNode, renderContext, clippingContext } = createState();

			material.name = 'DebugMaterial';

			const initialRenderObject = renderObjects.get( object, material, scene, camera, lightsNode, renderContext, clippingContext );

			material.transparent = true;
			material.needsUpdate = true;

			const refreshedRenderObject = renderObjects.get( object, material, scene, camera, lightsNode, renderContext, clippingContext );

			assert.notStrictEqual( refreshedRenderObject, initialRenderObject, 'The render object is recreated after the cache miss.' );
			assert.strictEqual( events.length, 1, 'One invalidation event was reported.' );
			assert.strictEqual( events[ 0 ].material, material, 'The event exposes the invalidated material.' );
			assert.strictEqual( events[ 0 ].materialLabel, 'DebugMaterial', 'The material label prefers material.name.' );
			assert.strictEqual( events[ 0 ].property, 'material.transparent', 'The changed cache contributor is reported.' );
			assert.strictEqual( events[ 0 ].previousValue, 'false', 'The previous contributor value is reported.' );
			assert.strictEqual( events[ 0 ].value, 'true', 'The next contributor value is reported.' );
			assert.strictEqual( events[ 0 ].rebuild, true, 'The event identifies the render object rebuild.' );
			assert.strictEqual( events[ 0 ].needsRefresh, true, 'The event identifies the forced refresh.' );

		} );

		QUnit.test( 'reports dynamic cache invalidations with readable light changes', ( assert ) => {

			let nodeCacheKey = 1;

			const nodes = {
				getCacheKey: () => nodeCacheKey,
				getEnvironmentNode: () => null,
				getFogNode: () => null,
				delete: () => {}
			};

			const events = [];
			const renderObjects = createRenderObjects( events, nodes );
			const { object, material, scene, camera, lights, lightsNode, renderContext, clippingContext } = createState();

			lights.push( { type: 'HemisphereLight', id: 1, castShadow: false } );
			lights.push( { type: 'DirectionalLight', id: 2, castShadow: true } );

			const initialRenderObject = renderObjects.get( object, material, scene, camera, lightsNode, renderContext, clippingContext );

			lights.push( { type: 'PointLight', id: 3, castShadow: false } );
			nodeCacheKey = 2;

			const refreshedRenderObject = renderObjects.get( object, material, scene, camera, lightsNode, renderContext, clippingContext );

			assert.notStrictEqual( refreshedRenderObject, initialRenderObject, 'The render object is recreated after the dynamic cache changes.' );
			assert.strictEqual( events.length, 1, 'One invalidation event was reported.' );
			assert.strictEqual( events[ 0 ].property, 'scene.lights', 'The report points to the light setup instead of an opaque hash.' );
			assert.strictEqual( events[ 0 ].previousValue, '2 lights [HemisphereLight#1, DirectionalLight#2 shadow]', 'The previous light setup is human readable.' );
			assert.strictEqual( events[ 0 ].value, '3 lights [HemisphereLight#1, DirectionalLight#2 shadow, PointLight#3]', 'The next light setup is human readable.' );

		} );

		QUnit.test( 'ignores material changes that do not affect the render object cache', ( assert ) => {

			const events = [];
			const renderObjects = createRenderObjects( events );
			const { object, material, scene, camera, lightsNode, renderContext, clippingContext } = createState();

			const initialRenderObject = renderObjects.get( object, material, scene, camera, lightsNode, renderContext, clippingContext );

			material.opacity = 0.25;
			material.needsUpdate = true;

			const refreshedRenderObject = renderObjects.get( object, material, scene, camera, lightsNode, renderContext, clippingContext );

			assert.strictEqual( refreshedRenderObject, initialRenderObject, 'The existing render object is reused when the cache key stays stable.' );
			assert.strictEqual( events.length, 0, 'No invalidation event is reported for cache-stable changes.' );

		} );

		QUnit.test( 'works without node material debug enabled', ( assert ) => {

			const renderObjects = createRenderObjects( null );
			const { object, material, scene, camera, lightsNode, renderContext, clippingContext } = createState();

			const initialRenderObject = renderObjects.get( object, material, scene, camera, lightsNode, renderContext, clippingContext );

			material.transparent = true;
			material.needsUpdate = true;

			const refreshedRenderObject = renderObjects.get( object, material, scene, camera, lightsNode, renderContext, clippingContext );

			assert.notStrictEqual( refreshedRenderObject, initialRenderObject, 'The render object is recreated without requiring debug support.' );

		} );

	} );

} );
