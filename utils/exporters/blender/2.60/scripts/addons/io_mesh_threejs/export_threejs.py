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
"rotation" : [-math.pi/2, 0, 0],
"scale"    : [1, 1, 1],

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
    },

"light" :
 {
    "name"       : "default_light",
    "type"       : "directional",
    "direction"  : [0, 1, 1],
    "color"      : [1, 1, 1],
    "intensity"  : 0.8
 }
}

# default colors for debugging (each material gets one distinct color):
# white, red, green, blue, yellow, cyan, magenta
COLORS = [0xeeeeee, 0xee0000, 0x00ee00, 0x0000ee, 0xeeee00, 0x00eeee, 0xee00ee]


# #####################################################
# Templates - scene
# #####################################################

TEMPLATE_SCENE_ASCII = """\
{

"metadata" :
{
    "formatVersion" : 3,
    "sourceFile"    : "%(fname)s",
    "generatedBy"   : "Blender 2.60 Exporter",
    "objects"       : %(nobjects)s,
    "geometries"    : %(ngeometries)s,
    "materials"     : %(nmaterials)s,
    "textures"      : %(ntextures)s
},

"type" : "scene",
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
        "materials" : [ %(material_id)s ],
        "position"  : %(position)s,
        "rotation"  : %(rotation)s,
        "quaternion": %(quaternion)s,
        "scale"     : %(scale)s,
        "visible"       : %(visible)s,
        "castsShadow"   : %(castsShadow)s,
        "meshCollider"  : %(meshCollider)s,
        "trigger"       : %(trigger)s
    }"""

TEMPLATE_EMPTY = """\
    %(object_id)s : {
        "groups"    : [ %(group_id)s ],
        "position"  : %(position)s,
        "rotation"  : %(rotation)s,
        "quaternion": %(quaternion)s,
        "scale"     : %(scale)s,
        "trigger"   : %(trigger)s
    }"""

TEMPLATE_GEOMETRY_LINK = """\
    %(geometry_id)s : {
        "type" : "ascii_mesh",
        "url"  : %(model_file)s
    }"""

TEMPLATE_GEOMETRY_EMBED = """\
    %(geometry_id)s : {
        "type" : "embedded_mesh",
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

TEMPLATE_LIGHT_DIRECTIONAL = """\
    %(light_id)s: {
        "type"		 : "directional",
        "direction"	 : %(direction)s,
        "color" 	 : %(color)d,
        "intensity"	 : %(intensity).2f
    }"""

TEMPLATE_LIGHT_POINT = """\
    %(light_id)s: {
        "type"	     : "point",
        "position"   : %(position)s,
        "color"      : %(color)d,
        "intensity"	 : %(intensity).3f
    }"""

TEMPLATE_VEC4 = '[ %f, %f, %f, %f ]'
TEMPLATE_VEC3 = '[ %f, %f, %f ]'
TEMPLATE_VEC2 = '[ %f, %f ]'
TEMPLATE_STRING = '"%s"'
TEMPLATE_HEX = "0x%06x"

# #####################################################
# Templates - model
# #####################################################

TEMPLATE_FILE_ASCII = """\
{

    "metadata" :
    {
        "formatVersion" : 3,
        "generatedBy"   : "Blender 2.60 Exporter",
        "vertices"      : %(nvertex)d,
        "faces"         : %(nface)d,
        "normals"       : %(nnormal)d,
        "colors"        : %(ncolor)d,
        "uvs"           : %(nuv)d,
        "materials"     : %(nmaterial)d,
        "morphTargets"  : %(nmorphTarget)d
    },

%(model)s

}
"""

TEMPLATE_MODEL_ASCII = """\
    "scale" : %(scale)f,

    "materials": [%(materials)s],

    "vertices": [%(vertices)s],

    "morphTargets": [%(morphTargets)s],

    "normals": [%(normals)s],

    "colors": [%(colors)s],

    "uvs": [[%(uvs)s]],

    "faces": [%(faces)s]

"""

TEMPLATE_VERTEX = "%f,%f,%f"
TEMPLATE_VERTEX_TRUNCATE = "%d,%d,%d"

TEMPLATE_N = "%f,%f,%f"
TEMPLATE_UV = "%f,%f"
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

def get_normal_indices(v, normals, mesh):
    n = []
    mv = mesh.vertices

    for i in v:
        normal = mv[i].normal
        key = veckey3d(normal)

        n.append( normals[key] )

    return n

def get_uv_indices(face_index, uvs, mesh):
    uv = []
    uv_layer = mesh.uv_textures.active.data
    for i in uv_layer[face_index].uv:
        uv.append( uvs[veckey2d(i)] )
    return uv

def get_color_indices(face_index, colors, mesh):
    c = []
    color_layer = mesh.vertex_colors.active.data
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
    out = open(fname, "w")
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

def top(vertices):
    """Align top of the model with the floor (Y-axis) and center it around X and Z.
    """

    bb = bbox(vertices)

    cx = bb['x'][0] + (bb['x'][1] - bb['x'][0])/2.0
    cy = bb['y'][1]
    cz = bb['z'][0] + (bb['z'][1] - bb['z'][0])/2.0

    translate(vertices, [-cx,-cy,-cz])

def bottom(vertices):
    """Align bottom of the model with the floor (Y-axis) and center it around X and Z.
    """

    bb = bbox(vertices)

    cx = bb['x'][0] + (bb['x'][1] - bb['x'][0])/2.0
    cy = bb['y'][0]
    cz = bb['z'][0] + (bb['z'][1] - bb['z'][0])/2.0

    translate(vertices, [-cx,-cy,-cz])

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
    return TEMPLATE_UV % (uv[0], 1.0 - uv[1])

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

def generate_faces(normals, uvs, colors, meshes, option_normals, option_colors, option_uv_coords, option_materials, flipyz, option_faces):

    if not option_faces:
        return "", 0

    vertex_offset = 0
    material_offset = 0

    chunks = []
    for mesh, object in meshes:

        faceUV = (len(mesh.uv_textures) > 0)
        vertexUV = (len(mesh.sticky) > 0)
        vertexColors = len(mesh.vertex_colors) > 0

        mesh_colors = option_colors and vertexColors
        mesh_uvs = option_uv_coords and (faceUV or vertexUV)

        if faceUV or vertexUV:
            active_uv_layer = mesh.uv_textures.active
            if not active_uv_layer:
                mesh_extract_uvs = False

        if vertexColors:
            active_col_layer = mesh.vertex_colors.active
            if not active_col_layer:
                mesh_extract_colors = False

        for i, f in enumerate(mesh.faces):
            face = generate_face(f, i, normals, uvs, colors, mesh, option_normals, mesh_colors, mesh_uvs, option_materials, flipyz, vertex_offset, material_offset)
            chunks.append(face)

        vertex_offset += len(mesh.vertices)

        material_count = len(mesh.materials)
        if material_count == 0:
            material_count = 1

        material_offset += material_count

    return ",".join(chunks), len(chunks)

def generate_face(f, faceIndex, normals, uvs, colors, mesh, option_normals, option_colors, option_uv_coords, option_materials, flipyz, vertex_offset, material_offset):
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
        uv = get_uv_indices(faceIndex, uvs, mesh)
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
    for f in mesh.faces:
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
    color_layer = mesh.vertex_colors.active.data

    for face_index, face in enumerate(mesh.faces):

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

def extract_uvs(mesh, uvs, count):
    uv_layer = mesh.uv_textures.active.data

    for face_index, face in enumerate(mesh.faces):

        for uv_index, uv in enumerate(uv_layer[face_index].uv):

            key = veckey2d(uv)
            if key not in uvs:
                uvs[key] = count
                count += 1

    return count

def generate_uvs(uvs, option_uv_coords):
    if not option_uv_coords:
        return ""

    chunks = []
    for key, index in sorted(uvs.items(), key=operator.itemgetter(1)):
        chunks.append(key)

    return ",".join(generate_uv(n) for n in chunks)

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

        mtl_raw = ",\n".join(['\t"%s" : %s' % (n, value2string(v)) for n,v in sorted(mtl[m].items())])
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

            world_ambient_color = [0, 0, 0]
            if world:
                world_ambient_color = world.ambient_color

            material['colorAmbient'] = [m.ambient * world_ambient_color[0],
                                        m.ambient * world_ambient_color[1],
                                        m.ambient * world_ambient_color[2]]

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

    if textures[id]:
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
                         align_model,
                         flipyz,
                         option_scale,
                         option_copy_textures,
                         filepath,
                         option_animation,
                         option_frame_step):

    vertices = []

    vertex_offset = 0
    vertex_offsets = []

    nnormal = 0
    normals = {}

    ncolor = 0
    colors = {}

    nuv = 0
    uvs = {}

    nmaterial = 0
    materials = []

    for mesh, object in meshes:

        faceUV = (len(mesh.uv_textures) > 0)
        vertexUV = (len(mesh.sticky) > 0)
        vertexColors = len(mesh.vertex_colors) > 0

        mesh_extract_colors = option_colors and vertexColors
        mesh_extract_uvs = option_uv_coords and (faceUV or vertexUV)

        if faceUV or vertexUV:
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
            nuv = extract_uvs(mesh, uvs, nuv)

        if option_materials:
            mesh_materials, nmaterial = generate_materials_string(mesh, scene, mesh_extract_colors, object.draw_type, option_copy_textures, filepath, nmaterial)
            materials.append(mesh_materials)


    morphTargets_string = ""
    nmorphTarget = 0

    if option_animation:
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

    faces_string, nfaces = generate_faces(normals, uvs, colors, meshes, option_normals, option_colors, option_uv_coords, option_materials, flipyz, option_faces)

    materials_string = ",\n\n".join(materials)

    model_string = TEMPLATE_MODEL_ASCII % {
    "scale" : option_scale,

    "uvs"       : generate_uvs(uvs, option_uv_coords),
    "normals"   : generate_normals(normals, option_normals),
    "colors"    : generate_vertex_colors(colors, option_colors),

    "materials" : materials_string,

    "vertices" : generate_vertices(vertices, option_vertices_truncate, option_vertices),

    "faces"    : faces_string,

    "morphTargets" : morphTargets_string
    }

    text = TEMPLATE_FILE_ASCII % {
    "nvertex"   : len(vertices),
    "nface"     : nfaces,
    "nuv"       : nuv,
    "nnormal"   : nnormal,
    "ncolor"    : ncolor,
    "nmaterial" : nmaterial,
    "nmorphTarget": nmorphTarget,

    "model"     : model_string
    }


    return text, model_string


# #####################################################
# Model exporter - export single mesh
# #####################################################

def extract_meshes(objects, scene, export_single_model, option_scale):

    meshes = []

    for object in objects:

        if object.type == "MESH" and object.THREE_exportGeometry:

            # collapse modifiers into mesh

            mesh = object.to_mesh(scene, True, 'RENDER')

            if not mesh:
                raise Exception("Error, could not get mesh data from object [%s]" % object.name)

            # that's what Blender's native export_obj.py does
            # to flip YZ

            if export_single_model:
                X_ROT = mathutils.Matrix.Rotation(-math.pi/2, 4, 'X')
                mesh.transform(X_ROT * object.matrix_world)

            mesh.calc_normals()
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
                align_model,
                flipyz,
                option_scale,
                export_single_model,
                option_copy_textures,
                filepath,
                option_animation,
                option_frame_step):

    meshes = extract_meshes(objects, scene, export_single_model, option_scale)

    morphs = []

    if option_animation:

        original_frame = scene.frame_current # save animation state

        scene_frames = range(scene.frame_start, scene.frame_end + 1, option_frame_step)

        for frame in scene_frames:
            scene.frame_set(frame, 0.0)

            anim_meshes = extract_meshes(objects, scene, export_single_model, option_scale)

            frame_vertices = []

            for mesh, object in anim_meshes:
                frame_vertices.extend(mesh.vertices[:])

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
                                align_model,
                                flipyz,
                                option_scale,
                                option_copy_textures,
                                filepath,
                                option_animation,
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
                align_model,
                flipyz,
                option_scale,
                export_single_model,
                option_copy_textures,
                option_animation,
                option_frame_step):

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
                align_model,
                flipyz,
                option_scale,
                export_single_model,
                option_copy_textures,
                filepath,
                option_animation,
                option_frame_step)

    write_file(filepath, text)

    print("writing", filepath, "done")


# #####################################################
# Scene exporter - render elements
# #####################################################

def generate_vec4(vec):
    return TEMPLATE_VEC4 % (vec[0], vec[1], vec[2], vec[3])

def generate_vec3(vec):
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

            if len(obj.modifiers) > 0:
                geo_name = obj.name
            else:
                geo_name = obj.data.name

            geometry_id = "geo_%s" % geo_name

            material_ids = generate_material_id_list(obj.material_slots)
            group_ids = generate_group_id_list(obj)

            position, quaternion, scale = obj.matrix_world.decompose()
            rotation = quaternion.to_euler("XYZ")

            material_string = ""
            if len(material_ids) > 0:
                material_string = generate_string_list(material_ids)

            group_string = ""
            if len(group_ids) > 0:
                group_string = generate_string_list(group_ids)

            castsShadow = obj.THREE_castsShadow
            meshCollider = obj.THREE_meshCollider
            triggerType = obj.THREE_triggerType

            visible = True
            #if obj.draw_type in ["BOUNDS", "WIRE"] and (meshCollider or castsShadow):
            if meshCollider or castsShadow:
                visible = False

            geometry_string = generate_string(geometry_id)

            object_string = TEMPLATE_OBJECT % {
            "object_id"   : generate_string(object_id),
            "geometry_id" : geometry_string,
            "group_id"    : group_string,
            "material_id" : material_string,

            "position"    : generate_vec3(position),
            "rotation"    : generate_vec3(rotation),
            "quaternion"  : generate_vec4(quaternion),
            "scale"       : generate_vec3(scale),

            "castsShadow"  : generate_bool_property(castsShadow),
            "meshCollider" : generate_bool_property(meshCollider),
            "trigger" 	   : generate_string(triggerType),
            "visible"      : generate_bool_property(visible)
            }
            chunks.append(object_string)

        elif obj.type == "EMPTY" or (obj.type == "MESH" and not obj.THREE_exportGeometry):

            object_id = obj.name
            group_ids = generate_group_id_list(obj)

            position, quaternion, scale = obj.matrix_world.decompose()
            rotation = quaternion.to_euler("XYZ")

            group_string = ""
            if len(group_ids) > 0:
                group_string = generate_string_list(group_ids)

            triggerType = obj.THREE_triggerType

            object_string = TEMPLATE_EMPTY % {
            "object_id"   : generate_string(object_id),
            "group_id"    : group_string,

            "position"    : generate_vec3(position),
            "rotation"    : generate_vec3(rotation),
            "quaternion"  : generate_vec4(quaternion),
            "scale"       : generate_vec3(scale),

            "trigger" 	   : generate_string(triggerType),
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

            if len(obj.modifiers) > 0:
                name = obj.name
            else:
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

        if texture.type == 'IMAGE' and texture.image:

            img = texture.image

            texture_id = img.name
            texture_file = extract_texture_filename(img)

            if data["copy_textures"]:
                save_image(img, texture_file, data["filepath"])

            extras = ""

            if texture.repeat_x != 1 or texture.repeat_y != 1:
                extras += ',\n        "repeat": [%f, %f]' % (texture.repeat_x, texture.repeat_y)

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

    world_ambient_color = [0, 0, 0]
    if world:
        world_ambient_color = world.ambient_color

    material['colorAmbient'] = [m.ambient * world_ambient_color[0],
                                m.ambient * world_ambient_color[1],
                                m.ambient * world_ambient_color[2]]

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
    material['mapNormalFactor'] = 1.0

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

    material['shading'] = m.THREE_materialType

    return material

def guess_material_textures(material):
    textures = {
        'diffuse' : None,
        'light'   : None,
        'normal'  : None,
        'specular': None
    }

    # just take first textures of each, for the moment three.js materials can't handle more
    # assume diffuse comes before lightmap, normalmap has checked flag

    for i in range(len(material.texture_slots)):
        slot = material.texture_slots[i]
        if slot:
            texture = slot.texture
            if slot.use and texture.type == 'IMAGE':

                if texture.use_normal_map:
                    textures['normal'] = { "texture": texture, "slot": slot }

                elif slot.use_map_specular or slot.use_map_hardness:
                    textures['specular'] = { "texture": texture, "slot": slot }

                else:
                    if not textures['diffuse']:
                        textures['diffuse'] = { "texture": texture, "slot": slot }

                    else:
                        textures['light'] = { "texture": texture, "slot": slot }

                if textures['diffuse'] and textures['normal'] and textures['light'] and textures['specular']:
                    break

    return textures

def generate_material_string(material):

    material_id = material["name"]

    # default to Lambert

    shading = material.get("shading", "Lambert")

    # normal mapped materials must use Phong
    # to get all required parameters for normal shader

    if material['mapNormal']:
        shading = "Phong"

    type_map = {
    "Lambert"   : "MeshLambertMaterial",
    "Phong"     : "MeshPhongMaterial"
    }

    material_type = type_map.get(shading, "MeshBasicMaterial")

    parameters = '"color": %d' % rgb2int(material["colorDiffuse"])
    parameters += ', "opacity": %.2g' % material["transparency"]

    if shading == "Phong":
        parameters += ', "ambient": %d' % rgb2int(material["colorAmbient"])
        parameters += ', "specular": %d' % rgb2int(material["colorSpecular"])
        parameters += ', "shininess": %.1g' % material["specularCoef"]

    colorMap = material['mapDiffuse']
    lightMap = material['mapLight']
    specularMap = material['mapSpecular']
    normalMap = material['mapNormal']
    normalMapFactor = material['mapNormalFactor']

    if colorMap:
        parameters += ', "map": %s' % generate_string(colorMap)
    if lightMap:
        parameters += ', "lightMap": %s' % generate_string(lightMap)
    if specularMap:
        parameters += ', "specularMap": %s' % generate_string(specularMap)
    if normalMap:
        parameters += ', "normalMap": %s' % generate_string(normalMap)

    if normalMapFactor != 1.0:
        parameters += ', "normalMapFactor": %f' % normalMapFactor

    if material['vertexColors']:
        parameters += ', "vertexColors": "vertex"'

    material_string = TEMPLATE_MATERIAL_SCENE % {
    "material_id" : generate_string(material_id),
    "type"        : generate_string(material_type),
    "parameters"  : parameters
    }

    return material_string

def generate_materials_scene(data):
    chunks = []

    # TODO: extract just materials actually used by some objects in the scene

    for m in bpy.data.materials:
        material = extract_material_data(m, data["use_colors"])
        material_string = generate_material_string(material)
        chunks.append(material_string)

    return ",\n\n".join(chunks), len(chunks)

# #####################################################
# Scene exporter - cameras
# #####################################################

def generate_cameras(data):
    if data["use_cameras"]:

        cams = bpy.data.objects
        cams = [ob for ob in cams if (ob.type == 'CAMERA' and ob.select)]

        chunks = []

        if not cams:
            camera = DEFAULTS["camera"]

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

        else:

            for cameraobj in cams:
                camera = bpy.data.cameras[cameraobj.name]

                # TODO:
                #   Support more than perspective camera
                #   Calculate a target/lookat
                #   Get correct aspect ratio
                if camera.id_data.type == "PERSP":

                    camera_string = TEMPLATE_CAMERA_PERSPECTIVE % {
                    "camera_id" : generate_string(camera.name),
                    "fov"       : (camera.angle / 3.14) * 180.0,
                    "aspect"    : 1.333,
                    "near"      : camera.clip_start,
                    "far"       : camera.clip_end,
                    "position"  : generate_vec3([cameraobj.location[0], -cameraobj.location[1], cameraobj.location[2]]),
                    "target"    : generate_vec3([0, 0, 0])
                    }

                chunks.append(camera_string)

        return ",\n\n".join(chunks)

    return ""

# #####################################################
# Scene exporter - lights
# #####################################################

def generate_lights(data):

    if data["use_lights"]:

        lights = data.get("lights", [])
        if not lights:
            lights.append(DEFAULTS["light"])

        chunks = []
        for light in lights:

            if light["type"] == "directional":
                light_string = TEMPLATE_LIGHT_DIRECTIONAL % {
                "light_id"      : generate_string(light["name"]),
                "direction"     : generate_vec3(light["direction"]),
                "color"         : rgb2int(light["color"]),
                "intensity"     : light["intensity"]
                }

            elif light["type"] == "point":
                light_string = TEMPLATE_LIGHT_POINT % {
                "light_id"      : generate_string(light["name"]),
                "position"      : generate_vec3(light["position"]),
                "color"         : rgb2int(light["color"]),
                "intensity"     : light["intensity"]
                }

            chunks.append(light_string)

        return ",\n\n".join(chunks)

    return ""

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

    cameras = generate_cameras(data)
    lights = generate_lights(data)

    embeds = generate_embeds(data)

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
    ["cameras",    cameras],
    ["lights",     lights],
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

    scene_text = ""
    data = {
    "scene"        : scene,
    "objects"      : scene.objects,
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
         align_model = 0,
         option_export_scene = False,
         option_lights = False,
         option_cameras = False,
         option_scale = 1.0,
         option_embed_meshes = True,
         option_url_base_html = False,
         option_copy_textures = False,
         option_animation = False,
         option_frame_step = 1,
         option_all_meshes = True):

    #print("URL TYPE", option_url_base_html)

    filepath = ensure_extension(filepath, '.js')

    scene = context.scene

    if scene.objects.active:
        bpy.ops.object.mode_set(mode='OBJECT')

    if option_all_meshes:
        objects = scene.objects
    else:
        objects = context.selected_objects

    if option_export_scene:

        geo_set = set()
        embeds = {}

        for object in objects:
            if object.type == "MESH" and object.THREE_exportGeometry:

                # create extra copy of geometry with applied modifiers
                # (if they exist)

                if len(object.modifiers) > 0:
                    name = object.name

                # otherwise can share geometry

                else:
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
                                                        False,          # align_model
                                                        option_flip_yz,
                                                        option_scale,
                                                        False,          # export_single_model
                                                        False,          # option_copy_textures
                                                        filepath,
                                                        option_animation,
                                                        option_frame_step)

                        embeds[name] = model_string

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
                                    False,          # align_model
                                    option_flip_yz,
                                    option_scale,
                                    False,          # export_single_model
                                    option_copy_textures,
                                    option_animation,
                                    option_frame_step)

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
                    align_model,
                    option_flip_yz,
                    option_scale,
                    True,            # export_single_model
                    option_copy_textures,
                    option_animation,
                    option_frame_step)

    return {'FINISHED'}
