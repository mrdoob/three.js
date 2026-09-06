import Bindings from '../../../../../src/renderers/common/Bindings.js';
import BindGroup from '../../../../../src/renderers/common/BindGroup.js';
import DataMap from '../../../../../src/renderers/common/DataMap.js';
import Textures from '../../../../../src/renderers/common/Textures.js';
import { NodeSampledTexture } from '../../../../../src/renderers/common/nodes/NodeSampledTexture.js';
import { RenderTarget } from '../../../../../src/core/RenderTarget.js';
import { DepthTexture } from '../../../../../src/textures/DepthTexture.js';

export default QUnit.module( 'Renderers', () => {

	QUnit.module( 'Common', () => {

		QUnit.module( 'Bindings', () => {

			QUnit.test( 'Resized render targets refresh stationary objects', ( assert ) => {

				const backend = new DataMap();
				let bindingUpdates = 0;

				backend.createTexture = ( texture ) => {

					backend.get( texture ).texture = {};

				};

				backend.destroyTexture = ( texture ) => {

					backend.get( texture ).texture.destroyed = true;
					backend.delete( texture );

				};

				backend.createBindings = backend.updateBindings = ( group ) => {

					backend.get( group ).texture = backend.get( group.bindings[ 0 ].texture ).texture;
					bindingUpdates ++;

				};

				const info = { memory: { renderTargets: 0 }, createTexture() {}, destroyTexture() {} };
				const textures = new Textures( {}, backend, info );
				const nodes = { updateGroup: () => true };
				const bindings = new Bindings( backend, nodes, textures, null, {}, info );
				const target = new RenderTarget( 16, 16, { depthTexture: new DepthTexture( 16, 16 ) } );
				const textureNode = { value: target.depthTexture };
				const groups = [
					new BindGroup( 'first', [ new NodeSampledTexture( 'depth', textureNode ) ] ),
					new BindGroup( 'second', [ new NodeSampledTexture( 'depth', textureNode ) ] )
				];
				const objects = groups.map( ( group ) => ( { getBindings: () => [ group ] } ) );

				textures.updateRenderTarget( target );

				for ( const object of objects ) bindings.updateForRender( object );

				nodes.updateGroup = () => false;

				for ( const size of [ 32, 16, 64, 32 ] ) {

					const previousTexture = backend.get( target.depthTexture ).texture;
					const previousUpdates = bindingUpdates;

					target.setSize( size, size );
					textures.updateRenderTarget( target );

					bindings.updateSharedForRender( objects[ 0 ] );
					bindings.updateInvalidatedForRender( objects[ 1 ] );

					const currentTexture = backend.get( target.depthTexture ).texture;

					assert.true( previousTexture.destroyed, 'The previous GPU texture was destroyed.' );
					assert.strictEqual( backend.get( groups[ 0 ] ).texture, currentTexture, 'A shared refresh binds the new texture.' );
					assert.strictEqual( backend.get( groups[ 1 ] ).texture, currentTexture, 'An otherwise unchanged object binds the new texture.' );
					assert.strictEqual( bindingUpdates, previousUpdates + 2, 'Each affected bind group is rebuilt once.' );

					bindings.updateSharedForRender( objects[ 0 ] );
					bindings.updateInvalidatedForRender( objects[ 1 ] );

					assert.strictEqual( bindingUpdates, previousUpdates + 2, 'Unchanged resources do not rebuild bindings.' );

				}

				target.dispose();

			} );

		} );

	} );

} );
