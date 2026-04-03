import { featureManager } from '~/lib/feature-manager';
import { registerAllFeatures } from '~/features';
import '~/styles/v2ex-overrides.css';

export default defineContentScript({
  matches: ['*://*.v2ex.com/*'],
  runAt: 'document_idle',
  async main() {
    registerAllFeatures(featureManager);
    await featureManager.init();
    console.log('[V2EX-Min] Extension loaded.');
  },
});
