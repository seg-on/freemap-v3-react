import * as at from 'fm3/actionTypes';
import { wsSend, rpcResponse, rpcEvent } from 'fm3/actions/websocketActions';

// TODO implement timeout

const callMap = new Map();
let id = 0;

export default ({ dispatch, getState }) => next => action => {
  const oldState = getState().websocket.state;

  next(action);

  const { state } = getState().websocket;
  if (oldState !== state) {
    if (state !== 1) {
      const values = callMap.values();
      callMap.clear();
      for (const call of values) {
        dispatch(
          rpcResponse({
            type: 'error',
            method: call.method,
            params: call.params,
            error: { code: -31000, message: 'connection closed' },
            tag: call.tag,
          }),
        );
      }
    }
  } else if (action.type === at.RPC_CALL) {
    id += 1;

    callMap.set(id, {
      method: action.payload.method,
      params: action.payload.params,
      tag: action.payload.tag,
    });

    dispatch(
      wsSend({
        message: {
          jsonrpc: '2.0',
          id,
          method: action.payload.method,
          params: action.payload.params,
        },
      }),
    );
  } else if (action.type === at.WS_RECEIVED) {
    let object;

    try {
      object = JSON.parse(action.payload);
    } catch {
      // ignore
    }

    if (object && object.jsonrpc === '2.0') {
      if (object.method && object.id === undefined) {
        dispatch(rpcEvent({ method: object.method, params: object.params }));
      } else if (object.id !== undefined && !object.method) {
        const call = callMap.get(object.id);

        if (call) {
          callMap.delete(object.id);
          dispatch(
            rpcResponse({
              type: 'result',
              method: call.method,
              params: call.params,
              result: object.result,
              error: object.error,
              tag: call.tag,
            }),
          );
        }
      }
    }
  }
};
