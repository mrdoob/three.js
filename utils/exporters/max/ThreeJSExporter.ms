-------------------------------------------------------------------------------------
-- ThreeJSExporter.ms
-- Exports geometry from 3ds max to Three.js models in ASCII JSON format
-- By alteredq / http://alteredqualia.com
-------------------------------------------------------------------------------------

rollout ThreeJSExporter "ThreeJSExporter"
(
	-- Variables

	local ostream,

	headerFormat = "// Converted from: %
//  vertices: %
//  normals: %
//  uvs: %
//  triangles: %
//  materials: %
//
//  Generated with 3ds max ThreeJSExporter
//  http://github.com/alteredq/three.js/blob/master/utils/exporters/max/ThreeJSExporter.ms


",

	vertexFormat = "%,%,%",

	vertexNormalFormat = "%,%,%",
	UVFormat = "%,%",

	triFormat = "%,%,%,%",
	triUVFormat = "%,%,%,%,%,%,%",
	triNFormat = "%,%,%,%,%,%,%",
	triUVNFormat = "%,%,%,%,%,%,%,%,%,%",

	footerFormat = "}\n\npostMessage( model );"

	-------------------------------------------------------------------------------------
	-- User interface

	group "ThreeJSExporter  v0.2" 
	(

		label msg "Exports meshes in Three.js ascii JSON format" align:#left
		hyperLink lab1 "Original source can be found here" address:"https://github.com/mrdoob/three.js" align:#left

		checkbox flipYZ "Flip YZ" checked:true enabled:true
		checkbox flipUV "Flip UV" checked:true enabled:true
		checkbox flipFace "Flip faces" checked:false enabled:true
		checkbox exportNormal "Export normals" checked:true enabled:true
		checkbox smoothNormal "Use vertex normals" checked:true enabled:true
		checkbox exportUv "Export uvs" checked:true enabled:true
		checkbox exportColor "Export vertex colors" checked:false enabled:false

	)

	button btn_export "Export selected objects"

	-------------------------------------------------------------------------------------
	-- Dump vertices

	function DumpVertices src = 
	(

		Format "'vertices': [" to:ostream

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
	-- Dump normals

	function DumpNormals src = 
	(

		Format "'normals': [" to:ostream

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

		Format "'uvs': [" to:ostream

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

		Format "],\n\n" to:ostream

	)

	-------------------------------------------------------------------------------------
	-- Dump face type

	function DumpFaceType label content = 
	(
		Format "'%': [" label to:ostream

		num = content.count

		if num > 0 then 
		(

			for i = 1 to num do
			(

				zface = content[i]

				fv  = zface[1]
				fuv = zface[2]
				m   = zface[3] - 1

				needsFlip = zface[4]

				hasUVs = (classof fuv == Point3)

				va = (fv.x - 1) as Integer
				vb = (fv.y - 1) as Integer
				vc = (fv.z - 1) as Integer

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

				if hasUVs then
				(
				
					ua = (fuv.x - 1) as Integer
					ub = (fuv.y - 1) as Integer
					uc = (fuv.z - 1) as Integer

				)

				if flipFace.checked or needsFlip then 
				(
					tmp = vb
					vb = vc
					vc = tmp

					tmp = nb
					nb = nc
					nc = tmp

					if hasUVs then
					(

						tmp = ub
						ub = uc
						uc = tmp

					)

				)

				if label == "triangles" then
				(
					Format triFormat va vb vc m to:ostream
				)
				else if label == "trianglesUvs" then
				(
					Format triUVFormat va vb vc m ua ub uc to:ostream
				)
				else if label == "trianglesNormals" then
				(
					Format triNFormat va vb vc m na nb nc to:ostream
				)
				else if label == "trianglesNormalsUvs" then
				(
					Format triUVNFormat va vb vc m na nb nc ua ub uc to:ostream
				)

				if i < num then Format "," to:ostream

			)

		)

		Format "],\n\n" to:ostream

	)

	-------------------------------------------------------------------------------------
	-- Dump faces

	function DumpFaces src = 
	(

		hasUVs = true

		triangles = #()
		trianglesUvs = #()
		trianglesNormals = #()
		trianglesNormalsUvs = #()

		quads = #()
		quadsUvs = #()
		quadsNormals = #()
		quadsNormalsUvs = #()

		num = src.count

		if num > 0 then
		(

			for i = 1 to num do
			(

				zface = src[i]
				fuv = zface[2]

				hasUVs = (classof fuv == Point3)

				if hasUVs and exportUv.checked and exportNormal.checked then
				(
					append trianglesNormalsUvs zface
				)
				else if exportNormal.checked then
				(
					append trianglesNormals zface
				)
				else if hasUVs and exportUv.checked then
				(
					append trianglesUvs zface
				)
				else
				(
					append triangles zface
				)

			)

		)

		DumpFaceType "triangles" triangles
		DumpFaceType "trianglesUvs" trianglesUvs
		DumpFaceType "trianglesNormals" trianglesNormals
		DumpFaceType "trianglesNormalsUvs" trianglesNormalsUvs

		DumpFaceType "quads" quads
		DumpFaceType "quadsUvs" quadsUvs
		DumpFaceType "quadsNormals" quadsNormals
		DumpFaceType "quadsNormalsUvs" quadsNormalsUvs

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

		Format "'%'  : [%, %, %],\n" label fr fg fb to:ostream

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
				Format "'%'    : '%',\n" label fname to:ostream

			)

		)

	)

	-------------------------------------------------------------------------------------
	-- Export materials

	function ExportMaterials zmaterials = 
	(

		Format "'materials': [\n" to:ostream

		totalMaterials = zmaterials.count

		for i = 1 to totalMaterials do
		(
			mat = zmaterials[i]

			Format "{\n" to:ostream

			-- debug

			Format "'DbgIndex' : %,\n" (i-1) to:ostream
			Format "'DbgName'  : '%',\n" mat.name to:ostream

			-- colors

			DumpColor mat.diffuse  "colorDiffuse"
			DumpColor mat.ambient  "colorAmbient"
			DumpColor mat.specular "colorSpecular"

			t = mat.opacity / 100
			s = mat.glossiness
			
			Format "'transparency'  : %,\n" t to:ostream
			Format "'specularCoef'  : %,\n" s to:ostream

			-- maps

			DumpMap mat.diffuseMap  "mapDiffuse"
			DumpMap mat.ambientMap  "mapAmbient"
			DumpMap mat.specularMap "mapSpecular"
			DumpMap mat.bumpMap 	"mapBump"
			DumpMap mat.opacityMap 	"mapAlpha"

			Format "}" to:ostream

			if i < totalMaterials then Format "," to:ostream
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
	-- Extract normals from mesh

	function ExtractNormals obj whereto needsFlip =
	(
		if smoothNormal.checked then
		(

			num = obj.numVerts
			
			for i = 1 to num do 
			(

				n = GetNormal obj i

				if needsFlip then
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

				if needsFlip then
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

	function ExtractFaces objMesh objMaterial whereto allMaterials needsFlip offsetVert offsetUv =
	(
		n = objMesh.numFaces
		hasUVs = objMesh.numTVerts > 0

		useMultiMaterial = false
		materialIDList = #()

		if ( classof objMaterial ) == StandardMaterial then 
		(
			fm = findItem allMaterials objMaterial
		)
		else
		(
			useMultiMaterial = true

			for i = 1 to n do 
			(
				mID = GetFaceMatID objMesh i
				materialIndex = findItem objMaterial.materialIDList mID
				subMaterial = objMaterial.materialList[materialIndex]

				mMergedIndex = findItem allMaterials subMaterial
				if mMergedIndex > 0 then 
				(
					materialIDList[mID] = mMergedIndex
				)

			)

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

			append zface fv 
			append zface fuv
			append zface fm
			append zface needsFlip

			append whereto zface

		)

	)

	-------------------------------------------------------------------------------------
	-- Extract materials from eventual multimaterial
	
	function ExtractMaterials objMesh objMaterial whereto =
	(
		
		materialClass = classof objMaterial

		if materialClass == StandardMaterial then
		(
			if ( findItem whereto objMaterial ) == 0 then
			(
				append whereto objMaterial
			)

		)
		else if materialClass == MultiMaterial then
		(

			n = objMesh.numFaces
			
			for i = 1 to n do 
			(
			
				mID = getFaceMatId objMesh i
				materialIndex = findItem objMaterial.materialIDList mID
				subMaterial = objMaterial.materialList[materialIndex]

				if ( findItem whereto subMaterial ) == 0 then
				(
					append whereto subMaterial
				)

			)

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
			return #( SnapshotAsMesh node, node.name, node.material, NeedsFaceFlip node )

		)

		-- Not geometry ... could be a camera, light, etc.
		
		return #( false, node.name, 0 )

	)

	-------------------------------------------------------------------------------------
	-- Export scene

	function ExportScene =
	(

		-- Extract meshes

		meshObjects = #()

		mergedVertices = #()
		mergedNormals = #()
		mergedUvs = #()
		mergedFaces = #()
		mergedMaterials = #()

		for obj in selection do 
		(

			result = ExtractMesh obj

			meshObj   	 = result[1]
			meshName     = result[2]
			meshMaterial = result[3]
			needsFlip    = result[4]

			if ClassOf meshObj == TriMesh then 
			(

				append meshObjects result

				vertexOffset = mergedVertices.count
				uvOffset = mergedUvs.count

				ExtractMaterials meshObj meshMaterial mergedMaterials

				ExtractVertices meshObj mergedVertices
				ExtractNormals meshObj mergedNormals needsFlip
				ExtractUvs meshObj mergedUvs

				ExtractFaces meshObj meshMaterial mergedFaces mergedMaterials needsFlip vertexOffset uvOffset

			)

		)

		totalVertices = mergedVertices.count
		totalFaces = mergedFaces.count
		totalMaterials = mergedMaterials.count

		totalNormals = 0
		if exportNormal.checked then 
		(
			totalNormals = mergedNormals.count
		)

		totalUvs = 0
		if exportUv.checked then
		(
			totalUvs = mergedUvs.count
		)


		-- Dump header

		Format headerFormat maxFileName totalVertices totalNormals totalUvs totalFaces totalMaterials to:ostream

		-- Dump objects (debug)

		Format "// Source objects:\n\n" to:ostream

		i = 0

		for obj in meshObjects do 
		(

			meshName = obj[2]
			Format "// %: %\n" i meshName to:ostream
			i += 1

		)

		-- Dump model

		Format "\n\nvar model = {\n\n" to:ostream

		-- Dump all materials in the scene

		ExportMaterials mergedMaterials

		-- Dump merged data from all selected geometries

		DumpVertices mergedVertices
		DumpNormals mergedNormals
		DumpUvs mergedUvs
		DumpFaces mergedFaces

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
			return undefined

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