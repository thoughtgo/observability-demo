import { PROMETHEUS_DATASOURCE_REF } from '../../constants';
import {
  EmbeddedScene,
  PanelBuilders,
  QueryRunnerState,
  QueryVariable,
  SceneByVariableRepeater,
  SceneFlexItem,
  SceneFlexLayout,
  SceneQueryRunner,
  SceneRefreshPicker,
  SceneTimePicker,
  SceneTimeRange,
  SceneVariableSet,
  VariableValueOption,
  VariableValueSelectors,
} from '@grafana/scenes';

const clusters = new QueryVariable({
  name: 'cluster',
  datasource: PROMETHEUS_DATASOURCE_REF,
  query: 'label_values(http_server_request_duration_seconds_bucket, cluster)',
  includeAll: false,
  defaultToAll: false,
  isMulti: false,
});

const services = new QueryVariable({
  name: 'service',
  datasource: PROMETHEUS_DATASOURCE_REF,
  query: 'label_values(http_server_request_duration_seconds_bucket, service_name)',
  includeAll: true,
  defaultToAll: true,
  isMulti: true,
});

export function servicesScene() {
  const scene = new EmbeddedScene({
    $timeRange: new SceneTimeRange({ from: 'now-5m', to: 'now' }),
    controls: [new VariableValueSelectors({}), new SceneTimePicker({ isOnCanvas: true }), new SceneRefreshPicker({})],
    $variables: new SceneVariableSet({
      variables: [clusters, services],
    }),
    body: new SceneByVariableRepeater({
      variableName: 'service',
      body: new SceneFlexLayout({
        direction: 'column',
        children: [],
      }),
      getLayoutChild: (option) => getServices(option),
    }),
  });
  return scene;
}

function runQuery(overrides?: Partial<any>, queryRunnerOverrides?: Partial<QueryRunnerState>) {
  return new SceneQueryRunner({
    queries: [
      {
        refId: 'A',
        datasource: PROMETHEUS_DATASOURCE_REF,
        ...overrides,
      },
    ],
    ...queryRunnerOverrides,
  });
}

function getServices(option: VariableValueOption) {
  return new SceneFlexLayout({
    height: 200,
    children: [
      new SceneFlexItem({
        width: '15%',
        body: PanelBuilders.text()
          .setOption(
            'content',
            '[' +
              `${option.value}` +
              '](${__url.path}/service/' +
              `${option.value}` +
              '${__url.params:exclude:var-service}&var-service=' +
              `${option.value}` +
              ')'
          )
          .build(),
      }),
      new SceneFlexItem({
        body: PanelBuilders.timeseries()
          .setTitle('Duration')
          .setDecimals(2)
          .setUnit('s')
          .setCustomFieldConfig('spanNulls', true)
          .setCustomFieldConfig('lineWidth', 3)
          .setCustomFieldConfig('fillOpacity', 65)
          .setData(
            runQuery({
              expr:
                'histogram_quantile(0.95, sum(rate(http_server_request_duration_seconds_bucket{service_name="' +
                `${option.value}` +
                '", cluster="${cluster}"}[$__rate_interval])) by (service_name, le))',
            })
          )
          .build(),
      }),
      new SceneFlexItem({
        body: PanelBuilders.timeseries()
          .setTitle('Request rate')
          .setUnit('req/s')
          .setData(
            runQuery({
              expr:
                'sum(rate(http_server_request_duration_seconds_count{service_name="' +
                `${option.value}` +
                '", cluster="${cluster}"} [$__rate_interval])) by (http_response_status_code)',
            })
          )
          .build(),
      }),
      new SceneFlexItem({
        body: PanelBuilders.timeseries()
          .setTitle('Error rate')
          .setUnit('percentunit')
          .setDecimals(2)
          .setMin(0)
          .setMax(1)
          .setData(
            runQuery({
              expr:
                'sum by (http_response_status_code) (rate(http_server_request_duration_seconds_count{service_name="' +
                `${option.value}` +
                '", cluster="${cluster}", http_response_status_code=~"(4|5).*"}[$__rate_interval]))' +
                ' / ignoring(http_response_status_code) group_left sum(rate(http_server_request_duration_seconds_count{service_name="' +
                `${option.value}` +
                '", cluster="${cluster}"}[$__rate_interval]))',
            })
          )
          .build(),
      }),
    ],
  });
}
