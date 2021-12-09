import { BackSide } from '../../constants.js';

function WebGLMaterials( properties ) {

	function refreshFogUniforms( uniforms, fog ) {

		uniforms.fogColor.value.copy( fog.color );

		if ( fog.isFog ) {

			uniforms.fogNear.value = fog.near;
			uniforms.fogFar.value = fog.far;

		} else if ( fog.isFogExp2 ) {

			uniforms.fogDensity.value = fog.density;

		}

	}

	function refreshMaterialUniforms( uniforms, material, pixelRatio, height, transmissionRenderTarget ) {

		if ( material.isMeshBasicMaterial ) {

			refreshUniformsCommon( uniforms, material );

		} else if ( material.isMeshLambertMaterial ) {

			refreshUniformsCommon( uniforms, material );
			refreshUniformsLambert( uniforms, material );

		} else if ( material.isMeshToonMaterial ) {

			refreshUniformsCommon( uniforms, material );
			refreshUniformsToon( uniforms, material );

		} else if ( material.isMeshPhongMaterial ) {

			refreshUniformsCommon( uniforms, material );
			refreshUniformsPhong( uniforms, material );

		} else if ( material.isMeshStandardMaterial ) {

			refreshUniformsCommon( uniforms, material );

			if ( material.isMeshPhysicalMaterial ) {

				refreshUniformsPhysical( uniforms, material, transmissionRenderTarget );

			} else {

				refreshUniformsStandard( uniforms, material );

			}

		} else if ( material.isMeshMatcapMaterial ) {

			refreshUniformsCommon( uniforms, material );
			refreshUniformsMatcap( uniforms, material );

		} else if ( material.isMeshDepthMaterial ) {

			refreshUniformsCommon( uniforms, material );
			refreshUniformsDepth( uniforms, material );

		} else if ( material.isMeshDistanceMaterial ) {

			refreshUniformsCommon( uniforms, material );
			refreshUniformsDistance( uniforms, material );

		} else if ( material.isMeshNormalMaterial ) {

			refreshUniformsCommon( uniforms, material );
			refreshUniformsNormal( uniforms, material );

		} else if ( material.isLineBasicMaterial ) {

			refreshUniformsLine( uniforms, material );

			if ( material.isLineDashedMaterial ) {

				refreshUniformsDash( uniforms, material );

			}

		} else if ( material.isPointsMaterial ) {

			refreshUniformsPoints( uniforms, material, pixelRatio, height );

		} else if ( material.isSpriteMaterial ) {

			refreshUniformsSprites( uniforms, material );

		} else if ( material.isShadowMaterial ) {

			uniforms.color.value.copy( material.color );
			uniforms.opacity.value = material.opacity;

		} else if ( material.isShaderMaterial ) {

			material.uniformsNeedUpdate = false; // #15581

		}

	}

	function refreshUniformsCommon( uniforms, material ) {

		uniforms.opacity.value = material.opacity;

		if ( material.color ) {

			uniforms.diffuse.value.copy( material.color );

		}

		if ( material.emissive ) {

			uniforms.emissive.value.copy( material.emissive ).multiplyScalar( material.emissiveIntensity );

		}

		if ( material.map ) {

			uniforms.map.value = material.map;

		}

		if ( material.alphaMap ) {

			uniforms.alphaMap.value = material.alphaMap;

		}

		if ( material.specularMap ) {

			uniforms.specularMap.value = material.specularMap;

		}

		if ( material.alphaTest > 0 ) {

			uniforms.alphaTest.value = material.alphaTest;

		}

		const envMap = properties.get( material ).envMap;

		if ( envMap ) {

			uniforms.envMap.value = envMap;

			uniforms.flipEnvMap.value = ( envMap.isCubeTexture && envMap.isRenderTargetTexture === false ) ? - 1 : 1;

			uniforms.reflectivity.value = material.reflectivity;
			uniforms.ior.value = material.ior;
			uniforms.refractionRatio.value = material.refractionRatio;

		}

		if ( material.lightMap ) {

			uniforms.lightMap.value = material.lightMap;
			uniforms.lightMapIntensity.value = material.lightMapIntensity;

		}

		if ( material.aoMap ) {

			uniforms.aoMap.value = material.aoMap;
			uniforms.aoMapIntensity.value = material.aoMapIntensity;

		}

		// uv repeat and offset setting priorities
		// 1. color map
		// 2. specular map
		// 3. displacementMap map
		// 4. normal map
		// 5. bump map
		// 6. roughnessMap map
		// 7. metalnessMap map
		// 8. alphaMap map
		// 9. emissiveMap map
		// 10. clearcoat map
		// 11. clearcoat normal map
		// 12. clearcoat roughnessMap map
		// 13. specular intensity map
		// 14. specular tint map
		// 15. transmission map
		// 16. thickness map

		let uvScaleMap;

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

		} else if ( material.clearcoatMap ) {

			uvScaleMap = material.clearcoatMap;

		} else if ( material.clearcoatNormalMap ) {

			uvScaleMap = material.clearcoatNormalMap;

		} else if ( material.clearcoatRoughnessMap ) {

			uvScaleMap = material.clearcoatRoughnessMap;

		} else if ( material.specularIntensityMap ) {

			uvScaleMap = material.specularIntensityMap;

		} else if ( material.specularColorMap ) {

			uvScaleMap = material.specularColorMap;

		} else if ( material.transmissionMap ) {

			uvScaleMap = material.transmissionMap;

		} else if ( material.thicknessMap ) {

			uvScaleMap = material.thicknessMap;

		} else if ( material.sheenColorMap ) {

			uvScaleMap = material.sheenColorMap;

		} else if ( material.sheenRoughnessMap ) {

			uvScaleMap = material.sheenRoughnessMap;

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

		// uv repeat and offset setting priorities for uv2
		// 1. ao map
		// 2. light map

		let uv2ScaleMap;

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

	function refreshUniformsLine( uniforms, material ) {

		uniforms.diffuse.value.copy( material.color );
		uniforms.opacity.value = material.opacity;

	}

	function refreshUniformsDash( uniforms, material ) {

		uniforms.dashSize.value = material.dashSize;
		uniforms.totalSize.value = material.dashSize + material.gapSize;
		uniforms.scale.value = material.scale;

	}

	function refreshUniformsPoints( uniforms, material, pixelRatio, height ) {

		uniforms.diffuse.value.copy( material.color );
		uniforms.opacity.value = material.opacity;
		uniforms.size.value = material.size * pixelRatio;
		uniforms.scale.value = height * 0.5;

		if ( material.map ) {

			uniforms.map.value = material.map;

		}

		if ( material.alphaMap ) {

			uniforms.alphaMap.value = material.alphaMap;

		}

		if ( material.alphaTest > 0 ) {

			uniforms.alphaTest.value = material.alphaTest;

		}

		// uv repeat and offset setting priorities
		// 1. color map
		// 2. alpha map

		let uvScaleMap;

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

	function refreshUniformsSprites( uniforms, material ) {

		uniforms.diffuse.value.copy( material.color );
		uniforms.opacity.value = material.opacity;
		uniforms.rotation.value = material.rotation;

		if ( material.map ) {

			uniforms.map.value = material.map;

		}

		if ( material.alphaMap ) {

			uniforms.alphaMap.value = material.alphaMap;

		}

		if ( material.alphaTest > 0 ) {

			uniforms.alphaTest.value = material.alphaTest;

		}

		// uv repeat and offset setting priorities
		// 1. color map
		// 2. alpha map

		let uvScaleMap;

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

	function refreshUniformsLambert( uniforms, material ) {

		if ( material.emissiveMap ) {

			uniforms.emissiveMap.value = material.emissiveMap;

		}

	}

	function refreshUniformsPhong( uniforms, material ) {

		uniforms.specular.value.copy( material.specular );
		uniforms.shininess.value = Math.max( material.shininess, 1e-4 ); // to prevent pow( 0.0, 0.0 )

		if ( material.emissiveMap ) {

			uniforms.emissiveMap.value = material.emissiveMap;

		}

		if ( material.bumpMap ) {

			uniforms.bumpMap.value = material.bumpMap;
			uniforms.bumpScale.value = material.bumpScale;
			if ( material.side === BackSide ) uniforms.bumpScale.value *= - 1;

		}

		if ( material.normalMap ) {

			uniforms.normalMap.value = material.normalMap;
			uniforms.normalScale.value.copy( material.normalScale );
			if ( material.side === BackSide ) uniforms.normalScale.value.negate();

		}

		if ( material.displacementMap ) {

			uniforms.displacementMap.value = material.displacementMap;
			uniforms.displacementScale.value = material.displacementScale;
			uniforms.displacementBias.value = material.displacementBias;

		}

	}

	function refreshUniformsToon( uniforms, material ) {

		if ( material.gradientMap ) {

			uniforms.gradientMap.value = material.gradientMap;

		}

		if ( material.emissiveMap ) {

			uniforms.emissiveMap.value = material.emissiveMap;

		}

		if ( material.bumpMap ) {

			uniforms.bumpMap.value = material.bumpMap;
			uniforms.bumpScale.value = material.bumpScale;
			if ( material.side === BackSide ) uniforms.bumpScale.value *= - 1;

		}

		if ( material.normalMap ) {

			uniforms.normalMap.value = material.normalMap;
			uniforms.normalScale.value.copy( material.normalScale );
			if ( material.side === BackSide ) uniforms.normalScale.value.negate();

		}

		if ( material.displacementMap ) {

			uniforms.displacementMap.value = material.displacementMap;
			uniforms.displacementScale.value = material.displacementScale;
			uniforms.displacementBias.value = material.displacementBias;

		}

	}

	function refreshUniformsStandard( uniforms, material ) {

		uniforms.roughness.value = material.roughness;
		uniforms.metalness.value = material.metalness;

		if ( material.roughnessMap ) {

			uniforms.roughnessMap.value = material.roughnessMap;

		}

		if ( material.metalnessMap ) {

			uniforms.metalnessMap.value = material.metalnessMap;

		}

		if ( material.emissiveMap ) {

			uniforms.emissiveMap.value = material.emissiveMap;

		}

		if ( material.bumpMap ) {

			uniforms.bumpMap.value = material.bumpMap;
			uniforms.bumpScale.value = material.bumpScale;
			if ( material.side === BackSide ) uniforms.bumpScale.value *= - 1;

		}

		if ( material.normalMap ) {

			uniforms.normalMap.value = material.normalMap;
			uniforms.normalScale.value.copy( material.normalScale );
			if ( material.side === BackSide ) uniforms.normalScale.value.negate();

		}

		if ( material.displacementMap ) {

			uniforms.displacementMap.value = material.displacementMap;
			uniforms.displacementScale.value = material.displacementScale;
			uniforms.displacementBias.value = material.displacementBias;

		}

		const envMap = properties.get( material ).envMap;

		if ( envMap ) {

			//uniforms.envMap.value = material.envMap; // part of uniforms common
			uniforms.envMapIntensity.value = material.envMapIntensity;

		}

	}

	function refreshUniformsPhysical( uniforms, material, transmissionRenderTarget ) {

		refreshUniformsStandard( uniforms, material );

		uniforms.ior.value = material.ior; // also part of uniforms common

		if ( material.sheen > 0 ) {

			uniforms.sheenColor.value.copy( material.sheenColor ).multiplyScalar( material.sheen );

			uniforms.sheenRoughness.value = material.sheenRoughness;

			if ( material.sheenColorMap ) {

				uniforms.sheenColorMap.value = material.sheenColorMap;

			}

			if ( material.sheenRoughnessMap ) {

				uniforms.sheenRoughnessMap.value = material.sheenRoughnessMap;

			}

		}

		if ( material.clearcoat > 0 ) {

			uniforms.clearcoat.value = material.clearcoat;
			uniforms.clearcoatRoughness.value = material.clearcoatRoughness;

			if ( material.clearcoatMap ) {

				uniforms.clearcoatMap.value = material.clearcoatMap;

			}

			if ( material.clearcoatRoughnessMap ) {

				uniforms.clearcoatRoughnessMap.value = material.clearcoatRoughnessMap;

			}

			if ( material.clearcoatNormalMap ) {

				uniforms.clearcoatNormalScale.value.copy( material.clearcoatNormalScale );
				uniforms.clearcoatNormalMap.value = material.clearcoatNormalMap;

				if ( material.side === BackSide ) {

					uniforms.clearcoatNormalScale.value.negate();

				}

			}

		}

		if ( material.transmission > 0 ) {

			uniforms.transmission.value = material.transmission;
			uniforms.transmissionSamplerMap.value = transmissionRenderTarget.texture;
			uniforms.transmissionSamplerSize.value.set( transmissionRenderTarget.width, transmissionRenderTarget.height );

			if ( material.transmissionMap ) {

				uniforms.transmissionMap.value = material.transmissionMap;

			}

			uniforms.thickness.value = material.thickness;

			if ( material.thicknessMap ) {

				uniforms.thicknessMap.value = material.thicknessMap;

			}

			uniforms.attenuationDistance.value = material.attenuationDistance;
			uniforms.attenuationColor.value.copy( material.attenuationColor );

		}

		uniforms.specularIntensity.value = material.specularIntensity;
		uniforms.specularColor.value.copy( material.specularColor );

		if ( material.specularIntensityMap ) {

			uniforms.specularIntensityMap.value = material.specularIntensityMap;

		}

		if ( material.specularColorMap ) {

			uniforms.specularColorMap.value = material.specularColorMap;

		}

	}

	function refreshUniformsMatcap( uniforms, material ) {

		if ( material.matcap ) {

			uniforms.matcap.value = material.matcap;

		}

		if ( material.bumpMap ) {

			uniforms.bumpMap.value = material.bumpMap;
			uniforms.bumpScale.value = material.bumpScale;
			if ( material.side === BackSide ) uniforms.bumpScale.value *= - 1;

		}

		if ( material.normalMap ) {

			uniforms.normalMap.value = material.normalMap;
			uniforms.normalScale.value.copy( material.normalScale );
			if ( material.side === BackSide ) uniforms.normalScale.value.negate();

		}

		if ( material.displacementMap ) {

			uniforms.displacementMap.value = material.displacementMap;
			uniforms.displacementScale.value = material.displacementScale;
			uniforms.displacementBias.value = material.displacementBias;

		}

	}

	function refreshUniformsDepth( uniforms, material ) {

		if ( material.displacementMap ) {

			uniforms.displacementMap.value = material.displacementMap;
			uniforms.displacementScale.value = material.displacementScale;
			uniforms.displacementBias.value = material.displacementBias;

		}

	}

	function refreshUniformsDistance( uniforms, material ) {

		if ( material.displacementMap ) {

			uniforms.displacementMap.value = material.displacementMap;
			uniforms.displacementScale.value = material.displacementScale;
			uniforms.displacementBias.value = material.displacementBias;

		}

		uniforms.referencePosition.value.copy( material.referencePosition );
		uniforms.nearDistance.value = material.nearDistance;
		uniforms.farDistance.value = material.farDistance;

	}

	function refreshUniformsNormal( uniforms, material ) {

		if ( material.bumpMap ) {

			uniforms.bumpMap.value = material.bumpMap;
			uniforms.bumpScale.value = material.bumpScale;
			if ( material.side === BackSide ) uniforms.bumpScale.value *= - 1;

		}

		if ( material.normalMap ) {

			uniforms.normalMap.value = material.normalMap;
			uniforms.normalScale.value.copy( material.normalScale );
			if ( material.side === BackSide ) uniforms.normalScale.value.negate();

		}

		if ( material.displacementMap ) {

			uniforms.displacementMap.value = material.displacementMap;
			uniforms.displacementScale.value = material.displacementScale;
			uniforms.displacementBias.value = material.displacementBias;

		}

	}

	return {
		refreshFogUniforms: refreshFogUniforms,
		refreshMaterialUniforms: refreshMaterialUniforms
	};

}

export { WebGLMaterials };
