// some utils

function addOrMergeProp( material, propName, data ) {

	if ( material[ propName ] ) {

		Object.assign( material[ propName ], data );

	} else {

		material[ propName ] = data;

	}

}

//serialize
function toJSON(){
	var res = THREE.Material.prototype.toJSON.call(
		this, 
		undefined, 
		this._serializationManager.serialize.bind(this._serializationManager)
	)
	this._serializationManager.afterSerialize.call(this._serializationManager,res)
	return res
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
	'	glossinessFactor *= texelGlossiness.a;',
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

	// these are the extra uniforms, but instead of being stored in .userData, or some such place
	// a designated prop could be used
	var shaderUniforms = {
		specular: { value: new THREE.Color().setHex( 0xffffff ), type: 'vec3', stage: 'fragment' }, //fragment can be ommitted (defaults to it) but for sake of clarity
		glossiness: { value: 1, type: 'float', stage: 'fragment' },
		glossinessMap: { value: null, type: 'sampler2D', stage: 'fragment' },
		specularMap: { value: null, type: 'sampler2D', stage: 'fragment' },
	};

	var shaderIncludes = Object.assign({},SHADER_INCLUDES_SPEC_GLOSS)

	var defines = {USE_GLOSSINESSMAP: ''}

	//conflicts could be resolved here
	addOrMergeProp( material, 'shaderUniforms', shaderUniforms );
	addOrMergeProp( material, 'shaderIncludes', shaderIncludes );
	addOrMergeProp( material, 'defines', defines );

	delete material.metalnessMap
	delete material.roughnessMap

	//expose uniforms as props for a cleaner interface (but shaderUniforms is also available so this can be omitted)
	//it just leads to a cleaner more familiar interface (PhongMaterial has specularMap, so this now has it too)
	for ( let propName in shaderUniforms ) {

		Object.defineProperty( material, propName, {
			get: ()=> shaderUniforms[ propName ].value,
			set: ( v )=> (shaderUniforms[ propName ].value = v),
		} );

	}

	if(!material._serializationManager) material._serializationManager = new SerializationManager()
	var f = function(data,meta){
		if( !data.metadata.extensions ) data.metadata.extensions = {}
		data.metadata.extensions.isSpecGlossExtended = true
		data.glossiness = this.glossiness
		data.specular = this.specular.getHex()
		if(this.glossinessMap && this.glossinessMap.isTexture) data.glossinessMap = this.glossinessMap.toJSON( meta ).uuid 
	}.bind(material)

	material._serializationManager.addFunction(f)
		
	material.toJSON = toJSON.bind(material)

	return material

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
//it tells the extension where to look for certain maps
//these follow the /texture2D( $mapname, vUv )/ pattern
//normal map is a bit more complex and would require a non programatic chunk 
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

var mapRegex = /texture2D\( (.*Map|map), vUv \)/gm //look for the pattern /texture2D( $someMap, vUv )/

//because the other extension changes roughnessMap to specularMap we need the $1 to replace the name, otherwise it could be `mapName`
function getReplaceString(mapName){
	return `texture2D( $1, ( ${getUniformNameFromProp(mapName)} * vec3( vUv, 1. ) ).xy )`
}

//in order to keep the uniform name obvious that it belongs to the GLSL context, and to make it as private sounding as possible
function getUniformNameFromProp(prop){
	return `u_${prop}Transform`
}

//a utility to add the necessary transform properties to a material based on an arbitrary map name
//so if specularMap is provided it will create these Vector2, a float, and an updateMatrix method
//this is very similar to the Texture transform interface the only difference being that the props are prefixed
//myTexture.repeat vs myMaterial.specularMapRepeat 
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

	//one can provide a subset from outside
	mapList = mapList || DEFAULT_MAP_LIST;

	var shaderUniforms = {}
	var shaderIncludes = {}
	var serialize = []

	for ( var i = 0; i < mapList.length; i ++ ) {

		var mapName = mapList[ i ];


		if ( material[ mapName ] !== undefined ) {

			addMapTransformPropsToMaterial(material, mapName)

			var uniform = { value: new THREE.Matrix3(), type:'mat3', stage: 'fragment' };
			uniform.value.setUvTransform = setUvTransform.bind( uniform.value );

			shaderUniforms[getUniformNameFromProp(mapName)] = uniform

			//this is for resolving the conflict, its not the most elegant solution but it works
			//i believe that this would be solved by refactoring the shader templates
			var lookup = mapName
			if( material.isSpecGlossExtended && mapName === 'specularMap'){
				lookup = 'specularMapGloss' 
			}
			serialize.push(mapName)

			//based on the map name ie. specularMap or even an extended glossinessMap pick a chunk
			var chunkName = PROP_TO_CHUNK_MAP[lookup]

			//if there already is a chunk from some extension, pick that, otherwise copy the default chunk
			var shaderChunk = (material.shaderIncludes && material.shaderIncludes[chunkName]) || THREE.ShaderChunk[chunkName]

			//apply the string transformation, this contains the copy of whatever chunk was provided (default or custom)
			shaderChunk = shaderChunk.replace( mapRegex , getReplaceString(mapName) )

			//provide this copy as the include chunk, this shader wont look up THREE.ShaderChunk 
			//and doesnt have to wait for onBeforeCompile to do the transformation
			//final transformed chunk is already stored here in this context sync
			shaderIncludes[ chunkName ] = shaderChunk

		}

	}

	//combine with other chunks
	addOrMergeProp( material, 'shaderUniforms', shaderUniforms );
	addOrMergeProp( material, 'shaderIncludes', shaderIncludes );

	if(!material._serializationManager) material._serializationManager = new SerializationManager()

	material._serializationManager.addFunction(((data,meta)=>{
		if( !data.metadata.extensions ) data.metadata.extensions = {}
		data.metadata.extensions.isPerMapTransformExtended = true

		serialize.forEach(mapName=>{
			data[`${mapName}Repeat`] = material[`${mapName}Repeat`].toArray()
			data[`${mapName}Offset`] = material[`${mapName}Offset`].toArray()
			data[`${mapName}Center`] = material[`${mapName}Center`].toArray()
			data[`${mapName}Rotation`] = material[`${mapName}Rotation`]
		})

		return data

	}).bind(material))


	material._serializationManager.addAfterFunction(
		function( data ){
			delete data.roughnessMap
			delete data.roughness
			delete data.metalnessMap
			delete data.metalness	
		}
	)
	
	material.toJSON = toJSON.bind(material)

	return material
}

// simple instance stuff from lambert example  ---------------------------------------------------------

//this is a stage after begin_vertex, this would be more elegant with hooks and template refactor
var after_vertex_transform_chunk = `
	transformed *= instanceScale; //the value present in transformed is in model space, 
	transformed = transformed + instanceOffset;
`

function decorateMaterialWithSimpleInstancing( material ) {

	if( material.isSimpleInstanceExtended ) return material

	material.isSimpleInstanceExtended = true 
	
	//make a custom chunk that includes a copy of the default chunk from THREE.ShaderChunk
	//followed by a custom chunk, that is simply appended to the copy
	var shaderIncludes = { 
		begin_vertex:`
			${THREE.ShaderChunk.begin_vertex}
			${after_vertex_transform_chunk}
		` 
	}

	//no good global chunk, but could be uv_pars, heres how to make it work with onbeforecompile
	//because this is somewhat of a set and forget thing, onBeforeCompile (or onBeforeParse) is 
	//perfectly valid to use here
	//"here are some attribute names, whenver you get around to assemblying the shader on WebGL level use them"
	//A uniform (over an attribute) would be better if it were available in this scope
	
	var attributeInjection = `
		attribute vec3 instanceOffset; 
		attribute float instanceScale;
	`

	material.onBeforeCompile = shader => {
		shader.vertexShader = `
		${attributeInjection}
		${shader.vertexShader}
		`
	}

	//alternatively one can use `uv_pars_vertex`
	//since displacement map is used in almost all of the shaders, this chunk is present 
	//depth for example, has this chunk, so whatever attribute is added to StandardMaterial
	//is also going to be added to DepthMaterial
	/*shaderIncludes = {
		uv_pars_vertex: `
		${attributeInjection}
		${THREE.ShaderChunk.uv_pars_vertex}
		`
	}*/

	addOrMergeProp( material, 'shaderIncludes', shaderIncludes );

	if(!material._serializationManager) material._serializationManager = new SerializationManager()

	material._serializationManager.addFunction((data)=>{
		if( !data.metadata.extensions ) data.metadata.extensions = {}
		data.metadata.extensions.isSimpleInstanceExtended = true
	})
	
	material.toJSON = toJSON.bind(material)

	return material

}


function SerializationManager(){
	this.processFunctions = []
	this.afterFunctions = []
}

SerializationManager.prototype = {
	addFunction: function( func ){
		this.processFunctions.push(func)
	},
	serialize(data, meta){
		this.processFunctions.forEach(f=>f(data))
		return data
	},
	afterSerialize(data){
		this.afterFunctions.forEach(f=>f(data))
	},
	addAfterFunction: function( func ){
		this.afterFunctions.push(func)
	}
}