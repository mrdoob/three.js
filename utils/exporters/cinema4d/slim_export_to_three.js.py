import c4d 
from c4d import *
from c4d.documents import *
from c4d import symbols as sy, plugins, utils, bitmaps, gui
import re,os,subprocess

clean = lambda varStr: re.sub('\W|^(?=\d)','_', varStr)
#save obj
name = op.GetName()
c4dPath = c4d.storage.GeGetC4DPath(sy.C4D_PATH_LIBRARY)
docPath = doc.GetDocumentPath()
objPath = docPath+'/'+name+'.obj'
mtlPath = docPath+'/'+name+'.mtl'
jsPath  = docPath+'/'+name+'.js'
SaveDocument(doc,objPath,sy.SAVEFLAG_AUTOSAVE,sy.FORMAT_OBJEXPORT)

#save mtl
mcount = 0;
mtl = ''
for tag in op.GetTags():  
    if(tag.GetType() == 5616): #texture tag
       mcount += 1
       m = tag.GetMaterial()
       mtl += 'newmtl '+clean(m.GetName())+'\n'
       if(m[sy.MATERIAL_COLOR_COLOR]):   mtl += 'Kd ' + str(m[sy.MATERIAL_COLOR_COLOR].x) + ' ' + str(m[sy.MATERIAL_COLOR_COLOR].y) + ' ' + str(m[sy.MATERIAL_COLOR_COLOR].z) + '\n'
       if(m[sy.MATERIAL_SPECULAR_COLOR]):    mtl += 'Ks ' + str(m[sy.MATERIAL_SPECULAR_COLOR].x) + ' ' + str(m[sy.MATERIAL_SPECULAR_COLOR].y) + ' ' + str(m[sy.MATERIAL_SPECULAR_COLOR].z) + '\n'
       if(m[sy.MATERIAL_SPECULAR_BRIGHTNESS]):   mtl += 'Ns ' + str(m[sy.MATERIAL_SPECULAR_BRIGHTNESS]) + '\n'
       if(m[sy.MATERIAL_TRANSPARENCY_BRIGHTNESS]):   mtl += 'd ' + str(m[sy.MATERIAL_TRANSPARENCY_BRIGHTNESS]) + '\n'
       if(m[sy.MATERIAL_COLOR_SHADER]):  mtl += 'map_Kd ' + str(m[sy.MATERIAL_COLOR_SHADER][sy.BITMAPSHADER_FILENAME]) + '\n'
       if(m[sy.MATERIAL_TRANSPARENCY_SHADER]):   mtl += 'map_d ' + str(m[sy.MATERIAL_COLOR_SHADER][sy.BITMAPSHADER_FILENAME]) + '\n'
       if(m[sy.MATERIAL_BUMP_SHADER]):   mtl += 'map_bump ' + str(m[sy.MATERIAL_BUMP_SHADER][sy.BITMAPSHADER_FILENAME]) + '\n'
       mtl += 'illum 0\n\n\n'#TODO: setup the illumination, ambient and optical density
mtl = '# Material Count: '+str(mcount)+'\n'+mtl
file = open(mtlPath,'w')
file.write(mtl)
file.close()
#convert
convert = ['python', c4dPath+'/scripts/convert_obj_threejs_slim.py', '-i', objPath, '-o', jsPath]

try:
	# Start the process
	p = subprocess.Popen(convert, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

	# Block while process is running
	while p.poll() == None:
	    # Write stdout to file
	    '''
	    f = open(docPath+'/'+name+'_log.txt', 'a')
        for l in p.stdout.readlines():
            f.write(l)
        f.close()
        '''
        pass
	print 'done'
	os.remove(objPath)
	os.remove(mtlPath)
# Error runinng shell script
except subprocess.CalledProcessError:
    print 'error!'