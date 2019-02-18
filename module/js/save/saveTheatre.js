
import { sqlSaveTheatre } from "../model/sqlSaveTheatre.js"
import { getOpdate } from "../util/date.js"
import { sameDateRoomTableQNs } from "../util/rowsgetting.js"
import { updateBOOK } from "../util/updateBOOK.js"
import { Alert } from "../util/util.js"
import { OLDCONTENT } from "../control/edit.js"

export function saveTheatre(pointed, newcontent)
{
  let row = pointed.closest('tr'),
    tableID = row.closest('table').id,
    opdate = row.dataset.opdate,
    oproom = row.dataset.oproom,
    casenum = row.dataset.casenum,
    qn = row.dataset.qn,
    allOldCases = [],
    allNewCases = []

  allOldCases = sameDateRoomTableQNs(tableID, row)
  allOldCases = allOldCases.filter(e => e !== qn)

  row.dataset.theatre = newcontent
  allNewCases = sameDateRoomTableQNs(tableID, row)

  // insert into new theatre/room according to its casenum
  allNewCases.splice(allNewCases.indexOf(qn), 1)
  if (casenum) {
    allNewCases.splice(casenum-1, 0, qn)
  } else {
    allNewCases.push(qn)
  }
  row.dataset.theatre = OLDCONTENT

  sqlSaveTheatre(allOldCases, allNewCases, newcontent, oproom, qn).then(response => {
    let hasData = function () {
      updateBOOK(response)
    }

    typeof response === "object"
    ? hasData()
    : Alert ("saveTheatre", response)
  })
}
