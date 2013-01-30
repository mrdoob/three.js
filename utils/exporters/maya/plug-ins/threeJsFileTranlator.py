__author__ = 'Chris Lewis'
__version__ = '0.1.0'
__email__ = 'clewis1@c.ringling.edu'

import sys
import json

import maya.cmds as mc
from maya.OpenMaya import *
from maya.OpenMayaMPx import *

kPluginTranslatorTypeName = 'Three.js'
kOptionScript = 'ThreeJsExportScript'
kDefaultOptionsString = '0'

FLOAT_PRECISION = 8


# adds decimal precision to JSON encoding
class DecimalEncoder(json.JSONEncoder):
    def _iterencode(self, o, markers=None):
        if isinstance(o, float):
            s = str(o)
            if '.' in s and len(s[s.index('.'):]) > FLOAT_PRECISION - 1:
                s = '%.{0}f'.format(FLOAT_PRECISION) % o
                while '.' in s and s[-1] == '0':
                    s = s[-2]
            return (s for s in [s])
        return super(DecimalEncoder, self)._iterencode(o, markers)


class ThreeJsError(Exception):
    pass


class ThreeJsWriter(object):
    def __init__(self):
        self.componentKeys = ['vertices', 'normals', 'colors', 'uvs', 'materials', 'faces']

    def _parseOptions(self, optionsString):
        self.options = dict([(x, False) for x in self.componentKeys])
        optionsString = optionsString[2:] # trim off the "0;" that Maya adds to the options string
        for option in optionsString.split(' '):
            self.options[option] = True

    def _updateOffsets(self):
        for key in self.componentKeys:
            if key == 'uvs':
                continue
            self.offsets[key] = len(getattr(self, key))
        for i in range(len(self.uvs)):
            self.offsets['uvs'][i] = len(self.uvs[i])

    def _getTypeBitmask(self, options):
        bitmask = 0
        if options['materials']:
            bitmask |= 2
        if options['uvs']:
            bitmask |= 8
        if options['normals']:
            bitmask |= 32
        if options['colors']:
            bitmask |= 128
        return bitmask

    def _exportMesh(self, dagPath, component):
        mesh = MFnMesh(dagPath)
        options = self.options.copy()
        self._updateOffsets()

        # export vertex data
        if options['vertices']:
            try:
                iterVerts = MItMeshVertex(dagPath, component)
                while not iterVerts.isDone():
                    point = iterVerts.position(MSpace.kWorld)
                    self.vertices += [point.x, point.y, point.z]
                    iterVerts.next()
            except:
                options['vertices'] = False

        # export material data
        # TODO: actually parse material data
        materialIndices = MIntArray()
        if options['materials']:
            try:
                shaders = MObjectArray()
                mesh.getConnectedShaders(0, shaders, materialIndices)
                while len(self.materials) < shaders.length():
                    self.materials.append({}) # placeholder material definition
            except:
                self.materials = [{}]

        # export uv data
        if options['uvs']:
            try:
                uvLayers = []
                mesh.getUVSetNames(uvLayers)
                while len(uvLayers) > len(self.uvs):
                    self.uvs.append([])
                    self.offsets['uvs'].append(0)
                for i, layer in enumerate(uvLayers):
                    uList = MFloatArray()
                    vList = MFloatArray()
                    mesh.getUVs(uList, vList, layer)
                    for j in xrange(uList.length()):
                        self.uvs[i] += [uList[j], vList[j]]
            except:
                options['uvs'] = False

        # export normal data
        if options['normals']:
            try:
                normals = MFloatVectorArray()
                mesh.getNormals(normals, MSpace.kWorld)
                for i in xrange(normals.length()):
                    point = normals[i]
                    self.normals += [point.x, point.y, point.z]
            except:
                options['normals'] = False

        # export color data
        if options['colors']:
            try:
                colors = MColorArray()
                mesh.getColors(colors)
                for i in xrange(colors.length()):
                    color = colors[i]
                    # uncolored vertices are set to (-1, -1, -1).  Clamps colors to (0, 0, 0).
                    self.colors += [max(color.r, 0), max(color.g, 0), max(color.b, 0)]
            except:
                options['colors'] = False

        # export face data
        if not options['vertices']:
            return
        bitmask = self._getTypeBitmask(options)
        iterPolys = MItMeshPolygon(dagPath, component)
        while not iterPolys.isDone():
            self.faces.append(bitmask)
            # export face vertices
            verts = MIntArray()
            iterPolys.getVertices(verts)
            for i in xrange(verts.length()):
                self.faces.append(verts[i] + self.offsets['vertices'])
            # export face vertex materials
            if options['materials']:
                if materialIndices.length():
                    self.faces.append(materialIndices[iterPolys.index()])
            # export face vertex uvs
            if options['uvs']:
                util = MScriptUtil()
                uvPtr = util.asIntPtr()
                for i, layer in enumerate(uvLayers):
                    for j in xrange(verts.length()):
                        iterPolys.getUVIndex(j, uvPtr, layer)
                        uvIndex = util.getInt(uvPtr)
                        self.faces.append(uvIndex + self.offsets['uvs'][i])
            # export face vertex normals
            if options['normals']:
                for i in xrange(3):
                    normalIndex = iterPolys.normalIndex(i)
                    self.faces.append(normalIndex + self.offsets['normals'])
            # export face vertex colors
            if options['colors']:
                colors = MIntArray()
                iterPolys.getColorIndices(colors)
                for i in xrange(colors.length()):
                    self.faces.append(colors[i] + self.offsets['colors'])
            iterPolys.next()

    def _getMeshes(self, nodes):
        meshes = []
        for node in nodes:
            if mc.nodeType(node) == 'mesh':
                meshes.append(node)
            else:
                for child in mc.listRelatives(node, s=1):
                    if mc.nodeType(child) == 'mesh':
                        meshes.append(child)
        return meshes

    def _exportMeshes(self):
        # export all
        if self.accessMode == MPxFileTranslator.kExportAccessMode:
            mc.select(self._getMeshes(mc.ls(typ='mesh')))
        # export selection
        elif self.accessMode == MPxFileTranslator.kExportActiveAccessMode:
            mc.select(self._getMeshes(mc.ls(sl=1)))
        else:
            raise ThreeJsError('Unsupported access mode: {0}'.format(self.accessMode))
        dups = [mc.duplicate(mesh)[0] for mesh in mc.ls(sl=1)]
        combined = mc.polyUnite(dups, mergeUVSets=1, ch=0) if len(dups) > 1 else dups[0]
        mc.polyTriangulate(combined)
        mc.select(combined)
        sel = MSelectionList()
        MGlobal.getActiveSelectionList(sel)
        mDag = MDagPath()
        mComp = MObject()
        sel.getDagPath(0, mDag, mComp)
        self._exportMesh(mDag, mComp)
        mc.delete(combined)

    def write(self, path, optionString, accessMode):
        self.path = path
        self._parseOptions(optionString)
        self.accessMode = accessMode
        self.root = dict(metadata=dict(formatVersion=3))
        self.offsets = dict()
        for key in self.componentKeys:
            setattr(self, key, [])
            self.offsets[key] = 0
        self.offsets['uvs'] = []
        self.uvs = []
        
        self._exportMeshes()

        # add the component buffers to the root JSON object
        for key in self.componentKeys:
            buffer_ = getattr(self, key)
            if buffer_:
                self.root[key] = buffer_

        # materials are required for parsing
        if not self.root.has_key('materials'):
            self.root['materials'] = [{}]

        # write the file
        with file(self.path, 'w') as f:
            f.write(json.dumps(self.root, separators=(',',':'), cls=DecimalEncoder))


class ThreeJsTranslator(MPxFileTranslator):
    def __init__(self):
        MPxFileTranslator.__init__(self)

    def haveWriteMethod(self):
        return True

    def filter(self):
        return '*.js'

    def defaultExtension(self):
        return 'js'

    def writer(self, fileObject, optionString, accessMode):
        path = fileObject.fullName()
        writer = ThreeJsWriter()
        writer.write(path, optionString, accessMode)


def translatorCreator():
    return asMPxPtr(ThreeJsTranslator())


def initializePlugin(mobject):
    mplugin = MFnPlugin(mobject)
    try:
        mplugin.registerFileTranslator(kPluginTranslatorTypeName, None, translatorCreator, kOptionScript, kDefaultOptionsString)
    except:
        sys.stderr.write('Failed to register translator: %s' % kPluginTranslatorTypeName)
        raise
        

def uninitializePlugin(mobject):
    mplugin = MFnPlugin(mobject)
    try:
        mplugin.deregisterFileTranslator(kPluginTranslatorTypeName)
    except:
        sys.stderr.write('Failed to deregister translator: %s' % kPluginTranslatorTypeName)
        raise