rollout ThreeJSExporter "ThreeJSExporter"
(
	-- Variables

	local ostream,
	
	threeMatrix = (matrix3 [1,0,0] [0,0,1] [0,-1,0] [0,0,0]),

	headerFormat = "\"metadata\":
{
\"sourceFile\": \"%\",
\"generatedBy\": \"3ds max ThreeJSExporter\",
\"formatVersion\": 3,
\"vertices\": %,
\"normals\": %,
\"colors\": %,
\"uvs\": %,
\"triangles\": %,
\"materials\": %
},

",

	vertexFormat = "%,%,%",

	vertexNormalFormat = "%,%,%",
	UVFormat = "%,%",

	triFormat = "%,%,%,%",
	triUVFormat = "%,%,%,%,%,%,%",
	triNFormat = "%,%,%,%,%,%,%",
	triUVNFormat = "%,%,%,%,%,%,%,%,%,%",

	footerFormat = "\n}",


	
	boneFormat = "\t\t{
\t\t\t\"parent\" : %,
\t\t\t\"name\"   : \"%\",
\t\t\t\"pos\"    : %,
\t\t\t\"scl\"    : %,
\t\t\t\"rotq\"   : [%,%,%,%]
\t\t}",

	animHeaderFormat = "\t\"animation\" : {
\t\t\"name\"      : \"Action\",
\t\t\"fps\"       : %,
\t\t\"length\" : %,
\t\t\"hierarchy\" : [\n",
	
	animBoneHeaderFormat = "\t\t\t{
\t\t\t\t\"parent\" : %,
\t\t\t\t\"keys\"    : [\n",

	keyFormat = "\t\t\t\t\t{
\t\t\t\t\t\t\"time\":%,
\t\t\t\t\t\t\"pos\" :[%,%,%],
\t\t\t\t\t\t\"rot\" :[%,%,%,%],
\t\t\t\t\t\t\"scl\" :%
\t\t\t\t\t}",

	animBoneFooterFormat = "\t\t\t\t]
\t\t\t}",

	animFooterFormat = "\n\n\t\t]
\t}\n"


	-------------------------------------------------------------------------------------
	-- User interface


	group "ThreeJSExporter  v0.8"
	(

		label msg "Exports selected meshes in Three.js ascii JSON format" align:#left
		hyperLink lab1 "Original source at GitHub" address:"https://github.com/alteredq/three.js/blob/master/utils/exporters/max/ThreeJSExporter.ms" color:(color 255 120 0) align:#left

		label dummy1 "--------------------------------------------------------" align:#left

		checkbox exportColor "Export vertex colors" checked:false enabled:true
		checkbox exportUv "Export uvs" checked:true enabled:true
		checkbox exportNormal "Export normals" checked:true enabled:true
		checkbox smoothNormal "Use vertex normals" checked:false enabled:true

		label dummy2 "--------------------------------------------------------" align:#left

		checkbox flipYZ "Flip YZ" checked:false enabled:false
		checkbox flipUV "Flip UV" checked:false enabled:false
		checkbox flipFace "Flip all faces" checked:false enabled:false
		checkbox autoflipFace "Try fixing flipped faces" checked:false enabled:false
		
		label dummy3 "--------------------------------------------------------" align:#left
		
		spinner fps "Animation speed (FPS)" range:[0,1000,25] type:#integer

		label dummy4 "--------------------------------------------------------" align:#left

		button btn_export "Export selected objects"

	)
	
	

	-------------------------------------------------------------------------------------
	-- Dump vertices

	function DumpVertices src =
	(

		Format "\"vertices\": [" to:ostream

		num = src.count

		if num > 0 then
		(

			for i = 1 to num do
			(

				vert = src[i]

				if flipYZ.checked then
				(
					x = vert.x
					y = vert.z
					z = vert.y

					z *= -1

				)
				else
				(

					x = vert.x
					y = vert.y
					z = vert.z

				)

				Format vertexFormat x y z to:ostream

				if i < num then Format "," to:ostream

			)

		)

		Format "],\n\n" to:ostream

	)

	-------------------------------------------------------------------------------------
	-- Dump colors

	function DumpColors src useColors =
	(

		Format "\"colors\": [" to:ostream

		num = src.count

		if num > 0 and useColors then
		(

			for i = 1 to num do
			(

				col = src[i]

				r = col.r as Integer
				g = col.g as Integer
				b = col.b as Integer

				hexNum = ( bit.shift r 16 ) + ( bit.shift g 8 ) + b

				-- hexColor = formattedPrint hexNum format:"#x"
				-- Format "%" hexColor to:ostream

				decColor = formattedPrint hexNum format:"#d"
				Format "%" decColor to:ostream

				if i < num then Format "," to:ostream

			)

		)

		Format "],\n\n" to:ostream

	)

	-------------------------------------------------------------------------------------
	-- Dump normals

	function DumpNormals src =
	(

		Format "\"normals\": [" to:ostream

		num = src.count

		if num > 0 and exportNormal.checked then
		(

			for i = 1 to num do
			(

				normal = src[i]
				normal = normalize normal as point3

				if flipYZ.checked then
				(

					x = normal.x
					y = normal.z
					z = normal.y

					z *= -1

				)
				else
				(

					x = normal.x
					y = normal.y
					z = normal.z

				)

				Format vertexNormalFormat x y z to:ostream

				if i < num then Format "," to:ostream

			)

		)

		Format "],\n\n" to:ostream

	)

	-------------------------------------------------------------------------------------
	-- Dump uvs

	function DumpUvs src =
	(

		Format "\"uvs\": [[" to:ostream

		num = src.count

		if num > 0 and exportUv.checked then
		(

			for i = 1 to num do
			(

				uvw = src[i]

				u = uvw.x

				if flipUV.checked then
				(
					v = 1 - uvw.y
				)
				else
				(
					v = uvw.y
				)

				Format UVFormat u v to:ostream

				if i < num then Format "," to:ostream

			)

		)

		Format "]],\n\n" to:ostream

	)

	-------------------------------------------------------------------------------------
	-- Dump faces

	function DumpFaces src useColors =
	(

		Format "\"faces\": [" to:ostream

		num = src.count

		if num > 0 then
		(

			for i = 1 to num do
			(

				zface = src[i]

				fv  = zface[1]
				fuv = zface[2]
				m   = zface[3] - 1
				fc  = zface[4]

				needsFlip = zface[5]

				isTriangle = true
				hasMaterial = true
				hasFaceUvs = false
				hasFaceVertexUvs = ((classof fuv == Point3) and exportUv.checked)
				hasFaceNormals = false
				hasFaceVertexNormals = (exportNormal.checked)
				hasFaceColors = false
				hasFaceVertexColors = ((classof fc == Point3) and useColors)

				faceType = 0
				faceType = bit.set faceType 1 (not isTriangle)
				faceType = bit.set faceType 2 hasMaterial
				faceType = bit.set faceType 3 hasFaceUvs
				faceType = bit.set faceType 4 hasFaceVertexUvs
				faceType = bit.set faceType 5 hasFaceNormals
				faceType = bit.set faceType 6 hasFaceVertexNormals
				faceType = bit.set faceType 7 hasFaceColors
				faceType = bit.set faceType 8 hasFaceVertexColors

				if i > 1 then
				(
					Format "," faceType to:ostream
				)

				Format "%" faceType to:ostream

				if isTriangle then
				(

					va = (fv.x - 1) as Integer
					vb = (fv.y - 1) as Integer
					vc = (fv.z - 1) as Integer

					if flipFace.checked or needsFlip then
					(

						tmp = vb
						vb = vc
						vc = tmp

					)


					Format ",%,%,%" va vb vc to:ostream


					if hasMaterial then
					(

						Format ",%" m to:ostream

					)

					if hasFaceVertexUvs then
					(

						ua = (fuv.x - 1) as Integer
						ub = (fuv.y - 1) as Integer
						uc = (fuv.z - 1) as Integer

						if flipFace.checked or needsFlip then
						(

							tmp = ub
							ub = uc
							uc = tmp

						)

						Format ",%,%,%" ua ub uc to:ostream

					)

					if hasFaceVertexNormals then
					(

						if smoothNormal.checked then
						(

							-- normals have the same indices as vertices

							na = va
							nb = vb
							nc = vc

						)
						else
						(
							-- normals have the same indices as face

							na = i - 1
							nb = na
							nc = na

						)

						if flipFace.checked or needsFlip then
						(

							tmp = nb
							nb = nc
							nc = tmp

						)

						Format ",%,%,%" na nb nc to:ostream

					)


					if hasFaceVertexColors then
					(

						ca = (fc.x - 1) as Integer
						cb = (fc.y - 1) as Integer
						cc = (fc.z - 1) as Integer

						if flipFace.checked or needsFlip then
						(

							tmp = cb
							cb = cc
							cc = tmp

						)

						Format ",%,%,%" ca cb cc to:ostream

					)

				)

			)

		)

		Format "]" to:ostream

	)

	-------------------------------------------------------------------------------------
	-- Dump color

	function DumpColor pcolor label =
	(
		r = pcolor.r / 255
		g = pcolor.g / 255
		b = pcolor.b / 255

		fr = formattedPrint r format:".4f"
		fg = formattedPrint g format:".4f"
		fb = formattedPrint b format:".4f"

		Format "\"%\"  : [%, %, %],\n" label fr fg fb to:ostream

	)

	-------------------------------------------------------------------------------------
	-- Dump map

	function DumpMap pmap label =
	(

		if classof pmap == BitmapTexture then
		(
			bm = pmap.bitmap

			if bm != undefined then
			(

				fname = filenameFromPath bm.filename
				Format "\"%\"    : \"skins/%\",\n" label fname to:ostream

			)

		)

	)
	
	-------------------------------------------------------------------------------------
	-- Dump bones
	-- src = #( #(index, name, position, scale, rotation), .. )
	-- boneOrder lists the correct output order of the bones
	-- newIndices is inverse of boneOrder
	
	function DumpBones src boneOrder newIndices =
	(
		numBones = boneOrder.count
		
		Format ",\n\n\t\"bones\" : [\n" to:ostream
		
		for i = 1 to numBones do
		(
			b = src[boneOrder[i]]
			if b[1] == -1 then
			(
				parent_index = -1
			) else (
				parent_index = newIndices[b[1]+1]
			)
			bone_name = b[2]
			p = b[3]
			s = b[4]
			r = b[5]
			
			Format boneFormat parent_index bone_name p s r.x r.y r.z r.w to:ostream
			
			if (i < numBones) then (Format "," to:ostream)
			Format "\n\n" to:ostream
		)
		Format "\t],\n\n" to:ostream
	)
	
	-------------------------------------------------------------------------------------
	-- Dump skin indices
	-- src = #( #(skinned?, #(index1A, index1B, ..), name )
	-- If the mesh wasn't skinned, look in boneNames for its parent to fix the index
	-- If it's not there, leave as 0
	-- boneOrder lists the correct output order of the bones
	-- newIndices is inverse of boneOrder
	
	function DumpIndices src boneNames newIndices =
	(
		output = #()
		for i=1 to src.count do
		(
			if src[i][1] then
			(
				join output src[i][2]
			) else (
				bone = findItem boneNames src[i][3]
				for j=1 to src[i][2].count do
				(
					src[i][2][j] = bone
				)
				join output src[i][2]
			)
		)
			
		Format "\t\"skinIndices\" : [" to:ostream
		num = output.count
		
		if num > 0 then
		(
			for i = 1 to num do
			(
				Format "%" (newIndices[output[i] + 1]) to:ostream
				if i < num then
				(
					Format "," to:ostream
				)
			)
		)
		
		Format "],\n\n" to:ostream
	)
	
	-------------------------------------------------------------------------------------
	-- Dump skin weights
	-- src = #( weight1, weight2, .. )
	
	function DumpWeights src =
	(
		Format "\t\"skinWeights\" : [" to:ostream
		num = src.count
		
		if num > 0 then
		(
			for i = 1 to num do
			(
				Format "%" src[i] to:ostream
				if i < num then Format "," to:ostream
			)
		)
		
		Format "],\n\n" to:ostream
	)
	
	-------------------------------------------------------------------------------------
	-- Dump the keyframes for every bone
	-- src = #( #( parent, #( time, #( posx, posy, posz ), rot, scl ), .. ), .. )
	--          ||---Bone-- |---------------Keyframe----------------| ----||
	-- boneOrder lists the correct output order of the bones
	-- newIndices is inverse of boneOrder
	
	function DumpKeyframes src boneOrder newIndices fps =
	(
		Format animHeaderFormat fps src[1][2][src[1][2].count][1] to:ostream
		
		numBones = boneOrder.count
		
		for i = 1 to (numBones) do
		(
			if (src[boneOrder[i]][1] == -1) then
			(
				parent_index = -1
			) else
			(
				parent_index = newIndices[src[boneOrder[i]][1]+1]
			)
			
			Format animBoneHeaderFormat parent_index to:ostream
			
			bnkeys = src[boneOrder[i]][2]
			
			for j = 1 to bnkeys.count do
			(
				Format keyFormat bnkeys[j][1] bnkeys[j][2][1] bnkeys[j][2][2] bnkeys[j][2][3] bnkeys[j][3].x bnkeys[j][3].y bnkeys[j][3].z bnkeys[j][3].w bnkeys[j][4] to:ostream
				
				if j < bnkeys.count then Format "," to:ostream
				Format "\n" to:ostream
			)
			
			Format animBoneFooterFormat to:ostream
			
			if i < (numBones) then
			(
				Format "," to:ostream
			)
			Format "\n" to:ostream
		)
		
		Format animFooterFormat to:ostream
	)

	-------------------------------------------------------------------------------------
	-- Dump the morphtargets
	-- src = #( #( #(index, name, vertices = #( #( x,y,z ), .. ) ), .. ), .. )
	--        |List of meshes ----------------------------------------------|
	--        |- |List of targets: only one mesh may have multiple ---| ----|
	--        |- |- |Individual target(s) ----------------------| ----| ----|
	
	function DumpMorphTargets src =
	(
		-- This procedure assumes that only one element of src has actual morph targets.
		-- The targets field of the other elements is used to store the vertices of static meshes.
		-- These vertices are duplicated and joined with the vertices of the actual morph targets.
		
		-- Initialize with whatever happens to be first
		
		output = src[1]

		for m=2 to src.count do
		(
			
			if (src[m].count == 1) then
			(
				-- This is a static mesh; attach its vertices, but do nothing else.
				
				for t=1 to output.count do
				(
					join output[t][3] src[m][1][3]
				)
			) else (
				-- This mesh contains morph targets.
				-- Duplicate the static vertices, join with each morph target, and set the indices and names.

				while ( output.count < src[m].count ) do
				(
					-- Duplicate vertices
					
					append output (deepCopy output[1])
				)
				
				for t=1 to src[m].count do
				(
					
					-- Vertices
					join output[t][3] src[m][t][3]
					
					-- Index, name
					output[t][1] = src[m][t][1]
					output[t][2] = src[m][t][2]

				)
			)
		)
		
		Format "\"morphTargets\": [" to:ostream
		
		for k=1 to output.count do
		(
			target = output[k]
			
			Format "{ \"name\": \"morph_%\", \"vertices\": [" target[2] to:ostream
			
			vertices = target[3]
			
			for j=1 to vertices.count do
			(
				Format "%,%,%" vertices[j][1] vertices[j][2] vertices[j][3] to:ostream
				if (j != vertices.count) then
				(
					Format "," to:ostream
				)
			)
			
			Format "] }" to:ostream
			if (k != output.count) then
			(
				Format ",\n" to:ostream
			)
		)
		
		Format "],\n" to:ostream
	)
	
	-------------------------------------------------------------------------------------
	-- Export materials

	function ExportMaterials zmaterials zcolors =
	(

		Format "\"materials\": [\n" to:ostream

		totalMaterials = zmaterials.count

		for i = 1 to totalMaterials do
		(
			mat = zmaterials[i]

			Format "{\n" to:ostream

			-- debug

			Format "\"DbgIndex\" : %,\n" (i-1) to:ostream

			if classof mat != BooleanClass then
			(

				useVertexColors = zcolors[i]

				Format "\"DbgName\"  : \"%\",\n" mat.name to:ostream

				-- colors

				DumpColor mat.diffuse  "colorDiffuse"
				DumpColor mat.ambient  "colorAmbient"
				DumpColor mat.specular "colorSpecular"

				t = mat.opacity / 100
				s = mat.glossiness

				Format "\"transparency\"  : %,\n" t to:ostream
				Format "\"specularCoef\"  : %,\n" s to:ostream

				-- maps

				DumpMap mat.diffuseMap  "mapDiffuse"
				DumpMap mat.ambientMap  "mapAmbient"
				DumpMap mat.specularMap "mapSpecular"
				DumpMap mat.bumpMap 	"mapBump"
				DumpMap mat.opacityMap 	"mapAlpha"

			)
			else
			(

				useVertexColors = false

				Format "\"DbgName\"  : \"%\",\n" "dummy" to:ostream

				DumpColor red "colorDiffuse"

			)

			Format "\"vertexColors\" : %\n" useVertexColors to:ostream
			Format "}" to:ostream

			if ( i < totalMaterials ) then Format "," to:ostream
			Format "\n\n" to:ostream

		)

		Format "],\n\n" to:ostream

	)

	-------------------------------------------------------------------------------------
	-- Extract vertices from mesh

	function ExtractVertices obj whereto =
	(

		n = obj.numVerts

		for i = 1 to n do
		(

			v = GetVert obj i
			append whereto v

		)

	)

	-------------------------------------------------------------------------------------
	-- Extract vertex colors from mesh

	function ExtractColors obj whereto =
	(

		nColors = GetNumCPVVerts obj

		if nColors > 0 then
		(

			for i = 1 to nColors do
			(

				c = GetVertColor obj i
				append whereto c

			)

		)

	)


	-------------------------------------------------------------------------------------
	-- Extract normals from mesh

	function ExtractNormals obj whereto needsFlip =
	(

		if smoothNormal.checked then
		(

			num = obj.numVerts

			for i = 1 to num do
			(

				n = GetNormal obj i

				if flipFace.checked or needsFlip then
				(
					n.x *= -1
					n.y *= -1
					n.z *= -1
				)

				append whereto n

			)

		)
		else
		(

			num = obj.numFaces

			for i = 1 to num do
			(

				n = GetFaceNormal obj i

				if flipFace.checked or needsFlip then
				(
					n.x *= -1
					n.y *= -1
					n.z *= -1
				)

				append whereto n

			)

		)

	)

	-------------------------------------------------------------------------------------
	-- Extract uvs from mesh

	function ExtractUvs obj whereto =
	(
		n = obj.numTVerts

		for i = 1 to n do
		(

			v = GetTVert obj i
			append whereto v

		)

	)

	-------------------------------------------------------------------------------------
	-- Extract faces from mesh

	function ExtractFaces objMesh objMaterial whereto allMaterials needsFlip hasVColors offsetVert offsetUv offsetColor =
	(
		n = objMesh.numFaces
		hasUVs = objMesh.numTVerts > 0

		useMultiMaterial = false
		materialIDList = #()

		materialClass = classof objMaterial

		if materialClass == StandardMaterial then
		(

			fm = findItem allMaterials objMaterial

		)
		else if materialClass == MultiMaterial then
		(

			useMultiMaterial = true

			for i = 1 to n do
			(

				mID = GetFaceMatID objMesh i
				materialIndex = findItem objMaterial.materialIDList mID

				if materialIndex > 0 then
				(

					subMaterial = objMaterial.materialList[materialIndex]

					mMergedIndex = findItem allMaterials subMaterial

					if mMergedIndex > 0 then
					(

						materialIDList[mID] = mMergedIndex

					)
					else
					(

						materialIDList[mID] = findItem allMaterials false

					)

				)
				else
				(

					materialIDList[mID] = findItem allMaterials false

				)

			)

		)
		else
		(

			-- undefined material

			fm = findItem allMaterials false

		)

		for i = 1 to n do
		(

			zface = #()

			fv = GetFace objMesh i

			fv.x += offsetVert
			fv.y += offsetVert
			fv.z += offsetVert

			if useMultiMaterial then
			(

				mID = GetFaceMatID objMesh i
				fm = materialIDList[mID]

			)

			if hasUVs then
			(

				fuv = GetTVFace objMesh i

				fuv.x += offsetUv
				fuv.y += offsetUv
				fuv.z += offsetUv

			)
			else
			(

				fuv = false

			)

			if hasVColors then
			(

				fc = GetVCFace objMesh i

				fc.x += offsetColor
				fc.y += offsetColor
				fc.z += offsetColor

			)
			else
			(

				fc = false

			)

			append zface fv
			append zface fuv
			append zface fm
			append zface fc
			append zface needsFlip

			append whereto zface

		)

	)

	-------------------------------------------------------------------------------------
	-- Extract materials from eventual multi-material

	function ExtractMaterials objMesh objMaterial whereto wheretoColors zname hasVColors =
	(

		materialClass = classof objMaterial

		if materialClass == StandardMaterial then
		(

			if ( findItem whereto objMaterial ) == 0 then
			(

				append whereto objMaterial
				append wheretoColors hasVColors

			)

		)
		else if materialClass == MultiMaterial then
		(

			n = objMesh.numFaces

			for i = 1 to n do
			(

				mID = getFaceMatId objMesh i
				materialIndex = findItem objMaterial.materialIDList mID

				if materialIndex > 0 then
				(

					subMaterial = objMaterial.materialList[materialIndex]

					if ( findItem whereto subMaterial ) == 0 then
					(

						append whereto subMaterial
						append wheretoColors hasVColors

					)

				)

			)

		)
		else
		(

			-- unknown or undefined material

			append whereto false
			append wheretoColors false

		)

	)

	-------------------------------------------------------------------------------------
	-- Hack to figure out if normals are messed up

	function NeedsFaceFlip node =
	(
		needsFlip = false

		local tmp = Snapshot node

		face_normal = normalize ( getfacenormal tmp 1 )

		face = getface tmp 1

		va = getvert tmp face[1]
		vb = getvert tmp face[2]
		vc = getvert tmp face[3]

		computed_normal = normalize ( cross (vc - vb)  (va - vb) )

		if distance computed_normal face_normal > 0.1 then needsFlip = true

		delete tmp

		return needsFlip
	)

	-------------------------------------------------------------------------------------
	-- Extract only things that either already are or can be converted to meshes

	function ExtractMesh node =
	(

		if SuperClassOf node == GeometryClass then
		(
			needsFlip = false
			hasVColors = false

			zmesh = SnapshotAsMesh node

			if autoflipFace.checked then
			(

				needsFlip = NeedsFaceFlip node

			)

			if exportColor.checked and ( getNumCPVVerts zmesh ) > 0 then
			(

				hasVColors = true

			)

			return #( zmesh, node.name, node.material, needsFlip, hasVColors )

		)

		-- Not geometry ... could be a camera, light, etc.

		return #( false, node.name, 0, false, false )

	)
	
	-------------------------------------------------------------------------------------
	-- Extract the morph targets
	-- whereto = #( #( #(index, name, vertices = #( #( x,y,z ), .. ) ), .. ), .. )
	--            |List of meshes -----------------------------------------------|
	--            |- |List of targets -------------------------------------| ----|
	--            |- |- |Individual target --------------------------| ----| ----|

	function ExtractMorphTargets node whereto &morphFlag = 
	(
		targets = #()
		morphs = #()
		
		if ( node.modifiers[#morpher] != undefined ) then (
			-- Export the morph target, if one exists
			
			morphFlag = true
			
			for i=1 to 100 do
			(
				nPts = WM3_MC_NumMPts node.morpher i
				if (nPts > 0) then
				(
					append targets #(i, nPts)
				)
			)
			
			--Set all to zero
			for k=1 to targets.count do
			(
				i = targets[k][1]
				node.morpher[i].controller.value = 0
			)
			
			--Max out one at a time, record it, then zero out again
			for k=1 to targets.count do
			(
				i = targets[k][1]
				numVerts = targets[k][2]
				name = WM3_MC_GetName node.morpher i
				verts = #()

				node.morpher[i].controller.value = 100

				for j = 1 to numVerts do
				(
					p = GetVert node j
					append verts #(p.x, p.y, p.z)
				)
				
				node.morpher[i].controller.value = 0
				
				append morphs #(i, name, verts)
			)
			append whereto morphs
		) else (
			-- Export the mesh vertices as a dummy morph target
			
			verts = #()
			for k=1 to node.numVerts do
			(
				p = GetVert node k
				append verts #(p.x, p.y, p.z)
			)
			
			dummy = #()
			append dummy #(0, "DUMMY", verts)
			append whereto dummy
		)
	)
	
	-------------------------------------------------------------------------------------
	-- Transforms the matrix of a bone into its parent space, if a parent exists.
	
	function thinkLocally bone_node localForm =
	(
		localForm = bone_node.transform
		
		if ( bone_node.parent != undefined ) then
		(
			parentForm = bone_node.parent.transform
			localForm = localForm * inverse parentForm
		)
		
		newLocal = matrix3 1
		
		px = localForm.translationpart.x
		py = localForm.translationpart.y
		pz = localForm.translationpart.z
		lTran = transMatrix (localForm.translationpart)
		
		lRot = (inverse localForm.rotationpart) as matrix3
		
		lScale = scaleMatrix localForm.scalepart
		
		localForm = lScale * lRot * lTran * newLocal
		
		localForm
	)
	
	-------------------------------------------------------------------------------------
	-- Extract bones and keyframes

	function ExtractAnimation node bones keyframes FPS bone_names &skinFlag =
	(
		if node.modifiers[#skin] != undefined then
		(
			skinFlag = true
			
			---------------------------------------------------------------------------------
			-- A dummy root bone is first created and roatated to orient the model
			
			p = (matrix3 1).translationpart
			s = (matrix3 1).scalepart
			r = (matrix3 1).rotationpart
			
			append bones #(-1,"flipRoot",p,s,r)

			/*
			if (flipYZ.checked) then
			(
				r = threeMatrix.rotationpart
			) else (
				r = (matrix3 1).rotationpart
			)
			*/
			
			r = threeMatrix.rotationpart
			
			root_keys = #(#(0, p, r, s))
			
			slidertime = animationrange.start
			
			while (slidertime < animationrange.end) do
			(
				slidertime += 1
				sTime = ((slidertime - animationrange.start) / FPS) as String
				
				append root_keys #(substring sTime 1 (sTime.count - 1), p, r, s)
			)
			
			append keyframes #(-1, root_keys)
			
			---------------------------------------------------------------------------------
			-- The model's bones and keyframes are then extracted
			
			max modify mode
			
			modPanel.setCurrentObject node.modifiers[#skin]
			total_bones = skinops.getnumberbones node.modifiers[#skin]
			
			vertex_count = getNumverts node
			
			-- Find parents by looking up their names; bone names MUST be unique			
			-- Can't guarantee that parent will be read before child; store all names beforehand
			for i = 1 to total_bones do
			(
				bone_name = skinops.getbonename node.modifiers[#skin] i 0
				append bone_names bone_name
			)
			
			for i = 1 to total_bones do
			(
				slidertime = animationrange.start
				
				bone_name = skinops.getbonename node.modifiers[#skin] i 0
				bone_node = getNodeByName bone_name
				
				parent_index = 0
				if ( bone_node.parent != undefined ) then
				(
					parent_name = bone_node.parent.name
					parent_index = (findItem bone_names parent_name)
				)
				
				localForm = bone_node.transform
				localForm = thinkLocally bone_node localForm

				p = localForm.translationpart
				r = localForm.rotationpart
				s = localForm.scalepart
				
				append bones #(parent_index, bone_name, p, bone_node.transform.scalepart, r)
				
				in coordsys parent bone_keys = #(#(0, p, r, bone_node.transform.scalepart))
				
				while (slidertime < animationrange.end) do
				(
					slidertime += 1
					sTime = ((slidertime - animationrange.start) / FPS) as String
					
					localForm = bone_node.transform
					localForm = thinkLocally bone_node localForm
					
					p = localForm.translationpart
					r = localForm.rotationpart
					s = localForm.translationpart
					
					append bone_keys #(substring sTime 1 (sTime.count - 1), p, r, bone_node.transform.scalepart)
				)
				append keyframes #(parent_index, bone_keys)
			)
		)			
	)
	
	-------------------------------------------------------------------------------------
	-- Extract the skin indices and weights in one pass
	-- If it's a skin, skinned? = true and indices contains the bones
	-- If it's not, indices is dummied to #(0,..) and DumpIndices uses the parent to fix it in post
	-- indices = #( #( skinned?, indices, parent), ..)

	function ExtractInfluences node indices weights =
	(
		vertex_count = getNumverts node
		
		meshIndices = #()
		
		if node.modifiers[#skin] != undefined then
		(
			
			for i = 1 to vertex_count do
			(
				-- Insane defaults for the sort; these shouldn't escape into the output
				index1 = -1
				index2 = -1
				weight1 = -1
				weight2 = -1
				
				numBones = skinOps.GetVertexWeightCount node.modifiers[#skin] i
				
				--Two passes of a bubble sort to get the 2 heaviest weights
				for j = 1 to numBones do
				(
					thisIndex = skinops.getVertexWeightBoneID node.modifiers[#skin] i j
					thisWeight = skinops.getvertexweight node.modifiers[#skin] i j
					
					if (thisWeight) > weight1 then
					(
						weight1 = thisWeight
						index1 = thisIndex
					)
				)
				
				for j = 1 to numBones do
				(
					thisIndex = skinops.getVertexWeightBoneID node.modifiers[#skin] i j
					thisWeight = skinops.getvertexweight node.modifiers[#skin] i j
					
					if ((thisWeight > weight2) and (thisIndex != index1)) then
					(
						weight2 = thisWeight
						index2 = thisIndex
					)
				)
				
				-- Establish legal defaults: no weight from the root
				if (index1 == -1) then
				(
					index1 = 0
					weight1 = 0
				)
				if (index2 == -1) then
				(
					index2 = 0
					weight2 = 0
				)
				
				
				append meshIndices (index1)
				append meshIndices (index2)
				
				append weights weight1
				append weights weight2

			)
			
			append indices #(true, meshIndices, "ROOT")
			
		) else (
			for i = 1 to vertex_count do
			(
				append meshIndices 0
				append meshIndices 0
				
				append weights 1
				append weights 1
			)
			
			name = "Scene Root"
			if node.parent != undefined then
			(
				name = node.parent.name
			)
			
			append indices #(false, meshIndices, name)
		)
	)
	
	-------------------------------------------------------------------------------------
	-- Enforce that parent is above all of its children in the output
	-- This fixes several amusing bugs (mostly fingers of infinite length)
	--
	-- boneOrder: order to dump the bones in #(bones)
	-- newIndices: new positional indices of bones
	
	function ReorderBones bones boneOrder newIndices =
	(
	
		/*************************************************************************************
		 * Reorder bones
		 * Python function prototype:
		 * for i in range(n):
		 *	for b in range(n):
		 *		#new bone                   parent of bone legal
		 *		if not inOut[b] and (parents[b] == -1 or inOut[parents[b]]):
		 *			inOut[b] = True
		 *			boneOrder.append(b)
		 *			break;
		 *************************************************************************************/
		
		total_bones = bones.count
		
		-- Keeps track of which parents have been accounted for
		inOut = #()
		
		for i = 1 to total_bones do
		(
			append inOut false
		)
		
		rootNotAdded = true
		for i = 1 to total_bones do
		(
			
			notFound = true
			for b = 1 to total_bones while notFound do
			(
				if (inOut[b] != true) then
				(
					if (rootNotAdded and bones[b][1] == -1) then
					(
						inOut[b] = true
						append boneOrder b
						notFound = false
						rootNotAdded = false
					) else (
						if (inOut[bones[b][1] + 1]) then
						(
							inOut[b] = true
							append boneOrder b
							notFound = false
						)
					)
				)
			)

		)
		
		-- Takes original bone index/parent + 1, returns new correct index for parent, skinIndices, etc
		for i=1 to total_bones do
		(
			newIndices[boneOrder[i]] = i - 1
		)
	)
	
	-------------------------------------------------------------------------------------
	-- Export scene
	-- 
	-- This will BREAK in HORRIBLE WAYS if you feed it more than one object for now.

	function ExportScene =
	(
		slidertime = animationrange.start

		-- Extract meshes

		meshObjects = #()

		mergedVertices = #()
		mergedNormals = #()
		mergedColors = #()

		mergedUvs = #()
		mergedFaces = #()

		mergedMaterials = #()
		mergedMaterialsColors = #()

		sceneHasVColors = false
		
		hasSkin = false
		bones = #()
		keyframes = #()
		
		influences = #()
		weights = #()
		
		boneOrder = #()
		newIndices = #()
		bone_names = #()
		
		hasMorph = false
		mergedMorphTargets = #()

		-- The horrible hackery that is skinops requires only one object be selected.
		original_selection = #()
		for obj in selection do
		(
			append original_selection obj.name
		)
		
		max select none
		
		for name in original_selection do
		(
			obj = getnodebyname name
			select obj

			result = ExtractMesh obj
			meshObj = result[1]

			if ClassOf meshObj == TriMesh then
			(

				meshName     = result[2]
				meshMaterial = result[3]
				needsFlip    = result[4]
				hasVColors   = result[5]

				sceneHasVColors = sceneHasVColors or hasVColors

				append meshObjects result

				vertexOffset = mergedVertices.count
				uvOffset = mergedUvs.count
				colorOffset = mergedColors.count

				ExtractMaterials meshObj meshMaterial mergedMaterials mergedMaterialsColors meshName hasVColors

				ExtractVertices meshObj mergedVertices
				ExtractNormals meshObj mergedNormals needsFlip
				ExtractColors meshObj mergedColors

				ExtractUvs meshObj mergedUvs

				ExtractFaces meshObj meshMaterial mergedFaces mergedMaterials needsFlip hasVColors vertexOffset uvOffset colorOffset

				ExtractAnimation obj bones keyframes fps.value bone_names &hasSkin
				
				ExtractInfluences obj influences weights
				
				ReorderBones bones boneOrder newIndices
				
				ExtractMorphTargets obj mergedMorphTargets &hasMorph

			)
			
			max select none
		)

		totalVertices = mergedVertices.count
		totalFaces = mergedFaces.count
		totalMaterials = mergedMaterials.count

		totalColors = 0
		totalNormals = 0
		totalUvs = 0

		useColors = false

		if sceneHasVColors and exportColor.checked then
		(

			totalColors = mergedColors.count
			useColors = true

		)

		if exportNormal.checked then
		(

			totalNormals = mergedNormals.count

		)

		if exportUv.checked then
		(

			totalUvs = mergedUvs.count

		)

		-- Dump model

		Format "{\n\n" to:ostream

		-- Dump header

		Format headerFormat maxFileName totalVertices totalNormals totalColors totalUvs totalFaces totalMaterials to:ostream

		-- Dump all materials in the scene

		ExportMaterials mergedMaterials mergedMaterialsColors

		-- Dump merged data from all selected geometries

		DumpVertices mergedVertices
		
		if hasMorph then
		(
			DumpMorphTargets mergedMorphTargets
		)
		
		DumpNormals mergedNormals
		DumpColors mergedColors useColors
		DumpUvs mergedUvs
		DumpFaces mergedFaces useColors
		
		if hasSkin then
		(
			DumpBones bones boneOrder newIndices
			DumpIndices influences bone_names newIndices
			DumpWeights weights		
			DumpKeyframes keyframes boneOrder newIndices fps.value
		)

		-- Dump footer

		Format footerFormat to:ostream

	)
	
	-------------------------------------------------------------------------------------
	-- Open and prepare a file handle for writing

	function GetSaveFileStream =
	(
		zname = getFilenameFile maxFileName
		zname += ".js"

		fname = GetSaveFileName filename:zname types:"JavaScript file (*.js)|*.js|All Files(*.*)|*.*|"
		if fname == undefined then
		(

			return undefined

		)

		ostream = CreateFile fname
		if ostream == undefined then
		(

			MessageBox "Couldn't open file for writing !"
			return undefined

		)

		return ostream
	)

	-------------------------------------------------------------------------------------
	-- Export button click handler

	on btn_export pressed do
	(
		ostream = GetSaveFileStream()
		if ostream != undefined then
		(

			ExportScene()
			close ostream

		)

	)

)
createDialog ThreeJSExporter width:300
