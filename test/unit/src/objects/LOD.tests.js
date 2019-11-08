/**
 * @author TristanVALCKE / https://github.com/Itee
 */
/* global QUnit */

import { Object3D } from '../../../../src/core/Object3D';
import { Raycaster } from '../../../../src/core/Raycaster';
import { LOD } from '../../../../src/objects/LOD';

export default QUnit.module( 'Objects', () => {

	QUnit.module( 'LOD', () => {

		// INHERITANCE
		QUnit.test( "Extending", ( assert ) => {

			var lod = new LOD();

			assert.strictEqual( ( lod instanceof Object3D ), true, "LOD extends from Object3D" );

		} );

		// PROPERTIES
		QUnit.test( "levels", ( assert ) => {

			var lod = new LOD();
			var levels = lod.levels;

			assert.strictEqual( Array.isArray( levels ), true, "LOD.levels is of type array." );
			assert.strictEqual( levels.length, 0, "LOD.levels is empty by default." );

		} );

		QUnit.test( "autoUpdate", ( assert ) => {

			var lod = new LOD();

			assert.strictEqual( lod.autoUpdate, true, "LOD.autoUpdate is of type boolean and true by default." );

		} );

		// PUBLIC STUFF
		QUnit.test( "isLOD", ( assert ) => {

			var lod = new LOD();

			assert.strictEqual( lod.isLOD, true, ".isLOD property is defined." );

		} );
		QUnit.test( "copy", ( assert ) => {

			var lod1 = new LOD();
			var lod2 = new LOD();

			var high = new Object3D();
			var mid = new Object3D();
			var low = new Object3D();

			lod1.addLevel( high, 5 );
			lod1.addLevel( mid, 25 );
			lod1.addLevel( low, 50 );

			lod1.autoUpdate = false;

			lod2.copy( lod1 );

			assert.strictEqual( lod2.autoUpdate, false, "LOD.autoUpdate is correctly copied." );
			assert.strictEqual( lod2.levels.length, 3, "LOD.levels has the correct length after the copy." );

		} );
		QUnit.test( "addLevel", ( assert ) => {

			var lod = new LOD();

			var high = new Object3D();
			var mid = new Object3D();
			var low = new Object3D();

			lod.addLevel( high, 5 );
			lod.addLevel( mid, 25 );
			lod.addLevel( low, 50 );

			assert.strictEqual( lod.levels.length, 3, "LOD.levels has the correct length." );
			assert.deepEqual( lod.levels[ 0 ], { distance: 5, object: high }, "First entry correct." );
			assert.deepEqual( lod.levels[ 1 ], { distance: 25, object: mid }, "Second entry correct." );
			assert.deepEqual( lod.levels[ 2 ], { distance: 50, object: low }, "Third entry correct." );

		} );
		QUnit.test( "getObjectForDistance", ( assert ) => {

			var lod = new LOD();

			var high = new Object3D();
			var mid = new Object3D();
			var low = new Object3D();

			assert.strictEqual( lod.getObjectForDistance( 5 ), null, "Returns null if no LOD levels are defined." );

			lod.addLevel( high, 5 );

			assert.strictEqual( lod.getObjectForDistance( 0 ), high, "Returns always the same object if only one LOD level is defined." );
			assert.strictEqual( lod.getObjectForDistance( 10 ), high, "Returns always the same object if only one LOD level is defined." );

			lod.addLevel( mid, 25 );
			lod.addLevel( low, 50 );

			assert.strictEqual( lod.getObjectForDistance( 0 ), high, "Returns the high resolution object." );
			assert.strictEqual( lod.getObjectForDistance( 10 ), high, "Returns the high resolution object." );
			assert.strictEqual( lod.getObjectForDistance( 25 ), mid, "Returns the mid resolution object." );
			assert.strictEqual( lod.getObjectForDistance( 50 ), low, "Returns the low resolution object." );
			assert.strictEqual( lod.getObjectForDistance( 60 ), low, "Returns the low resolution object." );

		} );
		QUnit.test( "raycast", ( assert ) => {

			var lod = new LOD();
			var raycaster = new Raycaster();
			var intersections = [];

			lod.raycast( raycaster, intersections );

			assert.strictEqual( intersections.length, 0, "Does not fail if raycasting is used with a LOD object without levels." );

		} );
		QUnit.todo( "update", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );
		QUnit.todo( "toJSON", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

	} );

} );
