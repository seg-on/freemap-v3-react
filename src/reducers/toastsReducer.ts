import { RootAction } from 'fm3/actions';
import {
  ResolvedToast,
  toastsAdd,
  toastsRemove,
} from 'fm3/actions/toastsActions';
import { createReducer } from 'typesafe-actions';

export interface ToastsState {
  toasts: ResolvedToast[];
}

const initialState: ToastsState = {
  toasts: [],
};

export const toastsReducer = createReducer<ToastsState, RootAction>(
  initialState,
)
  .handleAction(toastsAdd, (state, action) => {
    const { id } = action.payload;

    const toast = state.toasts.find((t) => t.id === id);

    if (toast) {
      return {
        ...state,
        toasts: [
          ...state.toasts.filter((t) => t.id !== toast.id),
          action.payload,
        ],
      };
    }

    return { ...state, toasts: [...state.toasts, action.payload] };
  })
  .handleAction(toastsRemove, (state, action) => ({
    ...state,
    toasts: state.toasts.filter(({ id }) => id !== action.payload),
  }));
