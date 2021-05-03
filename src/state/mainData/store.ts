import {entity} from "simpler-state";
import {sendMainData} from "../../worker/workerInterface";
import {DataPoint, MainDataRequiredHeaders, MainDataStore} from "./mainData.entity";

export class MainDataIntegrityError extends Error { }

export const mainDataStore = entity<MainDataStore>(
	{
		data: undefined,
		headers: undefined
	},
	[
		{
			set: (origSet, entity) => (...args: any[]) => {
				origSet(...args);
				if(mainDataStore.get().data)
					sendMainData(mainDataStore.get().data!);
			}
		}
	]
);

export const csvStringToMainData = (csvString: string): MainDataStore => {
	const [header, ...data] = csvString.split("\n");
	const headers = header.split(";").map(name => name.trim().toLowerCase());
	const idIndex = headers.findIndex(header => header === MainDataRequiredHeaders.ID);
	if(idIndex === -1)
		throw new MainDataIntegrityError("Data missing ID column.");

	return {
		headers,
		data: data.reduce(
			(mainData, row, rowIndex) => {
				if(row === '')
					return mainData;
				const rowData = row.split(";").map(rowValue => rowValue.trim());
				
				if(Number.isNaN(Number(rowData[idIndex])))
					throw new MainDataIntegrityError(`ID of row ${rowIndex} is not a valid number.`);

				rowData.forEach((rowValue, rowIndex) => {
					if(rowIndex === idIndex)
						return;

					if(Number.isNaN(Number(rowValue)))
						throw new MainDataIntegrityError(`Column ${headers[rowIndex]} of row ${rowIndex} is not a number, is "${rowValue}".`);
				});

				return [
					...mainData,
					{
						id: Number(rowData[idIndex]),
						constraints: headers.reduce<DataPoint["constraints"]>(
							(dataPoint, headerValue, columnIndex) => ({
								...dataPoint,
								[headerValue]: Number(rowData[columnIndex])
							}),
							{}
						)
					}
				];
			},
			[] as NonNullable<MainDataStore["data"]>
		)
	};
}

export const loadMainDataFromCsv = (csvFile: File) => 
	new Promise<MainDataStore>((res, rej) => {
		const fileReader = new FileReader();

		fileReader.readAsText(csvFile);
		fileReader.onloadend = event => {
			try {
				const parsedMainData = csvStringToMainData(event.target?.result as string);

				mainDataStore.set(({
					...parsedMainData
				}));

				res(parsedMainData)
			} catch(error) {
				return rej(error);
			}
		};
	});
