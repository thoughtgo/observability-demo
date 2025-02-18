import { EmbeddedScene, SceneAppPage, SceneFlexLayout } from '@grafana/scenes';
import { ROUTES } from '../../constants';
import { prefixRoute } from '../../utils/utils.routing';
import { servicesScene } from './servicesScene';
import { metricsScene } from './metricsScene';
import { tracesScene } from './tracesScene';
import { logsScene } from './logsScene';

export const servicesPage = new SceneAppPage({
  title: 'Services',
  subTitle: 'Services overview',
  url: prefixRoute(ROUTES.Services),
  hideFromBreadcrumbs: true,
  getScene: servicesScene,
  tabs: [
    new SceneAppPage({
      title: 'Services',
      url: prefixRoute(ROUTES.Services),
      getScene: servicesScene,
    }),
  ],
  drilldowns: [
    {
      routePath: `${prefixRoute(ROUTES.Services)}/service/:service`,
      getPage(routeMatch, parent) {
        const service = routeMatch.params.service;
        return new SceneAppPage({
          url: `${prefixRoute(ROUTES.Services)}/service/${service}`,
          title: 'Service overview',
          subTitle: 'Metrics, Traces & Logs',
          getParentPage: () => parent,
          getScene: () => {
            return new EmbeddedScene({ body: new SceneFlexLayout({ children: [] }) });
          },
          tabs: [
            new SceneAppPage({
              title: 'Metrics',
              url: `${prefixRoute(ROUTES.Services)}/service/${service}/metrics`,
              getScene: () => metricsScene(service),
            }),
            new SceneAppPage({
              title: 'Traces',
              url: `${prefixRoute(ROUTES.Services)}/service/${service}/traces`,
              getScene: () => tracesScene(service),
            }),
            new SceneAppPage({
              title: 'Logs',
              url: `${prefixRoute(ROUTES.Services)}/service/${service}/logs`,
              getScene: () => logsScene(service),
            }),
          ],
        });
      },
    },
  ],
});
