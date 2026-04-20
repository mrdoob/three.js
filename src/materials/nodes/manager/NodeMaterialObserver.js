const refreshUniforms = [
	'alphaMap',
	'alphaTest',
	'anisotropy',
	'anisotropyMap',
	'anisotropyRotation',
	'aoMap',
	'aoMapIntensity',
	'attenuationColor',
	'attenuationDistance',
	'bumpMap',
	'clearcoat',
	'clearcoatMap',
	'clearcoatNormalMap',
	'clearcoatNormalScale',
	'clearcoatRoughness',
	'color',
	'dispersion',
	'displacementMap',
	'emissive',
	'emissiveIntensity',
	'emissiveMap',
	'envMap',
	'envMapIntensity',
	'gradientMap',
	'ior',
	'iridescence',
	'iridescenceIOR',
	'iridescenceMap',
	'iridescenceThicknessMap',
	'lightMap',
	'lightMapIntensity',
	'map',
	'matcap',
	'metalness',
	'metalnessMap',
	'normalMap',
	'normalScale',
	'opacity',
	'roughness',
	'roughnessMap',
	'sheen',
	'sheenColor',
	'sheenColorMap',
	'sheenRoughnessMap',
	'shininess',
	'specular',
	'specularColor',
	'specularColorMap',
	'specularIntensity',
	'specularIntensityMap',
	'specularMap',
	'thickness',
	'transmission',
	'transmissionMap'
];


/**
 * A WeakMap to cache lights data for node materials.
 * Cache lights data by render ID to avoid unnecessary recalculations.
 *
 * @private
 * @type {WeakMap<LightsNode,Object>}
 */
const _lightsCache = new WeakMap();

/**
 * Holds the material data for comparison.
 *
 * @private
 * @type {WeakMap<Material,Object>}
 */
const _materialCache = new WeakMap();

/**
 * Holds the geometry data for comparison.
 *
 * @private
 * @type {WeakMap<BufferGeometry,Object>}
 */
const _geometryCache = new WeakMap();

/**
 * This class is used by {@link WebGPURenderer} as management component.
 * It's primary purpose is to determine whether render objects require a
 * refresh right before they are going to be rendered or not.
 */
class NodeMaterialObserver {

	/**
	 * Constructs a new node material observer.
	 *
	 * @param {NodeBuilder} builder - The node builder.
	 */
	constructor( builder ) {

		/**
		 * A node material can be used by more than one render object so the
		 * monitor must maintain a list of render objects.
		 *
		 * @type {WeakMap<RenderObject,Object>}
		 */
		this.renderObjects = new WeakMap();

		/**
		 * Whether the material uses node objects or not.
		 *
		 * @type {boolean}
		 */
		this.hasNode = this.containsNode( builder );

		/**
		 * Whether the node builder's 3D object is animated or not.
		 *
		 * @type {boolean}
		 */
		this.hasAnimation = builder.object.isSkinnedMesh === true;

		/**
		 * A list of all possible material uniforms
		 *
		 * @type {Array<string>}
		 */
		this.refreshUniforms = refreshUniforms;

		/**
		 * Holds the current render ID from the node frame.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.renderId = 0;

	}

	/**
	 * Returns `true` if the given render object is verified for the first time of this observer.
	 *
	 * @param {RenderObject} renderObject - The render object.
	 * @return {boolean} Whether the given render object is verified for the first time of this observer.
	 */
	firstInitialization( renderObject ) {

		const hasInitialized = this.renderObjects.has( renderObject );

		if ( hasInitialized === false ) {

			this.getRenderObjectData( renderObject );

			return true;

		}

		return false;

	}

	/**
	 * Returns `true` if the current rendering produces motion vectors.
	 *
	 * @param {Renderer} renderer - The renderer.
	 * @return {boolean} Whether the current rendering produces motion vectors or not.
	 */
	needsVelocity( renderer ) {

		const mrt = renderer.getMRT();

		return ( mrt !== null && mrt.has( 'velocity' ) );

	}

	/**
	 * Returns monitoring data for the given render object.
	 *
	 * @param {RenderObject} renderObject - The render object.
	 * @return {Object} The monitoring data.
	 */
	getRenderObjectData( renderObject ) {

		let data = this.renderObjects.get( renderObject );

		if ( data === undefined ) {

			const { geometry, object } = renderObject;

			data = {
				geometryId: geometry.id,
				worldMatrix: object.matrixWorld.clone()
			};

			if ( object.center ) {

				data.center = object.center.clone();

			}

			if ( object.morphTargetInfluences ) {

				data.morphTargetInfluences = object.morphTargetInfluences.slice();

			}

			if ( renderObject.bundle !== null ) {

				data.version = renderObject.bundle.version;

			}

			if ( renderObject.material.transmission > 0 ) {

				const { width, height } = renderObject.context;

				data.bufferWidth = width;
				data.bufferHeight = height;

			}

			data.lights = this.getLightsData( renderObject.lightsNode.getLights() );

			this.renderObjects.set( renderObject, data );

		}

		return data;

	}

	/**
	 * Returns an attribute data structure holding the attributes versions for
	 * monitoring.
	 *
	 * @param {Object} attributes - The geometry attributes.
	 * @return {Object} An object for monitoring the versions of attributes.
	 */
	getAttributesData( attributes ) {

		const attributesData = {};

		for ( const name in attributes ) {

			const attribute = attributes[ name ];

			attributesData[ name ] = {
				id: attribute.id,
				version: attribute.version,
			};

		}

		return attributesData;

	}

	/**
	 * Returns `true` if the node builder's material uses
	 * node properties.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {boolean} Whether the node builder's material uses node properties or not.
	 */
	containsNode( builder ) {

		const material = builder.material;

		for ( const property in material ) {

			if ( material[ property ] && material[ property ].isNode )
				return true;

		}

		if ( builder.context.modelViewMatrix || builder.context.modelNormalViewMatrix || builder.context.getAO || builder.context.getShadow )
			return true;

		return false;

	}

	/**
	 * Returns a geometry data structure holding the geometry property values for
	 * monitoring.
	 *
	 * @param {BufferGeometry} geometry - The geometry.
	 * @return {Object} An object for monitoring geometry properties.
	 */
	getGeometryData( geometry ) {

		let data = _geometryCache.get( geometry );

		if ( data === undefined ) {

			data = {
				_renderId: - 1,
				_equal: false,

				attributes: this.getAttributesData( geometry.attributes ),
				indexId: geometry.index ? geometry.index.id : null,
				indexVersion: geometry.index ? geometry.index.version : null,
				drawRange: { start: geometry.drawRange.start, count: geometry.drawRange.count }
			};

			_geometryCache.set( geometry, data );

		}

		return data;

	}

	/**
	 * Returns a material data structure holding the material property values for
	 * monitoring.
	 *
	 * @param {Material} material - The material.
	 * @return {Object} An object for monitoring material properties.
	 */
	getMaterialData( material ) {

		let data = _materialCache.get( material );

		if ( data === undefined ) {

			data = { _renderId: - 1, _equal: false };

			for ( const property of this.refreshUniforms ) {

				const value = material[ property ];

				if ( value === null || value === undefined ) continue;

				if ( typeof value === 'object' && value.clone !== undefined ) {

					if ( value.isTexture === true ) {

						data[ property ] = { id: value.id, version: value.version };

					} else {

						data[ property ] = value.clone();

					}

				} else {

					data[ property ] = value;

				}

			}

			_materialCache.set( material, data );

		}

		return data;

	}

	/**
	 * Returns `true` if the given render object has not changed its state.
	 *
	 * @param {RenderObject} renderObject - The render object.
	 * @param {Array<Light>} lightsData - The current material lights.
	 * @param {number} renderId - The current render ID.
	 * @return {boolean} Whether the given render object has changed its state or not.
	 */
	equals( renderObject, lightsData, renderId ) {

		const { object, material, geometry } = renderObject;

		const renderObjectData = this.getRenderObjectData( renderObject );

		// world matrix

		if ( renderObjectData.worldMatrix.equals( object.matrixWorld ) !== true ) {

			renderObjectData.worldMatrix.copy( object.matrixWorld );

			return false;

		}

		// material

		const materialData = this.getMaterialData( renderObject.material );

		// check the material for the "equal" state just once per render for all render objects

		if ( materialData._renderId !== renderId ) {

			materialData._renderId = renderId;

			for ( const property in materialData ) {

				const value = materialData[ property ];
				const mtlValue = material[ property ];

				if ( property === '_renderId' ) continue;
				if ( property === '_equal' ) continue;

				if ( value.equals !== undefined ) {

					if ( value.equals( mtlValue ) === false ) {

						value.copy( mtlValue );

						materialData._equal = false;
						return false;

					}

				} else if ( mtlValue.isTexture === true ) {

					if ( value.id !== mtlValue.id || value.version !== mtlValue.version ) {

						value.id = mtlValue.id;
						value.version = mtlValue.version;

						materialData._equal = false;
						return false;

					}

				} else if ( value !== mtlValue ) {

					materialData[ property ] = mtlValue;

					materialData._equal = false;
					return false;

				}

			}

			if ( materialData.transmission > 0 ) {

				const { width, height } = renderObject.context;

				if ( renderObjectData.bufferWidth !== width || renderObjectData.bufferHeight !== height ) {

					renderObjectData.bufferWidth = width;
					renderObjectData.bufferHeight = height;

					materialData._equal = false;
					return false;

				}

			}

			materialData._equal = true;

		} else {

			if ( materialData._equal === false ) return false;

		}

		// geometry

		if ( renderObjectData.geometryId !== geometry.id ) {

			renderObjectData.geometryId = geometry.id;
			return false;

		}

		const geometryData = this.getGeometryData( renderObject.geometry );

		// check the geoemtry for the "equal" state just once per render for all render objects

		if ( geometryData._renderId !== renderId ) {

			geometryData._renderId = renderId;

			// attributes

			const attributes = geometry.attributes;
			const storedAttributes = geometryData.attributes;

			let currentAttributeCount = 0;
			let storedAttributeCount = 0;

			for ( const _ in attributes ) currentAttributeCount ++; // eslint-disable-line no-unused-vars

			for ( const name in storedAttributes ) {

				storedAttributeCount ++;

				const storedAttributeData = storedAttributes[ name ];
				const attribute = attributes[ name ];

				if ( attribute === undefined ) {

					// attribute was removed
					delete storedAttributes[ name ];

					geometryData._equal = false;
					return false;

				}

				if ( storedAttributeData.id !== attribute.id || storedAttributeData.version !== attribute.version ) {

					storedAttributeData.id = attribute.id;
					storedAttributeData.version = attribute.version;

					geometryData._equal = false;
					return false;

				}

			}

			if ( storedAttributeCount !== currentAttributeCount ) {

				geometryData.attributes = this.getAttributesData( attributes );

				geometryData._equal = false;
				return false;

			}

			// check index

			const index = geometry.index;
			const storedIndexId = geometryData.indexId;
			const storedIndexVersion = geometryData.indexVersion;
			const currentIndexId = index ? index.id : null;
			const currentIndexVersion = index ? index.version : null;

			if ( storedIndexId !== currentIndexId || storedIndexVersion !== currentIndexVersion ) {

				geometryData.indexId = currentIndexId;
				geometryData.indexVersion = currentIndexVersion;

				geometryData._equal = false;
				return false;

			}

			// check drawRange

			if ( geometryData.drawRange.start !== geometry.drawRange.start || geometryData.drawRange.count !== geometry.drawRange.count ) {

				geometryData.drawRange.start = geometry.drawRange.start;
				geometryData.drawRange.count = geometry.drawRange.count;

				geometryData._equal = false;
				return false;

			}

			geometryData._equal = true;

		} else {

			if ( geometryData._equal === false ) return false;

		}

		// morph targets

		if ( renderObjectData.morphTargetInfluences ) {

			let morphChanged = false;

			for ( let i = 0; i < renderObjectData.morphTargetInfluences.length; i ++ ) {

				if ( renderObjectData.morphTargetInfluences[ i ] !== object.morphTargetInfluences[ i ] ) {

					renderObjectData.morphTargetInfluences[ i ] = object.morphTargetInfluences[ i ];
					morphChanged = true;

				}

			}

			if ( morphChanged ) return false;

		}

		// lights

		if ( renderObjectData.lights ) {

			for ( let i = 0; i < lightsData.length; i ++ ) {

				if ( renderObjectData.lights[ i ].map !== lightsData[ i ].map ) {

					return false;

				}

			}

		}

		// center

		if ( renderObjectData.center ) {

			if ( renderObjectData.center.equals( object.center ) === false ) {

				renderObjectData.center.copy( object.center );

				return true;

			}

		}

		// bundle

		if ( renderObject.bundle !== null ) {

			renderObjectData.version = renderObject.bundle.version;

		}

		return true;

	}

	/**
	 * Returns the lights data for the given material lights.
	 *
	 * @param {Array<Light>} materialLights - The material lights.
	 * @return {Array<Object>} The lights data for the given material lights.
	 */
	getLightsData( materialLights ) {

		const lights = [];

		for ( const light of materialLights ) {

			if ( light.isSpotLight === true && light.map !== null ) {

				// only add lights that have a map

				lights.push( { map: light.map.version } );

			}

		}

		return lights;

	}

	/**
	 * Returns the lights for the given lights node and render ID.
	 *
	 * @param {LightsNode} lightsNode - The lights node.
	 * @param {number} renderId - The render ID.
	 * @return {Array<Object>} The lights for the given lights node and render ID.
	 */
	getLights( lightsNode, renderId ) {

		if ( _lightsCache.has( lightsNode ) ) {

			const cached = _lightsCache.get( lightsNode );

			if ( cached.renderId === renderId ) {

				return cached.lightsData;

			}

		}

		const lightsData = this.getLightsData( lightsNode.getLights() );

		_lightsCache.set( lightsNode, { renderId, lightsData } );

		return lightsData;

	}

	/**
	 * Checks if the given render object requires a refresh.
	 *
	 * @param {RenderObject} renderObject - The render object.
	 * @param {NodeFrame} nodeFrame - The current node frame.
	 * @return {boolean} Whether the given render object requires a refresh or not.
	 */
	needsRefresh( renderObject, nodeFrame ) {

		if ( this.hasNode || this.hasAnimation || this.firstInitialization( renderObject ) || this.needsVelocity( nodeFrame.renderer ) )
			return true;

		const { renderId } = nodeFrame;

		if ( this.renderId !== renderId ) {

			this.renderId = renderId;

			return true;

		}

		const isStatic = renderObject.object.static === true;
		const isBundle = renderObject.bundle !== null && renderObject.bundle.static === true && this.getRenderObjectData( renderObject ).version === renderObject.bundle.version;

		if ( isStatic || isBundle )
			return false;

		const lightsData = this.getLights( renderObject.lightsNode, renderId );
		const notEqual = this.equals( renderObject, lightsData, renderId ) !== true;

		return notEqual;

	}

}

export default NodeMaterialObserver;
