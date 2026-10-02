import { useState } from 'react'
import { createForm } from '../api'

export default function StepResult({ payload, onBack, onRestart }) {
  const [status, setStatus] = useState('idle')
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleCreate = async () => {
    setStatus('loading')
    setError(null)
    setResult(null)
    try {
      const data = await createForm(payload)
      setResult(data)
      setStatus('done')
    } catch (err) {
      setError(err.message)
      setStatus('error')
    }
  }

  const copyToClipboard = (text) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text)
    }
  }

  return (
    <section className="wizard-step active">
      <h2>步驟六：建立 Google 表單</h2>
      <p className="step-desc">確認以下資訊無誤後，點擊「建立表單」按鈕。</p>

      <div className="summary-card">
        <h3>表單摘要</h3>
        <dl>
          <dt>表單標題</dt>
          <dd>{payload.title || '（未設定）'}</dd>
          <dt>表單說明</dt>
          <dd>{payload.description || '（無）'}</dd>
          <dt>儲存資料夾 ID</dt>
          <dd>{payload.folderId || '（未選擇）'}</dd>
          <dt>問題數量</dt>
          <dd>{payload.fields.length}</dd>
        </dl>
      </div>

      {status === 'idle' && (
        <div className="button-row">
          <button type="button" className="btn btn-secondary" onClick={onBack}>
            上一步
          </button>
          <button type="button" className="btn btn-primary" onClick={handleCreate}>
            建立表單
          </button>
        </div>
      )}

      {status === 'loading' && (
        <div className="message-area">
          <p className="loading-text">正在建立表單，請稍候…</p>
        </div>
      )}

      {status === 'error' && (
        <div className="message-area">
          <p className="error-msg">{error}</p>
          <div className="button-row">
            <button type="button" className="btn btn-secondary" onClick={onBack}>
              上一步
            </button>
            <button type="button" className="btn btn-primary" onClick={handleCreate}>
              重試
            </button>
          </div>
        </div>
      )}

      {status === 'done' && result && (
        <div className="result-card">
          <p className="success-msg">表單建立成功！</p>
          <div className="form-group">
            <label htmlFor="formUrl">表單連結</label>
            <div className="copy-row">
              <input
                type="text"
                id="formUrl"
                value={result.editUrl || result.url || ''}
                readOnly
              />
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => copyToClipboard(result.editUrl || result.url || '')}
              >
                複製
              </button>
            </div>
          </div>
          {result.formId && (
            <div className="form-group">
              <label htmlFor="formId">表單 ID</label>
              <input type="text" id="formId" value={result.formId} readOnly />
            </div>
          )}
          <div className="button-row">
            <button type="button" className="btn btn-secondary" onClick={onBack}>
              上一步
            </button>
            <button type="button" className="btn btn-primary" onClick={onRestart}>
              建立新表單
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
