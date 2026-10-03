import { builders } from './code.js';
import { BufferAttribute } from '../../../src/core/BufferAttribute.js';
import { BufferGeometry } from '../../../src/core/BufferGeometry.js';
import { WebGLCoordinateSystem, WebGPUCoordinateSystem } from '../../../src/constants.js';
import { defaultBuildStages } from '../../../src/nodes/core/constants.js';
import { Fn, positionLocal, struct, uniform, vec3, vec4 } from '../../../src/Three.TSL.js';

// Builds a vertex and a fragment flow the way NodeBuilder.build() does: one builder,
// one shared cache, so node setup runs once for both stages. Returns the fragment codes.
function buildStages( language, flows ) {

	const coordinateSystem = language === 'glsl' ? WebGLCoordinateSystem : WebGPUCoordinateSystem;
	const renderer = { backend: {}, coordinateSystem, debug: { diagnostics: { keywords: false } } };
	const geometry = new BufferGeometry();
	geometry.setAttribute( 'position', new BufferAttribute( new Float32Array( 3 ), 3 ) );
	const builder = new builders[ language ]( { geometry }, renderer );

	for ( const buildStage of defaultBuildStages ) {

		builder.setBuildStage( buildStage );

		for ( const shaderStage of [ 'vertex', 'fragment' ] ) {

			builder.setShaderStage( shaderStage );

			if ( buildStage === 'generate' ) {

				builder.flowNode( flows[ shaderStage ] );

			} else {

				flows[ shaderStage ].build( builder );

			}

		}

	}

	builder.setBuildStage( null );
	builder.setShaderStage( null );

	return { builder, codes: builder.getCodes( 'fragment' ) };

}

QUnit.module( 'TSL', () => {

	QUnit.module( 'Struct', () => {

		for ( const language of Object.keys( builders ) ) {

			QUnit.test( `${ language.toUpperCase() } typed function parameter resolves a struct first met in another stage`, ( assert ) => {

				// #34721: the struct is set up while the vertex stage builds, so it is only
				// registered there. Resolving the parameter's members in the fragment stage
				// must still find the struct instead of logging "Member not found".
				const Params = struct( { tint: 'vec3', scale: 'float' }, 'Params' );
				const params = Params( uniform( vec3( 1, 0.5, 0.25 ) ), uniform( 1 ) );
				const tinted = Fn( ( [ p ] ) => p.get( 'tint' ).mul( p.get( 'scale' ) ) ).setLayout( {
					name: 'tinted', type: 'vec3', inputs: [ { name: 'p', type: 'Params' } ]
				} );

				const errors = [];
				const consoleError = console.error;
				console.error = ( ...args ) => errors.push( args.map( String ).join( ' ' ) );

				let result;

				try {

					result = buildStages( language, {
						vertex: positionLocal.add( params.get( 'tint' ).mul( 0 ) ),
						fragment: vec4( tinted( params ), 1 )
					} );

				} finally {

					console.error = consoleError;

				}

				assert.deepEqual( errors, [], 'no struct member errors are logged' );
				assert.notStrictEqual( result.builder.getStructTypeNode( 'Params', 'fragment' ), null, 'the struct is registered for the fragment stage' );
				assert.ok( /p\.tint \* vec3(<f32>)?\( p\.scale \)/.test( result.codes ), 'the float member is converted, not multiplied as a struct' );

			} );

		}

	} );

} );
