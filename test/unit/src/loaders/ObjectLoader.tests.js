import { assert, describe, test } from 'vitest';

import { ObjectLoader } from '../../../../src/loaders/ObjectLoader.js';

import { Loader } from '../../../../src/loaders/Loader.js';
import { Object3D } from '../../../../src/core/Object3D.js';
import { Sprite } from '../../../../src/objects/Sprite.js';
import { Vector3 } from '../../../../src/math/Vector3.js';
import { eps } from '../../utils/math-constants.js';

describe( 'Loaders', () => {

	describe( 'ObjectLoader', () => {

		// INHERITANCE
		test( 'Extending', () => {

			const object = new ObjectLoader();
			assert.strictEqual(
				object instanceof Loader, true,
				'ObjectLoader extends from Loader'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const object = new ObjectLoader();
			assert.ok( object, 'Can instantiate an ObjectLoader.' );

		} );

		// PUBLIC
		test( 'parse (pivot)', () => {

			const object = new Object3D();
			object.position.set( 1, 2, 3 );
			object.rotation.set( 0.3, - 0.7, 1.2 );
			object.scale.set( 2, 3, 4 );
			object.pivot = new Vector3( 1, - 2, 3 );
			object.updateMatrix();

			const loaded = new ObjectLoader().parse( object.toJSON() );

			assert.ok( loaded.pivot.equals( object.pivot ), 'Pivot is restored' );
			assert.ok( loaded.position.distanceTo( object.position ) < eps, 'Position is restored' );

		} );

		test( 'parse (Sprite center)', () => {

			const sprite = new Sprite();
			sprite.center.set( 0.5, 0 );

			const loaded = new ObjectLoader().parse( sprite.toJSON() );

			assert.ok( loaded.center.equals( sprite.center ), 'Center is restored' );

		} );

	} );

} );
