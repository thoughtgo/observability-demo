# Grafana Scenes Observability Demo App

## Overview

This Grafana app plugin provides a custom, interactive observability experience using [@grafana/scenes](https://github.com/grafana/scenes). It enables real-time monitoring with pre-configured dashboards, template variable support, versatile layouts, and panel rendering.

## What are Grafana app plugins?

Grafana app plugins allow you to extend Grafana with custom pages, nested datasources, and panel plugins, providing a tailored monitoring experience.

## What is @grafana/scenes?

[@grafana/scenes](https://github.com/grafana/scenes) is a framework for building versatile app plugins that resemble Grafana's native dashboarding experience. It includes support for:

- Dynamic dashboards with custom layouts
- Template variables
- Panel rendering

For detailed documentation, visit the [Grafana Scenes documentation](https://grafana.com/developers/scenes).

---

## Installation & Development

### Frontend

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Build the plugin in development mode** (runs in watch mode)

   ```bash
   npm run dev
   ```

3. **Build the plugin for production**
   ```bash
   npm run build
   ```

---

## Running the Plugin in Grafana

1. Copy the built plugin to Grafana’s plugin directory:

   ```bash
   cp -r dist /var/lib/grafana/plugins/observability-scenes-app
   ```

2. Restart Grafana:

   ```bash
   systemctl restart grafana-server
   ```

3. Enable the plugin in Grafana UI under **Administration → Plugins**.

---

## Distributing Your Plugin

When distributing a Grafana plugin publicly or privately, it must be **signed** to verify authenticity. This is done using the `@grafana/sign-plugin` package.

### Why Plugin Signing is Required

Grafana requires plugin signing to ensure security, prevent tampering, and allow distribution via the official plugin catalog.

### Signing a Plugin

#### Prerequisites:

1. **Create a [Grafana Cloud account](https://grafana.com/signup).**
2. **Ensure your plugin ID matches your Grafana Cloud account slug.**
   - Example: If your account slug is `acmecorp`, your plugin ID in `plugin.json` should be prefixed with `acmecorp-`.
3. **Create a Grafana Cloud API key** with the `PluginPublisher` role.

#### Sign the Plugin:

```bash
export GRAFANA_ACCESS_POLICY_TOKEN=<YOUR_ACCESS_POLICY_TOKEN>
npx @grafana/sign-plugin@latest --rootUrls https://grafana.example.com
```

For detailed instructions, refer to [Grafana’s plugin signing guide](https://grafana.com/developers/plugin-tools/publish-a-plugin/sign-a-plugin).
