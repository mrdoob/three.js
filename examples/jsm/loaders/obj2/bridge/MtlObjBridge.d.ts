import {
  MaterialCreator
} from '../../MTLLoader';

export namespace MtlObjBridge {
  export function link(processResult: object, assetLoader: object): void;
  export function addMaterialsFromMtlLoader(materialCreator: MaterialCreator): void;
}
