import type { FeatureMeta } from '~/features/registry';
import { useFeatureToggle } from '~/hooks/useFeatureToggle';

interface FeatureListProps {
  features: FeatureMeta[];
}

export function FeatureList({ features }: FeatureListProps) {
  const { loading, toggle, isEnabled } = useFeatureToggle(features);

  if (loading) {
    return <p className="text-sm text-gray-400 py-2">加载中...</p>;
  }

  if (features.length === 0) {
    return (
      <p className="text-sm text-gray-400 py-2">暂无可用功能</p>
    );
  }

  return (
    <ul className="space-y-2">
      {features.map((feature) => (
        <li
          key={feature.id}
          className="flex items-center justify-between gap-3 rounded-lg bg-gray-50 px-3 py-2"
        >
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">
              {feature.name}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {feature.description}
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={isEnabled(feature.id)}
            onClick={() => toggle(feature.id)}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors ${
              isEnabled(feature.id) ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 translate-y-0.5 rounded-full bg-white shadow-sm transition-transform ${
                isEnabled(feature.id) ? 'translate-x-4' : 'translate-x-0.5'
              }`}
            />
          </button>
        </li>
      ))}
    </ul>
  );
}
