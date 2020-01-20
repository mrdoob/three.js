import { BackSide } from '../../constants.js';
import { Color } from '../../math/Color.js';
import { Vector2 } from '../../math/Vector2.js';
import { Matrix3 } from '../../math/Matrix3.js';

/**
 * Uniforms library for shared webgl shaders
 */

var rendererSize;

function refreshUVTransform2D( uniforms, material ) {

	// uv repeat and offset setting priorities
	// 1. color map
	// 2. alpha map

	var uvScaleMap;

	if ( material.map ) {

		uvScaleMap = material.map;

	} else if ( material.alphaMap ) {

		uvScaleMap = material.alphaMap;

	}

	if ( uvScaleMap !== undefined ) {

		if ( uvScaleMap.matrixAutoUpdate === true ) {

			uvScaleMap.updateMatrix();

		}

		uniforms.uvTransform.value.copy( uvScaleMap.matrix );

	}

}

var UniformsLib = {

	common: {

		diffuse: {

			value: new Color( 0xeeeeee ),

			onUpdate: function ( uniforms, material ) {

				if ( material.color ) {

					uniforms.diffuse.value.copy( material.color );

				}

			}

		},

		opacity: { value: 1.0 },

		map: { value: null },

		uvTransform: {

			value: new Matrix3(),

			onUpdate: function ( uniforms, material ) {

				// uv repeat and offset setting priorities
				// 1. color map
				// 2. specular map
				// 3. normal map
				// 4. bump map
				// 5. alpha map
				// 6. emissive map

				var uvScaleMap;

				if ( material.map ) {

					uvScaleMap = material.map;

				} else if ( material.specularMap ) {

					uvScaleMap = material.specularMap;

				} else if ( material.displacementMap ) {

					uvScaleMap = material.displacementMap;

				} else if ( material.normalMap ) {

					uvScaleMap = material.normalMap;

				} else if ( material.bumpMap ) {

					uvScaleMap = material.bumpMap;

				} else if ( material.roughnessMap ) {

					uvScaleMap = material.roughnessMap;

				} else if ( material.metalnessMap ) {

					uvScaleMap = material.metalnessMap;

				} else if ( material.alphaMap ) {

					uvScaleMap = material.alphaMap;

				} else if ( material.emissiveMap ) {

					uvScaleMap = material.emissiveMap;

				}

				if ( uvScaleMap !== undefined ) {

					// backwards compatibility
					if ( uvScaleMap.isWebGLRenderTarget ) {

						uvScaleMap = uvScaleMap.texture;

					}

					if ( uvScaleMap.matrixAutoUpdate === true ) {

						uvScaleMap.updateMatrix();

					}

					uniforms.uvTransform.value.copy( uvScaleMap.matrix );

				}

			}
		},

		uv2Transform: {

			value: new Matrix3(),

			onUpdate: function ( uniforms, material ) {

				// uv repeat and offset setting priorities for uv2
				// 1. ao map
				// 2. light map

				var uv2ScaleMap;

				if ( material.aoMap ) {

					uv2ScaleMap = material.aoMap;

				} else if ( material.lightMap ) {

					uv2ScaleMap = material.lightMap;

				}

				if ( uv2ScaleMap !== undefined ) {

					// backwards compatibility
					if ( uv2ScaleMap.isWebGLRenderTarget ) {

						uv2ScaleMap = uv2ScaleMap.texture;

					}

					if ( uv2ScaleMap.matrixAutoUpdate === true ) {

						uv2ScaleMap.updateMatrix();

					}

					uniforms.uv2Transform.value.copy( uv2ScaleMap.matrix );

				}

			}

		},

		alphaMap: { value: null }

	},

	specularmap: {

		specularMap: { value: null }

	},

	envmap: {

		envMap: {

			value: null,

			onUpdate: function ( uniforms, material, renderer, scene ) {

				var envMap = material.envMap || scene.environment;

				uniforms.envMap.value = envMap;

				if ( envMap ) {

					// don't flip CubeTexture envMaps, flip everything else:
					//  WebGLCubeRenderTarget will be flipped for backwards compatibility
					//  WebGLCubeRenderTarget.texture will be flipped because it's a Texture and NOT a CubeTexture
					// this check must be handled differently, or removed entirely, if WebGLCubeRenderTarget uses a CubeTexture in the future
					uniforms.flipEnvMap.value = envMap.isCubeTexture ? - 1 : 1;

					uniforms.maxMipLevel.value = renderer.properties.get( envMap ).__maxMipLevel;

				}

			}

		},

		flipEnvMap: { value: - 1 },

		reflectivity: { value: 1.0 },

		refractionRatio: { value: 0.98 },

		maxMipLevel: { value: 0 }

	},

	aomap: {

		aoMap: { value: null },
		aoMapIntensity: { value: 1 }

	},

	lightmap: {

		lightMap: { value: null },
		lightMapIntensity: { value: 1 }

	},

	emissive: {

		emissive: {

			value: new Color( 0x000000 ),

			onUpdate: function ( uniforms, material ) {

				uniforms.emissive.value.copy( material.emissive ).multiplyScalar( material.emissiveIntensity );

			}

		}

	},

	shininess: {

		shininess: {

			value: 30,

			onUpdate: function ( uniforms, material ) {

				uniforms.shininess.value = Math.max( material.shininess, 1e-4 ); // to prevent pow( 0.0, 0.0 )

			}

		}

	},

	emissivemap: {

		emissiveMap: { value: null }

	},

	bumpmap: {

		bumpMap: {

			value: null,

			onUpdate: function ( uniforms, material ) {

				uniforms.bumpMap.value = material.bumpMap;
				uniforms.bumpScale.value = material.bumpScale;
				if ( material.side === BackSide ) uniforms.bumpScale.value *= - 1;

			}

		},

		bumpScale: { value: 1 }

	},

	normalmap: {

		normalMap: {

			value: null,

			onUpdate: function ( uniforms, material ) {

				uniforms.normalMap.value = material.normalMap;
				uniforms.normalScale.value.copy( material.normalScale );
				if ( material.side === BackSide ) uniforms.normalScale.value.negate();

			}

		},

		normalScale: { value: new Vector2( 1, 1 ) }

	},

	displacementmap: {

		displacementMap: { value: null },
		displacementScale: { value: 1 },
		displacementBias: { value: 0 }

	},

	roughnessmap: {

		roughnessMap: { value: null }

	},

	metalnessmap: {

		metalnessMap: { value: null }

	},

	gradientmap: {

		gradientMap: { value: null }

	},

	fog: {

		fogDensity: { value: 0.00025 },

		fogNear: { value: 1 },

		fogFar: { value: 2000 },

		fogColor: {

			value: new Color( 0xffffff ),

			onUpdate: function ( uniforms, material, renderer, scene ) {

				var fog = scene.fog;

				if ( fog && material.fog ) {

					uniforms.fogColor.value.copy( fog.color );

					if ( fog.isFog ) {

						uniforms.fogNear.value = fog.near;
						uniforms.fogFar.value = fog.far;

					} else if ( fog.isFogExp2 ) {

						uniforms.fogDensity.value = fog.density;

					}

				}

			}

		}

	},

	lights: {

		ambientLightColor: { value: [] },

		lightProbe: { value: [] },

		directionalLights: { value: [], properties: {
			direction: {},
			color: {},

			shadow: {},
			shadowBias: {},
			shadowRadius: {},
			shadowMapSize: {}
		} },

		directionalShadowMap: { value: [] },
		directionalShadowMatrix: { value: [] },

		spotLights: { value: [], properties: {
			color: {},
			position: {},
			direction: {},
			distance: {},
			coneCos: {},
			penumbraCos: {},
			decay: {},

			shadow: {},
			shadowBias: {},
			shadowRadius: {},
			shadowMapSize: {}
		} },

		spotShadowMap: { value: [] },
		spotShadowMatrix: { value: [] },

		pointLights: { value: [], properties: {
			color: {},
			position: {},
			decay: {},
			distance: {},

			shadow: {},
			shadowBias: {},
			shadowRadius: {},
			shadowMapSize: {},
			shadowCameraNear: {},
			shadowCameraFar: {}
		} },

		pointShadowMap: { value: [] },
		pointShadowMatrix: { value: [] },

		hemisphereLights: { value: [], properties: {
			direction: {},
			skyColor: {},
			groundColor: {}
		} },

		// TODO (abelnation): RectAreaLight BRDF data needs to be moved from example to main src
		rectAreaLights: { value: [], properties: {
			color: {},
			position: {},
			width: {},
			height: {}
		} }

	},

	points: {

		diffuse: { value: new Color( 0xeeeeee ) },

		opacity: { value: 1.0 },

		size: {

			value: 1.0,

			onUpdate: function ( uniforms, material, renderer ) {

				uniforms.size.value = material.size * renderer.getPixelRatio();

			}

		},

		scale: {

			value: 1.0,

			onUpdate: function ( uniforms, material, renderer ) {

				rendererSize = rendererSize || new Vector2();

				uniforms.scale.value = renderer.getSize( rendererSize ).y * 0.5;

			}

		},

		map: { value: null },

		alphaMap: { value: null },

		uvTransform: { value: new Matrix3(), onUpdate: refreshUVTransform2D }

	},

	sprite: {

		diffuse: { value: new Color( 0xeeeeee ) },
		opacity: { value: 1.0 },
		center: { value: new Vector2( 0.5, 0.5 ) },
		rotation: { value: 0.0 },
		map: { value: null },
		alphaMap: { value: null },
		uvTransform: { value: new Matrix3(), onUpdate: refreshUVTransform2D }

	}

};

export { UniformsLib };
