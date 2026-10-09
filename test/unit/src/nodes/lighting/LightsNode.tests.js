import LightsNode from '../../../../../src/nodes/lighting/LightsNode.js';
import StaticLightsNode from '../../../../../src/nodes/lighting/StaticLightsNode.js';
import PointLightNode from '../../../../../src/nodes/lighting/PointLightNode.js';
import PhysicalLightingModel from '../../../../../src/nodes/functions/PhysicalLightingModel.js';
import Lighting from '../../../../../src/renderers/common/Lighting.js';
import { PointLight } from '../../../../../src/lights/PointLight.js';
import { SpotLight } from '../../../../../src/lights/SpotLight.js';
import { Scene } from '../../../../../src/scenes/Scene.js';
import '../../../../../src/renderers/webgpu/nodes/StandardNodeLibrary.js';

function createBuilder() {

	const data = new WeakMap();
	return {
		material: { isMeshStandardNodeMaterial: true },
		context: { materialLightings: [], lightingModel: new PhysicalLightingModel() },
		isAvailable: () => true,
		getDataFromNode( node ) {

			if ( ! data.has( node ) ) data.set( node, {} );
			return data.get( node );

		}
	};

}

function createPoint() {

	const light = new PointLight( 0xffffff, 1, 10 );
	light.static = true;
	light.updateMatrixWorld();
	return light;

}

export default QUnit.module( 'Nodes', () => {

	QUnit.module( 'Lighting', () => {

		QUnit.module( 'LightsNode', () => {

			QUnit.test( 'batches static lights and preserves dynamic lights', ( assert ) => {

				const point = createPoint();
				const spot = new SpotLight( 0xffffff, 1, 10 );
				spot.static = true;
				spot.updateMatrixWorld();
				const dynamic = createPoint();
				dynamic.static = false;
				const node = new LightsNode().setLights( [ point, spot, dynamic ] );
				const result = node.setupLightsNode( createBuilder() );

				assert.strictEqual( result.length, 2 );
				assert.strictEqual( result[ 0 ].light, dynamic );
				assert.ok( result[ 1 ] instanceof StaticLightsNode );
				assert.strictEqual( result[ 1 ].grid.data.length, 32 );
				node.dispose();

			} );

			QUnit.test( 'unsupported lights retain their original nodes', ( assert ) => {

				const shadow = createPoint();
				shadow.castShadow = true;
				const infinite = createPoint();
				infinite.distance = 0;
				const customColor = createPoint();
				customColor.colorNode = {};
				const projected = new SpotLight( 0xffffff, 1, 10 );
				projected.static = true;
				projected.map = {};
				class CustomPointLightNode extends PointLightNode {}
				const custom = createPoint();
				custom._lightNode = CustomPointLightNode;
				const lights = [ shadow, infinite, customColor, projected, custom ];
				const node = new LightsNode().setLights( lights );
				const result = node.setupLightsNode( createBuilder() );

				assert.deepEqual( result.map( entry => entry.light ), lights );
				assert.strictEqual( node._staticLightsNodes.size, 0 );

			} );

			QUnit.test( 'unsupported backends and lighting contexts use ordinary lights', ( assert ) => {

				const light = createPoint();
				const node = new LightsNode().setLights( [ light ] );
				const builders = [ createBuilder(), createBuilder(), createBuilder(), createBuilder() ];
				builders[ 0 ].isAvailable = () => false;
				builders[ 1 ].context.lightingModel = {};
				builders[ 2 ].context.positionView = {};
				builders[ 3 ].context.lightingModel.clearcoat = true;

				for ( const builder of builders ) {

					assert.strictEqual( node.setupLightsNode( builder )[ 0 ].light, light );

				}

				assert.strictEqual( node._staticLightsNodes.size, 0 );

			} );

			QUnit.test( 'shares immutable batches across builders and restored light sets', ( assert ) => {

				const lights = [ createPoint(), createPoint() ];
				const node = new LightsNode().setLights( lights );
				const batch = node.setupLightsNode( createBuilder() )[ 0 ];
				assert.strictEqual( node.setupLightsNode( createBuilder() )[ 0 ], batch );
				node.setLights( [] );
				assert.strictEqual( node.setupLightsNode( createBuilder() ).length, 0 );
				node.setLights( lights );
				assert.strictEqual( node.setupLightsNode( createBuilder() )[ 0 ], batch );
				node.dispose();

			} );

			QUnit.test( 'leaving static mode invalidates snapshots before recapture', ( assert ) => {

				const light = createPoint();
				const node = new LightsNode().setLights( [ light ] );
				const key = node.customCacheKey();
				const batch = node.setupLightsNode( createBuilder() )[ 0 ];
				light.static = false;
				node.setLights( [ light ] );
				assert.notStrictEqual( node.customCacheKey(), key );
				light.position.x = 20;
				light.updateMatrixWorld();
				light.static = true;
				node.setLights( [ light ] );
				const updated = node.setupLightsNode( createBuilder() )[ 0 ];
				assert.notStrictEqual( updated, batch );
				assert.strictEqual( updated.grid.data[ 0 ], 20 );
				node.dispose();

			} );

			QUnit.test( 'cache saturation falls back without omitting lights', ( assert ) => {

				const node = new LightsNode();
				let ordinary = 0;
				for ( let i = 0; i < 12; i ++ ) {

					const light = createPoint();
					node.setLights( [ light ] );
					const result = node.setupLightsNode( createBuilder() );
					assert.strictEqual( result.length, 1 );
					if ( result[ 0 ].light === light ) ordinary ++;

				}

				assert.ok( ordinary > 0, 'excess light sets retain ordinary light nodes' );
				node.dispose();

			} );

			QUnit.test( 'lighting disposal releases cached buffers and allows rebuilding', ( assert ) => {

				const lighting = new Lighting();
				const scene = new Scene();
				const node = lighting.getNode( scene ).setLights( [ createPoint() ] );
				const key = node.customCacheKey();
				const batch = node.setupLightsNode( createBuilder() )[ 0 ];
				let disposed = 0;
				for ( const attribute of [ batch.cellAttribute, batch.indexAttribute, batch.lightAttribute ] ) {

					attribute.addEventListener( 'dispose', () => disposed ++ );

				}

				lighting.dispose();
				assert.strictEqual( disposed, 3 );
				assert.notStrictEqual( node.customCacheKey(), key );
				assert.notStrictEqual( lighting.getNode( scene ), node );

			} );

		} );

	} );

} );
