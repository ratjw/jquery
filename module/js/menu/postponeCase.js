
import { UndoManager } from "../model/UndoManager.js"
import { LARGESTDATE } from "../model/const.js"
import { sqlPostponeCase } from "../model/sqlPostponeCase.js"
import { getOpdate } from "../util/date.js"
import { sameDateRoomTableQNs } from "../util/rowsgetting.js"
import { BOOK, updateBOOK } from "../util/updateBOOK.js"
import { Alert, getLargestWaitnum, isSplit } from "../util/util.js"
import { viewPostponeCase } from "../view/viewPostponeCase.js"
import { clearSelection } from "../control/clearSelection.js"
import { locateFound } from "../view/scrolltoThisCase.js"

// Undefined date booking has opdate set to LARGESTDATE
// but was shown blank date on screen
export function postponeCase()
{
  let  selected = document.querySelector(".selected"),
    tableID = selected.closest('table').id,
    row = selected.closest('tr'),
    opdate = row.dataset.opdate,
    oproom = row.dataset.oproom,
    staffname = row.dataset.staffname,
    qn = row.dataset.qn,
    oldwaitnum = row.dataset.waitnum,
    allCases = []

  if (oproom) {
    allCases = sameDateRoomTableQNs(row)
  }

  row.dataset.waitnum = Math.ceil(getLargestWaitnum(BOOK, staffname)) + 1
  doPostponeCase(LARGESTDATE)
  clearSelection()

  function doPostponeCase(thisdate) {
    sqlPostponeCase(allCases, row, thisdate).then(response => {
      let hasData = function () {
        updateBOOK(response)
if (isSplit()) {
  locateFound('queuecontainer', 'queuetbl', qn)
}
//        viewPostponeCase(row, thisdate)
      }

      typeof response === "object"
      ? hasData()
      : Alert ("postponeCase", response)
    }).catch(error => {})
  }
/*
  UndoManager.add({
    undo: function() {
      doPostponeCase(oldwaitnum, opdate)
    },
    redo: function() {
      doPostponeCase(newwaitnum, LARGESTDATE)
    }
  })*/
}
