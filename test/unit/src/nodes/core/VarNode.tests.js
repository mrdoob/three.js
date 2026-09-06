import { Fn } from '../../../../../src/nodes/tsl/TSLCore.js';
import { uv } from '../../../../../src/nodes/accessors/UV.js';
import NodeBuilder from '../../../../../src/nodes/core/NodeBuilder.js';
import InspectorBase from '../../../../../src/renderers/common/InspectorBase.js';
import MeshBasicNodeMaterial from '../../../../../src/materials/nodes/MeshBasicNodeMaterial.js';
import { PlaneGeometry } from '../../../../../src/geometries/PlaneGeometry.js';
import { Mesh } from '../../../../../src/objects/Mesh.js';

function countInspectorNodes( createNode ) {

	const geometry = new PlaneGeometry();
	const material = new MeshBasicNodeMaterial();
	const mesh = new Mesh( geometry, material );

	const renderer = {
		backend: { isWebGPUBackend: true },
		inspector: new InspectorBase()
	};

	const builder = new NodeBuilder( mesh, renderer );
	builder.setBuildStage( 'setup' );
	builder.setShaderStage( 'fragment' );

	createNode().build( builder );

	const count = [ ...builder.nodes ].filter( node => node.isInspectorNode ).length;

	geometry.dispose();
	material.dispose();

	return count;

}

export default QUnit.module( 'Nodes', () => {

	QUnit.module( 'Core', () => {

		QUnit.module( 'VarNode', () => {

			QUnit.test( 'toInspector() registers on an intent VarNode returned by Fn()', ( assert ) => {

				const makeValue = () => Fn( () => uv().x )();

				const count = countInspectorNodes( () => makeValue().toInspector( 'Fn' ) );

				assert.strictEqual( count, 1, 'InspectorNode should be registered even without an explicit toVar()' );

			} );

		} );

	} );

} );
