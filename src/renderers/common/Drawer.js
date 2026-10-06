import { Frustum } from '../../math/Frustum.js';
import { FrustumArray } from '../../math/FrustumArray.js';
import { Matrix4 } from '../../math/Matrix4.js';
import { Vector4 } from '../../math/Vector4.js';
import { error } from '../../utils.js';

const _vector4 = /*@__PURE__*/ new Vector4();

/**
 * Decides which objects of a scene are rendered and how they are submitted to the render list.
 * The default implementation performs frustum culling and pushes every renderable object as a
 * separate render item. Subclasses can override the hooks {@link Drawer#isCulled} and
 * {@link Drawer#pushRenderItem} to implement other strategies like merging objects into
 * instanced draws.
 *
 * This class is experimental and its interface might change.
 */
class Drawer {

	/**
	 * Constructs a new drawer.
	 */
	constructor() {

		/**
		 * The renderer this drawer is assigned to. It is set when
		 * the drawer is assigned via {@link Renderer#drawer}.
		 *
		 * @type {?Renderer}
		 * @default null
		 */
		this.renderer = null;

		/**
		 * The frustum of the current camera.
		 *
		 * @protected
		 * @type {Frustum}
		 */
		this._frustum = new Frustum();

		/**
		 * The frustum array of the current array camera.
		 *
		 * @protected
		 * @type {FrustumArray}
		 */
		this._frustumArray = new FrustumArray();

		/**
		 * The view projection matrix of the current camera.
		 *
		 * @protected
		 * @type {Matrix4}
		 */
		this._projScreenMatrix = new Matrix4();

		/**
		 * The number of render bundles being recorded in the current projection.
		 *
		 * @protected
		 * @type {number}
		 * @default 0
		 */
		this._bundleDepth = 0;

	}

	/**
	 * Prepares the drawer for projecting a scene with the given camera.
	 *
	 * @param {Camera} camera - The camera.
	 */
	begin( camera ) {

		this._projScreenMatrix.multiplyMatrices( camera.projectionMatrix, camera.matrixWorldInverse );

		if ( camera.isArrayCamera ) {

			this._frustumArray.setFromArrayCamera( camera );

		} else {

			this._frustum.setFromProjectionMatrix( this._projScreenMatrix, camera.coordinateSystem, camera.reversedDepth );

		}

	}

	/**
	 * Begins the projection into the given render list.
	 *
	 * @param {RenderList} renderList - The render list.
	 */
	beginRenderList( renderList ) {

		renderList.begin();

	}

	/**
	 * Finishes the projection into the given render list.
	 *
	 * @param {RenderList} renderList - The render list.
	 */
	finishRenderList( renderList ) {

		renderList.finish();

	}

	/**
	 * Returns `true` if the given object is culled by the camera and should not be rendered.
	 * Objects of render bundles are not culled, a bundle is recorded once and drawn with
	 * any camera.
	 *
	 * @param {Object3D} object - The 3D object.
	 * @param {Camera} camera - The camera.
	 * @return {boolean} Whether the object is culled or not.
	 */
	isCulled( object, camera ) {

		if ( object.frustumCulled === false || this._bundleDepth > 0 ) return false;

		const frustum = camera.isArrayCamera ? this._frustumArray : this._frustum;

		return object.intersectsFrustum( frustum ) === false;

	}

	/**
	 * Pushes a render item to the render list.
	 *
	 * @param {RenderList} renderList - The current render list.
	 * @param {Object3D} object - The 3D object.
	 * @param {BufferGeometry} geometry - The 3D object's geometry.
	 * @param {Material} material - The 3D object's material.
	 * @param {number} groupOrder - The current group order.
	 * @param {number} z - The 3D object's depth value (z value in clip space).
	 * @param {?Object} group - Only relevant for objects using multiple materials. This represents a group entry from the respective `BufferGeometry`.
	 * @param {ClippingContext} clippingContext - The current clipping context.
	 * @return {?Object} The render item, or `null` if no render item was added.
	 */
	pushRenderItem( renderList, object, geometry, material, groupOrder, z, group, clippingContext ) {

		return renderList.push( object, geometry, material, groupOrder, z, group, clippingContext );

	}

	/**
	 * This method is used to traverse the scene graph and collect all renderable objects
	 * and lights into the given render list. Call {@link Drawer#begin} before.
	 *
	 * @param {Object3D} object - The 3D object to process (usually a scene).
	 * @param {Camera} camera - The camera the object should be rendered with.
	 * @param {number} groupOrder - The group order is derived from the `renderOrder` of groups and is used to group 3D objects within groups.
	 * @param {RenderList} renderList - The current render list.
	 * @param {ClippingContext} clippingContext - The current clipping context.
	 */
	project( object, camera, groupOrder, renderList, clippingContext ) {

		if ( object.visible === false ) return;

		const renderer = this.renderer;
		const visible = object.layers.test( camera.layers );

		if ( visible ) {

			if ( object.isGroup ) {

				groupOrder = object.renderOrder;

				if ( object.isClippingGroup && object.enabled ) clippingContext = clippingContext.getGroupContext( object );

			} else if ( object.isLOD ) {

				if ( object.autoUpdate === true ) object.update( camera );

			} else if ( object.isLight ) {

				renderList.pushLight( object );

			} else if ( object.isSprite ) {

				if ( this.isCulled( object, camera ) === false ) {

					if ( renderer.sortObjects === true ) {

						_vector4.setFromMatrixPosition( object.matrixWorld ).applyMatrix4( this._projScreenMatrix );

					}

					const { geometry, material } = object;

					if ( material.visible ) {

						this.pushRenderItem( renderList, object, geometry, material, groupOrder, _vector4.z, null, clippingContext );

					}

				}

			} else if ( object.isLineLoop ) {

				error( 'Renderer: Objects of type THREE.LineLoop are not supported. Please use THREE.Line or THREE.LineSegments.' );

			} else if ( object.isMesh || object.isLine || object.isPoints ) {

				if ( this.isCulled( object, camera ) === false ) {

					const { geometry, material } = object;

					if ( renderer.sortObjects === true ) {

						if ( geometry.boundingSphere === null ) geometry.computeBoundingSphere();

						_vector4
							.copy( geometry.boundingSphere.center )
							.applyMatrix4( object.matrixWorld )
							.applyMatrix4( this._projScreenMatrix );

					}

					if ( Array.isArray( material ) ) {

						const groups = geometry.groups;

						for ( let i = 0, l = groups.length; i < l; i ++ ) {

							const group = groups[ i ];
							const groupMaterial = material[ group.materialIndex ];

							if ( groupMaterial && groupMaterial.visible ) {

								this.pushRenderItem( renderList, object, geometry, groupMaterial, groupOrder, _vector4.z, group, clippingContext );

							}

						}

					} else if ( material.visible ) {

						this.pushRenderItem( renderList, object, geometry, material, groupOrder, _vector4.z, null, clippingContext );

					}

				}

			}

		}

		if ( object.isBundleGroup === true && renderer.backend.beginBundle !== undefined ) {

			const baseRenderList = renderList;

			// replace render list

			renderList = renderer._renderLists.get( object, camera, renderer.lighting );

			const renderBundle = renderer._bundles.get( object, camera, renderer._currentRenderContext );
			const renderBundleData = renderer.backend.get( renderBundle );
			const renderBundleNeedsUpdate = renderer._bundleNeedsUpdate( object, renderBundleData );

			if ( renderBundleNeedsUpdate ) {

				// update render list if necessary

				this.beginRenderList( renderList );

				if ( renderBundleData.renderObjects === undefined ) {

					renderBundleData.renderObjects = [];

				} else {

					renderBundleData.renderObjects.length = 0;

				}

				const children = object.children;

				this._bundleDepth ++;

				for ( let i = 0, l = children.length; i < l; i ++ ) {

					this.project( children[ i ], camera, groupOrder, renderList, clippingContext );

				}

				this._bundleDepth --;

				this.finishRenderList( renderList );

			}

			baseRenderList.pushBundle( {
				bundleGroup: object,
				camera,
				renderList,
			} );

			return;

		}

		//

		const children = object.children;

		for ( let i = 0, l = children.length; i < l; i ++ ) {

			this.project( children[ i ], camera, groupOrder, renderList, clippingContext );

		}

	}

}

export default Drawer;
