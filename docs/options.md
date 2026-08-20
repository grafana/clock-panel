---
title: Options
description: Reference for Clock panel options.
sidebar_position: 3
---

<!-- section-brief:start -->

Reference the options Clock exposes in the panel editor. Cover both the custom options the panel adds (via `setPanelOptions` in source) and the standard field options it enables (via `useFieldConfig`). Skip the sections below that don't apply to this panel - if there's no Standard field options block, no Tooltip section etc., remove those headings entirely rather than leaving an empty brief.

Do not redocument the framework-level standard options themselves (Min, Max, Unit, etc.) - Grafana's own docs cover those. The Standard field options section lists which ones are enabled, nothing more.

<!-- section-brief:end -->

## Panel options

<!-- section-brief:start -->

Emit a markdown table with these columns - one row per option registered through `setPanelOptions` in `src/module.ts`. Match the Grafana built-in panel docs style: https://grafana.com/docs/grafana/latest/visualizations/panels-visualizations/visualizations/logs/#logs-options

| Option | Type | Default | Description |
| ------ | ---- | ------- | ----------- |

- _Option_: the `name` value from the `setPanelOptions` `.add*({...})` call, verbatim.
- _Type_: a friendly label derived from the builder method (`addBooleanSwitch` → Toggle, `addSelect` → Select, `addNumberInput` → Number, etc.).
- _Default_: the `defaultValue` rendered as inline code. Empty cell when there is no default.
- _Description_: the `description` value, verbatim. Empty cell when source has none.

If the panel does not call `setPanelOptions`, remove this section entirely.

<!-- section-brief:end -->

## Standard field options

<!-- section-brief:start -->

A bulleted list of the standard field options this panel enables - the entries from `useFieldConfig({ standardOptions: [...] })` in `src/module.ts`. If the panel calls `useFieldConfig()` or `useFieldConfig({})` without a `standardOptions` key, document this as "all standard options are enabled" and list the standard set.

If the panel does not call `useFieldConfig` at all, remove this section entirely.

<!-- section-brief:end -->

## Custom field options

<!-- section-brief:start -->

A table with the same shape as Panel options (Option / Type / Default / Description) but for the per-field overrides registered via `useFieldConfig({ useCustomConfig: builder => ... })`. These appear under the Overrides picker in the panel editor.

If the panel does not register custom field options, remove this section entirely.

<!-- section-brief:end -->

## Tooltip options

<!-- section-brief:start -->

Describe the tooltip-related options Clock exposes (hover behavior, what fields the tooltip shows, formatting). Most tooltip options will already appear in the Panel options table above when they're registered via `setPanelOptions` with `category: ['Tooltip']`; use this section for narrative context that doesn't fit in a table row. Remove this section if there is nothing extra to say beyond the table.

<!-- section-brief:end -->

## Legend options

<!-- section-brief:start -->

Describe the legend-related options Clock exposes (placement, values shown, calculations). Same pattern as Tooltip options - the table above already covers the per-option reference; this section is for narrative context. Remove the section if not applicable.

<!-- section-brief:end -->
