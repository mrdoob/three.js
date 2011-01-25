var scene = {
	
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

	"sphere" : {
		"geometry" : "sphere",
		"materials": [ "lambert_green" ],
		"position" : [ -20, -5, 15 ],
		"rotation" : [ 0, 0, 0 ],
		"scale"	   : [ 1, 1, 1 ],
		"visible"  : true
	},

	"torus" : {
		"geometry" : "torus",
		"materials": [ "phong_orange" ],
		"position" : [ 0, 5, -50 ],
		"rotation" : [ 0, 0, 0 ],
		"scale"	   : [ 2, 2, 2 ],
		"visible"  : true
	},

	"cone" : {
		"geometry" : "cone",
		"materials": [ "lambert_blue" ],
		"position" : [ -50, 40, -50 ],
		"rotation" : [ 1.57, 0, 0 ],
		"scale"	   : [ 1, 1, 1 ],
		"visible"  : true
	},

	"cylinder" : {
		"geometry" : "cylinder",
		"materials": [ "lambert_blue" ],
		"position" : [ 50, 40, -50 ],
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
		"materials": [ "phong_white" ],
		"position" : [ -45, 10, 0 ],
		"rotation" : [ 0, 0, 0 ],
		"scale"	   : [ 0.5, 0.5, 0.5 ],
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
		"segments_width"  : 1, 
		"segments_height" : 1,
		"flipped" : false, 
		"sides"   : { "px": true, "nx": true, "py": true, "ny": true, "pz": true, "nz": true }
	},

	"plane": {
		"type"   : "plane",
		"width"  : 10, 
		"height" : 10,
		"segments_width"  : 50, 
		"segments_height" : 50
	},	

	"sphere": {
		"type"    : "sphere",
		"radius"  : 5, 
		"segments_width"  : 32, 
		"segments_height" : 16
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
	"basic_red": {
		"type": "MeshBasicMaterial",
		"parameters": { color: 0xff0000, wireframe: true } 
	},

	"basic_green": {
		"type": "MeshBasicMaterial",
		"parameters": { color: 0x007711, wireframe: true } 
	},

	"basic_gray": {
		"type": "MeshBasicMaterial",
		"parameters": { color: 0x666666, wireframe: true } 
	},

	"basic_black": {
		"type": "MeshBasicMaterial",
		"parameters": { color: 0x000000, wireframe: true } 
	},

	"basic_white": {
		"type": "MeshBasicMaterial",
		"parameters": { color: 0xffffff, wireframe: true } 
	},
	
	"basic_blue": {
		"type": "MeshBasicMaterial",
		"parameters": { color: 0x0000ff, wireframe: true } 
	},
	
	"lambert_red": {
		"type": "MeshLambertMaterial",
		"parameters": { color: 0xff0000 } 
	},
	
	"lambert_green": {
		"type": "MeshLambertMaterial",
		"parameters": { color: 0x007711 } 
	},

	"lambert_blue": {
		"type": "MeshLambertMaterial",
		"parameters": { color: 0x0055aa } 
	},
	
	"phong_white": {
		"type": "MeshPhongMaterial",
		"parameters": { color: 0xaaaaaa } 
	},

	"phong_orange": {
		"type": "MeshPhongMaterial",
		"parameters": { color:0x000000, specular: 0xaa5500 } 
	},
	
	"chrome": {
		"type": "MeshLambertMaterial",
		"parameters": { color: 0xffffff, env_map: "textureCube" }
	},

	"darkerchrome": {
		"type": "MeshLambertMaterial",
		"parameters": { color: 0x222222, env_map: "textureCube" }
	},
	
	"glass": {
		"type": "MeshLambertMaterial",
		"parameters": { color: 0x101046, env_map: "textureCube", opacity: 0.25 }
	},

	"interior": {
		"type": "MeshLambertMaterial",
		"parameters": { color: 0x050505 }
	},
	
	"face": {
		"type": "MeshFaceMaterial",
		"parameters": {}
	}
	
},

"textures": 
{
	
	"textureCube": {
		"url": [ "textures/cube/SwedishRoyalCastle/px.jpg",
				 "textures/cube/SwedishRoyalCastle/nx.jpg",		
				 "textures/cube/SwedishRoyalCastle/py.jpg",
				 "textures/cube/SwedishRoyalCastle/ny.jpg",
				 "textures/cube/SwedishRoyalCastle/pz.jpg",
				 "textures/cube/SwedishRoyalCastle/nz.jpg"
				]
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
		"color" 	 : [1,1,1]
	},

	"light2": {
		"type"	  : "point",
		"position": [0,0,0],
		"color"   : [1,1,1]
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