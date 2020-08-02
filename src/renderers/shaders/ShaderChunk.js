import alphamap_fragment from './ShaderChunk/alphamap_fragment.glsl.js';
import alphamap_pars_fragment from './ShaderChunk/alphamap_pars_fragment.glsl.js';
import alphatest_fragment from './ShaderChunk/alphatest_fragment.glsl.js';
import aomap_fragment from './ShaderChunk/aomap_fragment.glsl.js';
import aomap_pars_fragment from './ShaderChunk/aomap_pars_fragment.glsl.js';
import begin_vertex from './ShaderChunk/begin_vertex.glsl.js';
import beginnormal_vertex from './ShaderChunk/beginnormal_vertex.glsl.js';
import bsdfs from './ShaderChunk/bsdfs.glsl.js';
import bumpmap_pars_fragment from './ShaderChunk/bumpmap_pars_fragment.glsl.js';
import clipping_planes_fragment from './ShaderChunk/clipping_planes_fragment.glsl.js';
import clipping_planes_pars_fragment from './ShaderChunk/clipping_planes_pars_fragment.glsl.js';
import clipping_planes_pars_vertex from './ShaderChunk/clipping_planes_pars_vertex.glsl.js';
import clipping_planes_vertex from './ShaderChunk/clipping_planes_vertex.glsl.js';
import color_fragment from './ShaderChunk/color_fragment.glsl.js';
import color_pars_fragment from './ShaderChunk/color_pars_fragment.glsl.js';
import color_pars_vertex from './ShaderChunk/color_pars_vertex.glsl.js';
import color_vertex from './ShaderChunk/color_vertex.glsl.js';
import common from './ShaderChunk/common.glsl.js';
import cube_uv_reflection_fragment from './ShaderChunk/cube_uv_reflection_fragment.glsl.js';
import defaultnormal_vertex from './ShaderChunk/defaultnormal_vertex.glsl.js';
import displacementmap_pars_vertex from './ShaderChunk/displacementmap_pars_vertex.glsl.js';
import displacementmap_vertex from './ShaderChunk/displacementmap_vertex.glsl.js';
import emissivemap_fragment from './ShaderChunk/emissivemap_fragment.glsl.js';
import emissivemap_pars_fragment from './ShaderChunk/emissivemap_pars_fragment.glsl.js';
import encodings_fragment from './ShaderChunk/encodings_fragment.glsl.js';
import encodings_pars_fragment from './ShaderChunk/encodings_pars_fragment.glsl.js';
import envmap_fragment from './ShaderChunk/envmap_fragment.glsl.js';
import envmap_common_pars_fragment from './ShaderChunk/envmap_common_pars_fragment.glsl.js';
import envmap_pars_fragment from './ShaderChunk/envmap_pars_fragment.glsl.js';
import envmap_pars_vertex from './ShaderChunk/envmap_pars_vertex.glsl.js';
import envmap_vertex from './ShaderChunk/envmap_vertex.glsl.js';
import fog_vertex from './ShaderChunk/fog_vertex.glsl.js';
import fog_pars_vertex from './ShaderChunk/fog_pars_vertex.glsl.js';
import fog_fragment from './ShaderChunk/fog_fragment.glsl.js';
import fog_pars_fragment from './ShaderChunk/fog_pars_fragment.glsl.js';
import gradientmap_pars_fragment from './ShaderChunk/gradientmap_pars_fragment.glsl.js';
import lightmap_fragment from './ShaderChunk/lightmap_fragment.glsl.js';
import lightmap_pars_fragment from './ShaderChunk/lightmap_pars_fragment.glsl.js';
import lights_lambert_vertex from './ShaderChunk/lights_lambert_vertex.glsl.js';
import lights_pars_begin from './ShaderChunk/lights_pars_begin.glsl.js';
import envmap_physical_pars_fragment from './ShaderChunk/envmap_physical_pars_fragment.glsl.js';
import lights_toon_fragment from './ShaderChunk/lights_toon_fragment.glsl.js';
import lights_toon_pars_fragment from './ShaderChunk/lights_toon_pars_fragment.glsl.js';
import lights_phong_fragment from './ShaderChunk/lights_phong_fragment.glsl.js';
import lights_phong_pars_fragment from './ShaderChunk/lights_phong_pars_fragment.glsl.js';
import lights_physical_fragment from './ShaderChunk/lights_physical_fragment.glsl.js';
import lights_physical_pars_fragment from './ShaderChunk/lights_physical_pars_fragment.glsl.js';
import lights_fragment_begin from './ShaderChunk/lights_fragment_begin.glsl.js';
import lights_fragment_maps from './ShaderChunk/lights_fragment_maps.glsl.js';
import lights_fragment_end from './ShaderChunk/lights_fragment_end.glsl.js';
import logdepthbuf_fragment from './ShaderChunk/logdepthbuf_fragment.glsl.js';
import logdepthbuf_pars_fragment from './ShaderChunk/logdepthbuf_pars_fragment.glsl.js';
import logdepthbuf_pars_vertex from './ShaderChunk/logdepthbuf_pars_vertex.glsl.js';
import logdepthbuf_vertex from './ShaderChunk/logdepthbuf_vertex.glsl.js';
import map_fragment from './ShaderChunk/map_fragment.glsl.js';
import map_pars_fragment from './ShaderChunk/map_pars_fragment.glsl.js';
import map_particle_fragment from './ShaderChunk/map_particle_fragment.glsl.js';
import map_particle_pars_fragment from './ShaderChunk/map_particle_pars_fragment.glsl.js';
import metalnessmap_fragment from './ShaderChunk/metalnessmap_fragment.glsl.js';
import metalnessmap_pars_fragment from './ShaderChunk/metalnessmap_pars_fragment.glsl.js';
import morphnormal_vertex from './ShaderChunk/morphnormal_vertex.glsl.js';
import morphtarget_pars_vertex from './ShaderChunk/morphtarget_pars_vertex.glsl.js';
import morphtarget_vertex from './ShaderChunk/morphtarget_vertex.glsl.js';
import normal_fragment_begin from './ShaderChunk/normal_fragment_begin.glsl.js';
import normal_fragment_maps from './ShaderChunk/normal_fragment_maps.glsl.js';
import normalmap_pars_fragment from './ShaderChunk/normalmap_pars_fragment.glsl.js';
import clearcoat_normal_fragment_begin from './ShaderChunk/clearcoat_normal_fragment_begin.glsl.js';
import clearcoat_normal_fragment_maps from './ShaderChunk/clearcoat_normal_fragment_maps.glsl.js';
import clearcoat_pars_fragment from './ShaderChunk/clearcoat_pars_fragment.glsl.js';
import packing from './ShaderChunk/packing.glsl.js';
import premultiplied_alpha_fragment from './ShaderChunk/premultiplied_alpha_fragment.glsl.js';
import project_vertex from './ShaderChunk/project_vertex.glsl.js';
import dithering_fragment from './ShaderChunk/dithering_fragment.glsl.js';
import dithering_pars_fragment from './ShaderChunk/dithering_pars_fragment.glsl.js';
import roughnessmap_fragment from './ShaderChunk/roughnessmap_fragment.glsl.js';
import roughnessmap_pars_fragment from './ShaderChunk/roughnessmap_pars_fragment.glsl.js';
import shadowmap_pars_fragment from './ShaderChunk/shadowmap_pars_fragment.glsl.js';
import shadowmap_pars_vertex from './ShaderChunk/shadowmap_pars_vertex.glsl.js';
import shadowmap_vertex from './ShaderChunk/shadowmap_vertex.glsl.js';
import shadowmask_pars_fragment from './ShaderChunk/shadowmask_pars_fragment.glsl.js';
import skinbase_vertex from './ShaderChunk/skinbase_vertex.glsl.js';
import skinning_pars_vertex from './ShaderChunk/skinning_pars_vertex.glsl.js';
import skinning_vertex from './ShaderChunk/skinning_vertex.glsl.js';
import skinnormal_vertex from './ShaderChunk/skinnormal_vertex.glsl.js';
import specularmap_fragment from './ShaderChunk/specularmap_fragment.glsl.js';
import specularmap_pars_fragment from './ShaderChunk/specularmap_pars_fragment.glsl.js';
import tonemapping_fragment from './ShaderChunk/tonemapping_fragment.glsl.js';
import tonemapping_pars_fragment from './ShaderChunk/tonemapping_pars_fragment.glsl.js';
import transmissionmap_fragment from './ShaderChunk/transmissionmap_fragment.glsl.js';
import transmissionmap_pars_fragment from './ShaderChunk/transmissionmap_pars_fragment.glsl.js';
import uv_pars_fragment from './ShaderChunk/uv_pars_fragment.glsl.js';
import uv_pars_vertex from './ShaderChunk/uv_pars_vertex.glsl.js';
import uv_vertex from './ShaderChunk/uv_vertex.glsl.js';
import uv2_pars_fragment from './ShaderChunk/uv2_pars_fragment.glsl.js';
import uv2_pars_vertex from './ShaderChunk/uv2_pars_vertex.glsl.js';
import uv2_vertex from './ShaderChunk/uv2_vertex.glsl.js';
import worldpos_vertex from './ShaderChunk/worldpos_vertex.glsl.js';

import background_frag from './ShaderLib/background_frag.glsl.js';
import background_vert from './ShaderLib/background_vert.glsl.js';
import cube_frag from './ShaderLib/cube_frag.glsl.js';
import cube_vert from './ShaderLib/cube_vert.glsl.js';
import depth_frag from './ShaderLib/depth_frag.glsl.js';
import depth_vert from './ShaderLib/depth_vert.glsl.js';
import distanceRGBA_frag from './ShaderLib/distanceRGBA_frag.glsl.js';
import distanceRGBA_vert from './ShaderLib/distanceRGBA_vert.glsl.js';
import equirect_frag from './ShaderLib/equirect_frag.glsl.js';
import equirect_vert from './ShaderLib/equirect_vert.glsl.js';
import linedashed_frag from './ShaderLib/linedashed_frag.glsl.js';
import linedashed_vert from './ShaderLib/linedashed_vert.glsl.js';
import meshbasic_frag from './ShaderLib/meshbasic_frag.glsl.js';
import meshbasic_vert from './ShaderLib/meshbasic_vert.glsl.js';
import meshlambert_frag from './ShaderLib/meshlambert_frag.glsl.js';
import meshlambert_vert from './ShaderLib/meshlambert_vert.glsl.js';
import meshmatcap_frag from './ShaderLib/meshmatcap_frag.glsl.js';
import meshmatcap_vert from './ShaderLib/meshmatcap_vert.glsl.js';
import meshtoon_frag from './ShaderLib/meshtoon_frag.glsl.js';
import meshtoon_vert from './ShaderLib/meshtoon_vert.glsl.js';
import meshphong_frag from './ShaderLib/meshphong_frag.glsl.js';
import meshphong_vert from './ShaderLib/meshphong_vert.glsl.js';
import meshphysical_frag from './ShaderLib/meshphysical_frag.glsl.js';
import meshphysical_vert from './ShaderLib/meshphysical_vert.glsl.js';
import normal_frag from './ShaderLib/normal_frag.glsl.js';
import normal_vert from './ShaderLib/normal_vert.glsl.js';
import points_frag from './ShaderLib/points_frag.glsl.js';
import points_vert from './ShaderLib/points_vert.glsl.js';
import shadow_frag from './ShaderLib/shadow_frag.glsl.js';
import shadow_vert from './ShaderLib/shadow_vert.glsl.js';
import sprite_frag from './ShaderLib/sprite_frag.glsl.js';
import sprite_vert from './ShaderLib/sprite_vert.glsl.js';

export const ShaderChunk = {
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
	envmap_common_pars_fragment: envmap_common_pars_fragment,
	envmap_pars_fragment: envmap_pars_fragment,
	envmap_pars_vertex: envmap_pars_vertex,
	envmap_physical_pars_fragment: envmap_physical_pars_fragment,
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
	lights_toon_fragment: lights_toon_fragment,
	lights_toon_pars_fragment: lights_toon_pars_fragment,
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
	clearcoat_normal_fragment_begin: clearcoat_normal_fragment_begin,
	clearcoat_normal_fragment_maps: clearcoat_normal_fragment_maps,
	clearcoat_pars_fragment: clearcoat_pars_fragment,
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
	transmissionmap_fragment: transmissionmap_fragment,
	transmissionmap_pars_fragment: transmissionmap_pars_fragment,
	uv_pars_fragment: uv_pars_fragment,
	uv_pars_vertex: uv_pars_vertex,
	uv_vertex: uv_vertex,
	uv2_pars_fragment: uv2_pars_fragment,
	uv2_pars_vertex: uv2_pars_vertex,
	uv2_vertex: uv2_vertex,
	worldpos_vertex: worldpos_vertex,

	background_frag: background_frag,
	background_vert: background_vert,
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
	meshmatcap_frag: meshmatcap_frag,
	meshmatcap_vert: meshmatcap_vert,
	meshtoon_frag: meshtoon_frag,
	meshtoon_vert: meshtoon_vert,
	meshphong_frag: meshphong_frag,
	meshphong_vert: meshphong_vert,
	meshphysical_frag: meshphysical_frag,
	meshphysical_vert: meshphysical_vert,
	normal_frag: normal_frag,
	normal_vert: normal_vert,
	points_frag: points_frag,
	points_vert: points_vert,
	shadow_frag: shadow_frag,
	shadow_vert: shadow_vert,
	sprite_frag: sprite_frag,
	sprite_vert: sprite_vert
};
