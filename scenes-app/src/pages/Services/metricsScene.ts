import {
  EmbeddedScene,
  PanelBuilders,
  QueryVariable,
  SceneControlsSpacer,
  SceneFlexItem,
  SceneFlexLayout,
  SceneGridItem,
  SceneGridLayout,
  SceneQueryRunner,
  SceneRefreshPicker,
  SceneTimePicker,
  SceneTimeRange,
  SceneVariableSet,
  VariableValueSelectors,
} from '@grafana/scenes';
import { PROMETHEUS_DATASOURCE_REF } from '../../constants';
import { GraphDrawStyle, LegendDisplayMode, LineInterpolation, SortOrder, TooltipDisplayMode } from '@grafana/schema';

const clusters = new QueryVariable({
  name: 'cluster',
  datasource: PROMETHEUS_DATASOURCE_REF,
  query: 'label_values(http_server_request_duration_seconds_bucket, cluster)',
  includeAll: false,
  defaultToAll: false,
  isMulti: false,
});

export function metricsScene(service: string) {
  return new EmbeddedScene({
    $timeRange: new SceneTimeRange({
      from: 'now-1h',
      to: 'now',
    }),
    body: new SceneGridLayout({
      children: [
        new SceneGridItem({
          x: 0,
          y: 0,
          width: 24,
          height: 54,
          isResizable: false,
          isDraggable: false,
          body: new SceneFlexLayout({
            direction: 'column',
            children: [
              new SceneFlexItem({
                height: 400,
                $data: new SceneQueryRunner({
                  datasource: PROMETHEUS_DATASOURCE_REF,
                  queries: [
                    {
                      refId: 'A',
                      expr:
                        'sum(rate(http_server_request_duration_seconds_count{service_name="' +
                        `${service}` +
                        '", cluster="${cluster}"} [$__rate_interval])) by (service_name, http_response_status_code)',
                      legendFormat: 'HTTP {{service_name}} - {{http_response_status_code}}',
                    },
                  ],
                }),
                body: PanelBuilders.timeseries()
                  .setTitle('Request rate')
                  .setUnit('req/s')
                  .setOption('legend', {
                    asTable: true,
                    placement: 'right',
                    calcs: ['min', 'max', 'mean'],
                    displayMode: LegendDisplayMode.Table,
                  })
                  .setOption('tooltip', { mode: TooltipDisplayMode.Multi, sort: SortOrder.Descending })
                  .setCustomFieldConfig('lineWidth', 3)
                  .setCustomFieldConfig('drawStyle', GraphDrawStyle.Line)
                  .setCustomFieldConfig('lineInterpolation', LineInterpolation.Smooth)
                  .build(),
              }),
              new SceneFlexItem({
                height: 400,
                $data: new SceneQueryRunner({
                  datasource: PROMETHEUS_DATASOURCE_REF,
                  queries: [
                    {
                      refId: 'A',
                      expr:
                        'histogram_quantile(0.95, sum(rate(http_server_request_duration_seconds_bucket{service_name="' +
                        `${service}` +
                        '", cluster="${cluster}"}[$__rate_interval])) by (service_name, le))',
                      legendFormat: '{{ service_name }} HTTP p95',
                    },
                  ],
                }),
                body: PanelBuilders.timeseries()
                  .setTitle('Duration')
                  .setDecimals(2)
                  .setUnit('s')
                  .setOption('legend', {
                    asTable: true,
                    placement: 'right',
                    calcs: ['min', 'max', 'mean'],
                    displayMode: LegendDisplayMode.Table,
                  })
                  .setOption('tooltip', { mode: TooltipDisplayMode.Multi, sort: SortOrder.Descending })
                  .setCustomFieldConfig('spanNulls', true)
                  .setCustomFieldConfig('lineWidth', 3)
                  .setCustomFieldConfig('drawStyle', GraphDrawStyle.Line)
                  .setCustomFieldConfig('lineInterpolation', LineInterpolation.Smooth)
                  .build(),
              }),
              new SceneFlexItem({
                height: 400,
                $data: new SceneQueryRunner({
                  datasource: PROMETHEUS_DATASOURCE_REF,
                  queries: [
                    {
                      refId: 'A',
                      expr:
                        'sum by (http_response_status_code, service_name) (rate(http_server_request_duration_seconds_count{service_name="' +
                        `${service}` +
                        '", cluster="${cluster}", http_response_status_code=~"(4|5).*"}[$__rate_interval])) ' +
                        ' / ignoring(http_response_status_code, service_name) group_left sum(rate(http_server_request_duration_seconds_count{service_name="' +
                        `${service}` +
                        '", cluster="${cluster}"}[$__rate_interval]))',
                      legendFormat: 'HTTP {{service_name}} - {{http_response_status_code}}',
                    },
                  ],
                }),
                body: PanelBuilders.timeseries()
                  .setTitle('Error rate')
                  .setUnit('percentunit')
                  .setOption('legend', {
                    asTable: true,
                    placement: 'right',
                    calcs: ['min', 'max', 'mean'],
                    displayMode: LegendDisplayMode.Table,
                  })
                  .setOption('tooltip', { mode: TooltipDisplayMode.Multi, sort: SortOrder.Descending })
                  .setDecimals(2)
                  .setMin(0)
                  .setMax(1)
                  .setCustomFieldConfig('spanNulls', true)
                  .setCustomFieldConfig('lineWidth', 3)
                  .setCustomFieldConfig('drawStyle', GraphDrawStyle.Line)
                  .setCustomFieldConfig('lineInterpolation', LineInterpolation.Smooth)
                  .build(),
              }),
              new SceneFlexItem({
                height: 400,
                $data: new SceneQueryRunner({
                  datasource: PROMETHEUS_DATASOURCE_REF,
                  queries: [
                    {
                      refId: 'A',
                      expr:
                        'sum(rate(container_cpu_usage_seconds_total{pod=~"' +
                        `${service}` +
                        '.*", cluster="${cluster}"}[$__rate_interval])) by (pod)',
                      legendFormat: '{{ pod }}',
                    },
                  ],
                }),
                body: PanelBuilders.timeseries()
                  .setTitle('CPU Usage by pod')
                  .setOption('legend', {
                    asTable: true,
                    placement: 'right',
                    calcs: ['min', 'max', 'mean'],
                    displayMode: LegendDisplayMode.Table,
                  })
                  .setOption('tooltip', { mode: TooltipDisplayMode.Multi, sort: SortOrder.Descending })
                  .setDecimals(4)
                  .setCustomFieldConfig('axisLabel', 'CPU Cores')
                  .setCustomFieldConfig('fillOpacity', 10)
                  .setCustomFieldConfig('lineWidth', 2)
                  .setCustomFieldConfig('drawStyle', GraphDrawStyle.Line)
                  .setCustomFieldConfig('lineInterpolation', LineInterpolation.Smooth)
                  .build(),
              }),
              new SceneFlexItem({
                height: 400,
                $data: new SceneQueryRunner({
                  datasource: PROMETHEUS_DATASOURCE_REF,
                  queries: [
                    {
                      refId: 'A',
                      expr:
                        'sum(container_memory_working_set_bytes{pod=~"' +
                        `${service}` +
                        '.*", cluster="${cluster}"}) by (pod)',
                      legendFormat: '{{ pod }}',
                    },
                  ],
                }),
                body: PanelBuilders.timeseries()
                  .setTitle('Memory Usage by pod')
                  .setOption('legend', {
                    asTable: true,
                    placement: 'right',
                    calcs: ['min', 'max', 'mean'],
                    displayMode: LegendDisplayMode.Table,
                  })
                  .setOption('tooltip', { mode: TooltipDisplayMode.Multi, sort: SortOrder.Descending })
                  .setUnit('bytes')
                  .setCustomFieldConfig('fillOpacity', 10)
                  .setCustomFieldConfig('lineWidth', 2)
                  .setCustomFieldConfig('drawStyle', GraphDrawStyle.Line)
                  .setCustomFieldConfig('lineInterpolation', LineInterpolation.Smooth)
                  .build(),
              }),
            ],
          }),
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
