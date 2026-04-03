import { featureRegistry } from '~/features/registry';
import { FeatureList } from '~/components/FeatureList';

function App() {
  return (
    <div className="w-80 p-4">
      <header className="mb-3">
        <h1 className="text-base font-semibold text-gray-900">V2EX Minimum Extension</h1>
        <p className="text-xs text-gray-500 mt-0.5">极简增强 V2EX 浏览体验</p>
      </header>
      <FeatureList features={featureRegistry} />
      <footer className="mt-3 pt-2 border-t border-gray-100 text-center">
        <span className="text-[10px] text-gray-400">
          v{browser.runtime.getManifest().version}
        </span>
      </footer>
    </div>
  );
}

export default App;
