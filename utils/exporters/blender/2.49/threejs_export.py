#!BPY

# Based on Anthony D'Agostino (Scorpius)'s Raw Exported provided with Blender
# and on Mr.doob's and Kikko's Blender 2.5a2 exporter
# 'http://mrdoob.com', 'http://github.com/kikko'
"""
Name: 'three.js (.js)...'
Blender: 245
Group: 'Export'
Tooltip: 'Export selected mesh to three.js (.js)'
"""

__author__ = "George Profenza"
__url__ = ("disturb", "disturbmedia.com/blog",
"My blog, http://tomaterial.blogspot.com")
__version__ = "First File Exporter"

__bpydoc__ = """\
Export meshes to mr.doob's three.js 3D Engine.
Currently supports UVs. If the model doesn't display correctly
you might need to reverse some normals/do some cleanup.

More details on the engine here:
https://github.com/mrdoob/three.js

Have fun!

Usage:<br>
	Select a mesh to be exported and go to "File->Export->three.js" .
"""
# $Id: raw_export.py 14597 2008-04-28 16:09:17Z campbellbarton $
#
# +---------------------------------------------------------+
# | Copyright (c) 2002 Anthony D'Agostino                   |
# | http://www.redrival.com/scorpius                        |
# | scorpius@netzero.com                                    |
# | April 28, 2002                                          |
# | Read and write RAW Triangle File Format (*.raw)         |
# +---------------------------------------------------------+

# ***** BEGIN GPL LICENSE BLOCK *****
#
# This program is free software; you can redistribute it and/or
# modify it under the terms of the GNU General Public License
# as published by the Free Software Foundation; either version 2
# of the License, or (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program; if not, write to the Free Software Foundation,
# Inc., 59 Temple Place - Suite 330, Boston, MA  02111-1307, USA.
#
# ***** END GPL LICENCE BLOCK *****

import Blender
import BPyMesh
import re

clean = lambda varStr: re.sub('\W|^(?=\d)','_', varStr)

def write(filename):
    start = Blender.sys.time()
    if not filename.lower().endswith('.js'):
    	filename += '.js'
    
    scn= Blender.Scene.GetCurrent()
    ob= scn.objects.active
    if not ob:
    	Blender.Draw.PupMenu('Error%t|Select 1 active object')
    	return
    
    file = open(filename, 'wb')
    
    mesh = BPyMesh.getMeshFromObject(ob, None, True, False, scn)
    if not mesh:
    	Blender.Draw.PupMenu('Error%t|Could not get mesh data from active object')
    	return
    
    mesh.transform(ob.matrixWorld)
    
    #classname = clean(ob.name)
    classname = filename.split('/')[-1].replace('.js','')
    
    file = open(filename, "wb")
    
    file.write('var %s = function () {\n\n' % classname)
    file.write('\tvar scope = this;\n\n')
    file.write('\tTHREE.Geometry.call(this);\n\n')
    
    for v in mesh.verts:
        file.write('\tv( %.6f, %.6f, %.6f );\n' % (v.co.x, v.co.z, -v.co.y)) # co
    
    file.write('\n')
    
    for f in mesh.faces:
        if len(f.verts) == 3:
            file.write('\tf3( %d, %d, %d, %.6f, %.6f, %.6f );\n' % (f.verts[0].index, f.verts[1].index, f.verts[2].index, f.verts[0].no.x, f.verts[0].no.z, -f.verts[0].no.y))
        else:
            file.write('\tf4( %d, %d, %d, %d, %.6f, %.6f, %.6f );\n' % (f.verts[0].index, f.verts[1].index, f.verts[2].index, f.verts[3].index, f.verts[0].no.x, f.verts[0].no.z, -f.verts[0].no.y))
    face_index_pairs = [ (face, index) for index, face in enumerate(mesh.faces)]
    
    file.write('\n')
    '''
    for f in me.faces:
		if me.faceUV:
		    if len(f.verts) == 3:
		        file.write('\tuv( %.6f, %.6f, %.6f, %.6f, %.6f, %.6f );\n' % (f.uv[0][0], 1.0-f.uv[0][1], f.uv[1][0], 1.0-f.uv[1][1], f.uv[2][0], 1.0-f.uv[2][1])
	'''
    for f in mesh.faces:
	    if mesh.faceUV:
	        if len(f.verts) == 3:
	            file.write('\tuv( %.6f, %.6f, %.6f, %.6f, %.6f, %.6f );\n' % (f.uv[0].x, 1.0 - f.uv[0].y, f.uv[1].x, 1.0 - f.uv[1].y, f.uv[2].x, 1.0 - f.uv[2].y))
	        else:
	            file.write('\tuv( %.6f, %.6f, %.6f, %.6f, %.6f, %.6f, %.6f, %.6f);\n' % (f.uv[0].x, 1.0 - f.uv[0].y, f.uv[1].x, 1.0 - f.uv[1].y, f.uv[2].x, 1.0 - f.uv[2].y, f.uv[3].x, 1.0 - f.uv[3].y))
	
    file.write('\n')
    file.write('\tfunction v( x, y, z ) {\n\n')
    file.write('\t\tscope.vertices.push( new THREE.Vertex( new THREE.Vector3( x, y, z ) ) );\n\n')
    file.write('\t}\n\n')
    file.write('\tfunction f3( a, b, c, nx, ny, nz ) {\n\n')
    file.write('\t\tscope.faces.push( new THREE.Face3( a, b, c, nx && ny && nz ? new THREE.Vector3( nx, ny, nz ) : null ) );\n\n')
    file.write('\t}\n\n')
    file.write('\tfunction f4( a, b, c, d, nx, ny, nz ) {\n\n')
    file.write('\t\tscope.faces.push( new THREE.Face4( a, b, c, d, nx && ny && nz ? new THREE.Vector3( nx, ny, nz ) : null ) );\n\n')
    file.write('\t}\n\n')
    file.write('\tfunction uv( u1, v1, u2, v2, u3, v3, u4, v4 ) {\n\n')
    file.write('\t\tvar uv = [];\n')
    file.write('\t\tuv.push( new THREE.UV( u1, v1 ) );\n')
    file.write('\t\tuv.push( new THREE.UV( u2, v2 ) );\n')
    file.write('\t\tuv.push( new THREE.UV( u3, v3 ) );\n')
    file.write('\t\tif ( u4 && v4 ) uv.push( new THREE.UV( u4, v4 ) );\n')
    file.write('\t\tscope.uvs.push( uv );\n')
    file.write('\t}\n\n')
    file.write('}\n\n')
    file.write('%s.prototype = new THREE.Geometry();\n' % classname)
    file.write('%s.prototype.constructor = %s;' % (classname, classname))
    file.close()

end = Blender.sys.time()

def main():
	Blender.Window.FileSelector(write, 'three.js Export', Blender.sys.makename(ext='.js'))


if __name__=='__main__':
	main()
