import { STORAGE_KEY } from './constants'

export function getGasUrl() {
  return localStorage.getItem(STORAGE_KEY) || ''
}

export function setGasUrl(url) {
  localStorage.setItem(STORAGE_KEY, url)
}

export async function callGas(payload) {
  const url = getGasUrl()
  if (!url) {
    throw new Error('尚未設定 GAS Web App URL，請返回步驟一進行設定。')
  }

  let response
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
    })
  } catch {
    throw new Error('無法連線至後端服務，請檢查 GAS Web App URL 是否正確。')
  }

  if (!response.ok) {
    throw new Error('後端回應 HTTP 狀態碼：' + response.status)
  }

  let result
  try {
    result = await response.json()
  } catch {
    throw new Error('無法解析後端回應 JSON。')
  }

  if (!result.ok) {
    throw new Error(result.error || '未知的後端錯誤')
  }

  return result.data
}

export const listSpreadsheets = () => callGas({ action: 'listSpreadsheets' })

export const listSheets = (spreadsheetId) =>
  callGas({ action: 'listSheets', spreadsheetId })

export const getHeaders = (spreadsheetId, sheetName) =>
  callGas({ action: 'getHeaders', spreadsheetId, sheetName })

export const listFolders = () => callGas({ action: 'listFolders' })

export const createForm = (params) =>
  callGas({ action: 'createForm', ...params })
