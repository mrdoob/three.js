#!BPY
'''
Nothing fancy
Just wrapping the Existing OBJ exporter in Blender 2.49 to do the obj export and conversion to three.js in one go
'''
"""
Name: 'three.js(slim) (.js)...'
Blender: 249
Group: 'Export'
Tooltip: 'Save a three.js File'
"""

__author__ = "Campbell Barton, Jiri Hnidek, Paolo Ciccone,George Profenza,AlteredQualia"
__url__ = ['http://wiki.blender.org/index.php/Scripts/Manual/Export/wavefront_obj', 'www.blender.org', 'blenderartists.org','AlteredQualia http://alteredqualia.com','tomaterial.blogspot.com']
__version__ = "1.22"

__bpydoc__ = """\
This script is an exporter to OBJ file format.

Usage:

Select the objects you wish to export and run this script from "File->Export" menu.
Selecting the default options from the popup box will be good in most cases.
All objects that can be represented as a mesh (mesh, curve, metaball, surface, text3d)
will be exported as mesh data.
"""


# ***** BEGIN GPL LICENSE BLOCK *****
#
# Script copyright (C) Campbell J Barton 2007-2009
# - V1.22- bspline import/export added (funded by PolyDimensions GmbH)
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
# --------------------------------------------------------------------------


import Blender
from Blender import Mesh, Scene, Window, sys, Image, Draw
import BPyMesh
import BPyObject
import BPySys
import BPyMessages
import re,os,subprocess

# Returns a tuple - path,extension.
# 'hello.obj' >  ('hello', '.obj')
def splitExt(path):
	dotidx = path.rfind('.')
	if dotidx == -1:
		return path, ''
	else:
		return path[:dotidx], path[dotidx:] 

def fixName(name):
	if name == None:
		return 'None'
	else:
		return name.replace(' ', '_')

# A Dict of Materials
# (material.name, image.name):matname_imagename # matname_imagename has gaps removed.
MTL_DICT = {} 

def write_mtl(filename):
	
	world = Blender.World.GetCurrent()
	if world:
		worldAmb = world.getAmb()
	else:
		worldAmb = (0,0,0) # Default value
	
	file = open(filename, "w")
	file.write('# Blender3D MTL File: %s\n' % Blender.Get('filename').split('\\')[-1].split('/')[-1])
	file.write('# Material Count: %i\n' % len(MTL_DICT))
	# Write material/image combinations we have used.
	for key, (mtl_mat_name, mat, img) in MTL_DICT.iteritems():
		
		# Get the Blender data for the material and the image.
		# Having an image named None will make a bug, dont do it :)
		
		file.write('newmtl %s\n' % mtl_mat_name) # Define a new material: matname_imgname
		
		if mat:
			file.write('Ns %.6f\n' % ((mat.getHardness()-1) * 1.9607843137254901) ) # Hardness, convert blenders 1-511 to MTL's 
			file.write('Ka %.6f %.6f %.6f\n' %  tuple([c*mat.amb for c in worldAmb])  ) # Ambient, uses mirror colour,
			file.write('Kd %.6f %.6f %.6f\n' % tuple([c*mat.ref for c in mat.rgbCol]) ) # Diffuse
			file.write('Ks %.6f %.6f %.6f\n' % tuple([c*mat.spec for c in mat.specCol]) ) # Specular
			file.write('Ni %.6f\n' % mat.IOR) # Refraction index
			file.write('d %.6f\n' % mat.alpha) # Alpha (obj uses 'd' for dissolve)
			
			# 0 to disable lighting, 1 for ambient & diffuse only (specular color set to black), 2 for full lighting.
			if mat.getMode() & Blender.Material.Modes['SHADELESS']:
				file.write('illum 0\n') # ignore lighting
			elif mat.getSpec() == 0:
				file.write('illum 1\n') # no specular.
			else:
				file.write('illum 2\n') # light normaly	
		
		else:
			#write a dummy material here?
			file.write('Ns 0\n')
			file.write('Ka %.6f %.6f %.6f\n' %  tuple([c for c in worldAmb])  ) # Ambient, uses mirror colour,
			file.write('Kd 0.8 0.8 0.8\n')
			file.write('Ks 0.8 0.8 0.8\n')
			file.write('d 1\n') # No alpha
			file.write('illum 2\n') # light normaly
		
		# Write images!
		if img:  # We have an image on the face!
			file.write('map_Kd %s\n' % img.filename.split('\\')[-1].split('/')[-1]) # Diffuse mapping image			
		
		elif mat: # No face image. if we havea material search for MTex image.
			for mtex in mat.getTextures():
				if mtex and mtex.tex.type == Blender.Texture.Types.IMAGE:
					try:
						filename = mtex.tex.image.filename.split('\\')[-1].split('/')[-1]
						file.write('map_Kd %s\n' % filename) # Diffuse mapping image
						break
					except:
						# Texture has no image though its an image type, best ignore.
						pass
		
		file.write('\n\n')
	
	file.close()

def copy_file(source, dest):
	file = open(source, 'rb')
	data = file.read()
	file.close()
	
	file = open(dest, 'wb')
	file.write(data)
	file.close()


def copy_images(dest_dir):
	if dest_dir[-1] != sys.sep:
		dest_dir += sys.sep
	
	# Get unique image names
	uniqueImages = {}
	for matname, mat, image in MTL_DICT.itervalues(): # Only use image name
		# Get Texface images
		if image:
			uniqueImages[image] = image # Should use sets here. wait until Python 2.4 is default.
		
		# Get MTex images
		if mat:
			for mtex in mat.getTextures():
				if mtex and mtex.tex.type == Blender.Texture.Types.IMAGE:
					image_tex = mtex.tex.image
					if image_tex:
						try:
							uniqueImages[image_tex] = image_tex
						except:
							pass
	
	# Now copy images
	copyCount = 0
	
	for bImage in uniqueImages.itervalues():
		image_path = sys.expandpath(bImage.filename)
		if sys.exists(image_path):
			# Make a name for the target path.
			dest_image_path = dest_dir + image_path.split('\\')[-1].split('/')[-1]
			if not sys.exists(dest_image_path): # Image isnt alredy there
				print '\tCopying "%s" > "%s"' % (image_path, dest_image_path)
				copy_file(image_path, dest_image_path)
				copyCount+=1
	print '\tCopied %d images' % copyCount


def test_nurbs_compat(ob):
	if ob.type != 'Curve':
		return False
	
	for nu in ob.data:
		if (not nu.knotsV) and nu.type != 1: # not a surface and not bezier
			return True
	
	return False

def write_nurb(file, ob, ob_mat):
	tot_verts = 0
	cu = ob.data
	
	# use negative indices
	Vector = Blender.Mathutils.Vector
	for nu in cu:
		
		if nu.type==0:		DEG_ORDER_U = 1
		else:				DEG_ORDER_U = nu.orderU-1  # Tested to be correct
		
		if nu.type==1:
			print "\tWarning, bezier curve:", ob.name, "only poly and nurbs curves supported"
			continue
		
		if nu.knotsV:
			print "\tWarning, surface:", ob.name, "only poly and nurbs curves supported"
			continue
		
		if len(nu) <= DEG_ORDER_U:
			print "\tWarning, orderU is lower then vert count, skipping:", ob.name
			continue
		
		pt_num = 0
		do_closed = (nu.flagU & 1)
		do_endpoints = (do_closed==0) and (nu.flagU & 2)
		
		for pt in nu:
			pt = Vector(pt[0], pt[1], pt[2]) * ob_mat
			file.write('v %.6f %.6f %.6f\n' % (pt[0], pt[1], pt[2]))
			pt_num += 1
		tot_verts += pt_num
		
		file.write('g %s\n' % (fixName(ob.name))) # fixName(ob.getData(1)) could use the data name too
		file.write('cstype bspline\n') # not ideal, hard coded
		file.write('deg %d\n' % DEG_ORDER_U) # not used for curves but most files have it still
		
		curve_ls = [-(i+1) for i in xrange(pt_num)]
		
		# 'curv' keyword
		if do_closed:
			if DEG_ORDER_U == 1:
				pt_num += 1
				curve_ls.append(-1)
			else:
				pt_num += DEG_ORDER_U
				curve_ls = curve_ls + curve_ls[0:DEG_ORDER_U]
		
		file.write('curv 0.0 1.0 %s\n' % (' '.join( [str(i) for i in curve_ls] ))) # Blender has no U and V values for the curve
		
		# 'parm' keyword
		tot_parm = (DEG_ORDER_U + 1) + pt_num
		tot_parm_div = float(tot_parm-1)
		parm_ls = [(i/tot_parm_div) for i in xrange(tot_parm)]
		
		if do_endpoints: # end points, force param
			for i in xrange(DEG_ORDER_U+1):
				parm_ls[i] = 0.0
				parm_ls[-(1+i)] = 1.0
		
		file.write('parm u %s\n' % ' '.join( [str(i) for i in parm_ls] ))

		file.write('end\n')
	
	return tot_verts

def write(filename, objects,\
EXPORT_TRI=False,  EXPORT_EDGES=False,  EXPORT_NORMALS=False,  EXPORT_NORMALS_HQ=False,\
EXPORT_UV=True,  EXPORT_MTL=True,  EXPORT_COPY_IMAGES=False,\
EXPORT_APPLY_MODIFIERS=True, EXPORT_ROTX90=True, EXPORT_BLEN_OBS=True,\
EXPORT_GROUP_BY_OB=False,  EXPORT_GROUP_BY_MAT=False, EXPORT_KEEP_VERT_ORDER=False,\
EXPORT_POLYGROUPS=False, EXPORT_CURVE_AS_NURBS=True):
	'''
	Basic write function. The context and options must be alredy set
	This can be accessed externaly
	eg.
	write( 'c:\\test\\foobar.obj', Blender.Object.GetSelected() ) # Using default options.
	'''
	
	def veckey3d(v):
		return round(v.x, 6), round(v.y, 6), round(v.z, 6)
		
	def veckey2d(v):
		return round(v.x, 6), round(v.y, 6)
	
	def findVertexGroupName(face, vWeightMap):
		"""
		Searches the vertexDict to see what groups is assigned to a given face.
		We use a frequency system in order to sort out the name because a given vetex can
		belong to two or more groups at the same time. To find the right name for the face
		we list all the possible vertex group names with their frequency and then sort by
		frequency in descend order. The top element is the one shared by the highest number
		of vertices is the face's group 
		"""
		weightDict = {}
		for vert in face:
			vWeights = vWeightMap[vert.index]
			for vGroupName, weight in vWeights:
				weightDict[vGroupName] = weightDict.get(vGroupName, 0) + weight
		
		if weightDict:
			alist = [(weight,vGroupName) for vGroupName, weight in weightDict.iteritems()] # sort least to greatest amount of weight
			alist.sort()
			return(alist[-1][1]) # highest value last
		else:
			return '(null)'


	print 'OBJ Export path: "%s"' % filename
	temp_mesh_name = '~tmp-mesh'

	time1 = sys.time()
	scn = Scene.GetCurrent()

	file = open(filename, "w")
	
	# Write Header
	file.write('# Blender3D v%s OBJ File: %s\n' % (Blender.Get('version'), Blender.Get('filename').split('/')[-1].split('\\')[-1] ))
	file.write('# www.blender3d.org\n')

	# Tell the obj file what material file to use.
	if EXPORT_MTL:
		mtlfilename = '%s.mtl' % '.'.join(filename.split('.')[:-1])
		file.write('mtllib %s\n' % ( mtlfilename.split('\\')[-1].split('/')[-1] ))
	
	# Get the container mesh. - used for applying modifiers and non mesh objects.
	containerMesh = meshName = tempMesh = None
	for meshName in Blender.NMesh.GetNames():
		if meshName.startswith(temp_mesh_name):
			tempMesh = Mesh.Get(meshName)
			if not tempMesh.users:
				containerMesh = tempMesh
	if not containerMesh:
		containerMesh = Mesh.New(temp_mesh_name)
	
	if EXPORT_ROTX90:
		mat_xrot90= Blender.Mathutils.RotationMatrix(-90, 4, 'x')
		
	del meshName
	del tempMesh
	
	# Initialize totals, these are updated each object
	totverts = totuvco = totno = 1
	
	face_vert_index = 1
	
	globalNormals = {}
	
	# Get all meshes
	for ob_main in objects:
		for ob, ob_mat in BPyObject.getDerivedObjects(ob_main):
			
			# Nurbs curve support
			if EXPORT_CURVE_AS_NURBS and test_nurbs_compat(ob):
				if EXPORT_ROTX90:
					ob_mat = ob_mat * mat_xrot90
				
				totverts += write_nurb(file, ob, ob_mat)
				
				continue
			# end nurbs
			
			# Will work for non meshes now! :)
			# getMeshFromObject(ob, container_mesh=None, apply_modifiers=True, vgroups=True, scn=None)
			me= BPyMesh.getMeshFromObject(ob, containerMesh, EXPORT_APPLY_MODIFIERS, EXPORT_POLYGROUPS, scn)
			if not me:
				continue
			
			if EXPORT_UV:
				faceuv= me.faceUV
			else:
				faceuv = False
			
			# We have a valid mesh
			if EXPORT_TRI and me.faces:
				# Add a dummy object to it.
				has_quads = False
				for f in me.faces:
					if len(f) == 4:
						has_quads = True
						break
				
				if has_quads:
					oldmode = Mesh.Mode()
					Mesh.Mode(Mesh.SelectModes['FACE'])
					
					me.sel = True
					tempob = scn.objects.new(me)
					me.quadToTriangle(0) # more=0 shortest length
					oldmode = Mesh.Mode(oldmode)
					scn.objects.unlink(tempob)
					
					Mesh.Mode(oldmode)
			
			# Make our own list so it can be sorted to reduce context switching
			faces = [ f for f in me.faces ]
			
			if EXPORT_EDGES:
				edges = me.edges
			else:
				edges = []
			
			if not (len(faces)+len(edges)+len(me.verts)): # Make sure there is somthing to write
				continue # dont bother with this mesh.
			
			if EXPORT_ROTX90:
				me.transform(ob_mat*mat_xrot90)
			else:
				me.transform(ob_mat)
			
			# High Quality Normals
			if EXPORT_NORMALS and faces:
				if EXPORT_NORMALS_HQ:
					BPyMesh.meshCalcNormals(me)
				else:
					# transforming normals is incorrect
					# when the matrix is scaled,
					# better to recalculate them
					me.calcNormals()
			
			# # Crash Blender
			#materials = me.getMaterials(1) # 1 == will return None in the list.
			materials = me.materials
			
			materialNames = []
			materialItems = materials[:]
			if materials:
				for mat in materials:
					if mat: # !=None
						materialNames.append(mat.name)
					else:
						materialNames.append(None)
				# Cant use LC because some materials are None.
				# materialNames = map(lambda mat: mat.name, materials) # Bug Blender, dosent account for null materials, still broken.	
			
			# Possible there null materials, will mess up indicies
			# but at least it will export, wait until Blender gets fixed.
			materialNames.extend((16-len(materialNames)) * [None])
			materialItems.extend((16-len(materialItems)) * [None])
			
			# Sort by Material, then images
			# so we dont over context switch in the obj file.
			if EXPORT_KEEP_VERT_ORDER:
				pass
			elif faceuv:
				try:	faces.sort(key = lambda a: (a.mat, a.image, a.smooth))
				except:	faces.sort(lambda a,b: cmp((a.mat, a.image, a.smooth), (b.mat, b.image, b.smooth)))
			elif len(materials) > 1:
				try:	faces.sort(key = lambda a: (a.mat, a.smooth))
				except:	faces.sort(lambda a,b: cmp((a.mat, a.smooth), (b.mat, b.smooth)))
			else:
				# no materials
				try:	faces.sort(key = lambda a: a.smooth)
				except:	faces.sort(lambda a,b: cmp(a.smooth, b.smooth))
			
			# Set the default mat to no material and no image.
			contextMat = (0, 0) # Can never be this, so we will label a new material teh first chance we get.
			contextSmooth = None # Will either be true or false,  set bad to force initialization switch.
			
			if EXPORT_BLEN_OBS or EXPORT_GROUP_BY_OB:
				name1 = ob.name
				name2 = ob.getData(1)
				if name1 == name2:
					obnamestring = fixName(name1)
				else:
					obnamestring = '%s_%s' % (fixName(name1), fixName(name2))
				
				if EXPORT_BLEN_OBS:
					file.write('o %s\n' % obnamestring) # Write Object name
				else: # if EXPORT_GROUP_BY_OB:
					file.write('g %s\n' % obnamestring)
			
			
			# Vert
			for v in me.verts:
				file.write('v %.6f %.6f %.6f\n' % tuple(v.co))
			
			# UV
			if faceuv:
				uv_face_mapping = [[0,0,0,0] for f in faces] # a bit of a waste for tri's :/
				
				uv_dict = {} # could use a set() here
				for f_index, f in enumerate(faces):
					
					for uv_index, uv in enumerate(f.uv):
						uvkey = veckey2d(uv)
						try:
							uv_face_mapping[f_index][uv_index] = uv_dict[uvkey]
						except:
							uv_face_mapping[f_index][uv_index] = uv_dict[uvkey] = len(uv_dict)
							file.write('vt %.6f %.6f\n' % tuple(uv))
				
				uv_unique_count = len(uv_dict)
				del uv, uvkey, uv_dict, f_index, uv_index
				# Only need uv_unique_count and uv_face_mapping
			
			# NORMAL, Smooth/Non smoothed.
			if EXPORT_NORMALS:
				for f in faces:
					if f.smooth:
						for v in f:
							noKey = veckey3d(v.no)
							if not globalNormals.has_key( noKey ):
								globalNormals[noKey] = totno
								totno +=1
								file.write('vn %.6f %.6f %.6f\n' % noKey)
					else:
						# Hard, 1 normal from the face.
						noKey = veckey3d(f.no)
						if not globalNormals.has_key( noKey ):
							globalNormals[noKey] = totno
							totno +=1
							file.write('vn %.6f %.6f %.6f\n' % noKey)
			
			if not faceuv:
				f_image = None
			
			if EXPORT_POLYGROUPS:
				# Retrieve the list of vertex groups
				vertGroupNames = me.getVertGroupNames()

				currentVGroup = ''
				# Create a dictionary keyed by face id and listing, for each vertex, the vertex groups it belongs to
				vgroupsMap = [[] for _i in xrange(len(me.verts))]
				for vertexGroupName in vertGroupNames:
					for vIdx, vWeight in me.getVertsFromGroup(vertexGroupName, 1):
						vgroupsMap[vIdx].append((vertexGroupName, vWeight))

			for f_index, f in enumerate(faces):
				f_v= f.v
				f_smooth= f.smooth
				f_mat = min(f.mat, len(materialNames)-1)
				if faceuv:
					f_image = f.image
					f_uv= f.uv
				
				# MAKE KEY
				if faceuv and f_image: # Object is always true.
					key = materialNames[f_mat],  f_image.name
				else:
					key = materialNames[f_mat],  None # No image, use None instead.
				
				# Write the vertex group
				if EXPORT_POLYGROUPS:
					if vertGroupNames:
						# find what vertext group the face belongs to
						theVGroup = findVertexGroupName(f,vgroupsMap)
						if	theVGroup != currentVGroup:
							currentVGroup = theVGroup
							file.write('g %s\n' % theVGroup)

				# CHECK FOR CONTEXT SWITCH
				if key == contextMat:
					pass # Context alredy switched, dont do anything
				else:
					if key[0] == None and key[1] == None:
						# Write a null material, since we know the context has changed.
						if EXPORT_GROUP_BY_MAT:
							file.write('g %s_%s\n' % (fixName(ob.name), fixName(ob.getData(1))) ) # can be mat_image or (null)
						file.write('usemtl (null)\n') # mat, image
						
					else:
						mat_data= MTL_DICT.get(key)
						if not mat_data:
							# First add to global dict so we can export to mtl
							# Then write mtl
							
							# Make a new names from the mat and image name,
							# converting any spaces to underscores with fixName.
							
							# If none image dont bother adding it to the name
							if key[1] == None:
								mat_data = MTL_DICT[key] = ('%s'%fixName(key[0])), materialItems[f_mat], f_image
							else:
								mat_data = MTL_DICT[key] = ('%s_%s' % (fixName(key[0]), fixName(key[1]))), materialItems[f_mat], f_image
						
						if EXPORT_GROUP_BY_MAT:
							file.write('g %s_%s_%s\n' % (fixName(ob.name), fixName(ob.getData(1)), mat_data[0]) ) # can be mat_image or (null)

						file.write('usemtl %s\n' % mat_data[0]) # can be mat_image or (null)
					
				contextMat = key
				if f_smooth != contextSmooth:
					if f_smooth: # on now off
						file.write('s 1\n')
						contextSmooth = f_smooth
					else: # was off now on
						file.write('s off\n')
						contextSmooth = f_smooth
				
				file.write('f')
				if faceuv:
					if EXPORT_NORMALS:
						if f_smooth: # Smoothed, use vertex normals
							for vi, v in enumerate(f_v):
								file.write( ' %d/%d/%d' % (\
								  v.index+totverts,\
								  totuvco + uv_face_mapping[f_index][vi],\
								  globalNormals[ veckey3d(v.no) ])) # vert, uv, normal
							
						else: # No smoothing, face normals
							no = globalNormals[ veckey3d(f.no) ]
							for vi, v in enumerate(f_v):
								file.write( ' %d/%d/%d' % (\
								  v.index+totverts,\
								  totuvco + uv_face_mapping[f_index][vi],\
								  no)) # vert, uv, normal
					
					else: # No Normals
						for vi, v in enumerate(f_v):
							file.write( ' %d/%d' % (\
							  v.index+totverts,\
							  totuvco + uv_face_mapping[f_index][vi])) # vert, uv
					
					face_vert_index += len(f_v)
				
				else: # No UV's
					if EXPORT_NORMALS:
						if f_smooth: # Smoothed, use vertex normals
							for v in f_v:
								file.write( ' %d//%d' % (\
								  v.index+totverts,\
								  globalNormals[ veckey3d(v.no) ]))
						else: # No smoothing, face normals
							no = globalNormals[ veckey3d(f.no) ]
							for v in f_v:
								file.write( ' %d//%d' % (\
								  v.index+totverts,\
								  no))
					else: # No Normals
						for v in f_v:
							file.write( ' %d' % (\
							  v.index+totverts))
						
				file.write('\n')
			
			# Write edges.
			if EXPORT_EDGES:
				LOOSE= Mesh.EdgeFlags.LOOSE
				for ed in edges:
					if ed.flag & LOOSE:
						file.write('f %d %d\n' % (ed.v1.index+totverts, ed.v2.index+totverts))
				
			# Make the indicies global rather then per mesh
			totverts += len(me.verts)
			if faceuv:
				totuvco += uv_unique_count
			me.verts= None
	file.close()
	
	
	# Now we have all our materials, save them
	if EXPORT_MTL:
		write_mtl(mtlfilename)
	if EXPORT_COPY_IMAGES:
		dest_dir = filename
		# Remove chars until we are just the path.
		while dest_dir and dest_dir[-1] not in '\\/':
			dest_dir = dest_dir[:-1]
		if dest_dir:
			copy_images(dest_dir)
		else:
			print '\tError: "%s" could not be used as a base for an image path.' % filename
	
	print "Export time: %.2f" % (sys.time() - time1)
	convert = ['python', Blender.Get('scriptsdir')+'/convert_obj_threejs_slim.py', '-i', filename, '-o', filename.replace('.obj','.js')]
	try:
	    p = subprocess.Popen(convert, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
	    while p.poll() == None:
	        pass
	except subprocess.CalledProcessError:
	    print 'Error doing conversion!'
	print 'done'
	os.remove(filename)
	os.remove(filename.replace('.obj','.mtl'))
    

def write_ui(filename):
	
	if not filename.lower().endswith('.obj'):
		filename += '.obj'
	
	if not BPyMessages.Warning_SaveOver(filename):
		return
	
	global EXPORT_APPLY_MODIFIERS, EXPORT_ROTX90, EXPORT_TRI, EXPORT_EDGES,\
		EXPORT_NORMALS, EXPORT_NORMALS_HQ, EXPORT_UV,\
		EXPORT_MTL, EXPORT_SEL_ONLY, EXPORT_ALL_SCENES,\
		EXPORT_ANIMATION, EXPORT_COPY_IMAGES, EXPORT_BLEN_OBS,\
		EXPORT_GROUP_BY_OB, EXPORT_GROUP_BY_MAT, EXPORT_KEEP_VERT_ORDER,\
		EXPORT_POLYGROUPS, EXPORT_CURVE_AS_NURBS
	
	EXPORT_APPLY_MODIFIERS = Draw.Create(0)
	EXPORT_ROTX90 = Draw.Create(1)
	EXPORT_TRI = Draw.Create(0)
	EXPORT_EDGES = Draw.Create(1)
	EXPORT_NORMALS = Draw.Create(0)
	EXPORT_NORMALS_HQ = Draw.Create(0)
	EXPORT_UV = Draw.Create(1)
	EXPORT_MTL = Draw.Create(1)
	EXPORT_SEL_ONLY = Draw.Create(1)
	EXPORT_ALL_SCENES = Draw.Create(0)
	EXPORT_ANIMATION = Draw.Create(0)
	EXPORT_COPY_IMAGES = Draw.Create(0)
	EXPORT_BLEN_OBS = Draw.Create(0)
	EXPORT_GROUP_BY_OB = Draw.Create(0)
	EXPORT_GROUP_BY_MAT = Draw.Create(0)
	EXPORT_KEEP_VERT_ORDER = Draw.Create(1)
	EXPORT_POLYGROUPS = Draw.Create(0)
	EXPORT_CURVE_AS_NURBS = Draw.Create(1)
	
	
	# Old UI
	'''
	# removed too many options are bad!
	
	# Get USER Options
	pup_block = [\
	('Context...'),\
	('Selection Only', EXPORT_SEL_ONLY, 'Only export objects in visible selection. Else export whole scene.'),\
	('All Scenes', EXPORT_ALL_SCENES, 'Each scene as a separate OBJ file.'),\
	('Animation', EXPORT_ANIMATION, 'Each frame as a numbered OBJ file.'),\
	('Object Prefs...'),\
	('Apply Modifiers', EXPORT_APPLY_MODIFIERS, 'Use transformed mesh data from each object. May break vert order for morph targets.'),\
	('Rotate X90', EXPORT_ROTX90 , 'Rotate on export so Blenders UP is translated into OBJs UP'),\
	('Keep Vert Order', EXPORT_KEEP_VERT_ORDER, 'Keep vert and face order, disables some other options.'),\
	('Extra Data...'),\
	('Edges', EXPORT_EDGES, 'Edges not connected to faces.'),\
	('Normals', EXPORT_NORMALS, 'Export vertex normal data (Ignored on import).'),\
	('High Quality Normals', EXPORT_NORMALS_HQ, 'Calculate high quality normals for rendering.'),\
	('UVs', EXPORT_UV, 'Export texface UV coords.'),\
	('Materials', EXPORT_MTL, 'Write a separate MTL file with the OBJ.'),\
	('Copy Images', EXPORT_COPY_IMAGES, 'Copy image files to the export directory, never overwrite.'),\
	('Triangulate', EXPORT_TRI, 'Triangulate quads.'),\
	('Grouping...'),\
	('Objects', EXPORT_BLEN_OBS, 'Export blender objects as "OBJ objects".'),\
	('Object Groups', EXPORT_GROUP_BY_OB, 'Export blender objects as "OBJ Groups".'),\
	('Material Groups', EXPORT_GROUP_BY_MAT, 'Group by materials.'),\
	]
	
	if not Draw.PupBlock('Export...', pup_block):
		return
	'''
	
	# BEGIN ALTERNATIVE UI *******************
	if True: 
		
		EVENT_NONE = 0
		EVENT_EXIT = 1
		EVENT_REDRAW = 2
		EVENT_EXPORT = 3
		
		GLOBALS = {}
		GLOBALS['EVENT'] = EVENT_REDRAW
		#GLOBALS['MOUSE'] = Window.GetMouseCoords()
		GLOBALS['MOUSE'] = [i/2 for i in Window.GetScreenSize()]
		
		def obj_ui_set_event(e,v):
			GLOBALS['EVENT'] = e
		
		def do_split(e,v):
			global EXPORT_BLEN_OBS, EXPORT_GROUP_BY_OB, EXPORT_GROUP_BY_MAT, EXPORT_APPLY_MODIFIERS, KEEP_VERT_ORDER, EXPORT_POLYGROUPS
			if EXPORT_BLEN_OBS.val or EXPORT_GROUP_BY_OB.val or EXPORT_GROUP_BY_MAT.val or EXPORT_APPLY_MODIFIERS.val:
				EXPORT_KEEP_VERT_ORDER.val = 0
			else:
				EXPORT_KEEP_VERT_ORDER.val = 1
			
		def do_vertorder(e,v):
			global EXPORT_BLEN_OBS, EXPORT_GROUP_BY_OB, EXPORT_GROUP_BY_MAT, EXPORT_APPLY_MODIFIERS, KEEP_VERT_ORDER
			if EXPORT_KEEP_VERT_ORDER.val:
				EXPORT_BLEN_OBS.val = EXPORT_GROUP_BY_OB.val = EXPORT_GROUP_BY_MAT.val = EXPORT_APPLY_MODIFIERS.val = 0
			else:
				if not (EXPORT_BLEN_OBS.val or EXPORT_GROUP_BY_OB.val or EXPORT_GROUP_BY_MAT.val or EXPORT_APPLY_MODIFIERS.val):
					EXPORT_KEEP_VERT_ORDER.val = 1
			
			
		def do_help(e,v):
			url = __url__[0]
			print 'Trying to open web browser with documentation at this address...'
			print '\t' + url
			
			try:
				import webbrowser
				webbrowser.open(url)
			except:
				print '...could not open a browser window.'
		
		def obj_ui():
			ui_x, ui_y = GLOBALS['MOUSE']
			
			# Center based on overall pup size
			ui_x -= 165
			ui_y -= 140
			
			global EXPORT_APPLY_MODIFIERS, EXPORT_ROTX90, EXPORT_TRI, EXPORT_EDGES,\
				EXPORT_NORMALS, EXPORT_NORMALS_HQ, EXPORT_UV,\
				EXPORT_MTL, EXPORT_SEL_ONLY, EXPORT_ALL_SCENES,\
				EXPORT_ANIMATION, EXPORT_COPY_IMAGES, EXPORT_BLEN_OBS,\
				EXPORT_GROUP_BY_OB, EXPORT_GROUP_BY_MAT, EXPORT_KEEP_VERT_ORDER,\
				EXPORT_POLYGROUPS, EXPORT_CURVE_AS_NURBS

			Draw.Label('Context...', ui_x+9, ui_y+239, 220, 20)
			Draw.BeginAlign()
			EXPORT_SEL_ONLY = Draw.Toggle('Selection Only', EVENT_NONE, ui_x+9, ui_y+219, 110, 20, EXPORT_SEL_ONLY.val, 'Only export objects in visible selection. Else export whole scene.')
			EXPORT_ALL_SCENES = Draw.Toggle('All Scenes', EVENT_NONE, ui_x+119, ui_y+219, 110, 20, EXPORT_ALL_SCENES.val, 'Each scene as a separate OBJ file.')
			EXPORT_ANIMATION = Draw.Toggle('Animation', EVENT_NONE, ui_x+229, ui_y+219, 110, 20, EXPORT_ANIMATION.val, 'Each frame as a numbered OBJ file.')
			Draw.EndAlign()
			
			
			Draw.Label('Output Options...', ui_x+9, ui_y+189, 220, 20)
			Draw.BeginAlign()
			EXPORT_APPLY_MODIFIERS = Draw.Toggle('Apply Modifiers', EVENT_REDRAW, ui_x+9, ui_y+170, 110, 20, EXPORT_APPLY_MODIFIERS.val, 'Use transformed mesh data from each object. May break vert order for morph targets.', do_split)
			EXPORT_ROTX90 = Draw.Toggle('Rotate X90', EVENT_NONE, ui_x+119, ui_y+170, 110, 20, EXPORT_ROTX90.val, 'Rotate on export so Blenders UP is translated into OBJs UP')
			EXPORT_COPY_IMAGES = Draw.Toggle('Copy Images', EVENT_NONE, ui_x+229, ui_y+170, 110, 20, EXPORT_COPY_IMAGES.val, 'Copy image files to the export directory, never overwrite.')
			Draw.EndAlign()
			
			
			Draw.Label('Export...', ui_x+9, ui_y+139, 220, 20)
			Draw.BeginAlign()
			EXPORT_EDGES = Draw.Toggle('Edges', EVENT_NONE, ui_x+9, ui_y+120, 50, 20, EXPORT_EDGES.val, 'Edges not connected to faces.')
			EXPORT_TRI = Draw.Toggle('Triangulate', EVENT_NONE, ui_x+59, ui_y+120, 70, 20, EXPORT_TRI.val, 'Triangulate quads.')
			Draw.EndAlign()
			Draw.BeginAlign()
			EXPORT_MTL = Draw.Toggle('Materials', EVENT_NONE, ui_x+139, ui_y+120, 70, 20, EXPORT_MTL.val, 'Write a separate MTL file with the OBJ.')
			EXPORT_UV = Draw.Toggle('UVs', EVENT_NONE, ui_x+209, ui_y+120, 31, 20, EXPORT_UV.val, 'Export texface UV coords.')
			Draw.EndAlign()
			Draw.BeginAlign()
			EXPORT_NORMALS = Draw.Toggle('Normals', EVENT_NONE, ui_x+250, ui_y+120, 59, 20, EXPORT_NORMALS.val, 'Export vertex normal data (Ignored on import).')
			EXPORT_NORMALS_HQ = Draw.Toggle('HQ', EVENT_NONE, ui_x+309, ui_y+120, 31, 20, EXPORT_NORMALS_HQ.val, 'Calculate high quality normals for rendering.')
			Draw.EndAlign()
			EXPORT_POLYGROUPS = Draw.Toggle('Polygroups', EVENT_REDRAW, ui_x+9, ui_y+95, 120, 20, EXPORT_POLYGROUPS.val, 'Export vertex groups as OBJ groups (one group per face approximation).')
			
			EXPORT_CURVE_AS_NURBS = Draw.Toggle('Nurbs', EVENT_NONE, ui_x+139, ui_y+95, 100, 20, EXPORT_CURVE_AS_NURBS.val, 'Export 3D nurbs curves and polylines as OBJ curves, (bezier not supported).')
			
			
			Draw.Label('Blender Objects as OBJ:', ui_x+9, ui_y+59, 220, 20)
			Draw.BeginAlign()
			EXPORT_BLEN_OBS = Draw.Toggle('Objects', EVENT_REDRAW, ui_x+9, ui_y+39, 60, 20, EXPORT_BLEN_OBS.val, 'Export blender objects as "OBJ objects".', do_split)
			EXPORT_GROUP_BY_OB = Draw.Toggle('Groups', EVENT_REDRAW, ui_x+69, ui_y+39, 60, 20, EXPORT_GROUP_BY_OB.val, 'Export blender objects as "OBJ Groups".', do_split)
			EXPORT_GROUP_BY_MAT = Draw.Toggle('Material Groups', EVENT_REDRAW, ui_x+129, ui_y+39, 100, 20, EXPORT_GROUP_BY_MAT.val, 'Group by materials.', do_split)
			Draw.EndAlign()
			
			EXPORT_KEEP_VERT_ORDER = Draw.Toggle('Keep Vert Order', EVENT_REDRAW, ui_x+239, ui_y+39, 100, 20, EXPORT_KEEP_VERT_ORDER.val, 'Keep vert and face order, disables some other options. Use for morph targets.', do_vertorder)
			
			Draw.BeginAlign()
			Draw.PushButton('Online Help', EVENT_REDRAW, ui_x+9, ui_y+9, 110, 20, 'Load the wiki page for this script', do_help)
			Draw.PushButton('Cancel', EVENT_EXIT, ui_x+119, ui_y+9, 110, 20, '', obj_ui_set_event)
			Draw.PushButton('Export', EVENT_EXPORT, ui_x+229, ui_y+9, 110, 20, 'Export with these settings', obj_ui_set_event)
			Draw.EndAlign()

		
		# hack so the toggle buttons redraw. this is not nice at all
		while GLOBALS['EVENT'] not in (EVENT_EXIT, EVENT_EXPORT):
			Draw.UIBlock(obj_ui, 0)
		
		if GLOBALS['EVENT'] != EVENT_EXPORT:
			return
		
	# END ALTERNATIVE UI *********************
	
	
	if EXPORT_KEEP_VERT_ORDER.val:
		EXPORT_BLEN_OBS.val = False
		EXPORT_GROUP_BY_OB.val = False
		EXPORT_GROUP_BY_MAT.val = False
		EXPORT_APPLY_MODIFIERS.val = False
	
	Window.EditMode(0)
	Window.WaitCursor(1)
	
	EXPORT_APPLY_MODIFIERS = EXPORT_APPLY_MODIFIERS.val
	EXPORT_ROTX90 = EXPORT_ROTX90.val
	EXPORT_TRI = EXPORT_TRI.val
	EXPORT_EDGES = EXPORT_EDGES.val
	EXPORT_NORMALS = EXPORT_NORMALS.val
	EXPORT_NORMALS_HQ = EXPORT_NORMALS_HQ.val
	EXPORT_UV = EXPORT_UV.val
	EXPORT_MTL = EXPORT_MTL.val
	EXPORT_SEL_ONLY = EXPORT_SEL_ONLY.val
	EXPORT_ALL_SCENES = EXPORT_ALL_SCENES.val
	EXPORT_ANIMATION = EXPORT_ANIMATION.val
	EXPORT_COPY_IMAGES = EXPORT_COPY_IMAGES.val
	EXPORT_BLEN_OBS = EXPORT_BLEN_OBS.val
	EXPORT_GROUP_BY_OB = EXPORT_GROUP_BY_OB.val
	EXPORT_GROUP_BY_MAT = EXPORT_GROUP_BY_MAT.val
	EXPORT_KEEP_VERT_ORDER = EXPORT_KEEP_VERT_ORDER.val
	EXPORT_POLYGROUPS = EXPORT_POLYGROUPS.val
	EXPORT_CURVE_AS_NURBS = EXPORT_CURVE_AS_NURBS.val
	
	
	base_name, ext = splitExt(filename)
	context_name = [base_name, '', '', ext] # basename, scene_name, framenumber, extension
	
	# Use the options to export the data using write()
	# def write(filename, objects, EXPORT_EDGES=False, EXPORT_NORMALS=False, EXPORT_MTL=True, EXPORT_COPY_IMAGES=False, EXPORT_APPLY_MODIFIERS=True):
	orig_scene = Scene.GetCurrent()
	if EXPORT_ALL_SCENES:
		export_scenes = Scene.Get()
	else:
		export_scenes = [orig_scene]
	
	# Export all scenes.
	for scn in export_scenes:
		scn.makeCurrent() # If alredy current, this is not slow.
		context = scn.getRenderingContext()
		orig_frame = Blender.Get('curframe')
		
		if EXPORT_ALL_SCENES: # Add scene name into the context_name
			context_name[1] = '_%s' % BPySys.cleanName(scn.name) # WARNING, its possible that this could cause a collision. we could fix if were feeling parranoied.
		
		# Export an animation?
		if EXPORT_ANIMATION:
			scene_frames = xrange(context.startFrame(), context.endFrame()+1) # up to and including the end frame.
		else:
			scene_frames = [orig_frame] # Dont export an animation.
		
		# Loop through all frames in the scene and export.
		for frame in scene_frames:
			if EXPORT_ANIMATION: # Add frame to the filename.
				context_name[2] = '_%.6d' % frame
			
			Blender.Set('curframe', frame)
			if EXPORT_SEL_ONLY:
				export_objects = scn.objects.context
			else:	
				export_objects = scn.objects
			
			full_path= ''.join(context_name)
			
			# erm... bit of a problem here, this can overwrite files when exporting frames. not too bad.
			# EXPORT THE FILE.
			write(full_path, export_objects,\
			EXPORT_TRI, EXPORT_EDGES, EXPORT_NORMALS,\
			EXPORT_NORMALS_HQ, EXPORT_UV, EXPORT_MTL,\
			EXPORT_COPY_IMAGES, EXPORT_APPLY_MODIFIERS,\
			EXPORT_ROTX90, EXPORT_BLEN_OBS,\
			EXPORT_GROUP_BY_OB, EXPORT_GROUP_BY_MAT, EXPORT_KEEP_VERT_ORDER,\
			EXPORT_POLYGROUPS, EXPORT_CURVE_AS_NURBS)
		
		Blender.Set('curframe', orig_frame)
	
	# Restore old active scene.
	orig_scene.makeCurrent()
	Window.WaitCursor(0)


if __name__ == '__main__':
	Window.FileSelector(write_ui, 'Export thee.js (slim)', sys.makename(ext='.obj'))
