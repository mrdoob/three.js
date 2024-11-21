const refreshUniforms = [
	'alphaMap',
	'alphaTest',
	'anisotropy',
	'anisotropyMap',
	'anisotropyRotation',
	'aoMap',
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
	'emissiveMap',
	'envMap',
	'gradientMap',
	'ior',
	'iridescence',
	'iridescenceIOR',
	'iridescenceMap',
	'iridescenceThicknessMap',
	'lightMap',
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

class NodeMaterialObserver {

	constructor( builder ) {

		this.renderObjects = new WeakMap();
		this.hasNode = this.containsNode( builder );
		this.hasAnimation = builder.object.isSkinnedMesh === true;
		this.refreshUniforms = refreshUniforms;
		this.renderId = 0;

	}

	firstInitialization( renderObject ) {

		const hasInitialized = this.renderObjects.has( renderObject );

		if ( hasInitialized === false ) {

			this.getRenderObjectData( renderObject );

			return true;

		}

		return false;

	}

	getRenderObjectData( renderObject ) {

		let data = this.renderObjects.get( renderObject );

		if ( data === undefined ) {

			const { geometry, material, object } = renderObject;

			data = {
				material: this.getMaterialData( material ),
				geometry: {
					attributes: this.getAttributesData( geometry.attributes ),
					indexVersion: geometry.index ? geometry.index.version : null,
					drawRange: { start: geometry.drawRange.start, count: geometry.drawRange.count }
				},
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

			if ( data.material.transmission > 0 ) {

				const { width, height } = renderObject.context;

				data.bufferWidth = width;
				data.bufferHeight = height;

			}

			this.renderObjects.set( renderObject, data );

		}

		return data;

	}

	getAttributesData( attributes ) {

		const attributesData = {};

		for ( const name in attributes ) {

			const attribute = attributes[ name ];

			attributesData[ name ] = {
				version: attribute.version
			};

		}

		return attributesData;

	}

	containsNode( builder ) {

		const material = builder.material;

		for ( const property in material ) {

			if ( material[ property ] && material[ property ].isNode )
				return true;

		}

		if ( builder.renderer.nodes.modelViewMatrix !== null || builder.renderer.nodes.modelNormalViewMatrix !== null )
			return true;

		return false;

	}

	getMaterialData( material ) {

		const data = {};

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

		return data;

	}

	equals( renderObject ) {

		const { object, material, geometry } = renderObject;

		const renderObjectData = this.getRenderObjectData( renderObject );

		// world matrix

		if ( renderObjectData.worldMatrix.equals( object.matrixWorld ) !== true ) {

			renderObjectData.worldMatrix.copy( object.matrixWorld );

			return false;

		}

		// material

		const materialData = renderObjectData.material;

		for ( const property in materialData ) {

			const value = materialData[ property ];
			const mtlValue = material[ property ];

			if ( value.equals !== undefined ) {

				if ( value.equals( mtlValue ) === false ) {

					value.copy( mtlValue );

					return false;

				}

			} else if ( mtlValue.isTexture === true ) {

				if ( value.id !== mtlValue.id || value.version !== mtlValue.version ) {

					value.id = mtlValue.id;
					value.version = mtlValue.version;

					return false;

				}

			} else if ( value !== mtlValue ) {

				materialData[ property ] = mtlValue;

				return false;

			}

		}

		if ( materialData.transmission > 0 ) {

			const { width, height } = renderObject.context;

			if ( renderObjectData.bufferWidth !== width || renderObjectData.bufferHeight !== height ) {

				renderObjectData.bufferWidth = width;
				renderObjectData.bufferHeight = height;

				return false;

			}

		}

		// geometry

		const storedGeometryData = renderObjectData.geometry;
		const attributes = geometry.attributes;
		const storedAttributes = storedGeometryData.attributes;

		const storedAttributeNames = Object.keys( storedAttributes );
		const currentAttributeNames = Object.keys( attributes );

		if ( storedAttributeNames.length !== currentAttributeNames.length ) {

			renderObjectData.geometry.attributes = this.getAttributesData( attributes );
			return false;

		}

		// compare each attribute

		for ( const name of storedAttributeNames ) {

			const storedAttributeData = storedAttributes[ name ];
			const attribute = attributes[ name ];

			if ( attribute === undefined ) {

				// attribute was removed
				delete storedAttributes[ name ];
				return false;

			}

			if ( storedAttributeData.version !== attribute.version ) {

				storedAttributeData.version = attribute.version;
				return false;

			}

		}

		// check index

		const index = geometry.index;
		const storedIndexVersion = storedGeometryData.indexVersion;
		const currentIndexVersion = index ? index.version : null;

		if ( storedIndexVersion !== currentIndexVersion ) {

			storedGeometryData.indexVersion = currentIndexVersion;
			return false;

		}

		// check drawRange

		if ( storedGeometryData.drawRange.start !== geometry.drawRange.start || storedGeometryData.drawRange.count !== geometry.drawRange.count ) {

			storedGeometryData.drawRange.start = geometry.drawRange.start;
			storedGeometryData.drawRange.count = geometry.drawRange.count;
			return false;

		}

		// morph targets

		if ( renderObjectData.morphTargetInfluences ) {

			let morphChanged = false;

			for ( let i = 0; i < renderObjectData.morphTargetInfluences.length; i ++ ) {

				if ( renderObjectData.morphTargetInfluences[ i ] !== object.morphTargetInfluences[ i ] ) {

					morphChanged = true;

				}

			}

			if ( morphChanged ) return true;

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

	needsRefresh( renderObject, nodeFrame ) {

		if ( this.hasNode || this.hasAnimation || this.firstInitialization( renderObject ) )
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

		const notEqual = this.equals( renderObject ) !== true;

		return notEqual;

	}

}

export default NodeMaterialObserver;
