export default function StepUrl({ onNext }) {
  return (
    <section className="wizard-step active">
      <h2>步驟一：後端服務設定</h2>
      <p className="step-desc">
        本應用已內建 Google Apps Script Web App 後端網址，無需手動設定。
      </p>

      <div className="config-info">
        <h3>後端服務資訊</h3>
        <dl>
          <dt>服務名稱</dt>
          <dd>Google Apps Script Web App</dd>
          <dt>部署網址</dt>
          <dd className="config-url">
            https://script.google.com/macros/s/AKfycbzN09AHK1xRtgOG7AywmiLHown1ltjCTwS-sHpTHTe82bmT3uIQ2O6xlcUrtNw8Pg6gCA/exec
          </dd>
          <dt>存取權限</dt>
          <dd>任何人（匿名）</dd>
          <dt>執行身分</dt>
          <dd>部署者</dd>
        </dl>
        <p className="config-note">
          此網址已硬編碼於應用程式中，所有後端資料操作皆透過此網址進行。
          若需更改後端服務，請聯繫開發人員修改原始碼中的 <code>GAS_WEB_APP_URL</code> 常數。
        </p>
      </div>

      <div className="button-row">
        <button type="button" className="btn btn-primary" onClick={onNext}>
          下一步
        </button>
      </div>
    </section>
  )
}
