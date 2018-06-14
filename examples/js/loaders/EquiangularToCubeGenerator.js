/**
* @author Richard M. / https://github.com/richardmonette
*/

THREE.EquiangularToCubeGenerator = function ( sourceTexture, resolution ) {

	this.sourceTexture = sourceTexture;
	this.resolution = resolution;

 	this.views = [
		{ t: [ 1, 0, 0 ], u: [ 0, - 1, 0 ] },
		{ t: [ - 1, 0, 0 ], u: [ 0, - 1, 0 ] },
		{ t: [ 0, 1, 0 ], u: [ 0, 0, 1 ] },
		{ t: [ 0, - 1, 0 ], u: [ 0, 0, - 1 ] },
		{ t: [ 0, 0, 1 ], u: [ 0, - 1, 0 ] },
		{ t: [ 0, 0, - 1 ], u: [ 0, - 1, 0 ] },
	];

	this.camera = new THREE.PerspectiveCamera( 90, 1, 0.1, 10 );
	this.boxMesh = new THREE.Mesh( new THREE.BoxBufferGeometry( 1, 1, 1 ), this.getShader() );
	this.boxMesh.material.side = THREE.BackSide;
	this.scene = new THREE.Scene();
	this.scene.add( this.boxMesh );

	var params = {
		format: THREE.RGBAFormat,
		magFilter: this.sourceTexture.magFilter,
		minFilter: this.sourceTexture.minFilter,
		type: this.sourceTexture.type,
		generateMipmaps: this.sourceTexture.generateMipmaps,
		anisotropy: this.sourceTexture.anisotropy,
		encoding: this.sourceTexture.encoding
	};

	this.renderTarget = new THREE.WebGLRenderTargetCube( this.resolution, this.resolution, params );

};

THREE.EquiangularToCubeGenerator.prototype = {

	constructor: THREE.EquiangularToCubeGenerator,

	update: function ( renderer ) {

		for ( var i = 0; i < 6; i ++ ) {

			this.renderTarget.activeCubeFace = i;

			var v = this.views[ i ];

			this.camera.position.set( 0, 0, 0 );
			this.camera.up.set( v.u[ 0 ], v.u[ 1 ], v.u[ 2 ] );
			this.camera.lookAt( v.t[ 0 ], v.t[ 1 ], v.t[ 2 ] );

			renderer.render( this.scene, this.camera, this.renderTarget, true );

		}

		return this.renderTarget.texture;

	},

	getShader: function () {

		var shaderMaterial = new THREE.ShaderMaterial( {

			uniforms: {
				"equirectangularMap": { value: this.sourceTexture },
			},

			vertexShader:
				"varying vec3 localPosition;\n\
				\n\
				void main() {\n\
					localPosition = position;\n\
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n\
				}",

			fragmentShader:
				"#include <common>\n\
				varying vec3 localPosition;\n\
				uniform sampler2D equirectangularMap;\n\
				\n\
				vec2 EquiangularSampleUV(vec3 v) {\n\
			    vec2 uv = vec2(atan(v.z, v.x), asin(v.y));\n\
			    uv *= vec2(0.1591, 0.3183); // inverse atan\n\
			    uv += 0.5;\n\
			    return uv;\n\
				}\n\
				\n\
				void main() {\n\
					vec2 uv = EquiangularSampleUV(normalize(localPosition));\n\
    			vec3 color = texture2D(equirectangularMap, uv).rgb;\n\
    			\n\
					gl_FragColor = vec4( color, 1.0 );\n\
				}",

			blending: THREE.NoBlending

		} );

		shaderMaterial.type = 'EquiangularToCubeGenerator';

		return shaderMaterial;

	},

	dispose: function () {

		this.boxMesh.geometry.dispose();
		this.boxMesh.material.dispose();
		this.renderTarget.dispose();

	}

};
