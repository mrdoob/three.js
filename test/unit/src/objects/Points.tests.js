import { Object3D } from '../../../../src/core/Object3D.js';
import { BufferGeometry } from '../../../../src/core/BufferGeometry.js';
import { Float32BufferAttribute } from '../../../../src/core/BufferAttribute.js';
import { Material } from '../../../../src/materials/Material.js';
import { Points } from '../../../../src/objects/Points.js';
import { Raycaster } from '../../../../src/core/Raycaster.js';
import { Vector3 } from '../../../../src/math/Vector3.js';

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
		QUnit.test( 'raycast/non-uniform scale', ( assert ) => {

			for ( const indexed of [ false, true ] ) {

				const geometry = new BufferGeometry();
				geometry.setAttribute( 'position', new Float32BufferAttribute( [ 0, 0, 0 ], 3 ) );
				if ( indexed ) geometry.setIndex( [ 0 ] );

				const points = new Points( geometry );
				points.scale.set( 1, 1, 0.1 );
				points.updateMatrixWorld();

				const raycaster = new Raycaster( new Vector3( 0.12, - 1, 0 ), new Vector3( 0, 1, 0 ) );
				raycaster.params.Points.threshold = 0.1;

				const hits = raycaster.intersectObject( points );
				assert.strictEqual( hits.length, 1, `The bounding sphere preserves a per-point hit (indexed: ${ indexed })` );
				if ( hits.length > 0 ) assert.strictEqual( hits[ 0 ].index, 0 );
				assert.strictEqual( geometry.boundingSphere.radius, 0, 'Raycasting does not expand the geometry bound' );

			}

		} );

		QUnit.test( 'raycast/negative scale', ( assert ) => {

			const geometry = new BufferGeometry();
			geometry.setAttribute( 'position', new Float32BufferAttribute( [ 0, 0, 0 ], 3 ) );
			const points = new Points( geometry );
			points.scale.set( - 1, - 1, - 0.1 );
			points.updateMatrixWorld();

			const raycaster = new Raycaster( new Vector3( 0.12, - 1, 0 ), new Vector3( 0, 1, 0 ) );
			raycaster.params.Points.threshold = 0.1;
			assert.strictEqual( raycaster.intersectObject( points ).length, 1, 'Negative local threshold still has a positive radius' );

		} );

		QUnit.test( 'raycast/parent scale', ( assert ) => {

			const geometry = new BufferGeometry();
			geometry.setAttribute( 'position', new Float32BufferAttribute( [ 0, 0, 0 ], 3 ) );
			const points = new Points( geometry );
			const parent = new Object3D();
			parent.scale.setScalar( 2 );
			parent.add( points );
			parent.updateMatrixWorld();

			const raycaster = new Raycaster( new Vector3( 0.15, - 1, 0 ), new Vector3( 0, 1, 0 ) );
			raycaster.params.Points.threshold = 0.1;
			assert.strictEqual( raycaster.intersectObject( points ).length, 1, 'World-space bounds include inherited scaling' );

		} );

		QUnit.test( 'raycast/threshold and distance bounds', ( assert ) => {

			const geometry = new BufferGeometry();
			geometry.setAttribute( 'position', new Float32BufferAttribute( [ 0, 0, 0 ], 3 ) );
			const points = new Points( geometry );
			points.scale.set( 1, 1, 0.1 );
			points.updateMatrixWorld();

			const raycaster = new Raycaster( new Vector3( 0.15, - 1, 0 ), new Vector3( 0, 1, 0 ) );
			raycaster.params.Points.threshold = 0.1;
			assert.strictEqual( raycaster.intersectObject( points ).length, 0, 'A larger bound does not create a per-point hit' );

			raycaster.ray.origin.x = 0.12;
			raycaster.far = 0.9;
			assert.strictEqual( raycaster.intersectObject( points ).length, 0, 'Far clipping is preserved' );
			raycaster.far = Infinity;
			raycaster.near = 1.1;
			assert.strictEqual( raycaster.intersectObject( points ).length, 0, 'Near clipping is preserved' );

		} );

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
