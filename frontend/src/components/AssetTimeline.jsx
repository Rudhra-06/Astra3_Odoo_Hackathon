const ICONS = { registered: '✓', allocated: '→', returned: '↩', transfer: '⇄', maintenance: '⌕', maintenance_done: '✓', booked: '▣', audit: '✓', disposed: '×' };
const TONES = { teal:'bg-teal-500', blue:'bg-blue-500', green:'bg-emerald-500', purple:'bg-violet-500', amber:'bg-amber-500', indigo:'bg-indigo-500', red:'bg-red-500', gray:'bg-gray-500' };
export default function AssetTimeline({ events = [] }) {
  if (!events.length) return <p className="text-sm text-gray-400">No lifecycle events recorded yet.</p>;
  return <ol className="relative border-l border-gray-200 ml-3 space-y-5">{events.map((event, index) => <li key={`${event.type}-${index}`} className="ml-6"><span className={`absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full text-xs text-white ${TONES[event.color] || TONES.gray}`}>{ICONS[event.icon] || '•'}</span><div className="flex flex-wrap justify-between gap-1"><p className="text-sm font-semibold text-ink-900">{event.title}</p><time className="text-xs text-gray-400">{new Date(event.timestamp).toLocaleString()}</time></div><p className="mt-1 text-sm text-gray-500">{event.description}</p></li>)}</ol>;
}
