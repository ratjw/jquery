
import { clearEditcell } from "../control/edit.js"
import { sqlSaveCaseNum } from "../model/sqlSaveCaseNum.js"
import { sameDateRoomTableQNs } from "../util/rowsgetting.js"
import { updateBOOK } from "../util/updateBOOK.js"
import { Alert } from "../util/util.js"

export function saveCaseNum(pointed, newcontent)
{
  let tableID = pointed.closest('table').id,
    row = pointed.closest('tr'),
    opdate = row.dataset.opdate,
    qn = row.dataset.qn,
    allCases = []

  // must have oproom, if no, can't be clicked
  allCases = sameDateRoomTableQNs(tableID, row)
  allCases = allCases.filter(e => e !== qn)

  sqlSaveCaseNum(allCases, newcontent, qn).then(response => {
    let hasData = function () {
      updateBOOK(response)
    }
    let noData = function() {
      Alert ("saveCaseNum", response)
      clearEditcell()
    }

    typeof response === "object"
    ? hasData()
    : noData()
  }).catch(error => {})
}
