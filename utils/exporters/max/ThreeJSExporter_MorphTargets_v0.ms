-------------------------------------------------------------------------------------
-- ThreeJSExporter.ms
-- Exports geometry from 3ds max to Three.js models in ASCII JSON format v3
-- By alteredq / http://alteredqualia.com
--
--	2014.06.25
--	Add vertex export from each frame
-------------------------------------------------------------------------------------
function eav_attime obj t =
(
	local i
	local s_out = ""
	s_out = s_out as stringstream
	
	local zmesh = at time t (SnapshotAsMesh obj)
	local n = zmesh.numverts
	
	local vrs_ar = #()
	local v = [0,0,0]
	
	for i = 1 to n do
	(
		v = (GetVert zmesh i)
		append vrs_ar v
	)

	for i = 1 to vrs_ar.count do
	(
		v = vrs_ar[i]
		format "%, %, %" v.x v.z -v.y to:s_out
		
		if i < vrs_ar.count then
		(
			format ",  " to:s_out
		)
	)

	return (s_out as string)
)


/*
TODO 2014.06.25
Export animation from modifiers
*/
function eav_get_range_from_trans_con obj &i_t1 &i_t2 =
(
--	Get keys range from Pos, rotation, scale controllers	
	local i
	local con
	local t1min = 0, t2max = 0
	
	for i = 1 to 3 do
	(
		con = obj.controller[i]
		
		format "\nController: %" obj.controller[i].name
		format " (keys count: %)" con.keys.count
		
		if con.keys.count == 0 then
		(
			continue
		)
		
		t1 = con.keys[1].time.frame as integer
		t2 = (con.keys[con.keys.count].time.frame) as integer
		
		if i == 1 then
		(
			t1min = t1
			t2max = t2
		)
		
		if t1 < t1min then
		(
			t1min = t1
		)
		
		if t2 > t2max then
		(
			t2max = t2
		)
	)
	
	i_t1 = t1min
	i_t2 = t2max
	
	if( i_t1 == 0 )and( i_t2 == 0 )then
	(
		return(false)
	)
	else
	(
		return(true)
	)
)

function eav_get_range_from_mods_con obj &i_t1 &i_t2 =
(
	local i
	local cmod, mod_con
	local props, pr
	local t1min = 0, t2max = 0
	
--	format "\n\nModifiers:\n"
	
	for i = 1 to obj.modifiers.count do
	(
		cmod = obj.modifiers[i]
		
	--	format "\n%: \"%\" (%)\n" i (cmod.name) (classof cmod)
		
		props = getpropnames cmod
		
		for pr in props do
		(
			mod_con = (getPropertyController cmod pr)
		
			--format "% = % (Animatable - %)\n" pr mod_con	(isPropertyAnimatable obj pr)	
			if mod_con == undefined then
			(
				if cmod.name == "Morpher" then
				(
					format "% = %" pr cmod[pr]
					mod_con = cmod[pr]
				)
				
				if mod_con == undefined then
				(
					continue
				)
			)
			
			if mod_con.keys.count <= 0 then
			(
				continue
			)
			
		--	format "\t%\t(keys: %)\n" pr (mod_con.keys.count)
			
			t1 = mod_con.keys[1].time.frame as integer
			t2 = (mod_con.keys[mod_con.keys.count].time.frame) as integer
			
			if i == 1 then
			(
				t1min = t1
				t2max = t2
			)
			
			if t1 < t1min then
			(
				t1min = t1
			)
			
			if t2 > t2max then
			(
				t2max = t2
			)
		)
	)
	
	i_t1 = t1min
	i_t2 = t2max
	
	if( i_t1 == 0 )and( i_t2 == 0 )then
	(
		return(false)
	)
	else
	(
		return(true)
	)
	
)

function eav_exp_obj obj ostream =
(
	local i, t1, t2, t1_m, t2_m
	local b_ran_set = false
	local b_ran_mod_set = false
	format "\n\n-----------------------------\nObject: \"%\"\n" obj.name

	-- Total range:
/*	local frames_num = animationRange.end.frame - animationRange.start.frame
	frames_num = frames_num as integer
*/
	
	-- Range detection between keys:
	b_ran_set = eav_get_range_from_trans_con obj &t1 &t2
	b_ran_mod_set = eav_get_range_from_mods_con obj &t1_m &t2_m
	
	format "\n\nKey ranges detected:\n"
	format "  transform: (% to %) - %\n" t1 t2 b_ran_set
	format "  modifiers: (% to %) - %\n" t1_m t2_m b_ran_mod_set
	
	if b_ran_set and b_ran_mod_set then
	(
	--	format "\nAll ranges set - compare\n"
		-- Set smallest first key, and latest final key
		if t1_m < t1 then
		(
			t1 = t1_m
		)
		
		if t2_m > t2 then
		(
			t2 = t2_m
		)
	)
	else if( not b_ran_set )and( b_ran_mod_set )then
	(
	--	format "\nTrans range not set\n"
		t1 = t1_m
		t2 = t2_m
	)
	else if( not b_ran_mod_set )and( b_ran_set )then
	(
	--	format "\nmods range not set\n"
		-- all values t1, t2 - save in initial state
	)
	else if( not b_ran_set )and( not b_ran_mod_set )then
	(
		format "\n  No key range set. Exit function\n"
		return(false)
	)
	
	format "\n  final range for export: (% to %)\n" t1 t2

	---- Output
	format "\n\"morphTargets\": [" to:ostream
	
	for i = t1 to t2 do
	(
		format "\n{\"name\": \"FRAME000\", \"vertices\": [" to:ostream
		format "%]}" (eav_attime obj i) to:ostream
		
		if i < t2 then
		(
			format "," to:ostream
		)
	)
	format " ],\n\n" to:ostream
	
	format "\n\n\"morphColors\": [],\n\n\n" to:ostream
)

function exp_anim_verts_sel ostream =
(
	Clearlistener()
	format "\n---- Export verts:\n"
	
	for obj in selection do
	(
		if superclassof obj != geometryclass then continue
		eav_exp_obj obj ostream
	)
	format "\n----\n"
)
----





--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
rollout ThreeJSExporter "ThreeJSExporter"
(
	-- Variables

	local ostream,
	headerFormat = "\"metadata\":{\"sourceFile\": \"%\",\"generatedBy\": \"3ds max ThreeJSExporter\",\"formatVersion\": 3.1,\"vertices\": %,\"normals\": %,\"colors\": %,\"uvs\": %,\"triangles\": %,\"materials\": %},",

	vertexFormat = "%,%,%",

	vertexNormalFormat = "%,%,%",
	UVFormat = "%,%",

	triFormat = "%,%,%,%",
	triUVFormat = "%,%,%,%,%,%,%",
	triNFormat = "%,%,%,%,%,%,%",
	triUVNFormat = "%,%,%,%,%,%,%,%,%,%",

	footerFormat = "}"

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

		checkbox flipYZ "Flip YZ" checked:true enabled:true
		checkbox flipUV "Flip UV" checked:false enabled:true
		checkbox flipFace "Flip all faces" checked:false enabled:true
		checkbox autoflipFace "Try fixing flipped faces" checked:false enabled:true

		label dummy3 "--------------------------------------------------------" align:#left
		
		checkbox cb_exp_mt "Export Morph Targets" checked:true enabled:true
		
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

	----	2014.06.25	16:15
	function dump_morph_targets =
	(
		Clearlistener()
		format "\n---- dump_morph_targets():\n"
		
		if not cb_exp_mt.state then
		(
			format "\nNot checked\n"
			return()
		)
		
		exp_anim_verts_sel ostream

		format "\n----\n"
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
		Format "]\n\n" to:ostream
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
				Format "\"%\"    : \"%\",\n" label fname to:ostream
			)
		)
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
	-- Export scene
	function ExportScene =
	(
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

		for obj in selection do
		(
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
			)
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


		-- Dump objects (debug)
		-- Format "// Source objects:\n\n" to:ostream
		-- i = 0
		-- for obj in meshObjects do
		-- (
		-- 	meshName = obj[2]
		-- 	Format "// %: %\n" i meshName to:ostream
		-- 	i += 1
		-- )

		-- Dump model
		Format "{\n\n" to:ostream

		-- Dump header
		Format headerFormat maxFileName totalVertices totalNormals totalColors totalUvs totalFaces totalMaterials to:ostream

		-- Dump all materials in the scene
		ExportMaterials mergedMaterials mergedMaterialsColors

		-- Dump merged data from all selected geometries
		DumpVertices mergedVertices
		
		----	2014.06.25	16:14
		dump_morph_targets()
		----
		
		DumpNormals mergedNormals
		DumpColors mergedColors useColors
		DumpUvs mergedUvs
		DumpFaces mergedFaces useColors

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