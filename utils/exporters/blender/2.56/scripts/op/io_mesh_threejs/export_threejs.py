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

# Based on export_obj.py and export_ply.py
# Contributors: Mr.doob, Kikko, alteredq

"""
Blender exporter for Three.js (ASCII JSON format).

TODO
    - export scene
    - copy used images to folder where exported file goes
    - binary format
"""

import bpy
import mathutils

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
/* Converted from: %(fname)s
 *
 * File generated with Blender 2.56 Exporter
 * https://github.com/alteredq/three.js/tree/master/utils/exporters/blender/
 *
 * objects:    %(nobjects)s
 * geometries: %(ngeometries)s
 * materials:  %(nmaterials)s
 * textures:   %(ntextures)s
 */

var scene = {

"type" : "scene",
"urlBaseType" : "relativeToScene",

%(sections)s

"transform" :
{
    "position"  : %(position)s,
    "rotation"  : %(rotation)s,
    "scale"     : %(scale)s,
},

"defaults" :
{
    "bgcolor" : %(bgcolor)s,
    "bgalpha" : %(bgalpha)f,
    "camera"  : %(defcamera)s
}

}

postMessage( scene );
close();
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
        "meshCollider"  : %(meshCollider)s
    }"""

TEMPLATE_GEOMETRY = """\
    %(geometry_id)s : {
        "type" : "ascii_mesh",
        "url"  : %(model_file)s
    }"""

TEMPLATE_TEXTURE = """\
    %(texture_id)s : {
        "url": %(texture_file)s
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
/*
 * File generated with Blender 2.56 Exporter
 * https://github.com/mrdoob/three.js/tree/master/utils/exporters/blender/
 *
 * vertices: %(nvertex)d
 * faces: %(nface)d
 * normals: %(nnormal)d
 * uvs: %(nuv)d
 * colors: %(ncolor)d
 * materials: %(nmaterial)d
 * edges: %(nedges)d
 *
 */

var model = {

    "version" : 2,

    "scale" : %(scale)f,

    "materials": [%(materials)s],

    "vertices": [%(vertices)s],

    "morphTargets": [],

    "normals": [%(normals)s],

    "colors": [%(colors)s],

    "uvs": [[%(uvs)s]],

    "faces": [%(faces)s],

    "edges" : [%(edges)s]

};

postMessage( model );
close();
"""

TEMPLATE_VERTEX = "%f,%f,%f"
TEMPLATE_VERTEX_TRUNCATE = "%d,%d,%d"

TEMPLATE_N = "%f,%f,%f"
TEMPLATE_UV = "%f,%f"
#TEMPLATE_C = "0x%06x"
TEMPLATE_C = "%d"
TEMPLATE_EDGE = "%d,%d"

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

def generate_edge(e):
    return TEMPLATE_EDGE % (e.vertices[0], e.vertices[1])

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

def generate_faces(normals, uvs, colors, mesh, option_normals, option_colors, option_uv_coords, option_materials, flipyz, option_faces):
    if not option_faces:
        return ""

    return ",".join(generate_face(f, i, normals, uvs, colors, mesh, option_normals, option_colors, option_uv_coords, option_materials, flipyz) for i, f in enumerate(mesh.faces))

def generate_face(f, faceIndex, normals, uvs, colors, mesh, option_normals, option_colors, option_uv_coords, option_materials, flipyz):
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
        index = f.vertices[i]
        faceData.append(index)

    if hasMaterial:
        faceData.append( f.material_index )

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

def extract_vertex_normals(mesh, option_normals):
    if not option_normals:
        return {}, 0

    count = 0
    normals = {}

    for f in mesh.faces:
        for v in f.vertices:

            normal = mesh.vertices[v].normal
            key = veckey3d(normal)

            if key not in normals:
                normals[key] = count
                count += 1

    return normals, count

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

def extract_vertex_colors(mesh, option_colors):

    if not option_colors:
        return {}, 0

    count = 0
    colors = {}

    color_layer = mesh.vertex_colors.active.data

    for face_index, face in enumerate(mesh.faces):

        face_colors = color_layer[face_index]
        face_colors = face_colors.color1, face_colors.color2, face_colors.color3, face_colors.color4

        for c in face_colors:
            key = hexcolor(c)
            if key not in colors:
                colors[key] = count
                count += 1

    return colors, count

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

def extract_uvs(mesh, option_uv_coords):

    if not option_uv_coords:
        return {}, 0

    count = 0
    uvs = {}

    uv_layer = mesh.uv_textures.active.data

    for face_index, face in enumerate(mesh.faces):

        for uv_index, uv in enumerate(uv_layer[face_index].uv):

            key = veckey2d(uv)
            if key not in uvs:
                uvs[key] = count
                count += 1

    return uvs, count

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

def extract_materials(mesh, scene, option_colors):
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
            # Blender uses INT from [1,511] with default 0
            # http://www.blender.org/documentation/blender_python_api_2_54_0/bpy.types.Material.html#bpy.types.Material.specular_hardness

            material["specularCoef"] = m.specular_hardness

            if m.active_texture and m.active_texture.type == 'IMAGE' and m.active_texture.image:
                fn = bpy.path.abspath(m.active_texture.image.filepath)
                fn = os.path.normpath(fn)
                fn_strip = os.path.basename(fn)
                material['mapDiffuse'] = fn_strip

            material["vertexColors"] = m.THREE_useVertexColors and option_colors

            # can't really use this reliably to tell apart Phong from Lambert
            # as Blender defaults to non-zero specular color
            #if m.specular_intensity > 0.0 and (m.specular_color[0] > 0 or m.specular_color[1] > 0 or m.specular_color[2] > 0):
            #    material['shading'] = "Phong"
            #else:
            #    material['shading'] = "Lambert"
            
            material['shading'] = m.THREE_materialType

    return materials

def generate_materials_string(mesh, scene, option_colors, draw_type):

    random.seed(42) # to get well defined color order for debug materials

    materials = {}
    if mesh.materials:
        for i, m in enumerate(mesh.materials):
            if m:
                materials[m.name] = i
            else:
                materials["undefined_dummy_%0d" % i] = i


    if not materials:
        materials = { 'default':0 }

    # default dummy materials

    mtl = generate_mtl(materials)

    # extract real materials from the mesh

    mtl.update(extract_materials(mesh, scene, option_colors))

    return generate_materials(mtl, materials, draw_type)

# #####################################################
# ASCII model generator
# #####################################################

def generate_ascii_model(mesh, scene,
                         option_vertices,
                         option_vertices_truncate,
                         option_faces,
                         option_normals,
                         option_edges,
                         option_uv_coords,
                         option_materials,
                         option_colors,
                         align_model,
                         flipyz,
                         option_scale,
                         draw_type):

    vertices = mesh.vertices[:]

    if align_model == 1:
        center(vertices)
    elif align_model == 2:
        bottom(vertices)
    elif align_model == 3:
        top(vertices)

    normals, nnormal = extract_vertex_normals(mesh, option_normals)
    colors, ncolor = extract_vertex_colors(mesh, option_colors)
    uvs, nuv = extract_uvs(mesh, option_uv_coords)

    materials_string = ""
    nmaterial = 0

    edges_string = ""
    nedges = 0

    if option_materials:
        materials_string, nmaterial = generate_materials_string(mesh, scene, option_colors, draw_type)

    if option_edges:
        nedges = len(mesh.edges)
        edges_string  = ",".join(generate_edge(e) for e in mesh.edges)

    text = TEMPLATE_FILE_ASCII % {
    "nvertex"   : len(mesh.vertices),
    "nface"     : len(mesh.faces),
    "nuv"       : nuv,
    "nnormal"   : nnormal,
    "ncolor"    : ncolor,
    "nmaterial" : nmaterial,
    "nedges"    : nedges,

    "scale" : option_scale,

    "uvs"           : generate_uvs(uvs, option_uv_coords),
    "normals"       : generate_normals(normals, option_normals),
    "colors"        : generate_vertex_colors(colors, option_colors),

    "materials" : materials_string,

    "vertices" : generate_vertices(vertices, option_vertices_truncate, option_vertices),

    "faces"    : generate_faces(normals, uvs, colors, mesh, option_normals, option_colors, option_uv_coords, option_materials, flipyz, option_faces),

    "edges"    : edges_string

    }

    return text


# #####################################################
# Model exporter - export single mesh
# #####################################################

def export_mesh(obj, scene, filepath,
                option_vertices,
                option_vertices_truncate,
                option_faces,
                option_normals,
                option_edges,
                option_uv_coords,
                option_materials,
                option_colors,
                align_model,
                flipyz,
                option_scale,
                export_single_model):

    """Export single mesh"""

    # collapse modifiers into mesh

    mesh = obj.create_mesh(scene, True, 'RENDER')

    if not mesh:
        raise Exception("Error, could not get mesh data from object [%s]" % obj.name)

    # that's what Blender's native export_obj.py does
    # to flip YZ

    if export_single_model:
        X_ROT = mathutils.Matrix.Rotation(-math.pi/2, 4, 'X')
        mesh.transform(X_ROT * obj.matrix_world)

    mesh.calc_normals()

    mesh.transform(mathutils.Matrix.Scale(option_scale, 4))

    faceUV = (len(mesh.uv_textures) > 0)
    vertexUV = (len(mesh.sticky) > 0)
    vertexColors = len(mesh.vertex_colors) > 0

    if not vertexColors:
        option_colors = False

    if (not faceUV) and (not vertexUV):
        option_uv_coords = False

    if faceUV:
        active_uv_layer = mesh.uv_textures.active
        if not active_uv_layer:
            option_uv_coords = False

    if vertexColors:
        active_col_layer = mesh.vertex_colors.active
        if not active_col_layer:
            option_colors = False

    text = generate_ascii_model(mesh, scene,
                                option_vertices,
                                option_vertices_truncate,
                                option_faces,
                                option_normals,
                                option_edges,
                                option_uv_coords,
                                option_materials,
                                option_colors,
                                align_model,
                                flipyz,
                                option_scale,
                                obj.draw_type)

    write_file(filepath, text)

    # remove temp mesh

    bpy.data.meshes.remove(mesh)

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
        if obj.type == "MESH":
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

            visible = True
            #if obj.draw_type in ["BOUNDS", "WIRE"] and (meshCollider or castsShadow):
            if meshCollider or castsShadow:
                visible = False

            object_string = TEMPLATE_OBJECT % {
            "object_id"   : generate_string(object_id),
            "geometry_id" : generate_string(geometry_id),
            "group_id"    : group_string,
            "material_id" : material_string,

            "position"    : generate_vec3(position),
            "rotation"    : generate_vec3(rotation),
            "quaternion"  : generate_vec4(quaternion),
            "scale"       : generate_vec3(scale),

            "castsShadow"  : generate_bool_property(castsShadow),
            "meshCollider" : generate_bool_property(meshCollider),
            "visible"      : generate_bool_property(visible)
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
        if obj.type == "MESH":

            if len(obj.modifiers) > 0:
                name = obj.name
            else:
                name = obj.data.name

            if name not in geo_set:

                geometry_id = "geo_%s" % name
                model_filename = os.path.basename(generate_mesh_filename(name, data["filepath"]))

                geometry_string = TEMPLATE_GEOMETRY % {
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

    for img in bpy.data.images:

        texture_id = img.name
        texture_file = extract_texture_filename(img)

        texture_string = TEMPLATE_TEXTURE % {
        "texture_id"   : generate_string(texture_id),
        "texture_file" : generate_string(texture_file)
        }
        chunks.append(texture_string)

    return ",\n\n".join(chunks), len(chunks)

def extract_texture_filename(image):
    fn = bpy.path.abspath(image.filepath)
    fn = os.path.normpath(fn)
    fn_strip = os.path.basename(fn)
    return fn_strip

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

    material['mapDiffuse'] = ""
    material['mapLight'] = ""
    material['mapNormal'] = ""

    material["vertexColors"] = m.THREE_useVertexColors and option_colors
    
    # just take first textures of each, for the moment three.js materials can't handle more

    for i in range(len(m.texture_slots)):
        ts = m.texture_slots[i]
        if ts:
            t = ts.texture
            if ts.use and t.type == 'IMAGE':
                name = t.image.name

                if t.use_normal_map:
                    material['mapNormal'] = name
                else:
                    if not material['mapDiffuse']:
                        material['mapDiffuse'] = name
                    else:
                        material['mapLight'] = name

                if material['mapDiffuse'] and material['mapNormal'] and material['mapLight']:
                    break

    #if m.specular_intensity > 0.0 and (m.specular_color[0] > 0 or m.specular_color[1] > 0 or m.specular_color[2] > 0):
    #    material['shading'] = "Phong"
    #else:
    #    material['shading'] = "Lambert"

    material['shading'] = m.THREE_materialType

    return material

def generate_material_string(material):
    type_map = {
    "Lambert"   : "MeshLambertMaterial",
    "Phong"     : "MeshPhongMaterial"
    }

    material_id = material["name"]
    shading = material.get("shading", "Lambert")
    material_type = type_map.get(shading, "MeshBasicMaterial")

    #parameters = "color: %s" % generate_hex(rgb2int(material["colorDiffuse"]))
    parameters = "color: %d" % rgb2int(material["colorDiffuse"])
    parameters += ", opacity: %.2f" % material["transparency"]

    if shading == "Phong":
        #parameters += ", ambient: %s" % generate_hex(rgb2int(material["colorAmbient"]))
        #parameters += ", specular: %s" % generate_hex(rgb2int(material["colorSpecular"]))
        parameters += ", ambient: %d" % rgb2int(material["colorAmbient"])
        parameters += ", specular: %d" % rgb2int(material["colorSpecular"])
        parameters += ", shininess: %.1f" % material["specularCoef"]

    colorMap = material['mapDiffuse']
    lightMap = material['mapLight']
    normalMap  = material['mapNormal']

    if colorMap:
        parameters += ", map: %s" % generate_string(colorMap)
    if lightMap:
        parameters += ", lightMap: %s" % generate_string(lightMap)
    if normalMap:
        parameters += ", normalMap: %s" % generate_string(normalMap)

    if material['vertexColors']:
        parameters += ', vertexColors: "vertex"'
        
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
                #"color"         : generate_hex(rgb2int(light["color"])),
                "color"         : rgb2int(light["color"]),
                "intensity"     : light["intensity"]
                }

            elif light["type"] == "point":
                light_string = TEMPLATE_LIGHT_POINT % {
                "light_id"      : generate_string(light["name"]),
                "position"      : generate_vec3(light["position"]),
                #"color"         : generate_hex(rgb2int(light["color"])),
                "color"         : rgb2int(light["color"]),
                "intensity"     : light["intensity"]
                }

            chunks.append(light_string)

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

    default_camera = ""
    if data["use_cameras"]:
        default_camera = generate_string("default_camera")

    parameters = {
    "fname"     : data["source_file"],

    "sections"  : sections_string,

    "bgcolor"   : generate_vec3(DEFAULTS["bgcolor"]),
    "bgalpha"   : DEFAULTS["bgalpha"],
    "defcamera" :  generate_string(default_camera),

    "nobjects"      : nobjects,
    "ngeometries"   : ngeometries,
    "ntextures"     : ntextures,
    "nmaterials"    : nmaterials,

    "position"      : generate_vec3(DEFAULTS["position"]),
    "rotation"      : generate_vec3(DEFAULTS["rotation"]),
    "scale"         : generate_vec3(DEFAULTS["scale"])
    }

    text = TEMPLATE_SCENE_ASCII % parameters

    return text

def export_scene(scene, filepath, flipyz, option_colors, option_lights, option_cameras):

    source_file = os.path.basename(bpy.data.filepath)

    scene_text = ""
    data = {
    "scene"       : scene,
    "objects"     : scene.objects,
    "source_file" : source_file,
    "filepath"    : filepath,
    "flipyz"      : flipyz,
    "use_colors"  : option_colors,
    "use_lights"  : option_lights, 
    "use_cameras" : option_cameras
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
         option_edges = False,
         option_uv_coords = True,
         option_materials = True,
         option_colors = True,
         align_model = 0,
         option_export_scene = False,
         option_lights = False,
         option_cameras = False,
         option_scale = 1.0):

    filepath = ensure_extension(filepath, '.js')

    scene = context.scene

    if scene.objects.active:
        bpy.ops.object.mode_set(mode='OBJECT')

    if option_export_scene:

        export_scene(scene, filepath, option_flip_yz, option_colors, option_lights, option_cameras)

        geo_set = set()

        for obj in scene.objects:
            if obj.type == "MESH":

                # create extra copy of geometry with applied modifiers
                # (if they exist)

                if len(obj.modifiers) > 0:
                    name = obj.name

                # otherwise can share geometry

                else:
                    name = obj.data.name

                if name not in geo_set:
                    fname = generate_mesh_filename(name, filepath)
                    export_mesh(obj, scene, fname,
                                option_vertices,
                                option_vertices_truncate,
                                option_faces,
                                option_normals,
                                option_edges,
                                option_uv_coords,
                                option_materials,
                                option_colors,
                                False,
                                option_flip_yz,
                                option_scale,
                                False)

                    geo_set.add(name)

    else:

        obj = context.object
        if not obj:
            raise Exception("Error, Select 1 active object or select 'export scene'")

        export_mesh(obj, scene, filepath,
                    option_vertices,
                    option_vertices_truncate,
                    option_faces,
                    option_normals,
                    option_edges,
                    option_uv_coords,
                    option_materials,
                    option_colors,
                    align_model,
                    option_flip_yz,
                    option_scale,
                    True)


    return {'FINISHED'}
