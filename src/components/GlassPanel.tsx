import { ReactNode } from 'react'

export default function GlassPanel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`glass ${className}`}>
      {children}
    </div>
  )
}