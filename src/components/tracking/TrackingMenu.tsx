import React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { FontAwesomeIcon } from 'fm3/components/FontAwesomeIcon';
import Button from 'react-bootstrap/lib/Button';
import DropdownButton from 'react-bootstrap/lib/DropdownButton';
import MenuItem from 'react-bootstrap/lib/MenuItem';

import { setActiveModal } from 'fm3/actions/mainActions';
import { trackingActions } from 'fm3/actions/trackingActions';
import { withTranslator, Translator } from 'fm3/l10nInjector';
import { RootState } from 'fm3/storeCreator';
import { RootAction } from 'fm3/actions';

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> & {
    t: Translator;
  };

const TrackingMenuInt: React.FC<Props> = ({
  onTrackedDevicesClick,
  onMyDevicesClick,
  onVisualChange,
  visual,
  t,
}) => (
  <>
    <Button onClick={onTrackedDevicesClick}>
      <FontAwesomeIcon icon="eye" />
      <span className="hidden-md hidden-sm hidden-xs">
        {' '}
        {t('tracking.trackedDevices.button')}
      </span>
    </Button>{' '}
    <Button onClick={onMyDevicesClick}>
      <FontAwesomeIcon icon="mobile" />
      <span className="hidden-md hidden-sm hidden-xs">
        {' '}
        {t('tracking.devices.button')}
      </span>
    </Button>{' '}
    <DropdownButton
      id="tracking-visual-dropdown"
      title={t(`tracking.visual.${visual}`)}
    >
      <MenuItem eventKey="points" onSelect={onVisualChange}>
        {t('tracking.visual.points')}
      </MenuItem>
      <MenuItem eventKey="line" onSelect={onVisualChange}>
        {t('tracking.visual.line')}
      </MenuItem>
      <MenuItem eventKey="line+points" onSelect={onVisualChange}>
        {t('tracking.visual.line+points')}
      </MenuItem>
    </DropdownButton>
  </>
);

const mapStateToProps = (state: RootState) => ({
  visual:
    state.tracking.showLine && state.tracking.showPoints
      ? 'line+points'
      : state.tracking.showLine
      ? 'line'
      : state.tracking.showPoints
      ? 'points'
      : '???',
});

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) => ({
  onMyDevicesClick() {
    dispatch(setActiveModal('tracking-my'));
  },
  onTrackedDevicesClick() {
    dispatch(setActiveModal('tracking-watched'));
  },
  onVisualChange(visual: unknown) {
    switch (visual) {
      case 'line':
        dispatch(trackingActions.setShowPoints(false));
        dispatch(trackingActions.setShowLine(true));
        break;
      case 'points':
        dispatch(trackingActions.setShowPoints(true));
        dispatch(trackingActions.setShowLine(false));
        break;
      case 'line+points':
        dispatch(trackingActions.setShowPoints(true));
        dispatch(trackingActions.setShowLine(true));
        break;
      default:
        break;
    }
  },
});

export const TrackingMenu = connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslator(TrackingMenuInt));
