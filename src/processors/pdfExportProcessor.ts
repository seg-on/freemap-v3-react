import { getMapLeafletElement } from 'fm3/leafletElementHolder';
import { setActiveModal, exportPdf } from 'fm3/actions/mainActions';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import qs from 'query-string';

export const exportPdfProcessor: Processor<typeof exportPdf> = {
  actionCreator: exportPdf,
  handle: async ({ dispatch, getState, action }) => {
    const le = getMapLeafletElement();
    if (!le) {
      return;
    }

    const {
      scale,
      area,
      shadedRelief,
      contours,
      hikingTrails,
      bicycleTrails,
      skiTrails,
      horseTrails,
      format,
    } = action.payload;

    let w: number | undefined = undefined;
    let n: number | undefined = undefined;
    let e: number | undefined = undefined;
    let s: number | undefined = undefined;

    if (area === 'visible') {
      const bounds = le.getBounds();
      w = bounds.getWest();
      n = bounds.getNorth();
      e = bounds.getEast();
      s = bounds.getSouth();
    } else {
      // infopoints
      for (const { lat, lon } of getState().infoPoint.points) {
        w = Math.min(w === undefined ? 1000 : w, lon);
        n = Math.max(n === undefined ? -1000 : n, lat);
        e = Math.max(e === undefined ? -1000 : e, lon);
        s = Math.min(s === undefined ? 1000 : s, lat);
      }
    }

    const query = qs.stringify({
      zoom: getState().map.zoom,
      bbox: `${w},${s},${e},${n}`,
      scale,
      hikingTrails,
      bicycleTrails,
      skiTrails,
      horseTrails,
      shading: shadedRelief,
      contours,
      format,
    });

    window.open(`https://outdoor.tiles.freemap.sk/export?${query}`);

    dispatch(setActiveModal(null));
  },
};
