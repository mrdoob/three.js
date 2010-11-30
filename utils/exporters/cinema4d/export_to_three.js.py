'''
author : "George Profenza"
url    : ("disturb", "disturbmedia.com/blog","My blog, http://tomaterial.blogspot.com")

Export meshes the three.js 3D Engine by mr.doob's et al.

More details on the engine here:
https://github.com/mrdoob/three.js

Currently supports UVs. If the model doesn't display correctly
you might need to reverse some normals/do some cleanup.
Also, if you use Selection Tags and basic ColorMaterials, 
the colours will be picked up as face colors. Call autoColor() on the
model you use for this.
The mesh transformations(position, rotation, scale) are saved
and you can get them using: getPosition(), getRotation() and getScale()
each returning a THREE.Vector3

In short
var myGeom = new myC4DGeom();
var myModel = new THREE.Mesh( myGeom, new THREE.MeshFaceMaterial());
//set transforms
model.position = myGeom.getPosition()
model.rotation = myGeom.getRotation()
model.scale    = myGeom.getScale()
//set selection tags colours
myGeom.autoColor()

More details on this exporter and more js examples here:
https://github.com/orgicus/three.js

Have fun!

This script requires Cinema 4D R11.5 minimum and the Py4D Plugin:
http://www.py4d.com/get-py4d/
'''

import c4d
from c4d import documents,UVWTag,storage
from c4d.utils import *
from c4d import symbols as sy, plugins, utils, bitmaps, gui
import math
import re

# utils
clean = lambda varStr: re.sub('\W|^(?=\d)','_', varStr)
# from Active State's Python recipies: http://code.activestate.com/recipes/266466-html-colors-tofrom-rgb-tuples/
def RGBToHTMLColor(rgb_tuple):
    return '0x%02x%02x%02x' % rgb_tuple
def Export():
    if not op: return
    if op.GetType() != 5100:
            print 'Selected Object is not an editable mesh'
            return
    unit = 0.001#for scale
    fps   = doc.GetFps()
    bd = doc.GetRenderBaseDraw()
    scr = bd.GetFrameScreen()
    rd = doc.GetActiveRenderData()
    name  = op.GetName()
    classname = clean(name)
    
    c4dPath = c4d.storage.GeGetC4DPath(sy.C4D_PATH_LIBRARY)
    jsFile = open(c4dPath+'/scripts/Three.js','r')
    js = jsFile.read()
    htmlFile = open(c4dPath+'/scripts/template.html','r')
    html = htmlFile.read()
    html = html.replace('%s',classname)
    code  = 'var %s = function () {\n\n\tvar scope = this;\n\n\tTHREE.Geometry.call(this);\n\n' % classname
    
    def GetMesh(code):
        # goto 0
        doc.SetTime(c4d.BaseTime(0, fps))
        c4d.DrawViews( c4d.DA_ONLY_ACTIVE_VIEW|c4d.DA_NO_THREAD|c4d.DA_NO_REDUCTION|c4d.DA_STATICBREAK )
        c4d.GeSyncMessage(c4d.EVMSG_TIMECHANGED)
        doc.SetTime(doc.GetTime())
        c4d.EventAdd(c4d.EVENT_ANIMATE)
        SendModelingCommand(command = MCOMMAND_REVERSENORMALS, list = [op], mode = MODIFY_ALL, bc = c4d.BaseContainer(), doc = doc)
        
        verts = op.GetPointAll()
        for v in verts:
            code += '\tv( %.6f, %.6f, %.6f );\n' % (v.x, -v.y, v.z)
        code += '\n'
        ncount = 0
        uvcount = 0
        faces = op.GetAllPolygons()
        normals = op.CreatePhongNormals()
        ndirection = 1
        hasUV = False
        for tag in op.GetTags():
            if tag.GetName() == "UVW":
                uvw = tag
                hasUV = True
        for f in faces:
            if(f.d == f.c):
                if(normals):
                    code += '\tf3( %d, %d, %d, %.6f, %.6f, %.6f );\n' % (f.a, f.b, f.c, normals[ncount].x*ndirection, normals[ncount].y*ndirection, normals[ncount].z*ndirection)
                else:
                    code += '\tf3( %d, %d, %d );\n' % (f.a, f.b, f.c)
            else:
                if(normals):
                    code += '\tf4( %d, %d, %d, %d, %.6f, %.6f, %.6f );\n' % (f.a, f.b, f.c, f.d, normals[ncount].x*ndirection, normals[ncount].y*ndirection, normals[ncount].z*ndirection)
                else:
                    code += '\tf4( %d, %d, %d, %d );\n' % (f.a, f.b, f.c, f.d)
            if hasUV:
                uv = uvw.Get(uvcount);
                # uvs  += '[Vector('+str(uv[0].x)+','+str(1.0-uv[0].y)+'),Vector('+str(uv[1].x)+','+str(1.0-uv[1].y)+'),Vector('+str(uv[2].x)+','+str(1.0-uv[2].y)+')],'
                if len(uv) == 4:
                    code += '\tuv( %.6f, %.6f, %.6f, %.6f, %.6f, %.6f, %.6f, %.6f);\n' % (uv[0].x, uv[0].y, uv[1].x, uv[1].y, uv[2].x, uv[2].y, uv[3].x, uv[3].y)
                else:
                    code += '\tuv( %.6f, %.6f, %.6f, %.6f, %.6f, %.6f);\n' % (uv[0].x, uv[0].y, uv[1].x, uv[1].y, uv[2].x, uv[2].y)
                ncount += 1
                uvcount += 1
        code +='\n\tthis.computeCentroids();\n\tthis.computeNormals(true);\n'
        #selection color
        code +='\n\tscope.colors = {};\n'
        code +='\tscope.selections = {};\n'
        selName = ''
        for tag in op.GetTags():  
            if(tag.GetType() == 5616): #texture tag
               material = tag.GetMaterial()
               color = material[sy.MATERIAL_COLOR_COLOR]
               tag.SetBit(c4d.BIT_ACTIVE)
               selName = clean(tag[sy.TEXTURETAG_RESTRICTION])
               if len(selName) == 0:    print "*** WARNING! *** Missing selection name for material: " + material.GetName()
               code += '\tscope.colors["'+selName+'"] = '+str(RGBToHTMLColor((color.x*255,color.y*255,color.z*255)))+';\n'
            if tag.GetType() == 5673:  #selection tag
               # print 'selection: ' + tag.GetName()  
               sel = tag.GetSelection()
               selName = clean(tag.GetName())
               ids = sel.GetAll(op.GetPointCount())
               indices = [i for i, e in enumerate(ids) if e != 0]
               code += '\tscope.selections["'+selName+'"] = '+str(indices)+';\n'
               
        code += '\n\tscope.autoColor = function(){\n'
        code += '\t\tfor(var s in this.selections){\n'
        code += '\t\t\tfor(var i = 0 ; i < this.selections[s].length; i++) this.faces[this.selections[s][i]].material = [new THREE.MeshBasicMaterial({color:this.colors[s]})];\n'
        code += '\t\t}\n\t}\n'
        
        # model position, rotation, scale               rotation x,y,z = H,P,B => three.js x,y,z is P,H,B => y,x,z
        p = op.GetPos()
        r = op.GetRot()
        s = op.GetScale()
        code += '\n\tscope.getPosition = function(){\treturn new THREE.Vector3'+str((p.x,p.y,p.z))+';\t}\n'
        code += '\n\tscope.getRotation = function(){\treturn new THREE.Vector3'+str((r.y,r.x,r.z))+';\t}\n'
        code += '\n\tscope.getScale = function(){\treturn new THREE.Vector3'+str((s.x,s.y,s.z))+';\t}\n'
        
        code += '\n'
        code += '\tfunction v( x, y, z ) {\n\n'
        code += '\t\tscope.vertices.push( new THREE.Vertex( new THREE.Vector3( x, y, z ) ) );\n\n'
        code += '\t}\n\n'
        code += '\tfunction f3( a, b, c, nx, ny, nz ) {\n\n'
        code += '\t\tscope.faces.push( new THREE.Face3( a, b, c, nx && ny && nz ? new THREE.Vector3( nx, ny, nz ) : null ) );\n\n'
        code += '\t}\n\n'
        code += '\tfunction f4( a, b, c, d, nx, ny, nz ) {\n\n'
        code += '\t\tscope.faces.push( new THREE.Face4( a, b, c, d, nx && ny && nz ? new THREE.Vector3( nx, ny, nz ) : null ) );\n\n'
        code += '\t}\n\n'
        code += '\tfunction uv( u1, v1, u2, v2, u3, v3, u4, v4 ) {\n\n'
        code += '\t\tvar uv = [];\n'
        code += '\t\tuv.push( new THREE.UV( u1, v1 ) );\n'
        code += '\t\tuv.push( new THREE.UV( u2, v2 ) );\n'
        code += '\t\tuv.push( new THREE.UV( u3, v3 ) );\n'
        code += '\t\tif ( u4 && v4 ) uv.push( new THREE.UV( u4, v4 ) );\n'
        code += '\t\tscope.uvs.push( uv );\n'
        code += '\t}\n\n'
        code += '}\n\n'
        code += '%s.prototype = new THREE.Geometry();\n' % classname
        code += '%s.prototype.constructor = %s;' % (classname, classname)
        
        SendModelingCommand(command = MCOMMAND_REVERSENORMALS, list = [op], mode = MODIFY_ALL, bc = c4d.BaseContainer(), doc = doc)
        
        return code

    code = GetMesh(code)
    docPath = doc.GetDocumentPath() 
    jspath = docPath+'/'+classname+'.js'
    htmlpath = docPath+'/'+classname+'.html'
    file = open(jspath,'w')
    file.write(code)
    file.close()
    file = open(htmlpath,'w')
    file.write(html)
    file.close()
    file = open(docPath+'/Three.js','w')
    file.write(js)
    file.close()
    print 'Export Complete!'

Export()