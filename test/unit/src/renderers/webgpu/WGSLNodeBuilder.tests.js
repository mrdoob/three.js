import WGSLNodeBuilder from '../../../../../src/renderers/webgpu/nodes/WGSLNodeBuilder.js';
import StorageBufferNode from '../../../../../src/nodes/accessors/StorageBufferNode.js';
import StructTypeNode from '../../../../../src/nodes/core/StructTypeNode.js';
import NodeUniform from '../../../../../src/nodes/core/NodeUniform.js';
import StorageBufferAttribute from '../../../../../src/renderers/common/StorageBufferAttribute.js';

function buildStructStorageUniform( count ) {

	const attribute = new StorageBufferAttribute( new Float32Array( count * 4 ), 4 );
	const structType = new StructTypeNode( { test: 'vec4' }, 'TestData' );
	const storageNode = new StorageBufferNode( attribute, structType );
	const uniform = new NodeUniform( 'data', 'storageBuffer', storageNode );
	const builder = new WGSLNodeBuilder( null, { backend: {} } );

	builder.setShaderStage( 'compute' );
	builder.uniforms.compute.push( uniform );
	builder.bindingsIndexes[ uniform.groupNode.name ] = { binding: 0, group: 0 };

	return {
		propertyName: builder.getPropertyName( uniform ),
		uniforms: builder.getUniforms( 'compute' )
	};

}

export default QUnit.module( 'Renderers', () => {

	QUnit.module( 'WebGPU', () => {

		QUnit.module( 'WGSLNodeBuilder', () => {

			QUnit.test( 'struct storage buffers preserve array semantics', ( assert ) => {

				for ( const count of [ 1, 2 ] ) {

					const result = buildStructStorageUniform( count );

					assert.strictEqual( result.propertyName, 'data.value', `storage buffer with ${ count } element(s) uses array access` );
					assert.ok( result.uniforms.includes( '\tvalue : array< TestData >' ), `storage buffer with ${ count } element(s) has an array binding` );

				}

			} );

		} );

	} );

} );
