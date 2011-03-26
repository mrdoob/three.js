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

# Based on import_obj.py
# Contributors: alteredq


"""
Blender importer for Three.js (ASCII JSON format).

"""

import os
import time
import json
import bpy
import mathutils
from mathutils.geometry import tesselate_polygon
from io_utils import load_image, unpack_list, unpack_face_list

# #####################################################
# Utils
# #####################################################

def splitArray(data, chunkSize):
    result = []
    chunk = []
    for i in range(len(data)):
        if i > 0 and i % chunkSize == 0:
            result.append(chunk)
            chunk = []
        chunk.append(data[i])
    result.append(chunk)
    return result


def extract_json_string(text):
    marker_begin = "var model ="
    marker_end = "postMessage"
    
    start = text.find(marker_begin) + len(marker_begin)
    end = text.find(marker_end)
    end = text.rfind("}", start, end)
    return text[start:end+1].strip()

# #####################################################
# Parser
# #####################################################

def load(operator, context, filepath):
    
    print('\nimporting %r' % filepath)

    time_main = time.time()

    verts_loc = []
    verts_tex = []
    faces = [] 
    materials = []

    print("\tparsing JSON file...")
    
    time_sub = time.time()

    file = open(filepath, 'rU')
    rawcontent = file.read()
    file.close()

    json_string = extract_json_string(rawcontent)
    data = json.loads( json_string )
    
    time_new = time.time()

    print('parsing %.4f sec' % (time_new - time_sub))
    
    time_sub = time_new

    verts_loc = splitArray(data["vertices"], 3)
    verts_loc[:] = [(v[0], v[2], -v[1]) for v in verts_loc]

    # deselect all

    bpy.ops.object.select_all(action='DESELECT')

    scene = context.scene
    new_objects = []

    print('\tbuilding geometry...\n\tverts:%i faces:%i materials: %i ...' % ( len(verts_loc), len(faces), len(materials) ))

    # Create new obj
    
    for obj in new_objects:
        base = scene.objects.link(obj)
        base.select = True

    scene.update()

    time_new = time.time()

    print('finished importing: %r in %.4f sec.' % (filepath, (time_new - time_main)))
    return {'FINISHED'}


if __name__ == "__main__":
    register()
