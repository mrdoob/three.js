"""
THREE.js Maya exporter which supports static and animated meshes. The exporter is composed of
two files: threeJsFileTranslator.py (this file) and ThreeJsExportScript.mel (exporter menu interface).
Original Author: Chris Lewis, clewis1@c.ringling.edu

Modified: Black Tower Entertainment, LLC (4/2/14)
    Douglas Morrison, doug@blacktowerentertainment.com 
    Alexander Dines, alex@blacktowerentertainment.com
    
"""

import sys
import json

import maya.cmds as mc
from maya.OpenMaya import *
from maya.OpenMayaMPx import *
from maya.OpenMayaAnim import *


kPluginTranslatorTypeName = 'Three.js /w Animations'
kOptionScript = 'ThreeJsExportScript'
kDefaultOptionsString = '0'

FLOAT_PRECISION = 8

# This table is used to convert a Maya enumeration into integer framerate.
kFrameRateLookup = {
    MTime.kSeconds: 1,
    MTime.kMilliseconds: 1000,
    MTime.kGames: 15,
    MTime.kFilm: 24,
    MTime.kPALFrame: 25,
    MTime.kNTSCFrame: 30,
    MTime.kShowScan: 48,
    MTime.kPALField: 50,
    MTime.kNTSCField: 60,
    MTime.k2FPS: 2,
    MTime.k3FPS: 3,
    MTime.k4FPS: 4,
    MTime.k5FPS: 5,
    MTime.k6FPS: 6,
    MTime.k8FPS: 8,
    MTime.k10FPS: 10,
    MTime.k12FPS: 12,
    MTime.k16FPS: 16,
    MTime.k20FPS: 20,
    MTime.k40FPS: 40,
    MTime.k75FPS: 75
};

# adds decimal precision to JSON encoding
class DecimalEncoder(json.JSONEncoder):
    def _iterencode(self, o, markers=None):
        if isinstance(o, float):
            s = str(o)
            if '.' in s and len(s[s.index('.'):]) > FLOAT_PRECISION - 1:
                s = '%.{0}f'.format(FLOAT_PRECISION) % o
                while '.' in s and s[-1] == '0':
                    s = s[:-1] # this actually removes the last "0" from the string
                if s[-1] == '.': # added this test to avoid leaving "0." instead of "0.0",
                    s += '0'    # which would throw an error while loading the file
            return (s for s in [s])
        return super(DecimalEncoder, self)._iterencode(o, markers)


class ThreeJsError(Exception):
    pass


class ThreeJsWriter(object):
    def __init__(self):
        self.componentKeys = ['vertices', 'normals', 'colors', 'uvs', 'materials', 'faces', "animation", "bones", "skinWeights", "skinIndices"]

    def _parseOptions(self, optionsString):
        self.options = dict([(x, False) for x in self.componentKeys])
        optionsString = optionsString[2:] # trim off the "0;" that Maya adds to the options string
        for option in optionsString.split(' '):
            self.options[option] = True
        
        self.options["weightCount"] = int(option[-1])

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
        if options['animation']:
            bitmask |= 256
        return bitmask

    def _exportGeometryData(self, dagPath, component):
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

    def _getParentDAGPath(self, childDAGPath):
        # Find the parent dag path of this bone
        dagNode = MFnDagNode(childDAGPath)
        if(dagNode.parentCount() > 1):
            print "***ERROR Influencer has more than one parent."
            return None
        
        if(dagNode.parentCount() == 0):
            return None     
            
        parentObj = dagNode.parent(0)
        parentDagPath = MDagPath()
        MDagPath.getAPathTo(parentObj, parentDagPath)
        return parentDagPath

    # See http://download.autodesk.com/us/maya/2011help/API/class_m_fn_ik_joint.html
    def _getInfluenceData(self, DAGPath, space):
        scaleUtil = MScriptUtil()
        scaleUtil.createFromDouble(1.0, 1.0, 1.0)
        scalePtr = scaleUtil.asDoublePtr()
        
        eulerRot = MEulerRotation()
        quatRot = MQuaternion()     
        quatRotTemp = MQuaternion()
        
        # The rotation component for a joint is calculated as rotationAxis * rotation * jointOrientation.
        try:
            joint = MFnIkJoint(DAGPath)
        except:
            return None
        
        if space != MSpace.kWorld:
            quatRot = joint.rotateOrientation(space)
        joint.getRotation(quatRotTemp, space)
        quatRot = quatRot * quatRotTemp
        joint.getOrientation(quatRotTemp)
        if space != MSpace.kWorld:
            quatRot = quatRot * quatRotTemp
        
        posVect = joint.getTranslation(space)
        joint.getScale(scalePtr)
        joint.getRotation(eulerRot)
                
        scale = []
        scale.append(scaleUtil.getDoubleArrayItem(scalePtr, 0))
        scale.append(scaleUtil.getDoubleArrayItem(scalePtr, 1))
        scale.append(scaleUtil.getDoubleArrayItem(scalePtr, 2))
        
        # To construct the final transformation we must multiply by the inverse of
        # the parent's scaling transformation. This defaults to identity.
        parentScaleInv = [1.0, 1.0, 1.0]
        parentDAGPath = self._getParentDAGPath(DAGPath)
        if(parentDAGPath != None and (parentDAGPath.fullPathName() in self.influenceDAGLookUp)):
            parentJoint = MFnIkJoint(parentDAGPath)
            parentJoint.getScale(scalePtr)
            
            parentScaleInv[0] = 1.0 / scaleUtil.getDoubleArrayItem(scalePtr, 0)
            parentScaleInv[1] = 1.0 / scaleUtil.getDoubleArrayItem(scalePtr, 1)
            parentScaleInv[2] = 1.0 / scaleUtil.getDoubleArrayItem(scalePtr, 2)
        
 
        # TODO: For some reason doing the conversion from a quaternion to a matrix and back can switch the signs of the quaternion.
        """ 
        inverseScaleMatrix = MMatrix()
        MScriptUtil.setDoubleArray(inverseScaleMatrix[0], 0, parentScaleInv[0])
        MScriptUtil.setDoubleArray(inverseScaleMatrix[1], 1, parentScaleInv[1])
        MScriptUtil.setDoubleArray(inverseScaleMatrix[2], 2, parentScaleInv[2])
        
        print "BEFORE: ", quatRot.x, quatRot.y, quatRot.z, quatRot.w
        
        rotMat = quatRot.asMatrix() * inverseScaleMatrix
        quatRot = MTransformationMatrix(rotMat).rotation()
        
        print "AFTER:  ", quatRot.x, quatRot.y, quatRot.z, quatRot.w
        """
        
        position = [posVect.x, posVect.y, posVect.z]
        rotation = [eulerRot.x, eulerRot.y, eulerRot.z]
        rotq = [quatRot.x, quatRot.y, quatRot.z, quatRot.w]
                
        return (position, scale, rotation, rotq)
            
    # This method returns a dictionary of all vertices in a mesh with their associated influence weights.
    # Based on http://www.charactersetup.com/tutorial_skinWeights.html
    def _getVertexWeightDictionary(self, infDags, skin):
        infIds = {}
        infs = []
        for x in xrange(infDags.length()):
            infPath = infDags[x].fullPathName()
            infId = int(skin.indexForInfluenceObject(infDags[x]))
            infIds[infId] = x
            infs.append(infPath)
            # get the MPlug for the weightList and weights attributes
            wlPlug = skin.findPlug('weightList')
            wPlug = skin.findPlug('weights')
            wlAttr = wlPlug.attribute()
            wAttr = wPlug.attribute()
            wInfIds = OpenMaya.MIntArray()

            # the weights are stored in dictionary, the key is the vertId, 
            # the value is another dictionary whose key is the influence id and 
            # value is the weight for that influence
            weights = {}
            for vId in xrange(wlPlug.numElements()):
                vWeights = {}
                # tell the weights attribute which vertex id it represents
                wPlug.selectAncestorLogicalIndex(vId, wlAttr)
                
                # get the indice of all non-zero weights for this vert
                wPlug.getExistingArrayAttributeIndices(wInfIds)

                # create a copy of the current wPlug
                infPlug = OpenMaya.MPlug(wPlug)
                for infId in wInfIds:
                    # tell the infPlug it represents the current influence id
                    infPlug.selectAncestorLogicalIndex(infId, wAttr)
                    
                    # add this influence and its weight to this verts weights
                    try:
                        vWeights[infIds[infId]] = infPlug.asDouble()
                    except KeyError:
                        # assumes a removed influence
                        pass
                
                weights[vId] = vWeights
        
        return weights
        
    
    # This method is responsible for generating all of the animation data.
    def _exportAnimationData(self, dagPath, object):
        options = self.options.copy()
        
        if options['animation'] or options['skinWeights']:
            # Make sure the animation is set to it's starting frame
            startTime = MAnimControl.animationStartTime()
            endTime = MAnimControl.animationEndTime()
            animationFrame = MTime(startTime)
            MAnimControl.setCurrentTime(animationFrame)
            
            # Initialize the animation structures
            self.skinWeights = []
            self.skinIndices = []
            self.bones = []
            self.animation = {}
            
            nodeIter = MItDependencyNodes(MFn.kInvalid)
            skinNode = None
            
            # UPGRADE: Only supports a single skin cluster.
            while not nodeIter.isDone():
                obj = nodeIter.item()
                if(obj.apiType() == MFn.kSkinClusterFilter):
                    skinNode = obj
                    break;
                    
                nodeIter.next()
            
            if not skinNode:
                print "***FAILED Could not find viable skin cluster."
                return
                
            skinCluster = MFnSkinCluster(skinNode)
            
            # Find all of the influence objects (bones) associated with this skin cluster.
            influenceDAGs = MDagPathArray()
            numInfluences = skinCluster.influenceObjects(influenceDAGs)
            if(numInfluences == 0):
                print "***ERROR No influence object found for skin cluster."
                return
                
            print numInfluences, "influences found."
            
            # Find the number of meshes associated with this cluster. Can only support one mesh.
            numGeometries = skinCluster.numOutputConnections()
            if(numGeometries != 1):
                print "***ERROR Can only support one mesh per skin cluster."
                return
                
            # Create a DAG lookup that allows us to map an influence index to a bone.
            self.influenceDAGLookUp = {}
            for i in xrange(numInfluences):
                self.influenceDAGLookUp[influenceDAGs[i].fullPathName()] = i
                
            boneInfluenceIDList = []
            # Go through all of the influences and build up the initial bone pose information.
            for i in xrange(numInfluences):
                bone = {}
                bone["name"] = influenceDAGs[i].partialPathName()
                                
                boneID = skinCluster.indexForInfluenceObject(influenceDAGs[i]);
                boneInfluenceIDList.append(boneID)
                
                space = MSpace.kTransform
                if (i == 0): 
                    space = MSpace.kWorld

                (bone["pos"], bone["scl"], bone["rot"], bone["rotq"]) = self._getInfluenceData(influenceDAGs[i], space)
                
                # Find the parent dag path of this bone
                parentDagPath = self._getParentDAGPath(influenceDAGs[i])
                
                # Use the DAG lookup to find the index, as maintained in the Maya attribute arrays.
                parentInfluenceIndex = -1
                if(parentDagPath.fullPathName() in self.influenceDAGLookUp):
                    parentInfluenceIndex = self.influenceDAGLookUp[parentDagPath.fullPathName()]
                
                bone["parent"] = parentInfluenceIndex
                self.bones.append(bone)
                print "   [", i, "](", bone["name"],"), parent [", parentInfluenceIndex,"](", parentDagPath.partialPathName() ,")"
                
            # Extract skinWeight and skinIndice data.
            if options['skinWeights']:
                tupleInfluenceIDs = tuple(boneInfluenceIDList)
                weightIndicies = MScriptUtil().createFromList(tupleInfluenceIDs, len(boneInfluenceIDList))
                    
                # Build influence dictionary per vertex
                vertexWeights = self._getVertexWeightDictionary(influenceDAGs, skinCluster);
                for i in xrange(len(vertexWeights)):
                    weightDict = vertexWeights[i]
                    weightList = weightDict.items();
                    
                    # Sort the vertex weights in descending order.
                    weightList.sort(reverse = True, key=lambda tup: tup[1])
                    weightCount = options['weightCount'] - len(weightList) 
                    
                    weightArrayStartingIndex = len(self.skinWeights)
                    # If this vertex does not have enough weights defined, append (0, 0) influences.
                    if(weightCount > 0):
                        while(weightCount):
                            weightList.append((0,0))
                            weightCount = weightCount - 1;
                   
                    totalVertexWeight = 0.0
                    for j in xrange(options['weightCount']):
                        self.skinIndices.append(weightList[j][0])
                        self.skinWeights.append(weightList[j][1])
                        totalVertexWeight += weightList[j][1]
                        
                    if(totalVertexWeight == 0.0):
                        totalVertexWeight = 1.0
                        
                    # The combined weight of all influences on this vertex should be (at least) 1.0.
                    # If it is not apply the difference to each of the weights.
                    if(totalVertexWeight < 1.0):
                        residualWeight = 1.0 - totalVertexWeight
                        for j in xrange(options['weightCount']):
                            weightRatio = self.skinWeights[weightArrayStartingIndex+j] / totalVertexWeight
                            self.skinWeights[weightArrayStartingIndex+j] = self.skinWeights[weightArrayStartingIndex+j] + residualWeight * weightRatio
                                
            
            # Extract animation data
            if options['animation']:
                print "Building animation set [", startTime.value(), ",", endTime.value(), "]"
                animationFrameRange = int(endTime.value() - startTime.value())
                
                frameRateUnits = startTime.unit()
                if frameRateUnits in kFrameRateLookup:
                    self.animation["fps"] = kFrameRateLookup[frameRateUnits]
                else:
                    print "***FAILED Could not find matching framerate for unit enumeration", frameRateUnits
                    return
                
                print "Frame Rate:", self.animation['fps']
                
                framePeriod = 1.0 / self.animation['fps']
                self.animation["length"] = framePeriod * animationFrameRange
                self.animation["JIT"] = 0
                self.animation["name"] = "animation_1"
                self.animation["hierarchy"] = []
                
                #
                # Build the animation hierarchy. This creates an array of bones. Each bone is itself an array of all the transformations
                # applied by each frame of the animation.
                #
                for boneIndex in xrange(numInfluences):
                    boneAnimation = {}
                    boneAnimation["parent"] = self.bones[boneIndex]["parent"]
                    boneAnimation["keys"] = []
                    space = MSpace.kTransform
                    if (boneIndex == 0): 
                        space = MSpace.kWorld
                    
                    for frameIndex in xrange(animationFrameRange+1):
                        animationTime = MTime(frameIndex + int(startTime.value()), frameRateUnits)
                        MAnimControl.setCurrentTime(animationTime)
                        
                        keyFrame = {}
                        keyFrame["time"] = frameIndex * framePeriod 
                        
                        (keyFrame["pos"], keyFrame["scl"], rot, keyFrame["rot"]) = self._getInfluenceData(influenceDAGs[boneIndex], space)
                        boneAnimation["keys"].append(keyFrame)
                    self.animation["hierarchy"].append(boneAnimation)

                
    def _exportMeshes(self):
        selectedMesh = []
        
        # First: Duplicate and combine all of the selected meshes. This is done to create a temporary 
        #   object that can be used 
        if self.accessMode == MPxFileTranslator.kExportAccessMode:
            selectedMesh = mc.ls(typ='mesh')
        # export selection
        elif self.accessMode == MPxFileTranslator.kExportActiveAccessMode:
            selectedMesh = mc.ls(sl=1)
        else:
            raise ThreeJsError('Unsupported access mode: {0}'.format(self.accessMode))
        
        if(len(selectedMesh) == 0):
            print "*** No mesh selected. Quitting export."
            return
            
        if(len(selectedMesh) > 1):
            print "*** Exporting can only be performed on a single mesh. Quitting export."
            return
            
        print "Selected Items:", selectedMesh[0]
        
        # If the model is animated, then set the frame to the starting frame.
        if self.options['animation']:
            # Make sure the animation is set to it's starting frame
            startTime = MAnimControl.animationStartTime()
            animationFrame = MTime(startTime)
            MAnimControl.setCurrentTime(animationFrame)
        
        # duplicate the mesh and convert all faces to triangles.
        duplicatedMesh = mc.duplicate(selectedMesh)
        mc.polyTriangulate(duplicatedMesh[0])
        
        # Select the duplicate as the active mesh
        mc.select(duplicatedMesh[0])
        sel = MSelectionList()
        MGlobal.getActiveSelectionList(sel)
        mDag = MDagPath()
        mObj = MObject()
        sel.getDagPath(0, mDag, mObj)
                
        self._exportGeometryData(mDag, mObj)
        
        # Delete the duplicate since we are done with it.
        mc.delete(duplicatedMesh[0])
        
        # Select the original mesh and get a DAG for animation processing.
        mc.select(selectedMesh[0]);
        sel = MSelectionList()
        MGlobal.getActiveSelectionList(sel)
        mDag = MDagPath()
        mObj = MObject()
        sel.getDagPath(0, mDag, mObj)
        
        self._exportAnimationData(mDag, mObj)
    
        
        
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