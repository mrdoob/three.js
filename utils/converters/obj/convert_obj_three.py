"""Convert Wavefront OBJ / MTL files into Three.js (JSON model version, to be used with ascii / binary loader)

-------------------------
How to use this converter
-------------------------

python convert_obj_three.py -i infile.obj -o outfile.js [-m "morphfiles*.obj"] [-c "morphcolors*.obj"] [-a center|centerxz|top|bottom|none] [-s smooth|flat] [-t ascii|binary] [-d invert|normal] [-b] [-e]

Notes:
    - flags
        -i infile.obj			input OBJ file
        -o outfile.js			output JS file
        -m "morphfiles*.obj"	morph OBJ files (can use wildcards, enclosed in quotes multiple patterns separate by space)
        -c "morphcolors*.obj"	morph colors OBJ files (can use wildcards, enclosed in quotes multiple patterns separate by space)
        -a center|centerxz|top|bottom|none model alignment
        -s smooth|flat			smooth = export vertex normals, flat = no normals (face normals computed in loader)
        -t ascii|binary			export ascii or binary format (ascii has more features, binary just supports vertices, faces, normals, uvs and materials)
        -d invert|normal		invert transparency
        -b						bake material colors into face colors
        -x 10.0                 scale and truncate
        -f 2                    morph frame sampling step

    - by default:
        use smooth shading (if there were vertex normals in the original model)
        will be in ASCII format
        original model is assumed to use non-inverted transparency / dissolve (0.0 fully transparent, 1.0 fully opaque)
        no face colors baking
        no scale and truncate
        morph frame step = 1 (all files will be processed)

    - binary conversion will create two files:
        outfile.js  (materials)
        outfile.bin (binary buffers)

--------------------------------------------------
How to use generated JS file in your HTML document
--------------------------------------------------

    <script type="text/javascript" src="Three.js"></script>

    ...

    <script type="text/javascript">
        ...

        // load ascii model

        var jsonLoader = new THREE.JSONLoader();
        jsonLoader.load( "Model_ascii.js", function( geometry ) { createScene( geometry ) } );

        // load binary model

        var binLoader = new THREE.BinaryLoader();
        binLoader.load( "Model_bin.js", function( geometry ) { createScene( geometry) } );

        function createScene( geometry ) {

            var mesh = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial() );

        }

        ...
    </script>

-------------------------------------
Parsers based on formats descriptions
-------------------------------------

    http://en.wikipedia.org/wiki/Obj
    http://en.wikipedia.org/wiki/Material_Template_Library

-------------------
Current limitations
-------------------

    - for the moment, only diffuse color and texture are used
      (will need to extend shaders / renderers / materials in Three)

    - texture coordinates can be wrong in canvas renderer
      (there is crude normalization, but it doesn't
       work for all cases)

    - smoothing can be turned on/off only for the whole mesh

----------------------------------------------
How to get proper OBJ + MTL files with Blender
----------------------------------------------

    0. Remove default cube (press DEL and ENTER)

    1. Import / create model

    2. Select all meshes (Select -> Select All by Type -> Mesh)

    3. Export to OBJ (File -> Export -> Wavefront .obj)
        - enable following options in exporter
            Material Groups
            Rotate X90
            Apply Modifiers
            High Quality Normals
            Copy Images
            Selection Only
            Objects as OBJ Objects
            UVs
            Normals
            Materials

        - select empty folder
        - give your exported file name with "obj" extension
        - click on "Export OBJ" button

    4. Your model is now all files in this folder (OBJ, MTL, number of images)
        - this converter assumes all files staying in the same folder,
          (OBJ / MTL files use relative paths)

        - for WebGL, textures must be power of 2 sized

------
Author
------
AlteredQualia http://alteredqualia.com

"""

import fileinput
import operator
import random
import os.path
import getopt
import sys
import struct
import math
import glob

# #####################################################
# Configuration
# #####################################################
ALIGN = "none"        	# center centerxz bottom top none
SHADING = "smooth"      # smooth flat
TYPE = "ascii"          # ascii binary
TRANSPARENCY = "normal" # normal invert

TRUNCATE = False
SCALE = 1.0

FRAMESTEP = 1

BAKE_COLORS = False

# default colors for debugging (each material gets one distinct color):
# white, red, green, blue, yellow, cyan, magenta
COLORS = [0xeeeeee, 0xee0000, 0x00ee00, 0x0000ee, 0xeeee00, 0x00eeee, 0xee00ee]

# #####################################################
# Templates
# #####################################################
TEMPLATE_FILE_ASCII = u"""\
{

    "metadata" :
    {
        "formatVersion" : 3.1,
        "sourceFile"    : "%(fname)s",
        "generatedBy"   : "OBJConverter",
        "vertices"      : %(nvertex)d,
        "faces"         : %(nface)d,
        "normals"       : %(nnormal)d,
        "colors"        : %(ncolor)d,
        "uvs"           : %(nuv)d,
        "materials"     : %(nmaterial)d
    },

    "scale" : %(scale)f,

    "materials": [%(materials)s],

    "vertices": [%(vertices)s],

    "morphTargets": [%(morphTargets)s],

    "morphColors": [%(morphColors)s],

    "normals": [%(normals)s],

    "colors": [%(colors)s],

    "uvs": [[%(uvs)s]],

    "faces": [%(faces)s]

}
"""

TEMPLATE_FILE_BIN = u"""\
{

    "metadata" :
    {
        "formatVersion" : 3.1,
        "sourceFile"    : "%(fname)s",
        "generatedBy"   : "OBJConverter",
        "vertices"      : %(nvertex)d,
        "faces"         : %(nface)d,
        "normals"       : %(nnormal)d,
        "uvs"           : %(nuv)d,
        "materials"     : %(nmaterial)d
    },

    "materials": [%(materials)s],

    "buffers": "%(buffers)s"

}
"""

TEMPLATE_VERTEX = "%f,%f,%f"
TEMPLATE_VERTEX_TRUNCATE = "%d,%d,%d"

TEMPLATE_N = "%.5g,%.5g,%.5g"
TEMPLATE_UV = "%.5g,%.5g"
TEMPLATE_COLOR = "%.3g,%.3g,%.3g"
TEMPLATE_COLOR_DEC = "%d"

TEMPLATE_MORPH_VERTICES = '\t{ "name": "%s", "vertices": [%s] }'
TEMPLATE_MORPH_COLORS   = '\t{ "name": "%s", "colors": [%s] }'

# #####################################################
# Utils
# #####################################################
def file_exists(filename):
    """Return true if file exists and is accessible for reading.

    Should be safer than just testing for existence due to links and
    permissions magic on Unix filesystems.

    @rtype: boolean
    """

    try:
        f = open(filename, 'r')
        f.close()
        return True
    except IOError:
        return False


def get_name(fname):
    """Create model name based of filename ("path/fname.js" -> "fname").
    """

    return os.path.splitext(os.path.basename(fname))[0]

def bbox(vertices):
    """Compute bounding box of vertex array.
    """

    if len(vertices)>0:
        minx = maxx = vertices[0][0]
        miny = maxy = vertices[0][1]
        minz = maxz = vertices[0][2]

        for v in vertices[1:]:
            if v[0]<minx:
                minx = v[0]
            elif v[0]>maxx:
                maxx = v[0]

            if v[1]<miny:
                miny = v[1]
            elif v[1]>maxy:
                maxy = v[1]

            if v[2]<minz:
                minz = v[2]
            elif v[2]>maxz:
                maxz = v[2]

        return { 'x':[minx,maxx], 'y':[miny,maxy], 'z':[minz,maxz] }

    else:
        return { 'x':[0,0], 'y':[0,0], 'z':[0,0] }

def translate(vertices, t):
    """Translate array of vertices by vector t.
    """

    for i in xrange(len(vertices)):
        vertices[i][0] += t[0]
        vertices[i][1] += t[1]
        vertices[i][2] += t[2]

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

def centerxz(vertices):
    """Center model around X and Z.
    """

    bb = bbox(vertices)

    cx = bb['x'][0] + (bb['x'][1] - bb['x'][0])/2.0
    cy = 0
    cz = bb['z'][0] + (bb['z'][1] - bb['z'][0])/2.0

    translate(vertices, [-cx,-cy,-cz])

def normalize(v):
    """Normalize 3d vector"""

    l = math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2])
    if l:
        v[0] /= l
        v[1] /= l
        v[2] /= l

def veckey3(v):
    return round(v[0], 6), round(v[1], 6), round(v[2], 6)

# #####################################################
# MTL parser
# #####################################################
def texture_relative_path(fullpath):
    texture_file = os.path.basename(fullpath.replace("\\", "/"))
    return texture_file

def parse_mtl(fname):
    """Parse MTL file.
    """

    materials = {}

    for line in fileinput.input(fname):
        chunks = line.split()
        if len(chunks) > 0:

            # Material start
            # newmtl identifier
            if chunks[0] == "newmtl":
                if len(chunks) > 1:
                    identifier = chunks[1]
                else:
                    identifier = ""
                if not identifier in materials:
                    materials[identifier] = {}

            # Diffuse color
            # Kd 1.000 1.000 1.000
            if chunks[0] == "Kd" and len(chunks) == 4:
                materials[identifier]["colorDiffuse"] = [float(chunks[1]), float(chunks[2]), float(chunks[3])]

            # Ambient color
            # Ka 1.000 1.000 1.000
            if chunks[0] == "Ka" and len(chunks) == 4:
                materials[identifier]["colorAmbient"] = [float(chunks[1]), float(chunks[2]), float(chunks[3])]

            # Specular color
            # Ks 1.000 1.000 1.000
            if chunks[0] == "Ks" and len(chunks) == 4:
                materials[identifier]["colorSpecular"] = [float(chunks[1]), float(chunks[2]), float(chunks[3])]

            # Specular coefficient
            # Ns 154.000
            if chunks[0] == "Ns" and len(chunks) == 2:
                materials[identifier]["specularCoef"] = float(chunks[1])

            # Transparency
            # Tr 0.9 or d 0.9
            if (chunks[0] == "Tr" or chunks[0] == "d") and len(chunks) == 2:
                if TRANSPARENCY == "invert":
                    materials[identifier]["transparency"] = 1.0 - float(chunks[1])
                else:
                    materials[identifier]["transparency"] = float(chunks[1])

            # Optical density
            # Ni 1.0
            if chunks[0] == "Ni" and len(chunks) == 2:
                materials[identifier]["opticalDensity"] = float(chunks[1])

            # Diffuse texture
            # map_Kd texture_diffuse.jpg
            if chunks[0] == "map_Kd" and len(chunks) == 2:
                materials[identifier]["mapDiffuse"] = texture_relative_path(chunks[1])

            # Ambient texture
            # map_Ka texture_ambient.jpg
            if chunks[0] == "map_Ka" and len(chunks) == 2:
                materials[identifier]["mapAmbient"] = texture_relative_path(chunks[1])

            # Specular texture
            # map_Ks texture_specular.jpg
            if chunks[0] == "map_Ks" and len(chunks) == 2:
                materials[identifier]["mapSpecular"] = texture_relative_path(chunks[1])

            # Alpha texture
            # map_d texture_alpha.png
            if chunks[0] == "map_d" and len(chunks) == 2:
                materials[identifier]["mapAlpha"] = texture_relative_path(chunks[1])

            # Bump texture
            # map_bump texture_bump.jpg or bump texture_bump.jpg
            if (chunks[0] == "map_bump" or chunks[0] == "bump") and len(chunks) == 2:
                materials[identifier]["mapBump"] = texture_relative_path(chunks[1])

            # Illumination
            # illum 2
            #
            # 0. Color on and Ambient off
            # 1. Color on and Ambient on
            # 2. Highlight on
            # 3. Reflection on and Ray trace on
            # 4. Transparency: Glass on, Reflection: Ray trace on
            # 5. Reflection: Fresnel on and Ray trace on
            # 6. Transparency: Refraction on, Reflection: Fresnel off and Ray trace on
            # 7. Transparency: Refraction on, Reflection: Fresnel on and Ray trace on
            # 8. Reflection on and Ray trace off
            # 9. Transparency: Glass on, Reflection: Ray trace off
            # 10. Casts shadows onto invisible surfaces
            if chunks[0] == "illum" and len(chunks) == 2:
                materials[identifier]["illumination"] = int(chunks[1])

    return materials

# #####################################################
# OBJ parser
# #####################################################
def parse_vertex(text):
    """Parse text chunk specifying single vertex.

    Possible formats:
        vertex index
        vertex index / texture index
        vertex index / texture index / normal index
        vertex index / / normal index
    """

    v = 0
    t = 0
    n = 0

    chunks = text.split("/")

    v = int(chunks[0])
    if len(chunks) > 1:
        if chunks[1]:
            t = int(chunks[1])
    if len(chunks) > 2:
        if chunks[2]:
            n = int(chunks[2])

    return { 'v':v, 't':t, 'n':n }

def parse_obj(fname):
    """Parse OBJ file.
    """

    vertices = []
    normals = []
    uvs = []

    faces = []

    materials = {}
    material = ""
    mcounter = 0
    mcurrent = 0

    mtllib = ""

    # current face state
    group = 0
    object = 0
    smooth = 0

    for line in fileinput.input(fname):
        chunks = line.split()
        if len(chunks) > 0:

            # Vertices as (x,y,z) coordinates
            # v 0.123 0.234 0.345
            if chunks[0] == "v" and len(chunks) == 4:
                x = float(chunks[1])
                y = float(chunks[2])
                z = float(chunks[3])
                vertices.append([x,y,z])

            # Normals in (x,y,z) form; normals might not be unit
            # vn 0.707 0.000 0.707
            if chunks[0] == "vn" and len(chunks) == 4:
                x = float(chunks[1])
                y = float(chunks[2])
                z = float(chunks[3])
                normals.append([x,y,z])

            # Texture coordinates in (u,v[,w]) coordinates, w is optional
            # vt 0.500 -1.352 [0.234]
            if chunks[0] == "vt" and len(chunks) >= 3:
                u = float(chunks[1])
                v = float(chunks[2])
                w = 0
                if len(chunks)>3:
                    w = float(chunks[3])
                uvs.append([u,v,w])

            # Face
            if chunks[0] == "f" and len(chunks) >= 4:
                vertex_index = []
                uv_index = []
                normal_index = []


                # Precompute vert / normal / uv lists
                # for negative index lookup
                vertlen = len(vertices) + 1
                normlen = len(normals) + 1
                uvlen = len(uvs) + 1

                for v in chunks[1:]:
                    vertex = parse_vertex(v)
                    if vertex['v']:
                        if vertex['v'] < 0:
                            vertex['v'] += vertlen
                        vertex_index.append(vertex['v'])
                    if vertex['t']:
                        if vertex['t'] < 0:
                            vertex['t'] += uvlen
                        uv_index.append(vertex['t'])
                    if vertex['n']:
                        if vertex['n'] < 0:
                            vertex['n'] += normlen
                        normal_index.append(vertex['n'])
                faces.append({
                    'vertex':vertex_index,
                    'uv':uv_index,
                    'normal':normal_index,

                    'material':mcurrent,
                    'group':group,
                    'object':object,
                    'smooth':smooth,
                    })

            # Group
            if chunks[0] == "g" and len(chunks) == 2:
                group = chunks[1]

            # Object
            if chunks[0] == "o" and len(chunks) == 2:
                object = chunks[1]

            # Materials definition
            if chunks[0] == "mtllib" and len(chunks) == 2:
                mtllib = chunks[1]

            # Material
            if chunks[0] == "usemtl":
                if len(chunks) > 1:
                    material = chunks[1]
                else:
                    material = ""
                if not material in materials:
                    mcurrent = mcounter
                    materials[material] = mcounter
                    mcounter += 1
                else:
                    mcurrent = materials[material]

            # Smooth shading
            if chunks[0] == "s" and len(chunks) == 2:
                smooth = chunks[1]

    return faces, vertices, uvs, normals, materials, mtllib

# #####################################################
# Generator - faces
# #####################################################
def setBit(value, position, on):
    if on:
        mask = 1 << position
        return (value | mask)
    else:
        mask = ~(1 << position)
        return (value & mask)

def generate_face(f, fc):
    isTriangle = ( len(f['vertex']) == 3 )

    if isTriangle:
        nVertices = 3
    else:
        nVertices = 4

    hasMaterial = True # for the moment OBJs without materials get default material

    hasFaceUvs = False # not supported in OBJ
    hasFaceVertexUvs = ( len(f['uv']) >= nVertices )

    hasFaceNormals = False # don't export any face normals (as they are computed in engine)
    hasFaceVertexNormals = ( len(f["normal"]) >= nVertices and SHADING == "smooth" )

    hasFaceColors = BAKE_COLORS
    hasFaceVertexColors = False # not supported in OBJ

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
    # face normal index
    # face vertex normals indices
    # face color index
    # face vertex colors indices

    faceData.append(faceType)

    # must clamp in case on polygons bigger than quads

    for i in xrange(nVertices):
        index = f['vertex'][i] - 1
        faceData.append(index)

    faceData.append( f['material'] )

    if hasFaceVertexUvs:
        for i in xrange(nVertices):
            index = f['uv'][i] - 1
            faceData.append(index)

    if hasFaceVertexNormals:
        for i in xrange(nVertices):
            index = f['normal'][i] - 1
            faceData.append(index)

    if hasFaceColors:
        index = fc['material']
        faceData.append(index)

    return ",".join( map(str, faceData) )

# #####################################################
# Generator - chunks
# #####################################################
def hexcolor(c):
    return ( int(c[0] * 255) << 16  ) + ( int(c[1] * 255) << 8 ) + int(c[2] * 255)

def generate_vertex(v, option_vertices_truncate, scale):
    if not option_vertices_truncate:
        return TEMPLATE_VERTEX % (v[0], v[1], v[2])
    else:
        return TEMPLATE_VERTEX_TRUNCATE % (scale * v[0], scale * v[1], scale * v[2])

def generate_normal(n):
    return TEMPLATE_N % (n[0], n[1], n[2])

def generate_uv(uv):
    return TEMPLATE_UV % (uv[0], uv[1])

def generate_color_rgb(c):
    return TEMPLATE_COLOR % (c[0], c[1], c[2])

def generate_color_decimal(c):
    return TEMPLATE_COLOR_DEC % hexcolor(c)

# #####################################################
# Morphs
# #####################################################
def generate_morph_vertex(name, vertices):
    vertex_string = ",".join(generate_vertex(v, TRUNCATE, SCALE) for v in vertices)
    return TEMPLATE_MORPH_VERTICES % (name, vertex_string)

def generate_morph_color(name, colors):
    color_string = ",".join(generate_color_rgb(c) for c in colors)
    return TEMPLATE_MORPH_COLORS % (name, color_string)

def extract_material_colors(materials, mtlfilename, basename):
    """Extract diffuse colors from MTL materials
    """

    if not materials:
        materials = { 'default': 0 }

    mtl = create_materials(materials, mtlfilename, basename)

    mtlColorArraySrt = []
    for m in mtl:
        if m in materials:
            index = materials[m]
            color = mtl[m].get("colorDiffuse", [1,0,0])
            mtlColorArraySrt.append([index, color])

    mtlColorArraySrt.sort()
    mtlColorArray = [x[1] for x in mtlColorArraySrt]

    return mtlColorArray

def extract_face_colors(faces, material_colors):
    """Extract colors from materials and assign them to faces
    """

    faceColors = []

    for face in faces:
        material_index = face['material']
        faceColors.append(material_colors[material_index])

    return faceColors

def generate_morph_targets(morphfiles, n_vertices, infile):
    skipOriginalMorph = False
    norminfile = os.path.normpath(infile)

    morphVertexData = []

    for mfilepattern in morphfiles.split():

        matches = glob.glob(mfilepattern)
        matches.sort()

        indices = range(0, len(matches), FRAMESTEP)
        for i in indices:
            path = matches[i]

            normpath = os.path.normpath(path)

            if normpath != norminfile or not skipOriginalMorph:

                name = os.path.basename(normpath)

                morphFaces, morphVertices, morphUvs, morphNormals, morphMaterials, morphMtllib = parse_obj(normpath)

                n_morph_vertices = len(morphVertices)

                if n_vertices != n_morph_vertices:

                    print "WARNING: skipping morph [%s] with different number of vertices [%d] than the original model [%d]" % (name, n_morph_vertices, n_vertices)

                else:

                    if ALIGN == "center":
                        center(morphVertices)
                    elif ALIGN == "centerxz":
                        centerxz(morphVertices)
                    elif ALIGN == "bottom":
                        bottom(morphVertices)
                    elif ALIGN == "top":
                        top(morphVertices)

                    morphVertexData.append((get_name(name), morphVertices))
                    print "adding [%s] with %d vertices" % (name, n_morph_vertices)

    morphTargets = ""
    if len(morphVertexData):
        morphTargets = "\n%s\n\t" % ",\n".join(generate_morph_vertex(name, vertices) for name, vertices in morphVertexData)

    return morphTargets

def generate_morph_colors(colorfiles, n_vertices, n_faces):
    morphColorData = []
    colorFaces = []
    materialColors = []

    for mfilepattern in colorfiles.split():

        matches = glob.glob(mfilepattern)
        matches.sort()
        for path in matches:
            normpath = os.path.normpath(path)
            name = os.path.basename(normpath)

            morphFaces, morphVertices, morphUvs, morphNormals, morphMaterials, morphMtllib = parse_obj(normpath)

            n_morph_vertices = len(morphVertices)
            n_morph_faces = len(morphFaces)

            if n_vertices != n_morph_vertices:

                print "WARNING: skipping morph color map [%s] with different number of vertices [%d] than the original model [%d]" % (name, n_morph_vertices, n_vertices)

            elif n_faces != n_morph_faces:

                print "WARNING: skipping morph color map [%s] with different number of faces [%d] than the original model [%d]" % (name, n_morph_faces, n_faces)

            else:

                morphMaterialColors = extract_material_colors(morphMaterials, morphMtllib, normpath)
                morphFaceColors = extract_face_colors(morphFaces, morphMaterialColors)
                morphColorData.append((get_name(name), morphFaceColors))

                # take first color map for baking into face colors

                if len(colorFaces) == 0:
                    colorFaces = morphFaces
                    materialColors = morphMaterialColors

                print "adding [%s] with %d face colors" % (name, len(morphFaceColors))

    morphColors = ""
    if len(morphColorData):
        morphColors = "\n%s\n\t" % ",\n".join(generate_morph_color(name, colors) for name, colors in morphColorData)

    return morphColors, colorFaces, materialColors

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
        #return "0x%06x" % COLORS[i]
        return COLORS[i]
    else:
        #return "0x%06x" % int(0xffffff * random.random())
        return int(0xffffff * random.random())

def value2string(v):
    if type(v)==str and v[0:2] != "0x":
        return '"%s"' % v
    elif type(v) == bool:
        return str(v).lower()
    return str(v)

def generate_materials(mtl, materials):
    """Generate JS array of materials objects

    JS material objects are basically prettified one-to-one
    mappings of MTL properties in JSON format.
    """

    mtl_array = []
    for m in mtl:
        if m in materials:
            index = materials[m]

            # add debug information
            #  materials should be sorted according to how
            #  they appeared in OBJ file (for the first time)
            #  this index is identifier used in face definitions
            mtl[m]['DbgName'] = m
            mtl[m]['DbgIndex'] = index
            mtl[m]['DbgColor'] = generate_color(index)

            if BAKE_COLORS:
                mtl[m]['vertexColors'] = "face"

            mtl_raw = ",\n".join(['\t"%s" : %s' % (n, value2string(v)) for n,v in sorted(mtl[m].items())])
            mtl_string = "\t{\n%s\n\t}" % mtl_raw
            mtl_array.append([index, mtl_string])

    return ",\n\n".join([m for i,m in sorted(mtl_array)])

def generate_mtl(materials):
    """Generate dummy materials (if there is no MTL file).
    """

    mtl = {}
    for m in materials:
        index = materials[m]
        mtl[m] = {
            'DbgName': m,
            'DbgIndex': index,
            'DbgColor': generate_color(index)
        }
    return mtl

def generate_materials_string(materials, mtlfilename, basename):
    """Generate final materials string.
    """

    if not materials:
        materials = { 'default': 0 }

    mtl = create_materials(materials, mtlfilename, basename)
    return generate_materials(mtl, materials)

def create_materials(materials, mtlfilename, basename):
    """Parse MTL file and create mapping between its materials and OBJ materials.
       Eventual edge cases are handled here (missing materials, missing MTL file).
    """

    random.seed(42) # to get well defined color order for debug colors

    # default materials with debug colors for when
    # there is no specified MTL / MTL loading failed,
    # or if there were no materials / null materials

    mtl = generate_mtl(materials)

    if mtlfilename:

        # create full pathname for MTL (included from OBJ)

        path = os.path.dirname(basename)
        fname = os.path.join(path, mtlfilename)

        if file_exists(fname):

            # override default materials with real ones from MTL
            # (where they exist, otherwise keep defaults)

            mtl.update(parse_mtl(fname))

        else:

            print "Couldn't find [%s]" % fname

    return mtl

# #####################################################
# Faces
# #####################################################
def is_triangle_flat(f):
    return len(f['vertex'])==3 and not (f["normal"] and SHADING == "smooth") and not f['uv']

def is_triangle_flat_uv(f):
    return len(f['vertex'])==3 and not (f["normal"] and SHADING == "smooth") and len(f['uv'])==3

def is_triangle_smooth(f):
    return len(f['vertex'])==3 and f["normal"] and SHADING == "smooth" and not f['uv']

def is_triangle_smooth_uv(f):
    return len(f['vertex'])==3 and f["normal"] and SHADING == "smooth" and len(f['uv'])==3

def is_quad_flat(f):
    return len(f['vertex'])==4 and not (f["normal"] and SHADING == "smooth") and not f['uv']

def is_quad_flat_uv(f):
    return len(f['vertex'])==4 and not (f["normal"] and SHADING == "smooth") and len(f['uv'])==4

def is_quad_smooth(f):
    return len(f['vertex'])==4 and f["normal"] and SHADING == "smooth" and not f['uv']

def is_quad_smooth_uv(f):
    return len(f['vertex'])==4 and f["normal"] and SHADING == "smooth" and len(f['uv'])==4

def sort_faces(faces):
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

    for f in faces:
        if is_triangle_flat(f):
            data['triangles_flat'].append(f)
        elif is_triangle_flat_uv(f):
            data['triangles_flat_uv'].append(f)
        elif is_triangle_smooth(f):
            data['triangles_smooth'].append(f)
        elif is_triangle_smooth_uv(f):
            data['triangles_smooth_uv'].append(f)

        elif is_quad_flat(f):
            data['quads_flat'].append(f)
        elif is_quad_flat_uv(f):
            data['quads_flat_uv'].append(f)
        elif is_quad_smooth(f):
            data['quads_smooth'].append(f)
        elif is_quad_smooth_uv(f):
            data['quads_smooth_uv'].append(f)

    return data

# #####################################################
# API - ASCII converter
# #####################################################
def convert_ascii(infile, morphfiles, colorfiles, outfile):
    """Convert infile.obj to outfile.js

    Here is where everything happens. If you need to automate conversions,
    just import this file as Python module and call this method.
    """

    if not file_exists(infile):
        print "Couldn't find [%s]" % infile
        return

    # parse OBJ / MTL files

    faces, vertices, uvs, normals, materials, mtllib = parse_obj(infile)

    n_vertices = len(vertices)
    n_faces = len(faces)

    # align model

    if ALIGN == "center":
        center(vertices)
    elif ALIGN == "centerxz":
        centerxz(vertices)
    elif ALIGN == "bottom":
        bottom(vertices)
    elif ALIGN == "top":
        top(vertices)

    # generate normals string

    nnormal = 0
    normals_string = ""
    if SHADING == "smooth":
        normals_string = ",".join(generate_normal(n) for n in normals)
        nnormal = len(normals)

    # extract morph vertices

    morphTargets = generate_morph_targets(morphfiles, n_vertices, infile)

    # extract morph colors

    morphColors, colorFaces, materialColors = generate_morph_colors(colorfiles, n_vertices, n_faces)

    # generate colors string

    ncolor = 0
    colors_string = ""

    if len(colorFaces) < len(faces):
        colorFaces = faces
        materialColors = extract_material_colors(materials, mtllib, infile)

    if BAKE_COLORS:
        colors_string = ",".join(generate_color_decimal(c) for c in materialColors)
        ncolor = len(materialColors)

    # generate ascii model string

    text = TEMPLATE_FILE_ASCII % {
    "name"      : get_name(outfile),
    "fname"     : os.path.basename(infile),
    "nvertex"   : len(vertices),
    "nface"     : len(faces),
    "nuv"       : len(uvs),
    "nnormal"   : nnormal,
    "ncolor"    : ncolor,
    "nmaterial" : len(materials),

    "materials" : generate_materials_string(materials, mtllib, infile),

    "normals"       : normals_string,
    "colors"        : colors_string,
    "uvs"           : ",".join(generate_uv(uv) for uv in uvs),
    "vertices"      : ",".join(generate_vertex(v, TRUNCATE, SCALE) for v in vertices),

    "morphTargets"  : morphTargets,
    "morphColors"   : morphColors,

    "faces"     : ",".join(generate_face(f, fc) for f, fc in zip(faces, colorFaces)),

    "scale"    : SCALE
    }

    out = open(outfile, "w")
    out.write(text)
    out.close()

    print "%d vertices, %d faces, %d materials" % (len(vertices), len(faces), len(materials))


# #############################################################################
# API - Binary converter
# #############################################################################
def dump_materials_to_buffer(faces, buffer):
    for f in faces:
        data = struct.pack('<H',
                            f['material'])
        buffer.append(data)

def dump_vertices3_to_buffer(faces, buffer):
    for f in faces:
        vi = f['vertex']
        data = struct.pack('<III',
                            vi[0]-1, vi[1]-1, vi[2]-1)
        buffer.append(data)

def dump_vertices4_to_buffer(faces, buffer):
    for f in faces:
        vi = f['vertex']
        data = struct.pack('<IIII',
                            vi[0]-1, vi[1]-1, vi[2]-1, vi[3]-1)
        buffer.append(data)

def dump_normals3_to_buffer(faces, buffer):
    for f in faces:
        ni = f['normal']
        data = struct.pack('<III',
                            ni[0]-1, ni[1]-1, ni[2]-1)
        buffer.append(data)

def dump_normals4_to_buffer(faces, buffer):
    for f in faces:
        ni = f['normal']
        data = struct.pack('<IIII',
                            ni[0]-1, ni[1]-1, ni[2]-1, ni[3]-1)
        buffer.append(data)

def dump_uvs3_to_buffer(faces, buffer):
    for f in faces:
        ui = f['uv']
        data = struct.pack('<III',
                            ui[0]-1, ui[1]-1, ui[2]-1)
        buffer.append(data)

def dump_uvs4_to_buffer(faces, buffer):
    for f in faces:
        ui = f['uv']
        data = struct.pack('<IIII',
                            ui[0]-1, ui[1]-1, ui[2]-1, ui[3]-1)
        buffer.append(data)

def add_padding(buffer, n):
    if n % 4:
        for i in range(4 - n % 4):
            data = struct.pack('<B', 0)
            buffer.append(data)

def convert_binary(infile, outfile):
    """Convert infile.obj to outfile.js + outfile.bin
    """

    if not file_exists(infile):
        print "Couldn't find [%s]" % infile
        return

    binfile = get_name(outfile) + ".bin"

    faces, vertices, uvs, normals, materials, mtllib = parse_obj(infile)

    if ALIGN == "center":
        center(vertices)
    elif ALIGN == "centerxz":
        centerxz(vertices)
    elif ALIGN == "bottom":
        bottom(vertices)
    elif ALIGN == "top":
        top(vertices)

    sfaces = sort_faces(faces)

    if SHADING == "smooth":
        nnormals = len(normals)
    else:
        nnormals = 0

    # ###################
    # generate JS file
    # ###################

    text = TEMPLATE_FILE_BIN % {
    "name"       : get_name(outfile),

    "materials" : generate_materials_string(materials, mtllib, infile),
    "buffers"   : binfile,

    "fname"     : os.path.basename(infile),
    "nvertex"   : len(vertices),
    "nface"     : len(faces),
    "nmaterial" : len(materials),
    "nnormal"   : nnormals,
    "nuv"       : len(uvs)
    }

    out = open(outfile, "w")
    out.write(text)
    out.close()

    # ###################
    # generate BIN file
    # ###################

    buffer = []

    # header
    # ------
    header_bytes  = struct.calcsize('<12s')
    header_bytes += struct.calcsize('<BBBBBBBB')
    header_bytes += struct.calcsize('<IIIIIIIIIII')

    # signature
    signature = struct.pack('<12s', 'Three.js 003')

    # metadata (all data is little-endian)
    vertex_coordinate_bytes = 4
    normal_coordinate_bytes = 1
    uv_coordinate_bytes = 4

    vertex_index_bytes = 4
    normal_index_bytes = 4
    uv_index_bytes = 4
    material_index_bytes = 2

    # header_bytes            unsigned char   1

    # vertex_coordinate_bytes unsigned char   1
    # normal_coordinate_bytes unsigned char   1
    # uv_coordinate_bytes     unsigned char   1

    # vertex_index_bytes      unsigned char   1
    # normal_index_bytes      unsigned char   1
    # uv_index_bytes          unsigned char   1
    # material_index_bytes    unsigned char   1
    bdata = struct.pack('<BBBBBBBB', header_bytes,
                               vertex_coordinate_bytes,
                               normal_coordinate_bytes,
                               uv_coordinate_bytes,
                               vertex_index_bytes,
                               normal_index_bytes,
                               uv_index_bytes,
                               material_index_bytes)

    ntri_flat = len(sfaces['triangles_flat'])
    ntri_smooth = len(sfaces['triangles_smooth'])
    ntri_flat_uv = len(sfaces['triangles_flat_uv'])
    ntri_smooth_uv = len(sfaces['triangles_smooth_uv'])

    nquad_flat = len(sfaces['quads_flat'])
    nquad_smooth = len(sfaces['quads_smooth'])
    nquad_flat_uv = len(sfaces['quads_flat_uv'])
    nquad_smooth_uv = len(sfaces['quads_smooth_uv'])

    # nvertices       unsigned int    4
    # nnormals        unsigned int    4
    # nuvs            unsigned int    4

    # ntri_flat       unsigned int    4
    # ntri_smooth     unsigned int    4
    # ntri_flat_uv    unsigned int    4
    # ntri_smooth_uv  unsigned int    4

    # nquad_flat      unsigned int    4
    # nquad_smooth    unsigned int    4
    # nquad_flat_uv   unsigned int    4
    # nquad_smooth_uv unsigned int    4
    ndata = struct.pack('<IIIIIIIIIII', len(vertices),
                               nnormals,
                               len(uvs),
                               ntri_flat,
                               ntri_smooth,
                               ntri_flat_uv,
                               ntri_smooth_uv,
                               nquad_flat,
                               nquad_smooth,
                               nquad_flat_uv,
                               nquad_smooth_uv)
    buffer.append(signature)
    buffer.append(bdata)
    buffer.append(ndata)

    # 1. vertices
    # ------------
    # x float   4
    # y float   4
    # z float   4
    for v in vertices:
        data = struct.pack('<fff', v[0], v[1], v[2])
        buffer.append(data)

    # 2. normals
    # ---------------
    # x signed char 1
    # y signed char 1
    # z signed char 1
    if SHADING == "smooth":
        for n in normals:
            normalize(n)
            data = struct.pack('<bbb', math.floor(n[0]*127+0.5),
                                       math.floor(n[1]*127+0.5),
                                       math.floor(n[2]*127+0.5))
            buffer.append(data)

        add_padding(buffer, nnormals * 3)

    # 3. uvs
    # -----------
    # u float   4
    # v float   4
    for uv in uvs:
        data = struct.pack('<ff', uv[0], uv[1])
        buffer.append(data)

    # padding
    #data = struct.pack('<BB', 0, 0)
    #buffer.append(data)

    # 4. flat triangles (vertices + materials)
    # ------------------
    # a unsigned int   4
    # b unsigned int   4
    # c unsigned int   4
    # ------------------
    # m unsigned short 2

    dump_vertices3_to_buffer(sfaces['triangles_flat'], buffer)

    dump_materials_to_buffer(sfaces['triangles_flat'], buffer)
    add_padding(buffer, ntri_flat * 2)

    # 5. smooth triangles (vertices + materials + normals)
    # -------------------
    # a  unsigned int   4
    # b  unsigned int   4
    # c  unsigned int   4
    # -------------------
    # na unsigned int   4
    # nb unsigned int   4
    # nc unsigned int   4
    # -------------------
    # m  unsigned short 2

    dump_vertices3_to_buffer(sfaces['triangles_smooth'], buffer)
    dump_normals3_to_buffer(sfaces['triangles_smooth'], buffer)

    dump_materials_to_buffer(sfaces['triangles_smooth'], buffer)
    add_padding(buffer, ntri_smooth * 2)

    # 6. flat triangles uv (vertices + materials + uvs)
    # --------------------
    # a  unsigned int    4
    # b  unsigned int    4
    # c  unsigned int    4
    # --------------------
    # ua unsigned int    4
    # ub unsigned int    4
    # uc unsigned int    4
    # --------------------
    # m  unsigned short  2

    dump_vertices3_to_buffer(sfaces['triangles_flat_uv'], buffer)
    dump_uvs3_to_buffer(sfaces['triangles_flat_uv'], buffer)

    dump_materials_to_buffer(sfaces['triangles_flat_uv'], buffer)
    add_padding(buffer, ntri_flat_uv * 2)

    # 7. smooth triangles uv (vertices + materials + normals + uvs)
    # ----------------------
    # a  unsigned int    4
    # b  unsigned int    4
    # c  unsigned int    4
    # --------------------
    # na unsigned int    4
    # nb unsigned int    4
    # nc unsigned int    4
    # --------------------
    # ua unsigned int    4
    # ub unsigned int    4
    # uc unsigned int    4
    # --------------------
    # m  unsigned short  2

    dump_vertices3_to_buffer(sfaces['triangles_smooth_uv'], buffer)
    dump_normals3_to_buffer(sfaces['triangles_smooth_uv'], buffer)
    dump_uvs3_to_buffer(sfaces['triangles_smooth_uv'], buffer)

    dump_materials_to_buffer(sfaces['triangles_smooth_uv'], buffer)
    add_padding(buffer, ntri_smooth_uv * 2)

    # 8. flat quads (vertices + materials)
    # ------------------
    # a unsigned int   4
    # b unsigned int   4
    # c unsigned int   4
    # d unsigned int   4
    # --------------------
    # m unsigned short 2

    dump_vertices4_to_buffer(sfaces['quads_flat'], buffer)

    dump_materials_to_buffer(sfaces['quads_flat'], buffer)
    add_padding(buffer, nquad_flat * 2)

    # 9. smooth quads (vertices + materials + normals)
    # -------------------
    # a  unsigned int   4
    # b  unsigned int   4
    # c  unsigned int   4
    # d  unsigned int   4
    # --------------------
    # na unsigned int   4
    # nb unsigned int   4
    # nc unsigned int   4
    # nd unsigned int   4
    # --------------------
    # m  unsigned short 2

    dump_vertices4_to_buffer(sfaces['quads_smooth'], buffer)
    dump_normals4_to_buffer(sfaces['quads_smooth'], buffer)

    dump_materials_to_buffer(sfaces['quads_smooth'], buffer)
    add_padding(buffer, nquad_smooth * 2)

    # 10. flat quads uv (vertices + materials + uvs)
    # ------------------
    # a unsigned int   4
    # b unsigned int   4
    # c unsigned int   4
    # d unsigned int   4
    # --------------------
    # ua unsigned int  4
    # ub unsigned int  4
    # uc unsigned int  4
    # ud unsigned int  4
    # --------------------
    # m unsigned short 2

    dump_vertices4_to_buffer(sfaces['quads_flat_uv'], buffer)
    dump_uvs4_to_buffer(sfaces['quads_flat_uv'], buffer)

    dump_materials_to_buffer(sfaces['quads_flat_uv'], buffer)
    add_padding(buffer, nquad_flat_uv * 2)

    # 11. smooth quads uv
    # -------------------
    # a  unsigned int   4
    # b  unsigned int   4
    # c  unsigned int   4
    # d  unsigned int   4
    # --------------------
    # na unsigned int   4
    # nb unsigned int   4
    # nc unsigned int   4
    # nd unsigned int   4
    # --------------------
    # ua unsigned int   4
    # ub unsigned int   4
    # uc unsigned int   4
    # ud unsigned int   4
    # --------------------
    # m  unsigned short 2

    dump_vertices4_to_buffer(sfaces['quads_smooth_uv'], buffer)
    dump_normals4_to_buffer(sfaces['quads_smooth_uv'], buffer)
    dump_uvs4_to_buffer(sfaces['quads_smooth_uv'], buffer)

    dump_materials_to_buffer(sfaces['quads_smooth_uv'], buffer)
    add_padding(buffer, nquad_smooth_uv * 2)

    path = os.path.dirname(outfile)
    fname = os.path.join(path, binfile)

    out = open(fname, "wb")
    out.write("".join(buffer))
    out.close()

# #############################################################################
# Helpers
# #############################################################################
def usage():
    print "Usage: %s -i filename.obj -o filename.js [-m morphfiles*.obj] [-c morphcolors*.obj] [-a center|top|bottom] [-s flat|smooth] [-t binary|ascii] [-d invert|normal]" % os.path.basename(sys.argv[0])

# #####################################################
# Main
# #####################################################
if __name__ == "__main__":

    # get parameters from the command line
    try:
        opts, args = getopt.getopt(sys.argv[1:], "hbi:m:c:b:o:a:s:t:d:x:f:", ["help", "bakecolors", "input=", "morphs=", "colors=", "output=", "align=", "shading=", "type=", "dissolve=", "truncatescale=", "framestep="])

    except getopt.GetoptError:
        usage()
        sys.exit(2)

    infile = outfile = ""
    morphfiles = ""
    colorfiles = ""

    for o, a in opts:
        if o in ("-h", "--help"):
            usage()
            sys.exit()

        elif o in ("-i", "--input"):
            infile = a

        elif o in ("-m", "--morphs"):
            morphfiles = a

        elif o in ("-c", "--colors"):
            colorfiles = a

        elif o in ("-o", "--output"):
            outfile = a

        elif o in ("-a", "--align"):
            if a in ("top", "bottom", "center", "centerxz", "none"):
                ALIGN = a

        elif o in ("-s", "--shading"):
            if a in ("flat", "smooth"):
                SHADING = a

        elif o in ("-t", "--type"):
            if a in ("binary", "ascii"):
                TYPE = a

        elif o in ("-d", "--dissolve"):
            if a in ("normal", "invert"):
                TRANSPARENCY = a

        elif o in ("-b", "--bakecolors"):
            BAKE_COLORS = True

        elif o in ("-x", "--truncatescale"):
            TRUNCATE = True
            SCALE = float(a)

        elif o in ("-f", "--framestep"):
            FRAMESTEP = int(a)

    if infile == "" or outfile == "":
        usage()
        sys.exit(2)

    print "Converting [%s] into [%s] ..." % (infile, outfile)

    if morphfiles:
        print "Morphs [%s]" % morphfiles

    if colorfiles:
        print "Colors [%s]" % colorfiles

    if TYPE == "ascii":
        convert_ascii(infile, morphfiles, colorfiles, outfile)
    elif TYPE == "binary":
        convert_binary(infile, outfile)

