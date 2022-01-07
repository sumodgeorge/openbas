import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Form } from 'react-final-form';
import Button from '@mui/material/Button';
import { TextField } from '../../../components/TextField';
import inject18n from '../../../components/i18n';

class ExerciseParametersForm extends Component {
  validate(values) {
    const { t } = this.props;
    const errors = {};
    const requiredFields = ['exercise_mail_from'];
    requiredFields.forEach((field) => {
      if (!values[field]) {
        errors[field] = t('This field is required.');
      }
    });
    return errors;
  }

  render() {
    const { t, onSubmit, initialValues } = this.props;
    return (
      <Form
        keepDirtyOnReinitialize={true}
        initialValues={initialValues}
        onSubmit={onSubmit}
        validate={this.validate.bind(this)}
        mutators={{
          setValue: ([field, value], state, { changeValue }) => {
            changeValue(state, field, () => value);
          },
        }}
      >
        {({ handleSubmit, submitting, pristine }) => (
          <form id="exerciseParametersForm" onSubmit={handleSubmit}>
            <TextField
              variant="standard"
              name="exercise_mail_from"
              fullWidth={true}
              label={t('Mail sender address')}
            />
            <TextField
              variant="standard"
              name="exercise_message_header"
              fullWidth={true}
              multiline={true}
              rows={2}
              label={t('Messages header')}
              style={{ marginTop: 20 }}
            />
            <TextField
              variant="standard"
              name="exercise_message_footer"
              fullWidth={true}
              multiline={true}
              rows={2}
              label={t('Messages footer')}
              style={{ marginTop: 20 }}
            />
            <div style={{ float: 'right', marginTop: 20 }}>
              <Button
                variant="contained"
                color="primary"
                type="submit"
                disabled={pristine || submitting}
              >
                {t('Update')}
              </Button>
            </div>
          </form>
        )}
      </Form>
    );
  }
}

ExerciseParametersForm.propTypes = {
  t: PropTypes.func,
  onSubmit: PropTypes.func.isRequired,
};

export default inject18n(ExerciseParametersForm);
