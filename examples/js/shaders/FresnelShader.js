console.warn( "THREE.FresnelShader: As part of the transition to ES6 Modules, the files in 'examples/js' were deprecated in May 2020 (r117) and will be deleted in December 2020 (r124). You can find more information about developing using ES6 Modules in https://threejs.org/docs/index.html#manual/en/introduction/Import-via-modules." );
/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Based on Nvidia Cg tutorial
 */

THREE.FresnelShader = {

	uniforms: {

		"mRefractionRatio": { value: 1.02 },
		"mFresnelBias": { value: 0.1 },
		"mFresnelPower": { value: 2.0 },
		"mFresnelScale": { value: 1.0 },
		"tCube": { value: null }

	},

	vertexShader: [

		"uniform float mRefractionRatio;",
		"uniform float mFresnelBias;",
		"uniform float mFresnelScale;",
		"uniform float mFresnelPower;",

		"varying vec3 vReflect;",
		"varying vec3 vRefract[3];",
		"varying float vReflectionFactor;",

		"void main() {",

		"	vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
		"	vec4 worldPosition = modelMatrix * vec4( position, 1.0 );",

		"	vec3 worldNormal = normalize( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * normal );",

		"	vec3 I = worldPosition.xyz - cameraPosition;",

		"	vReflect = reflect( I, worldNormal );",
		"	vRefract[0] = refract( normalize( I ), worldNormal, mRefractionRatio );",
		"	vRefract[1] = refract( normalize( I ), worldNormal, mRefractionRatio * 0.99 );",
		"	vRefract[2] = refract( normalize( I ), worldNormal, mRefractionRatio * 0.98 );",
		"	vReflectionFactor = mFresnelBias + mFresnelScale * pow( 1.0 + dot( normalize( I ), worldNormal ), mFresnelPower );",

		"	gl_Position = projectionMatrix * mvPosition;",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform samplerCube tCube;",

		"varying vec3 vReflect;",
		"varying vec3 vRefract[3];",
		"varying float vReflectionFactor;",

		"void main() {",

		"	vec4 reflectedColor = textureCube( tCube, vec3( -vReflect.x, vReflect.yz ) );",
		"	vec4 refractedColor = vec4( 1.0 );",

		"	refractedColor.r = textureCube( tCube, vec3( -vRefract[0].x, vRefract[0].yz ) ).r;",
		"	refractedColor.g = textureCube( tCube, vec3( -vRefract[1].x, vRefract[1].yz ) ).g;",
		"	refractedColor.b = textureCube( tCube, vec3( -vRefract[2].x, vRefract[2].yz ) ).b;",

		"	gl_FragColor = mix( refractedColor, reflectedColor, clamp( vReflectionFactor, 0.0, 1.0 ) );",

		"}"

	].join( "\n" )

};
