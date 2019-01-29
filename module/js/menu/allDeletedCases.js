
import { sqlAllDeletedCases, sqlUndelete } from "../model/sqlAllDeletedCases.js"
import { getOpdate } from "../util/date.js"
import { getBOOKrowByQN } from "../util/rowsgetting.js"
import { BOOK, CONSULT, updateBOOK } from "../util/variables.js"
import { Alert, reposition } from "../util/util.js"
import { viewOneDay } from "../view/viewOneDay.js"
import { viewSplit } from "../view/viewSplit.js"
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

	doUndel(allCases, opdate, oproom, staffname, qn, 0)

/*	UndoManager.add({
		undo: function() {
			doUndel(allCases, opdate, oproom, staffname, qn, 1)
		},
		redo: function() {
			doUndel(allCases, opdate, oproom, staffname, qn, 0)
		}
	})*/
  })
}

export function doUndel(allCases, opdate, oproom, staffname, qn, del) {

	sqlUndelete(allCases, oproom, qn, del).then(response => {
		let hasData = function () {
			updateBOOK(response)
			viewOneDay(opdate)
			viewSplit(staffname)
			scrolltoThisCase(qn)
		};

		typeof response === "object"
		? hasData()
		: Alert("doUndel", response)
	}).catch(error => {})

	$('#dialogDeleted').dialog("close")
}

function sameDateRoomBookQNs(book, opdate, oproom)
{
	if (!oproom) { return [] }

	return book.filter(q => {
		return q.opdate === opdate && Number(q.oproom) === Number(oproom);
	}).map(e => e.qn)
}
