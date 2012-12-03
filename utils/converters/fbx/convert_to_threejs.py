# @author zfedoran / http://github.com/zfedoran

import os
import sys
import math

# #####################################################
# Globals
# #####################################################
option_triangulate = True
option_textures = True
option_prefix = True
option_geometry = False
option_default_camera = False
option_default_light = False

converter = None
global_up_vector = None

# #####################################################
# Templates
# #####################################################
def Vector2String(v, no_brackets = False):
    if no_brackets:
        return '%g, %g' % (v[0], v[1])
    else:
        return '[ %g, %g ]' % (v[0], v[1])

def Vector3String(v, no_brackets = False):
    if no_brackets:
        return '%g, %g, %g' % (v[0], v[1], v[2])
    else:
        return '[ %g, %g, %g ]' % (v[0], v[1], v[2])

def ColorString(c, no_brackets = False):
    if no_brackets:
        return '%g, %g, %g' % (c[0], c[1], c[2])
    else:
        return '[ %g, %g, %g ]' % (c[0], c[1], c[2])

def LabelString(s):
    return '"%s"' % s

def ArrayString(s):
    return '[ %s ]' % s

def PaddingString(n):
    output = ""
    for i in range(n):
        output += "\t"
    return output
        
def BoolString(value):
    if value:
        return "true"
    return "false"

# #####################################################
# Helpers
# #####################################################
def getObjectName(o, force_prefix = False): 
    if not o:
        return ""  
    prefix = ""
    if option_prefix or force_prefix:
        prefix = "Object_%s_" % o.GetUniqueID()
    return prefix + o.GetName()
      
def getGeometryName(g, force_prefix = False):
    prefix = ""
    if option_prefix or force_prefix:
        prefix = "Geometry_%s_" % g.GetUniqueID()
    return prefix + g.GetName()

def getEmbedName(e, force_prefix = False):
    prefix = ""
    if option_prefix or force_prefix:
        prefix = "Embed_%s_" % e.GetUniqueID()
    return prefix + e.GetName()

def getMaterialName(m, force_prefix = False):
    prefix = ""
    if option_prefix or force_prefix:
        prefix = "Material_%s_" % m.GetUniqueID()
    return prefix + m.GetName()

def getTextureName(t, force_prefix = False):
    texture_file = t.GetFileName()
    texture_id = os.path.splitext(os.path.basename(texture_file))[0]
    prefix = ""
    if option_prefix or force_prefix:
        prefix = "Texture_%s_" % t.GetUniqueID()
    return prefix + texture_id

def getFogName(f, force_prefix = False):
    prefix = ""
    if option_prefix or force_prefix:
        prefix = "Fog_%s_" % f.GetUniqueID()
    return prefix + f.GetName()

def getObjectVisible(n):
    return BoolString(True)
    
def getRadians(v):
    return ((v[0]*math.pi)/180, (v[1]*math.pi)/180, (v[2]*math.pi)/180)

def getHex(c):
    color = (int(c[0]*255) << 16) + (int(c[1]*255) << 8) + int(c[2]*255)
    return color

def setBit(value, position, on):
    if on:
        mask = 1 << position
        return (value | mask)
    else:
        mask = ~(1 << position)
        return (value & mask)

def convert_fbx_color(color):
    return [color.mRed, color.mGreen, color.mBlue, color.mAlpha]
    
def convert_fbx_vec2(v):
    return [v[0], v[1]]

def convert_fbx_vec3(v):
    return [v[0], v[1], v[2]]
    
def round_vec2(v):
    return [round(v[0], 6), round(v[1], 6)]

def round_vec3(v):
    return [round(v[0], 6), round(v[1], 6), round(v[2], 6)]

def generate_uvs(uv_layers):
    layers = []
    for uvs in uv_layers:
        layer = ",".join(Vector2String(n, True) for n in uvs)
        layers.append(layer)

    return ",".join("[%s]" % n for n in layers)

def generateMultiLineString(lines, separator, padding):
    cleanLines = []
    for i in range(len(lines)):
        line = lines[i]
        line = PaddingString(padding) + line
        cleanLines.append(line)
    return separator.join(cleanLines)

def get_up_vector(scene):
    global_settings = scene.GetGlobalSettings()
    axis_system = global_settings.GetAxisSystem()
    up_vector = axis_system.GetUpVector()
    tmp = [0,0,0]
    tmp[up_vector[0] - 1] = up_vector[1] * 1
    return FbxVector4(tmp[0], tmp[1], tmp[2], 1)
    
# #####################################################
# Generate - Triangles 
# #####################################################
def triangulate_node_hierarchy(node):
    node_attribute = node.GetNodeAttribute();

    if node_attribute:
        if node_attribute.GetAttributeType() == FbxNodeAttribute.eMesh or \
           node_attribute.GetAttributeType() == FbxNodeAttribute.eNurbs or \
           node_attribute.GetAttributeType() == FbxNodeAttribute.eNurbsSurface or \
           node_attribute.GetAttributeType() == FbxNodeAttribute.ePatch:
            converter.TriangulateInPlace(node);
        
        child_count = node.GetChildCount()
        for i in range(child_count):
            triangulate_node_hierarchy(node.GetChild(i))

def triangulate_scene(scene):
    node = scene.GetRootNode()
    if node:
        for i in range(node.GetChildCount()):
            triangulate_node_hierarchy(node.GetChild(i))

# #####################################################
# Generate - Material String 
# #####################################################
def generate_texture_bindings(material_property, texture_list):
    binding_types = {
    "DiffuseColor": "map", "DiffuseFactor": "diffuseFactor", "EmissiveColor": "emissiveMap", 
    "EmissiveFactor": "emissiveFactor", "AmbientColor": "ambientMap", "AmbientFactor": "ambientFactor", 
    "SpecularColor": "specularMap", "SpecularFactor": "specularFactor", "ShininessExponent": "shininessExponent",
    "NormalMap": "normalMap", "Bump": "bumpMap", "TransparentColor": "transparentMap", 
    "TransparencyFactor": "transparentFactor", "ReflectionColor": "reflectionMap", 
    "ReflectionFactor": "reflectionFactor", "DisplacementColor": "displacementMap", 
    "VectorDisplacementColor": "vectorDisplacementMap"
    }

    if material_property.IsValid():
        #Here we have to check if it's layeredtextures, or just textures:
        layered_texture_count = material_property.GetSrcObjectCount(FbxLayeredTexture.ClassId)
        if layered_texture_count > 0:
            for j in range(layered_texture_count):
                layered_texture = material_property.GetSrcObject(FbxLayeredTexture.ClassId, j)
                texture_count = layered_texture.GetSrcObjectCount(FbxTexture.ClassId)
                for k in range(texture_count):
                    texture = layered_texture.GetSrcObject(FbxTexture.ClassId,k)
                    if texture:
                        texture_id = getTextureName(texture, True) 
                        texture_binding = '		"%s": "%s",' % (binding_types[str(material_property.GetName())], texture_id)
                        texture_list.append(texture_binding)
        else:
            # no layered texture simply get on the property
            texture_count = material_property.GetSrcObjectCount(FbxTexture.ClassId)
            for j in range(texture_count):
                texture = material_property.GetSrcObject(FbxTexture.ClassId,j)
                if texture:
                    texture_id = getTextureName(texture, True) 
                    texture_binding = '		"%s": "%s",' % (binding_types[str(material_property.GetName())], texture_id)
                    texture_list.append(texture_binding)

def generate_material_string(material):
    #Get the implementation to see if it's a hardware shader.
    implementation = GetImplementation(material, "ImplementationHLSL")
    implementation_type = "HLSL"
    if not implementation:
        implementation = GetImplementation(material, "ImplementationCGFX")
        implementation_type = "CGFX"

    output = []

    if implementation:
        # This material is a hardware shader, skip it
        print("Shader materials are not supported")
        return ''
        
    elif material.GetClassId().Is(FbxSurfaceLambert.ClassId):

        ambient   = str(getHex(material.Ambient.Get()))
        diffuse   = str(getHex(material.Diffuse.Get()))
        emissive  = str(getHex(material.Emissive.Get()))
        opacity   = 1.0 - material.TransparencyFactor.Get()
        opacity   = 1.0 if opacity == 0 else opacity
        opacity   = str(opacity)
        transparent = BoolString(False)
        reflectivity = "1"

        output = [

        '\t' + LabelString( getMaterialName( material ) ) + ': {',
        '	"type"    : "MeshLambertMaterial",',
        '	"parameters"  : {',
        '		"color"  : ' 	  + diffuse + ',',
        '		"ambient"  : ' 	+ ambient + ',',
        '		"emissive"  : ' + emissive + ',',
        '		"reflectivity"  : ' + reflectivity + ',',
        '		"transparent" : '   + transparent + ',',
        '		"opacity" : ' 	    + opacity + ',',

        ]

    elif material.GetClassId().Is(FbxSurfacePhong.ClassId):

        ambient   = str(getHex(material.Ambient.Get()))
        diffuse   = str(getHex(material.Diffuse.Get()))
        emissive  = str(getHex(material.Emissive.Get()))
        specular  = str(getHex(material.Specular.Get()))
        opacity   = 1.0 - material.TransparencyFactor.Get()
        opacity   = 1.0 if opacity == 0 else opacity
        opacity   = str(opacity)
        shininess = str(material.Shininess.Get())
        transparent = BoolString(False)
        reflectivity = "1"
        bumpScale = "1"

        output = [

        '\t' + LabelString( getMaterialName( material ) ) + ': {',
        '	"type"    : "MeshPhongMaterial",',
        '	"parameters"  : {',
        '		"color"  : ' 	  + diffuse + ',',
        '		"ambient"  : ' 	+ ambient + ',',
        '		"emissive"  : ' + emissive + ',',
        '		"specular"  : ' + specular + ',',
        '		"shininess" : ' + shininess + ',',
        '		"bumpScale"  : '    + bumpScale + ',',
        '		"reflectivity"  : ' + reflectivity + ',',
        '		"transparent" : '   + transparent + ',',
        '		"opacity" : ' 	+ opacity + ',',

        ]

    else:
      print("Unknown type of Material")
      return ''

    if option_textures:
        texture_list = []
        texture_count = FbxLayerElement.sTypeTextureCount()
        for texture_index in range(texture_count):
            material_property = material.FindProperty(FbxLayerElement.sTextureChannelNames(texture_index))
            generate_texture_bindings(material_property, texture_list)

        output += texture_list

    wireframe = BoolString(False)
    wireframeLinewidth = "1"

    output.append('		"wireframe" : ' + wireframe + ',')
    output.append('		"wireframeLinewidth" : ' + wireframeLinewidth)
    output.append('	}')
    output.append('}')

    return generateMultiLineString( output, '\n\t\t', 0 )

def generate_proxy_material_string(node, material_names):
    
    output = [

    '\t' + LabelString( getMaterialName( node, True ) ) + ': {',
    '	"type"    : "MeshFaceMaterial",',
    '	"parameters"  : {',
    '		"materials"  : ' + ArrayString( ",".join(LabelString(m) for m in material_names) ),
    '	}',
    '}'

    ]

    return generateMultiLineString( output, '\n\t\t', 0 )

# #####################################################
# Parse - Materials 
# #####################################################
def extract_materials_from_node(node, material_list):
    name = node.GetName()
    mesh = node.GetNodeAttribute()

    node = None
    if mesh:
        node = mesh.GetNode()
        if node:
            material_count = node.GetMaterialCount()
    
    material_names = []
    for l in range(mesh.GetLayerCount()):
        materials = mesh.GetLayer(l).GetMaterials()
        if materials:
            if materials.GetReferenceMode() == FbxLayerElement.eIndex:
                #Materials are in an undefined external table
                continue
            for i in range(material_count):
                material = node.GetMaterial(i)
                material_names.append(getMaterialName(material))
                material_string = generate_material_string(material)
                material_list.append(material_string)

    if material_count > 1:
      proxy_material = generate_proxy_material_string(node, material_names)
      material_list.append(proxy_material)


def generate_materials_from_hierarchy(node, material_list):
    if node.GetNodeAttribute() == None:
        pass
    else:
        attribute_type = (node.GetNodeAttribute().GetAttributeType())
        if attribute_type == FbxNodeAttribute.eMesh:
            extract_materials_from_node(node, material_list)
    for i in range(node.GetChildCount()):
        generate_materials_from_hierarchy(node.GetChild(i), material_list)

def generate_material_list(scene):
    material_list = []
    node = scene.GetRootNode()
    if node:
        for i in range(node.GetChildCount()):
            generate_materials_from_hierarchy(node.GetChild(i), material_list)
    return material_list

# #####################################################
# Generate - Texture String 
# #####################################################
def generate_texture_string(texture):

    #TODO: extract more texture properties
    wrap_u = texture.GetWrapModeU()
    wrap_v = texture.GetWrapModeV()
    offset = texture.GetUVTranslation()

    output = [

    '\t' + LabelString( getTextureName( texture, True ) ) + ': {',
    '	"url"    : "' + texture.GetFileName() + '",',
    '	"repeat" : ' + Vector2String( (1,1) ) + ',',
    '	"offset" : ' + Vector2String( texture.GetUVTranslation() ) + ',',
    '	"magFilter" : ' + LabelString( "LinearFilter" ) + ',',
    '	"minFilter" : ' + LabelString( "LinearMipMapLinearFilter" ) + ',',
    '	"anisotropy" : ' + BoolString( True ),
    '}'

    ]

    return generateMultiLineString( output, '\n\t\t', 0 )

# #####################################################
# Parse - Textures 
# #####################################################
def extract_material_textures(material_property, texture_list):
    if material_property.IsValid():
        #Here we have to check if it's layeredtextures, or just textures:
        layered_texture_count = material_property.GetSrcObjectCount(FbxLayeredTexture.ClassId)
        if layered_texture_count > 0:
            for j in range(layered_texture_count):
                layered_texture = material_property.GetSrcObject(FbxLayeredTexture.ClassId, j)
                texture_count = layered_texture.GetSrcObjectCount(FbxTexture.ClassId)
                for k in range(texture_count):
                    texture = layered_texture.GetSrcObject(FbxTexture.ClassId,k)
                    if texture:
                        texture_string = generate_texture_string(texture)
                        texture_list.append(texture_string)
        else:
            # no layered texture simply get on the property
            texture_count = material_property.GetSrcObjectCount(FbxTexture.ClassId)
            for j in range(texture_count):
                texture = material_property.GetSrcObject(FbxTexture.ClassId,j)
                if texture:
                    texture_string = generate_texture_string(texture)
                    texture_list.append(texture_string)

def extract_textures_from_node(node, texture_list):
    name = node.GetName()
    mesh = node.GetNodeAttribute()
    
    #for all materials attached to this mesh
    material_count = mesh.GetNode().GetSrcObjectCount(FbxSurfaceMaterial.ClassId)
    for material_index in range(material_count):
        material = mesh.GetNode().GetSrcObject(FbxSurfaceMaterial.ClassId, material_index)

        #go through all the possible textures types
        if material:            
            texture_count = FbxLayerElement.sTypeTextureCount()
            for texture_index in range(texture_count):
                material_property = material.FindProperty(FbxLayerElement.sTextureChannelNames(texture_index))
                extract_material_textures(material_property, texture_list)

def generate_textures_from_hierarchy(node, texture_list):
    if node.GetNodeAttribute() == None:
        pass
    else:
        attribute_type = (node.GetNodeAttribute().GetAttributeType())
        if attribute_type == FbxNodeAttribute.eMesh:
            extract_textures_from_node(node, texture_list)
    for i in range(node.GetChildCount()):
        generate_textures_from_hierarchy(node.GetChild(i), texture_list)

def generate_texture_list(scene):
    if not option_textures:
        return []

    texture_list = []
    node = scene.GetRootNode()
    if node:
        for i in range(node.GetChildCount()):
            generate_textures_from_hierarchy(node.GetChild(i), texture_list)
    return texture_list

# #####################################################
# Extract - Fbx Mesh data
# #####################################################
def extract_fbx_vertex_positions(mesh):
    control_points_count = mesh.GetControlPointsCount()
    control_points = mesh.GetControlPoints()

    positions = []
    for i in range(control_points_count):
        positions.append(convert_fbx_vec3(control_points[i]))

    return positions

def extract_fbx_vertex_normals(mesh):
#   eNone             The mapping is undetermined.
#   eByControlPoint   There will be one mapping coordinate for each surface control point/vertex.
#   eByPolygonVertex  There will be one mapping coordinate for each vertex, for every polygon of which it is a part. This means that a vertex will have as many mapping coordinates as polygons of which it is a part.
#   eByPolygon        There can be only one mapping coordinate for the whole polygon.
#   eByEdge           There will be one mapping coordinate for each unique edge in the mesh. This is meant to be used with smoothing layer elements.
#   eAllSame          There can be only one mapping coordinate for the whole surface.

    layered_normal_indices = []
    layered_normal_values = []

    poly_count = mesh.GetPolygonCount()
    control_points = mesh.GetControlPoints() 

    for l in range(mesh.GetLayerCount()):
        mesh_normals = mesh.GetLayer(l).GetNormals()
        if not mesh_normals:
            continue
          
        normals_array = mesh_normals.GetDirectArray()
        normals_count = normals_array.GetCount()
  
        if normals_count == 0:
            continue

        normal_indices = []
        normal_values = []

        # values
        for i in range(normals_count):
            normal = convert_fbx_vec3(normals_array.GetAt(i))
            normal_values.append(normal)

        # indices
        vertexId = 0
        for p in range(poly_count):
            poly_size = mesh.GetPolygonSize(p)
            poly_normals = []

            for v in range(poly_size):
                control_point_index = mesh.GetPolygonVertex(p, v)

                if mesh_normals.GetMappingMode() == FbxLayerElement.eByControlPoint:
                    if mesh_normals.GetReferenceMode() == FbxLayerElement.eDirect:
                        poly_normals.append(control_point_index)
                    elif mesh_normals.GetReferenceMode() == FbxLayerElement.eIndexToDirect:
                        index = mesh_normals.GetIndexArray().GetAt(control_point_index)
                        poly_normals.append(index)
                elif mesh_normals.GetMappingMode() == FbxLayerElement.eByPolygonVertex:
                    if mesh_normals.GetReferenceMode() == FbxLayerElement.eDirect:
                        poly_normals.append(vertexId)
                    elif mesh_normals.GetReferenceMode() == FbxLayerElement.eIndexToDirect:
                        index = mesh_normals.GetIndexArray().GetAt(vertexId)
                        poly_normals.append(index)
                elif mesh_normals.GetMappingMode() == FbxLayerElement.eByPolygon or \
                     mesh_normals.GetMappingMode() ==  FbxLayerElement.eAllSame or \
                     mesh_normals.GetMappingMode() ==  FbxLayerElement.eNone:       
                    print("unsupported normal mapping mode for polygon vertex")

                vertexId += 1
            normal_indices.append(poly_normals)

        layered_normal_values.append(normal_values)
        layered_normal_indices.append(normal_indices)

    return layered_normal_values, layered_normal_indices

def extract_fbx_vertex_colors(mesh):
#   eNone             The mapping is undetermined.
#   eByControlPoint   There will be one mapping coordinate for each surface control point/vertex.
#   eByPolygonVertex  There will be one mapping coordinate for each vertex, for every polygon of which it is a part. This means that a vertex will have as many mapping coordinates as polygons of which it is a part.
#   eByPolygon        There can be only one mapping coordinate for the whole polygon.
#   eByEdge           There will be one mapping coordinate for each unique edge in the mesh. This is meant to be used with smoothing layer elements.
#   eAllSame          There can be only one mapping coordinate for the whole surface.

    layered_color_indices = []
    layered_color_values = []

    poly_count = mesh.GetPolygonCount()
    control_points = mesh.GetControlPoints() 

    for l in range(mesh.GetLayerCount()):
        mesh_colors = mesh.GetLayer(l).GetVertexColors()
        if not mesh_colors:
            continue
          
        colors_array = mesh_colors.GetDirectArray()
        colors_count = colors_array.GetCount()
  
        if colors_count == 0:
            continue

        color_indices = []
        color_values = []

        # values
        for i in range(colors_count):
            color = convert_fbx_color(colors_array.GetAt(i))
            color_values.append(color)

        # indices
        vertexId = 0
        for p in range(poly_count):
            poly_size = mesh.GetPolygonSize(p)
            poly_colors = []

            for v in range(poly_size):
                control_point_index = mesh.GetPolygonVertex(p, v)

                if mesh_colors.GetMappingMode() == FbxLayerElement.eByControlPoint:
                    if mesh_colors.GetReferenceMode() == FbxLayerElement.eDirect:
                        poly_colors.append(control_point_index)
                    elif mesh_colors.GetReferenceMode() == FbxLayerElement.eIndexToDirect:
                        index = mesh_colors.GetIndexArray().GetAt(control_point_index)
                        poly_colors.append(index)
                elif mesh_colors.GetMappingMode() == FbxLayerElement.eByPolygonVertex:
                    if mesh_colors.GetReferenceMode() == FbxLayerElement.eDirect:
                        poly_colors.append(vertexId)
                    elif mesh_colors.GetReferenceMode() == FbxLayerElement.eIndexToDirect:
                        index = mesh_colors.GetIndexArray().GetAt(vertexId)
                        poly_colors.append(index)
                elif mesh_colors.GetMappingMode() == FbxLayerElement.eByPolygon or \
                     mesh_colors.GetMappingMode() ==  FbxLayerElement.eAllSame or \
                     mesh_colors.GetMappingMode() ==  FbxLayerElement.eNone:       
                    print("unsupported color mapping mode for polygon vertex")

                vertexId += 1
            color_indices.append(poly_colors)

        layered_color_values.append(color_values)
        layered_color_indices.append(color_indices)

    return layered_color_values, layered_color_indices

def extract_fbx_vertex_uvs(mesh):
#   eNone             The mapping is undetermined.
#   eByControlPoint   There will be one mapping coordinate for each surface control point/vertex.
#   eByPolygonVertex  There will be one mapping coordinate for each vertex, for every polygon of which it is a part. This means that a vertex will have as many mapping coordinates as polygons of which it is a part.
#   eByPolygon        There can be only one mapping coordinate for the whole polygon.
#   eByEdge           There will be one mapping coordinate for each unique edge in the mesh. This is meant to be used with smoothing layer elements.
#   eAllSame          There can be only one mapping coordinate for the whole surface.

    layered_uv_indices = []
    layered_uv_values = []

    poly_count = mesh.GetPolygonCount()
    control_points = mesh.GetControlPoints() 

    for l in range(mesh.GetLayerCount()):
        mesh_uvs = mesh.GetLayer(l).GetUVs()
        if not mesh_uvs:
            continue
          
        uvs_array = mesh_uvs.GetDirectArray()
        uvs_count = uvs_array.GetCount()
  
        if uvs_count == 0:
            continue

        uv_indices = []
        uv_values = []

        # values
        for i in range(uvs_count):
            uv = convert_fbx_vec2(uvs_array.GetAt(i))
            uv_values.append(uv)

        # indices
        vertexId = 0
        for p in range(poly_count):
            poly_size = mesh.GetPolygonSize(p)
            poly_uvs = []

            for v in range(poly_size):
                control_point_index = mesh.GetPolygonVertex(p, v)

                if mesh_uvs.GetMappingMode() == FbxLayerElement.eByControlPoint:
                    if mesh_uvs.GetReferenceMode() == FbxLayerElement.eDirect:
                        poly_uvs.append(control_point_index)
                    elif mesh_uvs.GetReferenceMode() == FbxLayerElement.eIndexToDirect:
                        index = mesh_uvs.GetIndexArray().GetAt(control_point_index)
                        poly_uvs.append(index)
                elif mesh_uvs.GetMappingMode() == FbxLayerElement.eByPolygonVertex:
                    uv_texture_index = mesh.GetTextureUVIndex(p, v)
                    if mesh_uvs.GetReferenceMode() == FbxLayerElement.eDirect or \
                       mesh_uvs.GetReferenceMode() == FbxLayerElement.eIndexToDirect:
                        poly_uvs.append(uv_texture_index)
                elif mesh_uvs.GetMappingMode() == FbxLayerElement.eByPolygon or \
                     mesh_uvs.GetMappingMode() ==  FbxLayerElement.eAllSame or \
                     mesh_uvs.GetMappingMode() ==  FbxLayerElement.eNone:       
                    print("unsupported uv mapping mode for polygon vertex")

                vertexId += 1
            uv_indices.append(poly_uvs)

        layered_uv_values.append(uv_values)
        layered_uv_indices.append(uv_indices)

    return layered_uv_values, layered_uv_indices

# #####################################################
# Generate - Mesh String 
# #####################################################
def generate_mesh_bounding_box(mesh):
    control_points_count = mesh.GetControlPointsCount()
    control_points = mesh.GetControlPoints()

    minx = 0
    miny = 0
    minz = 0
    maxx = 0
    maxy = 0
    maxz = 0

    for i in range(control_points_count):
        vertex = control_points[i]

        if vertex[0] < minx:
            minx = vertex[0]
        if vertex[1] < miny:
            miny = vertex[1]
        if vertex[2] < minz:
            minz = vertex[2]

        if vertex[0] > maxx:
            maxx = vertex[0]
        if vertex[1] > maxy:
            maxy = vertex[1]
        if vertex[2] > maxz:
            maxz = vertex[2]

    return [minx, miny, minz], [maxx, maxy, maxz]

def generate_mesh_face(mesh, vertex_indices, polygon_index, normals, colors, uv_layers, material_count, material_is_same):
  
    isTriangle = ( len(vertex_indices) == 3 )
    nVertices = 3 if isTriangle else 4

    hasMaterial = material_count > 0
    hasFaceUvs = False
    hasFaceVertexUvs = len(uv_layers) > 0
    hasFaceNormals = False # don't export any face normals (as they are computed in engine)
    hasFaceVertexNormals = len(normals) > 0
    hasFaceColors = False 
    hasFaceVertexColors = len(colors) > 0

    faceType = 0
    faceType = setBit(faceType, 0, not isTriangle)
    faceType = setBit(faceType, 1, hasMaterial)
    faceType = setBit(faceType, 2, hasFaceUvs)
    faceType = setBit(faceType, 3, hasFaceVertexUvs)
    faceType = setBit(faceType, 4, hasFaceNormals)
    faceType = setBit(faceType, 5, hasFaceVertexNormals)
    faceType = setBit(faceType, 6, hasFaceColors)
    faceType = setBit(faceType, 7, hasFaceVertexColors)

    faceData = []

    # order is important, must match order in JSONLoader

    # face type
    # vertex indices
    # material index
    # face uvs index
    # face vertex uvs indices
    # face color index
    # face vertex colors indices

    faceData.append(faceType)

    # must clamp in case on polygons bigger than quads

    for i in range(nVertices):
        index = vertex_indices[i]
        faceData.append(index)

    if hasMaterial:
        material_id = 0
        if not material_is_same:
            for l in range(mesh.GetLayerCount()):
                materials = mesh.GetLayer(l).GetMaterials()
                if materials:
                    material_id = materials.GetIndexArray().GetAt(polygon_index)
                    break
        faceData.append( material_id )

    if hasFaceVertexUvs:
        for layer_index, uvs in enumerate(uv_layers):
            polygon_uvs = uvs[polygon_index]
            for i in range(nVertices):
                index = polygon_uvs[i]
                faceData.append(index)

    if hasFaceVertexNormals:
        polygon_normals = normals[polygon_index]
        for i in range(nVertices):
            index = polygon_normals[i]
            faceData.append(index)

    if hasFaceVertexColors:
        polygon_colors = colors[polygon_index]
        for i in range(nVertices):
            index = polygon_colors[i]
            faceData.append(index)

    return ",".join( map(str, faceData) ) 

def generate_mesh_faces(mesh, normals, colors, uv_layers):
    has_same_material_for_all_polygons = True
    for l in range(mesh.GetLayerCount()):
        materials = mesh.GetLayer(l).GetMaterials()
        if materials:
            if materials.GetMappingMode() == FbxLayerElement.eByPolygon:
                has_same_material_for_all_polygons = False
                break

    node = mesh.GetNode()
    if node:
        material_count = node.GetMaterialCount()

    poly_count = mesh.GetPolygonCount()
    control_points = mesh.GetControlPoints() 

    faces = []
    for p in range(poly_count):
        poly_size = mesh.GetPolygonSize(p)
        vertex_indices = []
        for v in range(poly_size):
            control_point_index = mesh.GetPolygonVertex(p, v)
            vertex_indices.append(control_point_index)
        face = generate_mesh_face(mesh, vertex_indices, p, normals, colors, uv_layers, material_count, has_same_material_for_all_polygons)
        faces.append(face)
    return faces

def generate_mesh_string(node):
    mesh = node.GetNodeAttribute()
    vertices = extract_fbx_vertex_positions(mesh)
    aabb_min, aabb_max = generate_mesh_bounding_box(mesh)

    normal_values, normal_indices = extract_fbx_vertex_normals(mesh)
    color_values, color_indices = extract_fbx_vertex_colors(mesh)
    uv_values, uv_indices = extract_fbx_vertex_uvs(mesh)

    # Three.js only supports one layer of normals
    if len(normal_values) > 0:
        normal_values = normal_values[0]
        normal_indices = normal_indices[0]

    # Three.js only supports one layer of colors
    if len(color_values) > 0:
        color_values = color_values[0]
        color_indices = color_indices[0]

    faces = generate_mesh_faces(mesh, normal_indices, color_indices, uv_indices)

    nuvs = []
    for layer_index, uvs in enumerate(uv_values):
        nuvs.append(str(len(uvs)))

    nvertices = len(vertices)
    nnormals = len(normal_values)
    ncolors = len(color_values)
    nfaces = len(faces)
    nuvs = ",".join(nuvs)

    vertices = ",".join(Vector3String(v, True) for v in vertices)
    normals  = ",".join(Vector3String(v, True) for v in normal_values)
    colors   = ",".join(Vector3String(v, True) for v in color_values)
    faces    = ",".join(faces)
    uvs      = generate_uvs(uv_values)
    aabb_min = ",".join(str(f) for f in aabb_min)
    aabb_max = ",".join(str(f) for f in aabb_max)

    if option_geometry:
        output = [

        '"boundingBox"  : {',
        '	"min" : ' + ArrayString(aabb_min) + ',',   
        '	"max" : ' + ArrayString(aabb_max),   
        '},',
        '"scale" : ' + str( 1 ) + ',',   
        '"materials" : ' + ArrayString("") + ',',   
        '"vertices" : ' + ArrayString(vertices) + ',',   
        '"normals" : ' + ArrayString(normals) + ',',   
        '"colors" : ' + ArrayString(colors) + ',',   
        '"uvs" : ' + ArrayString(uvs) + ',',   
        '"faces" : ' + ArrayString(faces),

        ]

        return generateMultiLineString( output, '\n\t', 0 )

    else:
        output = [

        '\t' + LabelString( getEmbedName( node, True ) ) + ' : {',
        '	"metadata"  : {',
        '		"vertices" : ' + str(nvertices) + ',',
        '		"normals" : ' + str(nnormals) + ',',
        '		"colors" : ' + str(ncolors) + ',',
        '		"faces" : ' + str(nfaces) + ',',
        '		"uvs" : ' + ArrayString(nuvs),
        '	},',
        '	"boundingBox"  : {',
        '		"min" : ' + ArrayString(aabb_min) + ',',   
        '		"max" : ' + ArrayString(aabb_max),   
        '	},',
        '	"scale" : ' + str( 1 ) + ',',   
        '	"materials" : ' + ArrayString("") + ',',   
        '	"vertices" : ' + ArrayString(vertices) + ',',   
        '	"normals" : ' + ArrayString(normals) + ',',   
        '	"colors" : ' + ArrayString(colors) + ',',   
        '	"uvs" : ' + ArrayString(uvs) + ',',   
        '	"faces" : ' + ArrayString(faces),
        '}'

        ]
        
        return generateMultiLineString( output, '\n\t\t', 0 )

def generate_mesh_string2(node):
    mesh = node.GetNodeAttribute()
    aabb_min, aabb_max = generate_mesh_bounding_box(mesh)
    
    mesh_list = [mesh]
    vertices, normals, colors, uvs, faces = process_mesh_geometry(mesh_list)

    nuvs = []
    for uv_layer in uvs:
        nuvs.append(str(len(uv_layer)))

    nvertices = len(vertices)
    nnormals = len(normal_values)
    ncolors = len(color_values)
    nfaces = len(faces)
    nuvs = ",".join(nuvs)
    
    output = [

    '\t' + LabelString( getEmbedName( node, True ) ) + ' : {',
    '	"metadata"  : {',
    '		"vertices" : ' + str(nvertices) + ',',
    '		"normals" : ' + str(nnormals) + ',',
    '		"colors" : ' + str(ncolors) + ',',
    '		"faces" : ' + str(nfaces) + ',',
    '		"uvs" : ' + ArrayString(nuvs),
    '	},',
    '	"boundingBox"  : {',
    '		"min" : ' + ArrayString(aabb_min) + ',',   
    '		"max" : ' + ArrayString(aabb_max),   
    '	},',
    '	"scale" : ' + str( 1 ) + ',',   
    '	"materials" : ' + ArrayString("") + ',',   
    '	"vertices" : ' + ArrayString(vertices) + ',',   
    '	"normals" : ' + ArrayString(normals) + ',',   
    '	"colors" : ' + ArrayString(colors) + ',',   
    '	"uvs" : ' + ArrayString(uvs) + ',',   
    '	"faces" : ' + ArrayString(faces),
    '}'

    ]
    
    return generateMultiLineString( output, '\n\t\t', 0 )

# #####################################################
# Process - Mesh Geometry
# #####################################################
def append_non_duplicate_normals(source_normals, dest_normals, count):
    for normal in source_normals:
        key = round_vec3(normal) 
        if key not in dest_normals:
            dest_normals[key] = count
            count += 1

    return count

def append_non_duplicate_colors(source_colors, dest_colors, count):
    for color in source_colors:
        key = getHex(color) 
        if key not in dest_colors:
            dest_colors[key] = count
            count += 1

    return count
                
def append_non_duplicate_uvs(source_uvs, dest_uvs, counts):
    source_layer_count = len(source_uvs)

    for layer_index in range(source_layer_count):

        dest_layer_count = len(dest_uvs)

        if dest_layer_count <= layer_index:
            dest_uv_layer = {}
            count = 0
            dest_uvs.append(uvs)
            counts.append(count)
        else:
            dest_uv_layer = dest_uvs[layer_index]
            count = nuvs[layer_index]

        source_uv_layer = source_uvs[layer_index]

        for uv in source_uv_layer:
            key = round_vec2(uv) 
            if key not in dest_uv_layer:
                dest_uv_layer[key] = count
                count += 1

        counts[layer_index] = count

    return counts

def process_mesh_normals(mesh_list):
    normals_dictionary = {}
    nnormals = 0

    for mesh in mesh_list:
        normal_values, normal_indices = extract_fbx_vertex_normals(mesh)

        # Three.js only supports one layer of normals
        if len(normal_values) > 0:
            normal_values = normal_values[0]
            normal_indices = normal_indices[0]

        # Remove the Fbx indices, we will make our own
        mesh_normals = []
        for i in range(len(normal_indices)):
            mesh_normals.append(normal_values[normal_indices[i])

        if len(mesh_normals) > 0
            nnormals = append_non_duplicate_normals(mesh_normals, normals_dictionary, nnormals)

    return normals_dictionary

def process_mesh_colors(mesh_list):
    colors_dictionary = {}
    ncolors = 0

    for mesh in mesh_list:
        color_values, color_indices = extract_fbx_vertex_colors(mesh)

        # Three.js only supports one layer of colors
        if len(color_values) > 0:
            color_values = color_values[0]
            color_indices = color_indices[0]

        # Remove the Fbx indices, we will make our own
        mesh_colors = []
        for i in range(len(color_indices)):
            mesh_colors.append(color_values[color_indices[i])

        if len(mesh_colors) > 0
            ncolors = append_non_duplicate_colors(mesh_colors, colors_dictionary, ncolors)

    return colors_dictionary

def process_mesh_uv_layers(mesh_list):
    uvs_dictionary_layers = []
    nuvs_list = []

    for mesh in mesh_list:
        uv_values, uv_indices = extract_fbx_vertex_uvs(mesh)

        # Remove the Fbx indices, we will make our own
        mesh_uvs = []
        for l in range(len(uv_indices)):
            layer_uv_values = uv_values[l]
            layer_uv_indices = uv_indices[l]
            mesh_layer_uvs = []
            for i in range(len(layer_uv_indices)):
                mesh_layer_uvs.append(layer_uv_values[layer_uv_indices[i])
            mesh_uvs.append(mesh_layer_uvs)

        if len(mesh_uvs) > 0
            nuvs_list = append_non_duplicate_uvs(mesh_uvs, uvs_dictionary_layers, nuvs_list)

    return uvs_dictionary_layers
    
def process_mesh_vertices(mesh_list):
    vertices = []
    for mesh in mesh_list:
        node = mesh.GetNode()
        mesh_vertices = extract_fbx_vertex_positions(mesh)

        if option_geometry:
            # FbxMeshes are local to their node, we need the vertices in global space
            # when scene nodes are not exported
            transform = node.EvaluateGlobalTransform()
            transform = FbxMatrix(transform)

            for i in range(len(mesh_vertices)):
                v = mesh_vertices[i]
                position = FbxVector4(v[0], v[1], v[2])
                position = transform.MultNormalize(position)
                mesh_vertices[i] = convert_fbx_vec3(position)
                
        vertices.extend(mesh_vertices[:])

    return vertices

def process_mesh_polygons(mesh_list, normals_dictionary, colors_dictionary, uv_layers_dictionary):


    vertex_offset = 0
    for mesh in mesh_list:
        poly_count = mesh.GetPolygonCount()
        control_points = mesh.GetControlPoints() 

        faces = []
        for p in range(poly_count):
            poly_size = mesh.GetPolygonSize(p)
            vertex_indices = []
            for v in range(poly_size):
                control_point_index = mesh.GetPolygonVertex(p, v)
                vertex_indices.append(control_point_index)
            face = generate_mesh_face(mesh, vertex_indices, p, normals, colors, uv_layers, material_count, has_same_material_for_all_polygons)
            faces.append(face)

        vertex_offset += len(mesh_vertices)

    return faces

# #####################################################
# Generate - Mesh List 
# #####################################################
def generate_mesh_list_from_hierarchy(node, mesh_list):
    if node.GetNodeAttribute() == None:
        pass
    else:
        attribute_type = (node.GetNodeAttribute().GetAttributeType())
        if attribute_type == FbxNodeAttribute.eMesh or \
           attribute_type == FbxNodeAttribute.eNurbs or \
           attribute_type == FbxNodeAttribute.eNurbsSurface or \
           attribute_type == FbxNodeAttribute.ePatch:

            if attribute_type != FbxNodeAttribute.eMesh:
                converter.TriangulateInPlace(node);

            mesh_list.append(node)

    for i in range(node.GetChildCount()):
        generate_embed_list_from_hierarchy(node.GetChild(i), mesh_list)

def generate_mesh_list(scene):
    mesh_list = []
    node = scene.GetRootNode()
    if node:
        for i in range(node.GetChildCount()):
            generate_mesh_list_from_hierarchy(node.GetChild(i), mesh_list)
    return embed_list

# #####################################################
# Generate - Embeds 
# #####################################################
def generate_embed_list_from_hierarchy(node, embed_list):
    if node.GetNodeAttribute() == None:
        pass
    else:
        attribute_type = (node.GetNodeAttribute().GetAttributeType())
        if attribute_type == FbxNodeAttribute.eMesh or \
           attribute_type == FbxNodeAttribute.eNurbs or \
           attribute_type == FbxNodeAttribute.eNurbsSurface or \
           attribute_type == FbxNodeAttribute.ePatch:

            if attribute_type != FbxNodeAttribute.eMesh:
                converter.TriangulateInPlace(node);

            embed_string = generate_mesh_string(node)
            embed_list.append(embed_string)

    for i in range(node.GetChildCount()):
        generate_embed_list_from_hierarchy(node.GetChild(i), embed_list)

def generate_embed_list(scene):
    embed_list = []
    node = scene.GetRootNode()
    if node:
        for i in range(node.GetChildCount()):
            generate_embed_list_from_hierarchy(node.GetChild(i), embed_list)
    return embed_list

# #####################################################
# Generate - Geometries 
# #####################################################
def generate_geometry_string(node):

    output = [
    '\t' + LabelString( getGeometryName( node, True ) ) + ' : {',
    '	"type"  : "embedded",',
    '	"id" : ' + LabelString( getEmbedName( node, True ) ),
    '}'
    ]

    return generateMultiLineString( output, '\n\t\t', 0 )

def generate_geometry_list_from_hierarchy(node, geometry_list):
    if node.GetNodeAttribute() == None:
        pass
    else:
        attribute_type = (node.GetNodeAttribute().GetAttributeType())
        if attribute_type == FbxNodeAttribute.eMesh:
            geometry_string = generate_geometry_string(node)
            geometry_list.append(geometry_string)
    for i in range(node.GetChildCount()):
        generate_geometry_list_from_hierarchy(node.GetChild(i), geometry_list)

def generate_geometry_list(scene):
    geometry_list = []
    node = scene.GetRootNode()
    if node:
        for i in range(node.GetChildCount()):
            generate_geometry_list_from_hierarchy(node.GetChild(i), geometry_list)
    return geometry_list

# #####################################################
# Generate - Camera Names
# #####################################################
def generate_camera_name_list_from_hierarchy(node, camera_list):
    if node.GetNodeAttribute() == None:
        pass
    else:
        attribute_type = (node.GetNodeAttribute().GetAttributeType())
        if attribute_type == FbxNodeAttribute.eCamera:
            camera_string = getObjectName(node) 
            camera_list.append(camera_string)
    for i in range(node.GetChildCount()):
        generate_camera_name_list_from_hierarchy(node.GetChild(i), camera_list)

def generate_camera_name_list(scene):
    camera_list = []
    node = scene.GetRootNode()
    if node:
        for i in range(node.GetChildCount()):
            generate_camera_name_list_from_hierarchy(node.GetChild(i), camera_list)
    return camera_list

# #####################################################
# Generate - Light Object 
# #####################################################
def generate_default_light_string(padding):
    direction = (1,1,1)
    color = (1,1,1)
    intensity = 80.0

    output = [

    '\t\t' + LabelString( 'default_light' ) + ' : {',
    '	"type"      : "DirectionalLight",',
    '	"color"     : ' + str(getHex(color)) + ',',
    '	"intensity" : ' + str(intensity/100.0) + ',',
    '	"direction" : ' + Vector3String( direction ) + ',',
    '	"target"    : ' + LabelString( getObjectName( None ) ),
    ' }'

    ]

    return generateMultiLineString( output, '\n\t\t', padding )

def generate_light_string(node, padding):
    light = node.GetNodeAttribute()
    light_types = ["point", "directional", "spot", "area", "volume"]
    light_type = light_types[light.LightType.Get()]

    transform = node.EvaluateLocalTransform()
    position = transform.GetT()

    output = []

    if light_type == "directional":

        # Three.js directional lights emit light from a point in 3d space to a target node or the origin.
        # When there is no target, we need to take a point, one unit away from the origin, and move it 
        # into the right location so that the origin acts like the target
        
        if node.GetTarget():
            direction = position
        else:
            translation = FbxVector4(0,0,0,0)
            scale = FbxVector4(1,1,1,1)
            rotation = transform.GetR()
            matrix = FbxMatrix(translation, rotation, scale)
            direction = matrix.MultNormalize(global_up_vector) 

        output = [

        '\t\t' + LabelString( getObjectName( node ) ) + ' : {',
        '	"type"      : "DirectionalLight",',
        '	"color"     : ' + str(getHex(light.Color.Get())) + ',',
        '	"intensity" : ' + str(light.Intensity.Get()/100.0) + ',',
        '	"direction" : ' + Vector3String( direction ) + ',',
        '	"target"    : ' + LabelString( getObjectName( node.GetTarget() ) ) + ( ',' if node.GetChildCount() > 0 else '' )
        ]

    elif light_type == "point":

        output = [

        '\t\t' + LabelString( getObjectName( node ) ) + ' : {',
        '	"type"      : "PointLight",',
        '	"color"     : ' + str(getHex(light.Color.Get())) + ',',
        '	"intensity" : ' + str(light.Intensity.Get()/100.0) + ',',
        '	"position"  : ' + Vector3String( position ) + ',',
        '	"distance"  : ' + str(light.FarAttenuationEnd.Get()) + ( ',' if node.GetChildCount() > 0 else '' )

        ]

    elif light_type == "spot":

        output = [

        '\t\t' + LabelString( getObjectName( node ) ) + ' : {',
        '	"type"      : "SpotLight",',
        '	"color"     : ' + str(getHex(light.Color.Get())) + ',',
        '	"intensity" : ' + str(light.Intensity.Get()/100.0) + ',',
        '	"position"  : ' + Vector3String( position ) + ',',
        '	"distance"  : ' + str(light.FarAttenuationEnd.Get()) + ',',
        '	"angle"     : ' + str((light.OuterAngle.Get()*math.pi)/180) + ',',
        '	"exponent"  : ' + str(light.DecayType.Get()) + ',',
        '	"target"    : ' + LabelString( getObjectName( node.GetTarget() ) ) + ( ',' if node.GetChildCount() > 0 else '' )

        ]

    return generateMultiLineString( output, '\n\t\t', padding )

def generate_ambient_light_string(scene):

    scene_settings = scene.GetGlobalSettings()
    ambient_color = scene_settings.GetAmbientColor()
    ambient_color = (ambient_color.mRed, ambient_color.mGreen, ambient_color.mBlue)

    if ambient_color[0] == 0 and ambient_color[1] == 0 and ambient_color[2] == 0:
        return None

    class AmbientLight:
        def GetName(self):
            return "AmbientLight"

    node = AmbientLight()

    output = [

    '\t\t' + LabelString( getObjectName( node ) ) + ' : {',
    '	"type"  : "AmbientLight",',
    '	"color" : ' + str(getHex(ambient_color)),
    '}'

    ]

    return generateMultiLineString( output, '\n\t\t', 0 )
    
# #####################################################
# Generate - Camera Object 
# #####################################################
def generate_default_camera_string(padding):
    position = (100, 100, 100)
    near = 0.1
    far = 1000
    fov = 75

    output = [

    '\t\t' + LabelString( 'default_camera' ) + ' : {',
    '	"type"     : "PerspectiveCamera",',
    '	"fov"      : ' + str(fov) + ',',
    '	"near"     : ' + str(near) + ',',
    '	"far"      : ' + str(far) + ',',
    '	"position" : ' + Vector3String( position ), 
    ' }'

    ]

    return generateMultiLineString( output, '\n\t\t', padding )

def generate_camera_string(node, padding):
    camera = node.GetNodeAttribute()

    target_node = node.GetTarget()
    target = ""
    if target_node:
        transform = target.EvaluateLocalTransform()
        target = transform.GetT()
    else:
        target = camera.InterestPosition.Get()

    position = camera.Position.Get()
  
    projection_types = [ "perspective", "orthogonal" ]
    projection = projection_types[camera.ProjectionType.Get()]

    near = camera.NearPlane.Get()
    far = camera.FarPlane.Get()

    output = []

    if projection == "perspective":

        aspect = camera.PixelAspectRatio.Get()
        fov = camera.FieldOfView.Get()

        output = [

        '\t\t' + LabelString( getObjectName( node ) ) + ' : {',
        '	"type"     : "PerspectiveCamera",',
        '	"fov"      : ' + str(fov) + ',',
        '	"aspect"   : ' + str(aspect) + ',',
        '	"near"     : ' + str(near) + ',',
        '	"far"      : ' + str(far) + ',',
        '	"position" : ' + Vector3String( position ) + ( ',' if node.GetChildCount() > 0 else '' )

        ]

    elif projection == "orthogonal":

        left = ""
        right = ""
        top = ""
        bottom = ""

        output = [

        '\t\t' + LabelString( getObjectName( node ) ) + ' : {',
        '	"type"     : "OrthographicCamera",',
        '	"left"     : ' + left + ',',
        '	"right"    : ' + right + ',',
        '	"top"      : ' + top + ',',
        '	"bottom"   : ' + bottom + ',',
        '	"near"     : ' + str(near) + ',',
        '	"far"      : ' + str(far) + ',',
        '	"position" : ' + Vector3String( position ) + ( ',' if node.GetChildCount() > 0 else '' )

        ]

    return generateMultiLineString( output, '\n\t\t', padding )

# #####################################################
# Generate - Mesh Object 
# #####################################################
def generate_mesh_object_string(node, padding):
    mesh = node.GetNodeAttribute()
    transform = node.EvaluateLocalTransform()
    position = transform.GetT()
    scale = transform.GetS()
    rotation = getRadians(transform.GetR())

    material_count = node.GetMaterialCount()
    material_name = ""

    if material_count > 0:
        material_names = []
        for l in range(mesh.GetLayerCount()):
            materials = mesh.GetLayer(l).GetMaterials()
            if materials:
                if materials.GetReferenceMode() == FbxLayerElement.eIndex:
                    #Materials are in an undefined external table
                    continue
                for i in range(material_count):
                    material = node.GetMaterial(i)
                    material_names.append( getMaterialName(material) )
        #If this mesh has more than one material, use a proxy material
        material_name = getMaterialName( node, True) if material_count > 1 else material_names[0] 

    output = [

    '\t\t' + LabelString( getObjectName( node ) ) + ' : {',
    '	"geometry" : ' + LabelString( getGeometryName( node, True ) ) + ',',
    '	"material" : ' + LabelString( material_name ) + ',',
    '	"position" : ' + Vector3String( position ) + ',',
    '	"rotation" : ' + Vector3String( rotation ) + ',',
    '	"scale"	   : ' + Vector3String( scale ) + ',',
    '	"visible"  : ' + getObjectVisible( node ) + ( ',' if node.GetChildCount() > 0 else '' )

    ]

    return generateMultiLineString( output, '\n\t\t', padding )

# #####################################################
# Generate - Object 
# #####################################################
def generate_object_string(node, padding):
    node_types = ["Unknown", "Null", "Marker", "Skeleton", "Mesh", "Nurbs", "Patch", "Camera", 
    "CameraStereo", "CameraSwitcher", "Light", "OpticalReference", "OpticalMarker", "NurbsCurve", 
    "TrimNurbsSurface", "Boundary", "NurbsSurface", "Shape", "LODGroup", "SubDiv", "CachedEffect", "Line"]

    transform = node.EvaluateLocalTransform()
    position = transform.GetT()
    scale = transform.GetS()
    rotation = getRadians(transform.GetR())

    node_type = ""
    if node.GetNodeAttribute() == None:
        node_type = "Null"
    else:
        node_type = node_types[node.GetNodeAttribute().GetAttributeType()]

    output = [

    '\t\t' + LabelString( getObjectName( node ) ) + ' : {',
    '	"fbx_type" : ' + LabelString( node_type ) + ',',
    '	"position" : ' + Vector3String( position ) + ',',
    '	"rotation" : ' + Vector3String( rotation ) + ',',
    '	"scale"	   : ' + Vector3String( scale ) + ',',
    '	"visible"  : ' + getObjectVisible( node ) + ( ',' if node.GetChildCount() > 0 else '' )

    ]

    return generateMultiLineString( output, '\n\t\t', padding )

# #####################################################
# Parse - Objects 
# #####################################################
def generate_object_hierarchy(node, object_list, pad, siblings_left):
    object_count = 0
    if node.GetNodeAttribute() == None:
        object_string = generate_object_string(node, pad)
        object_list.append(object_string)
        object_count += 1
    else:
        attribute_type = (node.GetNodeAttribute().GetAttributeType())
        if attribute_type == FbxNodeAttribute.eMesh:
            object_string = generate_mesh_object_string(node, pad)
            object_list.append(object_string)
            object_count += 1
        elif attribute_type == FbxNodeAttribute.eLight:
            object_string = generate_light_string(node, pad)
            object_list.append(object_string)
            object_count += 1
        elif attribute_type == FbxNodeAttribute.eCamera:
            object_string = generate_camera_string(node, pad)
            object_list.append(object_string)
            object_count += 1
        else:
            object_string = generate_object_string(node, pad)
            object_list.append(object_string)
            object_count += 1

    if node.GetChildCount() > 0:
      object_list.append( PaddingString( pad + 1 ) + '\t\t"children" : {\n' )

      for i in range(node.GetChildCount()):
          object_count += generate_object_hierarchy(node.GetChild(i), object_list, pad + 2, node.GetChildCount() - i - 1)

      object_list.append( PaddingString( pad + 1 ) + '\t\t}' )
    object_list.append( PaddingString( pad ) + '\t\t}' + (',\n' if siblings_left > 0 else ''))

    return object_count

def generate_scene_objects_string(scene):
    object_count = 0
    object_list = []

    ambient_light = generate_ambient_light_string(scene)
    if ambient_light:
        if scene.GetNodeCount() > 0 or option_default_light or option_default_camera:
            ambient_light += (',\n')
        object_list.append(ambient_light)
        object_count += 1

    if option_default_light:
        default_light = generate_default_light_string(0)
        if scene.GetNodeCount() > 0 or option_default_camera:
            default_light += (',\n')
        object_list.append(default_light)
        object_count += 1

    if option_default_camera:
        default_camera = generate_default_camera_string(0)
        if scene.GetNodeCount() > 0:
            default_camera += (',\n')
        object_list.append(default_camera)
        object_count += 1

    node = scene.GetRootNode()
    if node:
        for i in range(node.GetChildCount()):
            object_count += generate_object_hierarchy(node.GetChild(i), object_list, 0, node.GetChildCount() - i - 1)

    return "\n".join(object_list), object_count

# #####################################################
# Parse - Geometry 
# #####################################################
def extract_geometry(scene, filename):

    embeds_list = generate_embed_list(scene)

    #TODO: update the Three.js Geometry Format to support multiple geometries?
    embeds = [ embeds_list[0] ] if len(embeds_list) > 0 else []
    embeds = generateMultiLineString( embeds_list, ",\n\n\t", 0 )

    output = [

    '{',
    '	"metadata": {',
    '		"formatVersion" : 3.2,',
    '		"type"		: "geometry",',
    '		"generatedBy"	: "convert-to-threejs.py"',
    '	},',
    '',
    '\t' + 	embeds,
    '}'

    ]

    return "\n".join(output)

# #####################################################
# Parse - Scene 
# #####################################################
def extract_scene(scene, filename):
    global_settings = scene.GetGlobalSettings()
    objects, nobjects = generate_scene_objects_string(scene)

    textures = generate_texture_list(scene)
    materials = generate_material_list(scene)
    geometries = generate_geometry_list(scene)
    embeds = generate_embed_list(scene)
    fogs = []

    ntextures = len(textures)
    nmaterials = len(materials)
    ngeometries = len(geometries)

    #TODO: extract actual root/scene data here
    position = Vector3String( (0,0,0) )
    rotation = Vector3String( (0,0,0) )
    scale    = Vector3String( (1,1,1) )

    camera_names = generate_camera_name_list(scene)
    scene_settings = scene.GetGlobalSettings()

    #TODO: this might exist as part of the FBX spec
    bgcolor = Vector3String( (0.667,0.667,0.667) )
    bgalpha = 1

    # This does not seem to be any help here
    # global_settings.GetDefaultCamera() 

    defcamera = LabelString(camera_names[0] if len(camera_names) > 0 else "")
    if option_default_camera:
      defcamera = LabelString('default_camera')

    #TODO: extract fog info from scene
    deffog = LabelString("")

    geometries = generateMultiLineString( geometries, ",\n\n\t", 0 )
    materials = generateMultiLineString( materials, ",\n\n\t", 0 )
    textures = generateMultiLineString( textures, ",\n\n\t", 0 )
    embeds = generateMultiLineString( embeds, ",\n\n\t", 0 )
    fogs = generateMultiLineString( fogs, ",\n\n\t", 0 )

    output = [

    '{',
    '	"metadata": {',
    '		"formatVersion" : 3.2,',
    '		"type"		: "scene",',
    '		"generatedBy"	: "convert-to-threejs.py",',
    '		"objects"       : ' + str(nobjects) + ',',
    '		"geometries"    : ' + str(ngeometries) + ',',
    '		"materials"     : ' + str(nmaterials) + ',',
    '		"textures"      : ' + str(ntextures),
    '	},',

    '',
    '	"urlBaseType": "relativeToScene",',
    '',

    '	"objects" :',
    '	{',
    objects,
    '	},',
    '',

    '	"geometries" :',
    '	{',
    '\t' + 	geometries,
    '	},',
    '',

    '	"materials" :',
    '	{',
    '\t' + 	materials,
    '	},',
    '',

    '	"textures" :',
    '	{',
    '\t' + 	textures,
    '	},',
    '',

    '	"embeds" :',
    '	{',
    '\t' + 	embeds,
    '	},',
    '',

    '	"fogs" :',
    '	{',
    '\t' + 	fogs,
    '	},',
    '',

    '	"transform" :',
    '	{',
    '		"position"  : ' + position + ',',
    '		"rotation"  : ' + rotation + ',',
    '		"scale"     : ' + scale,
    '	},',
    '',

    '	"defaults" :',
    '	{',
    '		"bgcolor" : ' + str(bgcolor) + ',',
    '		"bgalpha" : ' + str(bgalpha) + ',',
    '		"camera"  : ' + defcamera + ',',
    '		"fog"  	  : ' + deffog,
    '	}',
    '}'

    ]

    return "\n".join(output)

# #####################################################
# file helpers
# #####################################################
def write_file(fname, content):
    out = open(fname, "w")
    out.write(content)
    out.close()

# #####################################################
# main
# #####################################################
if __name__ == "__main__":
    from optparse import OptionParser

    try:
        from FbxCommon import *
    except ImportError:
        import platform
        msg = 'Could not locate the python FBX SDK!\n'
        msg += 'You need to copy the FBX SDK into your python install folder such as '
        if platform.system() == 'Windows' or platform.system() == 'Microsoft':
            msg += '"Python26/Lib/site-packages"'
        elif platform.system() == 'Linux':
            msg += '"/usr/local/lib/python2.6/site-packages"'
        elif platform.system() == 'Darwin':
            msg += '"/Library/Frameworks/Python.framework/Versions/2.6/lib/python2.6/site-packages"'        
        msg += ' folder.'
        print(msg) 
        sys.exit(1)
    
    usage = "Usage: %prog [source_file.fbx] [output_file.js] [options]"
    parser = OptionParser(usage=usage)

    parser.add_option('-t', '--triangulate', action='store_true', dest='triangulate', help="force quad geometry into triangles", default=False)
    parser.add_option('-x', '--no-textures', action='store_true', dest='notextures', help="don't include texture references in output file", default=False)
    parser.add_option('-p', '--prefix', action='store_true', dest='prefix', help="prefix object names in output file", default=False)
    parser.add_option('-g', '--geometry-only', action='store_true', dest='geometry', help="output geometry only", default=False)
    parser.add_option('-c', '--default-camera', action='store_true', dest='defcamera', help="include default camera in output scene", default=False)
    parser.add_option('-l', '--defualt-light', action='store_true', dest='deflight', help="include default light in output scene", default=False)

    (options, args) = parser.parse_args()

    option_triangulate = options.triangulate 
    option_textures = True if not options.notextures else False
    option_prefix = options.prefix
    option_geometry = options.geometry 
    option_default_camera = options.defcamera 
    option_default_light = options.deflight 

    # Prepare the FBX SDK.
    sdk_manager, scene = InitializeSdkObjects()
    converter = FbxGeometryConverter(sdk_manager)
    global_up_vector = get_up_vector(scene)

    # The converter takes an FBX file as an argument.
    if len(args) > 1:
        print("\nLoading file: %s" % args[0])
        result = LoadScene(sdk_manager, scene, args[0])
    else:
        result = False
        print("\nUsage: convert_fbx_to_threejs [source_file.fbx] [output_file.js]\n")

    if not result:
        print("\nAn error occurred while loading the file...")
    else:
        if option_triangulate:
            print("\nForcing geometry to triangles")
            triangulate_scene(scene)

        if option_geometry:
            output_content = extract_geometry(scene, os.path.basename(args[0]))
        else:
            output_content = extract_scene(scene, os.path.basename(args[0]))

        output_path = os.path.join(os.getcwd(), args[1])
        write_file(output_path, output_content)

        print("\nExported Three.js file to:\n%s\n" % output_path)

    # Destroy all objects created by the FBX SDK.
    sdk_manager.Destroy()
    sys.exit(0)
