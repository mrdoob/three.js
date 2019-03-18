import { LoadingManager } from './LoadingManager';
import { Loader } from './Loader';

/**
 * Interface for all loaders
 * CompressedTextureLoader don't extends Loader class, but have load method
 */
export interface AnyLoader {
  load(
    url: string,
    onLoad?: (result: any) => void,
    onProgress?: (event: ProgressEvent) => void,
    onError?: (event: ErrorEvent) => void
  ): any;
}

export interface LoaderHandler {
  handlers: (RegExp | AnyLoader)[];

  add(regex: RegExp, loader: AnyLoader): void;
  get(file: string): AnyLoader | null;
}

export class FileLoader {
  constructor(manager?: LoadingManager);

  manager: LoadingManager;
  mimeType: MimeType;
  path: string;
  responseType: string;
  withCredentials: string;

  load(
    url: string,
    onLoad?: (response: string | ArrayBuffer) => void,
    onProgress?: (request: ProgressEvent) => void,
    onError?: (event: ErrorEvent) => void
  ): any;
  setMimeType(mimeType: MimeType): FileLoader;
  setPath(path: string): FileLoader;
  setResponseType(responseType: string): FileLoader;
  setWithCredentials(value: string): FileLoader;
  setRequestHeader(value: { [header: string]: string }): FileLoader;
}
