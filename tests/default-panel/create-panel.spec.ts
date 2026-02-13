import { expect, test } from '@grafana/plugin-e2e';
import { TEST_IDS } from '../../src/constants';

test('should return clock panel', async ({ panelEditPage, page }) => {
  await panelEditPage.datasource.set('ClockTestData');
  await panelEditPage.setVisualization('Clock');
  await expect(panelEditPage.refreshPanel()).toBeOK();
  const clockPanel = page.getByTestId(TEST_IDS.clockPanel);
  await expect(clockPanel).toBeVisible();
  await expect(clockPanel.getByTestId(TEST_IDS.clockPanelTime)).toBeVisible();
});
