import { Node } from './Node';

export class NodeContext {
  slot: string;
  cache: string;
  data: object;

  setSlot(name: string): this;
  setCache(name: string): this;
  setProperty(name: string, value: any): this;
}
