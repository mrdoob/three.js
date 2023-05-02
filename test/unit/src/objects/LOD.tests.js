/* global QUnit */

import { Object3D } from '../../../../src/core/Object3D.js';
import { Raycaster } from '../../../../src/core/Raycaster.js';
import { LOD } from '../../../../src/objects/LOD.js';

export default QUnit.module( 'Objects', () => {

	QUnit.module( 'LOD', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const lod = new LOD();

			assert.strictEqual( ( lod instanceof Object3D ), true, 'LOD extends from Object3D' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( assert ) => {

			const object = new LOD();
			assert.ok(
				object.type === 'LOD',
				'LOD.type should be LOD'
			);

		} );

		QUnit.test( 'levels', ( assert ) => {

			const lod = new LOD();
			const levels = lod.levels;

			assert.strictEqual( Array.isArray( levels ), true, 'LOD.levels is of type array.' );
			assert.strictEqual( levels.length, 0, 'LOD.levels is empty by default.' );

		} );

		QUnit.test( 'autoUpdate', ( assert ) => {

			const lod = new LOD();

			assert.strictEqual( lod.autoUpdate, true, 'LOD.autoUpdate is of type boolean and true by default.' );

		} );

		// PUBLIC
		QUnit.test( 'isLOD', ( assert ) => {

			const lod = new LOD();

			assert.strictEqual( lod.isLOD, true, '.isLOD property is defined.' );

		} );

		QUnit.test( 'copy', ( assert ) => {

			const lod1 = new LOD();
			const lod2 = new LOD();

			const high = new Object3D();
			const mid = new Object3D();
			const low = new Object3D();

			lod1.addLevel( high, 5 );
			lod1.addLevel( mid, 25 );
			lod1.addLevel( low, 50 );

			lod1.autoUpdate = false;

			lod2.copy( lod1 );

			assert.strictEqual( lod2.autoUpdate, false, 'LOD.autoUpdate is correctly copied.' );
			assert.strictEqual( lod2.levels.length, 3, 'LOD.levels has the correct length after the copy.' );

		} );

		QUnit.test( 'addLevel', ( assert ) => {

			const lod = new LOD();

			const high = new Object3D();
			const mid = new Object3D();
			const low = new Object3D();

			lod.addLevel( high, 5, 0.00 );
			lod.addLevel( mid, 25, 0.05 );
			lod.addLevel( low, 50, 0.10 );

			assert.strictEqual( lod.levels.length, 3, 'LOD.levels has the correct length.' );
			assert.deepEqual( lod.levels[ 0 ], { distance: 5, object: high, hysteresis: 0.00 }, 'First entry correct.' );
			assert.deepEqual( lod.levels[ 1 ], { distance: 25, object: mid, hysteresis: 0.05 }, 'Second entry correct.' );
			assert.deepEqual( lod.levels[ 2 ], { distance: 50, object: low, hysteresis: 0.10 }, 'Third entry correct.' );

		} );

		QUnit.todo( 'getCurrentLevel', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'getObjectForDistance', ( assert ) => {

			const lod = new LOD();

			const high = new Object3D();
			const mid = new Object3D();
			const low = new Object3D();

			assert.strictEqual( lod.getObjectForDistance( 5 ), null, 'Returns null if no LOD levels are defined.' );

			lod.addLevel( high, 5 );

			assert.strictEqual( lod.getObjectForDistance( 0 ), high, 'Returns always the same object if only one LOD level is defined.' );
			assert.strictEqual( lod.getObjectForDistance( 10 ), high, 'Returns always the same object if only one LOD level is defined.' );

			lod.addLevel( mid, 25 );
			lod.addLevel( low, 50 );

			assert.strictEqual( lod.getObjectForDistance( 0 ), high, 'Returns the high resolution object.' );
			assert.strictEqual( lod.getObjectForDistance( 10 ), high, 'Returns the high resolution object.' );
			assert.strictEqual( lod.getObjectForDistance( 25 ), mid, 'Returns the mid resolution object.' );
			assert.strictEqual( lod.getObjectForDistance( 50 ), low, 'Returns the low resolution object.' );
			assert.strictEqual( lod.getObjectForDistance( 60 ), low, 'Returns the low resolution object.' );

		} );

		QUnit.test( 'raycast', ( assert ) => {

			const lod = new LOD();
			const raycaster = new Raycaster();
			const intersections = [];

			lod.raycast( raycaster, intersections );

			assert.strictEqual( intersections.length, 0, 'Does not fail if raycasting is used with a LOD object without levels.' );

		} );

		QUnit.todo( 'update', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'toJSON', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
