export class WorkerTaskManager {
    constructor(maxParallelExecutions?: number);
    taskTypes: Map<string, WorkerTypeDefinition>;
    verbose: boolean;
    maxParallelExecutions: number;
    actualExecutionCount: number;
    storedExecutions: StoredExecution[];
    teardown: boolean;
    setVerbose(verbose: boolean): WorkerTaskManager;
    setMaxParallelExecutions(maxParallelExecutions: number): WorkerTaskManager;
    getMaxParallelExecutions(): number;
    supportsTaskType(taskType: string): boolean;
    registerTaskType(taskType: string, initFunction: Function, executeFunction: Function, comRoutingFunction: Function, fallback: boolean, dependencyDescriptions?: any[]): boolean;
    registerTaskTypeModule(taskType: string, workerModuleUrl: string): boolean;
    initTaskType(taskType: string, config: object, transferables?: any): Promise<void>;
    _wait(milliseconds: any): Promise<any>;
    enqueueForExecution(taskType: string, config: object, assetAvailableFunction: Function, transferables?: any): Promise<any>;
    _depleteExecutions(): Promise<void>;
    dispose(): WorkerTaskManager;
}
declare class WorkerTypeDefinition {
    constructor(taskType: string, maximumCount: number, fallback: boolean, verbose?: boolean);
    taskType: string;
    fallback: boolean;
    verbose: boolean;
    initialised: boolean;
    functions: {
        init: Function;
        execute: Function;
        comRouting: Function;
        dependencies: {
            descriptions: any[];
            code: string[];
        };
        workerModuleUrl: URL;
    };
    workers: {
        code: string[];
        instances: TaskWorker[] | MockedTaskWorker[];
        available: TaskWorker[] | MockedTaskWorker[];
    };
    status: {
        initStarted: boolean;
        initComplete: boolean;
    };
    getTaskType(): string;
    setFunctions(initFunction: Function, executeFunction: Function, comRoutingFunction?: Function): void;
    setDependencyDescriptions(dependencyDescriptions: any[]): void;
    setWorkerModule(workerModuleUrl: string): void;
    isWorkerModule(): boolean;
    loadDependencies(): <String_1>() => [];
    createWorkers(): Promise<void>;
    createWorkerModules(): Promise<void>;
    initWorkers(config: object, transferables: any): Promise<void>;
    getAvailableTask(): TaskWorker | MockedTaskWorker | undefined;
    hasTask(): boolean;
    returnAvailableTask(taskWorker: TaskWorker | MockedTaskWorker): void;
    dispose(): void;
}
declare class StoredExecution {
    constructor(taskType: string, config: object, assetAvailableFunction: Function, resolve: Function, reject: Function, transferables?: Transferable[]);
    taskType: string;
    config: any;
    assetAvailableFunction: Function;
    resolve: Function;
    reject: Function;
    transferables: Transferable[];
}
declare class TaskWorker extends Worker {
    constructor(id: number, aURL: string, options?: object);
    id: number;
    getId(): number;
}
declare class MockedTaskWorker {
    constructor(id: number, initFunction: Function, executeFunction: Function);
    id: number;
    functions: {
        init: Function;
        execute: Function;
    };
    getId(): number;
    postMessage(message: string, transfer?: Transferable[]): void;
    terminate(): void;
}
export {};
