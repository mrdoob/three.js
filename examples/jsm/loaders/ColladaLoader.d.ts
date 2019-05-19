import {
	AnimationClip,
	LoadingManager,
  Scene
} from '../../../src/Three';


export interface Collada {
  animations: AnimationClip[];
  kinematics: object;
  library: object;
	scene: Scene;
}

export class Collada {
  constructor(manager?: LoadingManager);
  manager: LoadingManager;
  crossOrigin: string;
  path: string;
  resourcePath: string;

  load(url: string, onLoad: (collada: Collada) => void, onProgress?: (event: ProgressEvent) => void, onError?: (event: ErrorEvent) => void) : void;
	setPath(path: string) : this;
  setResourcePath(path: string) : this;
  setCrossOrigin(value: string): this;

  parse(text: string, path: string) : Collada;
}
