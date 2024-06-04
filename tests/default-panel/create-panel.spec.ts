import { expect, test } from '@grafana/plugin-e2e';

test('should return clock panel', async ({ panelEditPage }) => {
  await panelEditPage.datasource.set('gdev-testdata');
  await panelEditPage.setVisualization('Clock');
  await expect(panelEditPage.refreshPanel()).toBeOK();
});
