import { useState, useRef } from 'react'
import { createForm } from '../api'
import { QRCodeCanvas } from 'qrcode.react'
import Swal from 'sweetalert2'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export default function StepResult({ payload, onBack, onRestart }) {
  const [status, setStatus] = useState('idle')
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const summaryRef = useRef(null)

  const handleCreate = async () => {
    Swal.fire({
      title: '正在建立表單…',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => Swal.showLoading(),
    })

    setStatus('loading')
    setError(null)
    setResult(null)
    try {
      const data = await createForm(payload)
      setResult(data)
      setStatus('done')
      Swal.close()
    } catch (err) {
      setError(err.message)
      setStatus('idle')
      Swal.fire({
        icon: 'error',
        title: '建立失敗',
        text: err.message,
        confirmButtonText: '確定',
      })
    }
  }

  const copyToClipboard = (text) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text)
    }
  }

  const getTimestamp = () => {
    const now = new Date()
    const pad = (n) => String(n).padStart(2, '0')
    return (
      now.getFullYear().toString() +
      pad(now.getMonth() + 1) +
      pad(now.getDate()) +
      pad(now.getHours()) +
      pad(now.getMinutes()) +
      pad(now.getSeconds())
    )
  }

  const exportPDF = async () => {
    if (!summaryRef.current) return
    Swal.fire({
      title: '正在匯出 PDF…',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => Swal.showLoading(),
    })
    try {
      const canvas = await html2canvas(summaryRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = pageWidth
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      let heightLeft = imgHeight
      let position = 0

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft > 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      pdf.save('GoogleForm-PDF-' + getTimestamp() + '.pdf')
      Swal.close()
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: '匯出失敗',
        text: err.message,
        confirmButtonText: '確定',
      })
    }
  }

  if (status === 'idle') {
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

        {error && (
          <div className="message-area">
            <p className="error-msg">{error}</p>
          </div>
        )}

        <div className="button-row">
          <button type="button" className="btn btn-secondary" onClick={onBack}>
            上一步
          </button>
          <button type="button" className="btn btn-primary" onClick={handleCreate}>
            建立表單
          </button>
        </div>
      </section>
    )
  }

  if (status === 'done' && result) {
    return (
      <section className="wizard-step active">
        <h2>表單建立結果</h2>
        <p className="step-desc">表單已成功建立，以下為各角色所需的連結資訊。</p>

        <div className="result-summary" ref={summaryRef}>
          <div className="result-form-title">
            <strong>表單標題：</strong>{payload.title || '（未命名）'}
          </div>

          {/* ── 一般使用者 ── */}
          <div className="role-card role-user">
            <h3>一般使用者</h3>
            <div className="role-content">
              <UrlRow
                label="表單連結（完整網址）"
                value={result.publishedUrl || ''}
                onCopy={copyToClipboard}
              />
              <UrlRow
                label="表單連結（短網址）"
                value={result.shortViewUrl || ''}
                onCopy={copyToClipboard}
              />
              {result.shortViewUrl && (
                <div className="qr-section">
                  <label>QR Code（短網址）</label>
                  <div className="qr-wrapper">
                    <QRCodeCanvas
                      value={result.shortViewUrl}
                      size={180}
                      level="M"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── 維護人員 ── */}
          <div className="role-card role-maintainer">
            <h3>維護人員</h3>
            <div className="role-content">
              <UrlRow
                label="表單編輯連結（完整網址）"
                value={result.editUrl || ''}
                onCopy={copyToClipboard}
              />
              <UrlRow
                label="表單連結（完整網址）"
                value={result.publishedUrl || ''}
                onCopy={copyToClipboard}
              />
              <UrlRow
                label="表單連結（短網址）"
                value={result.shortViewUrl || ''}
                onCopy={copyToClipboard}
              />
            </div>
          </div>

          {/* ── 開發人員 ── */}
          <div className="role-card role-developer">
            <h3>開發人員</h3>
            <div className="role-content">
              <UrlRow
                label="表單連結（短網址）"
                value={result.shortViewUrl || ''}
                onCopy={copyToClipboard}
              />
              <UrlRow
                label="試算表連結（短網址）"
                value={result.shortSpreadsheetUrl || ''}
                onCopy={copyToClipboard}
              />
              <UrlRow
                label="表單 ID"
                value={result.formId || ''}
                onCopy={copyToClipboard}
              />
            </div>
          </div>
        </div>

        <div className="button-row">
          <button type="button" className="btn btn-secondary" onClick={exportPDF}>
            匯出 PDF
          </button>
          <button type="button" className="btn btn-primary" onClick={onRestart}>
            建立新表單
          </button>
        </div>
      </section>
    )
  }

  return null
}

function UrlRow({ label, value, onCopy }) {
  return (
    <div className="url-row">
      <label>{label}</label>
      <div className="copy-row">
        <input type="text" value={value} readOnly />
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => onCopy(value)}
        >
          複製
        </button>
      </div>
    </div>
  )
}
