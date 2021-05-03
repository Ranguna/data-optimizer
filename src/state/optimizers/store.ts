import {entity} from "simpler-state";
import {ValueOf} from "type-fest";
import {mainDataStore} from "../mainData/store";
import {OptimizerParams, Optimizers} from "./optimizers.entity";

export const optimizersStore = entity<Optimizers>([]);

export const newOptimizer = () => optimizersStore.set(optimizers => [
	...optimizers,
	{
		id: Math.random(),
		goal: Object.fromEntries(
			(mainDataStore.get().headers ?? []).map(constraintName => [constraintName, 0])
		),
		enabled: Object.fromEntries(
			(mainDataStore.get().headers ?? []).map(constraintName => [constraintName, false])
		),
		weight: Object.fromEntries(
			(mainDataStore.get().headers ?? []).map(constraintName => [constraintName, 1])
		)
	}
]);

export const toggleOptimizerGoal = (id: OptimizerParams["id"], goalName: keyof OptimizerParams["goal"]) =>
	optimizersStore.set(store =>
		store.map(optimizer =>
			optimizer.id !== id
			? optimizer
			: {
				...optimizer,
				enabled: {
					...optimizer.enabled,
					[goalName]: !optimizer.enabled[goalName]
				}
			}
		)
	);

export const changeOptimizerWeight = (id: OptimizerParams["id"], goalName: keyof OptimizerParams["weight"], newWeight: ValueOf<OptimizerParams["weight"]>) =>
	optimizersStore.set(store =>
		store.map(optimizer =>
			optimizer.id !== id
			? optimizer
			: {
				...optimizer,
				weight: {
					...optimizer.weight,
					[goalName]: newWeight
				}
			}
		)
	);

export const changeOptimizerGoal = (id: OptimizerParams["id"], goalName: keyof OptimizerParams["goal"], newGoal: ValueOf<OptimizerParams["goal"]>) =>
	optimizersStore.set(store =>
		store.map(optimizer =>
			optimizer.id !== id
			? optimizer
			: {
				...optimizer,
				goal: {
					...optimizer.goal,
					[goalName]: newGoal
				}
			}
		)
	);

export const setOptimizedData = (id: OptimizerParams["id"], loss: OptimizerParams["loss"], optimizedIds: OptimizerParams["optimizedIds"]) =>
	optimizersStore.set(store =>
		store.map(optimizer =>
			optimizer.id !== id
			? optimizer
			: {
				...optimizer,
				loss,
				optimizedIds
			}
		)
	)

export const deleteOptimizer = (id?: OptimizerParams["id"]) =>
	optimizersStore.set(store =>
		store.filter(optimizer => optimizer.id !== id)
	);
