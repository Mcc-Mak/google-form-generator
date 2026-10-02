import { useState } from 'react'
import { getGasUrl, setGasUrl } from '../api'

export default function StepUrl({ onNext }) {
  const [url, setUrl] = useState(getGasUrl())
  const [msg, setMsg] = useState(null)

  const validate = () => {
    const trimmed = url.trim()
    if (!trimmed) {
      setMsg({ type: 'error', text: '請輸入 GAS Web App URL。' })
      return false
    }
    try {
      new URL(trimmed)
    } catch {
      setMsg({ type: 'error', text: '請輸入有效的網址格式。' })
      return false
    }
    setGasUrl(trimmed)
    setMsg(null)
    return true
  }

  const handleSave = () => {
    if (validate()) {
      setMsg({ type: 'success', text: 'GAS Web App URL 已儲存至瀏覽器。' })
    }
  }

  const handleNext = () => {
    if (validate()) onNext()
  }

  return (
    <section className="wizard-step active">
      <h2>步驟一：輸入 GAS Web App URL</h2>
      <p className="step-desc">
        請輸入您的 Google Apps Script Web App 部署網址，此網址將用於所有後端資料操作。
      </p>
      <div className="form-group">
        <label htmlFor="gasUrl">GAS Web App URL</label>
        <input
          type="url"
          id="gasUrl"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://script.google.com/macros/s/.../exec"
          autoComplete="off"
        />
      </div>
      <div className="button-row">
        <button type="button" className="btn btn-secondary" onClick={handleSave}>
          儲存網址
        </button>
        <button type="button" className="btn btn-primary" onClick={handleNext}>
          下一步
        </button>
      </div>
      {msg && (
        <div className="message-area">
          <p className={msg.type === 'error' ? 'error-msg' : 'success-msg'}>
            {msg.text}
          </p>
        </div>
      )}
    </section>
  )
}
