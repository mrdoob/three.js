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

			data = {
				material: this.getMaterialData( renderObject.material ),
				worldMatrix: renderObject.object.matrixWorld.clone()
			};

			if ( renderObject.object.center ) {

				data.center = renderObject.object.center.clone();

			}

			if ( renderObject.object.morphTargetInfluences ) {

				data.morphTargetInfluences = renderObject.object.morphTargetInfluences.slice();

			}

			if ( renderObject.bundle !== null ) {

				data.version = renderObject.bundle.version;

			}

			this.renderObjects.set( renderObject, data );

		}

		return data;

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

		const { object, material } = renderObject;

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
