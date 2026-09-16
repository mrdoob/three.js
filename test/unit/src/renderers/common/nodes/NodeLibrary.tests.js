import NodeLibrary from '../../../../../../src/renderers/common/nodes/NodeLibrary.js';
import IESSpotLight from '../../../../../../src/lights/webgpu/IESSpotLight.js';
import { SpotLight } from '../../../../../../src/lights/SpotLight.js';
import IESSpotLightNode from '../../../../../../src/nodes/lighting/IESSpotLightNode.js';
import SpotLightNode from '../../../../../../src/nodes/lighting/SpotLightNode.js';

export default QUnit.module( 'Renderers', () => {

	QUnit.module( 'Nodes', () => {

		QUnit.module( 'NodeLibrary', () => {

			QUnit.test( 'getLightNodeClass resolves unregistered subclasses via prototype chain', ( assert ) => {

				const library = new NodeLibrary();
				library.addLight( SpotLightNode, SpotLight );
				library.addLight( IESSpotLightNode, IESSpotLight );

				class MyIESSpotLight extends IESSpotLight {}

				assert.strictEqual(
					library.getLightNodeClass( IESSpotLight ),
					IESSpotLightNode,
					'Registered IESSpotLight maps to IESSpotLightNode'
				);

				assert.strictEqual(
					library.getLightNodeClass( MyIESSpotLight ),
					IESSpotLightNode,
					'Unregistered IESSpotLight subclass maps to IESSpotLightNode'
				);

				assert.notStrictEqual(
					library.getLightNodeClass( MyIESSpotLight ),
					SpotLightNode,
					'Subclass prefers the nearest registered ancestor over SpotLightNode'
				);

			} );

		} );

	} );

} );
