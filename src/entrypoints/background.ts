export default defineBackground(() => {
  browser.runtime.onInstalled.addListener(({ reason }) => {
    if (reason === 'install') {
      console.log('[V2EX-Min] Extension installed.');
    } else if (reason === 'update') {
      console.log(
        `[V2EX-Min] Extension updated to v${browser.runtime.getManifest().version}`,
      );
    }
  });
});
