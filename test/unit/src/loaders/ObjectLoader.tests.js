import { ObjectLoader } from '../../../../src/loaders/ObjectLoader.js';

import { Loader } from '../../../../src/loaders/Loader.js';
import { Object3D } from '../../../../src/core/Object3D.js';
import { DirectionalLight } from '../../../../src/lights/DirectionalLight.js';
import { SpotLight } from '../../../../src/lights/SpotLight.js';
import { Vector3 } from '../../../../src/math/Vector3.js';
import { eps } from '../../utils/math-constants.js';

const matrixEquals4 = ( a, b ) => {

	return a.elements.every( ( value, i ) => Number.isFinite( value ) && Number.isFinite( b.elements[ i ] ) && Math.abs( value - b.elements[ i ] ) < eps );

};

export default QUnit.module( 'Loaders', () => {

	QUnit.module( 'ObjectLoader', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new ObjectLoader();
			assert.strictEqual(
				object instanceof Loader, true,
				'ObjectLoader extends from Loader'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new ObjectLoader();
			assert.ok( object, 'Can instantiate an ObjectLoader.' );

		} );

		// PUBLIC
		QUnit.test( 'parse (pivot)', ( assert ) => {

			const scales = [ new Vector3( 2, 3, 4 ), new Vector3( - 2, 3, 4 ), new Vector3( 2, - 3, 4 ), new Vector3( 2, 3, - 4 ) ];

			for ( const scale of scales ) {

				const object = new Object3D();
				object.position.set( 2, - 3, 4 );
				object.rotation.set( 0.3, - 0.7, 1.2 );
				object.scale.copy( scale );
				object.pivot = new Vector3( 1, - 2, 3 );
				object.updateMatrix();

				const json = JSON.parse( JSON.stringify( object.toJSON() ) );
				const loaded = new ObjectLoader().parse( json );
				loaded.updateMatrix();

				assert.deepEqual( loaded.pivot.toArray(), object.pivot.toArray(), 'pivot is restored' );
				assert.ok( loaded.position.distanceTo( object.position ) < eps, 'position is restored' );
				assert.ok( matrixEquals4( loaded.matrix, object.matrix ), `The matrix is unchanged after updateMatrix() with scale ${scale.toArray()}` );

			}

		} );

		QUnit.test( 'parse (pivot, manual matrix)', ( assert ) => {

			const object = new Object3D();
			object.position.set( 2, - 3, 4 );
			object.rotation.set( 0.3, - 0.7, 1.2 );
			object.scale.set( - 2, 3, 4 );
			object.pivot = new Vector3( 1, - 2, 3 );
			object.updateMatrix();
			object.matrixAutoUpdate = false;
			object.position.set( 100, 200, 300 );
			object.rotation.set( 0, 0, 0 );
			object.scale.set( 1, 1, 1 );

			const json = JSON.parse( JSON.stringify( object.toJSON() ) );
			const loaded = new ObjectLoader().parse( json );
			loaded.updateMatrixWorld( true );

			assert.strictEqual( loaded.matrixAutoUpdate, false, 'matrixAutoUpdate is restored' );
			assert.deepEqual( loaded.pivot.toArray(), object.pivot.toArray(), 'pivot is restored' );
			assert.deepEqual( loaded.position.toArray(), [ 0, 0, 0 ], 'The manual matrix is not decomposed into position' );
			assert.deepEqual( loaded.quaternion.toArray(), [ 0, 0, 0, 1 ], 'The manual matrix is not decomposed into quaternion' );
			assert.deepEqual( loaded.scale.toArray(), [ 1, 1, 1 ], 'The manual matrix is not decomposed into scale' );
			assert.ok( matrixEquals4( loaded.matrix, object.matrix ), 'The manual matrix is restored' );
			assert.ok( matrixEquals4( loaded.matrixWorld, object.matrix ), 'Updating the world matrix preserves the manual matrix' );

		} );

		QUnit.test( 'parse (pivot, lights)', ( assert ) => {

			for ( const object of [ new DirectionalLight(), new SpotLight() ] ) {

				object.position.set( 2, - 3, 4 );
				object.rotation.set( 0.3, - 0.7, 1.2 );
				object.pivot = new Vector3( 1, - 2, 3 );
				object.updateMatrix();

				const json = JSON.parse( JSON.stringify( object.toJSON() ) );
				const loaded = new ObjectLoader().parse( json );
				loaded.updateMatrix();

				assert.strictEqual( loaded.type, object.type, 'The light type is restored' );
				assert.ok( loaded.position.distanceTo( object.position ) < eps, 'The saved position replaces the light constructor position' );
				assert.ok( matrixEquals4( loaded.matrix, object.matrix ), 'The light matrix is unchanged after updateMatrix()' );

			}

		} );

		QUnit.test( 'parse (null and zero pivot)', ( assert ) => {

			for ( const pivot of [ null, new Vector3() ] ) {

				const object = new Object3D();
				object.position.set( 2, - 3, 4 );
				object.rotation.set( 0.3, - 0.7, 1.2 );
				object.scale.set( 2, 3, 4 );
				object.pivot = pivot;
				object.updateMatrix();

				const json = JSON.parse( JSON.stringify( object.toJSON() ) );
				const loaded = new ObjectLoader().parse( json );
				loaded.updateMatrix();

				assert.deepEqual( loaded.pivot, pivot, 'Null or zero pivot is restored' );
				assert.ok( loaded.position.distanceTo( object.position ) < eps, 'position is restored' );
				assert.ok( matrixEquals4( loaded.matrix, object.matrix ), 'The matrix is unchanged with null or zero pivot' );

			}

		} );

		QUnit.test( 'parse (legacy position, rotation and scale)', ( assert ) => {

			for ( const pivot of [ null, new Vector3(), new Vector3( 1, - 2, 3 ) ] ) {

				const object = new Object3D();
				object.position.set( 2, - 3, 4 );
				object.rotation.set( 0.3, - 0.7, 1.2 );
				object.scale.set( - 2, 3, 4 );
				object.pivot = pivot;
				object.updateMatrix();

				const json = JSON.parse( JSON.stringify( object.toJSON() ) );
				delete json.object.matrix;
				json.object.position = object.position.toArray();
				json.object.quaternion = object.quaternion.toArray();
				json.object.scale = object.scale.toArray();

				const loaded = new ObjectLoader().parse( json );
				loaded.updateMatrix();

				assert.deepEqual( loaded.pivot, pivot, 'Legacy pivot is restored' );
				assert.deepEqual( loaded.position, object.position, 'Legacy position is restored' );
				assert.ok( matrixEquals4( loaded.matrix, object.matrix ), 'Legacy transforms reproduce the matrix' );

			}

		} );

	} );

} );
