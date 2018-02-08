__author__ = 'Sean Griffin'
__version__ = '1.0.0'
__email__ = 'sean@thoughtbot.com'

import sys

import os.path
import json
import shutil

from pymel.core import *
from maya.OpenMaya import *
from maya.OpenMayaMPx import *

kPluginTranslatorTypeName = 'Three.js'
kOptionScript = 'ThreeJsExportScript'
kDefaultOptionsString = '0'

FLOAT_PRECISION = 8

class ThreeJsWriter(object):
    def __init__(self):
        self.componentKeys = ['vertices', 'normals', 'colors', 'uvs', 'faces',
                'materials', 'colorMaps', 'specularMaps', 'bumpMaps', 'copyTextures',
                'bones', 'skeletalAnim', 'bakeAnimations', 'prettyOutput']

    def write(self, path, optionString, accessMode):
        self.path = path
        self.accessMode = accessMode
        self._parseOptions(optionString)

        self.verticeOffset = 0
        self.uvOffset = 0
        self.normalOffset = 0
        self.vertices = []
        self.materials = []
        self.faces = []
        self.normals = []
        self.uvs = []
        self.morphTargets = []
        self.bones = []
        self.animations = []
        self.skinIndices = []
        self.skinWeights = []

        # Materials are used when exporting faces, so do them first.
        if self.options["materials"]:
            print("exporting materials")
            self._exportMaterials()
        print("exporting meshes")
        self._exportMeshes()
        if not self.accessMode == MPxFileTranslator.kExportActiveAccessMode :
			if self.options["bakeAnimations"]:
				print("exporting animations")
				self._exportAnimations()
				self._goToFrame(self.options["startFrame"])
			if self.options["bones"]:
				print("exporting bones")
				select(map(lambda m: m.getParent(), ls(type='mesh')))
				runtime.GoToBindPose()
				self._exportBones()
				print("exporting skins")
				self._exportSkins()
			if self.options["skeletalAnim"]:
				print("exporting keyframe animations")
				self._exportKeyframeAnimations()
        

        print("writing file")
        output = {
            'metadata': {
                'formatVersion': 3.1,
                'generatedBy': 'Maya Exporter'
            },

            'vertices': self.vertices,
            'uvs': [self.uvs],
            'faces': self.faces,
            'normals': self.normals,
            'materials': self.materials,
        }

        if not self.accessMode == MPxFileTranslator.kExportActiveAccessMode :
			if self.options['bakeAnimations']:
				output['morphTargets'] = self.morphTargets

			if self.options['bones']:
				output['bones'] = self.bones
				output['skinIndices'] = self.skinIndices
				output['skinWeights'] = self.skinWeights
				output['influencesPerVertex'] = self.options["influencesPerVertex"]

			if self.options['skeletalAnim']:
				output['animations'] = self.animations

        with file(path, 'w') as f:
            if self.options['prettyOutput']:
                f.write(json.dumps(output, indent=4, separators=(", ", ": ")))
            else:
                f.write(json.dumps(output, separators=(",",":")))

    def _allMeshes(self):
        if not self.accessMode == MPxFileTranslator.kExportActiveAccessMode :
            print("*** Exporting ALL (NEW) ***")
            self.__allMeshes = filter(lambda m: len(m.listConnections()) > 0, ls(type='mesh'))
        else :
            print("### Exporting SELECTED ###")
            self.__allMeshes = ls(selection=True)
        return self.__allMeshes

    def _parseOptions(self, optionsString):
        self.options = dict([(x, False) for x in self.componentKeys])
        for key in self.componentKeys:
            self.options[key] = key in optionsString

        if self.options["bones"]:
            boneOptionsString = optionsString[optionsString.find("bones"):]
            boneOptions = boneOptionsString.split(' ')
            self.options["influencesPerVertex"] = int(boneOptions[1])

        if self.options["bakeAnimations"]:
            bakeAnimOptionsString = optionsString[optionsString.find("bakeAnimations"):]
            bakeAnimOptions = bakeAnimOptionsString.split(' ')
            self.options["startFrame"] = int(bakeAnimOptions[1])
            self.options["endFrame"] = int(bakeAnimOptions[2])
            self.options["stepFrame"] = int(bakeAnimOptions[3])

    def _exportMeshes(self):
        if self.options['vertices']:
            self._exportVertices()
        for mesh in self._allMeshes():
            self._exportMesh(mesh)

    def _exportMesh(self, mesh):
        print("Exporting " + mesh.name())
        if self.options['faces']:
            print("Exporting faces")
            self._exportFaces(mesh)
            self.verticeOffset += len(mesh.getPoints())
            self.uvOffset += mesh.numUVs()
            self.normalOffset += mesh.numNormals()
        if self.options['normals']:
            print("Exporting normals")
            self._exportNormals(mesh)
        if self.options['uvs']:
            print("Exporting UVs")
            self._exportUVs(mesh)

    def _getMaterialIndex(self, face, mesh):
        if not hasattr(self, '_materialIndices'):
            self._materialIndices = dict([(mat['DbgName'], i) for i, mat in enumerate(self.materials)])

        if self.options['materials']:
            for engine in mesh.listConnections(type='shadingEngine'):
                if sets(engine, isMember=face) or sets(engine, isMember=mesh):
                    for material in engine.listConnections(type='lambert'):
                        if self._materialIndices.has_key(material.name()):
                            return self._materialIndices[material.name()]
        return -1


    def _exportVertices(self):
        self.vertices += self._getVertices()

    def _exportAnimations(self):
        for frame in self._framesToExport():
            self._exportAnimationForFrame(frame)

    def _framesToExport(self):
        return range(self.options["startFrame"], self.options["endFrame"], self.options["stepFrame"])

    def _exportAnimationForFrame(self, frame):
        print("exporting frame " + str(frame))
        self._goToFrame(frame)
        self.morphTargets.append({
            'name': "frame_" + str(frame),
            'vertices': self._getVertices()
        })

    def _getVertices(self):
        return [coord for mesh in self._allMeshes() for point in mesh.getPoints(space='world') for coord in [round(point.x, FLOAT_PRECISION), round(point.y, FLOAT_PRECISION), round(point.z, FLOAT_PRECISION)]]

    def _goToFrame(self, frame):
        currentTime(frame)

    def _exportFaces(self, mesh):
        typeBitmask = self._getTypeBitmask()

        for face in mesh.faces:
            materialIndex = self._getMaterialIndex(face, mesh)
            hasMaterial = materialIndex != -1
            self._exportFaceBitmask(face, typeBitmask, hasMaterial=hasMaterial)
            self.faces += map(lambda x: x + self.verticeOffset, face.getVertices())
            if self.options['materials']:
                if hasMaterial:
                    self.faces.append(materialIndex)
            if self.options['uvs'] and face.hasUVs():
                self.faces += map(lambda v: face.getUVIndex(v) + self.uvOffset, range(face.polygonVertexCount()))
            if self.options['normals']:
                self._exportFaceVertexNormals(face)

    def _exportFaceBitmask(self, face, typeBitmask, hasMaterial=True):
        vertexCount = face.polygonVertexCount()
        if vertexCount == 4:
            faceBitmask = 1
        elif vertexCount == 3:
            faceBitmask = 0
        else:
            raise ValueError('Faces must have 3 or 4 vertices')

        if hasMaterial:
            faceBitmask |= (1 << 1)

        if self.options['uvs'] and face.hasUVs():
            faceBitmask |= (1 << 3)

        self.faces.append(typeBitmask | faceBitmask)

    def _exportFaceVertexNormals(self, face):
        for i in range(face.polygonVertexCount()):
            self.faces.append(face.normalIndex(i) + self.normalOffset)

    def _exportNormals(self, mesh):
        for normal in mesh.getNormals():
            self.normals += [round(normal.x, FLOAT_PRECISION), round(normal.y, FLOAT_PRECISION), round(normal.z, FLOAT_PRECISION)]

    def _exportUVs(self, mesh):
        us, vs = mesh.getUVs()
        for i, u in enumerate(us):
            self.uvs.append(u)
            self.uvs.append(vs[i])

    def _getTypeBitmask(self):
        bitmask = 0
        if self.options['normals']:
            bitmask |= 32
        return bitmask

    def _exportMaterials(self):
    	hist = listHistory( self._allMeshes(), f=1 )
    	mats = listConnections( hist, type='lambert' )
        for mat in mats:
            print("material: " + mat)
            self.materials.append(self._exportMaterial(mat))

    def _exportMaterial(self, mat):
        result = {
            "DbgName": mat.name(),
            "blending": "NormalBlending",
            "colorDiffuse": map(lambda i: i * mat.getDiffuseCoeff(), mat.getColor().rgb),
            "depthTest": True,
            "depthWrite": True,
            "shading": mat.__class__.__name__,
            "opacity": 1.0 - mat.getTransparency().r,
            "transparent": mat.getTransparency().r != 0.0,
            "vertexColors": False
        }
        if isinstance(mat, nodetypes.Phong):
            result["colorSpecular"] = mat.getSpecularColor().rgb
            result["reflectivity"] = mat.getReflectivity()
            result["specularCoef"] = mat.getCosPower()
            if self.options["specularMaps"]:
                self._exportSpecularMap(result, mat)
        if self.options["bumpMaps"]:
            self._exportBumpMap(result, mat)
        if self.options["colorMaps"]:
            self._exportColorMap(result, mat)

        return result

    def _exportBumpMap(self, result, mat):
        for bump in mat.listConnections(type='bump2d'):
            for f in bump.listConnections(type='file'):
                result["mapNormalFactor"] = 1
                self._exportFile(result, f, "Normal")

    def _exportColorMap(self, result, mat):
        for f in mat.attr('color').inputs():
            result["colorDiffuse"] = f.attr('defaultColor').get()
            self._exportFile(result, f, "Diffuse")

    def _exportSpecularMap(self, result, mat):
        for f in mat.attr('specularColor').inputs():
            result["colorSpecular"] = f.attr('defaultColor').get()
            self._exportFile(result, f, "Specular")

    def _exportFile(self, result, mapFile, mapType):
        src = mapFile.ftn.get()
        targetDir = os.path.dirname(self.path)
        fName = os.path.basename(src)
        if self.options['copyTextures']:
            shutil.copy2(src, os.path.join(targetDir, fName))
        result["map" + mapType] = fName
        result["map" + mapType + "Repeat"] = [1, 1]
        result["map" + mapType + "Wrap"] = ["repeat", "repeat"]
        result["map" + mapType + "Anisotropy"] = 4

    def _exportBones(self):
    	hist = listHistory( self._allMeshes(), f=1 )
    	joints = listConnections( hist, type="joint")
        for joint in joints:
            if joint.getParent():
                parentIndex = self._indexOfJoint(joint.getParent().name())
            else:
                parentIndex = -1
            rotq = joint.getRotation(quaternion=True) * joint.getOrientation()
            pos = joint.getTranslation()

            self.bones.append({
                "parent": parentIndex,
                "name": joint.name(),
                "pos": self._roundPos(pos),
                "rotq": self._roundQuat(rotq)
            })

    def _indexOfJoint(self, name):
        if not hasattr(self, '_jointNames'):
            self._jointNames = dict([(joint.name(), i) for i, joint in enumerate(ls(type='joint'))])

        if name in self._jointNames:
            return self._jointNames[name]
        else:
            return -1

    def _exportKeyframeAnimations(self):
        hierarchy = []
        i = -1
        frameRate = FramesPerSecond(currentUnit(query=True, time=True)).value()
        hist = listHistory( self._allMeshes(), f=1 )
    	joints = listConnections( hist, type="joint")
        for joint in joints:
            hierarchy.append({
                "parent": i,
                "keys": self._getKeyframes(joint, frameRate)
            })
            i += 1

        self.animations.append({
            "name": "skeletalAction.001",
            "length": (playbackOptions(maxTime=True, query=True) - playbackOptions(minTime=True, query=True)) / frameRate,
            "fps": 1,
            "hierarchy": hierarchy
        })


    def _getKeyframes(self, joint, frameRate):
        firstFrame = playbackOptions(minTime=True, query=True)
        lastFrame = playbackOptions(maxTime=True, query=True)
        frames = sorted(list(set(keyframe(joint, query=True) + [firstFrame, lastFrame])))
        keys = []

        print("joint " + joint.name() + " has " + str(len(frames)) + " keyframes")
        for frame in frames:
            self._goToFrame(frame)
            keys.append(self._getCurrentKeyframe(joint, frame, frameRate))
        return keys

    def _getCurrentKeyframe(self, joint, frame, frameRate):
        pos = joint.getTranslation()
        rot = joint.getRotation(quaternion=True) * joint.getOrientation()

        return {
            'time': (frame - playbackOptions(minTime=True, query=True)) / frameRate,
            'pos': self._roundPos(pos),
            'rot': self._roundQuat(rot),
            'scl': [1,1,1]
        }

    def _roundPos(self, pos):
        return map(lambda x: round(x, FLOAT_PRECISION), [pos.x, pos.y, pos.z])

    def _roundQuat(self, rot):
        return map(lambda x: round(x, FLOAT_PRECISION), [rot.x, rot.y, rot.z, rot.w])

    def _exportSkins(self):
        for mesh in self._allMeshes():
            print("exporting skins for mesh: " + mesh.name())
            hist = listHistory( mesh, f=1 )
            skins = listConnections( hist, type='skinCluster')
            if len(skins) > 0:
                print("mesh has " + str(len(skins)) + " skins")
                skin = skins[0]
                joints = skin.influenceObjects()
                for weights in skin.getWeights(mesh.vtx):
                    numWeights = 0

                    for i in range(0, len(weights)):
                        if weights[i] > 0:
                            self.skinWeights.append(weights[i])
                            self.skinIndices.append(self._indexOfJoint(joints[i].name()))
                            numWeights += 1

                    if numWeights > self.options["influencesPerVertex"]:
                        raise Exception("More than " + str(self.options["influencesPerVertex"]) + " influences on a vertex in " + mesh.name() + ".")

                    for i in range(0, self.options["influencesPerVertex"] - numWeights):
                        self.skinWeights.append(0)
                        self.skinIndices.append(0)
            else:
                print("mesh has no skins, appending 0")
                for i in range(0, len(mesh.getPoints()) * self.options["influencesPerVertex"]):
                    self.skinWeights.append(0)
                    self.skinIndices.append(0)

class NullAnimCurve(object):
    def getValue(self, index):
        return 0.0

class ThreeJsTranslator(MPxFileTranslator):
    def __init__(self):
        MPxFileTranslator.__init__(self)

    def haveWriteMethod(self):
        return True

    def filter(self):
        return '*.json'

    def defaultExtension(self):
        return 'json'

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

class FramesPerSecond(object):
    MAYA_VALUES = {
        'game': 15,
        'film': 24,
        'pal': 25,
        'ntsc': 30,
        'show': 48,
        'palf': 50,
        'ntscf': 60
    }

    def __init__(self, fpsString):
        self.fpsString = fpsString

    def value(self):
        if self.fpsString in FramesPerSecond.MAYA_VALUES:
            return FramesPerSecond.MAYA_VALUES[self.fpsString]
        else:
            return int(filter(lambda c: c.isdigit(), self.fpsString))

###################################################################
## The code below was taken from the Blender 3JS Exporter 
## It's purpose is to fix the JSON output so that it does not
## put each array value on it's own line, which is ridiculous 
## for this type of output.
###################################################################

ROUND = 6

## THREE override function
def _json_floatstr(o):
    if ROUND is not None:
        o = round(o, ROUND)
        
    return '%g' % o


def _make_iterencode(markers, _default, _encoder, _indent, _floatstr,
        _key_separator, _item_separator, _sort_keys, _skipkeys, _one_shot,
        ## HACK: hand-optimized bytecode; turn globals into locals
        ValueError=ValueError,
        basestring=basestring,
        dict=dict,
        float=float,
        id=id,
        int=int,
        isinstance=isinstance,
        list=list,
        long=long,
        str=str,
        tuple=tuple,
    ):

    def _iterencode_list(lst, _current_indent_level):
        if not lst:
            yield '[]'
            return
        if markers is not None:
            markerid = id(lst)
            if markerid in markers:
                raise ValueError("Circular reference detected")
            markers[markerid] = lst
        buf = '['
    	#if _indent is not None:
        #    _current_indent_level += 1
        #    newline_indent = '\n' + (' ' * (_indent * _current_indent_level))
        #    separator = _item_separator + newline_indent
        #    buf += newline_indent
        #else:
        newline_indent = None
        separator = _item_separator
        first = True
        for value in lst:
            if first:
                first = False
            else:
                buf = separator
            if isinstance(value, basestring):
                yield buf + _encoder(value)
            elif value is None:
                yield buf + 'null'
            elif value is True:
                yield buf + 'true'
            elif value is False:
                yield buf + 'false'
            elif isinstance(value, (int, long)):
                yield buf + str(value)
            elif isinstance(value, float):
                yield buf + _floatstr(value)
            else:
                yield buf
                if isinstance(value, (list, tuple)):
                    chunks = _iterencode_list(value, _current_indent_level)
                elif isinstance(value, dict):
                    chunks = _iterencode_dict(value, _current_indent_level)
                else:
                    chunks = _iterencode(value, _current_indent_level)
                for chunk in chunks:
                    yield chunk
        if newline_indent is not None:
            _current_indent_level -= 1
            yield '\n' + (' ' * (_indent * _current_indent_level))
        yield ']'
        if markers is not None:
            del markers[markerid]

    def _iterencode_dict(dct, _current_indent_level):
        if not dct:
            yield '{}'
            return
        if markers is not None:
            markerid = id(dct)
            if markerid in markers:
                raise ValueError("Circular reference detected")
            markers[markerid] = dct
        yield '{'
        if _indent is not None:
            _current_indent_level += 1
            newline_indent = '\n' + (' ' * (_indent * _current_indent_level))
            item_separator = _item_separator + newline_indent
            yield newline_indent
        else:
            newline_indent = None
            item_separator = _item_separator
        first = True
        if _sort_keys:
            items = sorted(dct.items(), key=lambda kv: kv[0])
        else:
            items = dct.iteritems()
        for key, value in items:
            if isinstance(key, basestring):
                pass
            # JavaScript is weakly typed for these, so it makes sense to
            # also allow them.  Many encoders seem to do something like this.
            elif isinstance(key, float):
                key = _floatstr(key)
            elif key is True:
                key = 'true'
            elif key is False:
                key = 'false'
            elif key is None:
                key = 'null'
            elif isinstance(key, (int, long)):
                key = str(key)
            elif _skipkeys:
                continue
            else:
                raise TypeError("key " + repr(key) + " is not a string")
            if first:
                first = False
            else:
                yield item_separator
            yield _encoder(key)
            yield _key_separator
            if isinstance(value, basestring):
                yield _encoder(value)
            elif value is None:
                yield 'null'
            elif value is True:
                yield 'true'
            elif value is False:
                yield 'false'
            elif isinstance(value, (int, long)):
                yield str(value)
            elif isinstance(value, float):
                yield _floatstr(value)
            else:
                if isinstance(value, (list, tuple)):
                    chunks = _iterencode_list(value, _current_indent_level)
                elif isinstance(value, dict):
                    chunks = _iterencode_dict(value, _current_indent_level)
                else:
                    chunks = _iterencode(value, _current_indent_level)
                for chunk in chunks:
                    yield chunk
        if newline_indent is not None:
            _current_indent_level -= 1
            yield '\n' + (' ' * (_indent * _current_indent_level))
        yield '}'
        if markers is not None:
            del markers[markerid]

    def _iterencode(o, _current_indent_level):
        if isinstance(o, basestring):
            yield _encoder(o)
        elif o is None:
            yield 'null'
        elif o is True:
            yield 'true'
        elif o is False:
            yield 'false'
        elif isinstance(o, (int, long)):
            yield str(o)
        elif isinstance(o, float):
            yield _floatstr(o)
        elif isinstance(o, (list, tuple)):
            for chunk in _iterencode_list(o, _current_indent_level):
                yield chunk
        elif isinstance(o, dict):
            for chunk in _iterencode_dict(o, _current_indent_level):
                yield chunk
        else:
            if markers is not None:
                markerid = id(o)
                if markerid in markers:
                    raise ValueError("Circular reference detected")
                markers[markerid] = o
            o = _default(o)
            for chunk in _iterencode(o, _current_indent_level):
                yield chunk
            if markers is not None:
                del markers[markerid]

    return _iterencode



# override the encoder
json.encoder._make_iterencode = _make_iterencode 



