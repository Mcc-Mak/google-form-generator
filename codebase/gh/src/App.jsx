import { useState, useCallback } from 'react'
import StepIndicators from './components/StepIndicators'
import StepUrl from './components/StepUrl'
import StepSpreadsheets from './components/StepSpreadsheets'
import StepSheets from './components/StepSheets'
import StepFields from './components/StepFields'
import StepFolder from './components/StepFolder'
import StepResult from './components/StepResult'
import { STEP_LABELS, CHOICE_TYPES } from './constants'

const TOTAL_STEPS = STEP_LABELS.length

const initialWizardState = {
  spreadsheetId: '',
  spreadsheetName: '',
  sheetName: '',
  headers: [],
  fields: [],
  folderId: '',
  formTitle: '',
  formDescription: '',
}

export default function App() {
  const [step, setStep] = useState(0)
  const [wiz, setWiz] = useState(initialWizardState)

  const patch = useCallback((p) => setWiz((prev) => ({ ...prev, ...p })), [])

  const goNext = useCallback(() => setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1)), [])
  const goBack = useCallback(() => setStep((s) => Math.max(s - 1, 0)), [])
  const goTo = useCallback((s) => setStep(Math.max(0, Math.min(s, TOTAL_STEPS - 1))), [])

  const reset = useCallback(() => {
    setWiz(initialWizardState)
    setStep(0)
  }, [])

  const selectSpreadsheet = useCallback((id, name) => {
    setWiz((prev) => ({
      ...prev,
      spreadsheetId: id,
      spreadsheetName: name,
      sheetName: '',
      headers: [],
      fields: [],
    }))
  }, [])

  const selectSheet = useCallback((name) => {
    setWiz((prev) => ({
      ...prev,
      sheetName: name,
      headers: [],
      fields: [],
    }))
  }, [])

  const setHeaders = useCallback((headers) => {
    const fields = headers.map((h) => ({
      title: h.title,
      type: '簡答',
      required: false,
      options: [],
    }))
    setWiz((prev) => ({ ...prev, headers, fields }))
  }, [])

  const updateField = useCallback((index, fieldPatch) => {
    setWiz((prev) => {
      const fields = prev.fields.map((f, i) =>
        i === index ? { ...f, ...fieldPatch } : f
      )
      return { ...prev, fields }
    })
  }, [])

  const buildCreatePayload = useCallback(() => {
    const fields = wiz.fields
      .filter((f) => f.title && f.title.trim() !== '')
      .map((f) => {
        const field = { title: f.title, type: f.type, required: !!f.required }
        if (CHOICE_TYPES.includes(f.type)) {
          field.options = f.options || []
        }
        return field
      })
    return {
      title: wiz.formTitle,
      description: wiz.formDescription,
      folderId: wiz.folderId,
      fields,
    }
  }, [wiz])

  return (
    <>
      <header className="site-header">
        <h1>Google 表單建立精靈</h1>
        <p className="subtitle">從 Google 試算表建立 Google 表單</p>
      </header>

      <main className="wizard-container">
        <StepIndicators current={step} onGoTo={goTo} />

        {step === 0 && <StepUrl onNext={goNext} />}

        {step === 1 && (
          <StepSpreadsheets
            spreadsheetId={wiz.spreadsheetId}
            onSelect={selectSpreadsheet}
            onNext={goNext}
            onBack={goBack}
          />
        )}

        {step === 2 && (
          <StepSheets
            spreadsheetId={wiz.spreadsheetId}
            sheetName={wiz.sheetName}
            onSelect={selectSheet}
            onNext={goNext}
            onBack={goBack}
          />
        )}

        {step === 3 && (
          <StepFields
            spreadsheetId={wiz.spreadsheetId}
            sheetName={wiz.sheetName}
            headers={wiz.headers}
            fields={wiz.fields}
            onHeadersLoaded={setHeaders}
            onUpdateField={updateField}
            onNext={goNext}
            onBack={goBack}
          />
        )}

        {step === 4 && (
          <StepFolder
            spreadsheetName={wiz.spreadsheetName}
            folderId={wiz.folderId}
            formTitle={wiz.formTitle}
            formDescription={wiz.formDescription}
            onSelectFolder={(folderId) => patch({ folderId })}
            onTitleChange={(formTitle) => patch({ formTitle })}
            onDescriptionChange={(formDescription) => patch({ formDescription })}
            onNext={goNext}
            onBack={goBack}
          />
        )}

        {step === 5 && (
          <StepResult
            payload={buildCreatePayload()}
            onBack={goBack}
            onRestart={reset}
          />
        )}
      </main>

      <footer className="site-footer">
        <p>Google 表單建立精靈 &mdash; 由 Google Apps Script 驅動</p>
      </footer>
    </>
  )
}
