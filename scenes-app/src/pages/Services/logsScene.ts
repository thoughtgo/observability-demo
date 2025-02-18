import {
  AdHocFiltersVariable,
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
  TextBoxVariable,
  VariableValueSelectors,
} from '@grafana/scenes';
import { LOKI_DATASOURCE_REF, PROMETHEUS_DATASOURCE_REF } from '../../constants';
import { LogsDedupStrategy, LogsSortOrder } from '@grafana/schema';

const clusters = new QueryVariable({
  name: 'cluster',
  datasource: PROMETHEUS_DATASOURCE_REF,
  query: 'label_values(http_server_request_duration_seconds_bucket, cluster)',
  includeAll: false,
  defaultToAll: false,
  isMulti: false,
});

const filtersVar = new AdHocFiltersVariable({
  name: 'Filters',
  datasource: LOKI_DATASOURCE_REF,
});

const search = new TextBoxVariable({
  name: 'search',
});

export function logsScene(service: string) {
  return new EmbeddedScene({
    $timeRange: new SceneTimeRange({
      from: 'now-1h',
      to: 'now',
    }),
    body: new SceneFlexLayout({
      direction: 'column',
      children: [
        new SceneFlexItem({
          height: 700,
          body: PanelBuilders.logs()
            .setTitle('Logs')
            .setData(
              new SceneQueryRunner({
                datasource: LOKI_DATASOURCE_REF,
                queries: [
                  {
                    refId: 'A',
                    expr: '{app="' + `${service}` + '", cluster="${cluster}"} |= `${search}`',
                  },
                ],
              })
            )
            .setOption('showTime', true)
            .setOption('showLabels', false)
            .setOption('showCommonLabels', false)
            .setOption('wrapLogMessage', true)
            .setOption('prettifyLogMessage', false)
            .setOption('enableLogDetails', true)
            .setOption('dedupStrategy', LogsDedupStrategy.none)
            .setOption('sortOrder', LogsSortOrder.Descending)
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
      variables: [clusters, search, filtersVar],
    }),
  });
}
