/*
** Define and load all testcases.
*/

var renderTests = {
	name: "webgl",
	children: [
		{
			name: "animation",
			children: [
				{
					name: "cloth",
					page: "webgl_animation_cloth",
					samples: 10
				},
				{
					name: "keyframes_json",
					page: "webgl_animation_keyframes_json",
					samples: 10
				},
				{
					name: "scene",
					page: "webgl_animation_scene",
					samples: 10
				},
				{
					name: "skinning",
					children: [
						{
							name: "blending",
							page: "webgl_animation_skinning_blending",
							samples: 10
						},
						{
							name: "morph",
							page: "webgl_animation_skinning_morph",
							samples: 10,
							//comparer: { name: "fuzzy", threshold: 0.02 }
						}
					]
				}
			]
		},
		{
			name: "camera",
			children: [
				{
					name: "array",
					page: "webgl_camera_array",
					samples: 10
				}
			]
		},
		{
			name: "clipping",
			children: [
				{
					name: "clipping",
					page: "webgl_clipping",
					samples: 10
				},
				{
					name: "advanced",
					page: "webgl_clipping_advanced",
					samples: 10
				}
			]
		},
		{
			name: "effects",
			children: [
				{
					name: "parallaxbarrier",
					page: "webgl_effects_parallaxbarrier",
					samples: 10
				},
			]
		},
		{
			name: "geometries",
			children: [
				{
					name: "geometries",
					page: "webgl_geometries",
					samples: 10
				},
				{
					name: "parametric",
					page: "webgl_geometries_parametric",
					samples: 10
				},
			]
		},
		{
			name: "geometry",
			children: [
				{
					name: "colors",
					children: [
						{
							name: "blender",
							page: "webgl_geometry_colors_blender",
							samples: 10
						}
					]
				},
				{
					name: "shapes",
					page: "webgl_geometry_shapes",
					samples: 10
				},
			]
		},
		{
			name: "hdr",
			page: "webgl_hdr",
			samples: 10
		},
		{
			name: "lights",
			children: [
				{
					name: "hemisphere",
					page: "webgl_lights_hemisphere",
					samples: 10
				},
				{
					name: "physical",
					page: "webgl_lights_physical",
					samples: 10
				},
			]
		},
		{
			name: "lines",
			children: [
				{
					name: "cubes",
					page: "webgl_lines_cubes",
					samples: 10
				},
			]
		},
		{
			name: "loader",
			children: [
				{
					name: "3ds",
					page: "webgl_loader_3ds",
					samples: 1
				},
				{
					name: "assimp",
					page: "webgl_loader_assimp",
					samples: 10
				},
				{
					name: "assimp2json",
					page: "webgl_loader_assimp2json",
					samples: 10
				},
				{
					name: "bvh",
					page: "webgl_loader_bvh",
					samples: 10
				},
				{
					name: "collada",
					children: [
						{
							name: "skinning",
							page: "webgl_loader_collada_skinning",
							samples: 10
						}
					]
				},
				{
					name: "gcode",
					page: "webgl_loader_gcode",
					samples: 10
				},
				{
					name: "stl",
					page: "webgl_loader_stl",
					samples: 10
				},
				{
					name: "texture",
					children: [
						{
							name: "dds",
							page: "webgl_loader_texture_dds",
							samples: 10
						}
					]
				},
			]
		},
		{
			name: "materials",
			children: [
				/* The example itself can't run successfully on MS EDGE.
				{
					name: "cubemap",
					children: [
						{
							name: "refraction",
							page: "webgl_materials_cubemap_refraction",
							samples: 10
						}
					]
				},
				*/
				{
					name: "displacementmap",
					page: "webgl_materials_displacementmap",
					samples: 10
				},
				{
					name: "envmaps",
					children: [
						{
							name: "hdr",
							page: "webgl_materials_envmaps_hdr",
							samples: 10
						}
					]
				},
				{
					name: "transparency",
					page: "webgl_materials_transparency",
					samples: 10
				},
				{
					name: "variations",
					children: [
						{
							name: "basic",
							page: "webgl_materials_variations_basic",
							samples: 10
						},
						{
							name: "lambert",
							page: "webgl_materials_variations_lambert",
							samples: 10
						},
						{
							name: "phong",
							page: "webgl_materials_variations_phong",
							samples: 10
						},
						{
							name: "standard",
							page: "webgl_materials_variations_standard",
							samples: 10
						},
						{
							name: "physical",
							page: "webgl_materials_variations_physical",
							samples: 10
						},
						{
							name: "toon",
							page: "webgl_materials_variations_toon",
							samples: 10
						},
					]
				},
				{
					name: "wireframe",
					page: "webgl_materials_wireframe",
					samples: 10
				},
			]
		},
		{
			name: "mirror",
			page: "webgl_mirror",
			samples: 10
		},
		{
			name: "panorama",
			children: [
				{
					name: "equirectangular",
					page: "webgl_panorama_equirectangular",
					samples: 10
				}
			]
		},
		{
			name: "refraction",
			page: "webgl_refraction",
			samples: 10
		},
		{
			name: "shader2",
			page: "webgl_shader2",
			samples: 10
		},
		{
			name: "shadowmap",
			children: [
				{
					name: "viewer",
					page: "webgl_shadowmap_viewer",
					samples: 10
				}
			]
		},
		{
			name: "terrain",
			children: [
				{
					name: "dynamic",
					page: "webgl_terrain_dynamic",
					samples: 10
				}
			]
		},
	]
};


var comparerConfig = { name: "simple", threshold: 5 };

function loadTests( node, parent ) {

	if ( node.children === undefined ) {

		var test = new TestCase( node.name, node.page, node.samples, node.comparer );
		parent.add( test );

	} else {

		var group = new TestGroup( node.name );
		parent.add( group );

		for ( var child in node.children ) {

			loadTests( node.children[ child ], group );

		}

	}

}

var testRoot = new TestGroup( "all" );
loadTests( renderTests, testRoot );
