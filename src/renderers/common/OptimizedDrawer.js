import Drawer from './Drawer.js';
import InstanceGroup from './InstanceGroup.js';
import ChainMap from './ChainMap.js';
import { isTransparentMaterial } from './RenderList.js';
import { Object3D } from '../../core/Object3D.js';

const _chainKeys = [ null, null, null, null ];
const _noClippingContext = {};
const _objectTypeIds = new Map();

// number of projections of a render list after which an unused instance group is disposed
const _maxUnusedProjections = 60;

/**
 * Returns a key that identifies objects which can be merged into the same instanced draw, or `-1`
 * if the object can't be merged. Objects with per-object resources outside of the `object` uniform
 * group (skeletons, morph target influences, instance buffers, batches), per-object callbacks or
 * occlusion queries are never merged.
 *
 * @private
 * @param {Object3D} object - The 3D object.
 * @return {number} The instancing key.
 */
function getInstancingKey( object ) {

	if ( Array.isArray( object.material ) ) return - 1;
	if ( object.isInstancedMesh === true || object.isBatchedMesh === true || object.isSkinnedMesh === true ) return - 1;
	if ( object.count > 1 ) return - 1;
	if ( object.occlusionTest === true ) return - 1;
	if ( object.morphTargetInfluences !== undefined && object.morphTargetInfluences.length > 0 ) return - 1;
	if ( object.onBeforeRender !== Object3D.prototype.onBeforeRender || object.onAfterRender !== Object3D.prototype.onAfterRender ) return - 1;
	if ( object.onBeforeShadow !== Object3D.prototype.onBeforeShadow || object.onAfterShadow !== Object3D.prototype.onAfterShadow ) return - 1;

	let typeId = _objectTypeIds.get( object.type );

	if ( typeId === undefined ) {

		typeId = _objectTypeIds.size;

		_objectTypeIds.set( object.type, typeId );

	}

	return typeId * 4 + ( object.castShadow ? 2 : 0 ) + ( object.receiveShadow ? 1 : 0 );

}

/**
 * A drawer that applies performance optimizations when projecting a scene. This is the
 * default drawer of the renderer.
 *
 * - `instancing`: Merges compatible opaque objects into a single instanced draw call. Objects are
 * compatible if they share geometry, material, clipping context, render order and have no
 * per-object resources like skeletons, morph targets or instance buffers.
 *
 * ```js
 * renderer.drawer = new OptimizedDrawer( { instancing: false } ); // disable instancing
 * renderer.drawer = new Drawer(); // disable all optimizations
 * ```
 *
 * Custom render object functions (see {@link Renderer#setRenderObjectFunction}) receive the first object
 * of each group of merged objects. Render calls which select objects individually should use a {@link Drawer}.
 *
 * This class is experimental and its interface might change.
 *
 * @augments Drawer
 */
class OptimizedDrawer extends Drawer {

	/**
	 * Constructs a new optimized drawer.
	 *
	 * @param {Object} [parameters] - The configuration parameter.
	 * @param {boolean} [parameters.instancing=true] - Whether compatible objects should be merged into instanced draws or not.
	 */
	constructor( { instancing = true } = {} ) {

		super();

		/**
		 * Whether compatible objects should be merged into instanced draws or not.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.instancing = instancing;

		/**
		 * Holds the instancing groups per render list, material, geometry and clipping context.
		 *
		 * @private
		 * @type {ChainMap}
		 */
		this._instancingGroups = new ChainMap();

		/**
		 * Holds the instancing groups of each render list. Used to release the
		 * objects of groups which were not used during the last projection.
		 *
		 * @private
		 * @type {WeakMap<RenderList, Array<Object>>}
		 */
		this._renderListGroups = new WeakMap();

		/**
		 * Whether instancing is possible during the current projection.
		 *
		 * @private
		 * @type {boolean}
		 */
		this._instancingEnabled = false;

		/**
		 * Identifies the current projection.
		 *
		 * @private
		 * @type {number}
		 */
		this._projectionId = 0;

	}

	/**
	 * Prepares the drawer for projecting a scene with the given camera.
	 *
	 * @param {Camera} camera - The camera.
	 */
	begin( camera ) {

		super.begin( camera );

		// TODO: support the WebGL backend (per-instance uniforms are only implemented in WGSL yet)

		const backend = this.renderer.backend;

		// per-instance data is read from storage buffers in the vertex stage which might be unavailable in compatibility mode

		const hasVertexStorage = backend.isWebGPUBackend === true && ( backend.compatibilityMode !== true || backend.device.limits.maxStorageBuffersInVertexStage > 0 );

		this._instancingEnabled = this.instancing === true && hasVertexStorage;

		this._projectionId ++;

	}

	/**
	 * Finishes the projection into the given render list and releases the objects of
	 * instancing groups which were not used during this projection. Groups which were not
	 * used for several projections are disposed, which also disposes their render objects.
	 * Render lists of render bundles are only projected when the bundle is updated, so their
	 * groups keep their objects for replaying the bundle.
	 *
	 * @param {RenderList} renderList - The render list.
	 */
	finishRenderList( renderList ) {

		super.finishRenderList( renderList );

		const renderListGroups = this._renderListGroups.get( renderList );

		if ( renderListGroups === undefined ) return;

		for ( let i = renderListGroups.length - 1; i >= 0; i -- ) {

			const instancingGroup = renderListGroups[ i ];

			if ( instancingGroup.projectionId === this._projectionId ) {

				instancingGroup.unusedProjections = 0;

				continue;

			}

			instancingGroup.renderItem = null;
			instancingGroup.instances.objects.length = 0;

			if ( ++ instancingGroup.unusedProjections >= _maxUnusedProjections ) {

				instancingGroup.instances.dispose();
				instancingGroup.groups.delete( instancingGroup.key );

				renderListGroups.splice( i, 1 );

			}

		}

	}

	/**
	 * Pushes a render item to the render list or merges the object into the render item of a
	 * compatible object which was pushed before. The first render item of a group acts as the
	 * leader and holds the instance group.
	 *
	 * @param {RenderList} renderList - The current render list.
	 * @param {Object3D} object - The 3D object.
	 * @param {BufferGeometry} geometry - The 3D object's geometry.
	 * @param {Material} material - The 3D object's material.
	 * @param {number} groupOrder - The current group order.
	 * @param {number} z - The 3D object's depth value (z value in clip space).
	 * @param {?Object} group - Only relevant for objects using multiple materials. This represents a group entry from the respective `BufferGeometry`.
	 * @param {ClippingContext} clippingContext - The current clipping context.
	 * @return {?Object} The render item, or `null` if the object was merged into another render item.
	 */
	pushRenderItem( renderList, object, geometry, material, groupOrder, z, group, clippingContext ) {

		if ( this._instancingEnabled === false || isTransparentMaterial( material ) ) {

			return super.pushRenderItem( renderList, object, geometry, material, groupOrder, z, group, clippingContext );

		}

		const instancingKey = getInstancingKey( object );

		if ( instancingKey === - 1 ) {

			return super.pushRenderItem( renderList, object, geometry, material, groupOrder, z, group, clippingContext );

		}

		_chainKeys[ 0 ] = renderList;
		_chainKeys[ 1 ] = material;
		_chainKeys[ 2 ] = geometry;
		_chainKeys[ 3 ] = clippingContext || _noClippingContext;

		let groups = this._instancingGroups.get( _chainKeys );

		if ( groups === undefined ) {

			groups = new Map();

			this._instancingGroups.set( _chainKeys, groups );

		}

		_chainKeys[ 0 ] = null;
		_chainKeys[ 1 ] = null;
		_chainKeys[ 2 ] = null;
		_chainKeys[ 3 ] = null;

		let instancingGroup = groups.get( instancingKey );

		if ( instancingGroup === undefined ) {

			// the instance group is persistent so it can be used as a stable render object source

			instancingGroup = {
				projectionId: - 1,
				unusedProjections: 0,
				renderItem: null,
				instances: new InstanceGroup(),
				groups,
				key: instancingKey
			};

			groups.set( instancingKey, instancingGroup );

			let renderListGroups = this._renderListGroups.get( renderList );

			if ( renderListGroups === undefined ) {

				renderListGroups = [];

				this._renderListGroups.set( renderList, renderListGroups );

			}

			renderListGroups.push( instancingGroup );

		}

		const leader = instancingGroup.renderItem;

		if ( instancingGroup.projectionId === this._projectionId && leader.groupOrder === groupOrder && leader.renderOrder === object.renderOrder ) {

			if ( leader.instances === null ) {

				leader.instances = instancingGroup.instances;
				leader.instances.objects.push( leader.object );

			}

			leader.instances.objects.push( object );

			return null;

		}

		const renderItem = super.pushRenderItem( renderList, object, geometry, material, groupOrder, z, group, clippingContext );

		if ( instancingGroup.projectionId !== this._projectionId ) {

			instancingGroup.projectionId = this._projectionId;
			instancingGroup.renderItem = renderItem;
			instancingGroup.instances.objects.length = 0;

		}

		return renderItem;

	}

}

export default OptimizedDrawer;
