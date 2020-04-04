var files = {
	"webgl": [
		"webgl_animation_cloth",
		"webgl_animation_keyframes",
		"webgl_animation_skinning_blending",
		"webgl_animation_skinning_morph",
		"webgl_animation_multiple",
		"webgl_camera",
		"webgl_camera_array",
		"webgl_camera_cinematic",
		"webgl_camera_logarithmicdepthbuffer",
		"webgl_clipping",
		"webgl_clipping_advanced",
		"webgl_clipping_intersection",
		"webgl_clipping_stencil",
		"webgl_decals",
		"webgl_depth_texture",
		"webgl_effects_anaglyph",
		"webgl_effects_ascii",
		"webgl_effects_parallaxbarrier",
		"webgl_effects_peppersghost",
		"webgl_effects_stereo",
		"webgl_framebuffer_texture",
		"webgl_geometries",
		"webgl_geometries_parametric",
		"webgl_geometry_colors",
		"webgl_geometry_colors_lookuptable",
		"webgl_geometry_convex",
		"webgl_geometry_cube",
		"webgl_geometry_dynamic",
		"webgl_geometry_extrude_shapes",
		"webgl_geometry_extrude_shapes2",
		"webgl_geometry_extrude_splines",
		"webgl_geometry_hierarchy",
		"webgl_geometry_hierarchy2",
		"webgl_geometry_minecraft",
		"webgl_geometry_minecraft_ao",
		"webgl_geometry_normals",
		"webgl_geometry_nurbs",
		"webgl_geometry_shapes",
		"webgl_geometry_spline_editor",
		"webgl_geometry_teapot",
		"webgl_geometry_terrain",
		"webgl_geometry_terrain_fog",
		"webgl_geometry_terrain_raycast",
		"webgl_geometry_text",
		"webgl_geometry_text_shapes",
		"webgl_geometry_text_stroke",
		"webgl_helpers",
		"webgl_instancing_dynamic",
		"webgl_instancing_performance",
		"webgl_instancing_raycast",
		"webgl_instancing_scatter",
		"webgl_interactive_buffergeometry",
		"webgl_interactive_cubes",
		"webgl_interactive_cubes_gpu",
		"webgl_interactive_cubes_ortho",
		"webgl_interactive_lines",
		"webgl_interactive_points",
		"webgl_interactive_raycasting_points",
		"webgl_interactive_voxelpainter",
		"webgl_kinect",
		"webgl_layers",
		"webgl_lensflares",
		"webgl_lightprobe",
		"webgl_lightprobe_cubecamera",
		"webgl_lights_hemisphere",
		"webgl_lights_physical",
		"webgl_lights_pointlights",
		"webgl_lights_pointlights2",
		"webgl_lights_spotlight",
		"webgl_lights_spotlights",
		"webgl_lights_rectarealight",
		"webgl_lines_colors",
		"webgl_lines_dashed",
		"webgl_lines_fat",
		"webgl_lines_fat_wireframe",
		"webgl_lines_sphere",
		"webgl_loader_3ds",
		"webgl_loader_3mf",
		"webgl_loader_3mf_materials",
		"webgl_loader_amf",
		"webgl_loader_assimp",
		"webgl_loader_bvh",
		"webgl_loader_collada",
		"webgl_loader_collada_kinematics",
		"webgl_loader_collada_skinning",
		"webgl_loader_draco",
		"webgl_loader_fbx",
		"webgl_loader_fbx_nurbs",
		"webgl_loader_gcode",
		"webgl_loader_gltf",
		"webgl_loader_gltf_extensions",
		"webgl_loader_imagebitmap",
		"webgl_loader_json_claraio",
		"webgl_loader_kmz",
		"webgl_loader_ldraw",
		"webgl_loader_lwo",
		"webgl_loader_md2",
		"webgl_loader_md2_control",
		"webgl_loader_mdd",
		"webgl_loader_mmd",
		"webgl_loader_mmd_pose",
		"webgl_loader_mmd_audio",
		"webgl_loader_nrrd",
		"webgl_loader_obj",
		"webgl_loader_obj_mtl",
		"webgl_loader_obj2",
		"webgl_loader_obj2_options",
		"webgl_loader_pcd",
		"webgl_loader_pdb",
		"webgl_loader_ply",
		"webgl_loader_prwm",
		"webgl_loader_stl",
		"webgl_loader_svg",
		"webgl_loader_texture_basis",
		"webgl_loader_texture_dds",
		"webgl_loader_texture_exr",
		"webgl_loader_texture_hdr",
		"webgl_loader_texture_ktx",
		"webgl_loader_texture_pvrtc",
		"webgl_loader_texture_rgbm",
		"webgl_loader_texture_tga",
		"webgl_loader_ttf",
		"webgl_loader_vrm",
		"webgl_loader_vrml",
		"webgl_loader_vtk",
		"webgl_loader_x",
		"webgl_lod",
		"webgl_marchingcubes",
		"webgl_materials",
		"webgl_materials_blending",
		"webgl_materials_blending_custom",
		"webgl_materials_bumpmap",
		"webgl_materials_car",
		"webgl_materials_channels",
		"webgl_materials_cubemap",
		"webgl_materials_cubemap_balls_reflection",
		"webgl_materials_cubemap_balls_refraction",
		"webgl_materials_cubemap_dynamic",
		"webgl_materials_cubemap_refraction",
		"webgl_materials_cubemap_mipmaps",
		"webgl_materials_curvature",
		"webgl_materials_displacementmap",
		"webgl_materials_envmaps",
		"webgl_materials_envmaps_exr",
		"webgl_materials_envmaps_hdr",
		"webgl_materials_envmaps_parallax",
		"webgl_materials_grass",
		"webgl_materials_lightmap",
		"webgl_materials_matcap",
		"webgl_materials_normalmap",
		"webgl_materials_normalmap_object_space",
		"webgl_materials_parallaxmap",
		"webgl_materials_physical_clearcoat",
		"webgl_materials_physical_reflectivity",
		"webgl_materials_physical_sheen",
		"webgl_materials_physical_transparency",
		"webgl_materials_shaders_fresnel",
		"webgl_materials_standard",
		"webgl_materials_texture_anisotropy",
		"webgl_materials_texture_canvas",
		"webgl_materials_texture_filters",
		"webgl_materials_texture_manualmipmap",
		"webgl_materials_texture_partialupdate",
		"webgl_materials_texture_rotation",
		"webgl_materials_translucency",
		"webgl_materials_variations_basic",
		"webgl_materials_variations_lambert",
		"webgl_materials_variations_phong",
		"webgl_materials_variations_standard",
		"webgl_materials_variations_physical",
		"webgl_materials_variations_toon",
		"webgl_materials_video",
		"webgl_materials_video_webcam",
		"webgl_materials_wireframe",
		"webgl_math_obb",
		"webgl_math_orientation_transform",
		"webgl_mirror",
		"webgl_modifier_simplifier",
		"webgl_modifier_subdivision",
		"webgl_modifier_tessellation",
		"webgl_morphtargets",
		"webgl_morphtargets_horse",
		"webgl_morphtargets_sphere",
		"webgl_multiple_canvases_circle",
		"webgl_multiple_canvases_complex",
		"webgl_multiple_canvases_grid",
		"webgl_multiple_elements",
		"webgl_multiple_elements_text",
		"webgl_multiple_renderers",
		"webgl_multiple_scenes_comparison",
		"webgl_multiple_views",
		"webgl_nearestneighbour",
		"webgl_panorama_cube",
		"webgl_panorama_dualfisheye",
		"webgl_panorama_equirectangular",
		"webgl_performance",
		"webgl_performance_doublesided",
		"webgl_performance_static",
		"webgl_points_billboards",
		"webgl_points_dynamic",
		"webgl_points_sprites",
		"webgl_points_waves",
		"webgl_raycast_sprite",
		"webgl_raycast_texture",
		"webgl_read_float_buffer",
		"webgl_refraction",
		"webgl_rtt",
		"webgl_sandbox",
		"webgl_shader",
		"webgl_shader_lava",
		"webgl_shader2",
		"webgl_shaders_ocean",
		"webgl_shaders_ocean2",
		"webgl_shaders_sky",
		"webgl_shaders_tonemapping",
		"webgl_shaders_vector",
		"webgl_shading_physical",
		"webgl_shadow_contact",
		"webgl_shadowmap",
		"webgl_shadowmap_performance",
		"webgl_shadowmap_pointlight",
		"webgl_shadowmap_viewer",
		"webgl_shadowmap_vsm",
		"webgl_shadowmesh",
		"webgl_skinning_simple",
		"webgl_sprites",
		"webgl_test_memory",
		"webgl_test_memory2",
		"webgl_tonemapping",
		"webgl_trails",
		"webgl_video_panorama_equirectangular",
		"webgl_water",
		"webgl_water_flowmap"
	],
	"webgl / nodes": [
		"webgl_loader_nodes",
		"webgl_materials_compile",
		"webgl_materials_envmaps_hdr_nodes",
		"webgl_materials_envmaps_pmrem_nodes",
		"webgl_materials_nodes",
		"webgl_mirror_nodes",
		"webgl_performance_nodes",
		"webgl_postprocessing_nodes",
		"webgl_postprocessing_nodes_pass",
		"webgl_sprites_nodes",
	],
	"webgl / postprocessing": [
		"webgl_postprocessing",
		"webgl_postprocessing_advanced",
		"webgl_postprocessing_afterimage",
		"webgl_postprocessing_backgrounds",
		"webgl_postprocessing_crossfade",
		"webgl_postprocessing_dof",
		"webgl_postprocessing_dof2",
		"webgl_postprocessing_fxaa",
		"webgl_postprocessing_glitch",
		"webgl_postprocessing_godrays",
		"webgl_postprocessing_rgb_halftone",
		"webgl_postprocessing_masking",
		"webgl_postprocessing_ssaa",
		"webgl_postprocessing_ssaa_unbiased",
		"webgl_postprocessing_outline",
		"webgl_postprocessing_pixel",
		"webgl_postprocessing_procedural",
		"webgl_postprocessing_sao",
		"webgl_postprocessing_smaa",
		"webgl_postprocessing_sobel",
		"webgl_postprocessing_ssao",
		"webgl_postprocessing_taa",
		"webgl_postprocessing_unreal_bloom",
		"webgl_postprocessing_unreal_bloom_selective"
	],
	"webgl / advanced": [
		"webgl_buffergeometry",
		"webgl_buffergeometry_compression",
		"webgl_buffergeometry_constructed_from_geometry",
		"webgl_buffergeometry_custom_attributes_particles",
		"webgl_buffergeometry_drawrange",
		"webgl_buffergeometry_indexed",
		"webgl_buffergeometry_instancing",
		"webgl_buffergeometry_instancing_billboards",
		"webgl_buffergeometry_instancing_interleaved",
		"webgl_buffergeometry_lines",
		"webgl_buffergeometry_lines_indexed",
		"webgl_buffergeometry_morphtargets",
		"webgl_buffergeometry_points",
		"webgl_buffergeometry_points_interleaved",
		"webgl_buffergeometry_rawshader",
		"webgl_buffergeometry_selective_draw",
		"webgl_buffergeometry_uint",
		"webgl_custom_attributes",
		"webgl_custom_attributes_lines",
		"webgl_custom_attributes_points",
		"webgl_custom_attributes_points2",
		"webgl_custom_attributes_points3",
		"webgl_fire",
		"webgl_gpgpu_birds",
		"webgl_gpgpu_water",
		"webgl_gpgpu_protoplanet",
		"webgl_instancing_modified",
		"webgl_lightningstrike",
		"webgl_materials_modified",
		"webgl_raymarching_reflect",
		"webgl_shadowmap_csm",
		"webgl_shadowmap_pcss",
		"webgl_simple_gi",
		"webgl_tiled_forward",
		"webgl_worker_offscreencanvas"
	],
	"webgl2": [
		"webgl2_materials_texture2darray",
		"webgl2_materials_texture3d",
		"webgl2_multisampled_renderbuffers",
		"webgl2_sandbox"
	],
	"webaudio": [
		"webaudio_orientation",
		"webaudio_sandbox",
		"webaudio_timing",
		"webaudio_visualizer"
	],
	"webxr": [
		"webxr_ar_cones",
		"webxr_ar_hittest",
		"webxr_ar_paint",
		"webxr_vr_ballshooter",
		"webxr_vr_cubes",
		"webxr_vr_dragging",
		"webxr_vr_lorenzattractor",
		"webxr_vr_panorama",
		"webxr_vr_panorama_depth",
		"webxr_vr_paint",
		"webxr_vr_rollercoaster",
		"webxr_vr_sandbox",
		"webxr_vr_sculpt",
		"webxr_vr_video"
	],
	"physics": [
		"physics_ammo_break",
		"physics_ammo_cloth",
		"physics_ammo_rope",
		"physics_ammo_terrain",
		"physics_ammo_volume",
		"physics_cannon_instancing"
	],
	"misc": [
		"misc_animation_authoring",
		"misc_animation_groups",
		"misc_animation_keys",
		"misc_boxselection",
		"misc_controls_deviceorientation",
		"misc_controls_drag",
		"misc_controls_fly",
		"misc_controls_map",
		"misc_controls_orbit",
		"misc_controls_pointerlock",
		"misc_controls_trackball",
		"misc_controls_transform",
		"misc_exporter_collada",
		"misc_exporter_draco",
		"misc_exporter_gltf",
		"misc_exporter_obj",
		"misc_exporter_ply",
		"misc_exporter_stl",
		"misc_lookat",
	],
	"css2d": [
		"css2d_label"
	],
	"css3d": [
		"css3d_molecules",
		"css3d_orthographic",
		"css3d_panorama",
		"css3d_panorama_deviceorientation",
		"css3d_periodictable",
		"css3d_sandbox",
		"css3d_sprites",
		"css3d_youtube"
	],
	"svg": [
		"svg_lines",
		"svg_sandbox"
	],
	"tests": [
		"webgl_furnace_test",
		"webgl_pmrem_test",
		"misc_uv_tests"
	]
};

function extractQuery() {

	var p = window.location.search.indexOf( '?q=' );

	if ( p !== - 1 ) {

		return window.location.search.substr( 3 );

	}

	return '';

}

function createLink( file ) {

	var link = document.createElement( 'a' );
	link.className = 'link';
	link.href = 'content/' + file + '.html';
	link.textContent = getName( file );
	link.setAttribute( 'target', 'viewer' );
	link.addEventListener( 'click', function ( event ) {

		if ( event.button !== 0 || event.ctrlKey || event.altKey || event.metaKey ) return;

		selectFile( file );

	} );

	return link;

}

function loadFile( file ) {

	selectFile( file );
	viewer.src = 'content/' + file + '.html';

}

function selectFile( file ) {

	if ( selected !== null ) links[ selected ].classList.remove( 'selected' );

	links[ file ].classList.add( 'selected' );

	window.location.hash = file;
	viewer.focus();

	panel.classList.remove( 'open' );

	selected = file;

	// Reveal "View source" button and set attributes to this example
	viewSrcButton.style.display = '';
	viewSrcButton.href = 'https://github.com/mrdoob/three.js/blob/master/examples/' + selected + '.html';
	viewSrcButton.title = 'View source code for ' + getName( selected ) + ' on GitHub';

}

function updateFilter() {

	var v = filterInput.value;

	if ( v !== '' ) {

		window.history.replaceState( {}, '', '?q=' + v + window.location.hash );

	} else {

		window.history.replaceState( {}, '', window.location.pathname + window.location.hash );

	}

	var exp = new RegExp( v, 'gi' );

	for ( var key in files ) {

		var section = files[ key ];

		for ( var i = 0; i < section.length; i ++ ) {

			filterExample( section[ i ], exp );

		}

	}

	layoutList();

}

function filterExample( file, exp ) {

	var link = links[ file ];
	var name = getName( file );
	var res = file.match( exp );
	var text;

	if ( res && res.length > 0 ) {

		link.classList.remove( 'hidden' );

		for ( var i = 0; i < res.length; i ++ ) {

			text = name.replace( res[ i ], '<b>' + res[ i ] + '</b>' );

		}

		link.innerHTML = text;

	} else {

		link.classList.add( 'hidden' );
		link.innerHTML = name;

	}

}

function getName( file ) {

	var name = file.split( '_' );
	name.shift();
	return name.join( ' / ' );

}

function layoutList() {

	for ( var key in files ) {

		var collapsed = true;

		var section = files[ key ];

		for ( var i = 0; i < section.length; i ++ ) {

			var file = section[ i ];

			if ( links[ file ].classList.contains( 'hidden' ) === false ) {

				collapsed = false;
				break;

			}

		}

		var element = document.querySelector( 'h2[data-category="' + key + '"]' );

		if ( collapsed ) {

			element.classList.add( 'hidden' );

		} else {

			element.classList.remove( 'hidden' );

		}

	}

}

var panel = document.getElementById( 'panel' );
var content = document.getElementById( 'content' );
var viewer = document.getElementById( 'viewer' );

var filterInput = document.getElementById( 'filter' );
var exitSearchButton = document.getElementById( 'exitSearchButton' );

var expandButton = document.getElementById( 'expandButton' );
expandButton.addEventListener( 'click', function ( event ) {

	event.preventDefault();
	panel.classList.toggle( 'open' );

} );

var panelScrim = document.getElementById( 'panelScrim' );
panelScrim.onclick = function ( event ) {

	event.preventDefault();
	panel.classList.toggle( 'open' );

};

// iOS iframe auto-resize workaround

if ( /(iPad|iPhone|iPod)/g.test( navigator.userAgent ) ) {

	viewer.style.width = getComputedStyle( viewer ).width;
	viewer.style.height = getComputedStyle( viewer ).height;
	viewer.setAttribute( 'scrolling', 'no' );

}

var container = document.createElement( 'div' );
content.appendChild( container );

var viewSrcButton = document.getElementById( 'button' );
viewSrcButton.style.display = 'none';

var links = {};
var selected = null;

for ( var key in files ) {

	var section = files[ key ];

	var header = document.createElement( 'h2' );
	header.textContent = key;
	header.setAttribute( 'data-category', key );
	container.appendChild( header );

	for ( var i = 0; i < section.length; i ++ ) {

		var file = section[ i ];

		var link = createLink( file );
		container.appendChild( link );

		links[ file ] = link;

	}

}

if ( window.location.hash !== '' && links[ window.location.hash.substring( 1 ) ] ) {

	loadFile( window.location.hash.substring( 1 ) );

}

// filter
filterInput.onfocus = function ( event ) {

	panel.classList.add( 'searchFocused' );

};

filterInput.onblur = function ( event ) {

	if ( filterInput.value === '' ) {

		panel.classList.remove( 'searchFocused' );

	}

};

exitSearchButton.onclick = function ( event ) {

	filterInput.value = '';
	updateFilter();
	panel.classList.remove( 'searchFocused' );

};

filterInput.addEventListener( 'input', function () {

	updateFilter();

} );

filterInput.value = extractQuery();

if ( filterInput.value !== '' ) {

	panel.classList.add( 'searchFocused' );

}

updateFilter();