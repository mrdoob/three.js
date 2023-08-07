export class AnimationObjectGroup {
    constructor(...args: any[]);

    uuid: string;
    stats: {
        bindingsPerObject: number;
        objects: {
            total: number;
            inUse: number;
        };
    };
    readonly isAnimationObjectGroup: true;

    add(...args: any[]): void;
    remove(...args: any[]): void;
    uncache(...args: any[]): void;
}
