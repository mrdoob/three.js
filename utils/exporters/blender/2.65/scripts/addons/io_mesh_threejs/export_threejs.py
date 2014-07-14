# ##### BEGIN GPL LICENSE BLOCK #####
#
#  This program is free software; you can redistribute it and/or
#  modify it under the terms of the GNU General Public License
#  as published by the Free Software Foundation; either version 2
#  of the License, or (at your option) any later version.
#
#  This program is distributed in the hope that it will be useful,
#  but WITHOUT ANY WARRANTY; without even the implied warranty of
#  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#  GNU General Public License for more details.
#
#  You should have received a copy of the GNU General Public License
#  along with this program; if not, write to the Free Software Foundation,
#  Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301, USA.
#
# ##### END GPL LICENSE BLOCK #####

"""
Blender exporter for Three.js (ASCII JSON format).

TODO
    - binary format
"""

import bpy
import mathutils

import shutil
import os
import os.path
import math
import operator
import random

# #####################################################
# Configuration
# #####################################################

DEFAULTS = {
"bgcolor" : [0, 0, 0],
"bgalpha" : 1.0,

"position" : [0, 0, 0],
"rotation" : [0, 0, 0],
"scale"    : [1, 1, 1],

"camera"  :
    {
        "name" : "default_camera",
        "type" : "PerspectiveCamera",
        "near" : 1,
        "far"  : 10000,
        "fov"  : 60,
        "aspect": 1.333,
        "position" : [0, 0, 10],
        "target"   : [0, 0, 0]
    },

"light" :
 {
    "name"       : "default_light",
    "type"       : "DirectionalLight",
    "direction"  : [0, 1, 1],
    "color"      : [1, 1, 1],
    "intensity"  : 0.8
 }
}

ROTATE_X_PI2 = mathutils.Quaternion((1.0, 0.0, 0.0), math.radians(-90.0)).to_matrix().to_4x4()

# default colors for debugging (each material gets one distinct color):
# white, red, green, blue, yellow, cyan, magenta
COLORS = [0xeeeeee, 0xee0000, 0x00ee00, 0x0000ee, 0xeeee00, 0x00eeee, 0xee00ee]


# skinning
MAX_INFLUENCES = 2


# #####################################################
# Templates - scene
# #####################################################

TEMPLATE_SCENE_ASCII = """\
{

"metadata" :
{
	"formatVersion" : 3.2,
	"type"          : "scene",
	"sourceFile"    : "%(fname)s",
	"generatedBy"   : "Blender 2.7 Exporter",
	"objects"       : %(nobjects)s,
	"geometries"    : %(ngeometries)s,
	"materials"     : %(nmaterials)s,
	"textures"      : %(ntextures)s
},

"urlBaseType" : %(basetype)s,

%(sections)s

"transform" :
{
	"position"  : %(position)s,
	"rotation"  : %(rotation)s,
	"scale"     : %(scale)s
},

"defaults" :
{
	"bgcolor" : %(bgcolor)s,
	"bgalpha" : %(bgalpha)f,
	"camera"  : %(defcamera)s
}

}
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
		"groups"    : [ %(group_id)s ],
		"material"  : %(material_id)s,
		"position"  : %(position)s,
		"rotation"  : %(rotation)s,
		"quaternion": %(quaternion)s,
		"scale"     : %(scale)s,
		"visible"       : %(visible)s,
		"castShadow"    : %(castShadow)s,
		"receiveShadow" : %(receiveShadow)s,
		"doubleSided"   : %(doubleSided)s
	}"""

TEMPLATE_EMPTY = """\
	%(object_id)s : {
		"groups"    : [ %(group_id)s ],
		"position"  : %(position)s,
		"rotation"  : %(rotation)s,
		"quaternion": %(quaternion)s,
		"scale"     : %(scale)s
	}"""

TEMPLATE_GEOMETRY_LINK = """\
	%(geometry_id)s : {
		"type" : "ascii",
		"url"  : %(model_file)s
	}"""

TEMPLATE_GEOMETRY_EMBED = """\
	%(geometry_id)s : {
		"type" : "embedded",
		"id"  : %(embed_id)s
	}"""

TEMPLATE_TEXTURE = """\
	%(texture_id)s : {
		"url": %(texture_file)s%(extras)s
	}"""

TEMPLATE_MATERIAL_SCENE = """\
	%(material_id)s : {
		"type": %(type)s,
		"parameters": { %(parameters)s }
	}"""

TEMPLATE_CAMERA_PERSPECTIVE = """\
	%(camera_id)s : {
		"type"  : "PerspectiveCamera",
		"fov"   : %(fov)f,
		"aspect": %(aspect)f,
		"near"  : %(near)f,
		"far"   : %(far)f,
		"position": %(position)s,
		"target"  : %(target)s
	}"""

TEMPLATE_CAMERA_ORTHO = """\
	%(camera_id)s : {
		"type"  : "OrthographicCamera",
		"left"  : %(left)f,
		"right" : %(right)f,
		"top"   : %(top)f,
		"bottom": %(bottom)f,
		"near"  : %(near)f,
		"far"   : %(far)f,
		"position": %(position)s,
		"target"  : %(target)s
	}"""

TEMPLATE_LIGHT_POINT = """\
	%(light_id)s : {
		"type"       : "PointLight",
		"position"   : %(position)s,
		"rotation"   : %(rotation)s,
		"color"      : %(color)d,
		"distance"   : %(distance).3f,
		"intensity"  : %(intensity).3f
	}"""

TEMPLATE_LIGHT_SUN = """\
	%(light_id)s : {
		"type"       : "AmbientLight",
		"position"   : %(position)s,
		"rotation"   : %(rotation)s,
		"color"      : %(color)d,
		"distance"   : %(distance).3f,
		"intensity"  : %(intensity).3f
	}"""

TEMPLATE_LIGHT_SPOT = """\
	%(light_id)s : {
		"type"       : "SpotLight",
		"position"   : %(position)s,
		"rotation"   : %(rotation)s,
		"color"      : %(color)d,
		"distance"   : %(distance).3f,
		"intensity"  : %(intensity).3f,
		"use_shadow" : %(use_shadow)d,
		"angle"      : %(angle).3f
	}"""

TEMPLATE_LIGHT_HEMI = """\
	%(light_id)s : {
		"type"       : "HemisphereLight",
		"position"   : %(position)s,
		"rotation"   : %(rotation)s,
		"color"      : %(color)d,
		"distance"   : %(distance).3f,
		"intensity"  : %(intensity).3f
	}"""

TEMPLATE_LIGHT_AREA = """\
	%(light_id)s : {
		"type"       : "AreaLight",
		"position"   : %(position)s,
		"rotation"   : %(rotation)s,
		"color"      : %(color)d,
		"distance"   : %(distance).3f,
		"intensity"  : %(intensity).3f,
		"gamma"      : %(gamma).3f,
		"shape"      : "%(shape)s",
		"size"       : %(size).3f,
		"size_y"     : %(size_y).3f
	}"""


TEMPLATE_VEC4 = '[ %g, %g, %g, %g ]'
TEMPLATE_VEC3 = '[ %g, %g, %g ]'
TEMPLATE_VEC2 = '[ %g, %g ]'
TEMPLATE_STRING = '"%s"'
TEMPLATE_HEX = "0x%06x"

# #####################################################
# Templates - model
# #####################################################

TEMPLATE_FILE_ASCII = """\
{

	"metadata" :
	{
		"formatVersion" : 3.1,
		"generatedBy"   : "Blender 2.7 Exporter",
		"vertices"      : %(nvertex)d,
		"faces"         : %(nface)d,
		"normals"       : %(nnormal)d,
		"colors"        : %(ncolor)d,
		"uvs"           : [%(nuvs)s],
		"materials"     : %(nmaterial)d,
		"morphTargets"  : %(nmorphTarget)d,
		"bones"         : %(nbone)d
	},

%(model)s

}
"""

TEMPLATE_MODEL_ASCII = """\
	"scale" : %(scale)f,

	"materials" : [%(materials)s],

	"vertices" : [%(vertices)s],

	"morphTargets" : [%(morphTargets)s],

	"normals" : [%(normals)s],

	"colors" : [%(colors)s],

	"uvs" : [%(uvs)s],

	"faces" : [%(faces)s],

	"bones" : [%(bones)s],

	"skinIndices" : [%(indices)s],

	"skinWeights" : [%(weights)s],

  "animations" : [%(animations)s]
"""

TEMPLATE_VERTEX = "%g,%g,%g"
TEMPLATE_VERTEX_TRUNCATE = "%d,%d,%d"

TEMPLATE_N = "%g,%g,%g"
TEMPLATE_UV = "%g,%g"
TEMPLATE_C = "%d"

# #####################################################
# Utils
# #####################################################

def veckey3(x,y,z):
    return round(x, 6), round(y, 6), round(z, 6)

def veckey3d(v):
    return veckey3(v.x, v.y, v.z)

def veckey2d(v):
    return round(v[0], 6), round(v[1], 6)

def get_faces(obj):
    if hasattr(obj, "tessfaces"):
        return obj.tessfaces
    else:
        return obj.faces

def get_normal_indices(v, normals, mesh):
    n = []
    mv = mesh.vertices

    for i in v:
        normal = mv[i].normal
        key = veckey3d(normal)

        n.append( normals[key] )

    return n

def get_uv_indices(face_index, uvs, mesh, layer_index):
    uv = []
    uv_layer = mesh.tessface_uv_textures[layer_index].data
    for i in uv_layer[face_index].uv:
        uv.append( uvs[veckey2d(i)] )
    return uv

def get_color_indices(face_index, colors, mesh):
    c = []
    color_layer = mesh.tessface_vertex_colors.active.data
    face_colors = color_layer[face_index]
    face_colors = face_colors.color1, face_colors.color2, face_colors.color3, face_colors.color4
    for i in face_colors:
        c.append( colors[hexcolor(i)] )
    return c

def rgb2int(rgb):
    color = (int(rgb[0]*255) << 16) + (int(rgb[1]*255) << 8) + int(rgb[2]*255);
    return color

# #####################################################
# Utils - files
# #####################################################

def write_file(fname, content):
    out = open(fname, "w", encoding="utf-8")
    out.write(content)
    out.close()

def ensure_folder_exist(foldername):
    """Create folder (with whole path) if it doesn't exist yet."""

    if not os.access(foldername, os.R_OK|os.W_OK|os.X_OK):
        os.makedirs(foldername)

def ensure_extension(filepath, extension):
    if not filepath.lower().endswith(extension):
        filepath += extension
    return filepath

def generate_mesh_filename(meshname, filepath):
    normpath = os.path.normpath(filepath)
    path, ext = os.path.splitext(normpath)
    return "%s.%s%s" % (path, meshname, ext)


# #####################################################
# Utils - alignment
# #####################################################

def bbox(vertices):
    """Compute bounding box of vertex array.
    """

    if len(vertices)>0:
        minx = maxx = vertices[0].co.x
        miny = maxy = vertices[0].co.y
        minz = maxz = vertices[0].co.z

        for v in vertices[1:]:
            if v.co.x < minx:
                minx = v.co.x
            elif v.co.x > maxx:
                maxx = v.co.x

            if v.co.y < miny:
                miny = v.co.y
            elif v.co.y > maxy:
                maxy = v.co.y

            if v.co.z < minz:
                minz = v.co.z
            elif v.co.z > maxz:
                maxz = v.co.z

        return { 'x':[minx,maxx], 'y':[miny,maxy], 'z':[minz,maxz] }

    else:
        return { 'x':[0,0], 'y':[0,0], 'z':[0,0] }

def translate(vertices, t):
    """Translate array of vertices by vector t.
    """

    for i in range(len(vertices)):
        vertices[i].co.x += t[0]
        vertices[i].co.y += t[1]
        vertices[i].co.z += t[2]

def center(vertices):
    """Center model (middle of bounding box).
    """

    bb = bbox(vertices)

    cx = bb['x'][0] + (bb['x'][1] - bb['x'][0])/2.0
    cy = bb['y'][0] + (bb['y'][1] - bb['y'][0])/2.0
    cz = bb['z'][0] + (bb['z'][1] - bb['z'][0])/2.0

    translate(vertices, [-cx,-cy,-cz])

    return [-cx,-cy,-cz]

def top(vertices):
    """Align top of the model with the floor (Y-axis) and center it around X and Z.
    """

    bb = bbox(vertices)

    cx = bb['x'][0] + (bb['x'][1] - bb['x'][0])/2.0
    cy = bb['y'][1]
    cz = bb['z'][0] + (bb['z'][1] - bb['z'][0])/2.0

    translate(vertices, [-cx,-cy,-cz])

    return [-cx,-cy,-cz]

def bottom(vertices):
    """Align bottom of the model with the floor (Y-axis) and center it around X and Z.
    """

    bb = bbox(vertices)

    cx = bb['x'][0] + (bb['x'][1] - bb['x'][0])/2.0
    cy = bb['y'][0]
    cz = bb['z'][0] + (bb['z'][1] - bb['z'][0])/2.0

    translate(vertices, [-cx,-cy,-cz])

    return [-cx,-cy,-cz]

# #####################################################
# Elements rendering
# #####################################################

def hexcolor(c):
    return ( int(c[0] * 255) << 16  ) + ( int(c[1] * 255) << 8 ) + int(c[2] * 255)

def generate_vertices(vertices, option_vertices_truncate, option_vertices):
    if not option_vertices:
        return ""

    return ",".join(generate_vertex(v, option_vertices_truncate) for v in vertices)

def generate_vertex(v, option_vertices_truncate):
    if not option_vertices_truncate:
        return TEMPLATE_VERTEX % (v.co.x, v.co.y, v.co.z)
    else:
        return TEMPLATE_VERTEX_TRUNCATE % (v.co.x, v.co.y, v.co.z)

def generate_normal(n):
    return TEMPLATE_N % (n[0], n[1], n[2])

def generate_vertex_color(c):
    return TEMPLATE_C % c

def generate_uv(uv):
    return TEMPLATE_UV % (uv[0], uv[1])

# #####################################################
# Model exporter - faces
# #####################################################

def setBit(value, position, on):
    if on:
        mask = 1 << position
        return (value | mask)
    else:
        mask = ~(1 << position)
        return (value & mask)

def generate_faces(normals, uv_layers, colors, meshes, option_normals, option_colors, option_uv_coords, option_materials, option_faces):

    if not option_faces:
        return "", 0

    vertex_offset = 0
    material_offset = 0

    chunks = []
    for mesh, object in meshes:

        vertexUV = len(mesh.uv_textures) > 0
        vertexColors = len(mesh.vertex_colors) > 0

        mesh_colors = option_colors and vertexColors
        mesh_uvs = option_uv_coords and vertexUV

        if vertexUV:
            active_uv_layer = mesh.uv_textures.active
            if not active_uv_layer:
                mesh_extract_uvs = False

        if vertexColors:
            active_col_layer = mesh.vertex_colors.active
            if not active_col_layer:
                mesh_extract_colors = False

        for i, f in enumerate(get_faces(mesh)):
            face = generate_face(f, i, normals, uv_layers, colors, mesh, option_normals, mesh_colors, mesh_uvs, option_materials, vertex_offset, material_offset)
            chunks.append(face)

        vertex_offset += len(mesh.vertices)

        material_count = len(mesh.materials)
        if material_count == 0:
            material_count = 1

        material_offset += material_count

    return ",".join(chunks), len(chunks)

def generate_face(f, faceIndex, normals, uv_layers, colors, mesh, option_normals, option_colors, option_uv_coords, option_materials, vertex_offset, material_offset):
    isTriangle = ( len(f.vertices) == 3 )

    if isTriangle:
        nVertices = 3
    else:
        nVertices = 4

    hasMaterial = option_materials

    hasFaceUvs = False # not supported in Blender
    hasFaceVertexUvs = option_uv_coords

    hasFaceNormals = False # don't export any face normals (as they are computed in engine)
    hasFaceVertexNormals = option_normals

    hasFaceColors = False       # not supported in Blender
    hasFaceVertexColors = option_colors

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
        index = f.vertices[i] + vertex_offset
        faceData.append(index)

    if hasMaterial:
        index = f.material_index + material_offset
        faceData.append( index )

    if hasFaceVertexUvs:
        for layer_index, uvs in enumerate(uv_layers):
            uv = get_uv_indices(faceIndex, uvs, mesh, layer_index)
            for i in range(nVertices):
                index = uv[i]
                faceData.append(index)

    if hasFaceVertexNormals:
        n = get_normal_indices(f.vertices, normals, mesh)
        for i in range(nVertices):
            index = n[i]
            faceData.append(index)

    if hasFaceVertexColors:
        c = get_color_indices(faceIndex, colors, mesh)
        for i in range(nVertices):
            index = c[i]
            faceData.append(index)

    return ",".join( map(str, faceData) )


# #####################################################
# Model exporter - normals
# #####################################################

def extract_vertex_normals(mesh, normals, count):
    for f in get_faces(mesh):
        for v in f.vertices:

            normal = mesh.vertices[v].normal
            key = veckey3d(normal)

            if key not in normals:
                normals[key] = count
                count += 1

    return count

def generate_normals(normals, option_normals):
    if not option_normals:
        return ""

    chunks = []
    for key, index in sorted(normals.items(), key = operator.itemgetter(1)):
        chunks.append(key)

    return ",".join(generate_normal(n) for n in chunks)

# #####################################################
# Model exporter - vertex colors
# #####################################################

def extract_vertex_colors(mesh, colors, count):
    color_layer = mesh.tessface_vertex_colors.active.data

    for face_index, face in enumerate(get_faces(mesh)):

        face_colors = color_layer[face_index]
        face_colors = face_colors.color1, face_colors.color2, face_colors.color3, face_colors.color4

        for c in face_colors:
            key = hexcolor(c)
            if key not in colors:
                colors[key] = count
                count += 1

    return count

def generate_vertex_colors(colors, option_colors):
    if not option_colors:
        return ""

    chunks = []
    for key, index in sorted(colors.items(), key=operator.itemgetter(1)):
        chunks.append(key)

    return ",".join(generate_vertex_color(c) for c in chunks)

# #####################################################
# Model exporter - UVs
# #####################################################

def extract_uvs(mesh, uv_layers, counts):
    for index, layer in enumerate(mesh.tessface_uv_textures):

        if len(uv_layers) <= index:
            uvs = {}
            count = 0
            uv_layers.append(uvs)
            counts.append(count)
        else:
            uvs = uv_layers[index]
            count = counts[index]

        uv_layer = layer.data

        for face_index, face in enumerate(get_faces(mesh)):

            for uv_index, uv in enumerate(uv_layer[face_index].uv):

                key = veckey2d(uv)
                if key not in uvs:
                    uvs[key] = count
                    count += 1

        counts[index] = count

    return counts

def generate_uvs(uv_layers, option_uv_coords):
    if not option_uv_coords:
        return "[]"

    layers = []
    for uvs in uv_layers:
        chunks = []
        for key, index in sorted(uvs.items(), key=operator.itemgetter(1)):
            chunks.append(key)
        layer = ",".join(generate_uv(n) for n in chunks)
        layers.append(layer)

    return ",".join("[%s]" % n for n in layers)

# ##############################################################################
# Model exporter - armature
# (only the first armature will exported)
# ##############################################################################
def get_armature():
    if len(bpy.data.armatures) == 0:
        print("Warning: no armatures in the scene")
        return None, None

    armature = bpy.data.armatures[0]

    # Someone please figure out a proper way to get the armature node
    for object in bpy.data.objects:
        if object.type == 'ARMATURE':
            return armature, object

    print("Warning: no node of type 'ARMATURE' in the scene")
    return None, None

# ##############################################################################
# Model exporter - bones
# (only the first armature will exported)
# ##############################################################################

def generate_bones(meshes, option_bones, flipyz):

    if not option_bones:
        return "", 0

    armature, armature_object = get_armature()
    if armature_object is None:
        return "", 0

    hierarchy = []
    armature_matrix = armature_object.matrix_world
    pose_bones = armature_object.pose.bones
    #pose_bones = armature.bones

    TEMPLATE_BONE = '{"parent":%d,"name":"%s","pos":[%g,%g,%g],"rotq":[%g,%g,%g,%g],"scl":[%g,%g,%g]}'

    for pose_bone in pose_bones:
        armature_bone = pose_bone.bone
        #armature_bone = pose_bone
        bonePos = armature_matrix * armature_bone.head_local
        boneIndex = None

        if armature_bone.parent is None:
            bone_matrix = armature_matrix * armature_bone.matrix_local
            bone_index = -1
        else:
            parent_matrix = armature_matrix * armature_bone.parent.matrix_local
            bone_matrix = armature_matrix * armature_bone.matrix_local
            bone_matrix = parent_matrix.inverted() * bone_matrix

            bone_index = i = 0
            for pose_parent in pose_bones:
                armature_parent = pose_parent.bone
                #armature_parent = pose_parent
                if armature_parent.name == armature_bone.parent.name:
                    bone_index = i
                i += 1

        pos, rot, scl = bone_matrix.decompose()

        if flipyz:
            joint = TEMPLATE_BONE % (bone_index, armature_bone.name, pos.x, pos.z, -pos.y, rot.x, rot.z, -rot.y, rot.w, scl.x, scl.z, scl.y)
            hierarchy.append(joint)
        else:
            joint = TEMPLATE_BONE % (bone_index, armature_bone.name, pos.x, pos.y,  pos.z, rot.x, rot.y,  rot.z, rot.w, scl.x, scl.y, scl.z)
            hierarchy.append(joint)

    bones_string = ",".join(hierarchy)
    
    return bones_string, len(pose_bones)


# ##############################################################################
# Model exporter - skin indices and weights
# ##############################################################################

def generate_indices_and_weights(meshes, option_skinning):

    if not option_skinning or len(bpy.data.armatures) == 0:
        return "", ""

    indices = []
    weights = []

    armature, armature_object = get_armature()

    for mesh, object in meshes:

        i = 0
        mesh_index = -1

        # find the original object

        for obj in bpy.data.objects:
            if obj.name == mesh.name or obj == object:
                mesh_index = i
            i += 1

        if mesh_index == -1:
            print("generate_indices: couldn't find object for mesh", mesh.name)
            continue

        object = bpy.data.objects[mesh_index]

        for vertex in mesh.vertices:

            # sort bones by influence

            bone_array = []

            for group in vertex.groups:
                index = group.group
                weight = group.weight

                bone_array.append( (index, weight) )
                
            bone_array.sort(key = operator.itemgetter(1), reverse=True)
            
            # select first N bones

            for i in range(MAX_INFLUENCES):

                if i < len(bone_array):
                    bone_proxy = bone_array[i]
                    
                    found = 0
                    index = bone_proxy[0]
                    weight = bone_proxy[1]

                    for j, bone in enumerate(armature_object.pose.bones):
                        if object.vertex_groups[index].name == bone.name:
                            indices.append('%d' % j)
                            weights.append('%g' % weight)
                            found = 1
                            break

                    if found != 1:
                        indices.append('0')
                        weights.append('0')

                else:
                    indices.append('0')
                    weights.append('0')
    
    
    indices_string = ",".join(indices)
    weights_string = ",".join(weights)

    return indices_string, weights_string


# ##############################################################################
# Model exporter - skeletal animation
# (only the first action will exported)
# ##############################################################################

def generate_animation(option_animation_skeletal, option_frame_step, flipyz, option_frame_index_as_time, index):

    if not option_animation_skeletal or len(bpy.data.actions) == 0:
        return ""

    # TODO: Add scaling influences

    action = bpy.data.actions[index]
    
    # get current context and then switch to dopesheet temporarily
    
    current_context = bpy.context.area.type
    
    bpy.context.area.type = "DOPESHEET_EDITOR"
    bpy.context.space_data.mode = "ACTION"    
    
    # set active action
    bpy.context.area.spaces.active.action = action
    
    armature, armature_object = get_armature()
    if armature_object is None or armature is None:
        return "", 0
        
    #armature_object = bpy.data.objects['marine_rig']
    
        
    armature_matrix = armature_object.matrix_world

    fps = bpy.data.scenes[0].render.fps

    end_frame = action.frame_range[1]
    start_frame = action.frame_range[0]

    frame_length = end_frame - start_frame

    used_frames = int(frame_length / option_frame_step) + 1

    TEMPLATE_KEYFRAME_FULL  = '{"time":%g,"pos":[%g,%g,%g],"rot":[%g,%g,%g,%g],"scl":[%g,%g,%g]}'
    TEMPLATE_KEYFRAME_BEGIN = '{"time":%g'
    TEMPLATE_KEYFRAME_END   = '}'
    TEMPLATE_KEYFRAME_POS   = ',"pos":[%g,%g,%g]'
    TEMPLATE_KEYFRAME_ROT   = ',"rot":[%g,%g,%g,%g]'
    TEMPLATE_KEYFRAME_SCL   = ',"scl":[%g,%g,%g]'

    keys = []
    channels_location = []
    channels_rotation = []
    channels_scale = []
    
    # Precompute per-bone data
    for pose_bone in armature_object.pose.bones:
        armature_bone = pose_bone.bone
        keys.append([])
        channels_location.append(  find_channels(action, armature_bone, "location"))
        channels_rotation.append(  find_channels(action, armature_bone, "rotation_quaternion"))
        channels_rotation.append(  find_channels(action, armature_bone, "rotation_euler"))
        channels_scale.append(     find_channels(action, armature_bone, "scale"))

    # Process all frames
    for frame_i in range(0, used_frames):

        #print("Processing frame %d/%d" % (frame_i, used_frames))
        # Compute the index of the current frame (snap the last index to the end)
        frame = start_frame + frame_i * option_frame_step
        if frame_i == used_frames-1:
            frame = end_frame

        # Compute the time of the frame
        if option_frame_index_as_time:
            time = frame - start_frame
        else:
            time = (frame - start_frame) / fps

        # Let blender compute the pose bone transformations
        bpy.data.scenes[0].frame_set(frame)

        # Process all bones for the current frame
        bone_index = 0
        for pose_bone in armature_object.pose.bones:

            # Extract the bone transformations
            if pose_bone.parent is None:
                bone_matrix = armature_matrix * pose_bone.matrix
            else:
                parent_matrix = armature_matrix * pose_bone.parent.matrix
                bone_matrix = armature_matrix * pose_bone.matrix
                bone_matrix = parent_matrix.inverted() * bone_matrix
            pos, rot, scl = bone_matrix.decompose()

            pchange = True or has_keyframe_at(channels_location[bone_index], frame)
            rchange = True or has_keyframe_at(channels_rotation[bone_index], frame)
            schange = True or has_keyframe_at(channels_scale[bone_index], frame)

            if flipyz:
                px, py, pz = pos.x, pos.z, -pos.y
                rx, ry, rz, rw = rot.x, rot.z, -rot.y, rot.w
                sx, sy, sz = scl.x, scl.z, scl.y
            else:
                px, py, pz = pos.x, pos.y, pos.z
                rx, ry, rz, rw = rot.x, rot.y, rot.z, rot.w
                sx, sy, sz = scl.x, scl.y, scl.z

            # START-FRAME: needs pos, rot and scl attributes (required frame)

            if frame == start_frame:

                keyframe = TEMPLATE_KEYFRAME_FULL % (time, px, py, pz, rx, ry, rz, rw, sx, sy, sz)
                keys[bone_index].append(keyframe)

            # END-FRAME: needs pos, rot and scl attributes with animation length (required frame)

            elif frame == end_frame:

                keyframe = TEMPLATE_KEYFRAME_FULL % (time, px, py, pz, rx, ry, rz, rw, sx, sy, sz)
                keys[bone_index].append(keyframe)

            # MIDDLE-FRAME: needs only one of the attributes, can be an empty frame (optional frame)

            elif pchange == True or rchange == True:

                keyframe = TEMPLATE_KEYFRAME_BEGIN % time
                if pchange == True:
                    keyframe = keyframe + TEMPLATE_KEYFRAME_POS % (px, py, pz)
                if rchange == True:
                    keyframe = keyframe + TEMPLATE_KEYFRAME_ROT % (rx, ry, rz, rw)
                if schange == True:
                    keyframe = keyframe + TEMPLATE_KEYFRAME_SCL % (sx, sy, sz)
                keyframe = keyframe + TEMPLATE_KEYFRAME_END

                keys[bone_index].append(keyframe)
            bone_index += 1

    # Gather data
    parents = []
    bone_index = 0
    for pose_bone in armature_object.pose.bones:
        keys_string = ",".join(keys[bone_index])
        parent_index = bone_index - 1 # WTF? Also, this property is not used by three.js
        parent = '{"parent":%d,"keys":[%s]}' % (parent_index, keys_string)
        bone_index += 1
        parents.append(parent)
    hierarchy_string = ",".join(parents)

    if option_frame_index_as_time:
        length = frame_length
    else:
        length = frame_length / fps

    animation_string = '"name":"%s","fps":%d,"length":%g,"hierarchy":[%s]' % (action.name, fps, length, hierarchy_string)

    bpy.data.scenes[0].frame_set(start_frame)

    # reset context
    
    bpy.context.area.type = current_context
    
    return animation_string

def find_channels(action, bone, channel_type):
    bone_name = bone.name
    ngroups = len(action.groups)
    result = []

    # Variant 1: channels grouped by bone names
    if ngroups > 0:

        # Find the channel group for the given bone
        group_index = -1
        for i in range(ngroups):
            if action.groups[i].name == bone_name:
                group_index = i

        # Get all desired channels in that group
        if group_index > -1:
            for channel in action.groups[group_index].channels:
                if channel_type in channel.data_path:
                    result.append(channel)

    # Variant 2: no channel groups, bone names included in channel names
    else:

        bone_label = '"%s"' % bone_name

        for channel in action.fcurves:
            data_path = channel.data_path
            if bone_label in data_path and channel_type in data_path:
                result.append(channel)

    return result

def find_keyframe_at(channel, frame):
    for keyframe in channel.keyframe_points:
        if keyframe.co[0] == frame:
            return keyframe
    return None

def has_keyframe_at(channels, frame):
    for channel in channels:
        if not find_keyframe_at(channel, frame) is None:
            return True
    return False

def generate_all_animations(option_animation_skeletal, option_frame_step, flipyz, option_frame_index_as_time):
    all_animations_string = ""
    if option_animation_skeletal:
        for index in range(0, len(bpy.data.actions)):
            if index != 0 :
                all_animations_string += ", \n"
            all_animations_string += "{" + generate_animation(option_animation_skeletal, option_frame_step, flipyz, option_frame_index_as_time,index) + "}"
    return all_animations_string

def handle_position_channel(channel, frame, position):

    change = False

    if channel.array_index in [0, 1, 2]:
        for keyframe in channel.keyframe_points:
            if keyframe.co[0] == frame:
                change = True

        value = channel.evaluate(frame)

        if channel.array_index == 0:
            position.x = value

        if channel.array_index == 1:
            position.y = value

        if channel.array_index == 2:
            position.z = value

    return change

def position(bone, frame, action, armatureMatrix):

    position = mathutils.Vector((0,0,0))
    change = False

    ngroups = len(action.groups)

    if ngroups > 0:

        index = 0

        for i in range(ngroups):
            if action.groups[i].name == bone.name:
                index = i

        for channel in action.groups[index].channels:
            if "location" in channel.data_path:
                hasChanged = handle_position_channel(channel, frame, position)
                change = change or hasChanged

    else:

        bone_label = '"%s"' % bone.name

        for channel in action.fcurves:
            data_path = channel.data_path
            if bone_label in data_path and "location" in data_path:
                hasChanged = handle_position_channel(channel, frame, position)
                change = change or hasChanged

    position = position * bone.matrix_local.inverted()

    if bone.parent == None:

        position.x += bone.head.x
        position.y += bone.head.y
        position.z += bone.head.z

    else:

        parent = bone.parent

        parentInvertedLocalMatrix = parent.matrix_local.inverted()
        parentHeadTailDiff = parent.tail_local - parent.head_local

        position.x += (bone.head * parentInvertedLocalMatrix).x + parentHeadTailDiff.x
        position.y += (bone.head * parentInvertedLocalMatrix).y + parentHeadTailDiff.y
        position.z += (bone.head * parentInvertedLocalMatrix).z + parentHeadTailDiff.z

    return armatureMatrix*position, change

def handle_rotation_channel(channel, frame, rotation):

    change = False

    if channel.array_index in [0, 1, 2, 3]:

        for keyframe in channel.keyframe_points:
            if keyframe.co[0] == frame:
                change = True

        value = channel.evaluate(frame)

        if channel.array_index == 1:
            rotation.x = value

        elif channel.array_index == 2:
            rotation.y = value

        elif channel.array_index == 3:
            rotation.z = value

        elif channel.array_index == 0:
            rotation.w = value

    return change

def rotation(bone, frame, action, armatureMatrix):

    # TODO: calculate rotation also from rotation_euler channels

    rotation = mathutils.Vector((0,0,0,1))

    change = False

    ngroups = len(action.groups)

    # animation grouped by bones

    if ngroups > 0:

        index = -1

        for i in range(ngroups):
            if action.groups[i].name == bone.name:
                index = i

        if index > -1:
            for channel in action.groups[index].channels:
                if "quaternion" in channel.data_path:
                    hasChanged = handle_rotation_channel(channel, frame, rotation)
                    change = change or hasChanged

    # animation in raw fcurves

    else:

        bone_label = '"%s"' % bone.name

        for channel in action.fcurves:
            data_path = channel.data_path
            if bone_label in data_path and "quaternion" in data_path:
                hasChanged = handle_rotation_channel(channel, frame, rotation)
                change = change or hasChanged

    rot3 = rotation.to_3d()
    rotation.xyz = rot3 * bone.matrix_local.inverted()
    rotation.xyz = armatureMatrix * rotation.xyz

    return rotation, change

# #####################################################
# Model exporter - materials
# #####################################################

def generate_color(i):
    """Generate hex color corresponding to integer.

    Colors should have well defined ordering.
    First N colors are hardcoded, then colors are random
    (must seed random number  generator with deterministic value
    before getting colors).
    """

    if i < len(COLORS):
        #return "0x%06x" % COLORS[i]
        return COLORS[i]
    else:
        #return "0x%06x" % int(0xffffff * random.random())
        return int(0xffffff * random.random())

def generate_mtl(materials):
    """Generate dummy materials.
    """

    mtl = {}
    for m in materials:
        index = materials[m]
        mtl[m] = {
            "DbgName": m,
            "DbgIndex": index,
            "DbgColor": generate_color(index),
            "vertexColors" : False
        }
    return mtl

def value2string(v):
    if type(v) == str and v[0:2] != "0x":
        return '"%s"' % v
    elif type(v) == bool:
        return str(v).lower()
    elif type(v) == list:
        return "[%s]" % (", ".join(value2string(x) for x in v))
    return str(v)

def generate_materials(mtl, materials, draw_type):
    """Generate JS array of materials objects
    """

    mtl_array = []
    for m in mtl:
        index = materials[m]

        # add debug information
        #  materials should be sorted according to how
        #  they appeared in OBJ file (for the first time)
        #  this index is identifier used in face definitions
        mtl[m]['DbgName'] = m
        mtl[m]['DbgIndex'] = index
        mtl[m]['DbgColor'] = generate_color(index)

        if draw_type in [ "BOUNDS", "WIRE" ]:
            mtl[m]['wireframe'] = True
            mtl[m]['DbgColor'] = 0xff0000

        mtl_raw = ",\n".join(['\t\t"%s" : %s' % (n, value2string(v)) for n,v in sorted(mtl[m].items())])
        mtl_string = "\t{\n%s\n\t}" % mtl_raw
        mtl_array.append([index, mtl_string])

    return ",\n\n".join([m for i,m in sorted(mtl_array)]), len(mtl_array)

def extract_materials(mesh, scene, option_colors, option_copy_textures, filepath):
    world = scene.world

    materials = {}
    for m in mesh.materials:
        if m:
            materials[m.name] = {}
            material = materials[m.name]

            material['colorDiffuse'] = [m.diffuse_intensity * m.diffuse_color[0],
                                        m.diffuse_intensity * m.diffuse_color[1],
                                        m.diffuse_intensity * m.diffuse_color[2]]

            material['colorSpecular'] = [m.specular_intensity * m.specular_color[0],
                                         m.specular_intensity * m.specular_color[1],
                                         m.specular_intensity * m.specular_color[2]]

            material['colorAmbient'] = [m.ambient * material['colorDiffuse'][0],
                                        m.ambient * material['colorDiffuse'][1],
                                        m.ambient * material['colorDiffuse'][2]]

            material['colorEmissive'] = [m.emit * material['colorDiffuse'][0],
                                         m.emit * material['colorDiffuse'][1],
                                         m.emit * material['colorDiffuse'][2]]

            material['transparency'] = m.alpha

            # not sure about mapping values to Blinn-Phong shader
            # Blender uses INT from [1, 511] with default 0
            # http://www.blender.org/documentation/blender_python_api_2_54_0/bpy.types.Material.html#bpy.types.Material.specular_hardness

            material["specularCoef"] = m.specular_hardness

            textures = guess_material_textures(m)

            handle_texture('diffuse', textures, material, filepath, option_copy_textures)
            handle_texture('light', textures, material, filepath, option_copy_textures)
            handle_texture('normal', textures, material, filepath, option_copy_textures)
            handle_texture('specular', textures, material, filepath, option_copy_textures)
            handle_texture('bump', textures, material, filepath, option_copy_textures)

            material["vertexColors"] = m.THREE_useVertexColors and option_colors

            # can't really use this reliably to tell apart Phong from Lambert
            # as Blender defaults to non-zero specular color
            #if m.specular_intensity > 0.0 and (m.specular_color[0] > 0 or m.specular_color[1] > 0 or m.specular_color[2] > 0):
            #    material['shading'] = "Phong"
            #else:
            #    material['shading'] = "Lambert"

            if textures['normal']:
                material['shading'] = "Phong"
            else:
                material['shading'] = m.THREE_materialType

            material['blending'] = m.THREE_blendingType
            material['depthWrite'] = m.THREE_depthWrite
            material['depthTest'] = m.THREE_depthTest
            material['transparent'] = m.use_transparency

    return materials

def generate_materials_string(mesh, scene, option_colors, draw_type, option_copy_textures, filepath, offset):

    random.seed(42) # to get well defined color order for debug materials

    materials = {}
    if mesh.materials:
        for i, m in enumerate(mesh.materials):
            mat_id = i + offset
            if m:
                materials[m.name] = mat_id
            else:
                materials["undefined_dummy_%0d" % mat_id] = mat_id


    if not materials:
        materials = { 'default': 0 }

    # default dummy materials

    mtl = generate_mtl(materials)

    # extract real materials from the mesh

    mtl.update(extract_materials(mesh, scene, option_colors, option_copy_textures, filepath))

    return generate_materials(mtl, materials, draw_type)

def handle_texture(id, textures, material, filepath, option_copy_textures):

    if textures[id] and textures[id]['texture'].users > 0 and len(textures[id]['texture'].users_material) > 0:
        texName     = 'map%s'       % id.capitalize()
        repeatName  = 'map%sRepeat' % id.capitalize()
        wrapName    = 'map%sWrap'   % id.capitalize()

        slot = textures[id]['slot']
        texture = textures[id]['texture']
        image = texture.image
        fname = extract_texture_filename(image)
        material[texName] = fname

        if option_copy_textures:
            save_image(image, fname, filepath)

        if texture.repeat_x != 1 or texture.repeat_y != 1:
            material[repeatName] = [texture.repeat_x, texture.repeat_y]

        if texture.extension == "REPEAT":
            wrap_x = "repeat"
            wrap_y = "repeat"

            if texture.use_mirror_x:
                wrap_x = "mirror"
            if texture.use_mirror_y:
                wrap_y = "mirror"

            material[wrapName] = [wrap_x, wrap_y]

        if slot.use_map_normal:
            if slot.normal_factor != 1.0:
                if id == "bump":
                    material['mapBumpScale'] = slot.normal_factor
                else:
                    material['mapNormalFactor'] = slot.normal_factor


# #####################################################
# ASCII model generator
# #####################################################

def generate_ascii_model(meshes, morphs,
                         scene,
                         option_vertices,
                         option_vertices_truncate,
                         option_faces,
                         option_normals,
                         option_uv_coords,
                         option_materials,
                         option_colors,
                         option_bones,
                         option_skinning,
                         align_model,
                         flipyz,
                         option_scale,
                         option_copy_textures,
                         filepath,
                         option_animation_morph,
                         option_animation_skeletal,
                         option_frame_index_as_time,
                         option_frame_step):

    vertices = []

    vertex_offset = 0
    vertex_offsets = []

    nnormal = 0
    normals = {}

    ncolor = 0
    colors = {}

    nuvs = []
    uv_layers = []

    nmaterial = 0
    materials = []

    for mesh, object in meshes:

        vertexUV = len(mesh.uv_textures) > 0
        vertexColors = len(mesh.vertex_colors) > 0

        mesh_extract_colors = option_colors and vertexColors
        mesh_extract_uvs = option_uv_coords and vertexUV

        if vertexUV:
            active_uv_layer = mesh.uv_textures.active
            if not active_uv_layer:
                mesh_extract_uvs = False

        if vertexColors:
            active_col_layer = mesh.vertex_colors.active
            if not active_col_layer:
                mesh_extract_colors = False

        vertex_offsets.append(vertex_offset)
        vertex_offset += len(vertices)

        vertices.extend(mesh.vertices[:])

        if option_normals:
            nnormal = extract_vertex_normals(mesh, normals, nnormal)

        if mesh_extract_colors:
            ncolor = extract_vertex_colors(mesh, colors, ncolor)

        if mesh_extract_uvs:
            nuvs = extract_uvs(mesh, uv_layers, nuvs)

        if option_materials:
            mesh_materials, nmaterial = generate_materials_string(mesh, scene, mesh_extract_colors, object.draw_type, option_copy_textures, filepath, nmaterial)
            materials.append(mesh_materials)


    morphTargets_string = ""
    nmorphTarget = 0

    if option_animation_morph:
        chunks = []
        for i, morphVertices in enumerate(morphs):
            morphTarget = '{ "name": "%s_%06d", "vertices": [%s] }' % ("animation", i, morphVertices)
            chunks.append(morphTarget)

        morphTargets_string = ",\n\t".join(chunks)
        nmorphTarget = len(morphs)

    if align_model == 1:
        center(vertices)
    elif align_model == 2:
        bottom(vertices)
    elif align_model == 3:
        top(vertices)

    faces_string, nfaces = generate_faces(normals, uv_layers, colors, meshes, option_normals, option_colors, option_uv_coords, option_materials, option_faces)

    bones_string, nbone = generate_bones(meshes, option_bones, flipyz)
    indices_string, weights_string = generate_indices_and_weights(meshes, option_skinning)

    materials_string = ",\n\n".join(materials)

    model_string = TEMPLATE_MODEL_ASCII % {
    "scale" : option_scale,

    "uvs"       : generate_uvs(uv_layers, option_uv_coords),
    "normals"   : generate_normals(normals, option_normals),
    "colors"    : generate_vertex_colors(colors, option_colors),

    "materials" : materials_string,

    "vertices" : generate_vertices(vertices, option_vertices_truncate, option_vertices),

    "faces"    : faces_string,

    "morphTargets" : morphTargets_string,

    "bones"     : bones_string,
    "indices"   : indices_string,
    "weights"   : weights_string,
    "animations" : generate_all_animations(option_animation_skeletal, option_frame_step, flipyz, option_frame_index_as_time)
    }

    text = TEMPLATE_FILE_ASCII % {
    "nvertex"   : len(vertices),
    "nface"     : nfaces,
    "nuvs"      : ",".join("%d" % n for n in nuvs),
    "nnormal"   : nnormal,
    "ncolor"    : ncolor,
    "nmaterial" : nmaterial,
    "nmorphTarget": nmorphTarget,
    "nbone"     : nbone,

    "model"     : model_string
    }


    return text, model_string


# #####################################################
# Model exporter - export single mesh
# #####################################################

def extract_meshes(objects, scene, export_single_model, option_scale, flipyz):

    meshes = []

    for object in objects:

        if object.type == "MESH" and object.THREE_exportGeometry:

            # collapse modifiers into mesh

            mesh = object.to_mesh(scene, True, 'RENDER')

            if not mesh:
                raise Exception("Error, could not get mesh data from object [%s]" % object.name)

            # preserve original name

            mesh.name = object.name

            if export_single_model:

                if flipyz:

                    # that's what Blender's native export_obj.py does to flip YZ

                    X_ROT = mathutils.Matrix.Rotation(-math.pi/2, 4, 'X')
                    mesh.transform(X_ROT * object.matrix_world)

                else:
                    mesh.transform(object.matrix_world)
                    
                    
            mesh.update(calc_tessface=True)

            mesh.calc_normals()
            mesh.calc_tessface()
            mesh.transform(mathutils.Matrix.Scale(option_scale, 4))
            meshes.append([mesh, object])

    return meshes

def generate_mesh_string(objects, scene,
                option_vertices,
                option_vertices_truncate,
                option_faces,
                option_normals,
                option_uv_coords,
                option_materials,
                option_colors,
                option_bones,
                option_skinning,
                align_model,
                flipyz,
                option_scale,
                export_single_model,
                option_copy_textures,
                filepath,
                option_animation_morph,
                option_animation_skeletal,
                option_frame_index_as_time,
                option_frame_step):

    meshes = extract_meshes(objects, scene, export_single_model, option_scale, flipyz)

    morphs = []

    if option_animation_morph:

        original_frame = scene.frame_current # save animation state

        scene_frames = range(scene.frame_start, scene.frame_end + 1, option_frame_step)

        for index, frame in enumerate(scene_frames):
            scene.frame_set(frame, 0.0)

            anim_meshes = extract_meshes(objects, scene, export_single_model, option_scale, flipyz)

            frame_vertices = []

            for mesh, object in anim_meshes:
                frame_vertices.extend(mesh.vertices[:])

            if index == 0:
                if align_model == 1:
                    offset = center(frame_vertices)
                elif align_model == 2:
                    offset = bottom(frame_vertices)
                elif align_model == 3:
                    offset = top(frame_vertices)
                else:
                    offset = False
            else:
                if offset:
                    translate(frame_vertices, offset)

            morphVertices = generate_vertices(frame_vertices, option_vertices_truncate, option_vertices)
            morphs.append(morphVertices)

            # remove temp meshes

            for mesh, object in anim_meshes:
                bpy.data.meshes.remove(mesh)

        scene.frame_set(original_frame, 0.0) # restore animation state


    text, model_string = generate_ascii_model(meshes, morphs,
                                scene,
                                option_vertices,
                                option_vertices_truncate,
                                option_faces,
                                option_normals,
                                option_uv_coords,
                                option_materials,
                                option_colors,
                                option_bones,
                                option_skinning,
                                align_model,
                                flipyz,
                                option_scale,
                                option_copy_textures,
                                filepath,
                                option_animation_morph,
                                option_animation_skeletal,
                                option_frame_index_as_time,
                                option_frame_step)

    # remove temp meshes

    for mesh, object in meshes:
        bpy.data.meshes.remove(mesh)

    return text, model_string

def export_mesh(objects,
                scene, filepath,
                option_vertices,
                option_vertices_truncate,
                option_faces,
                option_normals,
                option_uv_coords,
                option_materials,
                option_colors,
                option_bones,
                option_skinning,
                align_model,
                flipyz,
                option_scale,
                export_single_model,
                option_copy_textures,
                option_animation_morph,
                option_animation_skeletal,
                option_frame_step,
                option_frame_index_as_time):

    """Export single mesh"""

    text, model_string = generate_mesh_string(objects,
                scene,
                option_vertices,
                option_vertices_truncate,
                option_faces,
                option_normals,
                option_uv_coords,
                option_materials,
                option_colors,
                option_bones,
                option_skinning,
                align_model,
                flipyz,
                option_scale,
                export_single_model,
                option_copy_textures,
                filepath,
                option_animation_morph,
                option_animation_skeletal,
                option_frame_index_as_time,
                option_frame_step)

    write_file(filepath, text)

    print("writing", filepath, "done")


# #####################################################
# Scene exporter - render elements
# #####################################################

def generate_quat(quat):
    return TEMPLATE_VEC4 % (quat.x, quat.y, quat.z, quat.w)

def generate_vec4(vec):
    return TEMPLATE_VEC4 % (vec[0], vec[1], vec[2], vec[3])

def generate_vec3(vec, flipyz = False):
    if flipyz:
        return TEMPLATE_VEC3 % (vec[0], vec[2], vec[1])
    return TEMPLATE_VEC3 % (vec[0], vec[1], vec[2])

def generate_vec2(vec):
    return TEMPLATE_VEC2 % (vec[0], vec[1])

def generate_hex(number):
    return TEMPLATE_HEX % number

def generate_string(s):
    return TEMPLATE_STRING % s

def generate_string_list(src_list):
    return ", ".join(generate_string(item) for item in src_list)

def generate_section(label, content):
    return TEMPLATE_SECTION % (label, content)

def get_mesh_filename(mesh):
    object_id = mesh["data"]["name"]
    filename = "%s.js" % sanitize(object_id)
    return filename

def generate_material_id_list(materials):
    chunks = []
    for material in materials:
        chunks.append(material.name)

    return chunks

def generate_group_id_list(obj):
    chunks = []

    for group in bpy.data.groups:
        if obj.name in group.objects:
            chunks.append(group.name)

    return chunks

def generate_bool_property(property):
    if property:
        return "true"
    return "false"

# #####################################################
# Scene exporter - objects
# #####################################################

def generate_objects(data):
    chunks = []

    for obj in data["objects"]:

        if obj.type == "MESH" and obj.THREE_exportGeometry:
            object_id = obj.name

            #if len(obj.modifiers) > 0:
            #    geo_name = obj.name
            #else:
            geo_name = obj.data.name

            geometry_id = "geo_%s" % geo_name

            material_ids = generate_material_id_list(obj.material_slots)
            group_ids = generate_group_id_list(obj)

            if data["flipyz"]:
                matrix_world = ROTATE_X_PI2 * obj.matrix_world
            else:
                matrix_world = obj.matrix_world

            position, quaternion, scale = matrix_world.decompose()
            rotation = quaternion.to_euler("ZYX")

            # use empty material string for multi-material objects
            # this will trigger use of MeshFaceMaterial in SceneLoader

            material_string = '""'
            if len(material_ids) == 1:
                material_string = generate_string_list(material_ids)

            group_string = ""
            if len(group_ids) > 0:
                group_string = generate_string_list(group_ids)

            castShadow = obj.THREE_castShadow
            receiveShadow = obj.THREE_receiveShadow
            doubleSided = obj.THREE_doubleSided

            visible = obj.THREE_visible

            geometry_string = generate_string(geometry_id)

            object_string = TEMPLATE_OBJECT % {
            "object_id"   : generate_string(object_id),
            "geometry_id" : geometry_string,
            "group_id"    : group_string,
            "material_id" : material_string,

            "position"    : generate_vec3(position),
            "rotation"    : generate_vec3(rotation),
            "quaternion"  : generate_quat(quaternion),
            "scale"       : generate_vec3(scale),

            "castShadow"  : generate_bool_property(castShadow),
            "receiveShadow"  : generate_bool_property(receiveShadow),
            "doubleSided"  : generate_bool_property(doubleSided),
            "visible"      : generate_bool_property(visible)
            }
            chunks.append(object_string)

        elif obj.type == "EMPTY" or (obj.type == "MESH" and not obj.THREE_exportGeometry):

            object_id = obj.name
            group_ids = generate_group_id_list(obj)

            if data["flipyz"]:
                matrix_world = ROTATE_X_PI2 * obj.matrix_world
            else:
                matrix_world = obj.matrix_world

            position, quaternion, scale = matrix_world.decompose()
            rotation = quaternion.to_euler("ZYX")

            group_string = ""
            if len(group_ids) > 0:
                group_string = generate_string_list(group_ids)

            object_string = TEMPLATE_EMPTY % {
            "object_id"   : generate_string(object_id),
            "group_id"    : group_string,

            "position"    : generate_vec3(position),
            "rotation"    : generate_vec3(rotation),
            "quaternion"  : generate_quat(quaternion),
            "scale"       : generate_vec3(scale)
            }
            chunks.append(object_string)

    return ",\n\n".join(chunks), len(chunks)

# #####################################################
# Scene exporter - geometries
# #####################################################

def generate_geometries(data):
    chunks = []

    geo_set = set()

    for obj in data["objects"]:
        if obj.type == "MESH" and obj.THREE_exportGeometry:

            #if len(obj.modifiers) > 0:
            #    name = obj.name
            #else:
            name = obj.data.name

            if name not in geo_set:

                geometry_id = "geo_%s" % name

                if data["embed_meshes"]:

                    embed_id = "emb_%s" % name

                    geometry_string = TEMPLATE_GEOMETRY_EMBED % {
                    "geometry_id" : generate_string(geometry_id),
                    "embed_id"  : generate_string(embed_id)
                    }

                else:

                    model_filename = os.path.basename(generate_mesh_filename(name, data["filepath"]))

                    geometry_string = TEMPLATE_GEOMETRY_LINK % {
                    "geometry_id" : generate_string(geometry_id),
                    "model_file"  : generate_string(model_filename)
                    }

                chunks.append(geometry_string)

                geo_set.add(name)

    return ",\n\n".join(chunks), len(chunks)

# #####################################################
# Scene exporter - textures
# #####################################################

def generate_textures_scene(data):
    chunks = []

    # TODO: extract just textures actually used by some objects in the scene

    for texture in bpy.data.textures:

        if texture.type == 'IMAGE' and texture.image and texture.users > 0 and len(texture.users_material) > 0:

            img = texture.image

            texture_id = img.name
            texture_file = extract_texture_filename(img)

            if data["copy_textures"]:
                save_image(img, texture_file, data["filepath"])

            extras = ""

            if texture.repeat_x != 1 or texture.repeat_y != 1:
                extras += ',\n        "repeat": [%g, %g]' % (texture.repeat_x, texture.repeat_y)

            if texture.extension == "REPEAT":
                wrap_x = "repeat"
                wrap_y = "repeat"

                if texture.use_mirror_x:
                    wrap_x = "mirror"
                if texture.use_mirror_y:
                    wrap_y = "mirror"

                extras += ',\n        "wrap": ["%s", "%s"]' % (wrap_x, wrap_y)

            texture_string = TEMPLATE_TEXTURE % {
            "texture_id"   : generate_string(texture_id),
            "texture_file" : generate_string(texture_file),
            "extras"       : extras
            }
            chunks.append(texture_string)

    return ",\n\n".join(chunks), len(chunks)

def extract_texture_filename(image):
    fn = bpy.path.abspath(image.filepath)
    fn = os.path.normpath(fn)
    fn_strip = os.path.basename(fn)
    return fn_strip

def save_image(img, name, fpath):
    dst_dir = os.path.dirname(fpath)
    dst_path = os.path.join(dst_dir, name)

    ensure_folder_exist(dst_dir)

    if img.packed_file:
        img.save_render(dst_path)

    else:
        src_path = bpy.path.abspath(img.filepath)
        shutil.copy(src_path, dst_dir)

# #####################################################
# Scene exporter - materials
# #####################################################

def extract_material_data(m, option_colors):
    world = bpy.context.scene.world

    material = { 'name': m.name }

    material['colorDiffuse'] = [m.diffuse_intensity * m.diffuse_color[0],
                                m.diffuse_intensity * m.diffuse_color[1],
                                m.diffuse_intensity * m.diffuse_color[2]]

    material['colorSpecular'] = [m.specular_intensity * m.specular_color[0],
                                 m.specular_intensity * m.specular_color[1],
                                 m.specular_intensity * m.specular_color[2]]

    material['colorAmbient'] = [m.ambient * material['colorDiffuse'][0],
                                m.ambient * material['colorDiffuse'][1],
                                m.ambient * material['colorDiffuse'][2]]

    material['colorEmissive'] = [m.emit * material['colorDiffuse'][0],
                                 m.emit * material['colorDiffuse'][1],
                                 m.emit * material['colorDiffuse'][2]]

    material['transparency'] = m.alpha

    # not sure about mapping values to Blinn-Phong shader
    # Blender uses INT from [1,511] with default 0
    # http://www.blender.org/documentation/blender_python_api_2_54_0/bpy.types.Material.html#bpy.types.Material.specular_hardness

    material["specularCoef"] = m.specular_hardness

    material["vertexColors"] = m.THREE_useVertexColors and option_colors

    material['mapDiffuse'] = ""
    material['mapLight'] = ""
    material['mapSpecular'] = ""
    material['mapNormal'] = ""
    material['mapBump'] = ""

    material['mapNormalFactor'] = 1.0
    material['mapBumpScale'] = 1.0

    textures = guess_material_textures(m)

    if textures['diffuse']:
        material['mapDiffuse'] = textures['diffuse']['texture'].image.name

    if textures['light']:
        material['mapLight'] = textures['light']['texture'].image.name

    if textures['specular']:
        material['mapSpecular'] = textures['specular']['texture'].image.name

    if textures['normal']:
        material['mapNormal'] = textures['normal']['texture'].image.name
        if textures['normal']['slot'].use_map_normal:
            material['mapNormalFactor'] = textures['normal']['slot'].normal_factor

    if textures['bump']:
        material['mapBump'] = textures['bump']['texture'].image.name
        if textures['bump']['slot'].use_map_normal:
            material['mapBumpScale'] = textures['bump']['slot'].normal_factor

    material['shading'] = m.THREE_materialType
    material['blending'] = m.THREE_blendingType
    material['depthWrite'] = m.THREE_depthWrite
    material['depthTest'] = m.THREE_depthTest
    material['transparent'] = m.use_transparency

    return material

def guess_material_textures(material):
    textures = {
        'diffuse' : None,
        'light'   : None,
        'normal'  : None,
        'specular': None,
        'bump'    : None
    }

    # just take first textures of each, for the moment three.js materials can't handle more
    # assume diffuse comes before lightmap, normalmap has checked flag

    for i in range(len(material.texture_slots)):
        slot = material.texture_slots[i]
        if slot:
            texture = slot.texture
            if slot.use and texture and texture.type == 'IMAGE':

                # normal map in Blender UI: textures => image sampling => normal map

                if texture.use_normal_map:
                    textures['normal'] = { "texture": texture, "slot": slot }

                # bump map in Blender UI: textures => influence => geometry => normal

                elif slot.use_map_normal:
                    textures['bump'] = { "texture": texture, "slot": slot }

                elif slot.use_map_specular or slot.use_map_hardness:
                    textures['specular'] = { "texture": texture, "slot": slot }

                else:
                    if not textures['diffuse'] and not slot.blend_type == 'MULTIPLY':
                        textures['diffuse'] = { "texture": texture, "slot": slot }

                    else:
                        textures['light'] = { "texture": texture, "slot": slot }

                if textures['diffuse'] and textures['normal'] and textures['light'] and textures['specular'] and textures['bump']:
                    break

    return textures

def generate_material_string(material):

    material_id = material["name"]

    # default to Lambert

    shading = material.get("shading", "Lambert")

    # normal and bump mapped materials must use Phong
    # to get all required parameters for normal shader

    if material['mapNormal'] or material['mapBump']:
        shading = "Phong"

    type_map = {
    "Lambert"   : "MeshLambertMaterial",
    "Phong"     : "MeshPhongMaterial"
    }

    material_type = type_map.get(shading, "MeshBasicMaterial")

    parameters = '"color": %d' % rgb2int(material["colorDiffuse"])
    parameters += ', "ambient": %d' % rgb2int(material["colorDiffuse"])
    parameters += ', "emissive": %d' % rgb2int(material["colorEmissive"])
    parameters += ', "opacity": %.2g' % material["transparency"]

    if shading == "Phong":
        parameters += ', "ambient": %d' % rgb2int(material["colorAmbient"])
        parameters += ', "emissive": %d' % rgb2int(material["colorEmissive"])
        parameters += ', "specular": %d' % rgb2int(material["colorSpecular"])
        parameters += ', "shininess": %.1g' % material["specularCoef"]

    colorMap = material['mapDiffuse']
    lightMap = material['mapLight']
    specularMap = material['mapSpecular']
    normalMap = material['mapNormal']
    bumpMap = material['mapBump']
    normalMapFactor = material['mapNormalFactor']
    bumpMapScale = material['mapBumpScale']

    if colorMap:
        parameters += ', "map": %s' % generate_string(colorMap)
    if lightMap:
        parameters += ', "lightMap": %s' % generate_string(lightMap)
    if specularMap:
        parameters += ', "specularMap": %s' % generate_string(specularMap)
    if normalMap:
        parameters += ', "normalMap": %s' % generate_string(normalMap)
    if bumpMap:
        parameters += ', "bumpMap": %s' % generate_string(bumpMap)

    if normalMapFactor != 1.0:
        parameters += ', "normalMapFactor": %g' % normalMapFactor

    if bumpMapScale != 1.0:
        parameters += ', "bumpMapScale": %g' % bumpMapScale

    if material['vertexColors']:
        parameters += ', "vertexColors": "vertex"'

    if material['transparent']:
        parameters += ', "transparent": true'

    parameters += ', "blending": "%s"' % material['blending']

    if not material['depthWrite']:
        parameters += ', "depthWrite": false'

    if not material['depthTest']:
        parameters += ', "depthTest": false'


    material_string = TEMPLATE_MATERIAL_SCENE % {
    "material_id" : generate_string(material_id),
    "type"        : generate_string(material_type),
    "parameters"  : parameters
    }

    return material_string

def generate_materials_scene(data):
    chunks = []

    def material_is_used(mat):
        minimum_users = 1
        if mat.use_fake_user:
            minimum_users = 2 #we must ignore the "fake user" in this case
        return mat.users >= minimum_users
    
    used_materials = [m for m in bpy.data.materials if material_is_used(m)]

    for m in used_materials:
        material = extract_material_data(m, data["use_colors"])
        material_string = generate_material_string(material)
        chunks.append(material_string)

    return ",\n\n".join(chunks), len(chunks)

# #####################################################
# Scene exporter - cameras
# #####################################################

def generate_cameras(data):
    chunks = []

    if data["use_cameras"]:

        cams = bpy.data.objects
        cams = [ob for ob in cams if (ob.type == 'CAMERA')]

        if not cams:
            camera = DEFAULTS["camera"]

            if camera["type"] == "PerspectiveCamera":

                camera_string = TEMPLATE_CAMERA_PERSPECTIVE % {
                "camera_id" : generate_string(camera["name"]),
                "fov"       : camera["fov"],
                "aspect"    : camera["aspect"],
                "near"      : camera["near"],
                "far"       : camera["far"],
                "position"  : generate_vec3(camera["position"]),
                "target"    : generate_vec3(camera["target"])
                }

            elif camera["type"] == "OrthographicCamera":

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

        else:

            for cameraobj in cams:
                camera = bpy.data.cameras[cameraobj.data.name]

                if camera.id_data.type == "PERSP":

                    camera_string = TEMPLATE_CAMERA_PERSPECTIVE % {
                    "camera_id" : generate_string(cameraobj.name),
                    "fov"       : (camera.angle / 3.14) * 180.0,
                    "aspect"    : 1.333,
                    "near"      : camera.clip_start,
                    "far"       : camera.clip_end,
                    "position"  : generate_vec3([cameraobj.location[0], -cameraobj.location[1], cameraobj.location[2]], data["flipyz"]),
                    "target"    : generate_vec3([0, 0, 0])
                    }

                elif camera.id_data.type == "ORTHO":

                    camera_string = TEMPLATE_CAMERA_ORTHO % {
                    "camera_id" : generate_string(camera.name),
                    "left"      : -(camera.angle_x * camera.ortho_scale),
                    "right"     : (camera.angle_x * camera.ortho_scale),
                    "top"       : (camera.angle_y * camera.ortho_scale),
                    "bottom"    : -(camera.angle_y * camera.ortho_scale),
                    "near"      : camera.clip_start,
                    "far"       : camera.clip_end,
                    "position"  : generate_vec3([cameraobj.location[0], -cameraobj.location[1], cameraobj.location[2]], data["flipyz"]),
                    "target"    : generate_vec3([0, 0, 0])
                    }
                    
                chunks.append(camera_string)

    return ",\n\n".join(chunks), len(chunks)

# #####################################################
# Scene exporter - lights
# #####################################################

def generate_lights(data):
    chunks = []

    if data["use_lights"]:
        lamps = data["objects"]
        lamps = [ob for ob in lamps if (ob.type == 'LAMP')]

        for lamp in lamps:
            light_string = ""
            concrete_lamp = lamp.data

            if concrete_lamp.type == "POINT":
                light_string = TEMPLATE_LIGHT_POINT % {
                    "light_id"      : generate_string(concrete_lamp.name),
                    "position"      : generate_vec3(lamp.location, data["flipyz"]),
                    "rotation"      : generate_vec3(lamp.rotation_euler, data["flipyz"]),
                    "color"         : rgb2int(concrete_lamp.color),
                    "distance"      : concrete_lamp.distance,
                    "intensity"        : concrete_lamp.energy
                }
            elif concrete_lamp.type == "SUN":
                light_string = TEMPLATE_LIGHT_SUN % {
                    "light_id"      : generate_string(concrete_lamp.name),
                    "position"      : generate_vec3(lamp.location, data["flipyz"]),
                    "rotation"      : generate_vec3(lamp.rotation_euler, data["flipyz"]),
                    "color"         : rgb2int(concrete_lamp.color),
                    "distance"      : concrete_lamp.distance,
                    "intensity"        : concrete_lamp.energy
                }
            elif concrete_lamp.type == "SPOT":
                light_string = TEMPLATE_LIGHT_SPOT % {
                    "light_id"      : generate_string(concrete_lamp.name),
                    "position"      : generate_vec3(lamp.location, data["flipyz"]),
                    "rotation"      : generate_vec3(lamp.rotation_euler, data["flipyz"]),
                    "color"         : rgb2int(concrete_lamp.color),
                    "distance"      : concrete_lamp.distance,
                    "intensity"        : concrete_lamp.energy,
                    "use_shadow"    : concrete_lamp.use_shadow,
                    "angle"         : concrete_lamp.spot_size
                }
            elif concrete_lamp.type == "HEMI":
                light_string = TEMPLATE_LIGHT_HEMI % {
                    "light_id"      : generate_string(concrete_lamp.name),
                    "position"      : generate_vec3(lamp.location, data["flipyz"]),
                    "rotation"      : generate_vec3(lamp.rotation_euler, data["flipyz"]),
                    "color"         : rgb2int(concrete_lamp.color),
                    "distance"      : concrete_lamp.distance,
                    "intensity"        : concrete_lamp.energy
                }
            elif concrete_lamp.type == "AREA":
                light_string = TEMPLATE_LIGHT_AREA % {
                    "light_id"      : generate_string(concrete_lamp.name),
                    "position"      : generate_vec3(lamp.location, data["flipyz"]),
                    "rotation"      : generate_vec3(lamp.rotation_euler, data["flipyz"]),
                    "color"         : rgb2int(concrete_lamp.color),
                    "distance"      : concrete_lamp.distance,
                    "intensity"        : concrete_lamp.energy,
                    "gamma"         : concrete_lamp.gamma,
                    "shape"         : concrete_lamp.shape,
                    "size"          : concrete_lamp.size,
                    "size_y"        : concrete_lamp.size_y
                }

            chunks.append(light_string)

        if not lamps:
            lamps.append(DEFAULTS["light"])

    return ",\n\n".join(chunks), len(chunks)

# #####################################################
# Scene exporter - embedded meshes
# #####################################################

def generate_embeds(data):

    if data["embed_meshes"]:

        chunks = []

        for e in data["embeds"]:

            embed = '"emb_%s": {%s}' % (e, data["embeds"][e])
            chunks.append(embed)

        return ",\n\n".join(chunks)

    return ""

# #####################################################
# Scene exporter - generate ASCII scene
# #####################################################

def generate_ascii_scene(data):

    objects, nobjects = generate_objects(data)
    geometries, ngeometries = generate_geometries(data)
    textures, ntextures = generate_textures_scene(data)
    materials, nmaterials = generate_materials_scene(data)
    lights, nlights = generate_lights(data)
    cameras, ncameras = generate_cameras(data)

    embeds = generate_embeds(data)

    if nlights > 0:
        if nobjects > 0:
            objects = objects + ",\n\n" + lights
        else:
            objects = lights
        nobjects += nlights

    if ncameras > 0:
        if nobjects > 0:
            objects = objects + ",\n\n" + cameras
        else:
            objects = cameras
        nobjects += ncameras

    basetype = "relativeTo"

    if data["base_html"]:
        basetype += "HTML"
    else:
        basetype += "Scene"

    sections = [
    ["objects",    objects],
    ["geometries", geometries],
    ["textures",   textures],
    ["materials",  materials],
    ["embeds",     embeds]
    ]

    chunks = []
    for label, content in sections:
        if content:
            chunks.append(generate_section(label, content))

    sections_string = "\n".join(chunks)

    default_camera = ""
    if data["use_cameras"]:
        cams = [ob for ob in bpy.data.objects if (ob.type == 'CAMERA' and ob.select)]
        if not cams:
            default_camera = "default_camera"
        else:
            default_camera = cams[0].name

    parameters = {
    "fname"     : data["source_file"],

    "sections"  : sections_string,

    "bgcolor"   : generate_vec3(DEFAULTS["bgcolor"]),
    "bgalpha"   : DEFAULTS["bgalpha"],
    "defcamera" :  generate_string(default_camera),

    "nobjects"      : nobjects,
    "ngeometries"   : ngeometries,
    "ntextures"     : ntextures,
    "basetype"      : generate_string(basetype),
    "nmaterials"    : nmaterials,

    "position"      : generate_vec3(DEFAULTS["position"]),
    "rotation"      : generate_vec3(DEFAULTS["rotation"]),
    "scale"         : generate_vec3(DEFAULTS["scale"])
    }

    text = TEMPLATE_SCENE_ASCII % parameters

    return text

def export_scene(scene, filepath, flipyz, option_colors, option_lights, option_cameras, option_embed_meshes, embeds, option_url_base_html, option_copy_textures):

    source_file = os.path.basename(bpy.data.filepath)

    # objects are contained in scene and linked groups
    objects = []

    # get scene objects
    sceneobjects = scene.objects
    for obj in sceneobjects:
      objects.append(obj)

    scene_text = ""
    data = {
    "scene"        : scene,
    "objects"      : objects,
    "embeds"       : embeds,
    "source_file"  : source_file,
    "filepath"     : filepath,
    "flipyz"       : flipyz,
    "use_colors"   : option_colors,
    "use_lights"   : option_lights,
    "use_cameras"  : option_cameras,
    "embed_meshes" : option_embed_meshes,
    "base_html"    : option_url_base_html,
    "copy_textures": option_copy_textures
    }
    scene_text += generate_ascii_scene(data)

    write_file(filepath, scene_text)

# #####################################################
# Main
# #####################################################

def save(operator, context, filepath = "",
         option_flip_yz = True,
         option_vertices = True,
         option_vertices_truncate = False,
         option_faces = True,
         option_normals = True,
         option_uv_coords = True,
         option_materials = True,
         option_colors = True,
         option_bones = True,
         option_skinning = True,
         align_model = 0,
         option_export_scene = False,
         option_lights = False,
         option_cameras = False,
         option_scale = 1.0,
         option_embed_meshes = True,
         option_url_base_html = False,
         option_copy_textures = False,
         option_animation_morph = False,
         option_animation_skeletal = False,
         option_frame_step = 1,
         option_all_meshes = True,
         option_frame_index_as_time = False):

    #print("URL TYPE", option_url_base_html)

    filepath = ensure_extension(filepath, '.js')

    scene = context.scene

    if scene.objects.active:
        bpy.ops.object.mode_set(mode='OBJECT')

    if option_all_meshes:
        sceneobjects = scene.objects
    else:
        sceneobjects = context.selected_objects

    # objects are contained in scene and linked groups
    objects = []

    # get scene objects
    for obj in sceneobjects:
      objects.append(obj)

    if option_export_scene:

        geo_set = set()
        embeds = {}

        for object in objects:
            if object.type == "MESH" and object.THREE_exportGeometry:

                # create extra copy of geometry with applied modifiers
                # (if they exist)

                #if len(object.modifiers) > 0:
                #    name = object.name

                # otherwise can share geometry

                #else:
                name = object.data.name

                if name not in geo_set:

                    if option_embed_meshes:

                        text, model_string = generate_mesh_string([object], scene,
                                                        option_vertices,
                                                        option_vertices_truncate,
                                                        option_faces,
                                                        option_normals,
                                                        option_uv_coords,
                                                        option_materials,
                                                        option_colors,
                                                        option_bones,
                                                        option_skinning,
                                                        False,          # align_model
                                                        option_flip_yz,
                                                        option_scale,
                                                        False,          # export_single_model
                                                        False,          # option_copy_textures
                                                        filepath,
                                                        option_animation_morph,
                                                        option_animation_skeletal,
                                                        option_frame_index_as_time,
                                                        option_frame_step)

                        embeds[object.data.name] = model_string

                    else:

                        fname = generate_mesh_filename(name, filepath)
                        export_mesh([object], scene,
                                    fname,
                                    option_vertices,
                                    option_vertices_truncate,
                                    option_faces,
                                    option_normals,
                                    option_uv_coords,
                                    option_materials,
                                    option_colors,
                                    option_bones,
                                    option_skinning,
                                    False,          # align_model
                                    option_flip_yz,
                                    option_scale,
                                    False,          # export_single_model
                                    option_copy_textures,
                                    option_animation_morph,
                                    option_animation_skeletal,
                                    option_frame_step,
                                    option_frame_index_as_time)

                    geo_set.add(name)

        export_scene(scene, filepath,
                     option_flip_yz,
                     option_colors,
                     option_lights,
                     option_cameras,
                     option_embed_meshes,
                     embeds,
                     option_url_base_html,
                     option_copy_textures)

    else:

        export_mesh(objects, scene, filepath,
                    option_vertices,
                    option_vertices_truncate,
                    option_faces,
                    option_normals,
                    option_uv_coords,
                    option_materials,
                    option_colors,
                    option_bones,
                    option_skinning,
                    align_model,
                    option_flip_yz,
                    option_scale,
                    True,            # export_single_model
                    option_copy_textures,
                    option_animation_morph,
                    option_animation_skeletal,
                    option_frame_step,
                    option_frame_index_as_time)

    return {'FINISHED'}