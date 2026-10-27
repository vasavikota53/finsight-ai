const map = { Verified: 'ok', Completed: 'ok', Pending: 'wn', Processing: 'wn', Flagged: 'er', 'Needs review': 'wn' }
export default function StatusBadge({ status }) { return <span className={`badge ${map[status] || 'wn'}`}>{status}</span> }
