export enum MainDataRequiredHeaders {
	ID = "id"
}

export interface DataPoint {
	id: number;
	constraints: {
		[key in string]: number;
	}
}

export interface MainDataStore {
	data?: DataPoint[];
	headers?: string[];
}
