import { STEP_LABELS } from '../constants'

export default function StepIndicators({ current, onGoTo }) {
  return (
    <nav className="step-indicators" aria-label="步驟導覽">
      <ol>
        {STEP_LABELS.map((label, i) => (
          <li key={label}>
            <button
              type="button"
              className={
                'step-dot' +
                (i === current ? ' active' : '') +
                (i < current ? ' completed' : '')
              }
              onClick={() => onGoTo(i)}
              disabled={i > current}
            >
              {i + 1}
            </button>
          </li>
        ))}
      </ol>
      <div className="step-labels">
        {STEP_LABELS.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
    </nav>
  )
}
