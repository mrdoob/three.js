#! /usr/bin/env python
# @author zfedoran / http://github.com/zfedoran

import os
import sys
import math
import operator
import re
import json
import shutil
import subprocess
import uuid

# #####################################################
# Globals
# #####################################################
option_triangulate = True
option_textures = True
option_copy_textures = True
option_ignore_texture_collision = False
option_texture_output_dir = 'maps'
option_transparency_detection = True
option_prefix = True
option_geometry = False
option_forced_y_up = False
option_default_camera = False
option_default_light = False
option_pretty_print = False
option_optimise_geometry = False

texture_conversion_enabled = True

metadata_key = 'metadata'
children_key = 'children'
data_key = 'data'
type_key = 'type'
uuid_key = 'uuid'
name_key = 'name'

converter = None
output_directory = ''

copied_texture_dict = {}

WEB_FORMATS = ['PNG', 'JPEG', 'GIF']

FBX_TEXTURE_BINDINGS = {
  'DiffuseColor': 'map',
  'EmissiveColor': 'emissiveMap',
  'SpecularColor': 'specularMap',
  'NormalMap': 'normalMap',
  'Bump': 'bumpMap',
  'TransparencyFactor': 'alphaMap',
  'ReflectionColor': 'envMap',
  'AmbientFactor': 'aoMap'
}

THREE_REPEAT_WRAPPING = 1000
THREE_CLAMP_TO_EDGE_WRAPPING = 1001

THREE_LINEAR_FILTER = 1006
THREE_LINEAR_MIP_MAP_LINEAR_FILTER = 1008

# #####################################################
# Pretty Printing Hacks
# #####################################################

# Force an array to be printed fully on a single line
class NoIndent(object):
    def __init__(self, value, separator = ','):
        self.separator = separator
        self.value = value
    def encode(self):
        if not self.value:
            return None
        return '[ %s ]' % self.separator.join(str(f) for f in self.value)
    def __eq__(self, other):
        return (isinstance(other, self.__class__) and self.__dict__ == other.__dict__)
    def __ne__(self, other):
        return not self.__eq__(other)

# Force an array into chunks rather than printing each element on a new line
class ChunkedIndent(object):
    def __init__(self, value, chunk_size = 15, force_rounding = False):
        self.value = value
        self.size = chunk_size
        self.force_rounding = force_rounding
    def encode(self):
        # Turn the flat array into an array of arrays where each subarray is of
        # length chunk_size. Then string concat the values in the chunked
        # arrays, delimited with a ', ' and round the values finally append
        # '{CHUNK}' so that we can find the strings with regex later
        if not self.value:
            return None
        if self.force_rounding:
            return ['{CHUNK}%s' % ', '.join(str(round(f, 6)) for f in self.value[i:i+self.size]) for i in range(0, len(self.value), self.size)]
        else:
            return ['{CHUNK}%s' % ', '.join(str(f) for f in self.value[i:i+self.size]) for i in range(0, len(self.value), self.size)]
    def __eq__(self, other):
        return (isinstance(other, self.__class__) and self.__dict__ == other.__dict__)
    def __ne__(self, other):
        return not self.__eq__(other)

# This custom encoder looks for instances of NoIndent or ChunkedIndent.
class CustomEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, NoIndent) or isinstance(obj, ChunkedIndent):
            return obj.encode()
        else:
            return json.JSONEncoder.default(self, obj)

def execute_regex_hacks(output_string):
    # turn strings of arrays into arrays (remove the double quotes)
    output_string = re.sub(':\s*\"(\[.*\])\"', r': \1', output_string)
    output_string = re.sub('(\n\s*)\"(\[.*\])\"', r'\1\2', output_string)
    output_string = re.sub('(\n\s*)\"{CHUNK}(.*)\"', r'\1\2', output_string)

    # replace alphabetically sorted keys with regular keys
    output_string = re.sub(metadata_key, r'metadata', output_string)
    output_string = re.sub(children_key, r'children', output_string)
    output_string = re.sub(data_key, r'data', output_string)
    output_string = re.sub(type_key, r'type', output_string)
    output_string = re.sub(uuid_key, r'uuid', output_string)
    output_string = re.sub(name_key, r'name', output_string)

    # add an extra newline after '"children": {'
    output_string = re.sub('(children.*{\s*\n)', r'\1\n', output_string)
    # add an extra newline after '},'
    output_string = re.sub('},\s*\n', r'},\n\n', output_string)
    # add an extra newline after '\n\s*],'
    output_string = re.sub('(\n\s*)],\s*\n', r'\1],\n\n', output_string)

    return output_string

# #####################################################
# Object Serializers
# #####################################################

# FbxVector2 is not JSON serializable
def serialize_vector2(v, round_vector = False):
    # JSON does not support NaN or Inf
    if math.isnan(v[0]) or math.isinf(v[0]):
        v[0] = 0
    if math.isnan(v[1]) or math.isinf(v[1]):
        v[1] = 0
    if round_vector or option_pretty_print:
        v = (round(v[0], 5), round(v[1], 5))
    if option_pretty_print:
        return NoIndent([v[0], v[1]], ', ')
    else:
        return [v[0], v[1]]

# FbxVector3 is not JSON serializable
def serialize_vector3(v, round_vector = False):
    # JSON does not support NaN or Inf
    if math.isnan(v[0]) or math.isinf(v[0]):
        v[0] = 0
    if math.isnan(v[1]) or math.isinf(v[1]):
        v[1] = 0
    if math.isnan(v[2]) or math.isinf(v[2]):
        v[2] = 0
    if round_vector or option_pretty_print:
        v = (round(v[0], 5), round(v[1], 5), round(v[2], 5))
    if option_pretty_print:
        return NoIndent([v[0], v[1], v[2]], ', ')
    else:
        return [v[0], v[1], v[2]]

# FbxVector4 is not JSON serializable
def serialize_vector4(v, round_vector = False):
    # JSON does not support NaN or Inf
    if math.isnan(v[0]) or math.isinf(v[0]):
        v[0] = 0
    if math.isnan(v[1]) or math.isinf(v[1]):
        v[1] = 0
    if math.isnan(v[2]) or math.isinf(v[2]):
        v[2] = 0
    if math.isnan(v[3]) or math.isinf(v[3]):
        v[3] = 0
    if round_vector or option_pretty_print:
        v = (round(v[0], 5), round(v[1], 5), round(v[2], 5), round(v[3], 5))
    if option_pretty_print:
        return NoIndent([v[0], v[1], v[2], v[3]], ', ')
    else:
        return [v[0], v[1], v[2], v[3]]

# #####################################################
# Helpers
# #####################################################
def pack_color(c):
    color = (int(c[0]*255) << 16) + (int(c[1]*255) << 8) + int(c[2]*255)
    return int(color)

def set_bit(value, position, on):
    if on:
        mask = 1 << position
        return (value | mask)
    else:
        mask = ~(1 << position)
        return (value & mask)

def generate_uvs(uv_layers):
    layers = []
    for uvs in uv_layers:
        tmp = []
        for uv in uvs:
            tmp.append(uv[0])
            tmp.append(uv[1])
        if option_pretty_print:
            layer = ChunkedIndent(tmp)
        else:
            layer = tmp
        layers.append(layer)
    return layers

# #####################################################
# Object Name Helpers
# #####################################################
def has_unique_name(o, class_id):
    scene = o.GetScene()
    object_name = o.GetName()
    object_id = o.GetUniqueID()

    object_count = scene.GetSrcObjectCount(class_id)

    for i in range(object_count):
        other = scene.GetSrcObject(class_id, i)
        other_id = other.GetUniqueID()
        other_name = other.GetName()

        if other_id == object_id:
            continue
        if other_name == object_name:
            return False

    return True

def get_object_name(o, force_prefix = False):
    if not o:
        return ""

    if option_prefix or force_prefix or not has_unique_name(o, FbxNode.ClassId):
        return "Object_%s_" % o.GetUniqueID() + o.GetName()
    else:
        return o.GetName()

def get_multi_material_name(o):
    if option_prefix or not has_unique_name(o, FbxSurfaceMaterial.ClassId):
        return "Material_%s_" % o.GetUniqueID() + o.GetName()
    else:
        return o.GetName()

def get_material_name(o):
    return "Material_%s_" % o.GetUniqueID() + o.GetName()

def get_texture_name(t):
    if type(t) is FbxFileTexture:
        texture_file = t.GetFileName()
        texture_name = os.path.splitext(os.path.basename(texture_file))[0]
    else:
        texture_name = t.GetName()
        if texture_name == "_empty_":
            texture_name = ""

    if len(texture_name) == 0:
        return "Texture_%s" % t.GetUniqueID()
    else:
        return "Texture_%s_" % t.GetUniqueID() + texture_name

def get_geometry_name(o):
    return 'Geometry_%s_' % o.GetUniqueID() + o.GetName()

# #####################################################
# Triangulation
# #####################################################
def triangulate_node_hierarchy(node):
    node_attribute = node.GetNodeAttribute()

    if node_attribute:
        if node_attribute.GetAttributeType() == FbxNodeAttribute.eMesh or \
                        node_attribute.GetAttributeType() == FbxNodeAttribute.eNurbs or \
                        node_attribute.GetAttributeType() == FbxNodeAttribute.eNurbsSurface or \
                        node_attribute.GetAttributeType() == FbxNodeAttribute.ePatch:
            converter.TriangulateInPlace(node)

        child_count = node.GetChildCount()
        for i in range(child_count):
            triangulate_node_hierarchy(node.GetChild(i))

def triangulate_scene(scene):
    node = scene.GetRootNode()
    if node:
        for i in range(node.GetChildCount()):
            triangulate_node_hierarchy(node.GetChild(i))

# #####################################################
# Generate Material Object
# #####################################################
def detect_texture_transparency(texture_path):
    args = ('identify', '-verbose', texture_path)
    popen = subprocess.Popen(args, stdout=subprocess.PIPE)
    output = popen.communicate()[0]
    match = re.search('Alpha:\s*\n\s*min: [0-9]+ \([0-9.]+\)\s*\n\s*max: [0-9]+ \([0-9.]+\)\s*\n\s*mean: ([0-9.]+)', output)

    try:
        variable_alpha = float(match.group(1)) > 0.0
    except:
        variable_alpha = False

    return variable_alpha or ('Alpha:' in output and 'Alpha: none' not in output)

def bind_texture(material_object, texture_dict, fbx_texture_type, texture):
    if fbx_texture_type in FBX_TEXTURE_BINDINGS:
        binding_type = FBX_TEXTURE_BINDINGS[fbx_texture_type]
        texture_uuid = texture_dict[get_texture_name(texture)]
        material_object[binding_type] = texture_uuid
        if option_transparency_detection and binding_type == 'map':
            material_object['transparent'] = detect_texture_transparency(texture.GetFileName())
    else:
        sys.stderr.write("Warning: %s is not a supported texture type - %s was not bound.\n" % (fbx_texture_type, texture.GetFileName()))

def generate_texture_bindings(material_property, material_object, texture_dict):
    if material_property.IsValid():
        #Here we have to check if it's layeredtextures, or just textures:
        layered_texture_count = material_property.GetSrcObjectCount(FbxLayeredTexture.ClassId)
        if layered_texture_count > 0:
            for j in range(layered_texture_count):
                layered_texture = material_property.GetSrcObject(FbxLayeredTexture.ClassId, j)
                texture_count = layered_texture.GetSrcObjectCount(FbxTexture.ClassId)
                for k in range(texture_count):
                    texture = layered_texture.GetSrcObject(FbxTexture.ClassId,k)
                    if texture and type(texture) is FbxFileTexture:
                        bind_texture(material_object, texture_dict, str(material_property.GetName()), texture)
        else:
            # no layered texture simply get on the property
            texture_count = material_property.GetSrcObjectCount(FbxTexture.ClassId)
            for j in range(texture_count):
                texture = material_property.GetSrcObject(FbxTexture.ClassId,j)
                if texture and type(texture) is FbxFileTexture:
                    bind_texture(material_object, texture_dict, str(material_property.GetName()), texture)

def generate_material_object(material, texture_dict, material_list, material_dict):

    material_type = None
    material_object = None

    if GetImplementation(material, "ImplementationHLSL") or GetImplementation(material, "ImplementationCGFX"):

        sys.stderr.write("Shader materials are not supported\n")

    elif material.GetClassId().Is(FbxSurfaceLambert.ClassId):

        diffuse = pack_color(material.Diffuse.Get())
        emissive = pack_color(material.Emissive.Get())
        opacity = 1.0 if material.TransparencyFactor.Get() == 1.0 else 1.0 - material.TransparencyFactor.Get()
        transparent = opacity < 0.9995
        reflectivity = 1

        material_type = 'MeshLambertMaterial'
        material_object = {
          'color': diffuse,
          'emissive': emissive,
          'reflectivity': reflectivity,
          'transparent': transparent,
          'opacity': opacity
        }

    elif material.GetClassId().Is(FbxSurfacePhong.ClassId):

        diffuse = pack_color(material.Diffuse.Get())
        emissive = pack_color(material.Emissive.Get())
        specular = pack_color(material.Specular.Get())
        opacity = 1.0 if material.TransparencyFactor.Get() == 1.0 else 1.0 - material.TransparencyFactor.Get()
        transparent = opacity < 0.9995
        shininess = material.Shininess.Get()
        reflectivity = 1
        bump_scale = 1

        material_type = 'MeshPhongMaterial'
        material_object = {
          'color': diffuse,
          'emissive': emissive,
          'specular': specular,
          'shininess': shininess,
          'bumpScale': bump_scale,
          'reflectivity': reflectivity,
          'transparent': transparent,
          'opacity': opacity
        }

    else:
        sys.stderr.write("Unknown type of material: {0}\n".format(get_material_name(material)))

    # default to MeshBasicMaterial if the current material type cannot be handeled
    if material_type == None or material_object == None:
        diffuse = pack_color((0.5,0.5,0.5))
        emissive = pack_color((0,0,0))
        opacity = 1
        transparent = False
        reflectivity = 1

        material_type = 'MeshBasicMaterial'
        material_object = {
          'color': diffuse,
          'emissive': emissive,
          'reflectivity': reflectivity,
          'transparent': transparent,
          'opacity': opacity
        }

    if option_textures:
        texture_count = FbxLayerElement.sTypeTextureCount()
        for texture_index in range(texture_count):
            material_property = material.FindProperty(FbxLayerElement.sTextureChannelNames(texture_index))
            generate_texture_bindings(material_property, material_object, texture_dict)

    material_object['wireframe'] = False
    material_object['wireframeLinewidth'] = 1

    if 'map' in material_object: # If we have a diffuse map, we don't want diffuse color
        del material_object['color']

    material_uuid = str(uuid.uuid4())
    material_name = get_material_name(material)

    material_object[type_key] = material_type
    material_object[uuid_key] = material_uuid
    material_object[name_key] = material_name

    material_list.append(material_object)
    material_dict[material_name] = material_uuid

def generate_multi_material_object(node, submaterial_uuids, material_list, material_dict):

    material_type = 'MultiMaterial'
    material_uuid = str(uuid.uuid4())
    material_name = get_multi_material_name(node)

    material_list.append({
      type_key: material_type,
      uuid_key: material_uuid,
      name_key: material_name,
      'referencedMaterials': submaterial_uuids
    })
    material_dict[material_name] = material_uuid

# #####################################################
# Find Scene Materials
# #####################################################
def extract_multi_materials_from_node(node, material_list, material_dict):
    material_count = 0

    mesh = node.GetNodeAttribute()
    node = None

    if mesh:
        node = mesh.GetNode()
        if node:
            material_count = node.GetMaterialCount()

    material_uuids = []
    for l in range(mesh.GetLayerCount()):
        materials = mesh.GetLayer(l).GetMaterials()
        if materials:
            if materials.GetReferenceMode() == FbxLayerElement.eIndex:
                #Materials are in an undefined external table
                continue
            for i in range(material_count):
                material = node.GetMaterial(i)
                material_uuids.append(material_dict[get_material_name(material)])

    if material_count > 1:
        generate_multi_material_object(node, material_uuids, material_list, material_dict)

def generate_multi_materials_from_hierarchy(node, material_list, material_dict):
    if node.GetNodeAttribute() == None:
        pass
    else:
        attribute_type = (node.GetNodeAttribute().GetAttributeType())
        if attribute_type == FbxNodeAttribute.eMesh:
            extract_multi_materials_from_node(node, material_list, material_dict)
    for i in range(node.GetChildCount()):
        generate_multi_materials_from_hierarchy(node.GetChild(i), material_list, material_dict)

def generate_material_list(scene, texture_dict):
    material_list = []
    material_dict = {}

    # generate all materials for this scene
    material_count = scene.GetSrcObjectCount(FbxSurfaceMaterial.ClassId)
    for i in range(material_count):
        material = scene.GetSrcObject(FbxSurfaceMaterial.ClassId, i)
        generate_material_object(material, texture_dict, material_list, material_dict)

    # Three.js does not support meshs with multiple materials, however it does
    # support materials with multiple submaterials
    node = scene.GetRootNode()
    if node:
        for i in range(node.GetChildCount()):
            generate_multi_materials_from_hierarchy(node.GetChild(i), material_list, material_dict)

    return material_list, material_dict

# #####################################################
# Generate Texture Object
# #####################################################
def copy_texture(source_path):
    if os.path.exists(source_path):
        filename = os.path.basename(source_path)

        if option_copy_textures:
            relative_path = os.path.join(option_texture_output_dir, filename)
        else:
            relative_path = filename

        convert = False

        if texture_conversion_enabled:
            args = ('identify', '-format', '%m', source_path)
            popen = subprocess.Popen(args, stdout=subprocess.PIPE)
            image_format = popen.communicate()[0].strip()
            convert = image_format not in WEB_FORMATS
            if convert:
                extension = '.png' if detect_texture_transparency(source_path) else '.jpg'
                relative_path = os.path.splitext(relative_path)[0] + extension

        if relative_path in copied_texture_dict:
            previous_source = copied_texture_dict[relative_path]

            if previous_source != source_path:
                if option_ignore_texture_collision:
                    sys.stderr.write("Warning: Ignored texture collision at {0}. {1} will be used instead of {2}\n".format(relative_path, previous_source, source_path))
                else:
                    sys.exit("Error: Texture names not unique. Both {0} and {1} end up as {2}".format(previous_source, source_path, relative_path))
        else:
            destination_path = os.path.join(output_directory, relative_path)
            destination_directory = os.path.dirname(destination_path)

            if not os.path.exists(destination_directory):
                try:
                    os.makedirs(destination_directory)
                except IOError as e:
                    sys.exit("I/O error({0}) {1}: creating directory {2}".format(e.errno, e.strerror, destination_directory))

            if convert:
                try:
                    args = ('convert', source_path, destination_path)
                    popen = subprocess.Popen(args)
                    popen.communicate()
                except (OSError) as e:
                    sys.exit(-1)
            else:
                try:
                    shutil.copyfile(source_path, destination_path)
                except IOError as e:
                    sys.exit("I/O error({0}) {1}: copying {2} to {3}".format(e.errno, e.strerror, source_path, destination_path))

            copied_texture_dict[relative_path] = source_path

        return relative_path
    else:
        sys.exit("ERROR: Couldn't locate referenced texture " + source_path)

def generate_texture_data(texture, image_dict, texture_list, texture_dict):
    texture_name = get_texture_name(texture)

    if not texture_name in texture_dict:
        if type(texture) is FbxFileTexture:
            texture_path = texture.GetFileName()
        else:
            texture_path = texture.getName()

        if option_copy_textures:
            relative_path = copy_texture(texture_path)
        else:
            relative_path = os.path.basename(texture_path)

        if relative_path in image_dict:
            image_uuid = image_dict[relative_path]
        else:
            image_uuid = str(uuid.uuid4())
            image_dict[relative_path] = image_uuid

        wrap_mode_s = THREE_REPEAT_WRAPPING if texture.GetWrapModeU() == FbxTexture.eRepeat else THREE_CLAMP_TO_EDGE_WRAPPING
        wrap_mode_t = THREE_REPEAT_WRAPPING if texture.GetWrapModeV() == FbxTexture.eRepeat else THREE_CLAMP_TO_EDGE_WRAPPING
        repeat_s = 1.0 if wrap_mode_s == THREE_CLAMP_TO_EDGE_WRAPPING else texture.GetScaleU()
        repeat_t = 1.0 if wrap_mode_t == THREE_CLAMP_TO_EDGE_WRAPPING else texture.GetScaleV()

        texture_uuid = str(uuid.uuid4())

        texture_list.append({
          uuid_key: texture_uuid,
          name_key: texture_name,
          'image': image_uuid,
          'wrap': [wrap_mode_s, wrap_mode_t],
          'repeat': serialize_vector2((repeat_s, repeat_t)),
          'offset': serialize_vector2(texture.GetUVTranslation()),
          'magFilter': THREE_LINEAR_FILTER,
          'minFilter': THREE_LINEAR_MIP_MAP_LINEAR_FILTER,
          'anisotropy': True
        })
        texture_dict[texture_name] = texture_uuid

# #####################################################
# Find Scene Textures
# #####################################################
def extract_material_textures(material_property, texture_list, texture_dict, image_dict):
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
                        generate_texture_data(texture, image_dict, texture_list, texture_dict)
        else:
            # no layered texture simply get on the property
            texture_count = material_property.GetSrcObjectCount(FbxTexture.ClassId)
            for j in range(texture_count):
                texture = material_property.GetSrcObject(FbxTexture.ClassId,j)
                if texture:
                    generate_texture_data(texture, image_dict, texture_list, texture_dict)

def extract_textures_from_node(node, texture_list, texture_dict, image_dict):
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
                extract_material_textures(material_property, texture_list, texture_dict, image_dict)

def generate_textures_from_hierarchy(node, texture_list, texture_dict, image_dict):
    if node.GetNodeAttribute() == None:
        pass
    else:
        attribute_type = (node.GetNodeAttribute().GetAttributeType())
        if attribute_type == FbxNodeAttribute.eMesh:
            extract_textures_from_node(node, texture_list, texture_dict, image_dict)
    for i in range(node.GetChildCount()):
        generate_textures_from_hierarchy(node.GetChild(i), texture_list, texture_dict, image_dict)

def generate_texture_and_image_lists(scene):
    if not option_textures:
        return {}

    texture_list = []
    texture_dict = {}
    image_dict = {}
    node = scene.GetRootNode()
    if node:
        for i in range(node.GetChildCount()):
            generate_textures_from_hierarchy(node.GetChild(i), texture_list, texture_dict, image_dict)

    image_list = []
    for url, image_uuid in image_dict.iteritems():
        image_list.append({uuid_key: image_uuid, 'url': url})

    return texture_list, image_list, texture_dict

# #####################################################
# Extract Fbx SDK Mesh Data
# #####################################################
def extract_fbx_vertex_positions(mesh):
    control_points_count = mesh.GetControlPointsCount()
    control_points = mesh.GetControlPoints()

    positions = []
    for i in range(control_points_count):
        tmp = control_points[i]
        tmp = [tmp[0], tmp[1], tmp[2]]
        positions.append(tmp)

    node = mesh.GetNode()
    if node:
        t = node.GeometricTranslation.Get()
        t = FbxVector4(t[0], t[1], t[2], 1)
        r = node.GeometricRotation.Get()
        r = FbxVector4(r[0], r[1], r[2], 1)
        s = node.GeometricScaling.Get()
        s = FbxVector4(s[0], s[1], s[2], 1)

        has_geometric_transform = False
        if t[0] != 0 or t[1] != 0 or t[2] != 0 or \
                        r[0] != 0 or r[1] != 0 or r[2] != 0 or \
                        s[0] != 1 or s[1] != 1 or s[2] != 1:
            has_geometric_transform = True

        if has_geometric_transform:
            geo_transform = FbxMatrix(t,r,s)
        else:
            geo_transform = FbxMatrix()

        transform = None

        if option_geometry:
            # FbxMeshes are local to their node, we need the vertices in global space
            # when scene nodes are not exported
            transform = node.EvaluateGlobalTransform()
            transform = FbxMatrix(transform) * geo_transform

        elif has_geometric_transform:
            transform = geo_transform

        if transform:
            for i in range(len(positions)):
                v = positions[i]
                position = FbxVector4(v[0], v[1], v[2])
                position = transform.MultNormalize(position)
                positions[i] = [position[0], position[1], position[2]]

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
            normal = normals_array.GetAt(i)
            normal = [normal[0], normal[1], normal[2]]
            normal_values.append(normal)

        node = mesh.GetNode()
        if node:
            t = node.GeometricTranslation.Get()
            t = FbxVector4(t[0], t[1], t[2], 1)
            r = node.GeometricRotation.Get()
            r = FbxVector4(r[0], r[1], r[2], 1)
            s = node.GeometricScaling.Get()
            s = FbxVector4(s[0], s[1], s[2], 1)

            has_geometric_transform = False
            if t[0] != 0 or t[1] != 0 or t[2] != 0 or \
                            r[0] != 0 or r[1] != 0 or r[2] != 0 or \
                            s[0] != 1 or s[1] != 1 or s[2] != 1:
                has_geometric_transform = True

            if has_geometric_transform:
                geo_transform = FbxMatrix(t,r,s)
            else:
                geo_transform = FbxMatrix()

            transform = None

            if option_geometry:
                # FbxMeshes are local to their node, we need the vertices in global space
                # when scene nodes are not exported
                transform = node.EvaluateGlobalTransform()
                transform = FbxMatrix(transform) * geo_transform

            elif has_geometric_transform:
                transform = geo_transform

            if transform:
                t = FbxVector4(0,0,0,1)
                transform.SetRow(3, t)

                for i in range(len(normal_values)):
                    n = normal_values[i]
                    normal = FbxVector4(n[0], n[1], n[2])
                    normal = transform.MultNormalize(normal)
                    normal.Normalize()
                    normal = [normal[0], normal[1], normal[2]]
                    normal_values[i] = normal

        # indices
        vertex_id = 0
        for p in range(poly_count):
            poly_size = mesh.GetPolygonSize(p)
            poly_normals = []

            for v in range(poly_size):
                control_point_index = mesh.GetPolygonVertex(p, v)

                # mapping mode is by control points. The mesh should be smooth and soft.
                # we can get normals by retrieving each control point
                if mesh_normals.GetMappingMode() == FbxLayerElement.eByControlPoint:

                    # reference mode is direct, the normal index is same as vertex index.
                    # get normals by the index of control vertex
                    if mesh_normals.GetReferenceMode() == FbxLayerElement.eDirect:
                        poly_normals.append(control_point_index)

                    elif mesh_normals.GetReferenceMode() == FbxLayerElement.eIndexToDirect:
                        index = mesh_normals.GetIndexArray().GetAt(control_point_index)
                        poly_normals.append(index)

                # mapping mode is by polygon-vertex.
                # we can get normals by retrieving polygon-vertex.
                elif mesh_normals.GetMappingMode() == FbxLayerElement.eByPolygonVertex:

                    if mesh_normals.GetReferenceMode() == FbxLayerElement.eDirect:
                        poly_normals.append(vertex_id)

                    elif mesh_normals.GetReferenceMode() == FbxLayerElement.eIndexToDirect:
                        index = mesh_normals.GetIndexArray().GetAt(vertex_id)
                        poly_normals.append(index)

                elif mesh_normals.GetMappingMode() == FbxLayerElement.eByPolygon or \
                                mesh_normals.GetMappingMode() ==  FbxLayerElement.eAllSame or \
                                mesh_normals.GetMappingMode() ==  FbxLayerElement.eNone:
                    sys.stderr.write("unsupported normal mapping mode for polygon vertex\n")

                vertex_id += 1
            normal_indices.append(poly_normals)

        layered_normal_values.append(normal_values)
        layered_normal_indices.append(normal_indices)

    normal_values = []
    normal_indices = []

    # Three.js only supports one layer of normals
    if len(layered_normal_values) > 0:
        normal_values = layered_normal_values[0]
        normal_indices = layered_normal_indices[0]

    return normal_values, normal_indices

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
            color = colors_array.GetAt(i)
            color = [color.mRed, color.mGreen, color.mBlue, color.mAlpha]
            color_values.append(color)

        # indices
        vertex_id = 0
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
                        poly_colors.append(vertex_id)
                    elif mesh_colors.GetReferenceMode() == FbxLayerElement.eIndexToDirect:
                        index = mesh_colors.GetIndexArray().GetAt(vertex_id)
                        poly_colors.append(index)
                elif mesh_colors.GetMappingMode() == FbxLayerElement.eByPolygon or \
                                mesh_colors.GetMappingMode() ==  FbxLayerElement.eAllSame or \
                                mesh_colors.GetMappingMode() ==  FbxLayerElement.eNone:
                    sys.stderr.write("unsupported color mapping mode for polygon vertex\n")

                vertex_id += 1
            color_indices.append(poly_colors)

        layered_color_indices.append(color_indices)
        layered_color_values.append(color_values)

    color_values = []
    color_indices = []

    # Three.js only supports one layer of colors
    if len(layered_color_values) > 0:
        color_values = layered_color_values[0]
        color_indices = layered_color_indices[0]

    return color_values, color_indices

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
            uv = uvs_array.GetAt(i)
            uv = [uv[0], uv[1]]
            uv_values.append(uv)

        # indices
        vertex_id = 0
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
                    uv_texture_index = mesh_uvs.GetIndexArray().GetAt(vertex_id)

                    if mesh_uvs.GetReferenceMode() == FbxLayerElement.eDirect or \
                                    mesh_uvs.GetReferenceMode() == FbxLayerElement.eIndexToDirect:
                        poly_uvs.append(uv_texture_index)
                elif mesh_uvs.GetMappingMode() == FbxLayerElement.eByPolygon or \
                                mesh_uvs.GetMappingMode() ==  FbxLayerElement.eAllSame or \
                                mesh_uvs.GetMappingMode() ==  FbxLayerElement.eNone:
                    sys.stderr.write("unsupported uv mapping mode for polygon vertex\n")

                vertex_id += 1
            uv_indices.append(poly_uvs)

        layered_uv_values.append(uv_values)
        layered_uv_indices.append(uv_indices)

    return layered_uv_values, layered_uv_indices

# #####################################################
# Process Mesh Geometry
# #####################################################
def generate_normal_key(normal):
    return (round(normal[0], 6), round(normal[1], 6), round(normal[2], 6))

def generate_color_key(color):
    return pack_color(color)

def generate_uv_key(uv):
    return (round(uv[0], 6), round(uv[1], 6))

def append_non_duplicate_uvs(source_uvs, dest_uvs, counts):
    source_layer_count = len(source_uvs)
    for layer_index in range(source_layer_count):

        dest_layer_count = len(dest_uvs)

        if dest_layer_count <= layer_index:
            dest_uv_layer = {}
            count = 0
            dest_uvs.append(dest_uv_layer)
            counts.append(count)
        else:
            dest_uv_layer = dest_uvs[layer_index]
            count = counts[layer_index]

        source_uv_layer = source_uvs[layer_index]

        for uv in source_uv_layer:
            key = generate_uv_key(uv)
            if key not in dest_uv_layer:
                dest_uv_layer[key] = count
                count += 1

        counts[layer_index] = count

    return counts

def generate_unique_normals_dictionary(mesh_list):
    normals_dictionary = {}
    nnormals = 0

    # Merge meshes, remove duplicate data
    for mesh in mesh_list:
        normal_values, normal_indices = extract_fbx_vertex_normals(mesh)

        if len(normal_values) > 0:
            for normal in normal_values:
                key = generate_normal_key(normal)
                if key not in normals_dictionary:
                    normals_dictionary[key] = nnormals
                    nnormals += 1

    return normals_dictionary

def generate_unique_colors_dictionary(mesh_list):
    colors_dictionary = {}
    ncolors = 0

    # Merge meshes, remove duplicate data
    for mesh in mesh_list:
        color_values, color_indices = extract_fbx_vertex_colors(mesh)

        if len(color_values) > 0:
            for color in color_values:
                key = generate_color_key(color)
                if key not in colors_dictionary:
                    colors_dictionary[key] = ncolors
                    ncolors += 1

    return colors_dictionary

def generate_unique_uvs_dictionary_layers(mesh_list):
    uvs_dictionary_layers = []
    nuvs_list = []

    # Merge meshes, remove duplicate data
    for mesh in mesh_list:
        uv_values, uv_indices = extract_fbx_vertex_uvs(mesh)

        if len(uv_values) > 0:
            nuvs_list = append_non_duplicate_uvs(uv_values, uvs_dictionary_layers, nuvs_list)

    return uvs_dictionary_layers

def generate_normals_from_dictionary(normals_dictionary):
    normal_values = []
    for key, index in sorted(normals_dictionary.items(), key = operator.itemgetter(1)):
        normal_values.append(key)

    return normal_values

def generate_colors_from_dictionary(colors_dictionary):
    color_values = []
    for key, index in sorted(colors_dictionary.items(), key = operator.itemgetter(1)):
        color_values.append(key)

    return color_values

def generate_uvs_from_dictionary_layers(uvs_dictionary_layers):
    uv_values = []
    for uvs_dictionary in uvs_dictionary_layers:
        uv_values_layer = []
        for key, index in sorted(uvs_dictionary.items(), key = operator.itemgetter(1)):
            uv_values_layer.append(key)
        uv_values.append(uv_values_layer)

    return uv_values

def generate_normal_indices_for_poly(poly_index, mesh_normal_values, mesh_normal_indices, normals_to_indices):
    if len(mesh_normal_indices) <= 0:
        return []

    poly_normal_indices = mesh_normal_indices[poly_index]
    poly_size = len(poly_normal_indices)

    output_poly_normal_indices = []
    for v in range(poly_size):
        normal_index = poly_normal_indices[v]
        normal_value = mesh_normal_values[normal_index]

        key = generate_normal_key(normal_value)

        output_index = normals_to_indices[key]
        output_poly_normal_indices.append(output_index)

    return output_poly_normal_indices

def generate_color_indices_for_poly(poly_index, mesh_color_values, mesh_color_indices, colors_to_indices):
    if len(mesh_color_indices) <= 0:
        return []

    poly_color_indices = mesh_color_indices[poly_index]
    poly_size = len(poly_color_indices)

    output_poly_color_indices = []
    for v in range(poly_size):
        color_index = poly_color_indices[v]
        color_value = mesh_color_values[color_index]

        key = generate_color_key(color_value)

        output_index = colors_to_indices[key]
        output_poly_color_indices.append(output_index)

    return output_poly_color_indices

def generate_uv_indices_for_poly(poly_index, mesh_uv_values, mesh_uv_indices, uvs_to_indices):
    if len(mesh_uv_indices) <= 0:
        return []

    poly_uv_indices = mesh_uv_indices[poly_index]
    poly_size = len(poly_uv_indices)

    output_poly_uv_indices = []
    for v in range(poly_size):
        uv_index = poly_uv_indices[v]
        uv_value = mesh_uv_values[uv_index]

        key = generate_uv_key(uv_value)

        output_index = uvs_to_indices[key]
        output_poly_uv_indices.append(output_index)

    return output_poly_uv_indices

def process_mesh_vertices(mesh_list):
    vertex_offset = 0
    vertex_offset_list = [0]
    vertices = []
    for mesh in mesh_list:
        mesh_vertices = extract_fbx_vertex_positions(mesh)

        vertices.extend(mesh_vertices[:])
        vertex_offset += len(mesh_vertices)
        vertex_offset_list.append(vertex_offset)

    return vertices, vertex_offset_list


def process_mesh_materials(mesh_list):
    material_offset = 0
    material_offset_list = [0]
    materials_list = []

    #TODO: remove duplicate mesh references
    for mesh in mesh_list:
        node = mesh.GetNode()

        material_count = node.GetMaterialCount()
        if material_count > 0:
            for l in range(mesh.GetLayerCount()):
                materials = mesh.GetLayer(l).GetMaterials()
                if materials:
                    if materials.GetReferenceMode() == FbxLayerElement.eIndex:
                        #Materials are in an undefined external table
                        continue

                    for i in range(material_count):
                        material = node.GetMaterial(i)
                        materials_list.append(material)

                    material_offset += material_count
                    material_offset_list.append(material_offset)

    return materials_list, material_offset_list

def process_mesh_polygons(mesh_list, normals_to_indices, colors_to_indices, uvs_to_indices_list, vertex_offset_list, material_offset_list):
    faces = []
    for mesh_index in range(len(mesh_list)):
        mesh = mesh_list[mesh_index]

        flip_winding_order = False
        node = mesh.GetNode()
        if node:
            local_scale = node.EvaluateLocalScaling()
            if local_scale[0] < 0 or local_scale[1] < 0 or local_scale[2] < 0:
                flip_winding_order = True

        poly_count = mesh.GetPolygonCount()

        normal_values, normal_indices = extract_fbx_vertex_normals(mesh)
        color_values, color_indices = extract_fbx_vertex_colors(mesh)
        uv_values_layers, uv_indices_layers = extract_fbx_vertex_uvs(mesh)

        for poly_index in range(poly_count):
            poly_size = mesh.GetPolygonSize(poly_index)

            face_normals = generate_normal_indices_for_poly(poly_index, normal_values, normal_indices, normals_to_indices)
            face_colors = generate_color_indices_for_poly(poly_index, color_values, color_indices, colors_to_indices)

            face_uv_layers = []
            for l in range(len(uv_indices_layers)):
                uv_values = uv_values_layers[l]
                uv_indices = uv_indices_layers[l]
                face_uv_indices = generate_uv_indices_for_poly(poly_index, uv_values, uv_indices, uvs_to_indices_list[l])
                face_uv_layers.append(face_uv_indices)

            face_vertices = []
            for vertex_index in range(poly_size):
                control_point_index = mesh.GetPolygonVertex(poly_index, vertex_index)
                face_vertices.append(control_point_index)

            #TODO: assign a default material to any mesh without one
            if len(material_offset_list) <= mesh_index:
                material_offset = 0
            else:
                material_offset = material_offset_list[mesh_index]

            vertex_offset = vertex_offset_list[mesh_index]

            if poly_size > 4:
                new_face_normals = []
                new_face_colors = []
                new_face_uv_layers = []

                for i in range(poly_size - 2):
                    new_face_vertices = [face_vertices[0], face_vertices[i+1], face_vertices[i+2]]

                    if len(face_normals):
                        new_face_normals = [face_normals[0], face_normals[i+1], face_normals[i+2]]
                    if len(face_colors):
                        new_face_colors = [face_colors[0], face_colors[i+1], face_colors[i+2]]
                    if len(face_uv_layers):
                        new_face_uv_layers = []
                        for layer in face_uv_layers:
                            new_face_uv_layers.append([layer[0], layer[i+1], layer[i+2]])

                    face = generate_mesh_face(mesh,
                                              poly_index,
                                              new_face_vertices,
                                              new_face_normals,
                                              new_face_colors,
                                              new_face_uv_layers,
                                              vertex_offset,
                                              material_offset,
                                              flip_winding_order)
                    faces.append(face)
            else:
                face = generate_mesh_face(mesh,
                                          poly_index,
                                          face_vertices,
                                          face_normals,
                                          face_colors,
                                          face_uv_layers,
                                          vertex_offset,
                                          material_offset,
                                          flip_winding_order)
                faces.append(face)

    return faces

def generate_mesh_face(mesh, polygon_index, vertex_indices, normals, colors, uv_layers, vertex_offset, material_offset, flip_order):
    is_triangle = len(vertex_indices) == 3
    nvertices = 3 if is_triangle else 4

    has_material = False
    for l in range(mesh.GetLayerCount()):
        materials = mesh.GetLayer(l).GetMaterials()
        if materials:
            has_material = True
            break

    has_face_uvs = False
    has_face_vertex_uvs = len(uv_layers) > 0
    has_face_normals = False
    has_face_vertex_normals = len(normals) > 0
    has_face_colors = False
    has_face_vertex_colors = len(colors) > 0

    face_type = 0
    face_type = set_bit(face_type, 0, not is_triangle)
    face_type = set_bit(face_type, 1, has_material)
    face_type = set_bit(face_type, 2, has_face_uvs)
    face_type = set_bit(face_type, 3, has_face_vertex_uvs)
    face_type = set_bit(face_type, 4, has_face_normals)
    face_type = set_bit(face_type, 5, has_face_vertex_normals)
    face_type = set_bit(face_type, 6, has_face_colors)
    face_type = set_bit(face_type, 7, has_face_vertex_colors)

    face_data = []

    # order is important, must match order in JSONLoader

    # face type
    # vertex indices
    # material index
    # face uvs index
    # face vertex uvs indices
    # face color index
    # face vertex colors indices

    face_data.append(face_type)

    if flip_order:
        if nvertices == 3:
            vertex_indices = [vertex_indices[0], vertex_indices[2], vertex_indices[1]]
            if has_face_vertex_normals:
                normals = [normals[0], normals[2], normals[1]]
            if has_face_vertex_colors:
                colors = [colors[0], colors[2], colors[1]]
            if has_face_vertex_uvs:
                tmp = []
                for polygon_uvs in uv_layers:
                    tmp.append([polygon_uvs[0], polygon_uvs[2], polygon_uvs[1]])
                uv_layers = tmp
        else:
            vertex_indices = [vertex_indices[0], vertex_indices[3], vertex_indices[2], vertex_indices[1]]
            if has_face_vertex_normals:
                normals = [normals[0], normals[3], normals[2], normals[1]]
            if has_face_vertex_colors:
                colors = [colors[0], colors[3], colors[2], colors[1]]
            if has_face_vertex_uvs:
                tmp = []
                for polygon_uvs in uv_layers:
                    tmp.append([polygon_uvs[0], polygon_uvs[3], polygon_uvs[2], polygon_uvs[3]])
                uv_layers = tmp

    for i in range(nvertices):
        index = vertex_indices[i] + vertex_offset
        face_data.append(index)

    if has_material:
        material_id = 0
        for l in range(mesh.GetLayerCount()):
            materials = mesh.GetLayer(l).GetMaterials()
            if materials:
                material_id = materials.GetIndexArray().GetAt(polygon_index)
                break
        material_id += material_offset
        face_data.append(material_id)

    if has_face_vertex_uvs:
        for polygon_uvs in uv_layers:
            for i in range(nvertices):
                index = polygon_uvs[i]
                face_data.append(index)

    if has_face_vertex_normals:
        for i in range(nvertices):
            index = normals[i]
            face_data.append(index)

    if has_face_vertex_colors:
        for i in range(nvertices):
            index = colors[i]
            face_data.append(index)

    return face_data

# #####################################################
# Generate JSONLoader compatible Geometry
# #####################################################
def generate_geometry_data(node, geometry_dict):
    mesh = node.GetNodeAttribute()

    # This is done in order to keep the scene output and non-scene output code DRY
    mesh_list = [ mesh ]

    # Extract the mesh data into arrays
    vertices, vertex_offsets = process_mesh_vertices(mesh_list)
    materials, material_offsets = process_mesh_materials(mesh_list)

    normals_to_indices = generate_unique_normals_dictionary(mesh_list)
    colors_to_indices = generate_unique_colors_dictionary(mesh_list)
    uvs_to_indices_list = generate_unique_uvs_dictionary_layers(mesh_list)

    normal_values = generate_normals_from_dictionary(normals_to_indices)
    color_values = generate_colors_from_dictionary(colors_to_indices)
    uv_values = generate_uvs_from_dictionary_layers(uvs_to_indices_list)

    # Generate mesh faces for the Three.js file format
    faces = process_mesh_polygons(mesh_list,
                                  normals_to_indices,
                                  colors_to_indices,
                                  uvs_to_indices_list,
                                  vertex_offsets,
                                  material_offsets)

    # Generate counts for uvs, vertices, normals, colors, and faces
    nuvs = []
    for layer_index, uvs in enumerate(uv_values):
        nuvs.append(str(len(uvs)))

    nvertices = len(vertices)
    nnormals = len(normal_values)
    ncolors = len(color_values)
    nfaces = len(faces)

    # Flatten the arrays, currently they are in the form of [[0, 1, 2], [3, 4, 5], ...]
    vertices = [val for v in vertices for val in v]
    normal_values = [val for n in normal_values for val in n]
    color_values = [c for c in color_values]
    faces = [val for f in faces for val in f]
    uv_values = generate_uvs(uv_values)

    # Disable automatic json indenting when pretty printing for the arrays
    if option_pretty_print:
        nuvs = NoIndent(nuvs)
        vertices = ChunkedIndent(vertices, 15, True)
        normal_values = ChunkedIndent(normal_values, 15, True)
        color_values = ChunkedIndent(color_values, 15)
        faces = ChunkedIndent(faces, 30)

    metadata = {
      'vertices': nvertices,
      'normals': nnormals,
      'colors': ncolors,
      'faces': nfaces,
      'uvs': nuvs
    }

    geometry_name = get_geometry_name(node)

    return {
      name_key: geometry_name,
      'scale': 1,
      'vertices': vertices,
      'normals': [] if nnormals <= 0 else normal_values,
      'colors': [] if ncolors <= 0 else color_values,
      'uvs': uv_values,
      'faces': faces,
      metadata_key: metadata
    }

# #####################################################
# Generate Mesh Object (for non-scene output)
# #####################################################
def generate_non_scene_output(scene):
    mesh_list = generate_mesh_list(scene)

    # Extract the mesh data into arrays
    vertices, vertex_offsets = process_mesh_vertices(mesh_list)
    materials, material_offsets = process_mesh_materials(mesh_list)

    normals_to_indices = generate_unique_normals_dictionary(mesh_list)
    colors_to_indices = generate_unique_colors_dictionary(mesh_list)
    uvs_to_indices_list = generate_unique_uvs_dictionary_layers(mesh_list)

    normal_values = generate_normals_from_dictionary(normals_to_indices)
    color_values = generate_colors_from_dictionary(colors_to_indices)
    uv_values = generate_uvs_from_dictionary_layers(uvs_to_indices_list)

    # Generate mesh faces for the Three.js file format
    faces = process_mesh_polygons(mesh_list,
                                  normals_to_indices,
                                  colors_to_indices,
                                  uvs_to_indices_list,
                                  vertex_offsets,
                                  material_offsets)

    # Generate counts for uvs, vertices, normals, colors, and faces
    nuvs = []
    for layer_index, uvs in enumerate(uv_values):
        nuvs.append(str(len(uvs)))

    nvertices = len(vertices)
    nnormals = len(normal_values)
    ncolors = len(color_values)
    nfaces = len(faces)

    # Flatten the arrays, currently they are in the form of [[0, 1, 2], [3, 4, 5], ...]
    vertices = [val for v in vertices for val in v]
    normal_values = [val for n in normal_values for val in n]
    color_values = [c for c in color_values]
    faces = [val for f in faces for val in f]
    uv_values = generate_uvs(uv_values)

    # Disable json indenting when pretty printing for the arrays
    if option_pretty_print:
        nuvs = NoIndent(nuvs)
        vertices = NoIndent(vertices)
        normal_values = NoIndent(normal_values)
        color_values = NoIndent(color_values)
        faces = NoIndent(faces)

    metadata = {
      'formatVersion': 3,
      type_key: 'geometry',
      'generatedBy': 'convert-to-threejs.py',
      'vertices': nvertices,
      'normals': nnormals,
      'colors': ncolors,
      'faces': nfaces,
      'uvs': nuvs
    }

    return {
      'scale': 1,
      'materials': [],
      'vertices': vertices,
      'normals': [] if nnormals <= 0 else normal_values,
      'colors': [] if ncolors <= 0 else color_values,
      'uvs': uv_values,
      'faces': faces,
      metadata_key: metadata
    }

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
                converter.TriangulateInPlace(node)

            mesh_list.append(node.GetNodeAttribute())

    for i in range(node.GetChildCount()):
        generate_mesh_list_from_hierarchy(node.GetChild(i), mesh_list)

def generate_mesh_list(scene):
    mesh_list = []
    node = scene.GetRootNode()
    if node:
        for i in range(node.GetChildCount()):
            generate_mesh_list_from_hierarchy(node.GetChild(i), mesh_list)
    return mesh_list

def generate_geometry_list_from_hierarchy(node, geometry_list, geometry_dict):
    if node.GetNodeAttribute() == None:
        pass
    else:
        attribute_type = (node.GetNodeAttribute().GetAttributeType())
        if attribute_type == FbxNodeAttribute.eMesh or \
                        attribute_type == FbxNodeAttribute.eNurbs or \
                        attribute_type == FbxNodeAttribute.eNurbsSurface or \
                        attribute_type == FbxNodeAttribute.ePatch:

            if attribute_type != FbxNodeAttribute.eMesh:
                converter.TriangulateInPlace(node)

            geometry_data = generate_geometry_data(node, geometry_dict)
            geometry_uuid = str(uuid.uuid4())

            geometry_list.append({
              type_key: 'Geometry',
              uuid_key: geometry_uuid,
              data_key: geometry_data
            })
            geometry_dict[geometry_data[name_key]] = geometry_uuid

    for i in range(node.GetChildCount()):
        generate_geometry_list_from_hierarchy(node.GetChild(i), geometry_list, geometry_dict)

def find_duplicate_geometry(geometry_list, geometry_index):
    geometry = geometry_list[geometry_index]
    meta = geometry[data_key][metadata_key]

    data = geometry[data_key].copy()
    data.pop(name_key)
    data.pop(metadata_key)

    for i in range(geometry_index):
        test_geometry = geometry_list[i]
        test_meta = test_geometry[data_key][metadata_key]

        if meta == test_meta:
            test_data = test_geometry[data_key].copy()
            test_data.pop(name_key)
            test_data.pop(metadata_key)

            if test_data == data:
                return test_geometry

    return None

def optimise_geometry(geometry_list, geometry_dict):
    duplicate_geometry_indexes = []

    for i in range(len(geometry_list)):
        duplicate_geometry = find_duplicate_geometry(geometry_list, i)

        if duplicate_geometry is not None:
            duplicate_geometry_indexes.append(i)
            geometry_dict[geometry_list[i][data_key][name_key]] = duplicate_geometry[uuid_key]

    for index in reversed(duplicate_geometry_indexes):
        del geometry_list[index]

def generate_geometry_list(scene):
    geometry_list = []
    geometry_dict = {}

    node = scene.GetRootNode()
    if node:
        for i in range(node.GetChildCount()):
            generate_geometry_list_from_hierarchy(node.GetChild(i), geometry_list, geometry_dict)

    if option_optimise_geometry:
        optimise_geometry(geometry_list, geometry_dict)

    return geometry_list, geometry_dict


# #####################################################
# Generate Light Node Objects
# #####################################################
def generate_default_light():
    direction = (1,1,1)
    color = (1,1,1)
    intensity = 80.0

    return {
      type_key: 'DirectionalLight',
      uuid_key: str(uuid.uuid4()),
      name_key: 'DirectionalLight',
      'color': pack_color(color),
      'intensity': intensity/100.00,
      'direction': serialize_vector3(direction)
    }

def generate_light_object(node):
    light = node.GetNodeAttribute()
    light_types = ["point", "directional", "spot", "area", "volume"]
    light_type = light_types[light.LightType.Get()]

    transform = node.EvaluateLocalTransform()
    position = transform.GetT()

    output = None

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
            direction = matrix.MultNormalize(FbxVector4(0,1,0,1))

        output = {
          type_key: 'DirectionalLight',
          'color': pack_color(light.Color.Get()),
          'intensity': light.Intensity.Get()/100.0,
          'direction': serialize_vector3(direction),
          # TODO: ObjectLoader doesn't support targets
          #'target': getObjectName(node.GetTarget())
        }

    elif light_type == "point":

        output = {
          type_key: 'PointLight',
          'color': pack_color(light.Color.Get()),
          'intensity': light.Intensity.Get()/100.0,
          'position': serialize_vector3(position),
          'distance': light.FarAttenuationEnd.Get()
        }

    elif light_type == "spot":

        output = {
          type_key: 'SpotLight',
          'color': pack_color(light.Color.Get()),
          'intensity': light.Intensity.Get()/100.0,
          'position': serialize_vector3(position),
          'distance': light.FarAttenuationEnd.Get(),
          'angle': light.OuterAngle.Get()*math.pi/180,
          'exponent': light.DecayType.Get(),
          # TODO: ObjectLoader doesn't support targets
          #'target': getObjectName(node.GetTarget())
        }

    return output

def generate_ambient_light(scene):

    scene_settings = scene.GetGlobalSettings()
    ambient_color = scene_settings.GetAmbientColor()
    ambient_color = (ambient_color.mRed, ambient_color.mGreen, ambient_color.mBlue)

    if ambient_color[0] == 0 and ambient_color[1] == 0 and ambient_color[2] == 0:
        return None

    return {
      type_key: 'AmbientLight',
      uuid_key: str(uuid.uuid4()),
      name_key: 'AmbientLight',
      'color': pack_color(ambient_color),
    }

# #####################################################
# Generate Camera Node Objects
# #####################################################
def generate_default_camera():
    position = (100, 100, 100)
    near = 0.1
    far = 1000
    fov = 75

    return {
      type_key: 'PerspectiveCamera',
      uuid_key: str(uuid.uuid4()),
      name_key: 'DefaultCamera',
      'fov': fov,
      'near': near,
      'far': far,
      'position': serialize_vector3(position)
    }

def generate_camera_object(node):
    camera = node.GetNodeAttribute()
    position = camera.Position.Get()

    projection_types = [ "perspective", "orthogonal" ]
    projection = projection_types[camera.ProjectionType.Get()]

    near = camera.NearPlane.Get()
    far = camera.FarPlane.Get()

    output = {}

    if projection == "perspective":

        aspect = camera.PixelAspectRatio.Get()
        fov = camera.FieldOfView.Get()

        output = {
          type_key: 'PerspectiveCamera',
          'fov': fov,
          'aspect': aspect,
          'near': near,
          'far': far,
          'position': serialize_vector3(position)
        }

    elif projection == "orthogonal":

        left = ""
        right = ""
        top = ""
        bottom = ""

        output = {
          type_key: 'PerspectiveCamera',
          'left': left,
          'right': right,
          'top': top,
          'bottom': bottom,
          'near': near,
          'far': far,
          'position': serialize_vector3(position)
        }

    return output

# #####################################################
# Generate Mesh Node Object
# #####################################################
def generate_mesh_object(node, geometry_dict, material_dict):
    mesh = node.GetNodeAttribute()
    transform = node.EvaluateLocalTransform()
    position = transform.GetT()
    scale = transform.GetS()
    quaternion = transform.GetQ()

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
                    material_names.append(get_material_name(material))

        if not material_count > 1 and not len(material_names) > 0:
            material_names.append('')

        material_name = get_multi_material_name(node) if material_count > 1 else material_names[0]
    else:
        mesh_name = 'Mesh_%s_%s' % (mesh.GetUniqueID(), mesh.GetName()) if len(mesh.GetName()) > 0 else 'Mesh_%s' % mesh.GetUniqueID()
        sys.stderr.write("WARNING: Mesh '%s' has no materials\n" % mesh_name)

    output = {
        type_key: 'Mesh',
        'geometry': geometry_dict[get_geometry_name(node)],
        'position': serialize_vector3(position),
        'quaternion': serialize_vector4(quaternion),
        'scale': serialize_vector3(scale),
        'visible': True
    }

    if len(material_name) > 0:
        output['material'] = material_dict[material_name]

    return output

# #####################################################
# Generate Node Object
# #####################################################
def generate_generic_object(node):
    node_types = ["Unknown", "Null", "Marker", "Skeleton", "Mesh", "Nurbs", "Patch", "Camera",
                  "CameraStereo", "CameraSwitcher", "Light", "OpticalReference", "OpticalMarker", "NurbsCurve",
                  "TrimNurbsSurface", "Boundary", "NurbsSurface", "Shape", "LODGroup", "SubDiv", "CachedEffect", "Line"]

    transform = node.EvaluateLocalTransform()
    position = transform.GetT()
    scale = transform.GetS()
    quaternion = transform.GetQ()

    if node.GetNodeAttribute() == None:
        node_type = "Null"
    else:
        node_type = node_types[node.GetNodeAttribute().GetAttributeType()]

    return {
      type_key: node_type,
      'position': serialize_vector3(position),
      'quaternion': serialize_vector4(quaternion),
      'scale': serialize_vector3(scale),
      'visible': True
    }

# #####################################################
# Parse Scene Node Objects
# #####################################################
def generate_object(node, geometry_dict, material_dict):
    if node.GetNodeAttribute() == None:
        object_data = generate_generic_object(node)
    else:
        attribute_type = (node.GetNodeAttribute().GetAttributeType())
        if attribute_type == FbxNodeAttribute.eMesh:
            object_data = generate_mesh_object(node, geometry_dict, material_dict)
        elif attribute_type == FbxNodeAttribute.eLight:
            object_data = generate_light_object(node)
        elif attribute_type == FbxNodeAttribute.eCamera:
            object_data = generate_camera_object(node)
        else:
            object_data = generate_generic_object(node)

    object_data[uuid_key] = str(uuid.uuid4())
    object_data[name_key] = get_object_name(node)

    children = []

    for i in range(node.GetChildCount()):
        children.append(generate_object(node.GetChild(i), geometry_dict, material_dict))

    if len(children) > 0:
        object_data[children_key] = children

    return object_data

def generate_scene_object(scene, geometry_dict, material_dict):
    children = []

    ambient_light = generate_ambient_light(scene)
    if ambient_light:
        children.append(ambient_light)

    if option_default_light:
        children.append(generate_default_light())

    if option_default_camera:
        children.append(generate_default_camera())

    node = scene.GetRootNode()
    if node:
        for i in range(node.GetChildCount()):
            children.append(generate_object(node.GetChild(i), geometry_dict, material_dict))

    return {
      type_key: 'Scene',
      uuid_key: str(uuid.uuid4()),
      name_key: 'Scene',
      'position': serialize_vector3((0,0,0)),
      'rotation': serialize_vector3((0,0,0)),
      'scale': serialize_vector3((1,1,1)),
      children_key: children
    }

# #####################################################
# Generate Scene Output
# #####################################################
def extract_scene(scene):
    geometries, geometry_dict = generate_geometry_list(scene)
    textures, images, texture_dict = generate_texture_and_image_lists(scene)
    materials, material_dict = generate_material_list(scene, texture_dict)

    object = generate_scene_object(scene, geometry_dict, material_dict)

    metadata = {
      'formatVersion': 4.3,
      type_key: 'Object',
      'generatedBy': 'convert-to-threejs.py'
    }

    return {
      'geometries': geometries,
      'images': images,
      'textures': textures,
      'materials': materials,
      'object': object,
      metadata_key: metadata
    }

# #####################################################
# Generate Non-Scene Output
# #####################################################
def extract_geometry(scene):
    return generate_non_scene_output(scene)

# #####################################################
# File Helpers
# #####################################################
def write_file(filepath, content):
    out = open(filepath, "w")
    out.write(content.encode('utf8', 'replace'))
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
        sys.exit(msg)

    usage = "Usage: %prog [source_file.fbx] [output_file.js] [options]"
    parser = OptionParser(usage=usage)

    parser.add_option('-t', '--triangulate', action='store_true', dest='triangulate', help="force quad geometry into triangles", default=False)
    parser.add_option('-x', '--ignore-textures', action='store_true', dest='notextures', help="don't include texture references in output file", default=False)
    parser.add_option('-n', '--no-texture-copy', action='store_true', dest='notexturecopy', help="don't copy texture files", default=False)
    parser.add_option('-i', '--ignore-texture-collisions', action='store_true', dest='ignoretexturecollisions', help="Allow copied textures with the same filename to overwrite each other")
    parser.add_option("-o", "--texture-output-dir", dest="textureoutputdir", help="write copied textures to specified directory (relative to the output .js file)", metavar='DIR', default='maps')
    parser.add_option('-a', '--no-transparency-detection', action='store_true', dest='notransparencydetection', help="don't automatically enable transparency for materials with diffuse maps containing alpha", default=False)
    parser.add_option('-u', '--force-prefix', action='store_true', dest='prefix', help="prefix all object names in output file to ensure uniqueness", default=False)
    parser.add_option('-f', '--flatten-scene', action='store_true', dest='geometry', help="merge all geometries and apply node transforms", default=False)
    parser.add_option('-y', '--force-y-up', action='store_true', dest='forceyup', help="ensure that the y axis shows up", default=False)
    parser.add_option('-c', '--add-camera', action='store_true', dest='defcamera', help="include default camera in output scene", default=False)
    parser.add_option('-l', '--add-light', action='store_true', dest='deflight', help="include default light in output scene", default=False)
    parser.add_option('-p', '--pretty-print', action='store_true', dest='pretty', help="nicely format the output JSON", default=False)
    parser.add_option('-g', '--optimise-geometry', action='store_true', dest='optimisegeometry', help="remove duplicate geometry", default=False)

    (options, args) = parser.parse_args()

    option_triangulate = options.triangulate
    option_textures = not options.notextures
    option_copy_textures = not options.notexturecopy
    option_ignore_texture_collision = options.ignoretexturecollisions
    option_texture_output_dir = options.textureoutputdir
    option_transparency_detection = not options.notransparencydetection
    option_prefix = options.prefix
    option_geometry = options.geometry
    option_forced_y_up = options.forceyup
    option_default_camera = options.defcamera
    option_default_light = options.deflight
    option_pretty_print = options.pretty
    option_optimise_geometry = options.optimisegeometry

    # Prepare the FBX SDK.
    sdk_manager, scene = InitializeSdkObjects()
    converter = FbxGeometryConverter(sdk_manager)

    identify_present = False
    try:
        popen = subprocess.Popen(('identify', '-help'), stdout=subprocess.PIPE)
        popen.communicate()
        identify_present = True
    except OSError as e:
        pass

    if not identify_present:
        if option_transparency_detection:
            sys.exit('\nTransparency detection requires ImageMagick (identify) to be installed\nEnsure identify is in your PATH or specify the --no-transparency-detection flag')
        if option_copy_textures:
            sys.stderr.write('\nWARNING: ImageMagick (identify) not found installed in PATH.\nTextures will not automatically be converted to web compatible file formats\n')
            texture_conversion_enabled = False

    if option_copy_textures:
        convert_present = False
        try:
            popen = subprocess.Popen(('convert', '-help'), stdout=subprocess.PIPE)
            popen.communicate()
            convert_present = True
        except OSError as e:
            pass

        if not convert_present:
            sys.stderr.write('\nWARNING: ImageMagick (convert) not found installed in PATH.\nTextures will not automatically be converted to web compatible file formats\n')
            texture_conversion_enabled = False

# The converter takes an FBX file as an argument.
    if len(args) > 1:
        print("\nLoading file: %s" % args[0])
        result = LoadScene(sdk_manager, scene, args[0])
    else:
        result = False
        sys.exit("\nUsage: convert_fbx_to_threejs [source_file.fbx] [output_file.js]\n")

    if not result:
        sys.stderr.write("\nAn error occurred while loading the file...\n")
    else:
        if option_triangulate:
            print("\nForcing geometry to triangles")
            triangulate_scene(scene)

        axis_system = FbxAxisSystem.MayaYUp

        if not option_forced_y_up:
            # According to asset's coordinate to convert scene
            up_vector = scene.GetGlobalSettings().GetAxisSystem().GetUpVector()
            if up_vector[0] == 3:
                axis_system = FbxAxisSystem.MayaZUp

        axis_system.ConvertScene(scene)

        output_path = os.path.join(os.getcwd(), args[1])
        output_directory = os.path.dirname(output_path)

        if not os.path.exists(output_directory):
            try:
                os.makedirs(output_directory)
            except IOError as e:
                sys.exit("I/O error({0}): {1} {2}".format(e.errno, e.strerror, output_directory))

        if option_pretty_print:
            metadata_key = '00_metadata'
            type_key = '01_type'
            uuid_key = '02_uuid'
            name_key = '03_name'
            data_key = 'zy_data'
            children_key = 'zz_children'

        if option_geometry:
            output_content = extract_geometry(scene)
        else:
            output_content = extract_scene(scene)

        if option_pretty_print:
            output_string = json.dumps(output_content, indent=4, cls=CustomEncoder, separators=(',', ': '), sort_keys=True)
            output_string = execute_regex_hacks(output_string)
        else:
            output_string = json.dumps(output_content, separators=(',', ': '), sort_keys=True)

        write_file(output_path, output_string)

        print("\nExported Three.js file to:\n%s\n" % output_path)

    # Destroy all objects created by the FBX SDK.
    sdk_manager.Destroy()
    sys.exit(0)
