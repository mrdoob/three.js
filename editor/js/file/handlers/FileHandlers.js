import { getFileExt } from '../FileUtils.js';
import { FileHandler_3DM } from './FileHandler_3DM.js';
import { FileHandler_3DS } from './FileHandler_3DS.js';
import { FileHandler_3MF } from './FileHandler_3MF.js';
import { FileHandler_AMF } from './FileHandler_AMF.js';
import { FileHandler_COLLADA } from './FileHandler_COLLADA.js';
import { FileHandler_DRACO } from './FileHandler_DRACO.js';
import { FileHandler_FBX } from './FileHandler_FBX.js';
import { FileHandler_GLB } from './FileHandler_GLB.js';
import { FileHandler_GLTF } from './FileHandler_GLTF.js';
import { FileHandler_JS } from './FileHandler_JS.js';
import { FileHandler_KMZ } from './FileHandler_KMZ.js';
import { FileHandler_LDRAW } from './FileHandler_LDRAW.js';
import { FileHandler_MD2 } from './FileHandler_MD2.js';
import { FileHandler_OBJ } from './FileHandler_OBJ.js';
import { FileHandler_PCD } from './FileHandler_PCD.js';
import { FileHandler_PLY } from './FileHandler_PLY.js';
import { FileHandler_STL } from './FileHandler_STL.js';
import { FileHandler_SVG } from './FileHandler_SVG.js';
import { FileHandler_USDZ } from './FileHandler_USDZ.js';
import { FileHandler_VOX } from './FileHandler_VOX.js';
import { FileHandler_VTK } from './FileHandler_VTK.js';
import { FileHandler_VRML } from './FileHandler_VRML.js';
import { FileHandler_XYZ } from './FileHandler_XYZ.js';
import { FileHandler_ZIP } from './FileHandler_ZIP.js';


class FileHandlers {

	static getImportHandler( file, editor, manager ) {

		const Handler = FileHandlers.ImportableHandlers[ getFileExt( file ) ];

		return new Handler( editor, manager );

	}

	static get ImportableHandlers() {

		return {

			'.3dm': FileHandler_3DM,
			'.3ds': FileHandler_3DS,
			'.3mf': FileHandler_3MF,
			'.amf': FileHandler_AMF,
			'.dae': FileHandler_COLLADA,
			'.drc': FileHandler_DRACO,
			'.fbx': FileHandler_FBX,
			'.glb': FileHandler_GLB,
			'.gltf': FileHandler_GLTF,
			'.js': FileHandler_JS,
			'.json': FileHandler_JS,
			'.kmz': FileHandler_KMZ,
			'.ldr': FileHandler_LDRAW,
			'.mpd': FileHandler_LDRAW,
			'.md2': FileHandler_MD2,
			'.obj': FileHandler_OBJ,
			'.pcd': FileHandler_PCD,
			'.ply': FileHandler_PLY,
			'.stl': FileHandler_STL,
			'.svg': FileHandler_SVG,
			'.usdz': FileHandler_USDZ,
			'.vox': FileHandler_VOX,
			'.vtk': FileHandler_VTK,
			'.vtp': FileHandler_VTK,
			'.wrl': FileHandler_VRML,
			'.xyz': FileHandler_XYZ,
			'.zip': FileHandler_ZIP

		};

	}

}

export { FileHandlers };
