import {
	LoadingManager,
	Group,
	Material
} from '../../../src/Three';

export class LDrawLoader {
	constructor(manager?: LoadingManager);
	manager: LoadingManager;
	path: string;

	load(url: string, onLoad: (data: Group) => void, onProgress?: (event: ProgressEvent) => void, onError?: (event: ErrorEvent) => void) : void;
	setPath(path: string) : this;
	setFileMap(fileMap: Record<string, string>): void;
	setMaterials(materials: Material[]): void;

	parse(text: string, path?: string, onLoad: (data: Group) => void): void;

	addMaterial(material: Material ): void;
	getMaterial(colourCode: string): Material | null;
}
