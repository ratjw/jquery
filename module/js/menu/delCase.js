
import { sqlDeleteCase } from "../model/sqlDeleteCase.js"
import { sameDateRoomTableQNs } from "../util/rowsgetting.js"
import { updateBOOK } from "../util/updateBOOK.js"
import { Alert } from "../util/util.js"
import { clearSelection } from "../control/clearSelection.js"

// not actually delete the case but set deleted = 1
// Remove the row if more than one case on that date, or on staff table
// Just blank the row if there is only one case
export function delCase() {
  let row = document.querySelector(".selected"),
    tableID = row.closest('table').id,
    prevrow = row.previousElementSibling,
    opdate = row.dataset.opdate,
    qn = row.dataset.qn,
    oproom = row.dataset.oproom,
    allCases = []

  if (!qn) {
    row.remove()
    clearSelection()
    return
  }

  if (oproom) {
    allCases = sameDateRoomTableQNs(tableID, row)
  }

  let deleteCase = function (del) {
    sqlDeleteCase(allCases, oproom, qn, 1).then(response => {
      let hasData = function () {
        updateBOOK(response)
      }

      typeof response === "object"
      ? hasData()
      : Alert ("delCase", response)
    }).catch(error => {})
  }

  clearSelection()
  deleteCase(1)
}
