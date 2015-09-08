var fs = require( "fs" );

module.exports = {

	alphamap_fragment: fs.readFileSync( __dirname + "/ShaderChunk/alphamap_fragment.glsl", "utf8" ),
	alphamap_pars_fragment: fs.readFileSync( __dirname + "/ShaderChunk/alphamap_pars_fragment.glsl", "utf8" ),
	alphatest_fragment: fs.readFileSync( __dirname + "/ShaderChunk/alphatest_fragment.glsl", "utf8" ),

	aomap_fragment: fs.readFileSync( __dirname + "/ShaderChunk/aomap_fragment.glsl", "utf8" ),
	aomap_pars_fragment: fs.readFileSync( __dirname + "/ShaderChunk/aomap_pars_fragment.glsl", "utf8" ),

	begin_vertex: fs.readFileSync( __dirname + "/ShaderChunk/begin_vertex.glsl", "utf8" ),
	beginnormal_vertex: fs.readFileSync( __dirname + "/ShaderChunk/beginnormal_vertex.glsl", "utf8" ),

	bumpmap_pars_fragment: fs.readFileSync( __dirname + "/ShaderChunk/bumpmap_pars_fragment.glsl", "utf8" ),

	color_fragment: fs.readFileSync( __dirname + "/ShaderChunk/color_fragment.glsl", "utf8" ),
	color_pars_fragment: fs.readFileSync( __dirname + "/ShaderChunk/color_pars_fragment.glsl", "utf8" ),
	color_pars_vertex: fs.readFileSync( __dirname + "/ShaderChunk/color_pars_vertex.glsl", "utf8" ),
	color_vertex: fs.readFileSync( __dirname + "/ShaderChunk/color_vertex.glsl", "utf8" ),

	common: fs.readFileSync( __dirname + "/ShaderChunk/common.glsl", "utf8" ),

	defaultnormal_vertex: fs.readFileSync( __dirname + "/ShaderChunk/defaultnormal_vertex.glsl", "utf8" ),

	displacementmap_pars_vertex: fs.readFileSync( __dirname + "/ShaderChunk/displacementmap_pars_vertex.glsl", "utf8" ),
	displacementmap_vertex: fs.readFileSync( __dirname + "/ShaderChunk/displacementmap_vertex.glsl", "utf8" ),

	emissivemap_fragment: fs.readFileSync( __dirname + "/ShaderChunk/emissivemap_fragment.glsl", "utf8" ),
	emissivemap_pars_fragment: fs.readFileSync( __dirname + "/ShaderChunk/emissivemap_pars_fragment.glsl", "utf8" ),

	envmap_fragment: fs.readFileSync( __dirname + "/ShaderChunk/envmap_fragment.glsl", "utf8" ),
	envmap_pars_fragment: fs.readFileSync( __dirname + "/ShaderChunk/envmap_pars_fragment.glsl", "utf8" ),
	envmap_pars_vertex: fs.readFileSync( __dirname + "/ShaderChunk/envmap_pars_vertex.glsl", "utf8" ),
	envmap_vertex: fs.readFileSync( __dirname + "/ShaderChunk/envmap_vertex.glsl", "utf8" ),

	fog_fragment: fs.readFileSync( __dirname + "/ShaderChunk/fog_fragment.glsl", "utf8" ),
	fog_pars_fragment: fs.readFileSync( __dirname + "/ShaderChunk/fog_pars_fragment.glsl", "utf8" ),

	lightmap_fragment: fs.readFileSync( __dirname + "/ShaderChunk/lightmap_fragment.glsl", "utf8" ),
	lightmap_pars_fragment: fs.readFileSync( __dirname + "/ShaderChunk/lightmap_pars_fragment.glsl", "utf8" ),

	lights_lambert_pars_vertex: fs.readFileSync( __dirname + "/ShaderChunk/lights_lambert_pars_vertex.glsl", "utf8" ),
	lights_lambert_vertex: fs.readFileSync( __dirname + "/ShaderChunk/lights_lambert_vertex.glsl", "utf8" ),
	lights_phong_fragment: fs.readFileSync( __dirname + "/ShaderChunk/lights_phong_fragment.glsl", "utf8" ),
	lights_phong_pars_fragment: fs.readFileSync( __dirname + "/ShaderChunk/lights_phong_pars_fragment.glsl", "utf8" ),
	lights_phong_pars_vertex: fs.readFileSync( __dirname + "/ShaderChunk/lights_phong_pars_vertex.glsl", "utf8" ),
	lights_phong_vertex: fs.readFileSync( __dirname + "/ShaderChunk/lights_phong_vertex.glsl", "utf8" ),

	linear_to_gamma_fragment: fs.readFileSync( __dirname + "/ShaderChunk/linear_to_gamma_fragment.glsl", "utf8" ),

	logdepthbuf_fragment: fs.readFileSync( __dirname + "/ShaderChunk/logdepthbuf_fragment.glsl", "utf8" ),
	logdepthbuf_pars_fragment: fs.readFileSync( __dirname + "/ShaderChunk/logdepthbuf_pars_fragment.glsl", "utf8" ),
	logdepthbuf_pars_vertex: fs.readFileSync( __dirname + "/ShaderChunk/logdepthbuf_pars_vertex.glsl", "utf8" ),
	logdepthbuf_vertex: fs.readFileSync( __dirname + "/ShaderChunk/logdepthbuf_vertex.glsl", "utf8" ),

	map_fragment: fs.readFileSync( __dirname + "/ShaderChunk/map_fragment.glsl", "utf8" ),
	map_pars_fragment: fs.readFileSync( __dirname + "/ShaderChunk/map_pars_fragment.glsl", "utf8" ),
	map_particle_fragment: fs.readFileSync( __dirname + "/ShaderChunk/map_particle_fragment.glsl", "utf8" ),
	map_particle_pars_fragment: fs.readFileSync( __dirname + "/ShaderChunk/map_particle_pars_fragment.glsl", "utf8" ),

	morphnormal_vertex: fs.readFileSync( __dirname + "/ShaderChunk/morphnormal_vertex.glsl", "utf8" ),
	morphtarget_pars_vertex: fs.readFileSync( __dirname + "/ShaderChunk/morphtarget_pars_vertex.glsl", "utf8" ),
	morphtarget_vertex: fs.readFileSync( __dirname + "/ShaderChunk/morphtarget_vertex.glsl", "utf8" ),

	normalmap_pars_fragment: fs.readFileSync( __dirname + "/ShaderChunk/normalmap_pars_fragment.glsl", "utf8" ),

	project_vertex: fs.readFileSync( __dirname + "/ShaderChunk/project_vertex.glsl", "utf8" ),

	shadowmap_fragment: fs.readFileSync( __dirname + "/ShaderChunk/shadowmap_fragment.glsl", "utf8" ),
	shadowmap_pars_fragment: fs.readFileSync( __dirname + "/ShaderChunk/shadowmap_pars_fragment.glsl", "utf8" ),
	shadowmap_pars_vertex: fs.readFileSync( __dirname + "/ShaderChunk/shadowmap_pars_vertex.glsl", "utf8" ),
	shadowmap_vertex: fs.readFileSync( __dirname + "/ShaderChunk/shadowmap_vertex.glsl", "utf8" ),

	skinbase_vertex: fs.readFileSync( __dirname + "/ShaderChunk/skinbase_vertex.glsl", "utf8" ),
	skinning_pars_vertex: fs.readFileSync( __dirname + "/ShaderChunk/skinning_pars_vertex.glsl", "utf8" ),
	skinning_vertex: fs.readFileSync( __dirname + "/ShaderChunk/skinning_vertex.glsl", "utf8" ),
	skinnormal_vertex: fs.readFileSync( __dirname + "/ShaderChunk/skinnormal_vertex.glsl", "utf8" ),

	specularmap_fragment: fs.readFileSync( __dirname + "/ShaderChunk/specularmap_fragment.glsl", "utf8" ),
	specularmap_pars_fragment: fs.readFileSync( __dirname + "/ShaderChunk/specularmap_pars_fragment.glsl", "utf8" ),

	uv_pars_fragment: fs.readFileSync( __dirname + "/ShaderChunk/uv_pars_fragment.glsl", "utf8" ),
	uv_pars_vertex: fs.readFileSync( __dirname + "/ShaderChunk/uv_pars_vertex.glsl", "utf8" ),
	uv_vertex: fs.readFileSync( __dirname + "/ShaderChunk/uv_vertex.glsl", "utf8" ),

	uv2_pars_fragment: fs.readFileSync( __dirname + "/ShaderChunk/uv2_pars_fragment.glsl", "utf8" ),
	uv2_pars_vertex: fs.readFileSync( __dirname + "/ShaderChunk/uv2_pars_vertex.glsl", "utf8" ),
	uv2_vertex: fs.readFileSync( __dirname + "/ShaderChunk/uv2_vertex.glsl", "utf8" ),

	worldpos_vertex: fs.readFileSync( __dirname + "/ShaderChunk/worldpos_vertex.glsl", "utf8" )

};
