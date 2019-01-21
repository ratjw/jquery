
import { fetchAllDeletedCases, fetchUndelete } from "../model/search.js"
import { getOpdate } from "../util/date.js"
import { getBOOKrowByQN } from "../util/getrows.js"
import { BOOK, CONSULT, updateBOOK } from "../util/variables.js"
import { Alert, reposition } from "../util/util.js"
import { viewOneDay } from "../view/viewOneDay.js"
import { viewSplit } from "../view/viewSplit.js"
import { viewDeletedCases } from "../view/viewDeletedCases.js"
import { scrolltoThisCase } from "../view/scrolltoThisCase.js"

export function deletedCases()
{
	fetchAllDeletedCases().then(response => {
		if (typeof response === "object") {
			viewDeletedCases(response)
			$(".toUndelete").off("click").on("click", function () {
				toUndelete(this, response)
			})
		} else {
			Alert("allDeletedCases", response)
		}
	}).catch(error => {})
}

function toUndelete(thisdate, deleted) 
{
  let UNDELOPDATE      = 0;
  let UNDELSTAFFNAME   = 1;
//  let UNDELHN        = 2;
//  let UNDELPATIENT   = 3;
//  let UNDELDIAGNOSIS = 4;
//  let UNDELTREATMENT = 5;
//  let UNDELCONTACT   = 6;
//  let UNDELEDITOR    = 7;
//  let UNDELEDITDATETIME  = 8;
  let UNDELQN         = 9;
  let $thisdate = $(thisdate)
  let $undelete = $("#undelete")

  reposition($undelete, "left center", "left center", $thisdate)

  $("#undel").off().on("click", function() {
    let $thiscase = $thisdate.closest("tr").children("td"),
      opdateth = $thiscase.eq(UNDELOPDATE).html(),
      opdate = getOpdate(opdateth),
      staffname = $thiscase.eq(UNDELSTAFFNAME).html(),
      qn = $thiscase.eq(UNDELQN).html(),

      delrow = getBOOKrowByQN(deleted, qn),
      waitnum = delrow.waitnum || 1,
      oproom = delrow.oproom,
      casenum = delrow.casenum,

      book = (waitnum < 0)? CONSULT : BOOK,
      allCases = sameDateRoomBookQN(book, opdate, oproom),
	  del

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

	fetchUndelete(allCases, oproom, qn, del).then(response => {
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

function sameDateRoomBookQN(book, opdate, room)
{
	if (!room) { return [] }

	var sameRoom = book.filter(row => {
		return row.opdate === opdate && Number(row.oproom) === Number(room);
	})
	$.each(sameRoom, function(i) {
		sameRoom[i] = this.qn
	})
	return sameRoom
}
