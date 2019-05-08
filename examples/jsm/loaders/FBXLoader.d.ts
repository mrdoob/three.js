import {
	Group,
	LoadingManager,
} from '../../../src/Three';

export class FBXLoader {
	constructor(manager?: LoadingManager);
	manager: LoadingManager;
	crossOrigin: string;

	load(url: string, onLoad: (group: Group) => void, onProgress?: (event: ProgressEvent) => void, onError?: (event: ErrorEvent) => void): void;
	setPath(value: string) : FBXLoader;
	setResourcePath(value: string) : FBXLoader;
	setCrossOrigin(value: string): FBXLoader;
	parse(FBXBuffer:ArrayBuffer, path:string): Group;
}
