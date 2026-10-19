import { BufferGeometry, Float32BufferAttribute, Mesh, PlaneGeometry } from 'three';
import { unwrapUVs } from '../../../../examples/jsm/utils/unwrapUVs.js';
import { analyzeUVUnwrap } from '../../../../examples/jsm/utils/UVUnwrapDiagnostics.js';

function triangleAtlas( coordinates ) {

	const geometry = new BufferGeometry();
	geometry.setAttribute( 'position', new Float32BufferAttribute( [ 0, 0, 0, 1, 0, 0, 0, 1, 0 ], 3 ) );
	geometry.setAttribute( 'uv1', new Float32BufferAttribute( coordinates, 2 ) );
	return {
		attribute: 'uv1', resolution: 1024, padding: 0,
		charts: [ { x: 0, y: 0, width: 1024, height: 1024 } ],
		meshes: [ { mesh: new Mesh( geometry ), faceCharts: [ 0 ] } ]
	};

}

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'Utils', () => {

		QUnit.module( 'UVUnwrapDiagnostics', () => {

			QUnit.test( 'valid atlas and shared edges', assert => {

				const report = analyzeUVUnwrap( unwrapUVs( new Mesh( new PlaneGeometry( 1, 1, 2, 2 ) ) ) );
				assert.true( report.passed, JSON.stringify( report.issues ) );
				assert.strictEqual( report.metrics.overlapPairs, 0 );

			} );

			QUnit.test( 'packing and empty results fail', assert => {

				assert.false( analyzeUVUnwrap( null ).passed );
				assert.false( analyzeUVUnwrap( { charts: [], meshes: [] } ).passed );

			} );

			QUnit.test( 'stored invalid, flipped, collapsed and tiny triangles fail', assert => {

				for ( const [ coordinates, code ] of [
					[[ NaN, 0, 1, 0, 0, 1 ], 'invalidFaces' ],
					[[ 0, 0, 2, 0, 0, 1 ], 'invalidFaces' ],
					[[ 0, 0, 0, 1, 1, 0 ], 'flippedFaces' ],
					[[ 0, 0, 0, 0, 0, 0 ], 'collapsedFaces' ],
					[[ 0, 0, 0.00001, 0, 0, 0.00001 ], 'tinyFaces' ]
				] ) {

					const report = analyzeUVUnwrap( triangleAtlas( coordinates ) );
					assert.true( report.issues.some( issue => issue.code === code ), code );

				}

			} );

			QUnit.test( 'cross-mesh overlap and excluded faces fail', assert => {

				const result = triangleAtlas( [ 0, 0, 1, 0, 0, 1 ] );
				result.meshes.push( { ...result.meshes[ 0 ] } );
				assert.strictEqual( analyzeUVUnwrap( result ).metrics.overlapPairs, 1 );
				result.meshes[ 0 ].faceCharts = [ - 1 ];
				assert.strictEqual( analyzeUVUnwrap( result ).metrics.excludedFaces, 1 );

			} );

			QUnit.test( 'stretch, density and fragmentation have explicit quality limits', assert => {

				const result = triangleAtlas( [ 0, 0, 1, 0, 0, 0.01 ] );
				assert.true( analyzeUVUnwrap( result ).issues.some( issue => issue.code === 'stretch' ) );
				const small = triangleAtlas( [ 0.8, 0.8, 0.85, 0.8, 0.8, 0.85 ] );
				result.meshes.push( small.meshes[ 0 ] );
				assert.true( analyzeUVUnwrap( result, { maxDensityRatio: 1.01 } ).issues.some( issue => issue.code === 'density' ) );
				result.meshes = Array.from( { length: 20 }, ( _, i ) => ( { ...small.meshes[ 0 ], faceCharts: [ i ] } ) );
				result.charts = Array.from( { length: 20 }, () => result.charts[ 0 ] );
				assert.true( analyzeUVUnwrap( result ).issues.some( issue => issue.code === 'fragmentation' ) );

			} );

		} );

	} );

} );

