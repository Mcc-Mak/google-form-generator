import { useState, useEffect } from 'react'
import { listSheets } from '../api'

export default function StepSheets({ spreadsheetId, sheetName, onSelect, onNext, onBack }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selected, setSelected] = useState(sheetName || '')

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await listSheets(spreadsheetId)
      setItems(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spreadsheetId])

  const handleNext = () => {
    if (!selected) {
      setError('請選擇一個工作表分頁。')
      return
    }
    onSelect(selected)
    onNext()
  }

  return (
    <section className="wizard-step active">
      <h2>步驟三：選擇工作表</h2>
      <p className="step-desc">
        請選擇試算表中的工作表分頁，系統將從中匯入問題定義。
      </p>
      <div className="form-group">
        <label htmlFor="sheetSelect">選擇工作表</label>
        <select
          id="sheetSelect"
          value={selected}
          disabled={loading}
          onChange={(e) => {
            setSelected(e.target.value)
            setError(null)
          }}
        >
          {loading && <option value="">載入中…</option>}
          {!loading && items.length === 0 && <option value="">找不到任何工作表</option>}
          {!loading && items.length > 0 && <option value="">請選擇工作表</option>}
          {items.map((item) => (
            <option
              key={item.index}
              value={item.name}
              title={item.name}
            >
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
