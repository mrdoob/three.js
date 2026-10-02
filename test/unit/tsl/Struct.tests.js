import WGSLNodeBuilder from '../../../src/renderers/webgpu/nodes/WGSLNodeBuilder.js';
import { BufferAttribute } from '../../../src/core/BufferAttribute.js';
import { BufferGeometry } from '../../../src/core/BufferGeometry.js';
import { WebGPUCoordinateSystem } from '../../../src/constants.js';
import { Fn, positionLocal, struct, uniform, vec3, vec4 } from '../../../src/Three.TSL.js';
import { normalizeCode } from './code.js';

// Mirrors the node builder loop of `NodeBuilder.build()` (setup/analyze/generate
// across shader stages) without a GPU or renderer.
function buildFragmentCode( withVertexStructRead ) {

	const renderer = { backend: {}, coordinateSystem: WebGPUCoordinateSystem, debug: { diagnostics: { keywords: false } } };
	const geometry = new BufferGeometry();
	geometry.setAttribute( 'position', new BufferAttribute( new Float32Array( [ - 1, - 1, 0, 3, - 1, 0, - 1, 3, 0 ] ), 3 ) );

	const Params = struct( { tint: 'vec3', scale: 'float' }, 'Params' );
	const params = Params( uniform( vec3( 1, 0.5, 0.25 ) ), uniform( 1 ) );

	const tinted = Fn( ( [ p ] ) => p.get( 'tint' ).mul( p.get( 'scale' ) ) ).setLayout( {
		name: 'tinted', type: 'vec3', inputs: [ { name: 'p', type: 'Params' } ]
	} );

	const positionNode = withVertexStructRead === true ? positionLocal.add( params.get( 'tint' ).mul( 0 ) ) : positionLocal;
	const fragmentNode = vec4( tinted( params ), 1 );

	const builder = new WGSLNodeBuilder( { geometry, material: {} }, renderer );

	// as `NodeMaterial.setup()` does during `NodeBuilder.prebuild()`
	builder.context.position = positionNode;
	builder.addFlow( 'vertex', positionNode );
	builder.addFlow( 'fragment', fragmentNode );

	for ( const buildStage of [ 'setup', 'analyze', 'generate' ] ) {

		builder.setBuildStage( buildStage );

		if ( builder.context.position && builder.context.position.isNode ) {

			builder.flowNodeFromShaderStage( 'vertex', builder.context.position );

		}

		for ( const shaderStage of [ 'vertex', 'fragment' ] ) {

			builder.setShaderStage( shaderStage );

			for ( const node of builder.flowNodes[ shaderStage ] ) {

				if ( buildStage === 'generate' ) builder.flowNode( node );
				else node.build( builder );

			}

		}

	}

	return builder.getCodes( 'fragment' );

}

QUnit.module( 'TSL', () => {

	QUnit.module( 'Struct', () => {

		QUnit.test( 'Fn parameter keeps member types when the struct is read in multiple stages', ( assert ) => {

			// Regression test for a struct read in the vertex stage before its
			// typed Fn parameter is resolved in the fragment stage: the struct
			// type used to be registered only for the first stage, so member
			// types fell back to 'float' and the generated function wrapped the
			// whole expression instead of converting the member.

			const expected = 'fn tinted ( p : Params ) -> vec3<f32> {\n\n\treturn ( p.tint * vec3<f32>( p.scale ) );\n\n}\n';

			const twoStages = normalizeCode( buildFragmentCode( true ) );
			const fragmentOnly = normalizeCode( buildFragmentCode( false ) );

			assert.strictEqual( twoStages, expected, 'Member types are resolved when the struct is also read in the vertex stage' );
			assert.strictEqual( twoStages, fragmentOnly, 'Generated code does not depend on the vertex-stage struct read' );

		} );

	} );

} );
