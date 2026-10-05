import { useState, useRef, useEffect } from 'react'
import { API_TOKEN_STORAGE_KEY } from '../constants'

const TOKEN_MAX_LENGTH = 256

function sanitizeToken(value) {
  return String(value || '').replace(/[^A-Za-z0-9._-]/g, '').slice(0, TOKEN_MAX_LENGTH)
}

export default function StepUrl({ onNext }) {
  const inputRef = useRef(null)
  const [hasToken, setHasToken] = useState(false)
  const [showToken, setShowToken] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(API_TOKEN_STORAGE_KEY)
    if (stored && inputRef.current) {
      inputRef.current.value = sanitizeToken(stored)
      setHasToken(inputRef.current.value.trim().length > 0)
    }
  }, [])

  const handleChange = (e) => {
    const raw = e.target.value
    const cleaned = sanitizeToken(raw)
    if (cleaned !== raw) {
      e.target.value = cleaned
    }
    setHasToken(cleaned.trim().length > 0)
  }

  const handleSave = () => {
    const cleaned = sanitizeToken(inputRef.current?.value || '').trim()
    if (!cleaned) return
    localStorage.setItem(API_TOKEN_STORAGE_KEY, cleaned)
  }

  const handleNext = () => {
    handleSave()
    onNext()
  }

  const canProceed = hasToken

  return (
    <section className="wizard-step active">
      <h2>步驟一：後端服務設定</h2>
      <p className="step-desc">
        本應用已內建 Google Apps Script Web App 後端網址，請輸入存取權杖以驗證使用權限。
      </p>

      <div className="config-info">
        <h3>後端服務資訊</h3>
        <dl>
          <dt>服務名稱</dt>
          <dd>Google Apps Script Web App</dd>
          <dt>部署網址</dt>
          <dd className="config-url">
            https://script.google.com/macros/s/AKfycbyAOXxRKN86p4BsPrmUQmZN172JlfkKh5Q0TonJB42VL3xjexPJ2dLSkaTpOsDY2m-nUg/exec
          </dd>
          <dt>存取權限</dt>
          <dd>任何人（需 API token）</dd>
          <dt>執行身分</dt>
          <dd>部署者</dd>
        </dl>
      </div>

      <div className="token-input-section">
        <label htmlFor="api-token">存取權杖</label>
        <div className="token-input-row">
          <input
            ref={inputRef}
            id="api-token"
            type={showToken ? 'text' : 'password'}
            className="form-input"
            onChange={handleChange}
            onBlur={handleSave}
            placeholder="請輸入 API token"
            autoComplete="off"
          />
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setShowToken(!showToken)}
          >
            {showToken ? '隱藏' : '顯示'}
          </button>
        </div>
        <p className="config-note">
          存取權杖由管理員提供，儲存於瀏覽器 localStorage 中，不會包含在原始碼內。
          若權杖變更，請聯繫管理員取得新的存取權杖。
        </p>
      </div>

      <div className="button-row">
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleNext}
          disabled={!canProceed}
        >
          下一步
        </button>
      </div>
    </section>
  )
}
