import { useSelector } from 'react-redux';
import React, { ReactNode } from 'react';

import { useMessages } from 'fm3/l10nInjector';
import { RootState } from 'fm3/storeCreator';
interface State {
  error?: Error;
}

function Error() {
  const m = useMessages();

  const errorTicketId = useSelector(
    (state: RootState) => state.main.errorTicketId,
  );

  return m ? (
    <div
      style={{ padding: '10px' }}
      dangerouslySetInnerHTML={{
        __html: m.errorCatcher.html(errorTicketId ?? '???'),
      }}
    />
  ) : null;
}

export class ErrorCatcher extends React.Component<unknown, State> {
  state: State = {};

  componentDidCatch(error: Error): void {
    console.error(error);
    this.setState({ error });
  }

  render(): ReactNode {
    return this.state.error ? <Error /> : this.props.children;
  }
}
