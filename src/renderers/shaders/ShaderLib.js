/**
 * Webgl Shader Library for three.js
 *
 * @author alteredq / http://alteredqualia.com/
 * @author mrdoob / http://mrdoob.com/
 * @author mikael emtinger / http://gomo.se/
 */


THREE.ShaderLib = {

	'basic': {

		uniforms: THREE.UniformsUtils.merge( [

			THREE.UniformsLib[ "common" ],
			THREE.UniformsLib[ "aomap" ],
			THREE.UniformsLib[ "fog" ]

		] ),

		vertexShader: [

			'#include <common>',
			'#include <uv_pars_vertex>',
			'#include <uv2_pars_vertex>',
			'#include <envmap_pars_vertex>',
			'#include <color_pars_vertex>',
			'#include <morphtarget_pars_vertex>',
			'#include <skinning_pars_vertex>',
			'#include <logdepthbuf_pars_vertex>',

			"void main() {",

				'#include <uv_vertex>',
				'#include <uv2_vertex>',
				'#include <color_vertex>',
				'#include <skinbase_vertex>',

			"	#ifdef USE_ENVMAP",

				'#include <beginnormal_vertex>',
				'#include <morphnormal_vertex>',
				'#include <skinnormal_vertex>',
				'#include <defaultnormal_vertex>',

			"	#endif",

				'#include <begin_vertex>',
				'#include <morphtarget_vertex>',
				'#include <skinning_vertex>',
				'#include <project_vertex>',
				'#include <logdepthbuf_vertex>',

				'#include <worldpos_vertex>',
				'#include <envmap_vertex>',

			"}"

		].join( "\n" ),

		fragmentShader: [

			"uniform vec3 diffuse;",
			"uniform float opacity;",

			"#ifndef FLAT_SHADED",

			"	varying vec3 vNormal;",

			"#endif",

			'#include <common>',
			'#include <encodings>',
			'#include <color_pars_fragment>',
			'#include <uv_pars_fragment>',
			'#include <uv2_pars_fragment>',
			'#include <map_pars_fragment>',
			'#include <alphamap_pars_fragment>',
			'#include <aomap_pars_fragment>',
			'#include <envmap_pars_fragment>',
			'#include <fog_pars_fragment>',
			'#include <specularmap_pars_fragment>',
			'#include <logdepthbuf_pars_fragment>',

			"void main() {",

			"	vec4 diffuseColor = vec4( diffuse, opacity );",

				'#include <logdepthbuf_fragment>',
				'#include <map_fragment>',
				'#include <color_fragment>',
				'#include <alphamap_fragment>',
				'#include <alphatest_fragment>',
				'#include <specularmap_fragment>',

			"	ReflectedLight reflectedLight;",
			"	reflectedLight.directDiffuse = vec3( 0.0 );",
			"	reflectedLight.directSpecular = vec3( 0.0 );",
			"	reflectedLight.indirectDiffuse = diffuseColor.rgb;",
			"	reflectedLight.indirectSpecular = vec3( 0.0 );",

				'#include <aomap_fragment>',

			"	vec3 outgoingLight = reflectedLight.indirectDiffuse;",

				'#include <envmap_fragment>',
				'#include <linear_to_gamma_fragment>',
				'#include <fog_fragment>',

			"	gl_FragColor = vec4( outgoingLight, diffuseColor.a );",

			"}"

		].join( "\n" )

	},

	'lambert': {

		uniforms: THREE.UniformsUtils.merge( [

			THREE.UniformsLib[ "common" ],
			THREE.UniformsLib[ "aomap" ],
			THREE.UniformsLib[ "lightmap" ],
			THREE.UniformsLib[ "emissivemap" ],
			THREE.UniformsLib[ "fog" ],
			THREE.UniformsLib[ "ambient" ],
			THREE.UniformsLib[ "lights" ],

			{
				"emissive" : { type: "c", value: new THREE.Color( 0x000000 ) }
			}

		] ),

		vertexShader: [

			"#define LAMBERT",

			"varying vec3 vLightFront;",

			"#ifdef DOUBLE_SIDED",

			"	varying vec3 vLightBack;",

			"#endif",

			'#include <common>',
			'#include <uv_pars_vertex>',
			'#include <uv2_pars_vertex>',
			'#include <envmap_pars_vertex>',
			'#include <bsdfs>',
			'#include <lights_pars>',
			'#include <color_pars_vertex>',
			'#include <morphtarget_pars_vertex>',
			'#include <skinning_pars_vertex>',
			'#include <shadowmap_pars_vertex>',
			'#include <logdepthbuf_pars_vertex>',

			"void main() {",

				'#include <uv_vertex>',
				'#include <uv2_vertex>',
				'#include <color_vertex>',

				'#include <beginnormal_vertex>',
				'#include <morphnormal_vertex>',
				'#include <skinbase_vertex>',
				'#include <skinnormal_vertex>',
				'#include <defaultnormal_vertex>',

				'#include <begin_vertex>',
				'#include <morphtarget_vertex>',
				'#include <skinning_vertex>',
				'#include <project_vertex>',
				'#include <logdepthbuf_vertex>',

				'#include <worldpos_vertex>',
				'#include <envmap_vertex>',
				'#include <lights_lambert_vertex>',
				'#include <shadowmap_vertex>',

			"}"

		].join( "\n" ),

		fragmentShader: [

			"uniform vec3 diffuse;",
			"uniform vec3 emissive;",
			"uniform float opacity;",

			"varying vec3 vLightFront;",

			"#ifdef DOUBLE_SIDED",

			"	varying vec3 vLightBack;",

			"#endif",

			'#include <common>',
			'#include <encodings>',
			'#include <color_pars_fragment>',
			'#include <uv_pars_fragment>',
			'#include <uv2_pars_fragment>',
			'#include <map_pars_fragment>',
			'#include <alphamap_pars_fragment>',
			'#include <aomap_pars_fragment>',
			'#include <lightmap_pars_fragment>',
			'#include <emissivemap_pars_fragment>',
			'#include <envmap_pars_fragment>',
			'#include <bsdfs>',
			'#include <ambient_pars>',
			'#include <lights_pars>',
			'#include <fog_pars_fragment>',
			'#include <shadowmap_pars_fragment>',
			'#include <shadowmask_pars_fragment>',
			'#include <specularmap_pars_fragment>',
			'#include <logdepthbuf_pars_fragment>',

			"void main() {",

			"	vec4 diffuseColor = vec4( diffuse, opacity );",
			"	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );",
			"	vec3 totalEmissiveLight = emissive;",

				'#include <logdepthbuf_fragment>',
				'#include <map_fragment>',
				'#include <color_fragment>',
				'#include <alphamap_fragment>',
				'#include <alphatest_fragment>',
				'#include <specularmap_fragment>',
				'#include <emissivemap_fragment>',

				// accumulation
			"	reflectedLight.indirectDiffuse = getAmbientLightIrradiance( ambientLightColor );",

				'#include <lightmap_fragment>',

			"	reflectedLight.indirectDiffuse *= BRDF_Diffuse_Lambert( diffuseColor.rgb );",

			"	#ifdef DOUBLE_SIDED",

			"		reflectedLight.directDiffuse = ( gl_FrontFacing ) ? vLightFront : vLightBack;",

			"	#else",

			"		reflectedLight.directDiffuse = vLightFront;",

			"	#endif",

			"	reflectedLight.directDiffuse *= BRDF_Diffuse_Lambert( diffuseColor.rgb ) * getShadowMask();",

				// modulation
				'#include <aomap_fragment>',

			"	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveLight;",

				'#include <envmap_fragment>',

				'#include <linear_to_gamma_fragment>',

				'#include <fog_fragment>',

			"	gl_FragColor = vec4( outgoingLight, diffuseColor.a );",

			"}"

		].join( "\n" )

	},

	'phong': {

		uniforms: THREE.UniformsUtils.merge( [

			THREE.UniformsLib[ "common" ],
			THREE.UniformsLib[ "aomap" ],
			THREE.UniformsLib[ "lightmap" ],
			THREE.UniformsLib[ "emissivemap" ],
			THREE.UniformsLib[ "bumpmap" ],
			THREE.UniformsLib[ "normalmap" ],
			THREE.UniformsLib[ "displacementmap" ],
			THREE.UniformsLib[ "fog" ],
			THREE.UniformsLib[ "ambient" ],
			THREE.UniformsLib[ "lights" ],

			{
				"emissive" : { type: "c", value: new THREE.Color( 0x000000 ) },
				"specular" : { type: "c", value: new THREE.Color( 0x111111 ) },
				"shininess": { type: "f", value: 30 }
			}

		] ),

		vertexShader: [

			"#define PHONG",

			"varying vec3 vViewPosition;",

			"#ifndef FLAT_SHADED",

			"	varying vec3 vNormal;",

			"#endif",

			'#include <common>',
			'#include <uv_pars_vertex>',
			'#include <uv2_pars_vertex>',
			'#include <displacementmap_pars_vertex>',
			'#include <envmap_pars_vertex>',
			'#include <lights_phong_pars_vertex>',
			'#include <color_pars_vertex>',
			'#include <morphtarget_pars_vertex>',
			'#include <skinning_pars_vertex>',
			'#include <shadowmap_pars_vertex>',
			'#include <logdepthbuf_pars_vertex>',

			"void main() {",

				'#include <uv_vertex>',
				'#include <uv2_vertex>',
				'#include <color_vertex>',

				'#include <beginnormal_vertex>',
				'#include <morphnormal_vertex>',
				'#include <skinbase_vertex>',
				'#include <skinnormal_vertex>',
				'#include <defaultnormal_vertex>',

			"#ifndef FLAT_SHADED", // Normal computed with derivatives when FLAT_SHADED

			"	vNormal = normalize( transformedNormal );",

			"#endif",

				'#include <begin_vertex>',
				'#include <displacementmap_vertex>',
				'#include <morphtarget_vertex>',
				'#include <skinning_vertex>',
				'#include <project_vertex>',
				'#include <logdepthbuf_vertex>',

			"	vViewPosition = - mvPosition.xyz;",

				'#include <worldpos_vertex>',
				'#include <envmap_vertex>',
				'#include <lights_phong_vertex>',
				'#include <shadowmap_vertex>',

			"}"

		].join( "\n" ),

		fragmentShader: [

			"#define PHONG",

			"uniform vec3 diffuse;",
			"uniform vec3 emissive;",
			"uniform vec3 specular;",
			"uniform float shininess;",
			"uniform float opacity;",

			'#include <common>',
			'#include <encodings>',
			'#include <color_pars_fragment>',
			'#include <uv_pars_fragment>',
			'#include <uv2_pars_fragment>',
			'#include <map_pars_fragment>',
			'#include <alphamap_pars_fragment>',
			'#include <aomap_pars_fragment>',
			'#include <lightmap_pars_fragment>',
			'#include <emissivemap_pars_fragment>',
			'#include <envmap_pars_fragment>',
			'#include <fog_pars_fragment>',
			'#include <bsdfs>',
			'#include <ambient_pars>',
			'#include <lights_pars>',
			'#include <lights_phong_pars_fragment>',
			'#include <shadowmap_pars_fragment>',
			'#include <bumpmap_pars_fragment>',
			'#include <normalmap_pars_fragment>',
			'#include <specularmap_pars_fragment>',
			'#include <logdepthbuf_pars_fragment>',

			"void main() {",

			"	vec4 diffuseColor = vec4( diffuse, opacity );",
			"	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );",
			"	vec3 totalEmissiveLight = emissive;",

				'#include <logdepthbuf_fragment>',
				'#include <map_fragment>',
				'#include <color_fragment>',
				'#include <alphamap_fragment>',
				'#include <alphatest_fragment>',
				'#include <specularmap_fragment>',
				'#include <normal_fragment>',
				'#include <emissivemap_fragment>',

				// accumulation
				'#include <lights_phong_fragment>',
				'#include <lights_template>',

				// modulation
				'#include <aomap_fragment>',

				"vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveLight;",

				'#include <envmap_fragment>',
				'#include <linear_to_gamma_fragment>',

				'#include <fog_fragment>',

			"	gl_FragColor = vec4( outgoingLight, diffuseColor.a );",

			"}"

		].join( "\n" )

	},

	'standard': {

		uniforms: THREE.UniformsUtils.merge( [

			THREE.UniformsLib[ "common" ],
			THREE.UniformsLib[ "aomap" ],
			THREE.UniformsLib[ "lightmap" ],
			THREE.UniformsLib[ "emissivemap" ],
			THREE.UniformsLib[ "bumpmap" ],
			THREE.UniformsLib[ "normalmap" ],
			THREE.UniformsLib[ "displacementmap" ],
			THREE.UniformsLib[ "roughnessmap" ],
			THREE.UniformsLib[ "metalnessmap" ],
			THREE.UniformsLib[ "fog" ],
			THREE.UniformsLib[ "ambient" ],
			THREE.UniformsLib[ "lights" ],

			{
				"emissive" : { type: "c", value: new THREE.Color( 0x000000 ) },
				"roughness": { type: "f", value: 0.5 },
				"metalness": { type: "f", value: 0 },
				"envMapIntensity" : { type: "f", value: 1 } // temporary
			}

		] ),

		vertexShader: [

			"#define STANDARD",

			"varying vec3 vViewPosition;",

			"#ifndef FLAT_SHADED",

			"	varying vec3 vNormal;",

			"#endif",

			'#include <common>',
			'#include <uv_pars_vertex>',
			'#include <uv2_pars_vertex>',
			'#include <displacementmap_pars_vertex>',
			'#include <envmap_pars_vertex>',
			'#include <color_pars_vertex>',
			'#include <morphtarget_pars_vertex>',
			'#include <skinning_pars_vertex>',
			'#include <shadowmap_pars_vertex>',
			'#include <specularmap_pars_fragment>',
			'#include <logdepthbuf_pars_vertex>',

			"void main() {", // STANDARD

				'#include <uv_vertex>',
				'#include <uv2_vertex>',
				'#include <color_vertex>',

				'#include <beginnormal_vertex>',
				'#include <morphnormal_vertex>',
				'#include <skinbase_vertex>',
				'#include <skinnormal_vertex>',
				'#include <defaultnormal_vertex>',

			"#ifndef FLAT_SHADED", // Normal computed with derivatives when FLAT_SHADED

			"	vNormal = normalize( transformedNormal );",

			"#endif",

				'#include <begin_vertex>',
				'#include <displacementmap_vertex>',
				'#include <morphtarget_vertex>',
				'#include <skinning_vertex>',
				'#include <project_vertex>',
				'#include <logdepthbuf_vertex>',

			"	vViewPosition = - mvPosition.xyz;",

				'#include <worldpos_vertex>',
				'#include <envmap_vertex>',
				'#include <shadowmap_vertex>',

			"}"

		].join( "\n" ),

		fragmentShader: [

			"#define STANDARD",

			"uniform vec3 diffuse;",
			"uniform vec3 emissive;",
			"uniform float roughness;",
			"uniform float metalness;",
			"uniform float opacity;",

			"uniform float envMapIntensity;", // temporary

			"varying vec3 vViewPosition;",

			"#ifndef FLAT_SHADED",

			"	varying vec3 vNormal;",

			"#endif",

			'#include <common>',
			'#include <encodings>',
			'#include <color_pars_fragment>',
			'#include <uv_pars_fragment>',
			'#include <uv2_pars_fragment>',
			'#include <map_pars_fragment>',
			'#include <alphamap_pars_fragment>',
			'#include <aomap_pars_fragment>',
			'#include <lightmap_pars_fragment>',
			'#include <emissivemap_pars_fragment>',
			'#include <envmap_pars_fragment>',
			'#include <fog_pars_fragment>',
			'#include <bsdfs>',
			'#include <ambient_pars>',
			'#include <lights_pars>',
			'#include <lights_standard_pars_fragment>',
			'#include <shadowmap_pars_fragment>',
			'#include <bumpmap_pars_fragment>',
			'#include <normalmap_pars_fragment>',
			'#include <roughnessmap_pars_fragment>',
			'#include <metalnessmap_pars_fragment>',
			'#include <logdepthbuf_pars_fragment>',

			"void main() {",

			"	vec4 diffuseColor = vec4( diffuse, opacity );",
			"	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );",
			"	vec3 totalEmissiveLight = emissive;",

				'#include <logdepthbuf_fragment>',
				'#include <map_fragment>',
				'#include <color_fragment>',
				'#include <alphamap_fragment>',
				'#include <alphatest_fragment>',
				'#include <specularmap_fragment>',
				'#include <roughnessmap_fragment>',
				'#include <metalnessmap_fragment>',
				'#include <normal_fragment>',
				'#include <emissivemap_fragment>',

				// accumulation
				'#include <lights_standard_fragment>',
				'#include <lights_template>',

				// modulation
				'#include <aomap_fragment>',

				"vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveLight;",

				'#include <linear_to_gamma_fragment>',

				'#include <fog_fragment>',

			"	gl_FragColor = vec4( outgoingLight, diffuseColor.a );",

			"}"

		].join( "\n" )

	},

	'points': {

		uniforms: THREE.UniformsUtils.merge( [

			THREE.UniformsLib[ "points" ],
			THREE.UniformsLib[ "fog" ]

		] ),

		vertexShader: [

			"uniform float size;",
			"uniform float scale;",

			'#include <common>',
			'#include <color_pars_vertex>',
			'#include <shadowmap_pars_vertex>',
			'#include <logdepthbuf_pars_vertex>',

			"void main() {",

				'#include <color_vertex>',
				'#include <begin_vertex>',
				'#include <project_vertex>',

			"	#ifdef USE_SIZEATTENUATION",
			"		gl_PointSize = size * ( scale / - mvPosition.z );",
			"	#else",
			"		gl_PointSize = size;",
			"	#endif",

				'#include <logdepthbuf_vertex>',
				'#include <worldpos_vertex>',
				'#include <shadowmap_vertex>',

			"}"

		].join( "\n" ),

		fragmentShader: [

			"uniform vec3 diffuse;",
			"uniform float opacity;",

			'#include <common>',
			'#include <encodings>',
			'#include <color_pars_fragment>',
			'#include <map_particle_pars_fragment>',
			'#include <fog_pars_fragment>',
			'#include <shadowmap_pars_fragment>',
			'#include <logdepthbuf_pars_fragment>',

			"void main() {",

			"	vec3 outgoingLight = vec3( 0.0 );",
			"	vec4 diffuseColor = vec4( diffuse, opacity );",

				'#include <logdepthbuf_fragment>',
				'#include <map_particle_fragment>',
				'#include <color_fragment>',
				'#include <alphatest_fragment>',

			"	outgoingLight = diffuseColor.rgb;",

				'#include <fog_fragment>',

			"	gl_FragColor = vec4( outgoingLight, diffuseColor.a );",

			"}"

		].join( "\n" )

	},

	'dashed': {

		uniforms: THREE.UniformsUtils.merge( [

			THREE.UniformsLib[ "common" ],
			THREE.UniformsLib[ "fog" ],

			{
				"scale"    : { type: "f", value: 1 },
				"dashSize" : { type: "f", value: 1 },
				"totalSize": { type: "f", value: 2 }
			}

		] ),

		vertexShader: [

			"uniform float scale;",
			"attribute float lineDistance;",

			"varying float vLineDistance;",

			'#include <common>',
			'#include <color_pars_vertex>',
			'#include <logdepthbuf_pars_vertex>',

			"void main() {",

				'#include <color_vertex>',

			"	vLineDistance = scale * lineDistance;",

			"	vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
			"	gl_Position = projectionMatrix * mvPosition;",

				'#include <logdepthbuf_vertex>',

			"}"

		].join( "\n" ),

		fragmentShader: [

			"uniform vec3 diffuse;",
			"uniform float opacity;",

			"uniform float dashSize;",
			"uniform float totalSize;",

			"varying float vLineDistance;",

			'#include <common>',
			'#include <color_pars_fragment>',
			'#include <fog_pars_fragment>',
			'#include <logdepthbuf_pars_fragment>',

			"void main() {",

			"	if ( mod( vLineDistance, totalSize ) > dashSize ) {",

			"		discard;",

			"	}",

			"	vec3 outgoingLight = vec3( 0.0 );",
			"	vec4 diffuseColor = vec4( diffuse, opacity );",

				'#include <logdepthbuf_fragment>',
				'#include <color_fragment>',

			"	outgoingLight = diffuseColor.rgb;", // simple shader

				'#include <fog_fragment>',

			"	gl_FragColor = vec4( outgoingLight, diffuseColor.a );",

			"}"

		].join( "\n" )

	},

	'depth': {

		uniforms: {

			"mNear": { type: "f", value: 1.0 },
			"mFar" : { type: "f", value: 2000.0 },
			"opacity" : { type: "f", value: 1.0 }

		},

		vertexShader: [

			'#include <common>',
			'#include <morphtarget_pars_vertex>',
			'#include <logdepthbuf_pars_vertex>',

			"void main() {",

				'#include <begin_vertex>',
				'#include <morphtarget_vertex>',
				'#include <project_vertex>',
				'#include <logdepthbuf_vertex>',

			"}"

		].join( "\n" ),

		fragmentShader: [

			"uniform float mNear;",
			"uniform float mFar;",
			"uniform float opacity;",

			'#include <common>',
			'#include <logdepthbuf_pars_fragment>',

			"void main() {",

				'#include <logdepthbuf_fragment>',

			"	#ifdef USE_LOGDEPTHBUF_EXT",

			"		float depth = gl_FragDepthEXT / gl_FragCoord.w;",

			"	#else",

			"		float depth = gl_FragCoord.z / gl_FragCoord.w;",

			"	#endif",

			"	float color = 1.0 - smoothstep( mNear, mFar, depth );",
			"	gl_FragColor = vec4( vec3( color ), opacity );",

			"}"

		].join( "\n" )

	},

	'normal': {

		uniforms: {

			"opacity" : { type: "f", value: 1.0 }

		},

		vertexShader: [

			"varying vec3 vNormal;",

			'#include <common>',
			'#include <morphtarget_pars_vertex>',
			'#include <logdepthbuf_pars_vertex>',

			"void main() {",

			"	vNormal = normalize( normalMatrix * normal );",

				'#include <begin_vertex>',
				'#include <morphtarget_vertex>',
				'#include <project_vertex>',
				'#include <logdepthbuf_vertex>',

			"}"

		].join( "\n" ),

		fragmentShader: [

			"uniform float opacity;",
			"varying vec3 vNormal;",

			'#include <common>',
			'#include <logdepthbuf_pars_fragment>',

			"void main() {",

			"	gl_FragColor = vec4( 0.5 * normalize( vNormal ) + 0.5, opacity );",

				'#include <logdepthbuf_fragment>',

			"}"

		].join( "\n" )

	},

	/* -------------------------------------------------------------------------
	//	Cube map shader
	 ------------------------------------------------------------------------- */

	'cube': {

		uniforms: {
			"tCube": { type: "t", value: null },
			"tFlip": { type: "f", value: - 1 }
		},

		vertexShader: [

			"varying vec3 vWorldPosition;",

			'#include <common>',
			'#include <logdepthbuf_pars_vertex>',

			"void main() {",

			"	vWorldPosition = transformDirection( position, modelMatrix );",

			"	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

				'#include <logdepthbuf_vertex>',

			"}"

		].join( "\n" ),

		fragmentShader: [

			"uniform samplerCube tCube;",
			"uniform float tFlip;",

			"varying vec3 vWorldPosition;",

			'#include <common>',
			'#include <logdepthbuf_pars_fragment>',

			"void main() {",

			"	gl_FragColor = textureCube( tCube, vec3( tFlip * vWorldPosition.x, vWorldPosition.yz ) );",

				'#include <logdepthbuf_fragment>',

			"}"

		].join( "\n" )

	},

	/* -------------------------------------------------------------------------
	//	Cube map shader
	 ------------------------------------------------------------------------- */

	'equirect': {

		uniforms: {
			"tEquirect": { type: "t", value: null },
			"tFlip": { type: "f", value: - 1 }
		},

		vertexShader: [

			"varying vec3 vWorldPosition;",

			'#include <common>',
			'#include <logdepthbuf_pars_vertex>',

			"void main() {",

			"	vWorldPosition = transformDirection( position, modelMatrix );",

			"	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

				'#include <logdepthbuf_vertex>',

			"}"

		].join( "\n" ),

		fragmentShader: [

			"uniform sampler2D tEquirect;",
			"uniform float tFlip;",

			"varying vec3 vWorldPosition;",

			'#include <common>',
			'#include <logdepthbuf_pars_fragment>',

			"void main() {",

				// "	gl_FragColor = textureCube( tCube, vec3( tFlip * vWorldPosition.x, vWorldPosition.yz ) );",
				"vec3 direction = normalize( vWorldPosition );",
				"vec2 sampleUV;",
				"sampleUV.y = saturate( tFlip * direction.y * -0.5 + 0.5 );",
				"sampleUV.x = atan( direction.z, direction.x ) * RECIPROCAL_PI2 + 0.5;",
				"gl_FragColor = texture2D( tEquirect, sampleUV );",

				'#include <logdepthbuf_fragment>',

			"}"

		].join( "\n" )

	},

	/* Depth encoding into RGBA texture
	 *
	 * based on SpiderGL shadow map example
	 * http://spidergl.org/example.php?id=6
	 *
	 * originally from
	 * http://www.gamedev.net/topic/442138-packing-a-float-into-a-a8r8g8b8-texture-shader/page__whichpage__1%25EF%25BF%25BD
	 *
	 * see also
	 * http://aras-p.info/blog/2009/07/30/encoding-floats-to-rgba-the-final/
	 */

	'depthRGBA': {

		uniforms: {},

		vertexShader: [

			'#include <common>',
			'#include <morphtarget_pars_vertex>',
			'#include <skinning_pars_vertex>',
			'#include <logdepthbuf_pars_vertex>',

			"void main() {",

				'#include <skinbase_vertex>',

				'#include <begin_vertex>',
				'#include <morphtarget_vertex>',
				'#include <skinning_vertex>',
				'#include <project_vertex>',
				'#include <logdepthbuf_vertex>',

			"}"

		].join( "\n" ),

		fragmentShader: [

			'#include <common>',
			'#include <logdepthbuf_pars_fragment>',

			"vec4 pack_depth( const in float depth ) {",

			"	const vec4 bit_shift = vec4( 256.0 * 256.0 * 256.0, 256.0 * 256.0, 256.0, 1.0 );",
			"	const vec4 bit_mask = vec4( 0.0, 1.0 / 256.0, 1.0 / 256.0, 1.0 / 256.0 );",
			"	vec4 res = mod( depth * bit_shift * vec4( 255 ), vec4( 256 ) ) / vec4( 255 );",
			"	res -= res.xxyz * bit_mask;",
			"	return res;",

			"}",

			"void main() {",

				'#include <logdepthbuf_fragment>',

			"	#ifdef USE_LOGDEPTHBUF_EXT",

			"		gl_FragData[ 0 ] = pack_depth( gl_FragDepthEXT );",

			"	#else",

			"		gl_FragData[ 0 ] = pack_depth( gl_FragCoord.z );",

			"	#endif",

				//"gl_FragData[ 0 ] = pack_depth( gl_FragCoord.z / gl_FragCoord.w );",
				//"float z = ( ( gl_FragCoord.z / gl_FragCoord.w ) - 3.0 ) / ( 4000.0 - 3.0 );",
				//"gl_FragData[ 0 ] = pack_depth( z );",
				//"gl_FragData[ 0 ] = vec4( z, z, z, 1.0 );",

			"}"

		].join( "\n" )

	},


	'distanceRGBA': {

		uniforms: {

			"lightPos": { type: "v3", value: new THREE.Vector3( 0, 0, 0 ) }

		},

		vertexShader: [

			"varying vec4 vWorldPosition;",

			'#include <common>',
			'#include <morphtarget_pars_vertex>',
			'#include <skinning_pars_vertex>',

			"void main() {",

				'#include <skinbase_vertex>',
				'#include <begin_vertex>',
				'#include <morphtarget_vertex>',
				'#include <skinning_vertex>',
				'#include <project_vertex>',
				'#include <worldpos_vertex>',

				"vWorldPosition = worldPosition;",

			"}"

		].join( "\n" ),

		fragmentShader: [

			"uniform vec3 lightPos;",
			"varying vec4 vWorldPosition;",

			'#include <common>',

			"vec4 pack1K ( float depth ) {",

			"	depth /= 1000.0;",
			"	const vec4 bitSh = vec4( 256.0 * 256.0 * 256.0, 256.0 * 256.0, 256.0, 1.0 );",
			"	const vec4 bitMsk = vec4( 0.0, 1.0 / 256.0, 1.0 / 256.0, 1.0 / 256.0 );",
			"	vec4 res = mod( depth * bitSh * vec4( 255 ), vec4( 256 ) ) / vec4( 255 );",
			"	res -= res.xxyz * bitMsk;",
			"	return res; ",

			"}",

			"float unpack1K ( vec4 color ) {",

			"	const vec4 bitSh = vec4( 1.0 / ( 256.0 * 256.0 * 256.0 ), 1.0 / ( 256.0 * 256.0 ), 1.0 / 256.0, 1.0 );",
			"	return dot( color, bitSh ) * 1000.0;",

			"}",

			"void main () {",

			"	gl_FragColor = pack1K( length( vWorldPosition.xyz - lightPos.xyz ) );",

			"}"

		].join( "\n" )

	}

};
