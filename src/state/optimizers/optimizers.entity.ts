import {ValueOf} from "type-fest";
import {DataPoint} from "../mainData/mainData.entity";

export interface OptimizerParams {
	id: number;
	goal: {
		[key in keyof DataPoint["constraints"]]: number;
	};
	enabled: {
		[key in keyof DataPoint["constraints"]]: boolean;
	};
	weight: {
		[key in keyof DataPoint["constraints"]]: number;
	};
	loss?: number[];
	optimizedIds?: NonNullable<ValueOf<DataPoint["constraints"]>>[];
};

export type Optimizers = OptimizerParams[];
