import produce from 'immer';
import { createReducer } from 'typesafe-actions';
import { RootAction } from 'fm3/actions';
import {
  clearMap,
  deleteFeature,
  selectFeature,
} from 'fm3/actions/mainActions';
import {
  drawingLineAddPoint,
  drawingLineUpdatePoint,
  drawingLineSetLines,
  Line,
} from 'fm3/actions/drawingLineActions';
import { mapsDataLoaded } from 'fm3/actions/mapsActions';

export interface DrawingLinesState {
  lines: Line[];
}

export const initialState: DrawingLinesState = {
  lines: [],
};

export const drawingLinesReducer = createReducer<DrawingLinesState, RootAction>(
  initialState,
)
  .handleAction(clearMap, () => initialState)
  .handleAction(selectFeature, (state) => ({
    ...state,
    lines: state.lines.filter(linefilter),
  }))
  .handleAction(drawingLineAddPoint, (state, action) =>
    produce(state, (draft) => {
      let line: Line;

      if (action.payload.index == null) {
        if (action.payload.type === undefined) {
          throw new Error();
        }

        line = { type: action.payload.type, points: [] };
        draft.lines.push(line);
      } else {
        line = draft.lines[action.payload.index];
      }

      line.points.splice(
        action.payload.position === undefined
          ? line.points.length
          : action.payload.position,
        0,
        action.payload.point,
      );
    }),
  )
  .handleAction(
    drawingLineUpdatePoint,
    (state, { payload: { index, point } }) =>
      produce(state, (draft) => {
        const p = draft.lines[index].points.find((pt) => pt.id === point.id);
        if (p) {
          Object.assign(p, point);
        }
      }),
  )
  .handleAction(drawingLineSetLines, (state, action) => ({
    ...state,
    lines: action.payload.filter(linefilter),
  }))
  .handleAction(deleteFeature, (state, action) =>
    produce(state, (draft) => {
      const selection = action.payload;
      if (
        (selection.type === 'draw-lines' ||
          selection.type === 'draw-polygons') &&
        selection.id !== undefined
      ) {
        if (selection.pointIndex == null) {
          draft.lines.splice(selection.id, 1);
        } else {
          const line = draft.lines[selection.id];

          const pidx = line.points.findIndex(
            (point) => point.id === selection.pointIndex,
          );

          draft.lines.push({
            type: line.type,
            label: line.label,
            points: line.points.slice(0, pidx + 1),
          });

          line.points.splice(0, pidx);
        }
      }
    }),
  )
  .handleAction(mapsDataLoaded, (_state, action) => {
    return {
      lines: (action.payload.lines ?? initialState.lines).map((line) => ({
        ...line,
        type:
          // compatibility
          (line.type as any) === 'area'
            ? 'polygon'
            : (line.type as any) === 'distance'
            ? 'line'
            : line.type,
      })),
    };
  });

function linefilter(line: Line) {
  return (
    (line.type === 'line' && line.points.length > 1) ||
    (line.type === 'polygon' && line.points.length > 2)
  );
}
