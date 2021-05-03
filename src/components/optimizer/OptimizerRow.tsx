import {Checkbox, Paper, Slider, withStyles, TextField, Button} from "@material-ui/core";
import {changeOptimizerGoal, changeOptimizerWeight, deleteOptimizer, newOptimizer, toggleOptimizerGoal} from "../../state/optimizers/store";
import {ChangeEvent, SyntheticEvent, useCallback, useMemo} from "react";
import {OptimizerRowProps} from "./OptimizerRow entity";
import { Line } from 'react-chartjs-2';

import './OptimizerRow.scss';
import {toast} from "react-toastify";
import {sendGoals} from "../../worker/workerInterface";

const NewRow = () => (
	<button className="optimizer-row empty" onClick={newOptimizer}>
		New Optimization
	</button>
);

export const OptimizerRow = ({optimizerData}: OptimizerRowProps) => {
	// eslint-disable-next-line react-hooks/rules-of-hooks
	const PrettoSlider = optimizerData && Object.keys(optimizerData.goal).map((goalName, i) => useMemo(() =>
		withStyles({
			root: {
				color: `hsl(${((optimizerData.id + 0.618033 * (i + 1))%1)*365}, 70%, 70%)`,
				opacity: optimizerData.enabled[goalName] ? "100%" : "20%",
				width: "100%",
				minWidth: "20px",
				height: "180px",
				display: "flex",
				'&$vertical': {
					width: "100%",
					minWidth: "20px",
					height: "180px",
					padding: "0px"
				}
			},
			thumb: {
				display: "none"
			},
			track: {
				width: "100% !important",
				borderRadius: 0
			},
			rail: {
				visibility: "hidden"
			},
			vertical: {
				width: "100%",
				minWidth: "20px",
				height: "180px",
				padding: "0px"
			}
		})(Slider),
		[goalName, optimizerData.enabled[goalName]]
	));

	const handleSettingToggle = useCallback((event: SyntheticEvent<HTMLInputElement>) => toggleOptimizerGoal(optimizerData!.id, event.currentTarget.name), [optimizerData?.id]);
	const handleWeightChange = useCallback((goalName: string) => (_: ChangeEvent<{}>, newWeight: number | number[]) => changeOptimizerWeight(optimizerData!.id, goalName, newWeight as number), [optimizerData?.id]);
	const handleGoalChange = useCallback((event: ChangeEvent<HTMLTextAreaElement>) => changeOptimizerGoal(optimizerData!.id, event.currentTarget.name, Number(event.currentTarget.value)), [optimizerData?.id]);

	const handleFastEdit = useCallback(() => toast.warn("Not Implemented yet."), []);
	const handleDeleteOptimizer = useCallback(() => deleteOptimizer(optimizerData?.id), [optimizerData?.id]);
	const handleGenerate = useCallback(() => optimizerData ? sendGoals(optimizerData) : toast.error("Can't optimize to non existing goals."), [optimizerData]);
	const handleCopyIds = useCallback(() => {
		if(!optimizerData?.optimizedIds)
			return toast.error("Optimization has not been ran yet.");

		navigator.clipboard.writeText("ID;loss\n" + optimizerData!.optimizedIds!.map((id, i) => `${id};${optimizerData.loss![i]}`).join('\n'))
	}, [optimizerData]);

	const goals = optimizerData && Object.entries(optimizerData.weight).map(
		// eslint-disable-next-line react-hooks/rules-of-hooks
		([goalName, weightValue], i) => useMemo(() => {
			const Component = PrettoSlider![i];

			return (
				<div className="optimizer-setting" key={goalName}>
					<Component orientation="vertical" value={weightValue} max={2} step={0.25} onChange={handleWeightChange(goalName)}></Component>
					<div className="optimizer-setting-label">
						<Checkbox name={goalName} checked={optimizerData.enabled[goalName]} onChange={handleSettingToggle}></Checkbox>
						<TextField name={goalName} type="number" value={optimizerData.goal[goalName]} label={goalName} disabled={!optimizerData.enabled[goalName]} onChange={handleGoalChange}></TextField>
					</div>
				</div>
			)
		}, [goalName, weightValue, optimizerData.enabled[goalName], optimizerData.goal[goalName]])
	);

	const data = useMemo(() => (optimizerData?.loss && {
		labels: Array.from({length: optimizerData.loss.length}).map((_, i) => String(i)),
		datasets: [
			{
				label: 'Loss',

				data: optimizerData.loss,
				backgroundColor: 'rgb(255, 99, 132)',
				borderColor: 'rgba(255, 99, 132, 0.5)',
			},
		],
	}), [optimizerData?.loss]);

	const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Loss Chart'
      }
    }
  };

	const chart = useMemo(
		() => optimizerData?.loss && <Line type="line" options={options} data={data} height={50}></Line>,
		[data]
	);

	if(!optimizerData)
		return <NewRow></NewRow>;

	return (
		<Paper elevation={3} className="optimizer-row">
			<div className="optimizer-settings-container">
				{goals}
			</div>
			<div className="optimizer-actions">
				<Button onClick={handleCopyIds} color="primary">Copy IDs</Button>
				<Button onClick={handleGenerate} disableElevation variant="contained" color="primary">Generate</Button>
				<Button onClick={handleDeleteOptimizer} disableElevation variant="contained" color="secondary">Delete</Button>
				<Button onClick={handleFastEdit}>Fast Edit</Button>
			</div>
			{chart}
		</Paper>
	);
};