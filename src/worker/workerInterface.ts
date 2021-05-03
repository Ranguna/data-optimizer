import {toast} from "react-toastify";
// eslint-disable-next-line
import OptimizerWorker from "worker-loader!./worker";
import {setOptimizedData} from "../state/optimizers/store";
import {WorkerMessage, WorkerMessageType, WorkerResult} from "./worker.entity";

export let workerInstance: OptimizerWorker;

const startThread = () => {
	workerInstance = new OptimizerWorker();

	workerInstance.onmessage = function(message: MessageEvent<WorkerResult>) {
		console.log(message.data[1]);
		setOptimizedData(Number(message.data[0]), message.data[1].map(({loss}) => loss), message.data[1].map(({dataPoint}) => dataPoint));
	}
	
	workerInstance.onerror = function(error) {
		toast.error(error.message);
		workerInstance.terminate();
		startThread();
	}
	
};

export const sendMainData = (data: WorkerMessage<WorkerMessageType.DATA>["data"]) =>
	workerInstance.postMessage({data, type: WorkerMessageType.DATA} as WorkerMessage<WorkerMessageType.DATA>);

export const sendGoals = (data: WorkerMessage<WorkerMessageType.GOAL>["data"]) =>
	workerInstance.postMessage({
		type: WorkerMessageType.GOAL,
		data: {
			...data,
			goal: Object.fromEntries(Object.entries(data.goal).filter(([dimensionName]) => data.enabled[dimensionName]))
		},
	} as WorkerMessage<WorkerMessageType.GOAL>);

startThread();
