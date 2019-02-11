
import { sqlAllDeletedCases, sqlUndelete } from "../model/sqlAllDeletedCases.js"
import { BOOK, CONSULT, updateBOOK } from "../util/updateBOOK.js"
import { Alert, reposition } from "../util/util.js"
import { viewAllDeletedCases } from "../view/viewAllDeletedCases.js"
import { scrolltoThisCase } from "../view/scrolltoThisCase.js"

export function allDeletedCases()
{
  sqlAllDeletedCases().then(response => {
    if (typeof response === "object") {
      viewAllDeletedCases(response)
    } else {
      Alert("allDeletedCases", response)
    }
  }).catch(error => {})
}

export function toUndelete(thisdate, deleted) 
{
  reposition($("#undelete"), "left center", "left center", thisdate)

  // #undelete, #undel are not in the table, just showing, recieving the click and go
  $("#undel").off().on("click", function() {
    let row = thisdate.closest("tr"),
      waitnum = row.dataset.waitnum,
      opdate = row.dataset.opdate,
      oproom = row.dataset.oproom,
      casenum = row.dataset.casenum,
      staffname = row.dataset.staffname,
      qn = row.dataset.qn,

      book = (waitnum < 0)? CONSULT : BOOK,
      allCases = sameDateRoomBookQNs(book, opdate, oproom)

    allCases.splice(casenum, 0, qn)

    sqlUndelete(allCases, oproom, qn, 0).then(response => {
      let hasData = function () {
        updateBOOK(response)
        scrolltoThisCase(qn)
      };

      typeof response === "object"
      ? hasData()
      : Alert("toUndelete", response)
    }).catch(error => {})

    $('#dialogAllDeleted').dialog("close")
  })
}

function sameDateRoomBookQNs(book, opdate, oproom)
{
  if (!oproom) { return [] }

  return book.filter(q => {
    return q.opdate === opdate && Number(q.oproom) === Number(oproom);
  }).map(e => e.qn)
}
