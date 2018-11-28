/**
* @author Richard M. / https://github.com/richardmonette
*/

THREE.EquirectangularToCubeGenerator = ( function () {

	var camera = new THREE.PerspectiveCamera( 90, 1, 0.1, 10 );
	var scene = new THREE.Scene();
	var boxMesh = new THREE.Mesh( new THREE.BoxBufferGeometry( 1, 1, 1 ), getShader() );
	boxMesh.material.side = THREE.BackSide;
	scene.add( boxMesh );

	var EquirectangularToCubeGenerator = function ( sourceTexture, options ) {

		this.sourceTexture = sourceTexture;
		this.resolution = options.resolution || 512;

		this.views = [
			{ t: [ 1, 0, 0 ], u: [ 0, - 1, 0 ] },
			{ t: [ - 1, 0, 0 ], u: [ 0, - 1, 0 ] },
			{ t: [ 0, 1, 0 ], u: [ 0, 0, 1 ] },
			{ t: [ 0, - 1, 0 ], u: [ 0, 0, - 1 ] },
			{ t: [ 0, 0, 1 ], u: [ 0, - 1, 0 ] },
			{ t: [ 0, 0, - 1 ], u: [ 0, - 1, 0 ] },
		];

		var params = {
			format: options.format || this.sourceTexture.format,
			magFilter: this.sourceTexture.magFilter,
			minFilter: this.sourceTexture.minFilter,
			type: options.type || this.sourceTexture.type,
			generateMipmaps: this.sourceTexture.generateMipmaps,
			anisotropy: this.sourceTexture.anisotropy,
			encoding: this.sourceTexture.encoding
		};

		this.renderTarget = new THREE.WebGLRenderTargetCube( this.resolution, this.resolution, params );

	};

	EquirectangularToCubeGenerator.prototype = {

		constructor: EquirectangularToCubeGenerator,

		update: function ( renderer ) {

			boxMesh.material.uniforms.equirectangularMap.value = this.sourceTexture;

			for ( var i = 0; i < 6; i ++ ) {

				this.renderTarget.activeCubeFace = i;

				var v = this.views[ i ];

				camera.position.set( 0, 0, 0 );
				camera.up.set( v.u[ 0 ], v.u[ 1 ], v.u[ 2 ] );
				camera.lookAt( v.t[ 0 ], v.t[ 1 ], v.t[ 2 ] );

				renderer.render( scene, camera, this.renderTarget, true );

			}

			return this.renderTarget.texture;

		},

		dispose: function () {

			this.renderTarget.dispose();

		}

	};

	function getShader() {

		var shaderMaterial = new THREE.ShaderMaterial( {

			uniforms: {
				"equirectangularMap": { value: null },
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
        vec2 EquirectangularSampleUV(vec3 v) {\n\
          vec2 uv = vec2(atan(v.z, v.x), asin(v.y));\n\
          uv *= vec2(0.1591, 0.3183); // inverse atan\n\
          uv += 0.5;\n\
          return uv;\n\
        }\n\
        \n\
        void main() {\n\
          vec2 uv = EquirectangularSampleUV(normalize(localPosition));\n\
          gl_FragColor = texture2D(equirectangularMap, uv);\n\
        }",

			blending: THREE.NoBlending

		} );

		shaderMaterial.type = 'EquirectangularToCubeGenerator';

		return shaderMaterial;

	}

	return EquirectangularToCubeGenerator;

} )();
