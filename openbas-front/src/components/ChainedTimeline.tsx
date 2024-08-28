import React, { FunctionComponent, useContext, useEffect, useState } from 'react';
import { makeStyles, useTheme } from '@mui/styles';
import {
  MarkerType,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  Connection,
  Edge,
  useReactFlow,
  Viewport,
  XYPosition,
  Controls,
  ControlButton,
} from '@xyflow/react';
import moment from 'moment-timezone';
import { UnfoldLess, UnfoldMore } from '@mui/icons-material';
import type { InjectStore } from '../actions/injects/Inject';
import type { Theme } from './Theme';
import nodeTypes from './nodes';
import CustomTimelineBackground from './CustomTimelineBackground';
import { NodeInject } from './nodes/NodeInject';
import CustomTimelinePanel from './CustomTimelinePanel';
import { InjectContext } from '../admin/components/common/Context';
import { useHelper } from '../store';
import type { InjectHelper } from '../actions/injects/inject-helper';
import type { ScenariosHelper } from '../actions/scenarios/scenario-helper';
import type { ExercisesHelper } from '../actions/exercises/exercise-helper';
import { parseCron } from '../utils/Cron';
import type { TeamsHelper } from '../actions/teams/team-helper';
import NodePhantom from './nodes/NodePhantom';

const useStyles = makeStyles(() => ({
  container: {
    marginTop: 30,
    paddingRight: 40,
  },
  rotatedIcon: {
    transform: 'rotate(90deg)',
  },
  newBox: {
    position: 'relative',
    zIndex: 1,
    pointerEvents: 'none',
    cursor: 'none',
  },
}));

interface Props {
  injects: InjectStore[],
  exerciseOrScenarioId: string,
  onConnectInjects(connection: Connection): void,
  onSelectedInject(inject?: InjectStore): void,
  openCreateInjectDrawer(data: {
    inject_depends_duration_days: number,
    inject_depends_duration_minutes: number,
    inject_depends_duration_hours: number
  }): void,
}

const ChainedTimelineFlow: FunctionComponent<Props> = ({ injects, exerciseOrScenarioId, onConnectInjects, onSelectedInject, openCreateInjectDrawer }) => {
  // Standard hooks
  const classes = useStyles();
  const minutesPerGapAllowed = [5, 20, 20 * 12, 20 * 24];
  const gapSize = 125;
  const theme = useTheme<Theme>();
  const [nodes, setNodes, onNodesChange] = useNodesState<NodeInject>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [draggingOnGoing, setDraggingOnGoing] = useState<boolean>(false);
  const [viewportData, setViewportData] = useState<Viewport>();
  const [minutesPerGapIndex, setMinutesPerGapIndex] = useState<number>(0);
  const [currentUpdatedNode, setCurrentUpdatedNode] = useState<NodeInject | null>(null);
  const [currentMousePosition, setCurrentMousePosition] = useState<XYPosition>({ x: 0, y: 0 });
  const [newNodeCursorVisibility, setNewNodeCursorVisibility] = useState<'visible' | 'hidden'>('visible');
  const [newNodeCursorClickable, setNewNodeCursorClickable] = useState<boolean>(true);
  const [currentMouseTime, setCurrentMouseTime] = useState<string>('');

  let timer: NodeJS.Timeout;
  const injectContext = useContext(InjectContext);

  const reactFlow = useReactFlow();

  const injectsMap = useHelper((injectHelper: InjectHelper) => injectHelper.getInjectsMap());
  const teams = useHelper((teamsHelper: TeamsHelper) => teamsHelper.getTeamsMap());
  const scenario = useHelper((helper: ScenariosHelper) => helper.getScenario(exerciseOrScenarioId));
  const exercise = useHelper((helper: ExercisesHelper) => helper.getExercise(exerciseOrScenarioId));

  let startDate: string | undefined;

  if (scenario !== undefined) {
    const parsedCron = scenario.scenario_recurrence ? parseCron(scenario.scenario_recurrence) : null;
    startDate = scenario?.scenario_recurrence_start ? scenario?.scenario_recurrence_start : exercise?.exercise_start_date;
    if (startDate !== undefined) {
      startDate = moment(startDate).utc().hour(parsedCron!.h).minute(parsedCron!.m)
        .second(parsedCron!.m)
        .format();
    }
  }

  const convertCoordinatesToTime = (position: XYPosition) => {
    return Math.round(((position.x) / (gapSize / minutesPerGapAllowed[minutesPerGapIndex])) * 60);
  };

  const calculateInjectPosition = (nodeInjects: NodeInject[]) => {
    nodeInjects.forEach((nodeInject, index) => {
      let row = 0;
      let doItAgain = false;
      const nodeInjectPosition = nodeInject.position;
      const nodeInjectData = nodeInject.data;
      do {
        const previousNodes = nodeInjects.slice(0, index)
          .filter((previousNode) => nodeInject.position.x >= previousNode.position.x && nodeInject.position.x < previousNode.position.x + 240);

        for (let i = 0; i < previousNodes.length; i += 1) {
          const previousNode = previousNodes[i];
          if (previousNode.position.y + 150 > row * 150 && previousNode.position.y <= row * 150) {
            row += 1;
            doItAgain = true;
          } else {
            nodeInjectPosition.y = 150 * row;
            nodeInjectData.fixedY = nodeInject.position.y;
            doItAgain = false;
          }
        }
      } while (doItAgain);
    });
  };

  const updateNodes = () => {
    if (injects.length > 0) {
      const injectsNodes = injects
        .sort((a, b) => a.inject_depends_duration - b.inject_depends_duration)
        .map((inject: InjectStore) => ({
          id: `${inject.inject_id}`,
          type: 'inject',
          data: {
            key: inject.inject_id,
            label: inject.inject_title,
            color: 'green',
            background: '#09101e',
            onConnectInjects,
            isTargeted: false,
            isTargeting: false,
            inject,
            fixedY: 0,
            startDate,
            onSelectedInject,
            targets: inject.inject_assets!.map((asset) => asset.asset_name)
              .concat(inject.inject_asset_groups!.map((assetGroup) => assetGroup.asset_group_name))
              .concat(inject.inject_teams!.map((team) => teams[team]?.team_name)),
          },
          position: {
            x: (inject.inject_depends_duration / 60) * (gapSize / minutesPerGapAllowed[minutesPerGapIndex]),
            y: 0,
          },
        }));

      if (currentUpdatedNode !== null) {
        injectsNodes.find((inject) => inject.id === currentUpdatedNode.id)!.position.x = currentUpdatedNode.position.x;
      }

      setCurrentUpdatedNode(null);
      setTimeout(() => setDraggingOnGoing(false), 500);
      calculateInjectPosition(injectsNodes);
      setNodes(injectsNodes);
      setEdges(injects.filter((inject) => inject.inject_depends_on != null).map((inject) => {
        return ({
          id: `${inject.inject_id}->${inject.inject_depends_on}`,
          source: `${inject.inject_id}`,
          sourceHandle: `source-${inject.inject_id}`,
          target: `${inject.inject_depends_on}`,
          targetHandle: `target-${inject.inject_depends_on}`,
          label: '',
          labelShowBg: false,
          labelStyle: { fill: theme.palette.text?.primary, fontSize: 9 },
        });
      }));
    }
  };

  useEffect(() => {
    updateNodes();
  }, [injects, minutesPerGapIndex]);

  const proOptions = { account: 'paid-pro', hideAttribution: true };
  const defaultEdgeOptions = {
    type: 'straight',
    markerEnd: { type: MarkerType.ArrowClosed },
  };

  const nodeDragStop = (event: React.MouseEvent, node: NodeInject) => {
    const injectFromMap = injectsMap[node.id];
    if (injectFromMap !== undefined) {
      const inject = {
        inject_id: node.id,
        inject_title: injectFromMap.inject_title,
        inject_depends_duration: convertCoordinatesToTime(node.position),
        inject_created_at: injectFromMap.inject_created_at,
        inject_updated_at: injectFromMap.inject_updated_at,
      };
      injectContext.onUpdateInject(node.id, inject);
      setCurrentUpdatedNode(node);
    }
  };

  const nodeDragStart = () => {
    clearTimeout(timer);
    const nodesList = nodes.filter((currentNode) => currentNode.type !== 'phantom');
    setNodes(nodesList);
  };

  const horizontalNodeDrag = (event: React.MouseEvent, node: NodeInject) => {
    setDraggingOnGoing(true);
    const { position } = node;
    const { data } = node;

    if (node.data.fixedY !== undefined) {
      position.y = node.data.fixedY;
      if (data.inject) data.inject.inject_depends_duration = convertCoordinatesToTime(node.position);
    }
  };

  const onNodePhantomClick = (event: React.MouseEvent) => {
    if (newNodeCursorClickable) {
      const position = reactFlow.screenToFlowPosition({ x: event.clientX - 25, y: event.clientY });

      const totalMinutes = position.x > 0
        ? moment.duration((position.x / gapSize) * minutesPerGapAllowed[minutesPerGapIndex] * 60, 's')
        : moment.duration(0);
      openCreateInjectDrawer({
        inject_depends_duration_days: totalMinutes.days(),
        inject_depends_duration_hours: totalMinutes.hours(),
        inject_depends_duration_minutes: totalMinutes.minutes(),
      });
    }
  };

  const onMouseMove = (eventMove: React.MouseEvent) => {
    clearTimeout(timer);
    if (!draggingOnGoing) {
      const position = reactFlow.screenToFlowPosition({ x: eventMove.clientX, y: eventMove.clientY }, { snapToGrid: false });
      const sidePosition = reactFlow.screenToFlowPosition({ x: eventMove.clientX - 25, y: eventMove.clientY }, { snapToGrid: false });

      const viewPort = reactFlow.getViewport();
      setCurrentMousePosition({ x: ((position.x * reactFlow.getZoom()) + viewPort.x - 25), y: ((position.y * reactFlow.getZoom()) + viewPort.y - 25) });

      if (startDate === undefined) {
        const momentOfTime = moment.utc(
          moment.duration(convertCoordinatesToTime(
            { x: sidePosition.x > 0 ? sidePosition.x : 0, y: sidePosition.y },
          ), 's').asMilliseconds(),
        );

        setCurrentMouseTime(`${momentOfTime.dayOfYear() - 1} d, ${momentOfTime.hour()} h, ${momentOfTime.minute()} m`);
      } else {
        const momentOfTime = moment.utc(startDate)
          .add(-new Date().getTimezoneOffset() / 60, 'h')
          .add(convertCoordinatesToTime({ x: sidePosition.x > 0 ? sidePosition.x : 0, y: sidePosition.y }), 's');

        setCurrentMouseTime(momentOfTime.format('MMMM Do, YYYY - h:mmA'));
      }
    }
  };

  const panTimeline = (_event: MouseEvent | TouchEvent | null, viewport: Viewport) => {
    setViewportData(viewport);
  };

  const nodeMouseEnter = () => {
    setNewNodeCursorVisibility('hidden');
    setNewNodeCursorClickable(false);
  };

  const nodeMouseLeave = () => {
    setNewNodeCursorVisibility('visible');
    setNewNodeCursorClickable(true);
  };

  const updateMinutesPerGap = (incrementIndex: number) => {
    clearTimeout(timer);
    const nodesList = nodes.filter((currentNode) => currentNode.type !== 'phantom');
    setNodes(nodesList);
    setDraggingOnGoing(true);
    setMinutesPerGapIndex(minutesPerGapIndex + incrementIndex);
    setDraggingOnGoing(false);
  };

  return (
    <>
      {injects.length > 0 ? (
        <div className={classes.container} style={{ width: '100%', height: 350 }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            nodesDraggable={true}
            nodesConnectable={false}
            nodesFocusable={false}
            elementsSelectable={false}
            onNodeDrag={horizontalNodeDrag}
            onNodeDragStop={nodeDragStop}
            onNodeDragStart={nodeDragStart}
            onNodeMouseEnter={nodeMouseEnter}
            onNodeMouseLeave={nodeMouseLeave}
            defaultEdgeOptions={defaultEdgeOptions}
            onMouseMove={onMouseMove}
            onMove={panTimeline}
            proOptions={proOptions}
            translateExtent={[[-60, -50], [Infinity, Infinity]]}
            nodeExtent={[[0, 0], [Infinity, Infinity]]}
            defaultViewport={{ x: 60, y: 50, zoom: 0.75 }}
            minZoom={0.3}
            onClick={onNodePhantomClick}
          >
            <div className={classes.newBox}
              style={{
                top: currentMousePosition.y,
                left: currentMousePosition.x,
                visibility: newNodeCursorVisibility,
              }}
            >
              <NodePhantom
                time={currentMouseTime}
              />
            </div>
            <div
              onMouseEnter={nodeMouseEnter}
              onMouseLeave={nodeMouseLeave}
            >
              <Controls
                showFitView={true}
                showZoom={false}
                showInteractive={false}
                fitViewOptions={{ duration: 500 }}
                orientation={'horizontal'}
              >
                <ControlButton
                  disabled={minutesPerGapAllowed.length - 1 === minutesPerGapIndex}
                  onClick={() => updateMinutesPerGap(1)}
                >
                  <UnfoldLess className={classes.rotatedIcon}/>
                </ControlButton>
                <ControlButton
                  disabled={minutesPerGapIndex === 0}
                  onClick={() => updateMinutesPerGap(-1)}
                >
                  <UnfoldMore className={classes.rotatedIcon}/>
                </ControlButton>
              </Controls>
            </div>
            <CustomTimelineBackground
              gap={gapSize}
              minutesPerGap={minutesPerGapAllowed[minutesPerGapIndex]}
            />
            <CustomTimelinePanel
              gap={gapSize}
              minutesPerGap={minutesPerGapAllowed[minutesPerGapIndex]}
              viewportData={viewportData}
              startDate={startDate}
            />
          </ReactFlow>
        </div>
      ) : null
      }
    </>
  );
};

const ChainedTimeline: FunctionComponent<Props> = (props) => {
  return (
    <>
      <ReactFlowProvider>
        <ChainedTimelineFlow {...props} />
      </ReactFlowProvider>
    </>
  );
};

export default ChainedTimeline;
