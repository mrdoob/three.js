import { BackSide } from '../../constants.js';
import { getUnlitUniformColorSpace } from '../shaders/UniformsUtils.js';
import { colorCopy, colorGetRGB, colorMultiplyScalar } from '../../math/ColorFunctions.js';
import { mat3Copy, mat3Create, mat3PreMultiply, mat3Set, mat3SetFromMatrix4, mat3Transpose } from '../../math/Matrix3Functions.js';
import { mat4Create, mat4MakeRotationFromEuler } from '../../math/Matrix4Functions.js';
import { vec2Copy, vec2Negate, vec2Set } from '../../math/Vector2Functions.js';
import { vec3SetFromMatrixPosition } from '../../math/Vector3Functions.js';

const _m1 = /*@__PURE__*/ mat4Create();
const _m = /*@__PURE__*/ mat3Create();

mat3Set( _m, - 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0 );

function WebGLMaterials( renderer, properties ) {

	function refreshTransformUniform( map, uniform ) {

		if ( map.matrixAutoUpdate === true ) {

			map.updateMatrix();

		}

		mat3Copy( map.matrix, uniform.value );

	}

	function refreshFogUniforms( uniforms, fog ) {

		colorGetRGB( fog.color, uniforms.fogColor.value, getUnlitUniformColorSpace( renderer ) );

		if ( fog.isFog ) {

			uniforms.fogNear.value = fog.near;
			uniforms.fogFar.value = fog.far;

		} else if ( fog.isFogExp2 ) {

			uniforms.fogDensity.value = fog.density;

		}

	}

	function refreshMaterialUniforms( uniforms, material, pixelRatio, height, transmissionRenderTarget ) {

		if ( material.isNodeMaterial ) {

			material.uniformsNeedUpdate = false;

		} else if ( material.isMeshBasicMaterial ) {

			refreshUniformsCommon( uniforms, material );

		} else if ( material.isMeshLambertMaterial ) {

			refreshUniformsCommon( uniforms, material );

			if ( material.envMap ) {

				uniforms.envMapIntensity.value = material.envMapIntensity;

			}

		} else if ( material.isMeshToonMaterial ) {

			refreshUniformsCommon( uniforms, material );
			refreshUniformsToon( uniforms, material );

		} else if ( material.isMeshPhongMaterial ) {

			refreshUniformsCommon( uniforms, material );
			refreshUniformsPhong( uniforms, material );

			if ( material.envMap ) {

				uniforms.envMapIntensity.value = material.envMapIntensity;

			}

		} else if ( material.isMeshStandardMaterial ) {

			refreshUniformsCommon( uniforms, material );
			refreshUniformsStandard( uniforms, material );

			if ( material.isMeshPhysicalMaterial ) {

				refreshUniformsPhysical( uniforms, material, transmissionRenderTarget );

			}

		} else if ( material.isMeshMatcapMaterial ) {

			refreshUniformsCommon( uniforms, material );
			refreshUniformsMatcap( uniforms, material );

		} else if ( material.isMeshDepthMaterial ) {

			refreshUniformsCommon( uniforms, material );

		} else if ( material.isMeshDistanceMaterial ) {

			refreshUniformsCommon( uniforms, material );
			refreshUniformsDistance( uniforms, material );

		} else if ( material.isMeshNormalMaterial ) {

			refreshUniformsCommon( uniforms, material );

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

			colorCopy( material.color, uniforms.color.value );
			uniforms.opacity.value = material.opacity;

		} else if ( material.isShaderMaterial ) {

			material.uniformsNeedUpdate = false; // #15581

		}

	}

	function refreshUniformsCommon( uniforms, material ) {

		uniforms.opacity.value = material.opacity;

		if ( material.color ) {

			colorCopy( material.color, uniforms.diffuse.value );

		}

		if ( material.emissive ) {

			colorCopy( material.emissive, uniforms.emissive.value );
			colorMultiplyScalar( uniforms.emissive.value, material.emissiveIntensity, uniforms.emissive.value );

		}

		if ( material.map ) {

			uniforms.map.value = material.map;

			refreshTransformUniform( material.map, uniforms.mapTransform );

		}

		if ( material.alphaMap ) {

			uniforms.alphaMap.value = material.alphaMap;

			refreshTransformUniform( material.alphaMap, uniforms.alphaMapTransform );

		}

		if ( material.bumpMap ) {

			uniforms.bumpMap.value = material.bumpMap;

			refreshTransformUniform( material.bumpMap, uniforms.bumpMapTransform );

			uniforms.bumpScale.value = material.bumpScale;

			if ( material.side === BackSide ) {

				uniforms.bumpScale.value *= - 1;

			}

		}

		if ( material.normalMap ) {

			uniforms.normalMap.value = material.normalMap;

			refreshTransformUniform( material.normalMap, uniforms.normalMapTransform );

			vec2Copy( material.normalScale, uniforms.normalScale.value );

			if ( material.side === BackSide ) {

				vec2Negate( uniforms.normalScale.value, uniforms.normalScale.value );

			}

		}

		if ( material.displacementMap ) {

			uniforms.displacementMap.value = material.displacementMap;

			refreshTransformUniform( material.displacementMap, uniforms.displacementMapTransform );

			uniforms.displacementScale.value = material.displacementScale;
			uniforms.displacementBias.value = material.displacementBias;

		}

		if ( material.emissiveMap ) {

			uniforms.emissiveMap.value = material.emissiveMap;

			refreshTransformUniform( material.emissiveMap, uniforms.emissiveMapTransform );

		}

		if ( material.specularMap ) {

			uniforms.specularMap.value = material.specularMap;

			refreshTransformUniform( material.specularMap, uniforms.specularMapTransform );

		}

		if ( material.alphaTest > 0 ) {

			uniforms.alphaTest.value = material.alphaTest;

		}

		const materialProperties = properties.get( material );

		const envMap = materialProperties.envMap;
		const envMapRotation = materialProperties.envMapRotation;

		if ( envMap ) {

			uniforms.envMap.value = envMap;

			// note: since the matrix is orthonormal, we can use the more-efficient transpose() in lieu of invert()
			mat4MakeRotationFromEuler( envMapRotation, _m1 );
			mat3SetFromMatrix4( _m1, uniforms.envMapRotation.value );
			mat3Transpose( uniforms.envMapRotation.value, uniforms.envMapRotation.value );


			if ( envMap.isCubeTexture && envMap.isRenderTargetTexture === false ) {

				mat3PreMultiply( uniforms.envMapRotation.value, _m, uniforms.envMapRotation.value );

			}

			uniforms.reflectivity.value = material.reflectivity;
			uniforms.ior.value = material.ior;
			uniforms.refractionRatio.value = material.refractionRatio;

		}

		if ( material.lightMap ) {

			uniforms.lightMap.value = material.lightMap;
			uniforms.lightMapIntensity.value = material.lightMapIntensity;

			refreshTransformUniform( material.lightMap, uniforms.lightMapTransform );

		}

		if ( material.aoMap ) {

			uniforms.aoMap.value = material.aoMap;
			uniforms.aoMapIntensity.value = material.aoMapIntensity;

			refreshTransformUniform( material.aoMap, uniforms.aoMapTransform );

		}

	}

	function refreshUniformsLine( uniforms, material ) {

		colorCopy( material.color, uniforms.diffuse.value );
		uniforms.opacity.value = material.opacity;

		if ( material.map ) {

			uniforms.map.value = material.map;

			refreshTransformUniform( material.map, uniforms.mapTransform );

		}

	}

	function refreshUniformsDash( uniforms, material ) {

		uniforms.dashSize.value = material.dashSize;
		uniforms.totalSize.value = material.dashSize + material.gapSize;
		uniforms.scale.value = material.scale;

	}

	function refreshUniformsPoints( uniforms, material, pixelRatio, height ) {

		colorCopy( material.color, uniforms.diffuse.value );
		uniforms.opacity.value = material.opacity;
		uniforms.size.value = material.size * pixelRatio;
		uniforms.scale.value = height * 0.5;

		if ( material.map ) {

			uniforms.map.value = material.map;

			refreshTransformUniform( material.map, uniforms.uvTransform );

		}

		if ( material.alphaMap ) {

			uniforms.alphaMap.value = material.alphaMap;

			refreshTransformUniform( material.alphaMap, uniforms.alphaMapTransform );

		}

		if ( material.alphaTest > 0 ) {

			uniforms.alphaTest.value = material.alphaTest;

		}

	}

	function refreshUniformsSprites( uniforms, material ) {

		colorCopy( material.color, uniforms.diffuse.value );
		uniforms.opacity.value = material.opacity;
		uniforms.rotation.value = material.rotation;

		if ( material.map ) {

			uniforms.map.value = material.map;

			refreshTransformUniform( material.map, uniforms.mapTransform );

		}

		if ( material.alphaMap ) {

			uniforms.alphaMap.value = material.alphaMap;

			refreshTransformUniform( material.alphaMap, uniforms.alphaMapTransform );

		}

		if ( material.alphaTest > 0 ) {

			uniforms.alphaTest.value = material.alphaTest;

		}

	}

	function refreshUniformsPhong( uniforms, material ) {

		colorCopy( material.specular, uniforms.specular.value );
		uniforms.shininess.value = Math.max( material.shininess, 1e-4 ); // to prevent pow( 0.0, 0.0 )

	}

	function refreshUniformsToon( uniforms, material ) {

		if ( material.gradientMap ) {

			uniforms.gradientMap.value = material.gradientMap;

		}

	}

	function refreshUniformsStandard( uniforms, material ) {

		uniforms.metalness.value = material.metalness;

		if ( material.metalnessMap ) {

			uniforms.metalnessMap.value = material.metalnessMap;

			refreshTransformUniform( material.metalnessMap, uniforms.metalnessMapTransform );

		}

		uniforms.roughness.value = material.roughness;

		if ( material.roughnessMap ) {

			uniforms.roughnessMap.value = material.roughnessMap;

			refreshTransformUniform( material.roughnessMap, uniforms.roughnessMapTransform );

		}

		if ( material.envMap ) {

			//uniforms.envMap.value = material.envMap; // part of uniforms common

			uniforms.envMapIntensity.value = material.envMapIntensity;

		}

	}

	function refreshUniformsPhysical( uniforms, material, transmissionRenderTarget ) {

		uniforms.ior.value = material.ior; // also part of uniforms common

		if ( material.sheen > 0 ) {

			colorCopy( material.sheenColor, uniforms.sheenColor.value );
			colorMultiplyScalar( uniforms.sheenColor.value, material.sheen, uniforms.sheenColor.value );

			uniforms.sheenRoughness.value = material.sheenRoughness;

			if ( material.sheenColorMap ) {

				uniforms.sheenColorMap.value = material.sheenColorMap;

				refreshTransformUniform( material.sheenColorMap, uniforms.sheenColorMapTransform );

			}

			if ( material.sheenRoughnessMap ) {

				uniforms.sheenRoughnessMap.value = material.sheenRoughnessMap;

				refreshTransformUniform( material.sheenRoughnessMap, uniforms.sheenRoughnessMapTransform );

			}

		}

		if ( material.clearcoat > 0 ) {

			uniforms.clearcoat.value = material.clearcoat;
			uniforms.clearcoatRoughness.value = material.clearcoatRoughness;

			if ( material.clearcoatMap ) {

				uniforms.clearcoatMap.value = material.clearcoatMap;

				refreshTransformUniform( material.clearcoatMap, uniforms.clearcoatMapTransform );

			}

			if ( material.clearcoatRoughnessMap ) {

				uniforms.clearcoatRoughnessMap.value = material.clearcoatRoughnessMap;

				refreshTransformUniform( material.clearcoatRoughnessMap, uniforms.clearcoatRoughnessMapTransform );

			}

			if ( material.clearcoatNormalMap ) {

				uniforms.clearcoatNormalMap.value = material.clearcoatNormalMap;

				refreshTransformUniform( material.clearcoatNormalMap, uniforms.clearcoatNormalMapTransform );

				vec2Copy( material.clearcoatNormalScale, uniforms.clearcoatNormalScale.value );

				if ( material.side === BackSide ) {

					vec2Negate( uniforms.clearcoatNormalScale.value, uniforms.clearcoatNormalScale.value );

				}

			}

		}

		if ( material.dispersion > 0 ) {

			uniforms.dispersion.value = material.dispersion;

		}

		if ( material.retroreflectivity > 0 ) {

			uniforms.retroreflectivity.value = material.retroreflectivity;

		}

		if ( material.iridescence > 0 ) {

			uniforms.iridescence.value = material.iridescence;
			uniforms.iridescenceIOR.value = material.iridescenceIOR;
			uniforms.iridescenceThicknessMinimum.value = material.iridescenceThicknessRange[ 0 ];
			uniforms.iridescenceThicknessMaximum.value = material.iridescenceThicknessRange[ 1 ];

			if ( material.iridescenceMap ) {

				uniforms.iridescenceMap.value = material.iridescenceMap;

				refreshTransformUniform( material.iridescenceMap, uniforms.iridescenceMapTransform );

			}

			if ( material.iridescenceThicknessMap ) {

				uniforms.iridescenceThicknessMap.value = material.iridescenceThicknessMap;

				refreshTransformUniform( material.iridescenceThicknessMap, uniforms.iridescenceThicknessMapTransform );

			}

		}

		if ( material.transmission > 0 ) {

			uniforms.transmission.value = material.transmission;
			uniforms.transmissionSamplerMap.value = transmissionRenderTarget.texture;
			vec2Set( transmissionRenderTarget.width, transmissionRenderTarget.height, uniforms.transmissionSamplerSize.value );

			if ( material.transmissionMap ) {

				uniforms.transmissionMap.value = material.transmissionMap;

				refreshTransformUniform( material.transmissionMap, uniforms.transmissionMapTransform );

			}

			uniforms.thickness.value = material.thickness;

			if ( material.thicknessMap ) {

				uniforms.thicknessMap.value = material.thicknessMap;

				refreshTransformUniform( material.thicknessMap, uniforms.thicknessMapTransform );

			}

			uniforms.attenuationDistance.value = material.attenuationDistance;
			colorCopy( material.attenuationColor, uniforms.attenuationColor.value );

		}

		if ( material.anisotropy > 0 ) {

			vec2Set( material.anisotropy * Math.cos( material.anisotropyRotation ), material.anisotropy * Math.sin( material.anisotropyRotation ), uniforms.anisotropyVector.value );

			if ( material.anisotropyMap ) {

				uniforms.anisotropyMap.value = material.anisotropyMap;

				refreshTransformUniform( material.anisotropyMap, uniforms.anisotropyMapTransform );

			}

		}

		uniforms.specularIntensity.value = material.specularIntensity;
		colorCopy( material.specularColor, uniforms.specularColor.value );

		if ( material.specularColorMap ) {

			uniforms.specularColorMap.value = material.specularColorMap;

			refreshTransformUniform( material.specularColorMap, uniforms.specularColorMapTransform );

		}

		if ( material.specularIntensityMap ) {

			uniforms.specularIntensityMap.value = material.specularIntensityMap;

			refreshTransformUniform( material.specularIntensityMap, uniforms.specularIntensityMapTransform );

		}

	}

	function refreshUniformsMatcap( uniforms, material ) {

		if ( material.matcap ) {

			uniforms.matcap.value = material.matcap;

		}

	}

	function refreshUniformsDistance( uniforms, material ) {

		const light = properties.get( material ).light;

		vec3SetFromMatrixPosition( light.matrixWorld, uniforms.referencePosition.value );
		uniforms.nearDistance.value = light.shadow.camera.near;
		uniforms.farDistance.value = light.shadow.camera.far;

	}

	return {
		refreshFogUniforms: refreshFogUniforms,
		refreshMaterialUniforms: refreshMaterialUniforms
	};

}

export { WebGLMaterials };
