import { useState, useEffect } from 'react'
import { getHeaders } from '../api'
import { QUESTION_TYPES, CHOICE_TYPES } from '../constants'

export default function StepFields({
  spreadsheetId,
  sheetName,
  headers,
  fields,
  onHeadersLoaded,
  onUpdateField,
  onNext,
  onBack,
}) {
  const [loading, setLoading] = useState(headers.length === 0)
  const [error, setError] = useState(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getHeaders(spreadsheetId, sheetName)
      onHeadersLoaded(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (headers.length === 0) {
      load()
    } else {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleNext = () => {
    for (let i = 0; i < fields.length; i++) {
      if (!fields[i].title || fields[i].title.trim() === '') {
        setError('欄位 ' + (i + 1) + ' 的問題標題不可為空。')
        return
      }
    }
    setError(null)
    onNext()
  }

  return (
    <section className="wizard-step active">
      <h2>步驟四：設定表單欄位</h2>
      <p className="step-desc">
        為每一個欄位設定問題類型、問題標題、是否必填，以及（如適用）選項內容。
      </p>
      <button
        type="button"
        className="btn btn-secondary btn-sm"
        onClick={load}
        disabled={loading}
      >
        重新載入欄位
      </button>

      {loading && <p className="loading-text">載入中…</p>}

      {error && !loading && (
        <div className="message-area">
          <p className="error-msg">{error}</p>
        </div>
      )}

      {!loading && !error && fields.length === 0 && (
        <p className="error-msg">沒有可用的欄位標題。</p>
      )}

      <div className="fields-container">
        {fields.map((field, index) => (
          <FieldCard
            key={index}
            index={index}
            field={field}
            onUpdate={onUpdateField}
          />
        ))}
      </div>

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

function FieldCard({ index, field, onUpdate }) {
  const isChoice = CHOICE_TYPES.includes(field.type)

  return (
    <div className="field-card">
      <div className="field-header">
        <span className="field-number">欄位 {index + 1}</span>
        <span className="field-column-title">資料欄位：{field.title}</span>
      </div>

      <div className="form-group">
        <label htmlFor={'fieldType-' + index}>問題類型</label>
        <select
          id={'fieldType-' + index}
          value={field.type}
          onChange={(e) => onUpdate(index, { type: e.target.value })}
        >
          {QUESTION_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor={'fieldTitle-' + index}>問題標題</label>
        <input
          type="text"
          id={'fieldTitle-' + index}
          value={field.title}
          onChange={(e) => onUpdate(index, { title: e.target.value })}
        />
      </div>

      <div className="form-group checkbox-group">
        <input
          type="checkbox"
          id={'fieldRequired-' + index}
          checked={field.required}
          onChange={(e) => onUpdate(index, { required: e.target.checked })}
        />
        <label htmlFor={'fieldRequired-' + index}>必填</label>
      </div>

      {isChoice && (
        <div className="options-editor">
          <label htmlFor={'fieldOptions-' + index}>選項（每行一個）</label>
          <textarea
            id={'fieldOptions-' + index}
            rows={3}
            placeholder="請輸入選項，每行一個"
            value={(field.options || []).join('\n')}
            onChange={(e) =>
              onUpdate(index, {
                options: e.target.value
                  .split('\n')
                  .filter((line) => line.trim() !== ''),
              })
            }
          />
        </div>
      )}
    </div>
  )
}
