import {
	BufferGeometry,
  LoadingManager
} from '../../../src/Three';

export interface PDB {
  geometryAtoms: BufferGeometry;
  geometryBonds: BufferGeometry;
	json: {
		atoms: any[][],
		bonds: number[][]
	}
}


export class PDBLoader {
  constructor(manager?: LoadingManager);
  manager: LoadingManager;
  path: string;

  load(url: string, onLoad: (pdb: PDB) => void, onProgress?: (event: ProgressEvent) => void, onError?: (event: ErrorEvent) => void) : void;
  setPath(path: string) : this;

  parse(text: string) : PDB;
}
