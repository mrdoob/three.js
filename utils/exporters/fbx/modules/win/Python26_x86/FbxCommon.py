from fbx import *
import sys

def InitializeSdkObjects():
    # The first thing to do is to create the FBX SDK manager which is the 
    # object allocator for almost all the classes in the SDK.
    lSdkManager = KFbxSdkManager.Create()
    if not lSdkManager:
        sys.exit(0)
        
    # Create an IOSettings object
    ios = KFbxIOSettings.Create(lSdkManager, IOSROOT)
    lSdkManager.SetIOSettings(ios)
    
    # Create the entity that will hold the scene.
    lScene = KFbxScene.Create(lSdkManager, "")
    
    return (lSdkManager, lScene)

def SaveScene(pSdkManager, pScene, pFilename, pFileFormat = -1, pEmbedMedia = False):
    lExporter = KFbxExporter.Create(pSdkManager, "")
    if pFileFormat < 0 or pFileFormat >= pSdkManager.GetIOPluginRegistry().GetWriteFormatCount():
        pFileFormat = pSdkManager.GetIOPluginRegistry().GetNativeWriterFormat()
        if not pEmbedMedia:
            lFormatCount = pSdkManager.GetIOPluginRegistry().GetWriterFormatCount()
            for lFormatIndex in range(lFormatCount):
                if pSdkManager.GetIOPluginRegistry().WriterIsFBX(lFormatIndex):
                    lDesc = KString(pSdkManager.GetIOPluginRegistry().GetWriterFormatDescription(lFormatIndex))
                    if lDesc.Find("ascii") >= 0:
                        pFileFormat = lFormatIndex
                        break
    
    if not pSdkManager.GetIOSettings():
        ios = KFbxIOSettings.Create(pSdkManager, IOSROOT)
        pSdkManager.SetIOSettings(ios)
    
    pSdkManager.GetIOSettings().SetBoolProp(EXP_FBX_MATERIAL, True)
    pSdkManager.GetIOSettings().SetBoolProp(EXP_FBX_TEXTURE, True)
    pSdkManager.GetIOSettings().SetBoolProp(EXP_FBX_EMBEDDED, pEmbedMedia)
    pSdkManager.GetIOSettings().SetBoolProp(EXP_FBX_SHAPE, True)
    pSdkManager.GetIOSettings().SetBoolProp(EXP_FBX_GOBO, True)
    pSdkManager.GetIOSettings().SetBoolProp(EXP_FBX_ANIMATION, True)
    pSdkManager.GetIOSettings().SetBoolProp(EXP_FBX_GLOBAL_SETTINGS, True)

    if lExporter.Initialize(pFilename, pFileFormat, pSdkManager.GetIOSettings()):
        lExporter.Export(pScene)

    lExporter.Destroy()
        
def LoadScene(pSdkManager, pScene, pFileName):
    lImporter = KFbxImporter.Create(pSdkManager, "")    
    result = lImporter.Initialize(pFileName, -1, pSdkManager.GetIOSettings())
    if not result:
        return False
    
    if lImporter.IsFBX():
        pSdkManager.GetIOSettings().SetBoolProp(EXP_FBX_MATERIAL, True)
        pSdkManager.GetIOSettings().SetBoolProp(EXP_FBX_TEXTURE, True)
        pSdkManager.GetIOSettings().SetBoolProp(EXP_FBX_EMBEDDED, True)
        pSdkManager.GetIOSettings().SetBoolProp(EXP_FBX_SHAPE, True)
        pSdkManager.GetIOSettings().SetBoolProp(EXP_FBX_GOBO, True)
        pSdkManager.GetIOSettings().SetBoolProp(EXP_FBX_ANIMATION, True)
        pSdkManager.GetIOSettings().SetBoolProp(EXP_FBX_GLOBAL_SETTINGS, True)
    
    result = lImporter.Import(pScene)
    lImporter.Destroy()
    return result