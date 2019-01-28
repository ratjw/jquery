
import { UndoManager } from "../model/UndoManager.js"
import { OPDATE, THEATRE, OPROOM, STAFFNAME, QN } from "../model/const.js"
import { fetchmoveCase } from "../model/sqlmove.js"
import { calcWaitnum } from "../util/calcWaitnum.js"
import { getOpdate } from "../util/date.js"
import { getBOOKrowByQN, sameDateRoomTableQNs } from "../util/rowsgetting.js"
import { BOOK, updateBOOK } from "../util/variables.js"
import { Alert } from "../util/util.js"
import { viewmoveCase } from "../view/viewmoveCase.js"
import { clearSelection } from "../control/clearSelection.js"

// Mark the case and initiate mouseoverTR underline the date to move to
export function moveCase()
{
	let $allRows = $("#tbl tr:has('td'), #queuetbl tr:has('td')")
	let	selected = document.querySelector(".selected")

	$allRows.mouseover(function() {
		$(this).addClass("pasteDate")
	})
	$allRows.mouseout(function() {
		$(this).removeClass("pasteDate")
	})
	$allRows.off("click").on("click", function(event) {
		clickDate(event, selected, this)
	})

	selected.classList.replace("selected", "moveCase")
}

function clickDate(event, selected, cell)
{
	let	moveqn = selected.lastElementChild.innerHTML,
    moverow = getBOOKrowByQN(BOOK, moveqn),
		moveOpdate = moverow.opdate,
		movestaffname = moverow.staffname,
		moveWaitnum = moverow.waitnum,
		movetheatre = moverow.theatre,
		moveroom = moverow.oproom,

		tblrow = cell.closest("tr"),
		thisOpdateth = tblrow.firstElementChild.innerHTML,
		thisOpdate = getOpdate(thisOpdateth),
		thisqn = tblrow.lastElementChild.innerHTML,
    thisrow = getBOOKrowByQN(BOOK, thisqn) || [],
		thistheatre = thisrow.theatre,
		thisroom = thisrow.oproom,
		thisWaitnum = calcWaitnum(thisOpdate, tblrow, tblrow.nextElementSibling),
		allOldCases,
		allNewCases,
		thisindex

  allOldCases = sameDateRoomTableQNs(BOOK, moverow)
  allNewCases = sameDateRoomTableQNs(BOOK, thisrow)

  // remove itself from old sameDateRoom
  allOldCases = allOldCases.filter(e => e !== moveqn)

  // remove itself from new if new === old
  if (allNewCases.find(e => e === moveqn)) {
    allNewCases = allOldCases
    allOldCases = []
  }

	// insert itself into new sameDateRoom after the clicked row
	thisindex = allNewCases.indexOf(thisqn)
	allNewCases.splice(thisindex + 1, 0, moveqn)

	let arg = {
		allOldCases: allOldCases,
		allNewCases: allNewCases,
		waitnum: thisWaitnum,
		thisdate: thisOpdate,
		thistheatre: thistheatre,
		moveroom: moveroom,
		thisroom: thisroom,
		moveqn: moveqn
	}

	let domoveCase = function (waitnum, movedate, thisdate, oproom) {
		fetchmoveCase(arg).then(response => {
			let hasData = function () {
				updateBOOK(response)
				viewmoveCase(movedate, thisdate, movestaffname)
			}

			typeof response === "object"
			? hasData()
			: Alert ("moveCase", response)
		}).catch(error => {})
	}

	event.stopPropagation()
	clearMouseoverTR()
    clearSelection()

	// click the same case
	if (thisqn === moveqn) { return }

	domoveCase(thisWaitnum, moveOpdate, thisOpdate, thisroom)

/*	UndoManager.add({
		undo: function() {
			domoveCase(moveWaitnum, thisOpdate, moveOpdate, moveroom)
		},
		redo: function() {
			domoveCase(thisWaitnum, moveOpdate, thisOpdate, thisroom)
		}
	})*/
}

export function clearMouseoverTR()
{
	$("#tbl tr:has('td'), #queuetbl tr:has('td')")
		.off("mouseover")
		.off("mouseout")
		.off("click")
	$(".pasteDate").removeClass("pasteDate")
	$(".moveCase").removeClass("moveCase")
}
