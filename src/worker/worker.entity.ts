import {DataPoint, MainDataStore} from "../state/mainData/mainData.entity";
import {OptimizerParams} from "../state/optimizers/optimizers.entity";

export interface OptimizationState {
	sum: OptimizerParams["goal"];
	total: number;
}

export interface BestMatchResult {
	loss: number;
	index: number;
}

export type WorkerResult = [string, SortedDataPoint[]];

export enum WorkerMessageType {
	DATA,
	GOAL
}

export type WorkerMessage<M extends WorkerMessageType = WorkerMessageType> = {
	type: M,
	data: M extends WorkerMessageType.DATA ? NonNullable<MainDataStore["data"]> : OptimizerParams
}

export interface SortedDataPoint {
	dataPoint: DataPoint["id"];
	loss: number;
}
