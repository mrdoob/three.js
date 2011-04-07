var scene = {
	
"type"		  :	"scene",
"urlBaseType" : "relativeToHTML",
	
"objects": 
{	
	"cube1" : {
		"geometry" : "cube",
		"materials": [ "lambert_red" ],
		"position" : [ 0, 0, 0 ],
		"rotation" : [ 0, -0.3, 0 ],
		"scale"	   : [ 1, 1, 1 ],
		"visible"  : true
	},

	"cube2" : {
		"geometry" : "cube",
		"materials": [ "basic_white" ],
		"position" : [ 0, 0, 0 ],
		"rotation" : [ 0, -0.3, 0 ],
		"scale"	   : [ 2, 2, 2 ],
		"visible"  : true
	},

	"cube3" : {
		"geometry" : "cube",
		"materials": [ "minecraft" ],
		"position" : [ -30, -5, 25 ],
		"rotation" : [ 0, 0.8, 0 ],
		"scale"	   : [ 1, 1, 1 ],
		"visible"  : true
	},

	"sphere_lambert" : {
		"geometry" : "sphere",
		"materials": [ "lambert_green" ],
		"position" : [ -20, -5, 15 ],
		"rotation" : [ 0, 0, 0 ],
		"scale"	   : [ 1, 1, 1 ],
		"visible"  : true
	},

	"sphere_refraction" : {
		"geometry" : "sphere",
		"materials": [ "basic_refraction" ],
		"position" : [ 50, 45, -50 ],
		"rotation" : [ 0, 0, 0 ],
		"scale"	   : [ 1, 1, 1 ],
		"visible"  : true
	},

	"icosahedron" : {
		"geometry" : "icosahedron",
		"materials": [ "faceted_white" ],
		"position" : [ 20, 10, -60 ],
		"rotation" : [ 0, 0, 0 ],
		"scale"	   : [ 20, 20, 20 ],
		"visible"  : true
	},


	"torus" : {
		"geometry" : "torus",
		"materials": [ "phong_orange" ],
		"position" : [ -20, 5, -50 ],
		"rotation" : [ 0, 0, 0 ],
		"scale"	   : [ 2, 2, 2 ],
		"visible"  : true
	},

	"cone" : {
		"geometry" : "cone",
		"materials": [ "lambert_blue" ],
		"position" : [ -50, 15, -50 ],
		"rotation" : [ 1.57, 0, 0 ],
		"scale"	   : [ 1, 1, 1 ],
		"visible"  : true
	},

	"cylinder" : {
		"geometry" : "cylinder",
		"materials": [ "lambert_blue" ],
		"position" : [ 50, 15, -50 ],
		"rotation" : [ 1.57, 0, 0 ],
		"scale"	   : [ 1, 1, 1 ],
		"visible"  : true
	},
	
	"veyron" : {
		"geometry" : "veyron",
		"materials": [ "face" ],
		"position" : [ 40, -1, 0 ],
		"rotation" : [ 0, 0.3, 0 ],
		"scale"	   : [ 0.25, 0.25, 0.25 ],
		"visible"  : true
	},

	"walt" : {
		"geometry" : "WaltHead",
		"materials": [ "lambert_cube" ],
		"position" : [ -45, 10, 0 ],
		"rotation" : [ 0, 0, 0 ],
		"scale"	   : [ 0.5, 0.5, 0.5 ],
		"visible"  : true
	},

	"quad_bg" : {
		"geometry" : "quad",
		"materials": [ "textured_bg" ],
		"position" : [ 0, 15, -90 ],
		"rotation" : [ 0, 0, 0 ],
		"scale"	   : [ 20, 20, 20 ],
		"visible"  : true
	},
	
	"ground" : {
		"geometry" : "plane",
		"materials": [ "basic_gray" ],
		"position" : [ 0, -10, 0 ],
		"rotation" : [ 1.57, 0, 0 ],
		"scale"	   : [ 100, 100, 100 ],
		"visible"  : true
	}	
	
},
	
"geometries":
{
	"cube": {
		"type"  : "cube",
		"width" : 10, 
		"height": 10,
		"depth" : 10, 
		"segmentsWidth"  : 1, 
		"segmentsHeight" : 1,
		"segmentsDepth"  : 1,
		"flipped" : false, 
		"sides"   : { "px": true, "nx": true, "py": true, "ny": true, "pz": true, "nz": true }
	},

	"plane": {
		"type"   : "plane",
		"width"  : 10, 
		"height" : 10,
		"segmentsWidth"  : 50, 
		"segmentsHeight" : 50
	},	

	"quad": {
		"type"   : "plane",
		"width"  : 10, 
		"height" : 10,
		"segmentsWidth"  : 1, 
		"segmentsHeight" : 1
	},	

	"sphere": {
		"type"    : "sphere",
		"radius"  : 5, 
		"segmentsWidth"  : 32, 
		"segmentsHeight" : 16
	},

	"icosahedron": {
		"type"    : "icosahedron",
		"subdivisions"  : 2
	},
	
	"torus": {
		"type"    : "torus",
		"radius"  : 5,
		"tube"	  : 2,
		"segmentsR" : 16, 
		"segmentsT" : 32
	},
	
	"cylinder": {
		"type"    : "cylinder",
		"numSegs"  : 32, 
		"topRad"   : 5, 
		"botRad"   : 5,
		"height"   : 50,
		"topOffset": 0,
		"botOffset": 0
	},

	"cone": {
		"type"    : "cylinder",
		"numSegs"  : 32, 
		"topRad"   : 0, 
		"botRad"   : 5,
		"height"   : 50,
		"topOffset": 0,
		"botOffset": 0
	},
	
	"WaltHead": {
		"type": "bin_mesh",
		"url" : "obj/walt/WaltHead_bin.js"
	},

	"veyron": {
		"type": "bin_mesh",
		"url" : "obj/veyron/VeyronNoUv_bin.js"
	}
	
	
},
	
"materials":
{
	/*
	"basic_red": {
		"type": "MeshBasicMaterial",
		"parameters": { color: 0xff0000, wireframe: true } 
	},

	"basic_green": {
		"type": "MeshBasicMaterial",
		"parameters": { color: 0x007711, wireframe: true } 
	},
	
	"basic_blue": {
		"type": "MeshBasicMaterial",
		"parameters": { color: 0x0000ff, wireframe: true } 
	},
		
	"basic_black": {
		"type": "MeshBasicMaterial",
		"parameters": { color: 0x000000, wireframe: true } 
	},
	
	"phong_white": {
		"type": "MeshPhongMaterial",
		"parameters": { color: 0xaaaaaa } 
	},
	*/
	
	"basic_gray": {
		"type": "MeshBasicMaterial",
		"parameters": { color: 0x666666, wireframe: true } 
	},

	"basic_white": {
		"type": "MeshBasicMaterial",
		"parameters": { color: 0xffffff, wireframe: true } 
	},

	"faceted_white": {
		"type": "MeshLambertMaterial",
		"parameters": { color: 0xffffff, shading: "flat" } 
	},
	
	"lambert_red": {
		"type": "MeshLambertMaterial",
		"parameters": { color: 0xff0000 } 
	},
	
	"lambert_green": {
		"type": "MeshLambertMaterial",
		"parameters": { color: 0x007711, blending: "AdditiveBlending", transparent: true } 
	},

	"lambert_blue": {
		"type": "MeshLambertMaterial",
		"parameters": { color: 0x0055aa } 
	},
	
	"phong_orange": {
		"type": "MeshPhongMaterial",
		"parameters": { color:0x000000, specular: 0xaa5500 } 
	},
	
	"basic_refraction": {
		"type": "MeshBasicMaterial",
		"parameters": { color: 0xffffff, envMap: "cube_refraction", refractionRatio: 0.95 } 
	},
	
	"lambert_cube": {
		"type": "MeshLambertMaterial",
		"parameters": { color: 0xff6600, envMap: "cube_reflection", combine: "MixOperation", reflectivity: 0.3 }
	},
	
	"chrome": {
		"type": "MeshLambertMaterial",
		"parameters": { color: 0xffffff, envMap: "cube_reflection" }
	},

	"darkerchrome": {
		"type": "MeshLambertMaterial",
		"parameters": { color: 0x222222, envMap: "cube_reflection" }
	},
	
	"glass": {
		"type": "MeshLambertMaterial",
		"parameters": { color: 0x101046, envMap: "cube_reflection", opacity: 0.25, transparent: true }
	},

	"interior": {
		"type": "MeshLambertMaterial",
		"parameters": { color: 0x050505 }
	},
	
	"backlights": {	
		"type": "MeshLambertMaterial",
		"parameters": { color: 0xff0000, opacity: 0.5 }
	},
	
	"backsignals": {
		"type": "MeshLambertMaterial",
		"parameters": { color: 0xffbb00, opacity: 0.5 }
	},
	
	"textured_bg": {
		"type": "MeshBasicMaterial",
		"parameters": { color: 0xffffff, map: "texture_bg" } 
	},

	"minecraft": {
		"type": "MeshBasicMaterial",
		"parameters": { color: 0xffffff, map: "texture_minecraft" } 
	},
	
	"face": {
		"type": "MeshFaceMaterial",
		"parameters": {}
	}
	
},

"textures": 
{
	
	"cube_reflection": {
		"url": [ "textures/cube/SwedishRoyalCastle/px.jpg",
				 "textures/cube/SwedishRoyalCastle/nx.jpg",
				 "textures/cube/SwedishRoyalCastle/py.jpg",
				 "textures/cube/SwedishRoyalCastle/ny.jpg",
				 "textures/cube/SwedishRoyalCastle/pz.jpg",
				 "textures/cube/SwedishRoyalCastle/nz.jpg"
				]
	},

	"cube_refraction": {
		"url": [ "textures/cube/SwedishRoyalCastle/px.jpg",
				 "textures/cube/SwedishRoyalCastle/nx.jpg",
				 "textures/cube/SwedishRoyalCastle/py.jpg",
				 "textures/cube/SwedishRoyalCastle/ny.jpg",
				 "textures/cube/SwedishRoyalCastle/nz.jpg",
				 "textures/cube/SwedishRoyalCastle/pz.jpg"
				],
		"mapping": "CubeRefractionMapping"
	},

	"texture_bg": {
		"url": "textures/cube/SwedishRoyalCastle/pz.jpg"
	},

	"texture_minecraft": {
		"url": "textures/minecraft/grass.png",
		"magFilter": "NearestFilter",
		"minFilter": "LinearMipMapLinearFilter"
	}
	
},

"cameras":
{
	"cam1": {
		"type"  : "perspective",
		"fov"   : 50,
		"aspect": 1.33333,
		"near"  : 1,
		"far"   : 1000,
		"position": [0,0,100],
		"target"  : [0,0,0]
	},

	"cam2": {
		"type"  : "ortho",
		"left"  : 0,
		"right" : 1024,
		"top"   : 0,
		"bottom": 1024,
		"near"  : 1,
		"far"   : 1000,
		"position": [0,0,0],
		"target"  : [0,0,0]
	}

},

"lights":
{
	"light1": {
		"type"		 : "directional",
		"direction"	 : [0,1,1],
		"color" 	 : 0xffffff,
		"intensity"	 : 0.8
	},

	"light2": {
		"type"	  : "point",
		"position": [0,0,0],
		"color"   : 0xffffff
	}
	
},

"fogs":
{
	"basic": {
		"type" : "linear",
		"color": [1,0,0],
		"near" : 1,
		"far"  : 1000
	},
	
	"exponential": {
		"type"    : "exp2",
		"color"   : [1,1,1],
		"density" : 0.005,
	},
	
	"black": {
		"type"    : "exp2",
		"color"   : [0,0,0],
		"density" : 0.005,
	}
},
	
"defaults" : 
{
	"bgcolor" : [0,0,0],
	"bgalpha" : 1,
	"camera"  : "cam1",
	"fog"	  : "black"
}

};

postMessage( scene );
close();