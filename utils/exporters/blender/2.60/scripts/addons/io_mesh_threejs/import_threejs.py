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
Blender importer for Three.js (ASCII JSON format).

"""

import os
import time
import json
import bpy
import mathutils
from mathutils.geometry import tesselate_polygon
from bpy_extras.image_utils import load_image

# #####################################################
# Generators
# #####################################################
def setColor(c, t):
    c.r = t[0]
    c.g = t[1]
    c.b = t[2]

def create_texture(filename, modelpath):
    name = filename
    texture = bpy.data.textures.new(name, type='IMAGE')

    image = load_image(filename, modelpath)
    has_data = False

    if image:
        texture.image = image
        has_data = image.has_data

    return texture

def create_materials(data, modelpath):
    materials = []
    materials_data = data.get("materials", [])

    for i, m in enumerate(materials_data):

        name = m.get("DbgName", "material_%d" % i)

        colorAmbient = m.get("colorAmbient", None)
        colorDiffuse = m.get("colorDiffuse", None)
        colorSpecular = m.get("colorSpecular", None)
        alpha = m.get("transparency", 1.0)
        specular_hardness = m.get("specularCoef", 0)

        mapDiffuse = m.get("mapDiffuse", None)
        mapLightmap = m.get("mapLightmap", None)

        vertexColorsType = m.get("vertexColors", False)

        useVertexColors = False
        if vertexColorsType:
            useVertexColors = True

        material = bpy.data.materials.new(name)

        material.THREE_useVertexColors = useVertexColors

        if colorDiffuse:
            setColor(material.diffuse_color, colorDiffuse)
            material.diffuse_intensity = 1.0

        if colorSpecular:
            setColor(material.specular_color, colorSpecular)
            material.specular_intensity = 1.0

        if alpha < 1.0:
            material.alpha = alpha
            material.use_transparency = True

        if specular_hardness:
            material.specular_hardness = specular_hardness

        if mapDiffuse:
            texture = create_texture(mapDiffuse, modelpath)
            mtex = material.texture_slots.add()
            mtex.texture = texture
            mtex.texture_coords = 'UV'
            mtex.use = True
            mtex.use_map_color_diffuse = True

            material.active_texture = texture

        materials.append(material)

    return materials

def create_mesh_object(name, vertices, materials, face_data, flipYZ, recalculate_normals):

    faces         = face_data["faces"]
    vertexNormals = face_data["vertexNormals"]
    vertexColors  = face_data["vertexColors"]
    vertexUVs     = face_data["vertexUVs"]
    faceMaterials = face_data["materials"]
    faceColors    = face_data["faceColors"]

    edges = []

    # Create a new mesh

    me = bpy.data.meshes.new(name)
    me.from_pydata(vertices, edges, faces)

    # Handle normals

    if not recalculate_normals:
        me.update(calc_edges = True)

    if face_data["hasVertexNormals"]:

        print("setting vertex normals")

        for fi in range(len(faces)):

            if vertexNormals[fi]:

                #print("setting face %i with %i vertices" % (fi, len(normals[fi])))

                # if me.update() is called after setting vertex normals
                # setting face.use_smooth overrides these normals
                #  - this fixes weird shading artefacts (seems to come from sharing
                #    of vertices between faces, didn't find a way how to set vertex normals
                #    per face use of vertex as opposed to per vertex),
                #  - probably this just overrides all custom vertex normals
                #  - to preserve vertex normals from the original data
                #    call me.update() before setting them

                me.faces[fi].use_smooth = True

                if not recalculate_normals:
                    for j in range(len(vertexNormals[fi])):

                        vertexNormal = vertexNormals[fi][j]

                        x = vertexNormal[0]
                        y = vertexNormal[1]
                        z = vertexNormal[2]

                        if flipYZ:
                            tmp = y
                            y = -z
                            z = tmp

                            # flip normals (this make them look consistent with the original before export)

                            #x = -x
                            #y = -y
                            #z = -z

                        vi = me.faces[fi].vertices[j]

                        me.vertices[vi].normal.x = x
                        me.vertices[vi].normal.y = y
                        me.vertices[vi].normal.z = z

    if recalculate_normals:
        me.update(calc_edges = True)

    # Handle colors

    if face_data["hasVertexColors"]:

        print("setting vertex colors")

        me.vertex_colors.new("vertex_color_layer_0")

        for fi in range(len(faces)):

            if vertexColors[fi]:

                face_colors = me.vertex_colors[0].data[fi]
                face_colors = face_colors.color1, face_colors.color2, face_colors.color3, face_colors.color4

                for vi in range(len(vertexColors[fi])):

                    r = vertexColors[fi][vi][0]
                    g = vertexColors[fi][vi][1]
                    b = vertexColors[fi][vi][2]

                    face_colors[vi].r = r
                    face_colors[vi].g = g
                    face_colors[vi].b = b

    elif face_data["hasFaceColors"]:

        print("setting vertex colors from face colors")

        me.vertex_colors.new("vertex_color_layer_0")

        for fi in range(len(faces)):

            if faceColors[fi]:

                r = faceColors[fi][0]
                g = faceColors[fi][1]
                b = faceColors[fi][2]

                face_colors = me.vertex_colors[0].data[fi]
                face_colors = face_colors.color1, face_colors.color2, face_colors.color3, face_colors.color4

                for vi in range(len(faces[fi])):

                    face_colors[vi].r = r
                    face_colors[vi].g = g
                    face_colors[vi].b = b

    # Handle uvs

    if face_data["hasVertexUVs"]:

        print("setting vertex uvs")

        for li, layer in enumerate(vertexUVs):

            me.uv_textures.new("uv_layer_%d" % li)

            for fi in range(len(faces)):

                if layer[fi]:

                    uv_face = me.uv_textures[li].data[fi]
                    face_uvs = uv_face.uv1, uv_face.uv2, uv_face.uv3, uv_face.uv4

                    for vi in range(len(layer[fi])):

                        u = layer[fi][vi][0]
                        v = layer[fi][vi][1]

                        face_uvs[vi].x = u
                        face_uvs[vi].y = 1.0 - v

                    active_texture = materials[faceMaterials[fi]].active_texture

                    if active_texture:
                        # this property doesn't exist anymore in Blender 2.60
                        #uv_face.use_image = True
                        uv_face.image = active_texture.image


    # Handle materials # 1

    if face_data["hasMaterials"]:


        print("setting materials (mesh)")

        for m in materials:

            me.materials.append(m)

        print("setting materials (faces)")

        for fi in range(len(faces)):

            if faceMaterials[fi] >= 0:

                me.faces[fi].material_index = faceMaterials[fi]

    # Create a new object

    ob = bpy.data.objects.new(name, me)
    ob.data = me                                # link the mesh data to the object


    scene = bpy.context.scene                   # get the current scene
    scene.objects.link(ob)                      # link the object into the scene

    ob.location = scene.cursor_location         # position object at 3d-cursor


# #####################################################
# Faces
# #####################################################

def extract_faces(data):

    result = {
    "faces"         : [],
    "materials"     : [],
    "faceUVs"       : [],
    "vertexUVs"     : [],
    "faceNormals"   : [],
    "vertexNormals" : [],
    "faceColors"    : [],
    "vertexColors"  : [],

    "hasVertexNormals"  : False,
    "hasVertexUVs"      : False,
    "hasVertexColors"   : False,
    "hasFaceColors"     : False,
    "hasMaterials"      : False
    }

    faces = data.get("faces", [])
    normals = data.get("normals", [])
    colors = data.get("colors", [])

    offset = 0
    zLength = len(faces)

    # disregard empty arrays

    nUvLayers = 0

    for layer in data["uvs"]:

        if len(layer) > 0:
            nUvLayers += 1
            result["faceUVs"].append([])
            result["vertexUVs"].append([])


    while ( offset < zLength ):

        type = faces[ offset ]
        offset += 1

        isQuad          	= isBitSet( type, 0 )
        hasMaterial         = isBitSet( type, 1 )
        hasFaceUv           = isBitSet( type, 2 )
        hasFaceVertexUv     = isBitSet( type, 3 )
        hasFaceNormal       = isBitSet( type, 4 )
        hasFaceVertexNormal = isBitSet( type, 5 )
        hasFaceColor	    = isBitSet( type, 6 )
        hasFaceVertexColor  = isBitSet( type, 7 )

        #print("type", type, "bits", isQuad, hasMaterial, hasFaceUv, hasFaceVertexUv, hasFaceNormal, hasFaceVertexNormal, hasFaceColor, hasFaceVertexColor)

        result["hasVertexUVs"] = result["hasVertexUVs"] or hasFaceVertexUv
        result["hasVertexNormals"] = result["hasVertexNormals"] or hasFaceVertexNormal
        result["hasVertexColors"] = result["hasVertexColors"] or hasFaceVertexColor
        result["hasFaceColors"] = result["hasFaceColors"] or hasFaceColor
        result["hasMaterials"] = result["hasMaterials"] or hasMaterial

        # vertices

        if isQuad:

            a = faces[ offset ]
            offset += 1

            b = faces[ offset ]
            offset += 1

            c = faces[ offset ]
            offset += 1

            d = faces[ offset ]
            offset += 1

            face = [a, b, c, d]

            nVertices = 4

        else:

            a = faces[ offset ]
            offset += 1

            b = faces[ offset ]
            offset += 1

            c = faces[ offset ]
            offset += 1

            face = [a, b, c]

            nVertices = 3

        result["faces"].append(face)

        # material

        if hasMaterial:

            materialIndex = faces[ offset ]
            offset += 1

        else:

            materialIndex = -1

        result["materials"].append(materialIndex)

        # uvs

        for i in range(nUvLayers):

            faceUv = None

            if hasFaceUv:

                uvLayer = data["uvs"][ i ]

                uvIndex = faces[ offset ]
                offset += 1

                u = uvLayer[ uvIndex * 2 ]
                v = uvLayer[ uvIndex * 2 + 1 ]

                faceUv = [u, v]

            result["faceUVs"][i].append(faceUv)


            if hasFaceVertexUv:

                uvLayer = data["uvs"][ i ]

                vertexUvs = []

                for j in range(nVertices):

                    uvIndex = faces[ offset ]
                    offset += 1

                    u = uvLayer[ uvIndex * 2 ]
                    v = uvLayer[ uvIndex * 2 + 1 ]

                    vertexUvs.append([u, v])

            result["vertexUVs"][i].append(vertexUvs)


        if hasFaceNormal:

            normalIndex = faces[ offset ] * 3
            offset += 1

            x = normals[ normalIndex ]
            y = normals[ normalIndex + 1 ]
            z = normals[ normalIndex + 2 ]

            faceNormal = [x, y, z]

        else:

            faceNormal = None

        result["faceNormals"].append(faceNormal)


        if hasFaceVertexNormal:

            vertexNormals = []

            for j in range(nVertices):

                normalIndex = faces[ offset ] * 3
                offset += 1

                x = normals[ normalIndex ]
                y = normals[ normalIndex + 1 ]
                z = normals[ normalIndex + 2 ]

                vertexNormals.append( [x, y, z] )


        else:

            vertexNormals = None

        result["vertexNormals"].append(vertexNormals)


        if hasFaceColor:

            colorIndex = faces[ offset ]
            offset += 1

            faceColor = hexToTuple( colors[ colorIndex ] )

        else:

            faceColor = None

        result["faceColors"].append(faceColor)


        if hasFaceVertexColor:

            vertexColors = []

            for j in range(nVertices):

                colorIndex = faces[ offset ]
                offset += 1

                color = hexToTuple( colors[ colorIndex ] )
                vertexColors.append( color )

        else:

            vertexColors = None

        result["vertexColors"].append(vertexColors)


    return result

# #####################################################
# Utils
# #####################################################

def hexToTuple( hexColor ):
    r = (( hexColor >> 16 ) & 0xff) / 255.0
    g = (( hexColor >> 8 ) & 0xff) / 255.0
    b = ( hexColor & 0xff) / 255.0
    return (r, g, b)

def isBitSet(value, position):
    return value & ( 1 << position )

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

def get_name(filepath):
    return os.path.splitext(os.path.basename(filepath))[0]

def get_path(filepath):
    return os.path.dirname(filepath)

# #####################################################
# Parser
# #####################################################

def load(operator, context, filepath, option_flip_yz = True, recalculate_normals = True, option_worker = False):

    print('\nimporting %r' % filepath)

    time_main = time.time()

    print("\tparsing JSON file...")

    time_sub = time.time()

    file = open(filepath, 'rU')
    rawcontent = file.read()
    file.close()

    if option_worker:
        json_string = extract_json_string(rawcontent)
    else:
        json_string = rawcontent
    data = json.loads( json_string )

    time_new = time.time()

    print('parsing %.4f sec' % (time_new - time_sub))

    time_sub = time_new

    # flip YZ

    vertices = splitArray(data["vertices"], 3)

    if option_flip_yz:
        vertices[:] = [(v[0], -v[2], v[1]) for v in vertices]

    # extract faces

    face_data = extract_faces(data)

    # deselect all

    bpy.ops.object.select_all(action='DESELECT')

    nfaces = len(face_data["faces"])
    nvertices = len(vertices)
    nnormals = len(data.get("normals", [])) / 3
    ncolors = len(data.get("colors", [])) / 3
    nuvs = len(data.get("uvs", [])) / 2
    nmaterials = len(data.get("materials", []))

    print('\tbuilding geometry...\n\tfaces:%i, vertices:%i, vertex normals: %i, vertex uvs: %i, vertex colors: %i, materials: %i ...' % (
        nfaces, nvertices, nnormals, nuvs, ncolors, nmaterials ))

    # Create materials

    materials = create_materials(data, get_path(filepath))

    # Create new obj

    create_mesh_object(get_name(filepath), vertices, materials, face_data, option_flip_yz, recalculate_normals)

    scene = bpy.context.scene
    scene.update()

    time_new = time.time()

    print('finished importing: %r in %.4f sec.' % (filepath, (time_new - time_main)))
    return {'FINISHED'}


if __name__ == "__main__":
    register()
