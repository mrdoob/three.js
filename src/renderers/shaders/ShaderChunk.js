import alphamap_fragment from './ShaderChunk/alphamap_fragment.glsl';
import alphamap_pars_fragment from './ShaderChunk/alphamap_pars_fragment.glsl';
import alphatest_fragment from './ShaderChunk/alphatest_fragment.glsl';
import aomap_fragment from './ShaderChunk/aomap_fragment.glsl';
import aomap_pars_fragment from './ShaderChunk/aomap_pars_fragment.glsl';
import begin_vertex from './ShaderChunk/begin_vertex.glsl';
import beginnormal_vertex from './ShaderChunk/beginnormal_vertex.glsl';
import bsdfs from './ShaderChunk/bsdfs.glsl';
import bumpmap_pars_fragment from './ShaderChunk/bumpmap_pars_fragment.glsl';
import clipping_planes_fragment from './ShaderChunk/clipping_planes_fragment.glsl';
import clipping_planes_pars_fragment from './ShaderChunk/clipping_planes_pars_fragment.glsl';
import clipping_planes_pars_vertex from './ShaderChunk/clipping_planes_pars_vertex.glsl';
import clipping_planes_vertex from './ShaderChunk/clipping_planes_vertex.glsl';
import color_fragment from './ShaderChunk/color_fragment.glsl';
import color_pars_fragment from './ShaderChunk/color_pars_fragment.glsl';
import color_pars_vertex from './ShaderChunk/color_pars_vertex.glsl';
import color_vertex from './ShaderChunk/color_vertex.glsl';
import common from './ShaderChunk/common.glsl';
import cube_uv_reflection_fragment from './ShaderChunk/cube_uv_reflection_fragment.glsl';
import defaultnormal_vertex from './ShaderChunk/defaultnormal_vertex.glsl';
import displacementmap_pars_vertex from './ShaderChunk/displacementmap_pars_vertex.glsl';
import displacementmap_vertex from './ShaderChunk/displacementmap_vertex.glsl';
import emissivemap_fragment from './ShaderChunk/emissivemap_fragment.glsl';
import emissivemap_pars_fragment from './ShaderChunk/emissivemap_pars_fragment.glsl';
import encodings_fragment from './ShaderChunk/encodings_fragment.glsl';
import encodings_pars_fragment from './ShaderChunk/encodings_pars_fragment.glsl';
import envmap_fragment from './ShaderChunk/envmap_fragment.glsl';
import envmap_pars_fragment from './ShaderChunk/envmap_pars_fragment.glsl';
import envmap_pars_vertex from './ShaderChunk/envmap_pars_vertex.glsl';
import envmap_vertex from './ShaderChunk/envmap_vertex.glsl';
import fog_vertex from './ShaderChunk/fog_vertex.glsl';
import fog_pars_vertex from './ShaderChunk/fog_pars_vertex.glsl';
import fog_fragment from './ShaderChunk/fog_fragment.glsl';
import fog_pars_fragment from './ShaderChunk/fog_pars_fragment.glsl';
import gradientmap_pars_fragment from './ShaderChunk/gradientmap_pars_fragment.glsl';
import lightmap_fragment from './ShaderChunk/lightmap_fragment.glsl';
import lightmap_pars_fragment from './ShaderChunk/lightmap_pars_fragment.glsl';
import lights_lambert_vertex from './ShaderChunk/lights_lambert_vertex.glsl';
import lights_pars_begin from './ShaderChunk/lights_pars_begin.glsl';
import lights_pars_maps from './ShaderChunk/lights_pars_maps.glsl';
import lights_phong_fragment from './ShaderChunk/lights_phong_fragment.glsl';
import lights_phong_pars_fragment from './ShaderChunk/lights_phong_pars_fragment.glsl';
import lights_physical_fragment from './ShaderChunk/lights_physical_fragment.glsl';
import lights_physical_pars_fragment from './ShaderChunk/lights_physical_pars_fragment.glsl';
import lights_fragment_begin from './ShaderChunk/lights_fragment_begin.glsl';
import lights_fragment_maps from './ShaderChunk/lights_fragment_maps.glsl';
import lights_fragment_end from './ShaderChunk/lights_fragment_end.glsl';
import logdepthbuf_fragment from './ShaderChunk/logdepthbuf_fragment.glsl';
import logdepthbuf_pars_fragment from './ShaderChunk/logdepthbuf_pars_fragment.glsl';
import logdepthbuf_pars_vertex from './ShaderChunk/logdepthbuf_pars_vertex.glsl';
import logdepthbuf_vertex from './ShaderChunk/logdepthbuf_vertex.glsl';
import map_fragment from './ShaderChunk/map_fragment.glsl';
import map_pars_fragment from './ShaderChunk/map_pars_fragment.glsl';
import map_particle_fragment from './ShaderChunk/map_particle_fragment.glsl';
import map_particle_pars_fragment from './ShaderChunk/map_particle_pars_fragment.glsl';
import metalnessmap_fragment from './ShaderChunk/metalnessmap_fragment.glsl';
import metalnessmap_pars_fragment from './ShaderChunk/metalnessmap_pars_fragment.glsl';
import morphnormal_vertex from './ShaderChunk/morphnormal_vertex.glsl';
import morphtarget_pars_vertex from './ShaderChunk/morphtarget_pars_vertex.glsl';
import morphtarget_vertex from './ShaderChunk/morphtarget_vertex.glsl';
import normal_fragment_begin from './ShaderChunk/normal_fragment_begin.glsl';
import normal_fragment_maps from './ShaderChunk/normal_fragment_maps.glsl';
import normalmap_pars_fragment from './ShaderChunk/normalmap_pars_fragment.glsl';
import packing from './ShaderChunk/packing.glsl';
import premultiplied_alpha_fragment from './ShaderChunk/premultiplied_alpha_fragment.glsl';
import project_vertex from './ShaderChunk/project_vertex.glsl';
import dithering_fragment from './ShaderChunk/dithering_fragment.glsl';
import dithering_pars_fragment from './ShaderChunk/dithering_pars_fragment.glsl';
import roughnessmap_fragment from './ShaderChunk/roughnessmap_fragment.glsl';
import roughnessmap_pars_fragment from './ShaderChunk/roughnessmap_pars_fragment.glsl';
import shadowmap_pars_fragment from './ShaderChunk/shadowmap_pars_fragment.glsl';
import shadowmap_pars_vertex from './ShaderChunk/shadowmap_pars_vertex.glsl';
import shadowmap_vertex from './ShaderChunk/shadowmap_vertex.glsl';
import shadowmask_pars_fragment from './ShaderChunk/shadowmask_pars_fragment.glsl';
import skinbase_vertex from './ShaderChunk/skinbase_vertex.glsl';
import skinning_pars_vertex from './ShaderChunk/skinning_pars_vertex.glsl';
import skinning_vertex from './ShaderChunk/skinning_vertex.glsl';
import skinnormal_vertex from './ShaderChunk/skinnormal_vertex.glsl';
import specularmap_fragment from './ShaderChunk/specularmap_fragment.glsl';
import specularmap_pars_fragment from './ShaderChunk/specularmap_pars_fragment.glsl';
import tonemapping_fragment from './ShaderChunk/tonemapping_fragment.glsl';
import tonemapping_pars_fragment from './ShaderChunk/tonemapping_pars_fragment.glsl';
import uv_pars_fragment from './ShaderChunk/uv_pars_fragment.glsl';
import uv_pars_vertex from './ShaderChunk/uv_pars_vertex.glsl';
import uv_vertex from './ShaderChunk/uv_vertex.glsl';
import uv2_pars_fragment from './ShaderChunk/uv2_pars_fragment.glsl';
import uv2_pars_vertex from './ShaderChunk/uv2_pars_vertex.glsl';
import uv2_vertex from './ShaderChunk/uv2_vertex.glsl';
import worldpos_vertex from './ShaderChunk/worldpos_vertex.glsl';

import cube_frag from './ShaderLib/cube_frag.glsl';
import cube_vert from './ShaderLib/cube_vert.glsl';
import depth_frag from './ShaderLib/depth_frag.glsl';
import depth_vert from './ShaderLib/depth_vert.glsl';
import distanceRGBA_frag from './ShaderLib/distanceRGBA_frag.glsl';
import distanceRGBA_vert from './ShaderLib/distanceRGBA_vert.glsl';
import equirect_frag from './ShaderLib/equirect_frag.glsl';
import equirect_vert from './ShaderLib/equirect_vert.glsl';
import linedashed_frag from './ShaderLib/linedashed_frag.glsl';
import linedashed_vert from './ShaderLib/linedashed_vert.glsl';
import meshbasic_frag from './ShaderLib/meshbasic_frag.glsl';
import meshbasic_vert from './ShaderLib/meshbasic_vert.glsl';
import meshlambert_frag from './ShaderLib/meshlambert_frag.glsl';
import meshlambert_vert from './ShaderLib/meshlambert_vert.glsl';
import meshphong_frag from './ShaderLib/meshphong_frag.glsl';
import meshphong_vert from './ShaderLib/meshphong_vert.glsl';
import meshphysical_frag from './ShaderLib/meshphysical_frag.glsl';
import meshphysical_vert from './ShaderLib/meshphysical_vert.glsl';
import normal_frag from './ShaderLib/normal_frag.glsl';
import normal_vert from './ShaderLib/normal_vert.glsl';
import points_frag from './ShaderLib/points_frag.glsl';
import points_vert from './ShaderLib/points_vert.glsl';
import shadow_frag from './ShaderLib/shadow_frag.glsl';
import shadow_vert from './ShaderLib/shadow_vert.glsl';

export var ShaderChunk = {
	alphamap_fragment: alphamap_fragment,
	alphamap_pars_fragment: alphamap_pars_fragment,
	alphatest_fragment: alphatest_fragment,
	aomap_fragment: aomap_fragment,
	aomap_pars_fragment: aomap_pars_fragment,
	begin_vertex: begin_vertex,
	beginnormal_vertex: beginnormal_vertex,
	bsdfs: bsdfs,
	bumpmap_pars_fragment: bumpmap_pars_fragment,
	clipping_planes_fragment: clipping_planes_fragment,
	clipping_planes_pars_fragment: clipping_planes_pars_fragment,
	clipping_planes_pars_vertex: clipping_planes_pars_vertex,
	clipping_planes_vertex: clipping_planes_vertex,
	color_fragment: color_fragment,
	color_pars_fragment: color_pars_fragment,
	color_pars_vertex: color_pars_vertex,
	color_vertex: color_vertex,
	common: common,
	cube_uv_reflection_fragment: cube_uv_reflection_fragment,
	defaultnormal_vertex: defaultnormal_vertex,
	displacementmap_pars_vertex: displacementmap_pars_vertex,
	displacementmap_vertex: displacementmap_vertex,
	emissivemap_fragment: emissivemap_fragment,
	emissivemap_pars_fragment: emissivemap_pars_fragment,
	encodings_fragment: encodings_fragment,
	encodings_pars_fragment: encodings_pars_fragment,
	envmap_fragment: envmap_fragment,
	envmap_pars_fragment: envmap_pars_fragment,
	envmap_pars_vertex: envmap_pars_vertex,
	envmap_vertex: envmap_vertex,
	fog_vertex: fog_vertex,
	fog_pars_vertex: fog_pars_vertex,
	fog_fragment: fog_fragment,
	fog_pars_fragment: fog_pars_fragment,
	gradientmap_pars_fragment: gradientmap_pars_fragment,
	lightmap_fragment: lightmap_fragment,
	lightmap_pars_fragment: lightmap_pars_fragment,
	lights_lambert_vertex: lights_lambert_vertex,
	lights_pars_begin: lights_pars_begin,
	lights_pars_maps: lights_pars_maps,
	lights_phong_fragment: lights_phong_fragment,
	lights_phong_pars_fragment: lights_phong_pars_fragment,
	lights_physical_fragment: lights_physical_fragment,
	lights_physical_pars_fragment: lights_physical_pars_fragment,
	lights_fragment_begin: lights_fragment_begin,
	lights_fragment_maps: lights_fragment_maps,
	lights_fragment_end: lights_fragment_end,
	logdepthbuf_fragment: logdepthbuf_fragment,
	logdepthbuf_pars_fragment: logdepthbuf_pars_fragment,
	logdepthbuf_pars_vertex: logdepthbuf_pars_vertex,
	logdepthbuf_vertex: logdepthbuf_vertex,
	map_fragment: map_fragment,
	map_pars_fragment: map_pars_fragment,
	map_particle_fragment: map_particle_fragment,
	map_particle_pars_fragment: map_particle_pars_fragment,
	metalnessmap_fragment: metalnessmap_fragment,
	metalnessmap_pars_fragment: metalnessmap_pars_fragment,
	morphnormal_vertex: morphnormal_vertex,
	morphtarget_pars_vertex: morphtarget_pars_vertex,
	morphtarget_vertex: morphtarget_vertex,
	normal_fragment_begin: normal_fragment_begin,
	normal_fragment_maps: normal_fragment_maps,
	normalmap_pars_fragment: normalmap_pars_fragment,
	packing: packing,
	premultiplied_alpha_fragment: premultiplied_alpha_fragment,
	project_vertex: project_vertex,
	dithering_fragment: dithering_fragment,
	dithering_pars_fragment: dithering_pars_fragment,
	roughnessmap_fragment: roughnessmap_fragment,
	roughnessmap_pars_fragment: roughnessmap_pars_fragment,
	shadowmap_pars_fragment: shadowmap_pars_fragment,
	shadowmap_pars_vertex: shadowmap_pars_vertex,
	shadowmap_vertex: shadowmap_vertex,
	shadowmask_pars_fragment: shadowmask_pars_fragment,
	skinbase_vertex: skinbase_vertex,
	skinning_pars_vertex: skinning_pars_vertex,
	skinning_vertex: skinning_vertex,
	skinnormal_vertex: skinnormal_vertex,
	specularmap_fragment: specularmap_fragment,
	specularmap_pars_fragment: specularmap_pars_fragment,
	tonemapping_fragment: tonemapping_fragment,
	tonemapping_pars_fragment: tonemapping_pars_fragment,
	uv_pars_fragment: uv_pars_fragment,
	uv_pars_vertex: uv_pars_vertex,
	uv_vertex: uv_vertex,
	uv2_pars_fragment: uv2_pars_fragment,
	uv2_pars_vertex: uv2_pars_vertex,
	uv2_vertex: uv2_vertex,
	worldpos_vertex: worldpos_vertex,

	cube_frag: cube_frag,
	cube_vert: cube_vert,
	depth_frag: depth_frag,
	depth_vert: depth_vert,
	distanceRGBA_frag: distanceRGBA_frag,
	distanceRGBA_vert: distanceRGBA_vert,
	equirect_frag: equirect_frag,
	equirect_vert: equirect_vert,
	linedashed_frag: linedashed_frag,
	linedashed_vert: linedashed_vert,
	meshbasic_frag: meshbasic_frag,
	meshbasic_vert: meshbasic_vert,
	meshlambert_frag: meshlambert_frag,
	meshlambert_vert: meshlambert_vert,
	meshphong_frag: meshphong_frag,
	meshphong_vert: meshphong_vert,
	meshphysical_frag: meshphysical_frag,
	meshphysical_vert: meshphysical_vert,
	normal_frag: normal_frag,
	normal_vert: normal_vert,
	points_frag: points_frag,
	points_vert: points_vert,
	shadow_frag: shadow_frag,
	shadow_vert: shadow_vert
};
