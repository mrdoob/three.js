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
# Contributors: Mr.doob, Kikko

"""
This script exports the selected object for the three.js engine.
"""

import bpy
import os

def save(operator, context, filepath="", use_modifiers=True, use_normals=True, use_uv_coords=True, use_colors=True):
    
    def rvec3d(v):
        return round(v[0], 6), round(v[1], 6), round(v[2], 6)

    def rvec2d(v):
        return round(v[0], 6), round(v[1], 6)
    
    scene = context.scene
    obj = context.object

    if not filepath.lower().endswith('.js'):
        filepath += '.js'

    classname = filepath.split('/')[-1].replace('.js','')

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

    # mesh.transform(obj.matrix_world) # XXX

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

    file.write('// Generated with Blender 2.54 exporter\n\n')
    
    file.write('var %s = function () {\n\n' % classname)

    file.write('\tvar scope = this;\n\n')

    file.write('\tTHREE.Geometry.call( this );\n\n')

    for v in mesh.vertices:
        file.write('\tv( %.6f, %.6f, %.6f );\n' % (v.co.x, v.co.z, -v.co.y)) # co

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
    file.write('\t\tscope.faces.push( new THREE.Face3( a, b, c, nx && ny && nz ? new THREE.Vector3( nx, ny, nz ) : null ) );\n\n')
    file.write('\t}\n\n')

    file.write('\tfunction f4( a, b, c, d, nx, ny, nz ) {\n\n')
    file.write('\t\tscope.faces.push( new THREE.Face4( a, b, c, d, nx && ny && nz ? new THREE.Vector3( nx, ny, nz ) : null ) );\n\n')
    file.write('\t}\n\n')

    file.write('\tfunction uv( u1, v1, u2, v2, u3, v3, u4, v4 ) {\n\n')
    file.write('\t\tvar uv = [];\n')
    file.write('\t\tuv.push( new THREE.UV( u1, v1 ) );\n')
    file.write('\t\tuv.push( new THREE.UV( u2, v2 ) );\n')
    file.write('\t\tuv.push( new THREE.UV( u3, v3 ) );\n')
    file.write('\t\tif ( u4 && v4 ) uv.push( new THREE.UV( u4, v4 ) );\n')
    file.write('\t\tscope.uvs.push( uv );\n')
    file.write('\t}\n\n')

    file.write('}\n\n')

    file.write('%s.prototype = new THREE.Geometry();\n' % classname)
    file.write('%s.prototype.constructor = %s;' % (classname, classname))

    file.close()

    print("writing", filepath, "done")

    if use_modifiers:
        bpy.data.meshes.remove(mesh)    
    
    """
    mesh_vertices = mesh.vertices # save a lookup
    ply_vertices = [] # list of dictionaries
    # vdict = {} # (index, normal, uv) -> new index
    vdict = [{} for i in range(len(mesh_vertices))]
    ply_faces = [[] for f in range(len(mesh.faces))]
    vert_count = 0
    for i, f in enumerate(mesh.faces):

        smooth = f.use_smooth
        if not smooth:
            normal = tuple(f.normal)
            normal_key = rvec3d(normal)

        if faceUV:
            uv = active_uv_layer[i]
            uv = uv.uv1, uv.uv2, uv.uv3, uv.uv4 # XXX - crufty :/
        if vertexColors:
            col = active_col_layer[i]
            col = col.color1, col.color2, col.color3, col.color4

        f_vertices = f.vertices

        pf = ply_faces[i]
        for j, vidx in enumerate(f_vertices):
            v = mesh_vertices[vidx]

            if smooth:
                normal = tuple(v.normal)
                normal_key = rvec3d(normal)

            if faceUV:
                uvcoord = uv[j][0], 1.0 - uv[j][1]
                uvcoord_key = rvec2d(uvcoord)
            elif vertexUV:
                uvcoord = v.uvco[0], 1.0 - v.uvco[1]
                uvcoord_key = rvec2d(uvcoord)

            if vertexColors:
                color = col[j]
                color = int(color[0] * 255.0), int(color[1] * 255.0), int(color[2] * 255.0)


            key = normal_key, uvcoord_key, color

            vdict_local = vdict[vidx]
            pf_vidx = vdict_local.get(key) # Will be None initially

            if pf_vidx == None: # same as vdict_local.has_key(key)
                pf_vidx = vdict_local[key] = vert_count
                ply_vertices.append((vidx, normal, uvcoord, color))
                vert_count += 1

            pf.append(pf_vidx)

    file.write('ply\n')
    file.write('format ascii 1.0\n')
    file.write('comment Created by Blender %s - www.blender.org, source file: %r\n' % (bpy.app.version_string, os.path.basename(bpy.data.filepath)))

    file.write('element vertex %d\n' % len(ply_vertices))

    file.write('property float x\n')
    file.write('property float y\n')
    file.write('property float z\n')

    if use_normals:
        file.write('property float nx\n')
        file.write('property float ny\n')
        file.write('property float nz\n')
    if use_uv_coords:
        file.write('property float s\n')
        file.write('property float t\n')
    if use_colors:
        file.write('property uchar red\n')
        file.write('property uchar green\n')
        file.write('property uchar blue\n')

    file.write('element face %d\n' % len(mesh.faces))
    file.write('property list uchar uint vertex_indices\n')
    file.write('end_header\n')

    for i, v in enumerate(ply_vertices):
        file.write('%.6f %.6f %.6f ' % tuple(mesh_vertices[v[0]].co)) # co
        if use_normals:
            file.write('%.6f %.6f %.6f ' % v[1]) # no
        if use_uv_coords:
            file.write('%.6f %.6f ' % v[2]) # uv
        if use_colors:
            file.write('%u %u %u' % v[3]) # col
        file.write('\n')

    for pf in ply_faces:
        if len(pf) == 3:
            file.write('3 %d %d %d\n' % tuple(pf))
        else:
            file.write('4 %d %d %d %d\n' % tuple(pf))

    file.close()
    print("writing %r done" % filepath)

    if use_modifiers:
        bpy.data.meshes.remove(mesh)
    """
    
    # XXX
    """
    if is_editmode:
        Blender.Window.EditMode(1, '', 0)
    """
    
    return {'FINISHED'}
