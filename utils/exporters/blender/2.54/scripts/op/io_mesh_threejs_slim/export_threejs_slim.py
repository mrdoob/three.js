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
    - model alignment
    - copy used images to folder where exported file goes
    - export all selected meshes
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

# default colors for debugging (each material gets one distinct color): 
# white, red, green, blue, yellow, cyan, magenta
COLORS = [0xeeeeee, 0xee0000, 0x00ee00, 0x0000ee, 0xeeee00, 0x00eeee, 0xee00ee]


# #####################################################
# Templates
# #####################################################
TEMPLATE_FILE_ASCII = """\
//  vertices: %(nvertex)d
//  faces: %(nface)d 
//  materials: %(nmaterial)d
//
//  Generated with Blender 2.54 slim exporter
//  https://github.com/alteredq/three.js/tree/master/utils/exporters/blender/


var model = {
    'materials': [%(materials)s],

    'normals': [%(normals)s],

    'vertices': [%(vertices)s],

    'uvs': [%(uvs)s],

    'triangles': [%(triangles)s],
    'triangles_n': [%(triangles_n)s],
    'triangles_uv': [%(triangles_uv)s],
    'triangles_n_uv': [%(triangles_n_uv)s],

    'quads': [%(quads)s],
    'quads_n': [%(quads_n)s],
    'quads_uv': [%(quads_uv)s],
    'quads_n_uv': [%(quads_n_uv)s],

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
# Utils
# #####################################################
def veckey3d(v):
    return round(v.x, 6), round(v.y, 6), round(v.z, 6)

def veckey2d(v):
    return round(v[0], 6), round(v[1], 6)

def get_normal_indices(v, normals, mesh):
    n = []
    mv = mesh.vertices
    for i in v:
        n.append( normals[veckey3d(mv[i].normal)] )
    return n

def get_uv_indices(f, uvs, mesh):
    uv = []
    face_index = f[1]
    uv_layer = mesh.uv_textures.active.data
    for i in uv_layer[face_index].uv:
        uv.append( uvs[veckey2d(i)] )
    return uv

# #####################################################
# Alignment
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
# Elements
# #####################################################
def generate_vertex(v):
    return TEMPLATE_VERTEX % (v.co.x, v.co.y, v.co.z)

def generate_normal(n):
    return TEMPLATE_N % (n[0], n[1], n[2])

def generate_uv(uv):
    return TEMPLATE_UV % (uv[0], 1.0 - uv[1])

def generate_triangle(f):
    v = f[0].vertices
    m = f[0].material_index
    return TEMPLATE_TRI % (v[0], v[1], v[2], 
                           m)
    
def generate_quad(f):
    v = f[0].vertices
    m = f[0].material_index
    return TEMPLATE_QUAD % (v[0], v[1], v[2], v[3], 
                            m)
    
def generate_triangle_n(f, normals, mesh):    
    v = f[0].vertices
    m = f[0].material_index
    n = get_normal_indices(v, normals, mesh)
    
    return TEMPLATE_TRI_N % (v[0], v[1], v[2], 
                             m, 
                             n[0], n[1], n[2])
    
def generate_quad_n(f, normals, mesh):    
    v = f[0].vertices
    m = f[0].material_index
    n = get_normal_indices(v, normals, mesh)
    
    return TEMPLATE_QUAD_N % (v[0], v[1], v[2], v[3],
                              m, 
                              n[0], n[1], n[2], n[3])

def generate_triangle_uv(f, uvs, mesh):
    v = f[0].vertices  
    m = f[0].material_index
    uv = get_uv_indices(f, uvs, mesh)
    
    return TEMPLATE_TRI_UV % (v[0], v[1], v[2], 
                              m, 
                              uv[0], uv[1], uv[2])
    
def generate_quad_uv(f, uvs, mesh):
    v = f[0].vertices  
    m = f[0].material_index
    uv = get_uv_indices(f, uvs, mesh)
    
    return TEMPLATE_QUAD_UV % (v[0], v[1], v[2], v[3],
                               m, 
                               uv[0], uv[1], uv[2], uv[3])
                              
def generate_triangle_n_uv(f, normals, uvs, mesh):
    v = f[0].vertices    
    m = f[0].material_index
    n = get_normal_indices(v, normals, mesh)
    uv = get_uv_indices(f, uvs, mesh)    
    
    return TEMPLATE_TRI_N_UV % (v[0], v[1], v[2], 
                                m, 
                                n[0], n[1], n[2], 
                                uv[0], uv[1], uv[2])
    
def generate_quad_n_uv(f, normals, uvs, mesh):
    v = f[0].vertices    
    m = f[0].material_index
    n = get_normal_indices(v, normals, mesh)
    uv = get_uv_indices(f, uvs, mesh)    
    
    return TEMPLATE_QUAD_N_UV % (v[0], v[1], v[2], v[3], 
                                 m, 
                                 n[0], n[1], n[2], n[3],
                                 uv[0], uv[1], uv[2], uv[3])
                                
# #####################################################
# Faces
# #####################################################
def sort_faces(faces, use_normals, use_uv_coords):
    data = {
    'triangles_flat': [],
    'triangles_flat_uv': [],
    'triangles_smooth': [],
    'triangles_smooth_uv': [],
    
    'quads_flat': [],
    'quads_flat_uv': [],
    'quads_smooth': [],
    'quads_smooth_uv': []
    }
    
    for i, f in enumerate(faces):
        
        if len(f.vertices) == 3:
            
            if use_normals and use_uv_coords:
                data['triangles_smooth_uv'].append([f,i])
            elif use_normals and not use_uv_coords:
                data['triangles_smooth'].append([f,i])
            elif use_uv_coords:
                data['triangles_flat_uv'].append([f,i])
            else:
                data['triangles_flat'].append([f,i])
        
        elif len(f.vertices) == 4:
            
            if use_normals and use_uv_coords:
                data['quads_smooth_uv'].append([f,i])
            elif use_normals and not use_uv_coords:
                data['quads_smooth'].append([f,i])
            elif use_uv_coords:
                data['quads_flat_uv'].append([f,i])
            else:
                data['quads_flat'].append([f,i])
            
    return data
    
# #####################################################
# Normals
# #####################################################
def extract_vertex_normals(mesh, use_normals):
    if not use_normals:
        return {}
        
    count = 0
    normals = {}
    
    for f in mesh.faces:
        for v in f.vertices:
            key = veckey3d(mesh.vertices[v].normal)
            if key not in normals:
                normals[key] = count
                count += 1
    
    return normals
    
def generate_normals(normals, use_normals):
    if not use_normals:
        return ""
    
    chunks = []
    for key, index in sorted(normals.items(), key=operator.itemgetter(1)):
        chunks.append(key)
        
    return ",".join(generate_normal(n) for n in chunks)
    
# #####################################################
# UVs
# #####################################################
def extract_uvs(mesh, use_uv_coords):
    if not use_uv_coords:
        return {}
        
    count = 0
    uvs = {}
    
    uv_layer = mesh.uv_textures.active.data
    
    for face_index, face in enumerate(mesh.faces):
        for uv_index, uv in enumerate(uv_layer[face_index].uv):
            key = veckey2d(uv)
            if key not in uvs:
                uvs[key] = count
                count += 1
            
    return uvs
    
def generate_uvs(uvs, use_uv_coords):
    if not use_uv_coords:
        return ""
        
    chunks = []
    for key, index in sorted(uvs.items(), key=operator.itemgetter(1)):
        chunks.append(key)
        
    return ",".join(generate_uv(n) for n in chunks)
    
# #####################################################
# Materials
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

def generate_mtl(materials):
    """Generate dummy materials.
    """
    
    mtl = {}
    for m in materials:
        index = materials[m]
        mtl[m] = {
            'a_dbg_name': m,
            'a_dbg_index': index,
            'a_dbg_color': generate_color(index)
        }
    return mtl

def value2string(v):
    if type(v)==str and v[0] != "0":
        return '"%s"' % v
    return str(v)
    
def generate_materials(mtl, materials):
    """Generate JS array of materials objects    
    """
    
    mtl_array = []
    for m in mtl:
        index = materials[m]
        
        # add debug information
        #  materials should be sorted according to how
        #  they appeared in OBJ file (for the first time)
        #  this index is identifier used in face definitions
        mtl[m]['a_dbg_name'] = m
        mtl[m]['a_dbg_index'] = index
        mtl[m]['a_dbg_color'] = generate_color(index)
        
        mtl_raw = ",\n".join(['\t"%s" : %s' % (n, value2string(v)) for n,v in sorted(mtl[m].items())])
        mtl_string = "\t{\n%s\n\t}" % mtl_raw
        mtl_array.append([index, mtl_string])
        
    return ",\n\n".join([m for i,m in sorted(mtl_array)])
        
def extract_materials(mesh, scene):
    world = scene.world

    materials = {}
    for m in mesh.materials:
        materials[m.name] = {}
        materials[m.name]['col_diffuse'] = [m.diffuse_intensity * m.diffuse_color[0], 
                                            m.diffuse_intensity * m.diffuse_color[1], 
                                            m.diffuse_intensity * m.diffuse_color[2]]
                                            
        materials[m.name]['col_specular'] = [m.specular_intensity * m.specular_color[0], 
                                             m.specular_intensity * m.specular_color[1], 
                                             m.specular_intensity * m.specular_color[2]]
                                             
        materials[m.name]['col_ambient'] = [m.ambient * world.ambient_color[0], 
                                            m.ambient * world.ambient_color[1], 
                                            m.ambient * world.ambient_color[2]]
                                            
        materials[m.name]['transparency'] = m.alpha
        
        # not sure about mapping values to Blinn-Phong shader
        # Blender uses INT from [1,511] with default 0
        # http://www.blender.org/documentation/blender_python_api_2_54_0/bpy.types.Material.html#bpy.types.Material.specular_hardness
        materials[m.name]["specular_coef"] = m.specular_hardness 
        
        if m.active_texture and m.active_texture.type == 'IMAGE':
            fn = bpy.path.abspath(m.active_texture.image.filepath)
            fn = os.path.normpath(fn)
            fn_strip = os.path.basename(fn)
            materials[m.name]['map_diffuse'] = fn_strip
            
    return materials
        
def generate_materials_string(mesh, scene):

    random.seed(42) # to get well defined color order for debug materials

    materials = {}
    for i, m in enumerate(mesh.materials):
        materials[m.name] = i
    
    if not materials:
        materials = { 'default':0 }
    
    # default dummy materials
    mtl = generate_mtl(materials)
    
    # extract real materials from the mesh
    mtl.update(extract_materials(mesh, scene))
    
    return generate_materials(mtl, materials)
        
# #####################################################
# ASCII exporter
# #####################################################
def generate_ascii_model(mesh, scene, use_normals, use_uv_coords, align_model):
    
    vertices = mesh.vertices[:]
    
    if align_model == 1:
        center(vertices)
    elif align_model == 2:
        bottom(vertices)
    elif align_model == 3:
        top(vertices)
    
    sfaces = sort_faces(mesh.faces, use_normals, use_uv_coords)
    
    normals = extract_vertex_normals(mesh, use_normals)
    uvs = extract_uvs(mesh, use_uv_coords)
    
    text = TEMPLATE_FILE_ASCII % {
    "vertices"      : ",".join(generate_vertex(v) for v in vertices),
    
    "triangles"     : ",".join(generate_triangle(f) for f in sfaces['triangles_flat']),
    "triangles_n"   : ",".join(generate_triangle_n(f, normals, mesh) for f in sfaces['triangles_smooth']),
    "triangles_uv"  : ",".join(generate_triangle_uv(f, uvs, mesh) for f in sfaces['triangles_flat_uv']),
    "triangles_n_uv": ",".join(generate_triangle_n_uv(f, normals, uvs, mesh) for f in sfaces['triangles_smooth_uv']),
    
    "quads"         : ",".join(generate_quad(f) for f in sfaces['quads_flat']),
    "quads_n"       : ",".join(generate_quad_n(f, normals, mesh) for f in sfaces['quads_smooth']),
    "quads_uv"      : ",".join(generate_quad_uv(f, uvs, mesh) for f in sfaces['quads_flat_uv']),
    "quads_n_uv"    : ",".join(generate_quad_n_uv(f, normals, uvs, mesh) for f in sfaces['quads_smooth_uv']),
    
    "uvs"           : generate_uvs(uvs, use_uv_coords),
    "normals"       : generate_normals(normals, use_normals),
    
    "materials" : generate_materials_string(mesh, scene),
    
    "nvertex"   : len(mesh.vertices),
    "nface"     : len(mesh.faces),
    "nmaterial" : 0
    }
    
    return text

# #####################################################
# Main
# #####################################################
def save(operator, context, filepath="", use_modifiers=True, use_normals=True, use_uv_coords=True, align_model=1):

    def rvec3d(v):
        return round(v[0], 6), round(v[1], 6), round(v[2], 6)

    def rvec2d(v):
        return round(v[0], 6), round(v[1], 6)

    scene = context.scene
    obj = context.object

    if not filepath.lower().endswith('.js'):
        filepath += '.js'

    classname = os.path.basename(filepath).split(".")[0]

    if not obj:
        raise Exception("Error, Select 1 active object")

    if scene.objects.active:
        bpy.ops.object.mode_set(mode='OBJECT')

    if use_modifiers:
        mesh = obj.create_mesh(scene, True, 'PREVIEW')
    else:
        mesh = obj.data

    if not mesh:
        raise Exception("Error, could not get mesh data from active object")

    # that's what Blender's native export_obj.py does
    x_rot = mathutils.Matrix.Rotation(-math.pi/2, 4, 'X')
    mesh.transform(x_rot * obj.matrix_world)
    mesh.calc_normals()
    
    faceUV = (len(mesh.uv_textures) > 0)
    vertexUV = (len(mesh.sticky) > 0)

    if (not faceUV) and (not vertexUV):
        use_uv_coords = False

    if faceUV:
        active_uv_layer = mesh.uv_textures.active
        if not active_uv_layer:
            use_uv_coords = False

    text = generate_ascii_model(mesh, scene, use_normals, use_uv_coords, align_model)
    file = open(filepath, 'w')
    file.write(text)
    file.close()

    print("writing", filepath, "done")

    if use_modifiers:
        bpy.data.meshes.remove(mesh)

    return {'FINISHED'}
