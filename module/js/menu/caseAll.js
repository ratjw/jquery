
import { sqlCaseAll } from "../model/sqlCaseAll.js"
import { Alert } from "../util/util.js"
import { viewCaseAll } from "../view/viewCaseAll.js"

// All cases (exclude the deleted ones)
export function caseAll() {
  sqlCaseAll().then(response => {
    typeof response === "object"
    ? viewCaseAll(response)
    : Alert("caseAll", response)
  }).catch(error => {})
}
