import { useState } from 'react'
import { createForm } from '../api'
import { QRCodeCanvas } from 'qrcode.react'
import Swal from 'sweetalert2'

const formatTimestamp = () => {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`
}

export default function StepResult({ payload, onBack, onRestart }) {
  const [status, setStatus] = useState('idle')
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

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
      void navigator.clipboard.writeText(text)
    }
  }

  const exportPDF = () => {
    let qrImgData = ''
    const canvasEl = document.querySelector('.qr-wrapper canvas')
    if (canvasEl) {
      qrImgData = canvasEl.toDataURL('image/png')
    }

    const esc = (s) =>
      String(s || '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')

    const urlItem = (label, value, isLink) => {
      const v = esc(value)
      const content = isLink
        ? `<a href="${v}">${v}</a>`
        : `<span class="value">${v}</span>`
      return `<div class="url-item"><label>${esc(label)}</label>${content}</div>`
    }

    const html = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
<meta charset="UTF-8">
<title>Google表格-PDF-${formatTimestamp()}-部署${result.deploymentId}</title>
<style>
  @page { size: A4; margin: 15mm; }
  * { box-sizing: border-box; }
  body {
    font-family: -apple-system, "PingFang TC", "Microsoft JhengHei", sans-serif;
    color: #202124; line-height: 1.5; margin: 0; padding: 10px;
  }
  h1 { font-size: 16pt; margin: 0 0 6pt 0; }
  .form-title {
    font-size: 11pt; margin-bottom: 16pt; padding: 6pt 8pt;
    background: #f8f9fa; border: 1px solid #dadce0; border-radius: 4pt;
  }
  .role-section { margin-bottom: 16pt; }
  .role-section h2 {
    font-size: 12pt; padding: 5pt 8pt; color: #fff;
    border-radius: 4pt; margin: 0 0 8pt 0;
  }
  .role-user h2 { background: #1a73e8; }
  .role-maintainer h2 { background: #1e8e3e; }
  .role-developer h2 { background: #5f6368; }
  .url-item { margin: 6pt 0; }
  .url-item label {
    display: block; font-size: 8pt; font-weight: bold;
    color: #5f6368; margin-bottom: 2pt;
  }
  .url-item a {
    font-size: 8pt; color: #1a73e8; text-decoration: underline;
    white-space: nowrap; font-family: monospace;
  }
  .url-item .value {
    font-size: 8pt; font-family: monospace; white-space: nowrap;
  }
  .qr-section { margin-top: 8pt; }
  .qr-section label {
    display: block; font-size: 8pt; font-weight: bold;
    color: #5f6368; margin-bottom: 4pt;
  }
  .qr-section img { width: 140pt; height: 140pt; }
</style>
</head>
<body>
<h1>Google \u8868\u55ae\u5efa\u7acb\u7d50\u679c</h1>
<p class="form-title"><strong>\u8868\u55ae\u6a19\u984c\uff1a</strong>${esc(payload.title || '\uff08\u672a\u547d\u540d\uff09')}</p>
<p class="form-title"><strong>\u8868\u55ae\u8aaa\u660e\uff1a</strong>${esc(payload.description || '\uff08\u7121\uff09')}</p>
<p class="form-title"><strong>部署 ID：</strong>${esc(result.deploymentId || '')}</p>

<div class="role-section role-user">
  <h2>\u4e00\u822c\u4f7f\u7528\u8005</h2>
  ${urlItem('\u8868\u55ae\u9023\u7d50\uff08\u5b8c\u6574\u7db2\u5740\uff09', result.publishedUrl, true)}
  ${urlItem('\u8868\u55ae\u9023\u7d50\uff08\u77ed\u7db2\u5740\uff09', result.shortViewUrl, true)}
  ${qrImgData ? `<div class="qr-section"><label>QR Code\uff08\u77ed\u7db2\u5740\uff09</label><img src="${qrImgData}" /></div>` : ''}
</div>

<div class="role-section role-maintainer">
  <h2>\u7dad\u8b77\u4eba\u54e1</h2>
  ${urlItem('\u8868\u55ae\u7de8\u8f2f\u9023\u7d50\uff08\u5b8c\u6574\u7db2\u5740\uff09', result.editUrl, true)}
  ${urlItem('\u8868\u55ae\u9023\u7d50\uff08\u5b8c\u6574\u7db2\u5740\uff09', result.publishedUrl, true)}
  ${urlItem('\u8868\u55ae\u9023\u7d50\uff08\u77ed\u7db2\u5740\uff09', result.shortViewUrl, true)}
  ${urlItem('回應試算表連結', result.responseSheetUrl, true)}
</div>

<div class="role-section role-developer">
  <h2>\u958b\u767c\u4eba\u54e1</h2>
  ${urlItem('\u8868\u55ae\u9023\u7d50\uff08\u77ed\u7db2\u5740\uff09', result.shortViewUrl, true)}
  ${urlItem('回應試算表連結（短網址）', result.shortResponseSheetUrl, true)}
  ${urlItem('\u8a66\u7b97\u8868\u9023\u7d50\uff08\u77ed\u7db2\u5740\uff09', result.shortSpreadsheetUrl, true)}
  ${urlItem('\u8868\u55ae ID', result.formId, false)}
  ${urlItem('部署 ID', result.deploymentId, false)}
  ${urlItem('PDF 檔案', result.pdfFileUrl, true)}
</div>
</body>
</html>`

    const iframe = document.createElement('iframe')
    iframe.style.position = 'fixed'
    iframe.style.right = '0'
    iframe.style.bottom = '0'
    iframe.style.width = '0'
    iframe.style.height = '0'
    iframe.style.border = '0'
    document.body.appendChild(iframe)

    iframe.srcdoc = html

    setTimeout(() => {
      iframe.contentWindow.focus()
      iframe.contentWindow.print()
      setTimeout(() => iframe.remove(), 1000)
    }, 300)
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

        <div className="result-summary">
          <div className="result-form-title">
            <strong>表單標題：</strong>{payload.title || '（未命名）'}
          </div>

          <div className="role-card role-files">
            <h3>建立檔案</h3>
            <div className="role-content">
              <UrlRow
                label="部署 ID"
                value={result.deploymentId || ''}
                onCopy={copyToClipboard}
              />
              <UrlRow
                label="Google 表單檔案名稱"
                value={result.formFileName || ''}
                onCopy={copyToClipboard}
              />
              <UrlRow
                label="回應試算表連結"
                value={result.responseSheetUrl || ''}
                onCopy={copyToClipboard}
              />
              <UrlRow
                label="回應試算表名稱"
                value={result.responseSheetName || ''}
                onCopy={copyToClipboard}
              />
              <UrlRow
                label="PDF 檔案名稱"
                value={result.pdfFileName || ''}
                onCopy={copyToClipboard}
              />
              <UrlRow
                label="PDF 檔案連結"
                value={result.pdfFileUrl || ''}
                onCopy={copyToClipboard}
              />
            </div>
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
                  <span className="qr-label">QR Code（短網址）</span>
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
                label="回應試算表連結（短網址）"
                value={result.shortResponseSheetUrl || ''}
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
              <UrlRow
                label="部署 ID"
                value={result.deploymentId || ''}
                onCopy={copyToClipboard}
              />
              <UrlRow
                label="PDF 檔案連結"
                value={result.pdfFileUrl || ''}
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
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    onCopy(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="url-row">
      <span className="url-label">{label}</span>
      <div className="copy-row">
        <div className="url-text">{value}</div>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={handleCopy}
        >
          {copied ? '已複製' : '複製'}
        </button>
      </div>
    </div>
  )
}
