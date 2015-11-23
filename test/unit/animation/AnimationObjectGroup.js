/**
 * @author tschw
 */

module( "AnimationObjectGroup" );

var ObjectA = new THREE.Object3D(),
	ObjectB = new THREE.Object3D(),
	ObjectC = new THREE.Object3D(),

	PathA = 'object.position',
	PathB = 'object.rotation',
	PathC = 'object.scale',

	ParsedPathA = THREE.PropertyBinding.parseTrackName( PathA ),
	ParsedPathB = THREE.PropertyBinding.parseTrackName( PathB ),
	ParsedPathC = THREE.PropertyBinding.parseTrackName( PathC );


test( "smoke test", function() {

	var expect = function expect( testIndex, group, bindings, path, cached, roots ) {

		var rootNodes = [], pathsOk = true, nodesOk = true;

		for ( var i = group.nCachedObjects_, n = bindings.length; i !== n; ++ i ) {

			if ( bindings[ i ].path !== path ) pathsOk = false;
			rootNodes.push( bindings[ i ].rootNode );

		}

		for ( var i = 0, n = roots.length; i !== n; ++ i ) {

			if ( rootNodes.indexOf( roots[ i ] ) === -1 ) nodesOk = false;

		}

		ok( pathsOk, testIndex + " paths" );
		ok( nodesOk, testIndex + " nodes");
		ok( group.nCachedObjects_ === cached, testIndex + " cache size" );
		ok( bindings.length - group.nCachedObjects_ === roots.length, testIndex + " object count" );

	};

	// initial state

	var groupA = new THREE.AnimationObjectGroup();
	ok( groupA instanceof THREE.AnimationObjectGroup, "constructor (w/o args)" );

	var bindingsAA = groupA.subscribe_( PathA, ParsedPathA );
	expect( 0, groupA, bindingsAA, PathA, 0, [] );

	var groupB = new THREE.AnimationObjectGroup( ObjectA, ObjectB );
	ok( groupB instanceof THREE.AnimationObjectGroup, "constructor (with args)" );

	var bindingsBB = groupB.subscribe_( PathB, ParsedPathB );
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
	var bindingsAC = groupA.subscribe_( PathC, ParsedPathC );
	expect( 7, groupA, bindingsAC, PathC, 1, [ ObjectB, ObjectC ] );

	// re-add after subscribe

	var bindingsBC = groupB.subscribe_( PathC, ParsedPathC );
	groupB.add( ObjectA, ObjectB );
	expect( 8, groupB, bindingsBB, PathB, 1, [ ObjectA, ObjectB ] );

	// unsubscribe

	var copyOfBindingsBC = bindingsBC.slice();
	groupB.unsubscribe_( PathC );
	groupB.add( ObjectC );
	deepEqual( bindingsBC, copyOfBindingsBC, "no more update after unsubscribe" );

	// uncache active

	groupB.uncache( ObjectA );
	expect( 9, groupB, bindingsBB, PathB, 0, [ ObjectB, ObjectC ] );

	// uncache cached

	groupA.uncache( ObjectA );
	expect( 10, groupA, bindingsAC, PathC, 0, [ ObjectB, ObjectC ] );

} );

