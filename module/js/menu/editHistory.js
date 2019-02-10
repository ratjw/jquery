
import { sqlCaseHistory } from "../model/sqlCaseHistory.js"
import { Alert } from "../util/util.js"
import { viewCaseHistory } from "../view/viewCaseHistory.js"

export function editHistory()
{
  let row = document.querySelector(".selected"),
    hn = row.dataset.hn

  sqlCaseHistory(hn).then(response => {
    typeof response === "object"
    ? viewCaseHistory(row, hn, response)
    : Alert("caseHistory", response)
  }).catch(error => {})
}
