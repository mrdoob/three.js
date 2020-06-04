/**
 * @author alteredq / http://alteredqualia.com/
 * @author mrdoob / http://mrdoob.com/
 */

import { FrontSide, BackSide, DoubleSide, RGBAFormat, NearestFilter, LinearFilter, PCFShadowMap, VSMShadowMap, RGBADepthPacking, NoBlending } from '../../constants.js';
import { WebGLRenderTarget } from '../WebGLRenderTarget.js';
import { MeshDepthMaterial } from '../../materials/MeshDepthMaterial.js';
import { MeshDistanceMaterial } from '../../materials/MeshDistanceMaterial.js';
import { ShaderMaterial } from '../../materials/ShaderMaterial.js';
import { BufferAttribute } from '../../core/BufferAttribute.js';
import { BufferGeometry } from '../../core/BufferGeometry.js';
import { Mesh } from '../../objects/Mesh.js';
import { Vector4 } from '../../math/Vector4.js';
import { Vector2 } from '../../math/Vector2.js';
import { Frustum } from '../../math/Frustum.js';

import vsm_frag from '../shaders/ShaderLib/vsm_frag.glsl.js';
import vsm_vert from '../shaders/ShaderLib/vsm_vert.glsl.js';

function WebGLShadowMap( _renderer, _objects, maxTextureSize ) {

	var _frustum = new Frustum(),

		_shadowMapSize = new Vector2(),
		_viewportSize = new Vector2(),

		_viewport = new Vector4(),

		_depthMaterials = [],
		_distanceMaterials = [],

		_materialCache = {};

	var shadowSide = { 0: BackSide, 1: FrontSide, 2: DoubleSide };

	var shadowMaterialVertical = new ShaderMaterial( {

		defines: {
			SAMPLE_RATE: 2.0 / 8.0,
			HALF_SAMPLE_RATE: 1.0 / 8.0
		},

		uniforms: {
			shadow_pass: { value: null },
			resolution: { value: new Vector2() },
			radius: { value: 4.0 }
		},

		vertexShader: vsm_vert,

		fragmentShader: vsm_frag

	} );

	var shadowMaterialHorizonal = shadowMaterialVertical.clone();
	shadowMaterialHorizonal.defines.HORIZONAL_PASS = 1;

	var fullScreenTri = new BufferGeometry();
	fullScreenTri.setAttribute(
		"position",
		new BufferAttribute(
			new Float32Array( [ - 1, - 1, 0.5, 3, - 1, 0.5, - 1, 3, 0.5 ] ),
			3
		)
	);

	var fullScreenMesh = new Mesh( fullScreenTri, shadowMaterialVertical );

	var scope = this;

	this.enabled = false;

	this.autoUpdate = true;
	this.needsUpdate = false;

	this.type = PCFShadowMap;

	this.render = function ( lights, scene, camera ) {

		if ( scope.enabled === false ) return;
		if ( scope.autoUpdate === false && scope.needsUpdate === false ) return;

		if ( lights.length === 0 ) return;

		var currentRenderTarget = _renderer.getRenderTarget();
		var activeCubeFace = _renderer.getActiveCubeFace();
		var activeMipmapLevel = _renderer.getActiveMipmapLevel();

		var _state = _renderer.state;

		// Set GL state for depth map.
		_state.setBlending( NoBlending );
		_state.buffers.color.setClear( 1, 1, 1, 1 );
		_state.buffers.depth.setTest( true );
		_state.setScissorTest( false );

		// render depth map

		for ( var i = 0, il = lights.length; i < il; i ++ ) {

			var light = lights[ i ];
			var shadow = light.shadow;

			if ( shadow === undefined ) {

				console.warn( 'THREE.WebGLShadowMap:', light, 'has no shadow.' );
				continue;

			}

			_shadowMapSize.copy( shadow.mapSize );

			var shadowFrameExtents = shadow.getFrameExtents();

			_shadowMapSize.multiply( shadowFrameExtents );

			_viewportSize.copy( shadow.mapSize );

			if ( _shadowMapSize.x > maxTextureSize || _shadowMapSize.y > maxTextureSize ) {

				if ( _shadowMapSize.x > maxTextureSize ) {

					_viewportSize.x = Math.floor( maxTextureSize / shadowFrameExtents.x );
					_shadowMapSize.x = _viewportSize.x * shadowFrameExtents.x;
					shadow.mapSize.x = _viewportSize.x;

				}

				if ( _shadowMapSize.y > maxTextureSize ) {

					_viewportSize.y = Math.floor( maxTextureSize / shadowFrameExtents.y );
					_shadowMapSize.y = _viewportSize.y * shadowFrameExtents.y;
					shadow.mapSize.y = _viewportSize.y;

				}

			}

			if ( shadow.map === null && ! shadow.isPointLightShadow && this.type === VSMShadowMap ) {

				var pars = { minFilter: LinearFilter, magFilter: LinearFilter, format: RGBAFormat };

				shadow.map = new WebGLRenderTarget( _shadowMapSize.x, _shadowMapSize.y, pars );
				shadow.map.texture.name = light.name + ".shadowMap";

				shadow.mapPass = new WebGLRenderTarget( _shadowMapSize.x, _shadowMapSize.y, pars );

				shadow.camera.updateProjectionMatrix();

			}

			if ( shadow.map === null ) {

				var pars = { minFilter: NearestFilter, magFilter: NearestFilter, format: RGBAFormat };

				shadow.map = new WebGLRenderTarget( _shadowMapSize.x, _shadowMapSize.y, pars );
				shadow.map.texture.name = light.name + ".shadowMap";

				shadow.camera.updateProjectionMatrix();

			}

			_renderer.setRenderTarget( shadow.map );
			_renderer.clear();

			var viewportCount = shadow.getViewportCount();

			for ( var vp = 0; vp < viewportCount; vp ++ ) {

				var viewport = shadow.getViewport( vp );

				_viewport.set(
					_viewportSize.x * viewport.x,
					_viewportSize.y * viewport.y,
					_viewportSize.x * viewport.z,
					_viewportSize.y * viewport.w
				);

				_state.viewport( _viewport );

				shadow.updateMatrices( light, vp );

				_frustum = shadow.getFrustum();

				renderObject( scene, camera, shadow.camera, light, this.type );

			}

			// do blur pass for VSM

			if ( ! shadow.isPointLightShadow && this.type === VSMShadowMap ) {

				VSMPass( shadow, camera );

			}

		}

		scope.needsUpdate = false;

		_renderer.setRenderTarget( currentRenderTarget, activeCubeFace, activeMipmapLevel );

	};

	function VSMPass( shadow, camera ) {

		var geometry = _objects.update( fullScreenMesh );

		// vertical pass

		shadowMaterialVertical.uniforms.shadow_pass.value = shadow.map.texture;
		shadowMaterialVertical.uniforms.resolution.value = shadow.mapSize;
		shadowMaterialVertical.uniforms.radius.value = shadow.radius;
		_renderer.setRenderTarget( shadow.mapPass );
		_renderer.clear();
		_renderer.renderBufferDirect( camera, null, geometry, shadowMaterialVertical, fullScreenMesh, null );

		// horizonal pass

		shadowMaterialHorizonal.uniforms.shadow_pass.value = shadow.mapPass.texture;
		shadowMaterialHorizonal.uniforms.resolution.value = shadow.mapSize;
		shadowMaterialHorizonal.uniforms.radius.value = shadow.radius;
		_renderer.setRenderTarget( shadow.map );
		_renderer.clear();
		_renderer.renderBufferDirect( camera, null, geometry, shadowMaterialHorizonal, fullScreenMesh, null );

	}

	function getDepthMaterialVariant( useMorphing, useSkinning, useInstancing ) {

		var index = useMorphing << 0 | useSkinning << 1 | useInstancing << 2;

		var material = _depthMaterials[ index ];

		if ( material === undefined ) {

			material = new MeshDepthMaterial( {

				depthPacking: RGBADepthPacking,

				morphTargets: useMorphing,
				skinning: useSkinning

			} );

			_depthMaterials[ index ] = material;

		}

		return material;

	}

	function getDistanceMaterialVariant( useMorphing, useSkinning, useInstancing ) {

		var index = useMorphing << 0 | useSkinning << 1 | useInstancing << 2;

		var material = _distanceMaterials[ index ];

		if ( material === undefined ) {

			material = new MeshDistanceMaterial( {

				morphTargets: useMorphing,
				skinning: useSkinning

			} );

			_distanceMaterials[ index ] = material;

		}

		return material;

	}

	function getDepthMaterial( object, geometry, material, light, shadowCameraNear, shadowCameraFar, type ) {

		var result = null;

		var getMaterialVariant = getDepthMaterialVariant;
		var customMaterial = object.customDepthMaterial;

		if ( light.isPointLight === true ) {

			getMaterialVariant = getDistanceMaterialVariant;
			customMaterial = object.customDistanceMaterial;

		}

		if ( customMaterial === undefined ) {

			var useMorphing = false;

			if ( material.morphTargets === true ) {

				useMorphing = geometry.morphAttributes && geometry.morphAttributes.position && geometry.morphAttributes.position.length > 0;

			}

			var useSkinning = false;

			if ( object.isSkinnedMesh === true ) {

				if ( material.skinning === true ) {

					useSkinning = true;

				} else {

					console.warn( 'THREE.WebGLShadowMap: THREE.SkinnedMesh with material.skinning set to false:', object );

				}

			}

			var useInstancing = object.isInstancedMesh === true;

			result = getMaterialVariant( useMorphing, useSkinning, useInstancing );

		} else {

			result = customMaterial;

		}

		if ( _renderer.localClippingEnabled &&
				material.clipShadows === true &&
				material.clippingPlanes.length !== 0 ) {

			// in this case we need a unique material instance reflecting the
			// appropriate state

			var keyA = result.uuid, keyB = material.uuid;

			var materialsForVariant = _materialCache[ keyA ];

			if ( materialsForVariant === undefined ) {

				materialsForVariant = {};
				_materialCache[ keyA ] = materialsForVariant;

			}

			var cachedMaterial = materialsForVariant[ keyB ];

			if ( cachedMaterial === undefined ) {

				cachedMaterial = result.clone();
				materialsForVariant[ keyB ] = cachedMaterial;

			}

			result = cachedMaterial;

		}

		result.visible = material.visible;
		result.wireframe = material.wireframe;

		if ( type === VSMShadowMap ) {

			result.side = ( material.shadowSide !== null ) ? material.shadowSide : material.side;

		} else {

			result.side = ( material.shadowSide !== null ) ? material.shadowSide : shadowSide[ material.side ];

		}

		result.clipShadows = material.clipShadows;
		result.clippingPlanes = material.clippingPlanes;
		result.clipIntersection = material.clipIntersection;

		result.wireframeLinewidth = material.wireframeLinewidth;
		result.linewidth = material.linewidth;

		if ( light.isPointLight === true && result.isMeshDistanceMaterial === true ) {

			result.referencePosition.setFromMatrixPosition( light.matrixWorld );
			result.nearDistance = shadowCameraNear;
			result.farDistance = shadowCameraFar;

		}

		return result;

	}

	function renderObject( object, camera, shadowCamera, light, type ) {

		if ( object.visible === false ) return;

		var visible = object.layers.test( camera.layers );

		if ( visible && ( object.isMesh || object.isLine || object.isPoints ) ) {

			if ( ( object.castShadow || ( object.receiveShadow && type === VSMShadowMap ) ) && ( ! object.frustumCulled || _frustum.intersectsObject( object ) ) ) {

				object.modelViewMatrix.multiplyMatrices( shadowCamera.matrixWorldInverse, object.matrixWorld );

				var geometry = _objects.update( object );
				var material = object.material;

				if ( Array.isArray( material ) ) {

					var groups = geometry.groups;

					for ( var k = 0, kl = groups.length; k < kl; k ++ ) {

						var group = groups[ k ];
						var groupMaterial = material[ group.materialIndex ];

						if ( groupMaterial && groupMaterial.visible ) {

							var depthMaterial = getDepthMaterial( object, geometry, groupMaterial, light, shadowCamera.near, shadowCamera.far, type );

							_renderer.renderBufferDirect( shadowCamera, null, geometry, depthMaterial, object, group );

						}

					}

				} else if ( material.visible ) {

					var depthMaterial = getDepthMaterial( object, geometry, material, light, shadowCamera.near, shadowCamera.far, type );

					_renderer.renderBufferDirect( shadowCamera, null, geometry, depthMaterial, object, null );

				}

			}

		}

		var children = object.children;

		for ( var i = 0, l = children.length; i < l; i ++ ) {

			renderObject( children[ i ], camera, shadowCamera, light, type );

		}

	}

}


export { WebGLShadowMap };
