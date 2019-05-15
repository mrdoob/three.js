/**
* @author Richard M. / https://github.com/richardmonette
* @author WestLangley / http://github.com/WestLangley
*/

THREE.CubemapGenerator = function ( renderer ) {

	this.renderer = renderer;

};

THREE.CubemapGenerator.prototype.fromEquirectangular = function ( texture, options ) {

	options = options || {};

	var scene = new THREE.Scene();

	var shader = {

		uniforms: {
			tEquirect: { value: null },
		},

		vertexShader:

			`
			varying vec3 vWorldDirection;

			//include <common>
			vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

				return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

			}

			void main() {

				vWorldDirection = transformDirection( position, modelMatrix );

				#include <begin_vertex>
				#include <project_vertex>

			}
			`,

		fragmentShader:

			`
			uniform sampler2D tEquirect;

			varying vec3 vWorldDirection;

			//include <common>
			#define RECIPROCAL_PI 0.31830988618
			#define RECIPROCAL_PI2 0.15915494

			void main() {

				vec3 direction = normalize( vWorldDirection );

				vec2 sampleUV;

				sampleUV.y = asin( clamp( direction.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;

				sampleUV.x = atan( direction.z, direction.x ) * RECIPROCAL_PI2 + 0.5;

				gl_FragColor = texture2D( tEquirect, sampleUV );

			}
			`
	};

	var material = new THREE.ShaderMaterial( {

		type: 'CubemapFromEquirect',

		uniforms: THREE.UniformsUtils.clone( shader.uniforms ),
		vertexShader: shader.vertexShader,
		fragmentShader: shader.fragmentShader,
		side: THREE.BackSide,
		blending: THREE.NoBlending

	} );

	material.uniforms.tEquirect.value = texture;

	var mesh = new THREE.Mesh( new THREE.BoxBufferGeometry( 5, 5, 5 ), material );

	scene.add( mesh );

	var resolution = options.resolution || 512;

	var params = {
		type: texture.type,
		format: texture.format,
		encoding: texture.encoding,
		generateMipmaps: ( options.generateMipmaps !== undefined ) ? options.generateMipmaps : texture.generateMipmaps,
		minFilter: ( options.minFilter !== undefined ) ? options.minFilter : texture.minFilter,
		magFilter: ( options.magFilter !== undefined ) ? options.magFilter : texture.magFilter
	};

	var camera = new THREE.CubeCamera( 1, 10, resolution, params );

	camera.update( this.renderer, scene );

	mesh.geometry.dispose();
	mesh.material.dispose();

	return camera.renderTarget;

};

//

THREE.EquirectangularToCubeGenerator = ( function () {

	var camera = new THREE.PerspectiveCamera( 90, 1, 0.1, 10 );
	var scene = new THREE.Scene();
	var boxMesh = new THREE.Mesh( new THREE.BoxBufferGeometry( 1, 1, 1 ), getShader() );
	boxMesh.material.side = THREE.BackSide;
	scene.add( boxMesh );

	var EquirectangularToCubeGenerator = function ( sourceTexture, options ) {

		options = options || {};

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

			var currentRenderTarget = renderer.getRenderTarget();

			boxMesh.material.uniforms.equirectangularMap.value = this.sourceTexture;

			for ( var i = 0; i < 6; i ++ ) {

				this.renderTarget.activeCubeFace = i;

				var v = this.views[ i ];

				camera.position.set( 0, 0, 0 );
				camera.up.set( v.u[ 0 ], v.u[ 1 ], v.u[ 2 ] );
				camera.lookAt( v.t[ 0 ], v.t[ 1 ], v.t[ 2 ] );

				renderer.setRenderTarget( this.renderTarget );
				renderer.clear();
				renderer.render( scene, camera );

			}

			renderer.setRenderTarget( currentRenderTarget );

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
