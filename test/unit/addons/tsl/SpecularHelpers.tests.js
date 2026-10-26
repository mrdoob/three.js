import { float, vec3, vec4 } from 'three/tsl';
import { ggxReflectionSample, resolveSSRHitDistance, ENV_RAY_LENGTH, ENV_RAY_LENGTH_THRESHOLD } from '../../../../examples/jsm/tsl/utils/SpecularHelpers.js';
import { gpuTest } from '../../src/nodes/tsl/gpu-test-utils.js';

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'TSL', () => {

		QUnit.module( 'SpecularHelpers', () => {

			gpuTest( 'SSR reconstruction distances require contributing screen hits', ( { assert } ) => {

				for ( const coverage of [ 0.001, 0.5, 1 ] ) {

					assert.closeAbs( resolveSSRHitDistance( float( 2.5 ), float( coverage ) ), float( 2.5 ), 0, `Positive coverage ${ coverage } retains hit distance, independently of RGB` );

				}

				assert.closeAbs( resolveSSRHitDistance( float( 2.5 ), float( 0 ) ), float( ENV_RAY_LENGTH ), 0, 'A roughness/history-rejected hit cannot guide fallback reprojection' );
				for ( const distance of [ - 1, 0, ENV_RAY_LENGTH_THRESHOLD, ENV_RAY_LENGTH ] ) {

					assert.closeAbs( resolveSSRHitDistance( float( distance ), float( 1 ) ), float( ENV_RAY_LENGTH ), 0, `Invalid or sentinel distance ${ distance } maps to fallback` );

				}

			} );

			gpuTest( 'GGX sampling remains finite at either tangent-frame pole', ( { assert } ) => {

				for ( const sign of [ - 1, 1 ] ) for ( const offset of [ 0, 1e-5, 5e-4, 2e-3 ] ) {

					const normal = vec3( offset, 0, sign ).normalize();
					const label = `normal pole ${ sign }, offset ${ offset }`;
					// Xi.y = 0 selects the top of the spherical cap. With V = N the
					// halfway vector and reflected ray must both equal N, independently
					// of the arbitrary tangent basis orientation.
					const symmetric = ggxReflectionSample( normal, normal, float( 0.5 ), float( 0 ), vec3( 1 ), vec4( 0.37, 0, 0, 0 ) );
					assert.closeAbs( symmetric.get( 'reflectDir' ), normal, 2e-5, `${ label }: cap-top sample reflects along N` );
					assert.closeAbs( symmetric.get( 'sampleWeight' ), vec3( 0.04 / ( 1 + 0.25 ** 2 ) ), 2e-5, `${ label }: cap-top weight is finite and normalized` );

					const scattered = ggxReflectionSample( normal, normal, float( 0.5 ), float( 0 ), vec3( 1 ), vec4( 0.37, 0.6, 0, 0 ) );
					assert.closeAbs( scattered.get( 'reflectDir' ).length(), float( 1 ), 2e-5, `${ label }: off-axis ray is a finite unit vector` );
					assert.greaterThan( scattered.get( 'sampleWeight' ), vec3( 0 ), `${ label }: off-axis sample has finite positive weight` );
					assert.lessThan( scattered.get( 'sampleWeight' ), vec3( 1 ), `${ label }: off-axis sample weight is bounded` );

				}

			} );

		} );

	} );

} );
