{

	"metadata": {
		"formatVersion": 3.2,
		"type" : "scene"
	},

	"urlBaseType" : "relativeToHTML",

	"objects": {

		"group" : {
			"position" : [ 0, 0, 0 ],
			"rotation" : [ 0, 0, 0 ],
			"scale"	   : [ 1, 1, 1 ],
			"visible"  : true,
			"children" : {

				"cube1" : {
					"geometry" : "cubeNormals",
					"material" : "phong_red",
					"position" : [ 0, 0, 0 ],
					"rotation" : [ 0, -0.3, 0 ],
					"scale"	   : [ 1, 1, 1 ],
					"visible"  : true,
					"userData" : {
						"rotating" : true,
						"rotateX"  : true,
						"rotateY"  : true
					}
				},

				"cube2" : {
					"geometry" : "cubeWire",
					"material" : "basic_white",
					"position" : [ 0, 0, 0 ],
					"rotation" : [ 0, -0.3, 0 ],
					"scale"	   : [ 2, 2, 2 ],
					"visible"  : true
				},

				"cube3" : {
					"geometry" : "cube",
					"material" : "minecraft",
					"position" : [ -30, -5, 25 ],
					"rotation" : [ 0, 0.8, 0 ],
					"scale"	   : [ 1, 1, 1 ],
					"visible"  : true
				},

				"sphere_lambert" : {
					"geometry" : "sphere",
					"material" : "lambert_green",
					"position" : [ -20, -5, 15 ],
					"rotation" : [ 0, 0, 0 ],
					"scale"	   : [ 1, 1, 1 ],
					"visible"  : true
				},

				"sphere_refraction" : {
					"geometry" : "sphere",
					"material" : "basic_refraction",
					"position" : [ 50, 45, -50 ],
					"rotation" : [ 0, 0, 0 ],
					"scale"	   : [ 1, 1, 1 ],
					"visible"  : true
				},

				"sphere_cube" : {
					"geometry" : "sphere_uvs",
					"material" : "phong_compressed_cube",
					"position" : [ -30, -2, -15 ],
					"rotation" : [ 0, 0, 0 ],
					"scale"	   : [ 1.5, 1.5, 1.5 ],
					"visible"  : true
				},

				"icosahedron" : {
					"geometry" : "icosahedron",
					"material" : "faceted_white",
					"position" : [ 20, 10, -60 ],
					"rotation" : [ 0, 0, 0 ],
					"scale"	   : [ 1, 1, 1 ],
					"visible"  : true
				},

				"torus" : {
					"geometry" : "torus",
					"material" : "phong_orange",
					"position" : [ -20, 5, -50 ],
					"rotation" : [ 0, 0, 0 ],
					"scale"	   : [ 2, 2, 2 ],
					"visible"  : true
				},

				"cone" : {
					"geometry" : "cone",
					"material" : "lambert_blue",
					"position" : [ -50, 15, -50 ],
					"rotation" : [ 0, 0, 0 ],
					"scale"	   : [ 1, 1, 1 ],
					"visible"  : true
				},

				"cylinder" : {
					"geometry" : "cylinder",
					"material" : "lambert_blue",
					"position" : [ 50, 15, -50 ],
					"rotation" : [ 0, 0, 0 ],
					"scale"	   : [ 1, 1, 1 ],
					"visible"  : true
				},

				"colorcube1" : {
					"geometry" : "colorcube",
					"material" : "face",
					"position" : [ -10, -5, 30 ],
					"rotation" : [ 0, 0, 0 ],
					"scale"	   : [ 5, 5, 5 ],
					"visible"  : true,
					"children" : {
						"colorcube2" : {
							"geometry" : "colorcube",
							"material" : "face",
							"position" : [ 0, 2, 0 ],
							"rotation" : [ 0.1, 0.1, 0.1 ],
							"scale"	: [ 0.5, 0.5, 0.5 ],
							"visible"  : true,
							"children" : {
								"colorcube3" : {
									"geometry" : "colorcube",
									"material" : "face",
									"position" : [ 0, 2, 0 ],
									"rotation" : [ 0.1, 0.1, 0.1 ],
									"scale"	: [ 0.5, 0.5, 0.5 ],
									"visible"  : true,
									"children" : {
										"colorcube4" : {
											"geometry" : "colorcube",
											"material" : "face",
											"position" : [ 0, 2, 0 ],
											"rotation" : [ 0.1, 0.1, 0.1 ],
											"scale"	: [ 0.5, 0.5, 0.5 ],
											"visible"  : true
										}
									}
								}
							}
						}
					}
				},

				"veyron" : {
					"geometry" : "veyron",
					"material" : "multi_veyron",
					"position" : [ 40, -1, 0 ],
					"rotation" : [ 0, 0.3, 0 ],
					"scale"	   : [ 0.25, 0.25, 0.25 ],
					"visible"  : true
				},

				"walt" : {
					"geometry" : "WaltHead",
					"material" : "lambert_cube",
					"position" : [ -75, 10, -30 ],
					"rotation" : [ 0, 0.5, 0 ],
					"scale"	   : [ 0.5, 0.5, 0.5 ],
					"visible"  : true
				},

				"ben" : {
					"geometry" : "ben",
					"material" : "phong_ben",
					"position" : [ -45, -10, 0 ],
					"rotation" : [ 0, 0.5, 0 ],
					"scale"	   : [ 55, 55, 55 ],
					"visible"  : true
				},

				"ninja" : {
					"geometry" : "NinjaLo",
					"material" : "phong_normal",
					"position" : [ 75, 10, -30 ],
					"rotation" : [ 0, -0.5, 0 ],
					"scale"	   : [ 1.25, 1.25, 1.25 ],
					"visible"  : true
				},

				"sittingBox" : {
					"geometry" : "sittingBox",
					"material" : "phong_morph",
					"position" : [ -60, -10, 10 ],
					"rotation" : [ 0, 0.5, 0 ],
					"scale"	   : [ 23, 23, 23 ],
					"visible"  : true,
					"morph"	   : true,
					"duration" : 8000,
					"mirroredLoop" : true
				},

				"knight" : {
					"geometry" : "knight",
					"material" : "phong_skin",
					"position" : [ 70, -10, 10 ],
					"rotation" : [ 0, 0, 0 ],
					"scale"	   : [ 2.5, 2.5, 2.5 ],
					"visible"  : true,
					"skin"	   : true
				},

				"man" : {
					"type": "obj",
					"url" : "obj/male02/male02.obj",
					"material" : "phong_man",
					"position" : [ -10, -10, -25 ],
					"rotation" : [ 0, 0, 0 ],
					"scale"	   : [ 0.2, 0.2, 0.2 ],
					"visible"  : true
				},

				"man_clone_1" : {
					"geometry" : "man",
					"material" : "multi_1",
					"position" : [ 2.5, -10, -25 ],
					"rotation" : [ 0, 0, 0 ],
					"scale"	   : [ 0.2, 0.2, 0.2 ],
					"visible"  : true
				},

				"man_clone_2" : {
					"geometry" : "man",
					"material" : "multi_2",
					"position" : [ 15, -10, -25 ],
					"rotation" : [ 0, 0, 0 ],
					"scale"	   : [ 0.2, 0.2, 0.2 ],
					"visible"  : true
				},

				"monster" : {
					"type": "dae",
					"url" : "models/collada/monster/monster.dae",
					"position" : [ -43, -10, 27 ],
					"rotation" : [ -1.57, 0, 0 ],
					"scale"	   : [ 0.01, 0.01, 0.01 ],
					"visible"  : true
				},

				"hand" : {
					"type" : "utf8",
					"url"  : "models/utf8/hand.js",
					"material" : "phong_hand",
					"position" : [ -28, -1, 29 ],
					"rotation" : [ 0, 0.5, 0 ],
					"scale"	   : [ 12, 12, 12 ],
					"visible"  : true,
					"userData" : {
						"rotating" : true,
						"rotateY"  : true
					}
				},

				"bunny" : {
					"geometry" : "bunny",
					"material" : "phong_bunny",
					"position" : [ -25, -14, 0 ],
					"rotation" : [ 0, 0, 0 ],
					"scale"	   : [ 100, 100, 100 ],
					"visible"  : true
				},

				"disk" : {
					"geometry" : "disk",
					"material" : "phong_disk",
					"position" : [ 7, -10, 30 ],
					"rotation" : [ 1.57, 0, 0 ],
					"scale"	   : [ 10, 10, 10 ],
					"visible"  : true
				},

				"quad_bg" : {
					"geometry" : "quad",
					"material" : "textured_bg",
					"position" : [ 0, 15, -90 ],
					"rotation" : [ 0, 0, 0 ],
					"scale"	   : [ 20, 20, 20 ],
					"visible"  : true
				},

				"quad_texture1" : {
					"geometry" : "quad",
					"material" : "textured_compressed_dxt3",
					"position" : [ 15, -5, 20 ],
					"rotation" : [ 0, 0, 0 ],
					"scale"	   : [ 1, 1, 1 ],
					"visible"  : true
				},

				"quad_texture2" : {
					"geometry" : "quad",
					"material" : "textured_compressed_dxt5",
					"position" : [ 15, -5, 25 ],
					"rotation" : [ 0, 0, 0 ],
					"scale"	   : [ 1, 1, 1 ],
					"visible"  : true
				},

				"ground" : {
					"geometry" : "plane",
					"material" : "basic_gray",
					"position" : [ 0, -10, 0 ],
					"rotation" : [ -1.57, 0, 0 ],
					"scale"	   : [ 100, 100, 100 ],
					"visible"  : true
				},

				"light1": {
					"type"		 : "DirectionalLight",
					"direction"	 : [ 0, 1, 1 ],
					"color" 	 : 16777215,
					"intensity"	 : 1
				},

				"light2": {
					"type"	  : "PointLight",
					"position": [ 0, 0, 0 ],
					"color"   : 16777215,
					"intensity"	 : 1.25
				},

				"camera1": {
					"type"  : "PerspectiveCamera",
					"fov"   : 50,
					"aspect": 1.33333,
					"near"  : 1,
					"far"   : 1000,
					"position": [ 0, 0, 100 ],
					"target"  : [ 0, 0, 0 ]
				},

				"camera2": {
					"type"  : "OrthographicCamera",
					"left"  : 0,
					"right" : 1024,
					"top"   : 0,
					"bottom": 1024,
					"near"  : 1,
					"far"   : 1000,
					"position": [ 0, 0, 0 ],
					"target"  : [ 0, 0, 0 ]
				}
			}
		}

	},

	"geometries": {

		"cube": {
			"type"  : "cube",
			"width" : 10,
			"height": 10,
			"depth" : 10,
			"widthSegments"  : 1,
			"heightSegments" : 1,
			"depthSegments"  : 1
		},

		"cubeNormals": {
			"type"  : "cube",
			"width" : 10,
			"height": 10,
			"depth" : 10,
			"widthSegments"  : 1,
			"heightSegments" : 1,
			"depthSegments"  : 1
		},

		"cubeWire": {
			"type"  : "cube",
			"width" : 10,
			"height": 10,
			"depth" : 10,
			"widthSegments"  : 1,
			"heightSegments" : 1,
			"depthSegments"  : 1
		},

		"plane": {
			"type"   : "plane",
			"width"  : 10,
			"height" : 10,
			"widthSegments"  : 50,
			"heightSegments" : 50
		},

		"quad": {
			"type"   : "plane",
			"width"  : 10,
			"height" : 10,
			"widthSegments"  : 1,
			"heightSegments" : 1
		},

		"sphere": {
			"type"	: "sphere",
			"radius"  : 5,
			"widthSegments"  : 32,
			"heightSegments" : 16
		},

		"sphere_uvs": {
			"type"	: "sphere",
			"radius"  : 5,
			"widthSegments"  : 32,
			"heightSegments" : 16
		},

		"icosahedron": {
			"type"	: "icosahedron",
			"radius"  : 20,
			"subdivisions"  : 2
		},

		"torus": {
			"type"	: "torus",
			"radius"  : 5,
			"tube"	  : 2,
			"segmentsR" : 16,
			"segmentsT" : 32
		},

		"cylinder": {
			"type"	: "cylinder",
			"topRad"   : 5,
			"botRad"   : 5,
			"height"   : 50,
			"radSegs"  : 32,
			"heightSegs": 1
		},

		"cone": {
			"type"	: "cylinder",
			"topRad"   : 0,
			"botRad"   : 5,
			"height"   : 50,
			"radSegs"  : 32,
			"heightSegs" : 1
		},

		"WaltHead": {
			"type": "binary",
			"url" : "obj/walt/WaltHead_bin.js"
		},

		"NinjaLo": {
			"type": "binary",
			"url" : "obj/ninja/NinjaLo_bin.js"
		},

		"veyron": {
			"type": "binary",
			"url" : "obj/veyron/VeyronNoUv_bin.js"
		},

		"sittingBox": {
			"type": "ascii",
			"url" : "models/animated/sittingBox.js"
		},

		"knight": {
			"type": "ascii",
			"url" : "models/skinned/knight.js"
		},

		"man": {
			"type": "binary",
			"url" : "obj/male02/Male02_bin.js"
		},

		"ben": {
			"type": "ctm",
			"url" : "models/ctm/ben.ctm",
			"useWorkers" : true
		},

		"bunny": {
			"type": "vtk",
			"url" : "models/vtk/bunny.vtk"
		},

		"disk": {
			"type": "stl",
			"url" : "models/stl/ascii/slotted_disk.stl"
		},

		"colorcube": {
			"type": "embedded",
			"id"  : "cube_fvc"
		}

	},

	"embeds": {

		"cube_fvc": {

			"metadata" : {
				"formatVersion" : 3
			},

			"scale" : 1.0,

			"materials": [{
				"DbgColor" : 15658734,
				"DbgIndex" : 0,
				"DbgName" : "Material",
				"colorAmbient" : [0.0, 0.0, 0.0],
				"colorDiffuse" : [0.8, 0.8, 0.8],
				"colorSpecular" : [0.5, 0.5, 0.5],
				"specularCoef" : 50,
				"opacity" : 1.0,
				"vertexColors" : true
			}],

			"vertices": [1.000000,-1.000000,-1.000000,1.000000,-1.000000,1.000000,-1.000000,-1.000000,1.000000,-1.000000,-1.000000,-1.000000,1.000000,1.000000,-1.000000,0.999999,1.000000,1.000001,-1.000000,1.000000,1.000000,-1.000000,1.000000,-1.000000],

			"morphTargets": [],

			"normals": [],

			"colors": [16777215,16769421,16769424,8454135,15195931,7299839,16586715,16711687,1056014,6029475,13762484,9044089,7962349,6772991,16774622,4144383,11973887,1966063,1056285,9081232,13696943,5002581],

			"uvs": [[]],

			"faces": [131,0,1,2,3,0,0,1,2,3,131,4,7,6,5,0,4,5,6,7,131,0,4,5,1,0,0,8,9,10,131,1,5,6,2,0,0,11,12,13,131,2,6,7,3,0,14,15,16,17,131,4,0,3,7,0,18,19,20,21]

		}

	},

	"materials": {

		"basic_gray": {
			"type": "MeshBasicMaterial",
			"parameters": { "color": 6710886, "wireframe": true }
		},

		"basic_white": {
			"type": "MeshBasicMaterial",
			"parameters": { "color": 16777215, "wireframe": true }
		},

		"faceted_white": {
			"type": "MeshLambertMaterial",
			"parameters": { "color": 16777215, "shading": "flat" }
		},

		"phong_red": {
			"type": "MeshPhongMaterial",
			"parameters": { "color": 16711680, "specular": 16711680, "shininess": 25, "bumpMap": "texture_bump", "bumpScale": -0.75 }
		},

		"phong_ben": {
			"type": "MeshPhongMaterial",
			"parameters": { "color": 1118481, "specular": 5601245, "shininess": 12, "bumpMap": "texture_bump_repeat", "bumpScale": 0.125 }
		},

		"phong_man": {
			"type": "MeshPhongMaterial",
			"parameters": { "color": 16737894, "specular": 2236962, "shininess": 40, "wrapAround": true, "wrapRGB": [ 0.15, 0.02, 0.01 ] }
		},

		"phong_hand": {
			"type": "MeshPhongMaterial",
			"parameters": { "color": 14531481, "specular": 2236962, "shininess": 40, "wrapAround": true, "wrapRGB": [ 0.15, 0.02, 0.01 ] }
		},

		"phong_bunny": {
			"type": "MeshPhongMaterial",
			"parameters": { "color": 16777215, "specular": 1118481, "shininess": 10 }
		},

		"phong_monster": {
			"type": "MeshPhongMaterial",
			"parameters": { "color": 16777215, "specular": 1118481, "shininess": 10 }
		},

		"phong_disk": {
			"type": "MeshPhongMaterial",
			"parameters": { "color": 16733491, "specular": 1118481, "shininess": 30, "wireframe": false }
		},

		"phong_normal": {
			"type": "MeshPhongMaterial",
			"parameters": { "color": 0, "specular": 16777215, "shininess": 25, "envMap": "cube_reflection", "reflectivity": 0.1, "lightMap": "texture_ao", "normalMap": "texture_normal", "normalScale": [ 1, -1 ] }
		},

		"phong_morph": {
			"type": "MeshPhongMaterial",
			"parameters": { "color": 0, "specular": 16777215, "shininess": 50, "envMap": "cube_reflection", "reflectivity": 0.125, "combine": "MixOperation", "shading": "flat", "side": "double", "morphTargets": true, "morphNormals" : true }
		},

		"phong_skin": {
			"type": "MeshPhongMaterial",
			"parameters": { "color": 0, "specular": 16777215, "shininess": 50, "envMap": "cube_reflection", "reflectivity": 0.5, "combine": "MixOperation", "skinning": true, "morphTargets": true }
		},

		"phong_compressed_cube": {
			"type": "MeshPhongMaterial",
			"parameters": { "color": 16777215, "envMap": "cube_compressed", "bumpMap": "texture_bump_repeat_2", "bumpScale": -0.1 }
		},

		"lambert_green": {
			"type": "MeshLambertMaterial",
			"parameters": { "color": 30481, "blending": "AdditiveBlending", "transparent": true }
		},

		"lambert_blue": {
			"type": "MeshLambertMaterial",
			"parameters": { "color": 21930 }
		},

		"phong_orange": {
			"type": "MeshPhongMaterial",
			"parameters": { "color": 0, "specular": 11162880 }
		},

		"basic_refraction": {
			"type": "MeshBasicMaterial",
			"parameters": { "color": 16777215, "envMap": "cube_refraction", "refractionRatio": 0.95 }
		},

		"lambert_cube": {
			"type": "MeshLambertMaterial",
			"parameters": { "color": 16737792, "envMap": "cube_reflection", "combine": "MixOperation", "reflectivity": 0.3 }
		},

		"chrome": {
			"type": "MeshLambertMaterial",
			"parameters": { "color": 16777215, "envMap": "cube_reflection" }
		},

		"darkerchrome": {
			"type": "MeshLambertMaterial",
			"parameters": { "color": 2236962, "envMap": "cube_reflection" }
		},

		"glass": {
			"type": "MeshLambertMaterial",
			"parameters": { "color": 1052742, "envMap": "cube_reflection", "opacity": 0.25, "transparent": true }
		},

		"interior": {
			"type": "MeshLambertMaterial",
			"parameters": { "color": 328965 }
		},

		"backlights": {
			"type": "MeshLambertMaterial",
			"parameters": { "color": 16711680, "opacity": 0.5 }
		},

		"backsignals": {
			"type": "MeshLambertMaterial",
			"parameters": { "color": 16759552, "opacity": 0.5 }
		},

		"textured_bg": {
			"type": "MeshBasicMaterial",
			"parameters": { "color": 16777215, "map": "texture_bg" }
		},

		"textured_compressed_dxt3": {
			"type": "MeshBasicMaterial",
			"parameters": { "color": 16777215, "map": "texture_compressed_dxt3", "transparent": true }
		},

		"textured_compressed_dxt5": {
			"type": "MeshBasicMaterial",
			"parameters": { "color": 16777215, "map": "texture_compressed_dxt5", "transparent": true, "blending": "AdditiveBlending" }
		},

		"minecraft": {
			"type": "MeshBasicMaterial",
			"parameters": { "color": 16777215, "map": "texture_minecraft" }
		},

		"face": {
			"type": "MeshFaceMaterial",
			"parameters": {}
		},

		"multi_1": {
			"type": "MeshFaceMaterial",
			"parameters": {}
		},

		"multi_2": {
			"type": "MeshFaceMaterial",
			"parameters": { "materials": [ "phong_compressed_cube", "phong_man", "phong_hand", "minecraft", "backsignals" ] }
		},

		"multi_veyron": {
			"type": "MeshFaceMaterial",
			"parameters": { "materials": [ "interior", "chrome", "darkerchrome", "glass", "chrome", "chrome", "backlights", "backsignals" ] }
		}

	},

	"textures": {

		"cube_reflection": {
			"url": [
				"textures/cube/SwedishRoyalCastle/px.jpg",
				"textures/cube/SwedishRoyalCastle/nx.jpg",
				"textures/cube/SwedishRoyalCastle/py.jpg",
				"textures/cube/SwedishRoyalCastle/ny.jpg",
				"textures/cube/SwedishRoyalCastle/pz.jpg",
				"textures/cube/SwedishRoyalCastle/nz.jpg"
			]
		},

		"cube_refraction": {
			"url": [
				"textures/cube/SwedishRoyalCastle/px.jpg",
				"textures/cube/SwedishRoyalCastle/nx.jpg",
				"textures/cube/SwedishRoyalCastle/py.jpg",
				"textures/cube/SwedishRoyalCastle/ny.jpg",
				"textures/cube/SwedishRoyalCastle/nz.jpg",
				"textures/cube/SwedishRoyalCastle/pz.jpg"
			],
			"mapping": "CubeRefractionMapping"
		},

		"cube_compressed": {
			"url": [
				"textures/cube/Escher/dds/px.dds",
				 "textures/cube/Escher/dds/nx.dds",
				 "textures/cube/Escher/dds/py.dds",
				 "textures/cube/Escher/dds/ny.dds",
				 "textures/cube/Escher/dds/pz.dds",
				 "textures/cube/Escher/dds/nz.dds"
			]
		},

		"texture_bg": {
			"url": "textures/cube/SwedishRoyalCastle/pz.jpg",
			"anisotropy": 4
		},

		"texture_compressed_dxt3": {
			"url": "textures/compressed/hepatica_dxt3_mip.dds",
			"anisotropy": 4
		},

		"texture_compressed_dxt5": {
			"url": "textures/compressed/explosion_dxt5_mip.dds",
			"anisotropy": 4
		},

		"texture_bump": {
			"url": "textures/water.jpg",
			"anisotropy": 4
		},

		"texture_bump_repeat": {
			"url": "textures/water.jpg",
			"repeat" : [ 20, 20 ],
			"anisotropy": 4
		},

		"texture_bump_repeat_2": {
			"url": "textures/water.jpg",
			"repeat" : [ 4, 2 ],
			"anisotropy": 4
		},

		"texture_normal": {
			"url": "textures/normal/ninja/normal.jpg",
			"anisotropy": 4
		},

		"texture_ao": {
			"url": "textures/normal/ninja/ao.jpg",
			"anisotropy": 4
		},

		"texture_displacement": {
			"url": "textures/normal/ninja/displacement.jpg",
			"anisotropy": 4
		},

		"texture_minecraft": {
			"url": "textures/minecraft/grass.png",
			"magFilter": "NearestFilter",
			"minFilter": "LinearMipMapLinearFilter"
		}

	},

	"fogs":	{
		"basic": {
			"type": "linear",
			"color": [1,0,0],
			"near": 1,
			"far": 1000
		},

		"exponential": {
			"type": "exp2",
			"color": [1,1,1],
			"density": 0.005
		},

		"black": {
			"type": "exp2",
			"color": [0,0,0],
			"density": 0.005
		}
	},

	"defaults": {
		"bgcolor": [0,0,0],
		"bgalpha": 1,
		"camera": "camera1",
		"fog": "black"
	}

}
