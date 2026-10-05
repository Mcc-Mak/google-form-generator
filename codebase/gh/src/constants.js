export const STORAGE_KEY = 'gasWebAppUrl'

export const GAS_WEB_APP_URL =
  'https://script.google.com/macros/s/AKfycbyAOXxRKN86p4BsPrmUQmZN172JlfkKh5Q0TonJB42VL3xjexPJ2dLSkaTpOsDY2m-nUg/exec'

export const API_TOKEN_STORAGE_KEY = 'apiToken'

export const QUESTION_TYPES = [
  { label: '簡答', value: '簡答' },
  { label: '段落', value: '段落' },
  { label: '單選', value: '單選' },
  { label: '核取方塊', value: '核取方塊' },
  { label: '下拉式清單', value: '下拉式清單' },
  { label: '線性刻度', value: '線性刻度' },
  { label: '日期', value: '日期' },
  { label: '時間', value: '時間' },
]

export const CHOICE_TYPES = ['單選', '核取方塊', '下拉式清單']

export const SHEET_COLUMNS = {
  TYPE: '問題類型',
  TITLE: '問題標題',
  REQUIRED: '必填',
  OPTIONS: '選項',
}

export const STEP_LABELS = [
  '輸入網址',
  '選擇試算表',
  '選擇工作表',
  '設定問題',
  '資料夾與資訊',
  '顯示結果',
]

export const EMPTY_FIELD = { uid: '', type: '簡答', title: '', required: false, options: [] }
