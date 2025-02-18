import {
  EmbeddedScene,
  PanelBuilders,
  SceneControlsSpacer,
  SceneFlexItem,
  SceneFlexLayout,
  SceneGridItem,
  SceneGridLayout,
  SceneQueryRunner,
  SceneRefreshPicker,
  SceneTimePicker,
  SceneTimeRange,
} from '@grafana/scenes';
import { PROMETHEUS_DATASOURCE_REF } from '../../constants';
import { ThresholdsMode } from '@grafana/schema';

export function homeScene() {
  return new EmbeddedScene({
    $timeRange: new SceneTimeRange({
      from: 'now-5m',
      to: 'now',
    }),
    body: new SceneGridLayout({
      children: [
        new SceneGridItem({
          x: 0,
          y: 0,
          width: 24,
          height: 6,
          isResizable: false,
          isDraggable: false,
          body: new SceneFlexLayout({
            direction: 'row',
            children: [
              new SceneFlexItem({
                height: 200,
                $data: new SceneQueryRunner({
                  datasource: PROMETHEUS_DATASOURCE_REF,
                  queries: [
                    {
                      refId: 'A',
                      expr: 'count(count(http_server_request_duration_seconds_bucket) by (service_name))',
                    },
                  ],
                }),
                body: PanelBuilders.stat().setTitle('Services').build(),
              }),
              new SceneFlexItem({
                height: 200,
                $data: new SceneQueryRunner({
                  datasource: PROMETHEUS_DATASOURCE_REF,
                  queries: [
                    {
                      refId: 'A',
                      expr: 'sum(rate(container_cpu_usage_seconds_total{namespace!~"kube-system|observability",namespace!=""}[$__rate_interval]))',
                    },
                  ],
                }),
                body: PanelBuilders.stat()
                  .setTitle('CPU Usage')
                  .setDecimals(4)
                  .setThresholds({
                    mode: ThresholdsMode.Absolute,
                    steps: [
                      { color: 'green', value: 0 },
                      { color: '#EAB839', value: 2 },
                      { color: 'red', value: 4 },
                    ],
                  })
                  .build(),
              }),
              new SceneFlexItem({
                height: 200,
                $data: new SceneQueryRunner({
                  datasource: PROMETHEUS_DATASOURCE_REF,
                  queries: [
                    {
                      refId: 'A',
                      expr: 'sum(container_memory_working_set_bytes{namespace!~"kube-system|observability",namespace!=""})',
                    },
                  ],
                }),
                body: PanelBuilders.stat()
                  .setTitle('Memory Usage')
                  .setUnit('bytes')
                  .setThresholds({
                    mode: ThresholdsMode.Absolute,
                    steps: [
                      { color: 'green', value: 0 },
                      { color: '#EAB839', value: 1 },
                      { color: 'red', value: 2 },
                    ],
                  })
                  .build(),
              }),
            ],
          }),
        }),
        new SceneGridItem({
          x: 0,
          y: 0,
          width: 24,
          height: 6,
          isResizable: false,
          isDraggable: false,
          body: new SceneFlexLayout({
            direction: 'row',
            children: [
              new SceneFlexItem({
                height: 200,
                $data: new SceneQueryRunner({
                  datasource: PROMETHEUS_DATASOURCE_REF,
                  queries: [
                    {
                      refId: 'A',
                      expr: 'sum(rate(http_server_request_duration_seconds_count[$__rate_interval]))',
                    },
                  ],
                }),
                body: PanelBuilders.stat()
                  .setTitle('Request Rate')
                  .setUnit('req/s')
                  .setThresholds({ mode: ThresholdsMode.Absolute, steps: [{ color: 'green', value: 0 }] })
                  .build(),
              }),
              new SceneFlexItem({
                height: 200,
                $data: new SceneQueryRunner({
                  datasource: PROMETHEUS_DATASOURCE_REF,
                  queries: [
                    {
                      refId: 'A',
                      expr: 'sum (rate(http_server_request_duration_seconds_count{http_response_status_code=~"(4|5).*"}[$__rate_interval])) / ignoring(http_response_status_code) group_left sum(rate(http_server_request_duration_seconds_count[$__rate_interval]))',
                    },
                  ],
                }),
                body: PanelBuilders.stat()
                  .setTitle('Error Rate')
                  .setUnit('percentunit')
                  .setDecimals(2)
                  .setMin(0)
                  .setMax(1)
                  .setThresholds({
                    mode: ThresholdsMode.Percentage,
                    steps: [
                      { color: 'green', value: 0 },
                      { color: '#EAB839', value: 20 },
                      { color: 'red', value: 40 },
                    ],
                  })
                  .setNoValue('0.00%')
                  .build(),
              }),
              new SceneFlexItem({
                height: 200,
                $data: new SceneQueryRunner({
                  datasource: PROMETHEUS_DATASOURCE_REF,
                  queries: [
                    {
                      refId: 'A',
                      expr: 'histogram_quantile(0.95, sum(rate(http_server_request_duration_seconds_bucket[$__rate_interval])) by (le))',
                    },
                  ],
                }),
                body: PanelBuilders.stat().setTitle('Request Duration').setDecimals(2).setUnit('s').build(),
              }),
            ],
          }),
        }),
      ],
    }),
    controls: [new SceneControlsSpacer(), new SceneTimePicker({ isOnCanvas: true }), new SceneRefreshPicker({})],
  });
}
