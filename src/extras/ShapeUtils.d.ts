export interface Vec2 {
    x: number;
    y: number;
}

export namespace ShapeUtils {
    function area(contour: Vec2[]): number;
    function triangulateShape(contour: Vec2[], holes: Vec2[][]): number[][];
    function isClockWise(pts: Vec2[]): boolean;
}
