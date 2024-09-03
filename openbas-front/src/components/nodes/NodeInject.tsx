import React, { memo } from 'react';
import { Handle, NodeProps, Position, Node, OnConnect } from '@xyflow/react';
import { makeStyles, useTheme } from '@mui/styles';
import { Tooltip } from '@mui/material';
import moment from 'moment';
import type { Theme } from '../Theme';
import { isNotEmptyField } from '../../utils/utils';
import InjectIcon from '../../admin/components/common/injects/InjectIcon';
import InjectPopover from '../../admin/components/common/injects/InjectPopover';
import type { InjectOutputType } from '../../actions/injects/Inject';

// Deprecated - https://mui.com/system/styles/basics/
// Do not use it for new code.
const useStyles = makeStyles<Theme>((theme) => ({
  node: {
    position: 'relative',
    border:
      theme.palette.mode === 'dark'
        ? '1px solid rgba(255, 255, 255, 0.12)'
        : '1px solid rgba(0, 0, 0, 0.12)',
    borderRadius: 4,
    width: 240,
    minHeight: '100px',
    height: 'auto',
    padding: '8px 5px 5px 5px',
    zIndex: 10,
  },
  icon: {
    textAlign: 'left',
    margin: '10px 0 0px 5px',
  },
  popover: {
    textAlign: 'right',
    width: 'md',
  },
  triggerTime: {
    textAlign: 'right',
    margin: '10px 0 0px 5px',
    position: 'absolute',
    top: '10px',
    right: '10px',
    color: '#7d8188',
  },
  label: {
    margin: '0 0 0 5px',
    textAlign: 'left',
    fontSize: 15,
    whiteSpace: 'auto',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    height: '40px',

  },
  targets: {
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
    margin: '0 0 0 5px',
    textAlign: 'left',
    fontSize: 12,
    whiteSpace: 'auto',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    p: 1,
    m: 1,
  },
}));

export type NodeInject = Node<{
  background?: string,
  color?: string,
  key: string,
  label: string,
  description?: string,
  isTargeted?: boolean,
  isTargeting?: boolean,
  onConnectInjects?: OnConnect
  inject?: InjectOutputType,
  fixedY?: number,
  startDate?: string,
  targets: string[],
  exerciseOrScenarioId: string,
  onSelectedInject(inject?: InjectOutputType): void,
}

>;

/**
 * The node used to represent an inject
 * @param data the props used
 * @constructor
 */
const NodeInjectComponent = ({ data }: NodeProps<NodeInject>) => {
  const classes = useStyles();
  const theme: Theme = useTheme();

  /**
   * Converts the duration in second to a string representing the relative time
   * @param durationInSeconds the duration in seconds
   */
  const convertToRelativeTime = (durationInSeconds: number) => {
    const date = moment.utc(moment.duration(0, 'd').add(durationInSeconds, 's').asMilliseconds());
    return `${date.dayOfYear() - 1} d, ${date.hour()} h, ${date.minute()} m`;
  };

  /**
   * Converts the duration in second and a start date into an absolute time
   * @param startDate the start date
   * @param durationInSeconds the duration in seconds
   */
  const convertToAbsoluteTime = (startDate: string, durationInSeconds: number) => {
    return moment.utc(startDate)
      .add(durationInSeconds, 's')
      .add(-new Date().getTimezoneOffset() / 60, 'h')
      .format('MMMM Do, YYYY - h:mmA');
  };

  /**
   * Actions on click on the node
   */
  const onClick = () => {
    if (data.inject) data.onSelectedInject(data.inject);
  };

  /**
   * Prevent click to avoid double actions to be raised
   * @param event the event to prevent
   */
  const preventClick = (event: React.MouseEvent) => {
    event.stopPropagation();
  };

  /**
   * Actions if a node is selected (clicked)
   */
  const selectedInject = () => {
    if (data.inject) data.onSelectedInject(data.inject);
  };

  const isDisabled = !data.inject?.inject_injector_contract.injector_contract_content_parsed?.config.expose;

  let borderLeftColor = theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)';
  if (!data.inject?.inject_enabled) {
    borderLeftColor = theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)';
  }

  return (
    <div className={classes.node} style={{
      backgroundColor: data.background,
      color: 'white',
      borderLeftColor,
    }} onClick={onClick}
    >
      <div className={classes.icon} style={{ opacity: data.inject?.inject_enabled ? '1' : '0.3' }}>
        <InjectIcon
          isPayload={isNotEmptyField(data.inject?.inject_injector_contract?.injector_contract_payload)}
          type={
            data.inject?.inject_injector_contract?.injector_contract_payload
              ? data.inject?.inject_injector_contract?.injector_contract_payload?.payload_collector_type
                  || data.inject?.inject_injector_contract?.injector_contract_payload?.payload_type
              : data.inject?.inject_type
            }
        />
      </div>
      { data.startDate !== undefined ? (
        <div
          className={classes.triggerTime}
          style={{ opacity: data.inject?.inject_enabled ? '1' : '0.3' }}
        >{convertToAbsoluteTime(data.startDate, data.inject!.inject_depends_duration)}</div>

      ) : (
        <div
          className={classes.triggerTime}
          style={{ opacity: data.inject?.inject_enabled ? '1' : '0.3' }}
        >{convertToRelativeTime(data.inject!.inject_depends_duration)}</div>

      )}
      <Tooltip title={data.label} style={{ opacity: data.inject?.inject_enabled ? '1' : '0.3' }}>
        <div className={classes.label}>{data.label}</div>
      </Tooltip>
      <div className={classes.footer}>
        <Tooltip title={`${data.targets.slice(0, 3).join(', ')}`}>
          <div className={classes.targets} style={{ opacity: data.inject?.inject_enabled ? '1' : '0.3' }}>
            <span>{`${data.targets.slice(0, 3).join(', ')}${data.targets.length > 3 ? ', ...' : ''}`}</span>
          </div>
        </Tooltip>
        <div className={classes.popover}>
          <span onClick={preventClick}>
            <InjectPopover
              inject={data.inject!}
              setSelectedInjectId={selectedInject}
              canBeTested={data.inject?.inject_testable}
              isDisabled={isDisabled}
              exerciseOrScenarioId={data.exerciseOrScenarioId}
            />
          </span>
        </div>

      </div>
      {(data.isTargeted ? (
        <Handle type="target" id={`target-${data.key}`} position={Position.Left} isConnectable={true}
          onConnect={data.onConnectInjects}
        />) : null)}
      {(data.isTargeting ? (
        <Handle type="source" id={`source-${data.key}`} position={Position.Right} isConnectable={true}
          onConnect={data.onConnectInjects}
        />) : null)}
    </div>
  );
};

export default memo(NodeInjectComponent);
