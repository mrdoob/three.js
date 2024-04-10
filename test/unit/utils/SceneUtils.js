/* global QUnit */

import { Object3D } from '../../../../src/core/Object3D.js';

export default QUnit.module( 'Utils', () => {

	QUnit.module( 'SceneUtils', () => {

		QUnit.test( 'traverse/traverseVisible/traverseAncestors generators', ( assert ) => {

			const a = new Object3D();
			const b = new Object3D();
			const c = new Object3D();
			const d = new Object3D();
			let generatedNames = [];
			const expectedNormal = [ 'parent', 'child', 'childchild 1', 'childchild 2' ];
			const expectedVisible = [ 'parent', 'child', 'childchild 2' ];
			const expectedAncestors = [ 'child', 'parent' ];

			a.name = 'parent';
			b.name = 'child';
			c.name = 'childchild 1';
			c.visible = false;
			d.name = 'childchild 2';

			b.add( c );
			b.add( d );
			a.add( b );

			generatedNames = Array.from( a.traverseGenerator() ).map( obj => obj.name );
			assert.deepEqual( generatedNames, expectedNormal, 'Traversed objects in expected order' );

			generatedNames = Array.from( a.traverseVisibleGenerator() ).map( obj => obj.name );
			assert.deepEqual( generatedNames, expectedVisible, 'Traversed visible objects in expected order' );

			generatedNames = Array.from( c.traverseAncestorsGenerator() ).map( obj => obj.name );
			assert.deepEqual( generatedNames, expectedAncestors, 'Traversed ancestors in expected order' );

		} );

	} );

} );
