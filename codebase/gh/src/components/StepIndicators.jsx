import { STEP_LABELS } from '../constants'

export default function StepIndicators({ current, onGoTo }) {
  return (
    <nav className="step-indicators" aria-label="步驟導覽">
      <ol>
        {STEP_LABELS.map((_, i) => (
          <li
            key={i}
            className={
              'step-dot' +
              (i === current ? ' active' : '') +
              (i < current ? ' completed' : '')
            }
            onClick={() => i <= current && onGoTo(i)}
            role="button"
            tabIndex={i <= current ? 0 : -1}
            onKeyDown={(e) => {
              if ((e.key === 'Enter' || e.key === ' ') && i <= current) onGoTo(i)
            }}
          >
            {i + 1}
          </li>
        ))}
      </ol>
      <div className="step-labels">
        {STEP_LABELS.map((label, i) => (
          <span key={i}>{label}</span>
        ))}
      </div>
    </nav>
  )
}
