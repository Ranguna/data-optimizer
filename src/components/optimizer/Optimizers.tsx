import {optimizersStore} from "../../state/optimizers/store"
import {OptimizerRow} from "./OptimizerRow";

import "./Optimizers.scss";

export const Optimizers = () => {
	const optimizers = optimizersStore.use();

	return (
		<div className="optimizer-container">
			{[...optimizers, null].map(optimizerParams => <OptimizerRow optimizerData={optimizerParams} key={optimizerParams?.id ?? "empty-row"}></OptimizerRow>)}
		</div>
	)
}