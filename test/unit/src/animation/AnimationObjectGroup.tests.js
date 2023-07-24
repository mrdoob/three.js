/* global QUnit */

import { AnimationObjectGroup } from '../../../../src/animation/AnimationObjectGroup.js';

import { Object3D } from '../../../../src/core/Object3D.js';
import { PropertyBinding } from '../../../../src/animation/PropertyBinding.js';

export default QUnit.module( 'Animation', () => {

	QUnit.module( 'AnimationObjectGroup', () => {

		const ObjectA = new Object3D(),
			ObjectB = new Object3D(),
			ObjectC = new Object3D(),

			PathA = 'object.position',
			PathB = 'object.rotation',
			PathC = 'object.scale',

			ParsedPathA = PropertyBinding.parseTrackName( PathA ),
			ParsedPathB = PropertyBinding.parseTrackName( PathB ),
			ParsedPathC = PropertyBinding.parseTrackName( PathC );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const groupA = new AnimationObjectGroup();
			assert.ok(
				groupA instanceof AnimationObjectGroup,
				'AnimationObjectGroup can be instanciated'
			);

		} );

		// PROPERTIES
		QUnit.todo( 'uuid', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'stats', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.test( 'isAnimationObjectGroup', ( assert ) => {

			const object = new AnimationObjectGroup();
			assert.ok(
				object.isAnimationObjectGroup,
				'AnimationObjectGroup.isAnimationObjectGroup should be true'
			);

		} );

		QUnit.todo( 'add', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'remove', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'uncache', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// OTHERS
		QUnit.test( 'smoke test', ( assert ) => {

			var expect = function expect( testIndex, group, bindings, path, cached, roots ) {

				var rootNodes = [], pathsOk = true, nodesOk = true;

				for ( var i = group.nCachedObjects_, n = bindings.length; i !== n; ++ i ) {

					if ( bindings[ i ].path !== path ) pathsOk = false;
					rootNodes.push( bindings[ i ].rootNode );

				}

				for ( var i = 0, n = roots.length; i !== n; ++ i ) {

					if ( rootNodes.indexOf( roots[ i ] ) === - 1 ) nodesOk = false;

				}

				assert.ok( pathsOk, QUnit.testIndex + ' paths' );
				assert.ok( nodesOk, QUnit.testIndex + ' nodes' );
				assert.ok( group.nCachedObjects_ === cached, QUnit.testIndex + ' cache size' );
				assert.ok( bindings.length - group.nCachedObjects_ === roots.length, QUnit.testIndex + ' object count' );

			};

			// initial state

			const groupA = new AnimationObjectGroup();
			assert.ok( groupA instanceof AnimationObjectGroup, 'constructor (w/o args)' );

			const bindingsAA = groupA.subscribe_( PathA, ParsedPathA );
			expect( 0, groupA, bindingsAA, PathA, 0, [] );

			const groupB = new AnimationObjectGroup( ObjectA, ObjectB );
			assert.ok( groupB instanceof AnimationObjectGroup, 'constructor (with args)' );

			const bindingsBB = groupB.subscribe_( PathB, ParsedPathB );
			expect( 1, groupB, bindingsBB, PathB, 0, [ ObjectA, ObjectB ] );

			// add

			groupA.add( ObjectA, ObjectB );
			expect( 2, groupA, bindingsAA, PathA, 0, [ ObjectA, ObjectB ] );

			groupB.add( ObjectC );
			expect( 3, groupB, bindingsBB, PathB, 0, [ ObjectA, ObjectB, ObjectC ] );

			// remove

			groupA.remove( ObjectA, ObjectC );
			expect( 4, groupA, bindingsAA, PathA, 1, [ ObjectB ] );

			groupB.remove( ObjectA, ObjectB, ObjectC );
			expect( 5, groupB, bindingsBB, PathB, 3, [] );

			// subscribe after re-add

			groupA.add( ObjectC );
			expect( 6, groupA, bindingsAA, PathA, 1, [ ObjectB, ObjectC ] );
			const bindingsAC = groupA.subscribe_( PathC, ParsedPathC );
			expect( 7, groupA, bindingsAC, PathC, 1, [ ObjectB, ObjectC ] );

			// re-add after subscribe

			const bindingsBC = groupB.subscribe_( PathC, ParsedPathC );
			groupB.add( ObjectA, ObjectB );
			expect( 8, groupB, bindingsBB, PathB, 1, [ ObjectA, ObjectB ] );

			// unsubscribe

			const copyOfBindingsBC = bindingsBC.slice();
			groupB.unsubscribe_( PathC );
			groupB.add( ObjectC );
			assert.deepEqual( bindingsBC, copyOfBindingsBC, 'no more update after unsubscribe' );

			// uncache active

			groupB.uncache( ObjectA );
			expect( 9, groupB, bindingsBB, PathB, 0, [ ObjectB, ObjectC ] );

			// uncache cached

			groupA.uncache( ObjectA );
			expect( 10, groupA, bindingsAC, PathC, 0, [ ObjectB, ObjectC ] );

		} );

	} );

} );
