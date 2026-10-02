import { useState, useEffect } from 'react'
import { listSpreadsheets } from '../api'

export default function StepSpreadsheets({ spreadsheetId, onSelect, onNext, onBack }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selected, setSelected] = useState(spreadsheetId || '')

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await listSpreadsheets()
      setItems(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleNext = () => {
    if (!selected) {
      setError('請選擇一份試算表。')
      return
    }
    const item = items.find((i) => i.id === selected)
    onSelect(selected, item ? item.name : '')
    onNext()
  }

  return (
    <section className="wizard-step active">
      <h2>步驟二：選擇 Google 試算表</h2>
      <p className="step-desc">請從您的 Google Drive 中選擇一份試算表。</p>
      <div className="form-group">
        <label htmlFor="spreadsheetSelect">選擇試算表</label>
        <select
          id="spreadsheetSelect"
          value={selected}
          disabled={loading}
          onChange={(e) => {
            setSelected(e.target.value)
            setError(null)
          }}
        >
          {loading && <option value="">載入中…</option>}
          {!loading && items.length === 0 && <option value="">找不到任何試算表</option>}
          {!loading && items.length > 0 && <option value="">請選擇試算表</option>}
          {items.map((item) => (
            <option key={item.id} value={item.id} title={item.path || item.name}>
              {item.name}
            </option>
          ))}
        </select>
      </div>
      <button
        type="button"
        className="btn btn-secondary btn-sm"
        onClick={load}
        disabled={loading}
      >
        重新載入
      </button>
      <div className="button-row">
        <button type="button" className="btn btn-secondary" onClick={onBack}>
          上一步
        </button>
        <button type="button" className="btn btn-primary" onClick={handleNext}>
          下一步
        </button>
      </div>
      {error && (
        <div className="message-area">
          <p className="error-msg">{error}</p>
        </div>
      )}
    </section>
  )
}
