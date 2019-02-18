
import { sqlSaveOpTime } from "../model/sqlSaveOpTime.js"
import { getOpdate } from "../util/date.js"
import { sameDateRoomTableRows } from "../util/rowsgetting.js"
import { updateBOOK } from "../util/updateBOOK.js"
import { Alert } from "../util/util.js"
import { OLDCONTENT } from "../control/edit.js"

export function saveOpTime(pointed, newcontent)
{
  let row = pointed.closest('tr'),
    tableID = row.closest('table').id,
    oproom = row.dataset.oproom,
    qn = row.dataset.qn

  // valid time 00.00 - 23.59 or ""
  if (newcontent && !/^([0-1][0-9]|2[0-3])\.([0-5][0-9])$/.test(newcontent)) { return }

  let allCases = sameDateRoomTableRows(tableID, row)

  row.dataset.optime = newcontent
  let timeCases = allCases.filter(e => e.dataset.optime !== "")
  let notimeCases = allCases.filter(e => e.dataset.optime === "")

  timeCases = timeCases.sort((e1, e2) => {
    if (e1.dataset.optime >= e2.dataset.optime) return 1
    return -1
  })
  row.dataset.optime = OLDCONTENT

  let timeQNs = timeCases.map(e => e.dataset.qn)
  let notimeQNs = notimeCases.map(e => e.dataset.qn)
  let allQNs = timeQNs.concat(notimeQNs)

  sqlSaveOpTime(allQNs, oproom, newcontent, qn).then(response => {
    let hasData = function () {
      updateBOOK(response)
    }

    typeof response === "object"
    ? hasData()
    : Alert ("saveOpTime", response)
  })
}
