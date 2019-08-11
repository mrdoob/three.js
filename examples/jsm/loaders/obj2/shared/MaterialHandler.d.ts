import {
  Material
} from '../../../../../src/Three';

export class MaterialHandler {
  constructor();
  logging: {
    enabled: boolean;
    debug: boolean;
  };
  callbacks: {
    onLoadMaterials: Function;
  };
  materials: object;

  addMaterials(materials: object, newMaterials: object): object;
  addPayloadMaterials(materialPayload: object): object;
  setLogging(enabled: boolean, debug: boolean): void;
  getMaterials(): object;
  getMaterial(materialName: string): Material;
  getMaterialsJSON(): object;
}
