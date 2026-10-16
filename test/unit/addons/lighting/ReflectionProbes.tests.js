import { Vector3 } from 'three/webgpu';
import { ReflectionProbe, ReflectionProbes } from '../../../../examples/jsm/lighting/ReflectionProbes.js';

function makeProbe( x, width ) {

	const probe = new ReflectionProbe( width, 20, 20 );
	probe.position.x = x;
	probe.updateMatrixWorld();
	return probe;

}

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'Lighting', () => {

		QUnit.module( 'ReflectionProbes', () => {

			QUnit.test( 'flat core and inward fades from every face', ( assert ) => {

				const probe = makeProbe( 0, 8 );
				const position = new Vector3();
				assert.strictEqual( probe.getWeight( position.set( - 5, 0, 0 ) ), 0, 'outside' );
				assert.strictEqual( probe.getWeight( position.set( - 4, 0, 0 ) ), 0, 'boundary fades to zero' );
				assert.strictEqual( probe.getWeight( position.set( - 3.75, 0, 0 ) ), 0.5, 'halfway through fade' );
				assert.strictEqual( probe.getWeight( position.set( 2, 0, 0 ) ), 1, 'flat core is not a center peak' );
				assert.strictEqual( probe.getWeight( position.set( 0, 9.75, 0 ) ), 0.5, 'top face' );
				assert.strictEqual( probe.getWeight( position.set( 0, 0, - 9.75 ) ), 0.5, 'back face' );

			} );

			QUnit.test( 'follows world transforms', ( assert ) => {

				const probe = makeProbe( 10, 8 );
				assert.strictEqual( probe.getWeight( new Vector3( 10, 0, 0 ) ), 1, 'moves with position' );
				probe.scale.setScalar( 2 );
				probe.updateMatrixWorld();
				assert.strictEqual( probe.getWeight( new Vector3( 17, 0, 0 ) ), 1, 'scales with the probe' );

			} );

			QUnit.test( 'smaller volumes override rather than average', ( assert ) => {

				const probes = new ReflectionProbes();
				const small = makeProbe( 0, 2 );
				const large = makeProbe( 0, 8 );
				probes.bakedProbes = [ small, large ];

				let result = probes.getWeights( new Vector3() );
				assert.deepEqual( result.weights, [ 1, 0 ], 'small core takes all coverage' );
				assert.strictEqual( result.environmentWeight, 0, 'nothing left for the environment' );

				result = probes.getWeights( new Vector3( 0.75, 0, 0 ) );
				assert.deepEqual( result.weights, [ 0.5, 0.5 ], 'small fade fills from the large core' );

				result = probes.getWeights( new Vector3( 3.75, 0, 0 ) );
				assert.deepEqual( result.weights, [ 0, 0.5 ], 'outside the small volume' );
				assert.strictEqual( result.environmentWeight, 0.5, 'environment fills the rest' );

			} );

		} );

	} );

} );
