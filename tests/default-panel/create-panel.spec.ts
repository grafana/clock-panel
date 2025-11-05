import { expect, test } from '@grafana/plugin-e2e';

test('should return clock panel TEST', async ({ panelEditPage }) => {
  await panelEditPage.datasource.set('ClockTestData');
  await panelEditPage.setVisualization('Clock');
  await expect(panelEditPage.refreshPanel()).toBeOK();
});
