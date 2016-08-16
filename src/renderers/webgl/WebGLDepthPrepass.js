THREE.WebGLDepthPrepass = function( _renderer ) {

	var _gl = _renderer.context,
	_state = _renderer.state,

	_MorphingFlag = 1,
	_SkinningFlag = 2,

	_NumberOfMaterialVariants = ( _MorphingFlag | _SkinningFlag ) + 1,

	_depthMaterials = new Array( _NumberOfMaterialVariants ),

	_materialDepthWriteCache = [],
	_depthMaterialColorWriteCache = [],

	_enabled = false;

	var scope = this;

	// Init.

	var depthMaterialTemplate = new THREE.MeshDepthMaterial();
	depthMaterialTemplate.clipping = true;

	for ( var i = 0; i !== _NumberOfMaterialVariants; ++ i ) {

		var useMorphing = ( i & _MorphingFlag ) !== 0;
		var useSkinning = ( i & _SkinningFlag ) !== 0;

		var depthMaterial = depthMaterialTemplate.clone();
		depthMaterial.morphTargets = useMorphing;
		depthMaterial.skinning = useSkinning;

		_depthMaterials[ i ] = depthMaterial;

	}

	//

	this.autoUpdate = true;
	this.needsUpdate = false;

	this.enable = function() {

		_enabled = true;

	};

	this.disable = function() {

		for ( var j = 0, jl = _materialDepthWriteCache.length; j < jl; j ++ ) {

			_materialDepthWriteCache[ j ].depthWrite = true;

		}
		for ( var j = 0, jl = _depthMaterialColorWriteCache.length; j < jl; j ++ ) {

			_depthMaterialColorWriteCache[ j ].colorWrite = true;

		}

		_materialDepthWriteCache = [];
		_depthMaterialColorWriteCache = [];

		_enabled = false;

	};

	this.render = function( objects, camera ) {

		if ( _enabled === false ) return;
		if ( scope.autoUpdate === false && scope.needsUpdate === false ) return;

		for ( var j = 0, jl = objects.length; j < jl; j ++ ) {

			var object = objects[ j ].object;
			var geometry = objects[ j ].geometry;
			var material = objects[ j ].material;

			// It is calculated again in main pass.
			object.modelViewMatrix.multiplyMatrices( camera.matrixWorldInverse, object.matrixWorld );

			if ( material instanceof THREE.MultiMaterial ) {

				var groups = geometry.groups;
				var materials = material.materials;

				for ( var k = 0, kl = groups.length; k < kl; k ++ ) {

					var group = groups[ k ];
					var groupMaterial = materials[ group.materialIndex ];

					var depthMaterial = getDepthMaterial( object, groupMaterial );

					if ( depthMaterial.colorWrite === true ) {

						_depthMaterialColorWriteCache.push( depthMaterial );
						depthMaterial.colorWrite = false;

					}

					if ( material.depthWrite === true ) {

						_materialDepthWriteCache.push( material );
						material.depthWrite = false;

					}

					_renderer.renderBufferDirect( camera, null, geometry, depthMaterial, object, group );

				}

			} else {

				var depthMaterial = getDepthMaterial( object, material );

				if ( depthMaterial.colorWrite === true ) {

					_depthMaterialColorWriteCache.push( depthMaterial );
					depthMaterial.colorWrite = false;

				}

				if ( material.depthWrite === true ) {

					_materialDepthWriteCache.push( material );
					material.depthWrite = false;

				}

				_renderer.renderBufferDirect( camera, null, geometry, depthMaterial, object, null );

			}

		}

		scope.needsUpdate = false;

	};

	function getDepthMaterial( object, material ) {

		var geometry = object.geometry;

		var result = null;

		var materialVariants = _depthMaterials;
		var customMaterial = object.customDepthMaterial;

		if ( ! customMaterial ) {

			var useMorphing = geometry.morphTargets !== undefined &&
					geometry.morphTargets.length > 0 && material.morphTargets;

			var useSkinning = object instanceof THREE.SkinnedMesh && material.skinning;

			var variantIndex = 0;

			if ( useMorphing ) variantIndex |= _MorphingFlag;
			if ( useSkinning ) variantIndex |= _SkinningFlag;

			result = materialVariants[ variantIndex ];

		} else {

			result = customMaterial;

		}

		result.visible = material.visible;
		result.wireframe = material.wireframe;
		result.side = material.side;
		result.clipShadows = material.clipShadows;
		result.clippingPlanes = material.clippingPlanes;
		result.wireframeLinewidth = material.wireframeLinewidth;
		result.linewidth = material.linewidth;

		return result;

	}

};
