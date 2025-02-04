import React, { FunctionComponent, useEffect } from 'react';
import { Button, Chip, TextField as MuiTextField, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { makeStyles } from '@mui/styles';
import type { InjectExpectationsStore } from '../../../../common/injects/expectations/Expectation';
import { useFormatter } from '../../../../../../components/i18n';
import { updateInjectExpectation } from '../../../../../../actions/Exercise';
import { useAppDispatch } from '../../../../../../utils/hooks';
import type { Theme } from '../../../../../../components/Theme';
import { zodImplement } from '../../../../../../utils/Zod';
import type { TeamsHelper } from '../../../../../../actions/teams/team-helper';
import type { UserHelper } from '../../../../../../actions/helper';
import { useHelper } from '../../../../../../store';
import type { Team, User } from '../../../../../../utils/api-types';
import { resolveUserName, truncate, computeLabel, computeColorStyle } from '../../../../../../utils/String';
import useDataLoader from '../../../../../../utils/hooks/useDataLoader';
import { fetchUsers } from '../../../../../../actions/User';
import { fetchTeams } from '../../../../../../actions/teams/team-actions';

const useStyles = makeStyles((theme: Theme) => ({
  marginTop_2: {
    marginTop: theme.spacing(2),
  },
  scoreAcc: {
    margin: 0,
  },
  buttons: {
    display: 'flex',
    placeContent: 'end',
    gap: theme.spacing(2),
  },
  chipInList: {
    height: 30,
    borderRadius: 4,
    textTransform: 'uppercase',
    width: 150,
    float: 'right',
  },
}));

interface FormProps {
  expectation: InjectExpectationsStore;
  onUpdate?: () => void;
  withSummary?: boolean;
}

const ManualExpectationsValidationForm: FunctionComponent<FormProps> = ({ expectation, onUpdate, withSummary = true }) => {
  const classes = useStyles();
  const { t } = useFormatter();
  const { teamsMap, usersMap }: {
    teamsMap: Record<string, Team>,
    usersMap: Record<string, User>
  } = useHelper((helper: TeamsHelper & UserHelper) => {
    return ({
      teamsMap: helper.getTeamsMap(),
      usersMap: helper.getUsersMap(),
    });
  });
  const dispatch = useAppDispatch();
  useDataLoader(() => {
    dispatch(fetchUsers());
    dispatch(fetchTeams());
  });
  const onSubmit = (data: { expectation_score: number }) => {
    dispatch(updateInjectExpectation(expectation.inject_expectation_id, {
      ...data,
      source_id: 'ui',
      source_type: 'ui',
      source_name: 'User input',
    })).then(() => {
      onUpdate?.();
    });
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<{ expectation_score: number }>({
    mode: 'onTouched',
    resolver: zodResolver(zodImplement<{ expectation_score: number }>().with({
      expectation_score: z.coerce.number(),
    })),
    defaultValues: {
      expectation_score: expectation.inject_expectation_score ?? expectation.inject_expectation_expected_score ?? 0,
    },
  });
  useEffect(() => {
    reset({
      expectation_score: expectation.inject_expectation_score ?? expectation.inject_expectation_expected_score ?? 0,
    });
  }, [expectation, reset]);

  const targetLabel = (expectationToProcess: InjectExpectationsStore) => {
    if (expectationToProcess.inject_expectation_user && usersMap[expectationToProcess.inject_expectation_user]) {
      return truncate(resolveUserName(usersMap[expectationToProcess.inject_expectation_user]), 22);
    }
    if (expectationToProcess.inject_expectation_team) {
      return teamsMap[expectationToProcess.inject_expectation_team]?.team_name;
    }
    return t('Unknown');
  };

  return (
    <div style={{ marginTop: 10 }}>
      <form id="expectationForm" onSubmit={handleSubmit(onSubmit)}>
        {withSummary && (<Chip
          classes={{ root: classes.chipInList }}
          style={computeColorStyle(expectation.inject_expectation_status)}
          label={t(computeLabel(expectation.inject_expectation_status))}
                         />)}
        {withSummary && (<Typography variant="h3">{expectation.inject_expectation_user ? t('Player') : t('Team')}</Typography>)}
        {withSummary && targetLabel(expectation)}
        <MuiTextField
          className={withSummary ? classes.marginTop_2 : classes.scoreAcc}
          variant="standard"
          fullWidth
          label={t('Score')}
          type="number"
          error={!!errors.expectation_score}
          helperText={errors.expectation_score && errors.expectation_score?.message ? errors.expectation_score?.message : `${t('Expected score:')} ${expectation.inject_expectation_expected_score}`}
          inputProps={register('expectation_score')}
        />
        <div className={classes.buttons}>
          <Button
            type="submit"
            disabled={isSubmitting}
            variant="contained"
          >
            {t('Validate')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ManualExpectationsValidationForm;
