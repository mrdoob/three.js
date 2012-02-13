import c4d
import re

from c4d import documents, UVWTag, storage, plugins, gui, modules, bitmaps, utils
from c4d.utils import *

clean = lambda varStr: re.sub('\W|^(?=\d)','_', varStr)

EDITABLE_MESH = 5100
TEXTURE_TAG   = 5616
SELECTION_TAG = 5673

if op.GetType() != EDITABLE_MESH:
    print 'Selected Object is not an editable mesh'
    exit

classname = clean(op.GetName())

code  = 'var %s = function () {\n\n\tvar scope = this;\n\n\tTHREE.Geometry.call(this);\n\n' % classname

doc.SetTime(c4d.BaseTime(0, doc.GetFps()))
c4d.DrawViews( c4d.DA_ONLY_ACTIVE_VIEW|c4d.DA_NO_THREAD|c4d.DA_NO_REDUCTION|c4d.DA_STATICBREAK )
c4d.GeSyncMessage(c4d.EVMSG_TIMECHANGED)
doc.SetTime(doc.GetTime())
c4d.EventAdd(c4d.EVENT_ANIMATE)
SendModelingCommand(command = c4d.MCOMMAND_REVERSENORMALS, list = [op], mode = c4d.MODIFY_ALL, bc = c4d.BaseContainer(), doc = doc)

for v in op.GetAllPoints(): # C4D is left handed, Three.js is right, need to invert the x
    code += '\tv( %.6f, %.6f, %.6f );\n' % (-(v.x), v.y, v.z)

code       += '\n'
ncount     = 0
uvcount    = 0
faces      = op.GetAllPolygons()
normals    = op.CreatePhongNormals()
ndirection = 1
hasUV      = False

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
        uv = uvw.GetSlow(uvcount);
        if len(uv) == 4:
            code += '\tuv( %.6f, %.6f, %.6f, %.6f, %.6f, %.6f, %.6f, %.6f);\n ' % ( uv['a'].x,  uv['a'].y,  uv['b'].x, uv['b'].y,  uv['c'].x, uv['c'].y, uv['d'].x, uv['d'].y)
        else:
            code += '\tuv( %.6f, %.6f, %.6f, %.6f, %.6f, %.6f);\n' % (uv['a'].x, uv['a'].y, uv['b'].x, uv['b'].y, uv['c'].x, uv['c'].y)
        ncount += 1
        uvcount += 1

code +='\n\tthis.computeCentroids();\n\tthis.computeFaceNormals();\n'
code +='\n\tscope.colors = {};\n'
code +='\tscope.selections = {};\n'

selName = ''
for tag in op.GetTags():
    if(tag.GetType() == TEXTURE_TAG):
       material = tag.GetMaterial()
       color = material[c4d.MATERIAL_COLOR_COLOR]
       tag.SetBit(c4d.BIT_ACTIVE)
       code += '\tscope.colors["'+selName+'"] = '+str('0x%02x%02x%02x' % (color.x*255,color.y*255,color.z*255))+';\n'
    if tag.GetType() == SELECTION_TAG:
       sel = tag.GetBaseSelect()
       selName = clean(tag.GetName())
       ids = sel.GetAll(op.GetPointCount())
       indices = [i for i, e in enumerate(ids) if e != 0]
       code += '\tscope.selections["'+selName+'"] = '+str(indices)+';\n'

p = op.GetAbsPos() # C4D is left handed, Three.js is right, need to invert the x
r = op.GetAbsRot() # C4D is H/P/B, Three.js defaults (recommended) to P/H/B
s = op.GetAbsScale()

code += '\n\tscope.getPosition = function(){\treturn new THREE.Vector3'+str((-(p.x),p.y,p.z))+';\t}\n'
code += '\n\tscope.getRotation = function(){\treturn new THREE.Vector3'+str((r.y,r.x,r.z))+';\t}\n'
code += '\n\tscope.getScale = function(){\treturn new THREE.Vector3'+str((s.x,s.y,s.z))+';\t}\n'

code+="""

    function v( x, y, z ) {
        scope.vertices.push( new THREE.Vertex( new THREE.Vector3( x, y, z ) ) );
    }
    function f3( a, b, c, nx, ny, nz ) {
        scope.faces.push( new THREE.Face3( a, b, c, nx && ny && nz ? new THREE.Vector3( nx, ny, nz ) : null ) );
    }
    function f4( a, b, c, d, nx, ny, nz ) {
        scope.faces.push( new THREE.Face4( a, b, c, d, nx && ny && nz ? new THREE.Vector3( nx, ny, nz ) : null ) );
    }
    function uv( u1, v1, u2, v2, u3, v3, u4, v4 ) {
        var uv = [];
        uv.push( new THREE.UV( u1, v1 ) );
        uv.push( new THREE.UV( u2, v2 ) );
        uv.push( new THREE.UV( u3, v3 ) );
        if ( u4 && v4 ) uv.push( new THREE.UV( u4, v4 ) );
        scope.faceVertexUvs[ 0 ].push( uv );
    }
}

"""

code += '%s.prototype = new THREE.Geometry();\n' % classname
code += '%s.prototype.constructor = %s;' % (classname, classname)

SendModelingCommand(command = c4d.MCOMMAND_REVERSENORMALS, list = [op], mode = c4d.MODIFY_ALL, bc = c4d.BaseContainer(), doc = doc)

docPath = doc.GetDocumentPath() 
jspath = docPath+'/'+classname+'.js'
file = open(jspath,'w')
file.write(code)
file.close()

print 'Export Complete! Model is in' + docPath
