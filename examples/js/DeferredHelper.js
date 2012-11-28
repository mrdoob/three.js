/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.DeferredHelper = function ( parameters ) {

	var width = parameters.width;
	var height = parameters.height;

	var black = new THREE.Color( 0x000000 );

	var colorShader = THREE.ShaderDeferred[ "color" ];
	var normalShader = THREE.ShaderDeferred[ "normals" ];
	var bumpShader = THREE.ShaderDeferred[ "bump" ];
	var clipDepthShader = THREE.ShaderDeferred[ "clipDepth" ];

	this.unlitShader = THREE.ShaderDeferred[ "unlit" ];
	this.lightShader = THREE.ShaderDeferred[ "light" ];
	this.compositeShader = THREE.ShaderDeferred[ "composite" ];

	this.unlitShader.uniforms[ "viewWidth" ].value = width;
	this.unlitShader.uniforms[ "viewHeight" ].value = height;

	this.lightShader.uniforms[ "viewWidth" ].value = width;
	this.lightShader.uniforms[ "viewHeight" ].value = height;

	var matNormal = new THREE.ShaderMaterial( {

		uniforms:       THREE.UniformsUtils.clone( normalShader.uniforms ),
		vertexShader:   normalShader.vertexShader,
		fragmentShader: normalShader.fragmentShader

	} );

	var matClipDepth = new THREE.ShaderMaterial( {

		uniforms:       THREE.UniformsUtils.clone( clipDepthShader.uniforms ),
		vertexShader:   clipDepthShader.vertexShader,
		fragmentShader: clipDepthShader.fragmentShader

	} );

	this.addDeferredMaterials = function ( object ) {

		object.traverse( function( node ) {

			if ( !node.material ) return;

			var originalMaterial = node.material;

			// color material
			// 	diffuse color
			//	specular color
			//	shininess
			//	diffuse map
			//	vertex colors
			//	alphaTest
			// 	morphs

			var uniforms = THREE.UniformsUtils.clone( colorShader.uniforms );
			var defines = { "USE_MAP": !! originalMaterial.map, "GAMMA_INPUT": true };

			var material = new THREE.ShaderMaterial( {

				fragmentShader: colorShader.fragmentShader,
				vertexShader: 	colorShader.vertexShader,
				uniforms: 		uniforms,
				defines: 		defines,
				shading:		originalMaterial.shading

			} );

			var diffuse = originalMaterial.color;
			var specular = originalMaterial.specular !== undefined ? originalMaterial.specular : black;
			var shininess = originalMaterial.shininess !== undefined ? originalMaterial.shininess : 1;

			uniforms.diffuse.value.copy( diffuse );
			uniforms.specular.value.copy( specular );
			uniforms.shininess.value = shininess;

			uniforms.map.value = originalMaterial.map;

			material.vertexColors = originalMaterial.vertexColors;
			material.morphTargets = originalMaterial.morphTargets;
			material.morphNormals = originalMaterial.morphNormals;

			material.alphaTest = originalMaterial.alphaTest;

			if ( originalMaterial.bumpMap ) {

				var offset = originalMaterial.bumpMap.offset;
				var repeat = originalMaterial.bumpMap.repeat;

				uniforms.offsetRepeat.value.set( offset.x, offset.y, repeat.x, repeat.y );

			}

			node.properties.colorMaterial = material;

			// normal material
			//	vertex normals
			//	morph normals
			//	bump map
			//	bump scale

			if ( originalMaterial.bumpMap ) {

				var uniforms = THREE.UniformsUtils.clone( bumpShader.uniforms );

				var normalMaterial = new THREE.ShaderMaterial( {

					uniforms: 		uniforms,
					vertexShader: 	bumpShader.vertexShader,
					fragmentShader: bumpShader.fragmentShader,
					defines:		{ "USE_BUMPMAP": true }

				} );

				uniforms.bumpMap.value = originalMaterial.bumpMap;
				uniforms.bumpScale.value = originalMaterial.bumpScale;

				var offset = originalMaterial.bumpMap.offset;
				var repeat = originalMaterial.bumpMap.repeat;

				uniforms.offsetRepeat.value.set( offset.x, offset.y, repeat.x, repeat.y );

				node.properties.normalMaterial = normalMaterial;

			} else if ( originalMaterial.morphTargets ) {

				var normalMaterial = new THREE.ShaderMaterial( {

					uniforms:       THREE.UniformsUtils.clone( normalShader.uniforms ),
					vertexShader:   normalShader.vertexShader,
					fragmentShader: normalShader.fragmentShader,
					shading:		originalMaterial.shading

				} );

				normalMaterial.morphTargets = originalMaterial.morphTargets;
				normalMaterial.morphNormals = originalMaterial.morphNormals;

				node.properties.normalMaterial = normalMaterial;

			} else {

				node.properties.normalMaterial = matNormal;

			}

			// depth material

			if ( originalMaterial.morphTargets ) {

				var depthMaterial = new THREE.ShaderMaterial( {

					uniforms:       THREE.UniformsUtils.clone( clipDepthShader.uniforms ),
					vertexShader:   clipDepthShader.vertexShader,
					fragmentShader: clipDepthShader.fragmentShader

				} );

				depthMaterial.morphTargets = originalMaterial.morphTargets;

				node.properties.depthMaterial = depthMaterial;

			} else {

				node.properties.depthMaterial = matClipDepth;

			}

		} );

	}

};