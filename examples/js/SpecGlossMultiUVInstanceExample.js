// some utils

function addOrMergeProp( material, propName, data ) {

	if ( material[ propName ] ) {

		Object.assign( material[ propName ], data );

	} else {

		material[ propName ] = data;

	}

}

// from three's texture transform api, to be applied to a uniform matrix
function setUvTransform( tx, ty, sx, sy, rotation, cx, cy ) {

	var c = Math.cos( rotation );
	var s = Math.sin( rotation );

	this.set(
		sx * c, sx * s, - sx * ( c * cx + s * cy ) + cx + tx,
		- sy * s, sy * c, - sy * ( - s * cx + c * cy ) + cy + ty,
		0, 0, 0
	);

}

//spec gloss stuff ---------------------------------------------------------

//this extends the shader to use specular gloss PBR model instead of rough/metal

var specularMapFragmentChunk = [
	'vec3 specularFactor = specular;',
	'#ifdef USE_SPECULARMAP',
	'	vec4 texelSpecular = texture2D( specularMap, vUv );',
	'	texelSpecular = sRGBToLinear( texelSpecular );',
	'	// reads channel RGB, compatible with a glTF Specular-Glossiness (RGBA) texture',
	'	specularFactor *= texelSpecular.rgb;',
	'#endif',
	// 'gl_FragColor = vec4(vec3(specularFactor),1.);',
	// 'return;',
].join( '\n' );

var glossinessMapFragmentChunk = [
	'float glossinessFactor = glossiness;',
	'#ifdef USE_GLOSSINESSMAP',
	'	vec4 texelGlossiness = texture2D( glossinessMap, vUv );',
	'	// reads channel A, compatible with a glTF Specular-Glossiness (RGBA) texture',
	'	glossinessFactor *= texelGlossiness.r;',
	// 'gl_FragColor = vec4(vec3(glossinessFactor),1.);',
	// 'return;',
	'#endif',
].join( '\n' );

var lightPhysicalFragmentChunk = [
	'PhysicalMaterial material;',
	'material.diffuseColor = diffuseColor.rgb;',
	'material.specularRoughness = clamp( 1.0 - glossinessFactor, 0.04, 1.0 );',
	'material.specularColor = specularFactor.rgb;',
].join( '\n' );

var SHADER_INCLUDES_SPEC_GLOSS = {
	roughnessmap_fragment: specularMapFragmentChunk,
	metalnessmap_fragment: glossinessMapFragmentChunk,
	lights_physical_fragment: lightPhysicalFragmentChunk,
};

function decorateMaterialWithSpecGloss( material ) {

	if ( material.isSpecGlossExtended ) return material;

	material.isSpecGlossExtended = true;

	var shaderUniforms = {
		specular: { value: new THREE.Color().setHex( 0xffffff ), type: 'vec3', stage: 'fragment' }, //fragment can be ommitted (defaults to it) but for sake of clarity
		glossiness: { value: 1, type: 'float', stage: 'fragment' },
		glossinessMap: { value: null, type: 'sampler2D', stage: 'fragment' },
		specularMap: { value: null, type: 'sampler2D', stage: 'fragment' },
	};

	var defines = {USE_GLOSSINESSMAP: ''}

	//conflicts could be resolved here
	addOrMergeProp( material, 'shaderUniforms', shaderUniforms );
	addOrMergeProp( material, 'shaderIncludes', SHADER_INCLUDES_SPEC_GLOSS );
	addOrMergeProp( material, 'defines', defines );

	console.log(material.shaderUniforms)
	console.log(material.shaderIncludes)
	//expose uniforms as props for a cleaner interface (but shaderUniforms is also available so this can be omitted)
	for ( let propName in shaderUniforms ) {

		Object.defineProperty( material, propName, {
			get: ()=> shaderUniforms[ propName ].value,
			set: ( v )=> (shaderUniforms[ propName ].value = v),
		} );

	}

}

// multi uv stuff ---------------------------------------------------------

// this moves the transform from textures to the material, textures become just data

//list of maps to be extended, these are easy
var DEFAULT_MAP_LIST = [
	'alphaMap',
	'specularMap',
	'map',
	'emissiveMap',
	'metalnessMap',
	'roughnessMap',
	'glossinessMap' //this one is from the other example, but if its there it should work, this can be solved to work together somehow
];

//this can be programatic
var PROP_TO_CHUNK_MAP = {
	'alphaMap': 'alphamap_fragment',
	'specularMap': 'specularmap_fragment',
	'map': 'map_fragment',
	'emissiveMap': 'emissivemap_fragment',
	'metalnessMap': 'metalnessmap_fragment',
	'roughnessMap': 'roughnessmap_fragment',
	'glossinessMap': 'metalnessmap_fragment', //this one cant be programatic because it belongs to another override, could be a specific check somewhere else
	'specularMapGloss': 'roughnessmap_fragment',
};

//some utils

var mapRegex = /texture2D\( (.*Map|map), vUv \)/gm //look for this

function getReplaceString(mapName){
	return `texture2D( $1, ( ${getUniformNameFromProp(mapName)} * vec3( vUv, 1. ) ).xy )`
}


function getUniformNameFromProp(prop){
	return `u_${prop}Transform`
}

function addMapTransformPropsToMaterial( material, mapName ){

	let _mapName = mapName
	material[`${mapName}Repeat`] = new THREE.Vector2(1,1)
	material[`${mapName}Offset`] = new THREE.Vector2()
	material[`${mapName}Center`] = new THREE.Vector2()
	material[`${mapName}Rotation`] = 0
	material[`${mapName}UpdateMatrix`] = function(){
		this.shaderUniforms[getUniformNameFromProp(_mapName)].value
		.setUvTransform(
			this[`${_mapName}Offset`].x,
			this[`${_mapName}Offset`].y, 
			this[`${_mapName}Repeat`].x,
			this[`${_mapName}Repeat`].y, 
			this[`${_mapName}Rotation`], 
			this[`${_mapName}Center`].x,
			this[`${_mapName}Center`].y, 
		)
	}.bind(material)
}


function decorateMaterialWithPerMapTransforms( material, mapList ) {

	if ( material.isPerMapTransformExtended ) return material;

	material.isPerMapTransformExtended = true;

	delete material.metalnessMap
	delete material.roughnessMap

	mapList = mapList || DEFAULT_MAP_LIST;

	var shaderUniforms = {}
	var shaderIncludes = {}

	for ( var i = 0; i < mapList.length; i ++ ) {

		var mapName = mapList[ i ];

		addMapTransformPropsToMaterial(material, mapName)

		if ( material[ mapName ] !== undefined ) {

			var uniform = { value: new THREE.Matrix3(), type:'mat3', stage: 'fragment' };
			uniform.value.setUvTransform = setUvTransform.bind( uniform.value );

			shaderUniforms[getUniformNameFromProp(mapName)] = uniform

			var lookup = mapName
			if( material.isSpecGlossExtended && mapName === 'specularMap'){
				lookup = 'specularMapGloss' 
			}

			var chunkName = PROP_TO_CHUNK_MAP[lookup]

			var shaderChunk = (material.shaderIncludes && material.shaderIncludes[chunkName]) || THREE.ShaderChunk[chunkName]

			shaderChunk = shaderChunk.replace( mapRegex , getReplaceString(mapName) )

			shaderIncludes[ chunkName ] = shaderChunk

		}

	}

	addOrMergeProp( material, 'shaderUniforms', shaderUniforms );
	addOrMergeProp( material, 'shaderIncludes', shaderIncludes );

}



// simple instance stuff from lambert example  ---------------------------------------------------------

var after_vertex_transform_chunk = `
	transformed *= instanceScale; //the value present in transformed is in model space, 
	transformed = transformed + instanceOffset;
`

function decorateMaterialWithSimpleInstancing( material ) {
	if( material.isSimpleInstanceExtended ) return material
	material.isSimpleInstanceExtended = true 
	
	var shaderIncludes = { 
		begin_vertex:`
			${THREE.ShaderChunk.begin_vertex}
			${after_vertex_transform_chunk}
		` 
	}

	//no good global chunk, but could be uv_pars, heres how to make it work with onbeforecompile
	material.onBeforeCompile = shader => {
		shader.vertexShader = `
		attribute vec3 instanceOffset; 
		attribute float instanceScale;
		${shader.vertexShader}
		`
	}
	
	addOrMergeProp( material, 'shaderIncludes', shaderIncludes );

}