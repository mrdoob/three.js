/**
 * @author mrdoob / http://mrdoob.com/
 */

function painterSortStable( a, b ) {

	if ( a.groupOrder !== b.groupOrder ) {

		return a.groupOrder - b.groupOrder;

	} else if ( a.renderOrder !== b.renderOrder ) {

		return a.renderOrder - b.renderOrder;

	} else if ( a.program !== b.program ) {

		return a.program.id - b.program.id;

	} else if ( a.material.id !== b.material.id ) {

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

	// lists containing groups of render items that are intended to be
	// rendered together in a specific order.
	const renderGroupStack = [];
	const renderGroupItems = [];
	let renderGroupItemIndex = 0;

	const renderItems = [];
	let renderItemsIndex = 0;

	const opaque = [];
	const transparent = [];

	const defaultProgram = { id: - 1 };

	let currOpaque = opaque;
	let currTransparent = transparent;

	function init() {

		renderGroupItemIndex = 0;
		renderItemsIndex = 0;

		renderGroupStack.length = 0;
		opaque.length = 0;
		transparent.length = 0;

		currOpaque = opaque;
		currTransparent = transparent;

	}

	function getNextRenderGroupItem( object ) {

		let renderGroupItem = renderGroupItems[ renderGroupItemIndex ];

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

	function pushRenderGroup( object ) {

		const renderGroupItem = getNextRenderGroupItem( object );

		currOpaque.push( renderGroupItem );
		currOpaque = renderGroupItem.opaque;
		currTransparent = renderGroupItem.transparent;

		renderGroupStack.push( renderGroupItem );

	}

	function popRenderGroup() {

		renderGroupStack.pop();
		if ( renderGroupStack.length !== 0 ) {

			currOpaque = renderGroupStack[ renderGroupStack.length - 1 ].opaque;
			currTransparent = renderGroupStack[ renderGroupStack.length - 1 ].transparent;

		} else {

			currOpaque = opaque;
			currTransparent = transparent;

		}

	}

	function getNextRenderItem( object, geometry, material, groupOrder, z, group ) {

		let renderItem = renderItems[ renderItemsIndex ];

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

		const renderItem = getNextRenderItem( object, geometry, material, groupOrder, z, group );

		( material.transparent === true ? currTransparent : currOpaque ).push( renderItem );

	}

	function unshift( object, geometry, material, groupOrder, z, group ) {

		const renderItem = getNextRenderItem( object, geometry, material, groupOrder, z, group );

		( material.transparent === true ? transparent : opaque ).unshift( renderItem );

	}

	function sort( customOpaqueSort, customTransparentSort ) {

		if ( opaque.length > 1 ) opaque.sort( customOpaqueSort || painterSortStable );
		if ( transparent.length > 1 ) transparent.sort( customTransparentSort || reversePainterSortStable );

		// sort render group item lists
		for ( var i = 0, l = renderItemsIndex; i < l; i ++ ) {

			var renderGroupItem = usedRenderGroups[ i ];
			var renderGroupOpaque = renderGroupItem.opaque;
			var renderGroupTransparent = renderGroupItem.transparent;

			if ( renderGroupOpaque.length > 1 ) {

				renderGroupOpaque.sort( customOpaqueSort || painterSortStable );

			}

			if ( renderGroupTransparent.length > 1 ) {

				renderGroupTransparent.sort( customTransparentSort || reversePainterSortStable );

			}

		}

	}

	function finish() {

		// Clear references from inactive renderItems in the list

		for ( let i = renderItemsIndex, il = renderItems.length; i < il; i ++ ) {

			const renderItem = renderItems[ i ];

			if ( renderItem.id === null ) break;

			renderItem.id = null;
			renderItem.object = null;
			renderItem.geometry = null;
			renderItem.material = null;
			renderItem.program = null;
			renderItem.group = null;

		}

	}

	return {

		// uncomment for "finish" tests
		// renderItems: renderItems,

		opaque: opaque,
		transparent: transparent,

		init: init,
		push: push,
		unshift: unshift,
		finish: finish,

		pushRenderGroup: pushRenderGroup,
		popRenderGroup: popRenderGroup,

		sort: sort
	};

}

function WebGLRenderLists() {

	let lists = new WeakMap();

	function onSceneDispose( event ) {

		const scene = event.target;

		scene.removeEventListener( 'dispose', onSceneDispose );

		lists.delete( scene );

	}

	function get( scene, camera ) {

		const cameras = lists.get( scene );
		let list;

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


export { WebGLRenderLists, WebGLRenderList };
