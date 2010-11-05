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

# Based on export_ply.py
# Contributors: Mr.doob, Kikko, alteredq

"""
This script exports the selected object for the three.js engine.
"""

import bpy
import mathutils

import os
import os.path
import math

def save(operator, context, filepath="", use_modifiers=True, use_normals=True, use_uv_coords=True, use_colors=True):

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

    file = open(filepath, 'w')

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
    vertexColors = len(mesh.vertex_colors) > 0

    if (not faceUV) and (not vertexUV):
        use_uv_coords = False
    if not vertexColors:
        use_colors = False

    if not use_uv_coords:
        faceUV = vertexUV = False
    if not use_colors:
        vertexColors = False

    if faceUV:
        active_uv_layer = mesh.uv_textures.active
        if not active_uv_layer:
            use_uv_coords = False
            faceUV = None
        else:
            active_uv_layer = active_uv_layer.data

    if vertexColors:
        active_col_layer = mesh.vertex_colors.active
        if not active_col_layer:
            use_colors = False
            vertexColors = None
        else:
            active_col_layer = active_col_layer.data

    # incase
    color = uvcoord = uvcoord_key = normal = normal_key = None

    file.write('// Generated with Blender 2.54 exporter\n')
    file.write('// http://github.com/mrdoob/three.js/tree/master/utils/exporters/blender\n\n')

    file.write('var %s = function () {\n\n' % classname)

    file.write('\tvar scope = this;\n\n')

    file.write('\tTHREE.Geometry.call( this );\n\n')

    for v in mesh.vertices:
        file.write('\tv( %.6f, %.6f, %.6f );\n' % (v.co.x, v.co.y, v.co.z)) # co

    file.write('\n')

    if use_normals:
        for f in mesh.faces:
            if len(f.vertices) == 3:
                file.write('\tf3( %d, %d, %d, %.6f, %.6f, %.6f );\n' % (f.vertices[0], f.vertices[1], f.vertices[2], f.normal[0], f.normal[1], f.normal[2]))
            else:
                file.write('\tf4( %d, %d, %d, %d, %.6f, %.6f, %.6f );\n' % (f.vertices[0], f.vertices[1], f.vertices[2], f.vertices[3], f.normal[0], f.normal[1], f.normal[2]))

    else:
        for f in mesh.faces:
            if len(f.vertices) == 3:
                file.write('\tf3( %d, %d, %d );\n' % (f.vertices[0], f.vertices[1], f.vertices[2]))
            else:
                file.write('\tf4( %d, %d, %d, %d );\n' % (f.vertices[0], f.vertices[1], f.vertices[2], f.vertices[3]))

    face_index_pairs = [ (face, index) for index, face in enumerate(mesh.faces)]

    if use_uv_coords:
        file.write('\n')
        for f, f_index in face_index_pairs:
            tface = mesh.uv_textures[0].data[f_index]
            if len(f.vertices) == 3:
                file.write('\tuv( %.6f, %.6f, %.6f, %.6f, %.6f, %.6f );\n' % (tface.uv1[0], 1.0-tface.uv1[1], tface.uv2[0], 1.0-tface.uv2[1], tface.uv3[0], 1.0-tface.uv3[1]))
            else:
                file.write('\tuv( %.6f, %.6f, %.6f, %.6f, %.6f, %.6f, %.6f, %.6f );\n' % (tface.uv1[0], 1.0-tface.uv1[1], tface.uv2[0], 1.0-tface.uv2[1], tface.uv3[0], 1.0-tface.uv3[1], tface.uv4[0], 1.0-tface.uv4[1]))

    file.write('\n')

    file.write('\tfunction v( x, y, z ) {\n\n')
    file.write('\t\tscope.vertices.push( new THREE.Vertex( new THREE.Vector3( x, y, z ) ) );\n\n')
    file.write('\t}\n\n')

    file.write('\tfunction f3( a, b, c, nx, ny, nz ) {\n\n')
    file.write('\t\tscope.faces.push( new THREE.Face3( a, b, c, (nx || ny || nz) ? new THREE.Vector3( nx, ny, nz ) : null ) );\n\n')
    file.write('\t}\n\n')

    file.write('\tfunction f4( a, b, c, d, nx, ny, nz ) {\n\n')
    file.write('\t\tscope.faces.push( new THREE.Face4( a, b, c, d, (nx || ny || nz) ? new THREE.Vector3( nx, ny, nz ) : null ) );\n\n')
    file.write('\t}\n\n')

    file.write('\tfunction uv( u1, v1, u2, v2, u3, v3, u4, v4 ) {\n\n')
    file.write('\t\tvar uv = [];\n')
    file.write('\t\tuv.push( new THREE.UV( u1, v1 ) );\n')
    file.write('\t\tuv.push( new THREE.UV( u2, v2 ) );\n')
    file.write('\t\tuv.push( new THREE.UV( u3, v3 ) );\n')
    file.write('\t\tif ( u4 && v4 ) uv.push( new THREE.UV( u4, v4 ) );\n')
    file.write('\t\tscope.uvs.push( uv );\n')
    file.write('\t}\n\n')

    file.write('\tthis.computeCentroids();\n')

    if not use_normals:
        file.write('\tthis.computeNormals();\n')

    file.write('\n}\n\n')

    file.write('%s.prototype = new THREE.Geometry();\n' % classname)
    file.write('%s.prototype.constructor = %s;' % (classname, classname))

    file.close()

    print("writing", filepath, "done")

    if use_modifiers:
        bpy.data.meshes.remove(mesh)

    return {'FINISHED'}
