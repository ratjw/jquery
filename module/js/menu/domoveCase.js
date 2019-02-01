
import { sqlmoveCase } from "../model/sqlmoveCase.js"
import { updateBOOK } from "../util/variables.js"
import { Alert } from "../util/util.js"
import { viewmoveCase } from "../view/viewmoveCase.js"
import { calcWaitnum } from "../util/calcWaitnum.js"

export function domoveCase(allOldCases, allNewCases, moverow, thisrow)
{
  let thisopdate = thisrow.dataset.opdate

  moverow.dataset.waitnum = calcWaitnum(thisopdate, thisrow, thisrow.nextElementSibling)

  sqlmoveCase(allOldCases, allNewCases, moverow, thisrow).then(response => {
    let hasData = function () {
      updateBOOK(response)
      viewmoveCase(moverow, thisrow)
    }

    typeof response === "object"
    ? hasData()
    : Alert ("moveCase", response)
  }).catch(error => {})
/*
  UndoManager.add({
    undo: function() {
      domoveCase(moveWaitnum, thisopdate, moveOpdate, moveroom)
    },
    redo: function() {
      domoveCase(thisWaitnum, moveOpdate, thisopdate, thisroom)
    }
  })
*/
}
