import {
	sh3Add,
	sh3AddScaledSH,
	sh3Copy,
	sh3Create,
	sh3Equals,
	sh3FromArray,
	sh3GetAt,
	sh3GetBasisAt,
	sh3GetIrradianceAt,
	sh3Lerp,
	sh3Scale,
	sh3Set,
	sh3ToArray,
	sh3Zero
} from '../../../../src/math/SphericalHarmonics3Functions.js';
import { SphericalHarmonics3 } from '../../../../src/math/SphericalHarmonics3.js';
import { Vector3 } from '../../../../src/math/Vector3.js';
import { eps } from '../../utils/math-constants.js';

function setCoefficients( sh, values ) {

	for ( let i = 0; i < 9; i ++ ) {

		const c = sh.coefficients[ i ];
		const v = values[ i ];
		c.x = v[ 0 ];
		c.y = v[ 1 ];
		c.z = v[ 2 ];

	}

	return sh;

}

function sampleCoefficients( scale = 1 ) {

	const values = [];

	for ( let i = 0; i < 9; i ++ ) {

		values.push( [ ( i + 1 ) * scale, ( i + 2 ) * scale, ( i + 3 ) * scale ] );

	}

	return values;

}

function shLikeEquals( a, b, tolerance = eps ) {

	for ( let i = 0; i < 9; i ++ ) {

		const ca = a.coefficients[ i ];
		const cb = b.coefficients[ i ];

		if (
			Math.abs( ca.x - cb.x ) > tolerance ||
			Math.abs( ca.y - cb.y ) > tolerance ||
			Math.abs( ca.z - cb.z ) > tolerance
		) {

			return false;

		}

	}

	return true;

}

function vec3LikeEquals( a, b, tolerance = eps ) {

	return Math.abs( a.x - b.x ) <= tolerance &&
		Math.abs( a.y - b.y ) <= tolerance &&
		Math.abs( a.z - b.z ) <= tolerance;

}

export default QUnit.module( 'Maths', () => {

	QUnit.module( 'SphericalHarmonics3Functions', () => {

		QUnit.test( 'sh3Create is a plain SphericalHarmonics3Like, not a SphericalHarmonics3 instance', ( assert ) => {

			const sh = sh3Create();

			assert.ok( Array.isArray( sh.coefficients ), 'has a coefficients array' );
			assert.strictEqual( sh.coefficients.length, 9, 'has 9 coefficients' );
			assert.notOk( sh.isSphericalHarmonics3, 'is not branded as a SphericalHarmonics3' );
			assert.ok( sh3Equals( sh, new SphericalHarmonics3() ), 'is numerically a zero SH' );

			for ( let i = 0; i < 9; i ++ ) {

				const c = sh.coefficients[ i ];
				assert.strictEqual( c.x, 0, 'coefficient x is 0' );
				assert.strictEqual( c.y, 0, 'coefficient y is 0' );
				assert.strictEqual( c.z, 0, 'coefficient z is 0' );
				assert.notOk( c.isVector3, 'coefficient is a plain Vector3Like' );

			}

		} );

		QUnit.test( 'operations work on plain objects without importing SphericalHarmonics3', ( assert ) => {

			const a = setCoefficients( sh3Create(), sampleCoefficients( 1 ) );
			const b = setCoefficients( sh3Create(), sampleCoefficients( 2 ) );

			const sum = sh3Add( a, b );
			const scaled = sh3Scale( a, 3 );
			const lerped = sh3Lerp( a, b, 0.25 );

			assert.ok( ! sum.isSphericalHarmonics3, 'add result is a plain SphericalHarmonics3Like' );
			assert.ok( ! scaled.isSphericalHarmonics3, 'scale result is a plain SphericalHarmonics3Like' );
			assert.ok( ! lerped.isSphericalHarmonics3, 'lerp result is a plain SphericalHarmonics3Like' );

			const classA = new SphericalHarmonics3().fromArray( sh3ToArray( a ) );
			const classB = new SphericalHarmonics3().fromArray( sh3ToArray( b ) );

			assert.ok( shLikeEquals( sum, classA.clone().add( classB ) ), 'add matches the class result' );
			assert.ok( shLikeEquals( scaled, classA.clone().scale( 3 ) ), 'scale matches the class result' );
			assert.ok( shLikeEquals( lerped, classA.clone().lerp( classB, 0.25 ) ), 'lerp matches the class result' );

			const normal = { x: 0, y: 1, z: 0 };
			const radiance = sh3GetAt( a, normal );
			const irradiance = sh3GetIrradianceAt( a, normal );

			assert.ok( ! radiance.isVector3, 'getAt result is a plain Vector3Like' );
			assert.ok( vec3LikeEquals( radiance, classA.getAt( new Vector3( 0, 1, 0 ), new Vector3() ) ), 'getAt matches the class result' );
			assert.ok( vec3LikeEquals( irradiance, classA.getIrradianceAt( new Vector3( 0, 1, 0 ), new Vector3() ) ), 'getIrradianceAt matches the class result' );

		} );

		QUnit.test( 'omitting the target allocates a new SphericalHarmonics3Like, providing one reuses it', ( assert ) => {

			const source = setCoefficients( sh3Create(), sampleCoefficients( 1 ) );

			const allocated = sh3Copy( source );
			assert.notStrictEqual( allocated, source, 'a new object is allocated' );
			assert.ok( shLikeEquals( allocated, source ), 'the allocated copy matches the source' );

			const reused = sh3Create();
			const returned = sh3Copy( source, reused );
			assert.strictEqual( returned, reused, 'the provided target is returned' );
			assert.ok( shLikeEquals( reused, source ), 'the provided target holds the result' );

			const zeroed = sh3Zero();
			assert.ok( sh3Equals( zeroed, sh3Create() ), 'zero allocates a zeroed SH' );

			const setTarget = sh3Create();
			assert.strictEqual( sh3Set( source.coefficients, setTarget ), setTarget, 'set reuses target' );
			assert.ok( shLikeEquals( setTarget, source ), 'set writes into target' );

		} );

		QUnit.test( 'add and scale are safe when the target aliases an input', ( assert ) => {

			const a = setCoefficients( sh3Create(), sampleCoefficients( 1 ) );
			const b = setCoefficients( sh3Create(), sampleCoefficients( 2 ) );
			const expectedAdd = sh3Add( a, b );
			const expectedScale = sh3Scale( a, 4 );
			const expectedAddScaled = sh3AddScaledSH( a, b, 0.5 );

			const aliasA = sh3Copy( a );
			sh3Add( aliasA, b, aliasA );
			assert.ok( shLikeEquals( aliasA, expectedAdd ), 'add is safe when target aliases the first argument' );

			const aliasB = sh3Copy( b );
			sh3Add( a, aliasB, aliasB );
			assert.ok( shLikeEquals( aliasB, expectedAdd ), 'add is safe when target aliases the second argument' );

			const aliasScale = sh3Copy( a );
			sh3Scale( aliasScale, 4, aliasScale );
			assert.ok( shLikeEquals( aliasScale, expectedScale ), 'scale is safe when target aliases the input' );

			const aliasAddScaled = sh3Copy( a );
			sh3AddScaledSH( aliasAddScaled, b, 0.5, aliasAddScaled );
			assert.ok( shLikeEquals( aliasAddScaled, expectedAddScaled ), 'addScaledSH is safe when target aliases the first argument' );

		} );

		QUnit.test( 'fromArray and toArray round-trip on plain objects and typed arrays', ( assert ) => {

			const values = [];
			for ( let i = 0; i < 27; i ++ ) values.push( i + 0.5 );

			const sh = sh3FromArray( values );
			assert.ok( ! sh.isSphericalHarmonics3, 'fromArray result is a plain SphericalHarmonics3Like' );
			assert.deepEqual( sh3ToArray( sh ), values, 'toArray round-trips array values' );

			const typed = new Float32Array( 30 );
			sh3FromArray( values, 0, sh );
			sh3ToArray( sh, typed, 3 );

			for ( let i = 0; i < 27; i ++ ) {

				assert.strictEqual( typed[ i + 3 ], values[ i ], 'toArray writes into a typed array with offset' );

			}

			const fromTyped = sh3FromArray( typed, 3 );
			assert.ok( shLikeEquals( fromTyped, sh ), 'fromArray reads a typed array with offset' );

		} );

		QUnit.test( 'getBasisAt matches the class static method', ( assert ) => {

			const normal = { x: 0.36, y: - 0.48, z: 0.8 };
			const functionalBasis = new Array( 9 );
			const classBasis = new Array( 9 );

			sh3GetBasisAt( normal, functionalBasis );
			SphericalHarmonics3.getBasisAt( new Vector3( 0.36, - 0.48, 0.8 ), classBasis );

			for ( let i = 0; i < 9; i ++ ) {

				assert.ok( Math.abs( functionalBasis[ i ] - classBasis[ i ] ) <= eps, 'basis coefficient ' + i );

			}

		} );

		QUnit.test( 'equals compares coefficient components', ( assert ) => {

			const a = setCoefficients( sh3Create(), sampleCoefficients( 1 ) );
			const b = sh3Copy( a );
			const c = setCoefficients( sh3Create(), sampleCoefficients( 2 ) );

			assert.ok( sh3Equals( a, b ), 'equal SH compare equal' );
			assert.notOk( sh3Equals( a, c ), 'unequal SH compare unequal' );

		} );

	} );

} );
