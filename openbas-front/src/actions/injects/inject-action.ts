import { Dispatch } from 'redux';
import { getReferential, simpleCall, simplePostCall } from '../../utils/Action';
import type { Exercise, Scenario, SearchPaginationInput } from '../../utils/api-types';
import * as schema from '../Schema';

export const testInject = (injectId: string) => {
  const uri = `/api/injects/${injectId}/test`;
  return simpleCall(uri);
};

export const bulkTestInjects = (injectIds: string[]) => {
  const data = injectIds;
  const uri = '/api/injects/bulk/test';
  return simplePostCall(uri, data, "Can't be tested");
};

// -- EXERCISES --

export const fetchExerciseInjectsSimple = (exerciseId: Exercise['exercise_id']) => (dispatch: Dispatch) => {
  const uri = `/api/exercises/${exerciseId}/injects/simple`;
  return getReferential(schema.arrayOfInjects, uri)(dispatch);
};

export const searchExerciseInjectsSimple = (exerciseId: Exercise['exercise_id'], input: SearchPaginationInput) => {
  const uri = `/api/exercises/${exerciseId}/injects/simple`;
  return simplePostCall(uri, input);
};

// -- SCENARIOS --

export const fetchScenarioInjectsSimple = (scenarioId: Scenario['scenario_id']) => (dispatch: Dispatch) => {
  const uri = `/api/scenarios/${scenarioId}/injects/simple`;
  return getReferential(schema.arrayOfInjects, uri)(dispatch);
};

export const searchScenarioInjectsSimple = (scenarioId: Scenario['scenario_id'], input: SearchPaginationInput) => {
  const uri = `/api/scenarios/${scenarioId}/injects/simple`;
  return simplePostCall(uri, input);
};
