{

    "metadata":
        {
	"formatVersion": 3,
	"type"		   : "scene"
    },

    "urlBaseType" : "relativeToHTML",

    "objects":
        {
	"rootNode" : {
            "position" : [ 0, 0, 0 ],
            "rotation" : [ 0, 0, 0 ],
            "scale"	: [ 1, 1, 1 ],
            "visible"  : true,
            "properties" : {
               "displayName" : "root"
            },
            "children" : {

                "row1" : {
                    "position" : [ 0, 0, 0 ],
                    "rotation" : [ 0, 0, 0 ],
                    "scale"    : [ 1, 1, 1 ],
                    "visible"  : true,
                    "properties" : {
                        "displayName" : "row"
                    },
                    "children" : {

                        "cube11" : {
                            "geometry" : "cube",
                            "materials": [ "lambert_green" ],
                            "position" : [ 0, 0, 0 ],
                            "rotation" : [ 0, 0, 0 ],
                            "scale"    : [ 1, 1, 1 ],
                            "visible"  : true,
                            "properties" : {
                                "displayName" : "cube"
                            }
                        },
                        
                        "cube12" : {
                            "geometry" : "cube",
                            "materials": [ "lambert_green" ],
                            "position" : [ 10, 0, 0 ],
                            "rotation" : [ 0, 0, 0 ],
                            "scale"    : [ 1, 1, 1 ],
                            "visible"  : true,
                            "properties" : {
                                "displayName" : "cube"
                            }
                        },
                        
                        "cube13" : {
                            "geometry" : "cube",
                            "materials": [ "lambert_green" ],
                            "position" : [ 10, 10, 0 ],
                            "rotation" : [ 0, 0, 0 ],
                            "scale"    : [ 1, 1, 1 ],
                            "visible"  : true,
                            "properties" : {
                                "displayName" : "cube"
                            }
                        },
                        
                        "cube14" : {
                            "geometry" : "cube",
                            "materials": [ "lambert_green" ],
                            "position" : [ 0, 10, 0 ],
                            "rotation" : [ 0, 0, 0 ],
                            "scale"    : [ 1, 1, 1 ],
                            "visible"  : true,
                            "properties" : {
                                "displayName" : "cube"
                            }
                        }
                    }
                },
            
            
                "row2" : {
                    "position" : [ 0, 0, 10 ],
                    "rotation" : [ 0, 0, 0 ],
                    "scale"    : [ 1, 1, 1 ],
                    "visible"  : true,
                    "properties" : {
                        "displayName" : "row"
                    },
                    "children" : {

                        "cube21" : {
                            "geometry" : "cube",
                            "materials": [ "lambert_red" ],
                            "position" : [ 0, 0, 0 ],
                            "rotation" : [ 0, 0, 0 ],
                            "scale"    : [ 1, 1, 1 ],
                            "visible"  : true, 
                            "properties" : {
                                "displayName" : "cube"
                            }
                        },

                        "cube22" : {
                            "geometry" : "cube",
                            "materials": [ "lambert_red" ],
                            "position" : [ 10, 0, 0 ],
                            "rotation" : [ 0, 0, 0 ],
                            "scale"    : [ 1, 1, 1 ],
                            "visible"  : true,
                            "properties" : {
                                "displayName" : "cube"
                            }
                        },

                        "cube23" : {
                            "geometry" : "cube",
                            "materials": [ "lambert_red" ],
                            "position" : [ 10, 10, 0 ],
                            "rotation" : [ 0, 0, 0 ],
                            "scale"    : [ 1, 1, 1 ],
                            "visible"  : true,
                            "properties" : {
                                "displayName" : "cube"
                            }
                        },

                        "cube24" : {
                            "geometry" : "cube",
                            "materials": [ "lambert_red" ],
                            "position" : [ 0, 10, 0 ],
                            "rotation" : [ 0, 0, 0 ],
                            "scale"    : [ 1, 1, 1 ],
                            "visible"  : true,
                            "properties" : {
                                "displayName" : "cube"
                            }
                        }
                    }
                },
                
                
                "row3" : {
                    "position" : [ 0, 0, 20 ],
                    "rotation" : [ 0, 0, 0.4 ],
                    "scale"    : [ 1, 1, 1 ],
                    "visible"  : true,
                    "properties" : {
                        "displayName" : "row"
                    },
                    "children" : {

                        "cube31" : {
                            "geometry" : "cube",
                            "materials": [ "lambert_blue" ],
                            "position" : [ 0, 0, 0 ],
                            "rotation" : [ 0, 0, 0 ],
                            "scale"    : [ 1, 1, 1 ],
                            "visible"  : true,
                            "properties" : {
                                "displayName" : "cube"
                            }
                        },

                        "cube32" : {
                            "geometry" : "cube",
                            "materials": [ "lambert_blue" ],
                            "position" : [ 10, 0, 0 ],
                            "rotation" : [ 0, 0, 0 ],
                            "scale"    : [ 1, 1, 1 ],
                            "visible"  : true,
                            "properties" : {
                                "displayName" : "cube"
                            }
                        },

                        "cube33" : {
                            "geometry" : "cube",
                            "materials": [ "lambert_blue" ],
                            "position" : [ 10, 10, 0 ],
                            "rotation" : [ 0, 0, 0 ],
                            "scale"    : [ 1, 1, 1 ],
                            "visible"  : true,
                            "properties" : {
                                "displayName" : "cube"
                            }
                        },

                        "cube34" : {
                            "geometry" : "cube",
                            "materials": [ "lambert_blue" ],
                            "position" : [ 0, 10, 0 ],
                            "rotation" : [ 0, 0, 0 ],
                            "scale"    : [ 1, 1, 1 ],
                            "visible"  : true,
                            "properties" : {
                                "displayName" : "cube"
                            }
                        }
                    }
                }
                
            }
            
        }, 

	"ground" : {
            "geometry" : "plane",
            "materials": [ "basic_gray" ],
            "position" : [ 0, -10, 0 ],
            "rotation" : [ 0, 0, 0 ],
            "scale"	   : [ 100, 100, 100 ],
            "visible"  : true
	}

    },

    "geometries":
        {
	"cube": {
            "type"  : "cube",
            "width" : 1,
            "height": 2,
            "depth" : 3,
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
	}

	
    },



    "materials":
        {

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

	"lambert_red": {
            "type": "MeshLambertMaterial",
            "parameters": { "color": 16711680 }
	},

	"lambert_green": {
            "type": "MeshLambertMaterial",
            "parameters": { "color": 30481, "blending": "AdditiveBlending", "transparent": true }
	},

	"lambert_blue": {
            "type": "MeshLambertMaterial",
            "parameters": { "color": 21930 }
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
            "color" 	 : 16777215,
            "intensity"	 : 0.8
	},

	"light2": {
            "type"	  : "point",
            "position": [0,0,0],
            "color"   : 16777215
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
            "density" : 0.005
	},

	"black": {
            "type"    : "exp2",
            "color"   : [0,0,0],
            "density" : 0.005
	}
    },

    "defaults" :
        {
	"bgcolor" : [0,0,0],
	"bgalpha" : 1,
	"camera"  : "cam1",
	"fog"	  : "black"
    }

}
