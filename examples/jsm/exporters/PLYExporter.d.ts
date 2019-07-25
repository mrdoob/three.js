import { Object3D } from '../../../src/Three';

export interface PLYExporterOptions {
  binary?: boolean;
  excludeAttributes?: string[];
}

export class PLYExporter {
  constructor();

  parse(object: Object3D, onDone: (res: string) => void, options: PLYExporterOptions): string | null;
}
