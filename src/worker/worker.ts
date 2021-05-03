import {DataPoint, MainDataStore} from "../state/mainData/mainData.entity";
import {OptimizerParams} from "../state/optimizers/optimizers.entity";
import {BestMatchResult, OptimizationState, SortedDataPoint, WorkerMessage, WorkerMessageType, WorkerResult} from "./worker.entity";
import faker from "faker";

declare var self: DedicatedWorkerGlobalScope;

let mainData: NonNullable<MainDataStore["data"]>;
let optimizers: Record<string, [Generator<SortedDataPoint[]>, SortedDataPoint[] | null]> = {};

let lastSent = Date.now();

setInterval(() =>
	Object.entries(optimizers).forEach(([id, [generator, lastDataPoints]]) => {
		const result = generator.next();
		optimizers[id][1] = result.value as SortedDataPoint[];
		if(lastDataPoints && Date.now() - lastSent > 1000){
			self.postMessage([id, lastDataPoints] as WorkerResult);
			lastSent = Date.now();
		}
		if(result.done) {
			self.postMessage([id, lastDataPoints] as WorkerResult);
			delete optimizers[id];
		}
	})
);

let calculateLoss = (state: OptimizationState, OptimizerParams: OptimizerParams, dataPoint: DataPoint) => 
	Object.keys(OptimizerParams.goal).map<[string, number]>(cKey =>
		[cKey, (state.sum[cKey] + dataPoint.constraints[cKey])/(state.total + 1)]
	).reduce((loss, [cKey, value]) =>
		loss - Math.abs(OptimizerParams.goal[cKey] - value) * OptimizerParams.weight[cKey],
		0
	);

let calculateBestPoints = (state: OptimizationState, optimizerParams: OptimizerParams, dataPoints: DataPoint[]): BestMatchResult => 
	dataPoints.map(
		(dataPoint, index) => ({
			loss: calculateLoss(state, optimizerParams, dataPoint),
			index
		})
	).sort((a, b) => b.loss - a.loss)[0];

function* sortData(data: DataPoint[], optimizerParams: OptimizerParams) {
	let state: OptimizationState = {sum: Object.keys(optimizerParams.goal).reduce((sum, k) => ({...sum, [k]: 0}), {}), total: 0};
	let bestMatch: BestMatchResult;
	let sortedData: SortedDataPoint[] = [];

	while(data.length) {
		bestMatch = calculateBestPoints(state, optimizerParams, data);

		state.total += 1;

		Object.keys(data[bestMatch.index].constraints).forEach(cKey => (state.sum[cKey] += data[bestMatch.index].constraints[cKey]));
		
		sortedData.push({dataPoint: data[bestMatch.index].id, loss: bestMatch.loss});
		data.splice(bestMatch.index, 1);
		yield sortedData;
	}
}

self.onmessage = function(e: MessageEvent<WorkerMessage<WorkerMessageType.DATA>|WorkerMessage<WorkerMessageType.GOAL>>) {
	switch (e.data.type) {
		case WorkerMessageType.DATA:
			mainData = e.data.data;
			optimizers = {};
			break;

		case WorkerMessageType.GOAL:
			optimizers[e.data.data.id] = [sortData(faker.helpers.shuffle([...mainData]), e.data.data), null];
			break;
	}
}
