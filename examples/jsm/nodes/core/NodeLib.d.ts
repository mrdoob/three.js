import { Node } from './Node';
import { NodeBuilder } from './NodeBuilder';

export interface NodeLibKeyword {
  callback: () => void;
  cache?: object;
}

export namespace NodeLib {

  export const nodes: object;
  export const keywords: object;

  export function add(node: Node): void;
  export function addKeyword(name: string, callback: () => void, cache?: object): void;
  export function remove(node: Node): void;
  export function removeKeyword(name: string): void;
  export function get(name: string): Node;
  export function getKeyword(name: string, builder: NodeBuilder): any;
  export function getKeywordData(name: string): NodeLibKeyword;
  export function contains(name: string): boolean;
  export function containsKeyword(name: string): boolean;

}
