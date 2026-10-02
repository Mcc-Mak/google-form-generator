import { useState, useEffect } from 'react'
import { listFolders } from '../api'

export default function StepFolder({
  spreadsheetName,
  folderId,
  formTitle,
  formDescription,
  onSelectFolder,
  onTitleChange,
  onDescriptionChange,
  onNext,
  onBack,
}) {
  const [folders, setFolders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await listFolders()
      setFolders(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load().catch(() => {})
  }, [])

  useEffect(() => {
    if (!formTitle && spreadsheetName) {
      onTitleChange(spreadsheetName)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleNext = () => {
    if (!formTitle || formTitle.trim() === '') {
      setError('請輸入表單標題。')
      return
    }
    setError(null)
    onNext()
  }

  return (
    <section className="wizard-step active">
      <h2>步驟五：資料夾與表單資訊</h2>
      <p className="step-desc">
        選擇 Google Drive 資料夾以儲存新建立的 Google 表單，並設定表單標題與說明。
      </p>

      <div className="form-group">
        <label htmlFor="folderSelect">儲存資料夾</label>
        <select
          id="folderSelect"
          value={folderId}
          disabled={loading}
          onChange={(e) => {
            onSelectFolder(e.target.value)
            setError(null)
          }}
        >
          {loading && <option value="">載入中…</option>}
          {!loading && folders.length === 0 && <option value="">找不到任何資料夾</option>}
          {!loading && folders.length > 0 && <option value="">請選擇資料夾</option>}
          {folders.map((f) => (
            <option key={f.id} value={f.id} title={f.path || f.name}>
              {f.name}
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

      <div className="form-group">
        <label htmlFor="formTitle">表單標題</label>
        <input
          type="text"
          id="formTitle"
          value={formTitle}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="請輸入表單標題"
        />
      </div>

      <div className="form-group">
        <label htmlFor="formDescription">表單說明（選填）</label>
        <textarea
          id="formDescription"
          rows={3}
          value={formDescription}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="請輸入表單說明"
        />
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
