import { LightsNode } from '../../nodes/Nodes.js';

function painterSortStable( a, b ) {

	if ( a.groupOrder !== b.groupOrder ) {

		return a.groupOrder - b.groupOrder;

	} else if ( a.renderOrder !== b.renderOrder ) {

		return a.renderOrder - b.renderOrder;

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

class RenderList {

	constructor() {

		this.renderItems = [];
		this.renderItemsIndex = 0;

		this.opaque = [];
		this.transparent = [];

		this.lightsNode = new LightsNode( [] );
		this.lightsArray = [];

		this.occlusionQueryCount = 0;

	}

	begin() {

		this.renderItemsIndex = 0;

		this.opaque.length = 0;
		this.transparent.length = 0;
		this.lightsArray.length = 0;

		this.occlusionQueryCount = 0;

		return this;

	}

	getNextRenderItem( object, geometry, material, groupOrder, z, group ) {

		let renderItem = this.renderItems[ this.renderItemsIndex ];

		if ( renderItem === undefined ) {

			renderItem = {
				id: object.id,
				object: object,
				geometry: geometry,
				material: material,
				groupOrder: groupOrder,
				renderOrder: object.renderOrder,
				z: z,
				group: group
			};

			this.renderItems[ this.renderItemsIndex ] = renderItem;

		} else {

			renderItem.id = object.id;
			renderItem.object = object;
			renderItem.geometry = geometry;
			renderItem.material = material;
			renderItem.groupOrder = groupOrder;
			renderItem.renderOrder = object.renderOrder;
			renderItem.z = z;
			renderItem.group = group;

		}

		this.renderItemsIndex ++;

		return renderItem;

	}

	push( object, geometry, material, groupOrder, z, group ) {

		const renderItem = this.getNextRenderItem( object, geometry, material, groupOrder, z, group );

		if ( object.occlusionTest === true ) this.occlusionQueryCount ++;

		( material.transparent === true || material.transmission > 0 ? this.transparent : this.opaque ).push( renderItem );

	}

	unshift( object, geometry, material, groupOrder, z, group ) {

		const renderItem = this.getNextRenderItem( object, geometry, material, groupOrder, z, group );

		( material.transparent === true ? this.transparent : this.opaque ).unshift( renderItem );

	}

	pushLight( light ) {

		this.lightsArray.push( light );

	}

	getLightsNode() {

		return this.lightsNode.fromLights( this.lightsArray );

	}

	sort( customOpaqueSort, customTransparentSort ) {

		if ( this.opaque.length > 1 ) this.opaque.sort( customOpaqueSort || painterSortStable );
		if ( this.transparent.length > 1 ) this.transparent.sort( customTransparentSort || reversePainterSortStable );

	}

	finish() {

		// update lights

		this.lightsNode.fromLights( this.lightsArray );

		// Clear references from inactive renderItems in the list

		for ( let i = this.renderItemsIndex, il = this.renderItems.length; i < il; i ++ ) {

			const renderItem = this.renderItems[ i ];

			if ( renderItem.id === null ) break;

			renderItem.id = null;
			renderItem.object = null;
			renderItem.geometry = null;
			renderItem.material = null;
			renderItem.groupOrder = null;
			renderItem.renderOrder = null;
			renderItem.z = null;
			renderItem.group = null;

		}

	}

}

export default RenderList;
