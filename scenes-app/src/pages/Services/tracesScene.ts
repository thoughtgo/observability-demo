import {
  EmbeddedScene,
  PanelBuilders,
  QueryVariable,
  SceneControlsSpacer,
  SceneFlexItem,
  SceneFlexLayout,
  SceneQueryRunner,
  SceneRefreshPicker,
  SceneTimePicker,
  SceneTimeRange,
  SceneVariableSet,
  VariableValueSelectors,
} from '@grafana/scenes';
import { TEMPO_DATASOURCE_REF, PROMETHEUS_DATASOURCE_REF } from '../../constants';

const clusters = new QueryVariable({
  name: 'cluster',
  datasource: PROMETHEUS_DATASOURCE_REF,
  query: 'label_values(http_server_request_duration_seconds_bucket, cluster)',
  includeAll: false,
  defaultToAll: false,
  isMulti: false,
});

export function tracesScene(service: string) {
  return new EmbeddedScene({
    $timeRange: new SceneTimeRange({
      from: 'now-5m',
      to: 'now',
    }),
    body: new SceneFlexLayout({
      direction: 'column',
      children: [
        new SceneFlexItem({
          height: 700,
          body: PanelBuilders.nodegraph()
            .setTitle('Node graph (upstream)')
            .setData(
              new SceneQueryRunner({
                datasource: TEMPO_DATASOURCE_REF,
                queries: [
                  {
                    refId: 'A',
                    serviceMapQuery: '{server="' + `${service}` + '", k8s_cluster_name="${cluster}"}',
                    limit: '20',
                    queryType: 'serviceMap',
                    tableType: 'traces',
                  },
                ],
              })
            )
            .build(),
        }),
        new SceneFlexItem({
          height: 700,
          body: PanelBuilders.nodegraph()
            .setTitle('Node graph (downstream)')
            .setData(
              new SceneQueryRunner({
                datasource: TEMPO_DATASOURCE_REF,
                queries: [
                  {
                    refId: 'A',
                    serviceMapQuery: '{client="' + `${service}` + '", k8s_cluster_name="${cluster}"}',
                    limit: '20',
                    queryType: 'serviceMap',
                    tableType: 'traces',
                  },
                ],
              })
            )
            .build(),
        }),
        new SceneFlexItem({
          height: 500,
          body: PanelBuilders.table()
            .setTitle('Traces (HTTP response status code > 399)')
            .setData(
              new SceneQueryRunner({
                datasource: TEMPO_DATASOURCE_REF,
                queries: [
                  {
                    refId: 'A',
                    query:
                      '{.service.name="' +
                      `${service}` +
                      '" && .http.response.status_code > 399 && .k8s.cluster.name="${cluster}"}',
                    limit: '100',
                    queryType: 'traceql',
                    tableType: 'traces',
                  },
                ],
              })
            )
            .build(),
        }),
      ],
    }),
    controls: [
      new VariableValueSelectors({}),
      new SceneControlsSpacer(),
      new SceneTimePicker({ isOnCanvas: true }),
      new SceneRefreshPicker({}),
    ],
    $variables: new SceneVariableSet({
      variables: [clusters],
    }),
  });
}
