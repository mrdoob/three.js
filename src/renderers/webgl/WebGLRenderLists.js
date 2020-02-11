/**
 * @author mrdoob / http://mrdoob.com/
 */

function painterSortStable( a, b ) {

	if ( a.groupOrder !== b.groupOrder ) {

		return a.groupOrder - b.groupOrder;

	} else if ( a.renderOrder !== b.renderOrder ) {

		return a.renderOrder - b.renderOrder;

	} else if ( a.program && b.program && a.program !== b.program ) {

		return a.program.id - b.program.id;

	} else if ( a.material && b.material && a.material.id !== b.material.id ) {

		return a.material.id - b.material.id;

	} else if ( a.z !== b.z ) {

		return a.z - b.z;

	} else {

		return a.id - b.id;

	}

}

function reversePainterSortStable( a, b ) {

	if ( a.groupOrder !== b.groupOrder ) {

		return a.groupOrder - b.groupOrder;

	} else if ( a.renderOrder !== b.renderOrder ) {

		return a.renderOrder - b.renderOrder;

	} else if ( a.z !== b.z ) {

		return b.z - a.z;

	} else {

		return a.id - b.id;

	}

}


function WebGLRenderList() {

	var transparentRenderGroupStack = [];
	var renderGroupStack = [];
	var renderGroupItems = [];
	var usedRenderGroups = [];
	var renderGroupItemIndex = 0;

	var renderItems = [];
	var renderItemsIndex = 0;

	var opaque = [];
	var transparent = [];

	var currOpaque = opaque;
	var currTransparent = transparent;

	var defaultProgram = { id: - 1 };

	function init() {

		renderGroupItemIndex = 0;
		renderItemsIndex = 0;

		usedRenderGroups.length = 0;
		renderGroupStack.length = 0;
		opaque.length = 0;
		transparent.length = 0;

		currOpaque = opaque;
		currTransparent = transparent;

	}

	function getNextRenderGroupItem( object ) {

		var renderGroupItem = renderGroupItems[ renderGroupItemIndex ];

		if ( renderGroupItem === undefined ) {

			renderGroupItem = {

				isRenderGroupItem: true,
				id: object.id,
				renderOrder: object.renderOrder,
				opaque: [],
				transparent: []

			};

			renderGroupItems[ renderGroupItemIndex ] = renderGroupItem;

		} else {

			renderGroupItem.id = object.id;
			renderGroupItem.renderOrder = object.renderOrder;
			renderGroupItem.opaque.length = 0;
			renderGroupItem.transparent.length = 0;

		}

		renderGroupItemIndex ++;

		return renderGroupItem;

	}

	function getNextRenderItem( object, geometry, material, groupOrder, z, group ) {

		var renderItem = renderItems[ renderItemsIndex ];

		if ( renderItem === undefined ) {

			renderItem = {
				id: object.id,
				object: object,
				geometry: geometry,
				material: material,
				program: material.program || defaultProgram,
				groupOrder: groupOrder,
				renderOrder: object.renderOrder,
				z: z,
				group: group
			};

			renderItems[ renderItemsIndex ] = renderItem;

		} else {

			renderItem.id = object.id;
			renderItem.object = object;
			renderItem.geometry = geometry;
			renderItem.material = material;
			renderItem.program = material.program || defaultProgram;
			renderItem.groupOrder = groupOrder;
			renderItem.renderOrder = object.renderOrder;
			renderItem.z = z;
			renderItem.group = group;

		}

		renderItemsIndex ++;

		return renderItem;

	}

	function push( object, geometry, material, groupOrder, z, group ) {

		var renderItem = getNextRenderItem( object, geometry, material, groupOrder, z, group );

		( material.transparent === true ? currTransparent : currOpaque ).push( renderItem );

	}

	function pushRenderGroup( object ) {

		var renderGroupItem = getNextRenderGroupItem( object );

		currOpaque.push( renderGroupItem );
		currOpaque = renderGroupItem.opaque;

		usedRenderGroups.push( renderGroupItem );
		renderGroupStack.push( renderGroupItem );

		if ( object.excludeTransparent === false ) {

			currTransparent = renderGroupItem.transparent;
			transparentRenderGroupStack.push( object );

		}

	}

	function popRenderGroup() {

		var removedItem = renderGroupStack.pop();
		currOpaque =
			renderGroupStack.length ?
				renderGroupStack[ renderGroupStack.length - 1 ].opaque :
				opaque;

		if ( transparentRenderGroupStack[ transparentRenderGroupStack.length - 1 ] === removedItem ) {

			transparentRenderGroupStack.pop();
			currTransparent =
				transparentRenderGroupStack ?
					transparentRenderGroupStack[ transparentRenderGroupStack.length - 1 ].transparent :
					transparent;

		}

	}

	function unshift( object, geometry, material, groupOrder, z, group ) {

		var renderItem = getNextRenderItem( object, geometry, material, groupOrder, z, group );

		( material.transparent === true ? transparent : opaque ).unshift( renderItem );

	}

	function sort( customOpaqueSort, customTransparentSort ) {

		if ( opaque.length > 1 ) opaque.sort( customOpaqueSort || painterSortStable );
		if ( transparent.length > 1 ) transparent.sort( customTransparentSort || reversePainterSortStable );

		for ( var i = 0, l = usedRenderGroups.length; i < l; i ++ ) {

			var renderGroupItem = usedRenderGroups[ i ];
			var renderGroupOpaque = renderGroupItem.opaque;
			var renderGroupTransparent = renderGroupItem.transparent;

			if ( renderGroupOpaque.length > 1 ) renderGroupOpaque.sort( customOpaqueSort || painterSortStable );
			if ( renderGroupTransparent.length > 1 ) renderGroupTransparent.sort( customTransparentSort || reversePainterSortStable );

		}

	}

	return {
		opaque: opaque,
		transparent: transparent,

		init: init,
		push: push,
		unshift: unshift,

		pushRenderGroup: pushRenderGroup,
		popRenderGroup: popRenderGroup,

		sort: sort
	};

}

function WebGLRenderLists() {

	var lists = new WeakMap();

	function onSceneDispose( event ) {

		var scene = event.target;

		scene.removeEventListener( 'dispose', onSceneDispose );

		lists.delete( scene );

	}

	function get( scene, camera ) {

		var cameras = lists.get( scene );
		var list;
		if ( cameras === undefined ) {

			list = new WebGLRenderList();
			lists.set( scene, new WeakMap() );
			lists.get( scene ).set( camera, list );

			scene.addEventListener( 'dispose', onSceneDispose );

		} else {

			list = cameras.get( camera );
			if ( list === undefined ) {

				list = new WebGLRenderList();
				cameras.set( camera, list );

			}

		}

		return list;

	}

	function dispose() {

		lists = new WeakMap();

	}

	return {
		get: get,
		dispose: dispose
	};

}


export { WebGLRenderLists };
