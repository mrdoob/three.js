( function () {

	/**
 * ------------------------------------------------------------------------------------------
 * Subsurface Scattering shader
 * Based on GDC 2011 – Approximating Translucency for a Fast, Cheap and Convincing Subsurface Scattering Look
 * https://colinbarrebrisebois.com/2011/03/07/gdc-2011-approximating-translucency-for-a-fast-cheap-and-convincing-subsurface-scattering-look/
 *------------------------------------------------------------------------------------------
 */

	function replaceAll( string, find, replace ) {

		return string.split( find ).join( replace );

	}

	const meshphong_frag_head = THREE.ShaderChunk[ 'meshphong_frag' ].slice( 0, THREE.ShaderChunk[ 'meshphong_frag' ].indexOf( 'void main() {' ) );
	const meshphong_frag_body = THREE.ShaderChunk[ 'meshphong_frag' ].slice( THREE.ShaderChunk[ 'meshphong_frag' ].indexOf( 'void main() {' ) );
	const SubsurfaceScatteringShader = {
		uniforms: THREE.UniformsUtils.merge( [ THREE.ShaderLib[ 'phong' ].uniforms, {
			'thicknessMap': {
				value: null
			},
			'thicknessColor': {
				value: new THREE.Color( 0xffffff )
			},
			'thicknessDistortion': {
				value: 0.1
			},
			'thicknessAmbient': {
				value: 0.0
			},
			'thicknessAttenuation': {
				value: 0.1
			},
			'thicknessPower': {
				value: 2.0
			},
			'thicknessScale': {
				value: 10.0
			}
		} ] ),
		vertexShader: [ '#define USE_UV', THREE.ShaderChunk[ 'meshphong_vert' ] ].join( '\n' ),
		fragmentShader: [ '#define USE_UV', '#define SUBSURFACE', meshphong_frag_head, 'uniform sampler2D thicknessMap;', 'uniform float thicknessPower;', 'uniform float thicknessScale;', 'uniform float thicknessDistortion;', 'uniform float thicknessAmbient;', 'uniform float thicknessAttenuation;', 'uniform vec3 thicknessColor;', 'void RE_Direct_Scattering(const in IncidentLight directLight, const in vec2 uv, const in GeometricContext geometry, inout ReflectedLight reflectedLight) {', '	vec3 thickness = thicknessColor * texture2D(thicknessMap, uv).r;', '	vec3 scatteringHalf = normalize(directLight.direction + (geometry.normal * thicknessDistortion));', '	float scatteringDot = pow(saturate(dot(geometry.viewDir, -scatteringHalf)), thicknessPower) * thicknessScale;', '	vec3 scatteringIllu = (scatteringDot + thicknessAmbient) * thickness;', '	reflectedLight.directDiffuse += scatteringIllu * thicknessAttenuation * directLight.color;', '}', meshphong_frag_body.replace( '#include <lights_fragment_begin>', replaceAll( THREE.ShaderChunk[ 'lights_fragment_begin' ], 'RE_Direct( directLight, geometry, material, reflectedLight );', [ 'RE_Direct( directLight, geometry, material, reflectedLight );', '#if defined( SUBSURFACE ) && defined( USE_UV )', ' RE_Direct_Scattering(directLight, vUv, geometry, reflectedLight);', '#endif' ].join( '\n' ) ) ) ].join( '\n' )
	};

	THREE.SubsurfaceScatteringShader = SubsurfaceScatteringShader;

} )();
