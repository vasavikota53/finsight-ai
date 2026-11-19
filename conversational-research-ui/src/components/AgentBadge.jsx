import React from 'react'
import { Bot, Zap, Database, FileText } from 'lucide-react'

const AGENT_CONFIG = {
  research: {
    label: 'Research Agent',
    icon:  Bot,
    color: 'bg-blue-500/15 text-blue-500 border-blue-500/30',
    darkColor: 'dark:bg-blue-400/10 dark:text-blue-400 dark:border-blue-400/25',
  },
  comparison: {
    label: 'Comparison Agent',
    icon:  Zap,
    color: 'bg-violet-500/15 text-violet-600 border-violet-500/30',
    darkColor: 'dark:bg-violet-400/10 dark:text-violet-400 dark:border-violet-400/25',
  },
  document: {
    label: 'Document Agent',
    icon:  FileText,
    color: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30',
    darkColor: 'dark:bg-emerald-400/10 dark:text-emerald-400 dark:border-emerald-400/25',
  },
  report: {
    label: 'Report Agent',
    icon:  Database,
    color: 'bg-amber-500/15 text-amber-600 border-amber-500/30',
    darkColor: 'dark:bg-amber-400/10 dark:text-amber-400 dark:border-amber-400/25',
  },
}

export default function AgentBadge({ agent, className = '' }) {
  if (!agent) return null
  const cfg = AGENT_CONFIG[agent] ?? {
    label: agent,
    icon: Bot,
    color: 'bg-slate-500/15 text-slate-500 border-slate-500/30',
    darkColor: 'dark:text-slate-400',
  }
  const Icon = cfg.icon

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border
        ${cfg.color} ${cfg.darkColor} ${className}`}
    >
      <Icon size={11} />
      {cfg.label}
    </span>
  )
}
