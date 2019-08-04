import { Node } from './Node';

export class NodeContext {
  data: object;

  setProperty(name: string, value: any): this;
  setClass(name: string, value: any): this;
  setGamma(value: boolean): this;
  setInclude(value: boolean): this;
  setIgnoreCache(value: boolean): this;

  static GAMMA: string;
  static INCLUDE: string;
  static IGNORE_CACHE: string;
}
