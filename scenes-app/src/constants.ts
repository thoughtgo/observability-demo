import pluginJson from './plugin.json';

export const PLUGIN_BASE_URL = `/a/${pluginJson.id}`;

export enum ROUTES {
  Home = 'home',
  Services = 'services',
}

export const PROMETHEUS_DATASOURCE_REF = {
  uid: 'Prometheus',
  type: 'prometheus',
};

export const TEMPO_DATASOURCE_REF = {
  uid: 'Tempo',
  type: 'tempo',
};

export const LOKI_DATASOURCE_REF = {
  uid: 'Loki',
  type: 'loki',
};
