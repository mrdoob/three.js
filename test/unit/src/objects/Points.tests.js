import { Object3D } from '../../../../src/core/Object3D.js';
import { BufferGeometry } from '../../../../src/core/BufferGeometry.js';
import { Float32BufferAttribute } from '../../../../src/core/BufferAttribute.js';
import { Material } from '../../../../src/materials/Material.js';
import { Points } from '../../../../src/objects/Points.js';

export default QUnit.module( 'Objects', () => {

	QUnit.module( 'Points', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const points = new Points();
			assert.strictEqual(
				points instanceof Object3D, true,
				'Points extends from Object3D'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new Points();
			assert.ok( object, 'Can instantiate a Points.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( assert ) => {

			const object = new Points();
			assert.ok(
				object.type === 'Points',
				'Points.type should be Points'
			);

		} );

		// PUBLIC
		QUnit.test( 'isPoints', ( assert ) => {

			const object = new Points();
			assert.ok(
				object.isPoints,
				'Points.isPoints should be true'
			);

		} );

		QUnit.test( 'copy/material', ( assert ) => {

			// Material arrays are cloned
			const mesh1 = new Points();
			mesh1.material = [ new Material() ];

			const copy1 = mesh1.clone();
			assert.notStrictEqual( mesh1.material, copy1.material );

			// Non arrays are not cloned
			const mesh2 = new Points();
			mesh1.material = new Material();
			const copy2 = mesh2.clone();
			assert.strictEqual( mesh2.material, copy2.material );

		} );

		QUnit.test( 'copy/morphTargets', ( assert ) => {

			const geometry = new BufferGeometry();
			geometry.setAttribute( 'position', new Float32BufferAttribute( [ 0, 0, 0, 1, 1, 1 ], 3 ) );
			geometry.morphAttributes.position = [ new Float32BufferAttribute( [ 1, 0, 0, 0, 1, 0 ], 3 ) ];
			geometry.morphAttributes.position[ 0 ].name = 'target';

			const points = new Points( geometry );
			points.morphTargetInfluences[ 0 ] = 0.5;

			const copy = points.clone();
			assert.deepEqual( copy.morphTargetInfluences, [ 0.5 ], 'morphTargetInfluences are copied' );
			assert.notStrictEqual( copy.morphTargetInfluences, points.morphTargetInfluences, 'morphTargetInfluences are not shared' );
			assert.deepEqual( copy.morphTargetDictionary, { target: 0 }, 'morphTargetDictionary is copied' );
			assert.notStrictEqual( copy.morphTargetDictionary, points.morphTargetDictionary, 'morphTargetDictionary is not shared' );

		} );

	} );

} );
