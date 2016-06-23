/**
 * @author Prashant Sharma / spidersharma03
 * @author Ben Houston / bhouston, https://clara.io
 *
 * This class takes the cube lods(corresponding to different roughness values), and creates a single cubeUV
 * Texture. The format for a given roughness set of faces is simply::
 * +X+Y+Z
 * -X-Y-Z
 * For every roughness a mip map chain is also saved, which is essential to remove the texture artifacts due to
 * minification.
 * Right now for every face a PlaneMesh is drawn, which leads to a lot of geometry draw calls, but can be replaced
 * later by drawing a single buffer and by sending the appropriate faceIndex via vertex attributes.
 * The arrangement of the faces is fixed, as assuming this arrangement, the sampling function has been written.
 */


THREE.PMREMCubeUVPacker = function( cubeTextureLods, numLods ) {

	this.cubeLods = cubeTextureLods;
	this.numLods = numLods;
	var size = cubeTextureLods[ 0 ].width * 4;

	var sourceTexture = cubeTextureLods[ 0 ].texture;
	var params = {
		format: sourceTexture.format,
		magFilter: sourceTexture.magFilter,
		minFilter: sourceTexture.minFilter,
		type: sourceTexture.type,
		generateMipmaps: sourceTexture.generateMipmaps,
		anisotropy: sourceTexture.anisotropy,
		encoding: sourceTexture.encoding
	};

	this.CubeUVRenderTarget = new THREE.WebGLRenderTarget( size, size, params );
	this.CubeUVRenderTarget.texture.mapping = THREE.CubeUVReflectionMapping;
	this.camera = new THREE.OrthographicCamera( - size * 0.5, size * 0.5, - size * 0.5, size * 0.5, 0.0, 1000 );

	this.scene = new THREE.Scene();
	this.scene.add( this.camera );

	this.objects = [];
	var xOffset = 0;
	var faceOffsets = [];
	faceOffsets.push( new THREE.Vector2( 0, 0 ) );
	faceOffsets.push( new THREE.Vector2( 1, 0 ) );
	faceOffsets.push( new THREE.Vector2( 2, 0 ) );
	faceOffsets.push( new THREE.Vector2( 0, 1 ) );
	faceOffsets.push( new THREE.Vector2( 1, 1 ) );
	faceOffsets.push( new THREE.Vector2( 2, 1 ) );
	var yOffset = 0;
	var textureResolution = size;
	size = cubeTextureLods[ 0 ].width;

	var offset2 = 0;
	var c = 4.0;
	this.numLods = Math.log2( cubeTextureLods[ 0 ].width ) - 2;
	for ( var i = 0; i < this.numLods; i ++ ) {

		var offset1 = ( textureResolution - textureResolution / c ) * 0.5;
		if ( size > 16 )
		c *= 2;
		var nMips = size > 16 ? 6 : 1;
		var mipOffsetX = 0;
		var mipOffsetY = 0;
		var mipSize = size;

		for ( var j = 0; j < nMips; j ++ ) {

			// Mip Maps
			for ( var k = 0; k < 6; k ++ ) {

				// 6 Cube Faces
				var material = this.getShader();
				material.uniforms[ 'envMap' ].value = this.cubeLods[ i ].texture;
				material.envMap = this.cubeLods[ i ].texture;
				material.uniforms[ 'faceIndex' ].value = k;
				material.uniforms[ 'mapSize' ].value = mipSize;
				var color = material.uniforms[ 'testColor' ].value;
				//color.copy(testColor[j]);
				var planeMesh = new THREE.Mesh(
				new THREE.PlaneGeometry( mipSize, mipSize, 0 ),
				material );
				planeMesh.position.x = faceOffsets[ k ].x * mipSize - offset1 + mipOffsetX;
				planeMesh.position.y = faceOffsets[ k ].y * mipSize - offset1 + offset2 + mipOffsetY;
				planeMesh.material.side = THREE.DoubleSide;
				this.scene.add( planeMesh );
				this.objects.push( planeMesh );

			}
			mipOffsetY += 1.75 * mipSize;
			mipOffsetX += 1.25 * mipSize;
			mipSize /= 2;

		}
		offset2 += 2 * size;
		if ( size > 16 )
		size /= 2;

	}

};

THREE.PMREMCubeUVPacker.prototype = {

	constructor : THREE.PMREMCubeUVPacker,

	update: function( renderer ) {

		var gammaInput = renderer.gammaInput;
		var gammaOutput = renderer.gammaOutput;
		var toneMapping = renderer.toneMapping;
		var toneMappingExposure = renderer.toneMappingExposure;
		renderer.gammaInput = false;
		renderer.gammaOutput = false;
		renderer.toneMapping = THREE.LinearToneMapping;
		renderer.toneMappingExposure = 1.0;
		renderer.render( this.scene, this.camera, this.CubeUVRenderTarget, false );

		renderer.toneMapping = toneMapping;
		renderer.toneMappingExposure = toneMappingExposure;
		renderer.gammaInput = gammaInput;
		renderer.gammaOutput = gammaOutput;

	},

	getShader: function() {

		var shaderMaterial = new THREE.ShaderMaterial( {

			uniforms: {
				"faceIndex": { value: 0 },
				"mapSize": { value: 0 },
				"envMap": { value: null },
				"testColor": { value: new THREE.Vector3( 1, 1, 1 ) }
			},

			vertexShader:
				"precision highp float;\
				varying vec2 vUv;\
				void main() {\
					vUv = uv;\
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\
				}",

			fragmentShader:
				"precision highp float;\
				varying vec2 vUv;\
				uniform samplerCube envMap;\
				uniform float mapSize;\
				uniform vec3 testColor;\
				uniform int faceIndex;\
				\
				void main() {\
					vec3 sampleDirection;\
					vec2 uv = vUv;\
					uv = uv * 2.0 - 1.0;\
					uv.y *= -1.0;\
					if(faceIndex == 0) {\
						sampleDirection = normalize(vec3(1.0, uv.y, -uv.x));\
					} else if(faceIndex == 1) {\
						sampleDirection = normalize(vec3(uv.x, 1.0, uv.y));\
					} else if(faceIndex == 2) {\
						sampleDirection = normalize(vec3(uv.x, uv.y, 1.0));\
					} else if(faceIndex == 3) {\
						sampleDirection = normalize(vec3(-1.0, uv.y, uv.x));\
					} else if(faceIndex == 4) {\
						sampleDirection = normalize(vec3(uv.x, -1.0, -uv.y));\
					} else {\
						sampleDirection = normalize(vec3(-uv.x, uv.y, -1.0));\
					}\
					vec4 color = envMapTexelToLinear( textureCube( envMap, sampleDirection ) );\
					gl_FragColor = linearToOutputTexel( color );\
				}",

			blending: THREE.CustomBlending,
			premultipliedAlpha: false,
			blendSrc: THREE.OneFactor,
			blendDst: THREE.ZeroFactor,
			blendSrcAlpha: THREE.OneFactor,
			blendDstAlpha: THREE.ZeroFactor,
			blendEquation: THREE.AddEquation

		} );

		return shaderMaterial;

	}

};
