export const exceptionList = [

	// Take too long
	'webgpu_cubemap_mix', 				// 2 min
	'webgl_loader_texture_ultrahdr', 	// 1 min
	'webgl_marchingcubes', 				// 1 min
	'webgl_materials_cubemap_dynamic', 	// 1 min
	'webgl_materials_displacementmap', 	// 1 min
	'webgl_materials_envmaps_hdr', 		// 1 min
	'webgpu_water', 					// 1 min

	// Requires HTML-in-Canvas API
	'webgl_materials_texture_html',
	'webgpu_materials_texture_html',

	// Requires srgb-linear and float16 canvas
	'webgpu_loader_jpegxl',

	// Black screen
	'webgpu_postprocessing_ao',
	'webgpu_postprocessing_dof',
	'webgpu_postprocessing_ssgi',
	'webgpu_postprocessing_ssgi_ballpool',
	'webgpu_postprocessing_sss',
	'webgpu_postprocessing_traa',
	'webgpu_tsl_vfx_linkedparticles',
	'webgpu_volume_lighting_traa',

	// Timming issues?
	'physics_jolt_instancing',
	'physics_rapier_instancing',
	'webgl_shadowmap',
	'webaudio_visualizer',
	'webgpu_compute_audio',
	'webgpu_compute_cloth',
	'webgpu_compute_particles_fluid',
	'webgpu_compute_sort_bitonic',
	'webgpu_meshlets_ibl', // Rasterizer discrepancies
	'webgpu_storage_buffer',
	'webgpu_tsl_editor',
	'webgpu_tsl_graph',
	'webxr_vr_video',
	'webgpu_tsl_transpiler',
	'webgpu_rendertarget_2d-array_3d',
	'webgpu_volume_fire',

	// Need more time to render
	'css3d_mixed',
	'webgl_loader_3dtiles',
	'webgl_loader_texture_lottie',
	'webgl_morphtargets_face',
	'webgl_shadowmap_progressive',
	'webgpu_materials_matcap',
	'webgpu_meshlets_city',
	'webgpu_meshlets_materials',
	'webgpu_morphtargets_face',
	'webgpu_shadowmap_progressive',
	'webgpu_lightmap_baking',
	'webgpu_postprocessing_ssr_denoise',
	'webgpu_renderer_pathtracer',
	'webgpu_vxgi',
	'webgpu_vxgi_sponza',

	// Incremental light probe baking
	'webgl_lightprobes_sponza',
	'webgpu_generator_city', // Sub-pixel coverage of thin high-contrast geometry edges differs across rasterizers #33817
	'webgpu_lightprobes_sponza',

	// Video hangs the CI?
	'css3d_youtube',
	'webgpu_materials_video',
	'webgl_video_kinect',
	'webgl_video_panorama_equirectangular',

	// Timeout
	'webgl_test_memory2',

	// Webcam
	'webgl_materials_video_webcam',
	'webgl_morphtargets_webcam'

];
