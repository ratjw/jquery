
import { sqlmoveCase } from "../model/sqlmoveCase.js"
import { updateBOOK } from "../util/updateBOOK.js"
import { Alert } from "../util/util.js"
import { calcWaitnum } from "../util/calcWaitnum.js"

export function domoveCase(allOldCases, allNewCases, moverow, thisrow)
{
  let thisopdate = thisrow.dataset.opdate

  moverow.dataset.waitnum = calcWaitnum(thisopdate, thisrow, thisrow.nextElementSibling)

  sqlmoveCase(allOldCases, allNewCases, moverow, thisrow).then(response => {
    let hasData = function () {
      updateBOOK(response)
    }

    typeof response === "object"
    ? hasData()
    : Alert ("moveCase", response)
  }).catch(error => {})
}
