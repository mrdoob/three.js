import { DoubleSide } from '../../constants.js';

/**
 * Default sorting function for opaque render items.
 *
 * @private
 * @function
 * @param {Object} a - The first render item.
 * @param {Object} b - The second render item.
 * @return {number} A numeric value which defines the sort order.
 */
function painterSortStable( a, b ) {

	if ( a.groupOrder !== b.groupOrder ) {

		return a.groupOrder - b.groupOrder;

	} else if ( a.renderOrder !== b.renderOrder ) {

		return a.renderOrder - b.renderOrder;

	} else if ( a.z !== b.z ) {

		return a.z - b.z;

	} else {

		return a.id - b.id;

	}

}

/**
 * Default sorting function for transparent render items.
 *
 * @private
 * @function
 * @param {Object} a - The first render item.
 * @param {Object} b - The second render item.
 * @return {number} A numeric value which defines the sort order.
 */
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

/**
 * Returns `true` if the given transparent material requires a double pass.
 *
 * @private
 * @function
 * @param {Material} material - The transparent material.
 * @return {boolean} Whether the given material requires a double pass or not.
 */
function needsDoublePass( material ) {

	const hasTransmission = material.transmission > 0 || ( material.transmissionNode && material.transmissionNode.isNode );

	return hasTransmission && material.side === DoubleSide && material.forceSinglePass === false;

}

/**
 * When the renderer analyzes the scene at the beginning of a render call,
 * it stores 3D object for further processing in render lists. Depending on the
 * properties of a 3D objects (like their transformation or material state), the
 * objects are maintained in ordered lists for the actual rendering.
 *
 * Render lists are unique per scene and camera combination.
 *
 * @private
 * @augments Pipeline
 */
class RenderList {

	/**
	 * Constructs a render list.
	 *
	 * @param {Lighting} lighting - The lighting management component.
	 * @param {Scene} scene - The scene.
	 * @param {Camera} camera - The camera the scene is rendered with.
	 */
	constructor( lighting, scene, camera ) {

		/**
		 * 3D objects are transformed into render items and stored in this array.
		 *
		 * @type {Array<Object>}
		 */
		this.renderItems = [];

		/**
		 * The current render items index.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.renderItemsIndex = 0;

		/**
		 * A list with opaque render items.
		 *
		 * @type {Array<Object>}
		 */
		this.opaque = [];

		/**
		 * A list with transparent render items which require
		 * double pass rendering (e.g. transmissive objects).
		 *
		 * @type {Array<Object>}
		 */
		this.transparentDoublePass = [];

		/**
		 * A list with transparent render items.
		 *
		 * @type {Array<Object>}
		 */
		this.transparent = [];

		/**
		 * A list with transparent render bundle data.
		 *
		 * @type {Array<Object>}
		 */
		this.bundles = [];

		/**
		 * The render list's lights node. This node is later
		 * relevant for the actual analytical light nodes which
		 * compute the scene's lighting in the shader.
		 *
		 * @type {LightsNode}
		 */
		this.lightsNode = lighting.getNode( scene, camera );

		/**
		 * The scene's lights stored in an array. This array
		 * is used to setup the lights node.
		 *
		 * @type {Array<Light>}
		 */
		this.lightsArray = [];

		/**
		 * The scene.
		 *
		 * @type {Scene}
		 */
		this.scene = scene;

		/**
		 * The camera the scene is rendered with.
		 *
		 * @type {Camera}
		 */
		this.camera = camera;

		/**
		 * How many objects perform occlusion query tests.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.occlusionQueryCount = 0;

	}

	/**
	 * This method is called right at the beginning of a render call
	 * before the scene is analyzed. It prepares the internal data
	 * structures for the upcoming render lists generation.
	 *
	 * @return {RenderList} A reference to this render list.
	 */
	begin() {

		this.renderItemsIndex = 0;

		this.opaque.length = 0;
		this.transparentDoublePass.length = 0;
		this.transparent.length = 0;
		this.bundles.length = 0;

		this.lightsArray.length = 0;

		this.occlusionQueryCount = 0;

		return this;

	}

	/**
	 * Returns a render item for the giving render item state. The state is defined
	 * by a series of object-related parameters.
	 *
	 * The method avoids object creation by holding render items and reusing them in
	 * subsequent render calls (just with different property values).
	 *
	 * @param {Object3D} object - The 3D object.
	 * @param {BufferGeometry} geometry - The 3D object's geometry.
	 * @param {Material} material - The 3D object's material.
	 * @param {number} groupOrder - The current group order.
	 * @param {number} z - Th 3D object's depth value (z value in clip space).
	 * @param {?number} group - {?Object} group - Only relevant for objects using multiple materials. This represents a group entry from the respective `BufferGeometry`.
	 * @param {ClippingContext} clippingContext - The current clipping context.
	 * @return {Object} The render item.
	 */
	getNextRenderItem( object, geometry, material, groupOrder, z, group, clippingContext ) {

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
				group: group,
				clippingContext: clippingContext
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
			renderItem.clippingContext = clippingContext;

		}

		this.renderItemsIndex ++;

		return renderItem;

	}

	/**
	 * Pushes the given object as a render item to the internal render lists.
	 * The selected lists depend on the object properties.
	 *
	 * @param {Object3D} object - The 3D object.
	 * @param {BufferGeometry} geometry - The 3D object's geometry.
	 * @param {Material} material - The 3D object's material.
	 * @param {number} groupOrder - The current group order.
	 * @param {number} z - Th 3D object's depth value (z value in clip space).
	 * @param {?number} group - {?Object} group - Only relevant for objects using multiple materials. This represents a group entry from the respective `BufferGeometry`.
	 * @param {ClippingContext} clippingContext - The current clipping context.
	 */
	push( object, geometry, material, groupOrder, z, group, clippingContext ) {

		const renderItem = this.getNextRenderItem( object, geometry, material, groupOrder, z, group, clippingContext );

		if ( object.occlusionTest === true ) this.occlusionQueryCount ++;

		if ( material.transparent === true || material.transmission > 0 ||
			( material.transmissionNode && material.transmissionNode.isNode ) ||
			( material.backdropNode && material.backdropNode.isNode ) ) {

			if ( needsDoublePass( material ) ) this.transparentDoublePass.push( renderItem );

			this.transparent.push( renderItem );

		} else {

			this.opaque.push( renderItem );

		}

	}

	/**
	 * Inserts the given object as a render item at the start of the internal render lists.
	 * The selected lists depend on the object properties.
	 *
	 * @param {Object3D} object - The 3D object.
	 * @param {BufferGeometry} geometry - The 3D object's geometry.
	 * @param {Material} material - The 3D object's material.
	 * @param {number} groupOrder - The current group order.
	 * @param {number} z - Th 3D object's depth value (z value in clip space).
	 * @param {?number} group - {?Object} group - Only relevant for objects using multiple materials. This represents a group entry from the respective `BufferGeometry`.
	 * @param {ClippingContext} clippingContext - The current clipping context.
	 */
	unshift( object, geometry, material, groupOrder, z, group, clippingContext ) {

		const renderItem = this.getNextRenderItem( object, geometry, material, groupOrder, z, group, clippingContext );

		if ( material.transparent === true || material.transmission > 0 ||
			( material.transmissionNode && material.transmissionNode.isNode ) ||
			( material.backdropNode && material.backdropNode.isNode ) ) {

			if ( needsDoublePass( material ) ) this.transparentDoublePass.unshift( renderItem );

			this.transparent.unshift( renderItem );

		} else {

			this.opaque.unshift( renderItem );

		}

	}

	/**
	 * Pushes render bundle group data into the render list.
	 *
	 * @param {Object} group - Bundle group data.
	 */
	pushBundle( group ) {

		this.bundles.push( group );

	}

	/**
	 * Pushes a light into the render list.
	 *
	 * @param {Light} light - The light.
	 */
	pushLight( light ) {

		this.lightsArray.push( light );

	}

	/**
	 * Sorts the internal render lists.
	 *
	 * @param {?function(any, any): number} customOpaqueSort - A custom sort function for opaque objects.
	 * @param {?function(any, any): number} customTransparentSort -  A custom sort function for transparent objects.
	 */
	sort( customOpaqueSort, customTransparentSort ) {

		if ( this.opaque.length > 1 ) this.opaque.sort( customOpaqueSort || painterSortStable );
		if ( this.transparentDoublePass.length > 1 ) this.transparentDoublePass.sort( customTransparentSort || reversePainterSortStable );
		if ( this.transparent.length > 1 ) this.transparent.sort( customTransparentSort || reversePainterSortStable );

	}

	/**
	 * This method performs finalizing tasks right after the render lists
	 * have been generated.
	 */
	finish() {

		// update lights

		this.lightsNode.setLights( this.lightsArray );

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
			renderItem.clippingContext = null;

		}

	}

}

export default RenderList;
