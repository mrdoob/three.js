
THREE.WebGLRenderer.Object3DRenderer = function ( lowlevelrenderer, info ) {

	this.renderer = lowlevelrenderer;
	this.info = info;

};

THREE.extend( THREE.WebGLRenderer.Object3DRenderer.prototype, {

	getBufferMaterial: function ( object, geometryGroup ) {

		return object.material instanceof THREE.MeshFaceMaterial
			? object.material.materials[ geometryGroup.materialIndex ]
			: object.material;

	},

	bufferGuessUVType: function ( material ) {

		// material must use some texture to require uvs

		if ( material.map || material.lightMap || material.bumpMap || material.normalMap || material.specularMap || material instanceof THREE.ShaderMaterial ) {

			return true;

		}

		return false;

	},

	bufferGuessNormalType: function ( material ) {

		// only MeshBasicMaterial and MeshDepthMaterial don't need normals

		if ( ( material instanceof THREE.MeshBasicMaterial && !material.envMap ) || material instanceof THREE.MeshDepthMaterial ) {

			return false;

		}

		if ( this.materialNeedsSmoothNormals( material ) ) {

			return THREE.SmoothShading;

		} else {

			return THREE.FlatShading;

		}

	},

	materialNeedsSmoothNormals: function ( material ) {

		return material && material.shading !== undefined && material.shading === THREE.SmoothShading;

	},

	bufferGuessVertexColorType: function ( material ) {

		if ( material.vertexColors ) {

			return material.vertexColors;

		}

		return false;

	},

	initCustomAttributes: function ( geometry, object ) {

		var nvertices = geometry.vertices.length;

		var material = object.material;

		if ( material.attributes ) {

			if ( geometry.__webglCustomAttributesList === undefined ) {

				geometry.__webglCustomAttributesList = [];

			}

			for ( var a in material.attributes ) {

				var attribute = material.attributes[ a ];

				if ( !attribute.__webglInitialized || attribute.createUniqueBuffers ) {

					attribute.__webglInitialized = true;

					var size = 1;		// "f" and "i"

					if ( attribute.type === "v2" ) size = 2;
					else if ( attribute.type === "v3" ) size = 3;
					else if ( attribute.type === "v4" ) size = 4;
					else if ( attribute.type === "c"  ) size = 3;

					attribute.size = size;

					attribute.array = new Float32Array( nvertices * size );

					attribute.buffer = this.renderer.createBuffer();
					attribute.buffer.belongsToAttribute = a;

					attribute.needsUpdate = true;

				}

				geometry.__webglCustomAttributesList.push( attribute );

			}

		}

	},

	numericalSort: function ( a, b ) {

		return b[ 0 ] - a[ 0 ];

	}

} );
