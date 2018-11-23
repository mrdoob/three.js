/**
* @author Richard M. / https://github.com/richardmonette
*/

THREE.SHGenerator = function( sourceTexture ) {

	this.sourceTexture = sourceTexture;

	this.camera = new THREE.Camera();

	this.shader = this.getShader();

	this.planeMesh = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), this.shader );
	this.scene = new THREE.Scene();
	this.scene.add( this.planeMesh );

	var params = {
		format: THREE.RGBFormat,
		magFilter: THREE.NearestFilter,
		minFilter: THREE.NearestFilter,
		type: THREE.HalfFloatType,
	};

	this.renderTarget = new THREE.WebGLRenderTarget( 9, 1, params );
	this.renderTarget.texture.name = "SHTexture";
	this.renderTarget.texture.mapping = THREE.SphericalHarmonicReflectionMapping;

};

THREE.SHGenerator.prototype = {

	constructor : THREE.SHGenerator,

	update: function( renderer ) {

		var currentRenderTarget = renderer.getRenderTarget();

		renderer.setRenderTarget(this.renderTarget);
		renderer.clear();
		renderer.render( this.scene, this.camera );

		renderer.setRenderTarget( currentRenderTarget );

	},

	dispose: function () {

		this.shader.dispose();

	},

	getShader: function() {

		return new THREE.ShaderMaterial( {

			uniforms: {
				"cubeMap": { value: this.sourceTexture },
			},

			vertexShader:
				`
				void main() {
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}
				`,

			fragmentShader:
				`
				#include <common>
				uniform samplerCube cubeMap;

				vec3 calcSH(int id, vec3 dir, vec3 color) {
					float p_0_0 = 0.282094791773878140;
					float p_1_0 = 0.488602511902919920 * dir.z;
					float p_1_1 = -0.488602511902919920;
					float p_2_0 = 0.946174695757560080 * dir.z * dir.z - 0.315391565252520050;
					float p_2_1 = -1.092548430592079200 * dir.z;
					float p_2_2 = 0.546274215296039590;

					if (id == 0) {
						return color * p_0_0;
					} else if (id == 1) {
						return color * p_1_1 * dir.y;
					} else if (id == 2) {
						return color * p_1_0;
					} else if (id == 3) {
						return color * p_1_1 * dir.x;
					} else if (id == 4) {
						return color * p_2_2 * (dir.x * dir.y + dir.y * dir.x);
					} else if (id == 5) {
						return color * p_2_1 * dir.y;
					} else if (id == 6) {
						return color * p_2_0;
					} else if (id == 7) {
						return color * p_2_1 * dir.x;
					} else if (id == 8) {
						return color * p_2_2 * (dir.x * dir.x - dir.y * dir.y);
					}
				}

				#define SAMPLES 32

				void main() {
					vec3 samples;

					for (int t = 0; t < SAMPLES; t++) {
						for (int p = 0; p < SAMPLES; p++) {
							float theta = 2.0 * PI * float(t)/float(SAMPLES);
			        float phi = acos(1.0 - 2.0 * float(p)/float(SAMPLES));

			        float x = sin(phi) * cos(theta);
			        float y = sin(phi) * sin(theta);
			        float z = cos(phi);

							vec3 sampleDirection = normalize(vec3(x, y, z));

							vec3 envSample = textureCube(cubeMap, sampleDirection).rgb;

							samples += calcSH(int(gl_FragCoord.x), sampleDirection, envSample);
						}
					}

					gl_FragColor = vec4(samples / float(SAMPLES*SAMPLES), 1.0);
				}
				`,

		} );

	}

};

