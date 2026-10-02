import { useState, useEffect } from 'react'
import { getQuestions } from '../api'
import { QUESTION_TYPES, CHOICE_TYPES } from '../constants'

export default function StepFields({
  spreadsheetId,
  sheetName,
  fields,
  onFieldsLoaded,
  onUpdateField,
  onAddField,
  onRemoveField,
  onMoveField,
  onNext,
  onBack,
}) {
  const [loading, setLoading] = useState(fields.length === 0)
  const [error, setError] = useState(null)
  const [imported, setImported] = useState(false)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getQuestions(spreadsheetId, sheetName)
      onFieldsLoaded(data || [])
      setImported(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (fields.length === 0) {
      load().catch(() => {})
    } else {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleNext = () => {
    for (let i = 0; i < fields.length; i++) {
      if (!fields[i].title || fields[i].title.trim() === '') {
        setError('問題 ' + (i + 1) + ' 的標題不可為空。')
        return
      }
    }
    if (fields.length === 0) {
      setError('至少需要一個問題。')
      return
    }
    setError(null)
    onNext()
  }

  return (
    <section className="wizard-step active">
      <h2>步驟四：設定表單問題</h2>
      <p className="step-desc">
        從試算表匯入的問題如下，您可新增、刪除、排序及編輯每一個問題。
      </p>

      <div className="step-toolbar">
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={load}
          disabled={loading}
        >
          重新匯入
        </button>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={onAddField}
          disabled={loading}
        >
          + 新增問題
        </button>
      </div>

      {imported && !loading && fields.length > 0 && (
        <p className="import-info">
          已從試算表匯入 {fields.length} 個問題。
        </p>
      )}

      {loading && <p className="loading-text">載入中…</p>}

      {error && !loading && (
        <div className="message-area">
          <p className="error-msg">{error}</p>
        </div>
      )}

      {!loading && !error && fields.length === 0 && (
        <p className="error-msg">沒有匯入任何問題，請點「新增問題」手動加入。</p>
      )}

      <div className="fields-container">
        {fields.map((field, index) => (
          <FieldCard
            key={field.uid || 'field-' + index}
            index={index}
            total={fields.length}
            field={field}
            onUpdate={onUpdateField}
            onRemove={onRemoveField}
            onMoveUp={() => onMoveField(index, -1)}
            onMoveDown={() => onMoveField(index, 1)}
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
    </section>
  )
}

function FieldCard({ index, total, field, onUpdate, onRemove, onMoveUp, onMoveDown }) {
  const isChoice = CHOICE_TYPES.includes(field.type)

  return (
    <div className="field-card">
      <div className="field-header">
        <span className="field-number">{index + 1}</span>
        <div className="field-actions">
          <button
            type="button"
            className="btn-icon"
            onClick={onMoveUp}
            disabled={index === 0}
            title="上移"
          >
            ↑
          </button>
          <button
            type="button"
            className="btn-icon"
            onClick={onMoveDown}
            disabled={index === total - 1}
            title="下移"
          >
            ↓
          </button>
          <button
            type="button"
            className="btn-icon btn-icon-danger"
            onClick={onRemove}
            title="刪除"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="field-row">
        <div className="form-group field-type-group">
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

        <div className="form-group field-required-group">
          <span className="spacer-label" aria-hidden="true">&nbsp;</span>
          <label className="checkbox-inline">
            <input
              type="checkbox"
              id={'fieldRequired-' + index}
              checked={field.required}
              onChange={(e) => onUpdate(index, { required: e.target.checked })}
            />
            <span>必填</span>
          </label>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor={'fieldTitle-' + index}>問題標題</label>
        <input
          type="text"
          id={'fieldTitle-' + index}
          value={field.title}
          placeholder="輸入問題標題"
          onChange={(e) => onUpdate(index, { title: e.target.value })}
        />
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
