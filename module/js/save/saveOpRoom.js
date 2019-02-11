
import { sqlSaveOpRoom } from "../model/sqlSaveOpRoom.js"
import { sameDateRoomTableQNs, sameDateRoomTableRows } from "../util/rowsgetting.js"
import { updateBOOK } from "../util/updateBOOK.js"
import { Alert } from "../util/util.js"

export function saveOpRoom(pointed, newcontent) {
  let tableID = row.closest('table'),
    row = pointed.closest('tr'),
    opdate = row.dataset.opdate,
    oproom = row.dataset.oproom,
    qn = row.dataset.qn

  let allOldCases = sameDateRoomTableQNs(tableID, row)
  allOldCases = allOldCases.filter(e => e !== qn)

  row.dataset.oproom = newcontent
  let allNewCases = sameDateRoomTableRows(tableID, row)

  let timeCases = allNewCases.filter(e => e.dataset.optime !== "")
  let notimeCases = allNewCases.filter(e => e.dataset.optime === "")

  timeCases = timeCases.sort((e1, e2) => {
    if (e1.dataset.optime >= e2.dataset.optime) return 1
    return -1
  })

  let timeQNs = Array.from(timeCases, e => e.dataset.qn)
  let notimeQNs = Array.from(notimeCases, e => e.dataset.qn)
  allNewCases = timeQNs.concat(notimeQNs)

  sqlSaveOpRoom(allOldCases, allNewCases, oproom, newcontent, qn).then(response => {
    let hasData = function () {
      updateBOOK(response)
    };

    typeof response === "object"
    ? hasData()
    : Alert ("saveOpRoom", response)
  }).catch(error => {})
}
