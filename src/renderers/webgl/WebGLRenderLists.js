function painterSortStable( a, b ) {

	if ( a.groupOrder !== b.groupOrder ) {

		return a.groupOrder - b.groupOrder;

	} else if ( a.renderOrder !== b.renderOrder ) {

		return a.renderOrder - b.renderOrder;

	} else if ( a.programId !== b.programId ) {

		return a.programId - b.programId;

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


function WebGLRenderList( properties ) {

	const renderItems = [];
	let renderItemsIndex = 0;

	const opaque = [];
	const transmissive = [];
	const transparent = [];

	function init() {

		renderItemsIndex = 0;

		opaque.length = 0;
		transmissive.length = 0;
		transparent.length = 0;

	}

	function getNextRenderItem( object, geometry, material, groupOrder, z, group ) {

		let renderItem = renderItems[ renderItemsIndex ];
		const program = properties.get( material ).currentProgram;

		if ( renderItem === undefined ) {

			renderItem = {
				id: object.id,
				object: object,
				geometry: geometry,
				material: material,
				groupOrder: groupOrder,
				renderOrder: object.renderOrder,
				z: z,
				group: group,
				programId: program ? program.id : 0
			};

			renderItems[ renderItemsIndex ] = renderItem;

		} else {

			renderItem.id = object.id;
			renderItem.object = object;
			renderItem.geometry = geometry;
			renderItem.material = material;
			renderItem.groupOrder = groupOrder;
			renderItem.renderOrder = object.renderOrder;
			renderItem.z = z;
			renderItem.group = group;
			renderItem.programId = program ? program.id : 0;

		}

		renderItemsIndex ++;

		return renderItem;

	}

	function push( object, geometry, material, groupOrder, z, group ) {

		const renderItem = getNextRenderItem( object, geometry, material, groupOrder, z, group );

		if ( material.transmission > 0.0 ) {

			transmissive.push( renderItem );

		} else if ( material.transparent === true ) {

			transparent.push( renderItem );

		} else {

			opaque.push( renderItem );

		}

	}

	function unshift( object, geometry, material, groupOrder, z, group ) {

		const renderItem = getNextRenderItem( object, geometry, material, groupOrder, z, group );

		if ( material.transmission > 0.0 ) {

			transmissive.unshift( renderItem );

		} else if ( material.transparent === true ) {

			transparent.unshift( renderItem );

		} else {

			opaque.unshift( renderItem );

		}

	}

	function sort( customOpaqueSort, customTransparentSort ) {

		if ( opaque.length > 1 ) opaque.sort( customOpaqueSort || painterSortStable );
		if ( transmissive.length > 1 ) transmissive.sort( customTransparentSort || reversePainterSortStable );
		if ( transparent.length > 1 ) transparent.sort( customTransparentSort || reversePainterSortStable );

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
			renderItem.group = null;

		}

	}

	return {

		opaque: opaque,
		transmissive: transmissive,
		transparent: transparent,

		init: init,
		push: push,
		unshift: unshift,
		finish: finish,

		sort: sort
	};

}

function WebGLRenderLists( properties ) {

	let lists = new WeakMap();

	function get( scene, renderCallDepth ) {

		const listArray = lists.get( scene );
		let list;

		if ( listArray === undefined ) {

			list = new WebGLRenderList( properties );
			lists.set( scene, [ list ] );

		} else {

			if ( renderCallDepth >= listArray.length ) {

				list = new WebGLRenderList( properties );
				listArray.push( list );

			} else {

				list = listArray[ renderCallDepth ];

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
