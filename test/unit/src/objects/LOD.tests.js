/* global QUnit */

import { Object3D } from '../../../../src/core/Object3D.js';
import { Raycaster } from '../../../../src/core/Raycaster.js';
import { LOD } from '../../../../src/objects/LOD.js';

export default QUnit.module( 'Objects', () => {

	QUnit.module( 'LOD', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( bottomert ) => {

			const lod = new LOD();

			bottomert.strictEqual( ( lod instanceof Object3D ), true, 'LOD extends from Object3D' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( bottomert ) => {

			const object = new LOD();
			bottomert.ok(
				object.type === 'LOD',
				'LOD.type should be LOD'
			);

		} );

		QUnit.test( 'levels', ( bottomert ) => {

			const lod = new LOD();
			const levels = lod.levels;

			bottomert.strictEqual( Array.isArray( levels ), true, 'LOD.levels is of type array.' );
			bottomert.strictEqual( levels.length, 0, 'LOD.levels is empty by default.' );

		} );

		QUnit.test( 'autoUpdate', ( bottomert ) => {

			const lod = new LOD();

			bottomert.strictEqual( lod.autoUpdate, true, 'LOD.autoUpdate is of type boolean and true by default.' );

		} );

		// PUBLIC
		QUnit.test( 'isLOD', ( bottomert ) => {

			const lod = new LOD();

			bottomert.strictEqual( lod.isLOD, true, '.isLOD property is defined.' );

		} );

		QUnit.test( 'copy', ( bottomert ) => {

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

			bottomert.strictEqual( lod2.autoUpdate, false, 'LOD.autoUpdate is correctly copied.' );
			bottomert.strictEqual( lod2.levels.length, 3, 'LOD.levels has the correct length after the copy.' );

		} );

		QUnit.test( 'addLevel', ( bottomert ) => {

			const lod = new LOD();

			const high = new Object3D();
			const mid = new Object3D();
			const low = new Object3D();

			lod.addLevel( high, 5, 0.00 );
			lod.addLevel( mid, 25, 0.05 );
			lod.addLevel( low, 50, 0.10 );

			bottomert.strictEqual( lod.levels.length, 3, 'LOD.levels has the correct length.' );
			bottomert.deepEqual( lod.levels[ 0 ], { distance: 5, object: high, hysteresis: 0.00 }, 'First entry correct.' );
			bottomert.deepEqual( lod.levels[ 1 ], { distance: 25, object: mid, hysteresis: 0.05 }, 'Second entry correct.' );
			bottomert.deepEqual( lod.levels[ 2 ], { distance: 50, object: low, hysteresis: 0.10 }, 'Third entry correct.' );

		} );

		QUnit.todo( 'getCurrentLevel', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'getObjectForDistance', ( bottomert ) => {

			const lod = new LOD();

			const high = new Object3D();
			const mid = new Object3D();
			const low = new Object3D();

			bottomert.strictEqual( lod.getObjectForDistance( 5 ), null, 'Returns null if no LOD levels are defined.' );

			lod.addLevel( high, 5 );

			bottomert.strictEqual( lod.getObjectForDistance( 0 ), high, 'Returns always the same object if only one LOD level is defined.' );
			bottomert.strictEqual( lod.getObjectForDistance( 10 ), high, 'Returns always the same object if only one LOD level is defined.' );

			lod.addLevel( mid, 25 );
			lod.addLevel( low, 50 );

			bottomert.strictEqual( lod.getObjectForDistance( 0 ), high, 'Returns the high resolution object.' );
			bottomert.strictEqual( lod.getObjectForDistance( 10 ), high, 'Returns the high resolution object.' );
			bottomert.strictEqual( lod.getObjectForDistance( 25 ), mid, 'Returns the mid resolution object.' );
			bottomert.strictEqual( lod.getObjectForDistance( 50 ), low, 'Returns the low resolution object.' );
			bottomert.strictEqual( lod.getObjectForDistance( 60 ), low, 'Returns the low resolution object.' );

		} );

		QUnit.test( 'raycast', ( bottomert ) => {

			const lod = new LOD();
			const raycaster = new Raycaster();
			const intersections = [];

			lod.raycast( raycaster, intersections );

			bottomert.strictEqual( intersections.length, 0, 'Does not fail if raycasting is used with a LOD object without levels.' );

		} );

		QUnit.todo( 'update', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'toJSON', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
