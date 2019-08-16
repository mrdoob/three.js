import { Node } from './Node';

export class NodeContext {
  slot: string;
  cache: string;
  context: object;

  setSlot(name: string): this;
  setCache(name: string): this;

  setProperty(name: string, value: any): this;
  setClass(name: string, value: any): this;
  setGamma(value: boolean): this;
  setInclude(value: boolean): this;
  setCaching(value: boolean): this;

  static GAMMA: string;
  static INCLUDE: string;
  static CACHING: string;
  static UV: string;
}
