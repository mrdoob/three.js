import {
	Mesh,
	ShaderMaterial,
	SphereGeometry
} from 'three';

class LightProbeHelper extends Mesh {

	constructor( lightProbe, size ) {

		const material = new ShaderMaterial( {

			type: 'LightProbeHelperMaterial',

			uniforms: {

				sh: { value: lightProbe.sh.coefficients }, // by reference

				intensity: { value: lightProbe.intensity }

			},

			vertexShader: [

				'varying vec3 vNormal;',

				'void main() {',

				'	vNormal = normalize( normalMatrix * normal );',

				'	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',

				'}',

			].join( '\n' ),

			fragmentShader: [

				'#define RECIPROCAL_PI 0.318309886',

				'vec3 inverseTransformDirection( in vec3 normal, in mat4 matrix ) {',

				'	// matrix is assumed to be orthogonal',

				'	return normalize( ( vec4( normal, 0.0 ) * matrix ).xyz );',

				'}',

				'// source: https://graphics.stanford.edu/papers/envmap/envmap.pdf',
				'vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {',

				'	// normal is assumed to have unit length',

				'	float x = normal.x, y = normal.y, z = normal.z;',

				'	// band 0',
				'	vec3 result = shCoefficients[ 0 ] * 0.886227;',

				'	// band 1',
				'	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;',
				'	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;',
				'	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;',

				'	// band 2',
				'	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;',
				'	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;',
				'	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );',
				'	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;',
				'	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );',

				'	return result;',

				'}',

				'uniform vec3 sh[ 9 ]; // sh coefficients',

				'uniform float intensity; // light probe intensity',

				'varying vec3 vNormal;',

				'void main() {',

				'	vec3 normal = normalize( vNormal );',

				'	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );',

				'	vec3 irradiance = shGetIrradianceAt( worldNormal, sh );',

				'	vec3 outgoingLight = RECIPROCAL_PI * irradiance * intensity;',

				'	gl_FragColor = linearToOutputTexel( vec4( outgoingLight, 1.0 ) );',

				'}'

			].join( '\n' )

		} );

		const geometry = new SphereGeometry( 1, 32, 16 );

		super( geometry, material );

		this.lightProbe = lightProbe;
		this.size = size;
		this.type = 'LightProbeHelper';

		this.onBeforeRender();

	}

	dispose() {

		this.geometry.dispose();
		this.material.dispose();

	}

	onBeforeRender() {

		this.position.copy( this.lightProbe.position );

		this.scale.set( 1, 1, 1 ).multiplyScalar( this.size );

		this.material.uniforms.intensity.value = this.lightProbe.intensity;

	}

}

export { LightProbeHelper };
