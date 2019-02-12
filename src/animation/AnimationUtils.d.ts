export namespace AnimationUtils {
  export function arraySlice(array: any, from: number, to: number): any;
  export function convertArray(array: any, type: any, forceClone: boolean): any;
  export function isTypedArray(object: any): boolean;
  export function getKeyFrameOrder(times: number): number[];
  export function sortedArray(
    values: any[],
    stride: number,
    order: number[]
  ): any[];
  export function flattenJSON(
    jsonKeys: string[],
    times: any[],
    values: any[],
    valuePropertyName: string
  ): void;
}
