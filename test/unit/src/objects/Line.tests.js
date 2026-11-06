import { assert, describe, test } from 'vitest';

import { Line } from '../../../../src/objects/Line.js';

import { Object3D } from '../../../../src/core/Object3D.js';
import { BufferGeometry } from '../../../../src/core/BufferGeometry.js';
import { Float32BufferAttribute } from '../../../../src/core/BufferAttribute.js';
import { Material } from '../../../../src/materials/Material.js';

describe( 'Objects', () => {

	describe( 'Line', () => {

		// INHERITANCE
		test( 'Extending', () => {

			const line = new Line();
			assert.strictEqual(
				line instanceof Object3D, true,
				'Line extends from Object3D'
			);

		} );

		// INSTANCING
		test( 'Instancing', () => {

			const object = new Line();
			assert.ok( object, 'Can instantiate a Line.' );

		} );

		// PROPERTIES
		test( 'type', () => {

			const object = new Line();
			assert.ok(
				object.type === 'Line',
				'Line.type should be Line'
			);

		} );

		// PUBLIC
		test( 'isLine', () => {

			const object = new Line();
			assert.ok(
				object.isLine,
				'Line.isLine should be true'
			);

		} );

		test( 'copy/material', () => {

			// Material arrays are cloned
			const mesh1 = new Line();
			mesh1.material = [ new Material() ];

			const copy1 = mesh1.clone();
			assert.notStrictEqual( mesh1.material, copy1.material );

			// Non arrays are not cloned
			const mesh2 = new Line();
			mesh1.material = new Material();
			const copy2 = mesh2.clone();
			assert.strictEqual( mesh2.material, copy2.material );

		} );

		test( 'copy/morphTargets', () => {

			const geometry = new BufferGeometry();
			geometry.setAttribute( 'position', new Float32BufferAttribute( [ 0, 0, 0, 1, 1, 1 ], 3 ) );
			geometry.morphAttributes.position = [ new Float32BufferAttribute( [ 1, 0, 0, 0, 1, 0 ], 3 ) ];
			geometry.morphAttributes.position[ 0 ].name = 'target';

			const line = new Line( geometry );
			line.morphTargetInfluences[ 0 ] = 0.5;

			const copy = line.clone();
			assert.deepEqual( copy.morphTargetInfluences, [ 0.5 ], 'morphTargetInfluences are copied' );
			assert.notStrictEqual( copy.morphTargetInfluences, line.morphTargetInfluences, 'morphTargetInfluences are not shared' );
			assert.deepEqual( copy.morphTargetDictionary, { target: 0 }, 'morphTargetDictionary is copied' );
			assert.notStrictEqual( copy.morphTargetDictionary, line.morphTargetDictionary, 'morphTargetDictionary is not shared' );

		} );

	} );

} );
