"""FBX to Three.js converter (based on FBX import example from Autodesk FBX SDK)

Converts FBX scene file into Three.js scene format (one scene file and several ascii model files plus textures).

-------------------------
How to use this converter
-------------------------

python convert_fbx_three.py scene.fbx output_folder

------------
Dependencies
------------

Requires Autodesk FBX SDK Python bindings. 

If your platform is not included in "modules", full SDK can be downloaded from here: 
    
    http://usa.autodesk.com/adsk/servlet/pc/index?siteID=123112&id=6837478

---------------------------
How to load generated scene 
---------------------------

<script type="text/javascript" src="ThreeExtras.js"></script>

<script type="text/javascript">

    ...
    
    SCENE_URL = "http://example.com/output_folder/scene.js";
    SceneUtils.loadScene( SCENE_URL, callback_sync, callback_async, callback_progress );

    ...

    /*
    callback_sync     - called after the scene file is loaded (procedural elements like cubes and spheres or materials without textures are now ready)
    callback_progress - called after each asynchronous elements gets loaded (textures and model files)
    callback_async    - called after all asynchronous elements (models and textures) are loaded, now whole scene is ready
    
    Scene is fully created, just needs to be passed to renderer, together with camera. 
    Individual scene elements are also returned for convenient access via hashmap (addressable by their id).
    
    progress = {
        
        total_models:    X,
        total_textures:  Y,
        loaded_models:   A,
        loaded_textures: B
        
    };
    
    result = {
        
        scene: new THREE.Scene(),
        geometries: { ... },
        materials: { ... },
        textures: { ... },
        objects: { ... },
        cameras: { ... },
        lights: { ... },
        fogs: { ... },
        
        currentCamera: THREE.Camera( ... )
    
    };
    
    */
    
    var callback_progress = function( progress, result ) { ... };    
    var callback_sync = function( result ) { ... };
    var callback_async = function( result ) { ... };
    
    };

</script>


--------
Features
--------

- scene + models + materials + textures
- multiple UV layers

-------------------
Current limitations
-------------------

- only very small subset from FBX is currently supported
    - static meshes
    - triangles and quads
    - max two UV layers
    - Lambert and Phong materials (partial: Three doesn't support emissive color)
- no lights yet
- no cameras yet (default one is created instead)

------
Author
------
AlteredQualia http://alteredqualia.com

"""

import os
import sys
import random
import math
import pprint
import shutil
import string
import os.path

# load platform specific binary modules
platform_map = {
"Windows" : 
    { 
    "folder": "win", 
    "versions" : {
        2 : "Python26_x86",
        3 : "Python31_x86"
        }
    },
"Linux" :
    { 
    "folder": "linux", 
    "versions" : {
        2 : "Python26_x86",
        3 : "Python31_x86"
        }
    },
"Darwin"  :
    { 
    "folder": "mac", 
    "versions" : {
        2 : "Python26_x86",
        3 : "Python31_x86"
        }
    }
}

import platform
system = platform.system()
version = sys.version_info[0]
if system in platform_map:
    if version in platform_map[system]["versions"]:
        mod_path = os.path.join(sys.path[0], "modules", platform_map[system]["folder"], platform_map[system]["versions"][version])
        print mod_path
        sys.path.append(mod_path)

# #####################################################
# Configuration
# #####################################################
DEFAULTS = {
"bgcolor" : [0, 0, 0],
"bgalpha" : 1.0,
"camera"  : 
    {
        "name" : "default_camera",
        "type" : "perspective",
        "near" : 1,
        "far"  : 10000,
        "fov"  : 60,
        "aspect": 1.333,
        "position" : [0, 0, 10],
        "target"   : [0, 0, 0]
    }
}

MATERIALS_IN_SCENE = True
DEBUG_FBX_JSON = True

# default colors for debugging (each material gets one distinct color): 
# white, red, green, blue, yellow, cyan, magenta
COLORS = [0xeeeeee, 0xee0000, 0x00ee00, 0x0000ee, 0xeeee00, 0x00eeee, 0xee00ee]


# #####################################################
# Templates - scene
# #####################################################
TEMPLATE_SCENE_ASCII = u"""\
// Converted from: %(fname)s
//  Generated with FBX -> Three.js converter
//  http://github.com/alteredq/three.js/blob/master/utils/exporters/fbx/convert_fbx_three.py

var url_base     = %(url_base)s,
    url_models   = url_base + "models/",
    url_textures = url_base + "textures/";

var scene = {
%(sections)s

"defaults" : 
{
    "bgcolor" : %(bgcolor)s,
    "bgalpha" : %(bgalpha)f,
    "camera"  : %(defcamera)s
}

}

postMessage( scene );

"""

TEMPLATE_SECTION = """
"%s" : 
{
%s
},
"""

TEMPLATE_OBJECT = """\
    %(object_id)s : {
        "geometry"  : %(geometry_id)s,
        "materials" : [ %(material_id)s ],
        "position"  : %(position)s,
        "rotation"  : %(rotation)s,
        "scale"	    : %(scale)s,
        "visible"   : true
    }"""

TEMPLATE_GEOMETRY = """\
    %(geometry_id)s : {
        "type" : "ascii_mesh",
        "url"  : url_models + %(model_file)s
    }"""

TEMPLATE_TEXTURE = """\
    %(texture_id)s : {
        "url": url_textures + %(texture_file)s
    }"""

TEMPLATE_MATERIAL_SCENE = """\
    %(material_id)s : {
        "type": %(type)s,
        "parameters": { %(parameters)s } 
    }"""

TEMPLATE_CAMERA_PERSPECTIVE = """\
    %(camera_id)s : {
        "type"  : "perspective",
        "fov"   : %(fov)f,
        "aspect": %(aspect)f,
        "near"  : %(near)f,
        "far"   : %(far)f,
        "position": %(position)s,
        "target"  : %(target)s
    }"""

TEMPLATE_CAMERA_ORTHO = """\
    %(camera_id)s: {
        "type"  : "ortho",
        "left"  : %(left)f,
        "right" : %(right)f,
        "top"   : %(top)f,
        "bottom": %(bottom)f,
        "near"  : %(near)f,
        "far"   : %(far)f,
        "position": %(position)s,
        "target"  : %(target)s
    }"""

TEMPLATE_VEC3 = '[ %f, %f, %f ]'  
TEMPLATE_VEC2 = '[ %f, %f ]'  
TEMPLATE_STRING = '"%s"'
TEMPLATE_HEX = "0x%06x"

# #####################################################
# Templates - model
# #####################################################
TEMPLATE_MODEL_ASCII = u"""\
// Converted from: %(fname)s
//  vertices: %(nvertex)d
//  faces: %(nface)d 
//  materials: %(nmaterial)d
//
//  Generated with FBX -> Three.js converter
//  http://github.com/alteredq/three.js/blob/master/utils/exporters/fbx/convert_fbx_three.py

var model = {
    'materials': [%(materials)s],

    'normals': [%(normals)s],

    'vertices': [%(vertices)s],

    'uvs': [%(uvs)s],
    'uvs2': [%(uvs2)s],

    'triangles': [%(triangles)s],
    'trianglesUvs': [%(trianglesUvs)s],
    'trianglesNormals': [%(trianglesNormals)s],
    'trianglesNormalsUvs': [%(trianglesNormalsUvs)s],

    'quads': [%(quads)s],
    'quadsUvs': [%(quadsUvs)s],
    'quadsNormals': [%(quadsNormals)s],
    'quadsNormalsUvs': [%(quadsNormalsUvs)s],

    'end': (new Date).getTime()
    }
    
postMessage( model );
"""

TEMPLATE_VERTEX = "%f,%f,%f"

TEMPLATE_UV_TRI = "%f,%f,%f,%f,%f,%f"
TEMPLATE_UV_QUAD = "%f,%f,%f,%f,%f,%f,%f,%f"

TEMPLATE_TRI = "%d,%d,%d,%d"
TEMPLATE_QUAD = "%d,%d,%d,%d,%d"

TEMPLATE_TRI_UV = "%d,%d,%d,%d,%d,%d,%d"
TEMPLATE_QUAD_UV = "%d,%d,%d,%d,%d,%d,%d,%d,%d"

TEMPLATE_TRI_N = "%d,%d,%d,%d,%d,%d,%d"
TEMPLATE_QUAD_N = "%d,%d,%d,%d,%d,%d,%d,%d,%d"

TEMPLATE_TRI_N_UV = "%d,%d,%d,%d,%d,%d,%d,%d,%d,%d"
TEMPLATE_QUAD_N_UV = "%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d"

TEMPLATE_N = "%f,%f,%f"
TEMPLATE_UV = "%f,%f"

# #####################################################
# Templates - misc
# #####################################################
TEMPLATE_HTACCESS = """\
<Files *.js>
SetOutputFilter DEFLATE
</Files>
"""

# #####################################################
# Parser - global settings
# #####################################################
def extract_color(color):
    return [color.mRed, color.mGreen, color.mBlue]
    
def extract_vec2(v):
    return [v[0], v[1]]

def extract_vec3(v):
    return [v[0], v[1], v[2]]

def extract_global_settings(settings):
    settings = {
    "ambient_color" : extract_color(settings.GetAmbientColor()),
    "default_camera": settings.GetDefaultCamera().Buffer()
    }
    
    return settings
    
def extract_object_properties(object):
    info = {}

    property = object.GetFirstProperty()
    while property.IsValid():
        name = property.GetName().Buffer()
        
        value = "UNIDENTIFIED"
        
        ptype = property.GetPropertyDataType().GetType()
        if ptype in [eBOOL1, eDOUBLE1, eINTEGER1, eDOUBLE4, eDOUBLE3, eFLOAT1]:
            value = property.Get()            
        elif ptype == eSTRING:
            value = property.Get().Buffer()
        
        info[name] = {
        "label" : property.GetLabel().Buffer(),
        "type"  : property.GetPropertyDataType().GetName(),
        "value" : value
        }
        
        property = object.GetNextProperty(property)
        
    return info
        
def extract_node_generic_info(node):
    info = []
    
    node_info = {
    "name"       : node.GetName(),
    "type"       : node.ClassId.GetFbxFileTypeName(),
    "properties" : extract_object_properties(node)
    }
    
    info.append(node_info)
    
    for i in range(node.GetChildCount()):
        info += extract_node_generic_info(node.GetChild(i))
        
    return info
    
def extract_generic_info(scene):
    info_list = []
    
    root_node = scene.GetRootNode()
    for i in range(root_node.GetChildCount()):
        child = root_node.GetChild(i)
        info_list += extract_node_generic_info(child)
        
    info_dict = {}
    for item in info_list:
        name = item["name"]
        info_dict[name] = item["properties"]
        
    return info_dict
    
# #####################################################
# Parser - hierarchy
# #####################################################
def extract_node_hierarchy(node, depth):
    hierarchy = { "name" : node.GetName(), "depth" : depth, "children" : [] }    

    for i in range(node.GetChildCount()):
        hierarchy["children"].append(extract_node_hierarchy(node.GetChild(i), depth + 1))
    
    return hierarchy

def extract_hierarchy(scene):
    root = scene.GetRootNode()
    
    hierarchy = { "name" : "root", "depth" : 0, "children" : [] }
    
    for i in range(root.GetChildCount()):
        hierarchy["children"].append(extract_node_hierarchy(root.GetChild(i), 1))
        
    return hierarchy
    
# #####################################################
# Parser - mesh - layers
# #####################################################
def extract_layer_groups(layer, poly_count):
    group = []
    
    polygroups = layer.GetPolygonGroups()
    if polygroups and \
       polygroups.GetMappingMode() == KFbxLayerElement.eBY_POLYGON and \
       polygroups.GetReferenceMode() == KFbxLayerElement.eINDEX:
        
        polygroups_index_array = polygroups.GetIndexArray()
        group = []
        for p in range(poly_count):
            group_id = polygroups_index_array.GetAt(p)
            group.append(group_id)
    
    return group

def extract_layer_materials(layer, poly_count, mesh):
    material_index_layer = []
    
    materials = layer.GetMaterials()
    if materials:
        index_array = materials.GetIndexArray()
        index_array_count = index_array.GetCount() 
        for i in range(index_array_count):
            material_index_layer.append(index_array.GetAt(i))
    
    return material_index_layer
    
def extract_layer_uvs(layer, poly_count, mesh):
    uv_values = []
    uv_index_layer = []
    
    uvs = layer.GetUVs()
    if uvs:
        uvs_array = uvs.GetDirectArray()
        uvs_count = uvs_array.GetCount()

        # values
        for i in range(uvs_count):
            uv = extract_vec2(uvs_array.GetAt(i))
            uv_values.append(uv)

        # indices        
        if uvs.GetMappingMode() == KFbxLayerElement.eBY_CONTROL_POINT \
           and uvs.GetReferenceMode() == KFbxLayerElement.eDIRECT:
            
            for p in range(poly_count):
                tmp = []
                polygon_size = mesh.GetPolygonSize(p)
                for v in range(polygon_size):
                    id = mesh.GetPolygonVertex(p, v)
                    tmp.append(id)
                
                uv_index_layer.append(tmp)

        elif uvs.GetMappingMode() == KFbxLayerElement.eBY_CONTROL_POINT \
           and uvs.GetReferenceMode() == KFbxLayerElement.eINDEX_TO_DIRECT:
            
            uvs_index_array = uvs.GetIndexArray()
            for p in range(poly_count):
                tmp = []
                polygon_size = mesh.GetPolygonSize(p)
                for v in range(polygon_size):
                    control_point_index = mesh.GetPolygonVertex(p, v)
                    id = uvs_index_array.GetAt(control_point_index)
                    tmp.append(id)
                    
                uv_index_layer.append(tmp)

        elif uvs.GetMappingMode() == KFbxLayerElement.eBY_POLYGON_VERTEX \
            and ( uvs.GetReferenceMode() == KFbxLayerElement.eDIRECT \
                  or uvs.GetReferenceMode() == KFbxLayerElement.eINDEX_TO_DIRECT ):
            
            for p in range(poly_count):
                tmp = []
                polygon_size = mesh.GetPolygonSize(p)
                for v in range(polygon_size):
                    id = mesh.GetTextureUVIndex(p, v)
                    tmp.append(id)
                    
                uv_index_layer.append(tmp)
    
    return uv_values, uv_index_layer
    
def extract_layer_colors(layer, poly_count, mesh):
    color_values = []
    color_index_layer = []
    
    colors = layer.GetVertexColors()
    if colors:
        colors_array = colors.GetDirectArray()
        colors_count = colors_array.GetCount()

        # values
        tmp = []
        for i in range(colors_count):
            color = extract_color(colors_array.GetAt(i))
            color_values.append(color)
        
        # indices
        if colors.GetMappingMode() == KFbxLayerElement.eBY_CONTROL_POINT \
           and colors.GetReferenceMode() == KFbxLayerElement.eDIRECT:
            
            for p in range(poly_count):
                tmp = []
                polygon_size = mesh.GetPolygonSize(p)
                for v in range(polygon_size):
                    id = mesh.GetPolygonVertex(p, v)
                    tmp.append(id)
                
                color_index_layer.append(tmp)
                
        elif colors.GetMappingMode() == KFbxLayerElement.eBY_CONTROL_POINT \
            and colors.GetReferenceMode() == KFbxLayerElement.eINDEX_TO_DIRECT:

            for p in range(poly_count):
                tmp = []
                polygon_size = mesh.GetPolygonSize(p)
                for v in range(polygon_size):
                    control_point_index = mesh.GetPolygonVertex(p, v)
                    id = colors.GetIndexArray().GetAt(control_point_index)
                    tmp.append(id)
                    
                color_index_layer.append(tmp)
        
        elif colors.GetMappingMode() == KFbxLayerElement.eBY_POLYGON_VERTEX \
            and colors.GetReferenceMode() == KFbxLayerElement.eDIRECT:
                    
            vertex_id = 0
            for p in range(poly_count):
                tmp = []
                polygon_size = mesh.GetPolygonSize(p)
                for v in range(polygon_size):
                    tmp.append(vertex_id)
                    vertex_id += 1
                    
                color_index_layer.append(tmp)

        elif colors.GetMappingMode() == KFbxLayerElement.eBY_POLYGON_VERTEX \
            and colors.GetReferenceMode() == KFbxLayerElement.eINDEX_TO_DIRECT:

            colors_index_array = colors.GetIndexArray()
            vertex_id = 0
            for p in range(poly_count):
                tmp = []
                polygon_size = mesh.GetPolygonSize(p)
                for v in range(polygon_size):
                    id = colors_index_array.GetAt(vertex_id)
                    tmp.append(id)
                    vertex_id += 1
                    
                color_index_layer.append(tmp)
        
    return color_values, color_index_layer
    
# #####################################################
# Parser - mesh - polygons
# #####################################################
def extract_polygons(mesh):
    poly_count = mesh.GetPolygonCount()
    layer_count = mesh.GetLayerCount()
    control_points = mesh.GetControlPoints() 
        
    layers_groups = []
    layers_uvs = []
    layers_colors = []
    
    indices_uv = []
    indices_color = []
    indices_vertex = []
    indices_material = []
    
    # per layer data
    for l in range(layer_count):
        
        layer = mesh.GetLayer(l)
        
        # groups
        group = extract_layer_groups(layer, poly_count)
        if group:
            groups_layers.append(group)
            
        # uvs
        uv_values, uv_index_layer = extract_layer_uvs(layer, poly_count, mesh)
        
        if uv_values:
            layers_uvs.append(uv_values)
        
        if uv_index_layer:
            indices_uv.append(uv_index_layer)
            
        # colors
        color_values, color_index_layer = extract_layer_colors(layer, poly_count, mesh)
        
        if color_values:
            layers_colors.append(color_values)
        
        if color_index_layer:
            indices_color.append(color_index_layer)
            
        # materials
        material_index_layer = extract_layer_materials(layer, poly_count, mesh)
        if material_index_layer:
            indices_material.append(material_index_layer)        
    
    # single layer data
    for p in range(poly_count):
        face_vertex_index = []
        polygon_size = mesh.GetPolygonSize(p)
        for v in range(polygon_size):
            control_point_index = mesh.GetPolygonVertex(p, v)
            face_vertex_index.append(control_point_index)
            
        indices_vertex.append(face_vertex_index)
        
    
    polygons = {}
    conditional_set(polygons, "indices_vertex", indices_vertex)
    conditional_set(polygons, "indices_uv", indices_uv)
    conditional_set(polygons, "indices_color", indices_color)
    conditional_set(polygons, "indices_material", indices_material)
    conditional_set(polygons, "layers_uvs", layers_uvs)
    conditional_set(polygons, "layers_colors", layers_colors)
    conditional_set(polygons, "layers_groups", layers_groups)
    
    return polygons
    
def extract_control_points(mesh):
    control_points_count = mesh.GetControlPointsCount()
    control_points = mesh.GetControlPoints()
    layer_count = mesh.GetLayerCount()
    
    coordinates = []
    layers_normals = []
    
    for i in range(control_points_count):
        coordinates.append( extract_vec3( control_points[i] ) )

    for layer in range(layer_count):
        normals = mesh.GetLayer(layer).GetNormals()
        if normals:
            znormals = []
            for i in range(control_points_count):
                if normals.GetMappingMode() == KFbxLayerElement.eBY_CONTROL_POINT:
                    if normals.GetReferenceMode() == KFbxLayerElement.eDIRECT:
                        znormals.append( extract_vec3( normals.GetDirectArray().GetAt(i) ) )
            
            if znormals:
                layers_normals.append( znormals )

    
    points = {}
    
    conditional_set(points, "coordinates", coordinates)
    conditional_set(points, "normals", layers_normals)    
    
    return points
    
# #####################################################
# Parser - mesh - materials
# #####################################################
def extract_materials(mesh):
    materials_layers = []
    
    material_count = 0
    layer_count = mesh.GetLayerCount()    
    
    node = None
    if mesh:
        node = mesh.GetNode()
        if node:
            material_count = node.GetMaterialCount()
    
    for layer in range(layer_count):
        layer_materials = []
        
        materials = mesh.GetLayer(layer).GetMaterials()
        if materials:
            if materials.GetReferenceMode() == KFbxLayerElement.eINDEX:
                #Materials are in an undefined external table
                continue

            if material_count > 0:

                for i in range(material_count):
                    material = node.GetMaterial(i)

                    zmaterial = {
                    "name" : material.GetName()
                    }

                    # Get the implementation to see if it's a hardware shader.
                    implementation = GetImplementation(material, "ImplementationHLSL")
                    implemenation_type = "HLSL"
                    if not implementation:
                        implementation = GetImplementation(material, "ImplementationCGFX")
                        implemenation_type = "CGFX"
                    if implementation:
                        # Now we have a hardware shader, let's read it
                        zmaterial["hardware_shader_type"] = implemenation_type.Buffer()
                        # Skipped parsing of shaders
                        
                    elif material.GetClassId().Is(KFbxSurfaceLambert.ClassId):
                        ambient = material.GetAmbientColor()
                        diffuse = material.GetDiffuseColor()
                        emissive = material.GetEmissiveColor()
                        
                        zmaterial["ambient"] = [ambient.Get()[0], ambient.Get()[1], ambient.Get()[2]]
                        zmaterial["diffuse"] = [diffuse.Get()[0], diffuse.Get()[1], diffuse.Get()[2]]
                        zmaterial["emissive"] = [emissive.Get()[0], emissive.Get()[1], emissive.Get()[2]]

                        zmaterial["opacity"] = material.GetTransparencyFactor().Get()

                    elif (material.GetClassId().Is(KFbxSurfacePhong.ClassId)):
                        ambient = material.GetAmbientColor()
                        diffuse = material.GetDiffuseColor()
                        emissive = material.GetEmissiveColor()
                        specular = material.GetSpecularColor()
                        
                        zmaterial["ambient"] = [ambient.Get()[0], ambient.Get()[1], ambient.Get()[2]]
                        zmaterial["diffuse"] = [diffuse.Get()[0], diffuse.Get()[1], diffuse.Get()[2]]
                        zmaterial["emissive"] = [emissive.Get()[0], emissive.Get()[1], emissive.Get()[2]]
                        zmaterial["specular"] = [specular.Get()[0], specular.Get()[1], specular.Get()[2]]
                        
                        zmaterial["opacity"] = material.GetTransparencyFactor().Get()
                        
                        zmaterial["shininess"] = material.GetShininess().Get()
                        zmaterial["reflectivity"] = material.GetReflectionFactor().Get()
                        
                    zmaterial["shading_model"] = material.GetShadingModel().Get().Buffer()
                    layer_materials.append(zmaterial)
                    
        if layer_materials:
            materials_layers.append(layer_materials)
    
    return materials_layers
    
# #####################################################
# Parser - mesh - textures
# #####################################################
def extract_texture_info(texture, blend_mode):
    mapping_types = [ "Null", "Planar", "Spherical", "Cylindrical", "Box", "Face", "UV", "Environment" ]
    alpha_sources = [ "None", "RGB Intensity", "Black" ]
    blend_modes   = [ "Translucent", "Add", "Modulate", "Modulate2" ]   
    material_uses = [ "Model Material", "Default Material" ]
    texture_uses  = [ "Standard", "Shadow Map", "Light Map", "Spherical Reflection Map", "Sphere Reflection Map" ]
    planar_mapping_normals = [ "X", "Y", "Z" ]
    
    info = {
    "name"      : texture.GetName(),
    "filename"  : texture.GetFileName(),
    "scale_u"   : texture.GetScaleU(),
    "scale_v"   : texture.GetScaleV(),
    "swap_uv"   : texture.GetSwapUV(),
    "translation_u" : texture.GetTranslationU(),
    "translation_v" : texture.GetTranslationV(),
    "rotation_u"    : texture.GetRotationU(),
    "rotation_v"    : texture.GetRotationV(),
    "rotation_w"    : texture.GetRotationW(),
    "mapping"       : mapping_types[texture.GetMappingType()],
    "alpha_source"  : alpha_sources[texture.GetAlphaSource()],
    "cropping_left"   : texture.GetCroppingLeft(),
    "cropping_top"    : texture.GetCroppingTop(),
    "cropping_right"  : texture.GetCroppingRight(),
    "cropping_bottom" : texture.GetCroppingBottom(),
    "alpha"         : texture.GetDefaultAlpha(),
    "material_use" : material_uses[texture.GetMaterialUse()],
    "texture_use"  : texture_uses[texture.GetTextureUse()]
    }


    if texture.GetMappingType() == KFbxTexture.ePLANAR:
        info["planar_mapping_normal"] = planar_mapping_normals[texture.GetPlanarMappingNormal()]

    if blend_mode >= 0:
        info["blend_mode"] = blend_modes[blend_mode]
        
    return info
    
def extract_texture_info_by_property(property, material_index):
    textures = []
    
    if property.IsValid():
        
        #Here we have to check if it's layeredtextures, or just textures:
        layered_texture_count = property.GetSrcObjectCount(KFbxLayeredTexture.ClassId)
        if layered_texture_count > 0:
            for j in range(layered_texture_count):
                ltexture = {
                "layered_texture" : j,
                "layers" : []
                }
                
                layered_texture = property.GetSrcObject(KFbxLayeredTexture.ClassId, j)
                texture_count = layered_texture.GetSrcObjectCount(KFbxTexture.ClassId)
                for k in range(texture_count):
                    ztexture = lLayeredTexture.GetSrcObject(KFbxTexture.ClassId, k)
                    if ztexture:
                        # NOTE the blend mode is ALWAYS on the LayeredTexture and NOT the one on the texture.
                        # Why is that?  because one texture can be shared on different layered textures and might
                        # have different blend modes.

                        blend_mode = layered_texture.GetTextureBlendMode(k)
                        texture = {
                        "material_index" : material_index,
                        "texture_index"  : k,
                        "property_name"  : property.GetName().Buffer(),
                        "blend_mode"     : blend_mode,
                        "info"           : extract_texture_info(ztexture, blend_mode)
                        }
                        
                        ltexture["layers"].append(texture)
                
                textures.append(ltexture)
        
        # no layered texture simply get on the property
        else:
            
            texture_count = property.GetSrcObjectCount(KFbxTexture.ClassId)
            for j in range(texture_count):
                ztexture = property.GetSrcObject(KFbxTexture.ClassId, j)
                if ztexture:
                    texture = {
                    "material_index" : material_index,
                    "info"           : extract_texture_info(ztexture, -1)
                    }
                    textures.append(texture)

    return textures
            
def extract_textures(mesh):
    textures = {}
    node = mesh.GetNode()
    materials_count = node.GetSrcObjectCount(KFbxSurfaceMaterial.ClassId)
    for material_index in range(materials_count):
        material = node.GetSrcObject(KFbxSurfaceMaterial.ClassId, material_index)
        
        #go through all the possible textures
        if material:
            for texture_index in range(KFbxLayerElement.LAYERELEMENT_TYPE_TEXTURE_COUNT):
                property = material.FindProperty(KFbxLayerElement.TEXTURE_CHANNEL_NAMES[texture_index])
                texture = extract_texture_info_by_property(property, material_index) 
                if texture:
                    textures[property.GetName().Buffer()] = texture
    
    return textures

def extract_material_mapping(mesh):
    return {}
    
def extract_material_connections(mesh):
    return {}
        
def extract_link(mesh):
    return {}
    
def extract_shape(mesh):
    return {}    
    
def extract_mesh(node):
    mesh = node.GetNodeAttribute()

    zmesh = {}
    
    conditional_set(zmesh, "name", node.GetName())
    conditional_set(zmesh, "shape", extract_shape(mesh))
    conditional_set(zmesh, "link", extract_link(mesh))
    conditional_set(zmesh, "control_points", extract_control_points(mesh))
    conditional_set(zmesh, "faces", extract_polygons(mesh))
    conditional_set(zmesh, "textures", extract_textures(mesh))
    conditional_set(zmesh, "materials", extract_materials(mesh))
    conditional_set(zmesh, "material_mapping", extract_material_mapping(mesh))
    conditional_set(zmesh, "material_connections", extract_material_connections(mesh))
    
    return zmesh

# #####################################################
# Parser - nodes (todo)
# #####################################################
def extract_marker(node):
    return {}
    
def extract_nurb(node):
    return {}
    
def extract_patch(node):
    return {}
    
def extract_skeleton(node):
    return {}
    
def extract_camera(node):
    return {}
    
def extract_light(node):
    return {}

# #####################################################
# Parser - nodes (generic)
# #####################################################
def extract_target(node):
    if node.GetTarget():
        return node.GetTarget().GetName()
    return ""

def extract_transform(node):
    translation = node.GetGeometricTranslation(KFbxNode.eSOURCE_SET)
    rotation = node.GetGeometricRotation(KFbxNode.eSOURCE_SET)
    scale = node.GetGeometricScaling(KFbxNode.eSOURCE_SET)
    
    transform = {
    "translation": [ translation[0], translation[1], translation[2] ],
    "rotation"   : [ rotation[0], rotation[1], rotation[2] ],
    "scale"      : [ scale[0], scale[1], scale[2] ],
    }
    
    return transform
    
def extract_transform_propagation(node):
    rotation_order = node.GetRotationOrder(KFbxNode.eSOURCE_SET)
        
    order_map = {
    eEULER_XYZ  : "Euler XYZ",
    eEULER_XZY  : "Euler XZY",
    eEULER_YZX  : "Euler YZX",
    eEULER_YXZ  : "Euler YXZ",
    eEULER_ZXY  : "Euler ZXY",
    eEULER_ZYX  : "Euler ZYX",
    eSPHERIC_XYZ:"Spheric XYZ"
    }
    
    order = "Euler XYZ"
    
    if rotation_order in order_map:
        order = order_map[rotation_order]
        
    # Use the Rotation space only for the limits
    # (keep using eEULER_XYZ for the rest)
    
    if node.GetUseRotationSpaceForLimitOnly(KFbxNode.eSOURCE_SET):
        only_limits = 1
    else:
        only_limits = 0

    inherit_type = node.GetTransformationInheritType()

    inherit_map = {
    eINHERIT_RrSs   : "RrSs",
    eINHERIT_RSrs   : "RSrs",
    eINHERIT_Rrs    : "Rrs"
    }
    
    if inherit_type in inherit_map:
        inheritance = inherit_map[inherit_type]

    transform_propagation = {
    "rotation_order" : order,
    "only_limits"    : only_limits,
    "inheritance"    : inheritance
    }

    return transform_propagation
    
def extract_pivots(node):
    return {}
    
def extract_user_properties(node):
    return {}
    
def extract_node_content(node):
    nodes = []
    
    if node.GetNodeAttribute() == None:
        return "NULL"
        
    else:
        attribute_type = node.GetNodeAttribute().GetAttributeType()        

        ztype = "undefined"
        data = {}
        
        type_map = {
        KFbxNodeAttribute.eMARKER   : ["marker",    extract_marker],
        KFbxNodeAttribute.eSKELETON : ["skeleton",  extract_skeleton],
        KFbxNodeAttribute.eMESH     : ["mesh",      extract_mesh],
        KFbxNodeAttribute.eNURB     : ["nurb",      extract_nurb],
        KFbxNodeAttribute.ePATCH    : ["patch",     extract_patch],
        KFbxNodeAttribute.eCAMERA   : ["camera",    extract_camera],
        KFbxNodeAttribute.eLIGHT    : ["light",     extract_light]
        }
        
        if attribute_type in type_map:
            ztype = type_map[attribute_type][0]
            data = type_map[attribute_type][1](node)
            
        content = { }
        
        conditional_set(content, "type", ztype)
        conditional_set(content, "data", data)
        conditional_set(content, "target", extract_target(node))
        conditional_set(content, "pivots", extract_pivots(node))
        conditional_set(content, "transform", extract_transform(node))
        conditional_set(content, "transform_propagation", extract_transform_propagation(node))
        conditional_set(content, "user_properties", extract_user_properties(node))

    nodes.append(content)
    
    for i in range(node.GetChildCount()):
        nodes += extract_node_content(node.GetChild(i))
        
    return nodes
        
def extract_nodes(scene):    
    nodes = []
    
    root = scene.GetRootNode()
    if root:
        for i in range(root.GetChildCount()):
            nodes += extract_node_content(root.GetChild(i))
    
    return nodes
    
def filter_mesh(item):
    return item["type"] == "mesh"
    
def extract_meshes(scene):
    nodes = extract_nodes(scene)
    meshes = filter(filter_mesh, nodes)
    return meshes
    
# #####################################################
# JSON extractors
# #####################################################
def get_material_texture(material_index, textures, property):
    result = [t for t in textures.get(property, []) if t["material_index"] == material_index]
    return result
    
def collect_textures(data):
    texture_set = set()
    
    for mesh in data["meshes"]:
        for texture_type in mesh["data"]["textures"]:
            for texture in mesh["data"]["textures"][texture_type]:
                texture_file = base_filename(texture["info"]["filename"])
                texture_set.add(texture_file)

    return list(texture_set)
    
# #####################################################
# Generator - model
# #####################################################
def generate_vertex(v):
    return TEMPLATE_VERTEX % (v[0], v[1], v[2])
    
def generate_triangle(f):
    v = f['vertex']
    return TEMPLATE_TRI % (v[0], v[1], v[2], 
                           f['material'])

def generate_triangle_uv(f):
    v = f['vertex']
    uv = f['uv']
    return TEMPLATE_TRI_UV % (v[0], v[1], v[2], 
                              f['material'], 
                              uv[0], uv[1], uv[2])

def generate_triangle_n(f):
    v = f['vertex']
    n = f['normal']
    return TEMPLATE_TRI_N % (v[0], v[1], v[2], 
                             f['material'], 
                             n[0], n[1], n[2])

def generate_triangle_n_uv(f):
    v = f['vertex']
    n = f['normal']
    uv = f['uv']
    return TEMPLATE_TRI_N_UV % (v[0], v[1], v[2], 
                                f['material'], 
                                n[0], n[1], n[2], 
                                uv[0], uv[1], uv[2])

def generate_quad(f):
    vi = f['vertex']
    return TEMPLATE_QUAD % (vi[0], vi[1], vi[2], vi[3], 
                            f['material'])

def generate_quad_uv(f):
    v = f['vertex']
    uv = f['uv']
    return TEMPLATE_QUAD_UV % (v[0], v[1], v[2], v[3], 
                               f['material'], 
                               uv[0], uv[1], uv[2], uv[3])

def generate_quad_n(f):
    v = f['vertex']
    n = f['normal']
    return TEMPLATE_QUAD_N % (v[0], v[1], v[2], v[3], 
                              f['material'],
                              n[0], n[1], n[2], n[3])

def generate_quad_n_uv(f):
    v = f['vertex']
    n = f['normal']
    uv = f['uv']
    return TEMPLATE_QUAD_N_UV % (v[0], v[1], v[2], v[3], 
                                 f['material'],
                                 n[0], n[1], n[2], n[3],
                                 uv[0], uv[1], uv[2], uv[3])

def generate_normal(n):
    return TEMPLATE_N % (n[0], n[1], n[2])

def generate_uv(uv):
    return TEMPLATE_UV % (uv[0], uv[1])
    
# #####################################################
# Generator - scene
# #####################################################
def generate_vec3(vec):
    return TEMPLATE_VEC3 % (vec[0], vec[1], vec[2])

def generate_vec2(vec):
    return TEMPLATE_VEC2 % (vec[0], vec[1])

def generate_hex(number):
    return TEMPLATE_HEX % number
    
def generate_string(s):
    return TEMPLATE_STRING % s
    
def generate_section(label, content):
    return TEMPLATE_SECTION % (label, content)
    
def get_mesh_filename(mesh):
    object_id = mesh["data"]["name"]
    filename = "%s.js" % sanitize(object_id)
    return filename
    
def generate_material_id_list(materials):
    chunks = []
    for layer in materials:
        for material in layer:
            chunks.append(material["name"])
    
    return ",".join(chunks)
    
def generate_objects(data):
    chunks = []
    
    for mesh in data["meshes"]:
        object_id = mesh["data"]["name"]
        geometry_id = "geo_%s" % object_id
        
        material_id = generate_material_id_list(mesh["data"]["materials"])
        
        position = mesh["transform"]["translation"]
        rotation = mesh["transform"]["rotation"]
        scale = mesh["transform"]["scale"]

        # hunt for local transform
        if object_id in data["generic_info"]:
            gi = data["generic_info"][object_id]
            lt = gi.get("Lcl Translation", {})
            local_translation = lt.get("value", [0,0,0])
            position[0] += local_translation[0]
            position[1] += local_translation[1]
            position[2] += local_translation[2]

        object_string = TEMPLATE_OBJECT % {
        "object_id"   : generate_string(object_id),
        "geometry_id" : generate_string(geometry_id),
        "material_id" : generate_string(material_id),
        "position"    : generate_vec3(position),
        "rotation"    : generate_vec3(rotation),
        "scale"       : generate_vec3(scale)
        }
        chunks.append(object_string)
        
    return ",\n\n".join(chunks)
    
def generate_geometries(data):
    chunks = []
    
    for mesh in data["meshes"]:
        geometry_id = "geo_%s" % mesh["data"]["name"]
        model_filename = get_mesh_filename(mesh)
        
        geometry_string = TEMPLATE_GEOMETRY % {
        "geometry_id" : generate_string(geometry_id),
        "model_file"  : generate_string(model_filename)
        }
        chunks.append(geometry_string)
        
    return ",\n\n".join(chunks)
    
def generate_textures_scene(data):
    chunks = []
    texture_set = set()
    
    for mesh in data["meshes"]:
        for texture_type in mesh["data"]["textures"]:
            for texture in mesh["data"]["textures"][texture_type]:
                texture_id = texture["info"]["name"]
                
                if texture_id not in texture_set:
                    texture_set.add(texture_id)
                    texture_file = base_filename(texture["info"]["filename"])
                
                    texture_string = TEMPLATE_TEXTURE % {
                    "texture_id"   : generate_string(texture_id),
                    "texture_file" : generate_string(texture_file)
                    }
                    chunks.append(texture_string)

    return ",\n\n".join(chunks)

def generate_materials_scene(data):
    chunks = []
    
    type_map = {
    "Lambert"   : "MeshLambertMaterial",
    "Phong"     : "MeshPhongMaterial"
    }
    
    for mesh in data["meshes"]:
        for layer in mesh["data"]["materials"]:
            for material_index in range(len(layer)):
                material = layer[material_index]
                material_id = material["name"]
                shading = material["shading_model"]
                material_type = type_map.get(shading, "MeshBasicMaterial")
                
                parameters = "color: %s" % generate_hex(rgb2int(material["diffuse"]))
                
                if shading == "Phong":
                    parameters += ", ambient: %s" % generate_hex(rgb2int(material["ambient"]))
                    parameters += ", specular: %s" % generate_hex(rgb2int(material["specular"]))
                    parameters += ", shininess: %f" % material["shininess"]

                # TODO: proper handling of textures
                colorMap = get_material_texture(material_index, mesh["data"]["textures"], "DiffuseColor")
                lightMap = get_material_texture(material_index, mesh["data"]["textures"], "AmbientColor")
                bumpMap  = get_material_texture(material_index, mesh["data"]["textures"], "Bump")
                
                if map:
                    parameters += ", map: %s" % generate_string(colorMap[0]["info"]["name"])
                if lightMap:
                    parameters += ", lightMap: %s" % generate_string(lightMap[0]["info"]["name"])
                if bumpMap:
                    parameters += ", bumpMap: %s" % generate_string(bumpMap[0]["info"]["name"])
                
                material_string = TEMPLATE_MATERIAL_SCENE % {
                "material_id" : generate_string(material_id),
                "type"        : generate_string(material_type),
                "parameters"  : parameters
                }
                chunks.append(material_string)
        
    return ",\n\n".join(chunks)

# TODO

def generate_cameras(data):
    cameras = data.get("cameras", [])
    if not cameras:
        cameras.append(DEFAULTS["camera"])
        
    chunks = []
    for camera in cameras:
        if camera["type"] == "perspective":
            camera_string = TEMPLATE_CAMERA_PERSPECTIVE % {
            "camera_id" : generate_string(camera["name"]),
            "fov"       : camera["fov"],
            "aspect"    : camera["aspect"],
            "near"      : camera["near"],
            "far"       : camera["far"],
            "position"  : generate_vec3(camera["position"]),
            "target"    : generate_vec3(camera["target"])
            }
        elif camera["type"] == "ortho":
            camera_string = TEMPLATE_CAMERA_ORTHO % {
            "camera_id" : generate_string(camera["name"]),
            "left"      : camera["left"],
            "right"     : camera["right"],
            "top"       : camera["top"],
            "bottom"    : camera["bottom"],
            "near"      : camera["near"],
            "far"       : camera["far"],
            "position"  : generate_vec3(camera["position"]),
            "target"    : generate_vec3(camera["target"])
            }
            
        chunks.append(camera_string)
        
    return ",\n\n".join(chunks)

def generate_lights(data):
    return ""
    
def generate_ascii_scene(data):
    objects = generate_objects(data)
    geometries = generate_geometries(data)
    textures = generate_textures_scene(data)
    materials = generate_materials_scene(data)    
    cameras = generate_cameras(data)
    lights = generate_lights(data)
    
    sections = [
    ["objects",    objects],
    ["geometries", geometries],
    ["textures",   textures],
    ["materials",  materials],
    ["cameras",    cameras],
    ["lights",     lights]
    ]
    
    chunks = []
    for label, content in sections:
        if content:
            chunks.append(generate_section(label, content))

    sections_string = "\n".join(chunks)
    
    default_camera = "default_camera"
    
    parameters = {
    "fname"     : data["source_file"],   
    "url_base"  : generate_string(data["base_folder"]),
    "sections"  : sections_string,
    "bgcolor"   : generate_vec3(DEFAULTS["bgcolor"]),
    "bgalpha"   : DEFAULTS["bgalpha"],
    "defcamera" : generate_string(default_camera)
    }

    text = TEMPLATE_SCENE_ASCII % parameters
    
    return text    

# #####################################################
# Generator - materials 
# #####################################################    
def generate_color(i):
    """Generate hex color corresponding to integer.
    
    Colors should have well defined ordering.
    First N colors are hardcoded, then colors are random 
    (must seed random number  generator with deterministic value 
    before getting colors).
    """
    
    if i < len(COLORS):
        return "0x%06x" % COLORS[i]
    else:
        return "0x%06x" % int(0xffffff * random.random())
        
def value2string(v):
    if type(v)==str and v[0:2] != "0x":
        return '"%s"' % v
    return str(v)

def generate_material_model(material, index):
    m = {
    'DbgName'    :generate_string(material["name"]),
    'DbgIndex'   :index,
    'DbgColor'   :generate_color(index),
    "shading"       :generate_string(material["shading_model"]),
    "opacity"       : material["opacity"]
    }
    
    if material["shading_model"] in ["Lambert", "Phong"]:
        m["colorAmbient"] = material["ambient"]
        m["colorDiffuse"] = material["diffuse"]
        m["col_emissive"] = material["emissive"]
        
    if material["shading_model"] in ["Phong"]:
        m["colorSpecular"] = material["specular"]
        m["shininess"] = material["shininess"]
        
    if not MATERIALS_IN_SCENE:
        conditional_set(m, "mapDiffuse", material.get("mapDiffuse", 0))
        conditional_set(m, "mapLightmap", material.get("mapLightmap", 0))    
        
    mtl_raw = ",\n".join(['\t"%s" : %s' % (n, value2string(v)) for n,v in sorted(m.items())])
    mtl_string = "\t{\n%s\n\t}" % mtl_raw
    
    return mtl_string
    
# #####################################################
# Generator - models 
# #####################################################    
def generate_ascii_model(data):
    materials = data["materials"]

    vertices = data["control_points"]["coordinates"]
    
    normals = []
    if "normals" in data["control_points"]:
        normals = data["control_points"]["normals"][0]
    
    uvs = []
    uvs2 = []
    if "layers_uvs" in data["faces"]:
        n_uvs = len(data["faces"]["layers_uvs"])
        if n_uvs > 0:
            uvs = data["faces"]["layers_uvs"][0]
        if n_uvs > 1:
            uvs2 = data["faces"]["layers_uvs"][1]
        

    triangles = []
    trianglesUvs = []
    trianglesNormals = []
    trianglesNormalsUvs = []

    quads = []
    quadsUvs = []
    quadsNormals = []
    quadsNormalsUvs = []

    indices_vertex = data["faces"]["indices_vertex"]
    for vi in range(len(indices_vertex)):
        
        vertex_index = indices_vertex[vi]
        
        material_index = 0
        if vi < len(data["faces"]["indices_material"][0]):
            material_index = data["faces"]["indices_material"][0][vi]
            
        face = {
        'vertex'   : vertex_index,
        'material' : material_index
        }
    
        if normals:
            face["normal"] = vertex_index
            
        if uvs and "indices_uv" in data["faces"]:
            indices_uv = data["faces"]["indices_uv"]
            face["uv"] = indices_uv[0][vi]
            if len(indices_uv) > 1:
                face["uv2"] = indices_uv[1][vi]
            
        
        if len(vertex_index) == 3:
            if normals:
                if uvs:
                    where = trianglesNormalsUvs
                else:
                    where = trianglesNormals
            else:
                if uvs:
                    where = trianglesUvs
                else:
                    where = triangles
                    
        elif len(vertex_index) == 4:
            if normals:
                if uvs:
                    where = quadsNormalsUvs
                else:
                    where = quadsNormals
            else:
                if uvs:
                    where = quadsUvs
                else:
                    where = quads
            
        where.append(face)
    
    nvertex = len(vertices)
    nface = len(indices_vertex)
    nmaterial = 0
    
    text = TEMPLATE_MODEL_ASCII % {
    "fname"     : source_file,
    "nvertex"   : nvertex,
    "nface"     : nface,
    "nmaterial" : nmaterial,
    
    "materials" : "".join(generate_material_model(m, i) for i, m in enumerate(materials[0])),
    
    "normals"   : ",".join(generate_normal(n) for n in normals),
    "vertices"  : ",".join(generate_vertex(v) for v in vertices),

    "uvs"       : ",".join(generate_uv(u) for u in uvs),
    "uvs2"      : ",".join(generate_uv(u) for u in uvs2),

    "triangles"     : ",".join(generate_triangle(f) for f in triangles),
    "trianglesUvs"  : ",".join(generate_triangle_uv(f) for f in trianglesUvs),
    "trianglesNormals"   : ",".join(generate_triangle_n(f) for f in trianglesNormals),
    "trianglesNormalsUvs": ",".join(generate_triangle_n_uv(f) for f in trianglesNormalsUvs),
        
    "quads"         : ",".join(generate_quad(f) for f in quads),
    "quadsUvs"      : ",".join(generate_quad_uv(f) for f in quadsUvs),
    "quadsNormals"       : ",".join(generate_quad_n(f) for f in quadsNormals),
    "quadsNormalsUvs"    : ",".join(generate_quad_n_uv(f) for f in quadsNormalsUvs)
    }
    
    return text
    
# #####################################################
# Helpers
# #####################################################
def sanitize(text):
    chunks = []
    for ch in text:
        if ch in (string.ascii_letters + string.digits + "_."):
            chunks.append(ch)
        else:
            chunks.append("_")
            
    return "".join(chunks)
    
def base_filename(path):
    return os.path.basename(path)
    
def rgb2int(rgb):
    color = (int(rgb[0]*255) << 16) + (int(rgb[1]*255) << 8) + int(rgb[2]*255);
    return color
    
def conditional_set(where, label, what):
    """Set dictionary property only if it exists"""
    
    if what:
        where[label] = what

def dump_data(data):
    """Generate pretty printed view of data."""
    
    chunks = []
    
    pp = pprint.PrettyPrinter(indent=2, width=160)
    if type(data) == list:
        for d in data:
            chunks.append(pp.pformat(d))
    elif type(data) == dict:
        chunks.append(pp.pformat(data))
        
    return "\n\n".join(chunks)
    
def ensure_folder_exist(foldername):
    """Create folder (with whole path) if it doesn't exist yet."""
    
    if not os.access(foldername, os.R_OK|os.W_OK|os.X_OK):
        os.makedirs(foldername)

def abort(message):
    print message
    sys.exit(1)
    
def write_file(fname, content):
    out = open(fname, "w")
    out.write(content)
    out.close()
    
def copy_files(textures, src_folder, dst_folder):
    for texture in textures:
        src_file = os.path.join(src_folder, texture)
        if os.path.isfile(src_file):
            shutil.copy(src_file, dst_folder)
        else:
            print "WARNING: couldn't find [%s]" % src_file
    
# #####################################################
# Main
# #####################################################
if __name__ == "__main__":
    
    try:
        from FbxCommon import *
        
    except ImportError:
        
        import platform
        
        msg = ""
        
        if platform.system() == 'Windows' or platform.system() == 'Microsoft':
            msg = '"Python26/Lib/site-packages"'
            
        elif platform.system() == 'Linux':
            msg = '"/usr/local/lib/python2.6/site-packages"'
            
        elif platform.system() == 'Darwin':
            msg = '"/Library/Frameworks/Python.framework/Versions/2.6/lib/python2.6/site-packages"'        
        
        abort('You need to copy the content in compatible subfolder under /lib/python<version> into your python install folder such as %s folder.' % msg)
        
    sdkManager, scene = InitializeSdkObjects()
    
    if len(sys.argv) < 3:
        abort("Usage: convert_fbx_three.py [scene.fbx] [scene_folder]")
    
    source_file = sys.argv[1]
    output_folder = sys.argv[2]
    
    junk, base_folder = os.path.split(os.path.normpath(output_folder))
    
    result = LoadScene(sdkManager, scene, source_file)
        
    if not result:
        abort("An error occurred while loading the scene ...")
    
    random.seed(42) # to get well defined debug color order for materials
    
    ensure_folder_exist(output_folder)
    ensure_folder_exist(output_folder+"/models")
    ensure_folder_exist(output_folder+"/textures")
    
    meshes = extract_meshes(scene)
    generic_info = extract_generic_info(scene)
    
    scene_text = ""
    data = {
    "meshes"      : meshes,
    "generic_info": generic_info,
    "source_file" : source_file,
    "base_folder" : base_folder+"/"
    }
    scene_text += generate_ascii_scene(data)
    
    if DEBUG_FBX_JSON:
        scene_text += "/*" + dump_data(meshes) + "\n\n\n" + dump_data(generic_info) + "*/"
    
    scene_file = os.path.join(output_folder, "scene.js")
    htaccess_file = os.path.join(output_folder, ".htaccess") 
    
    write_file(scene_file, scene_text)
    write_file(htaccess_file, TEMPLATE_HTACCESS)
    
    for mesh in meshes:
        model_text = generate_ascii_model(mesh["data"])
        model_file = os.path.join(output_folder, "models", get_mesh_filename(mesh))
        write_file(model_file, model_text)

    textures_src_folder = os.path.dirname(source_file)
    textures_dst_folder = os.path.join(output_folder, "textures")
    copy_files(collect_textures(data), textures_src_folder, textures_dst_folder)

    # Destroy all objects created by the FBX SDK
    
    sdkManager.Destroy()
