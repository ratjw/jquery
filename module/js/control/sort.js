
import { clearTimer, resetTimerCounter } from "./timer.js"
import { clearEditcell } from "./edit.js"
import { clearMouseoverTR } from "../util/util.js"
import { sqlSortable } from "../model/sqlSortable.js"
import { calcWaitnum } from "../util/calcWaitnum.js"
import { getOpdate } from "../util/date.js"
import { sameDateRoomTableQNs } from "../util/rowsgetting.js"
import { BOOK, updateBOOK } from "../util/updateBOOK.js"
import { Alert, isConsults, isStaffname } from "../util/util.js"
import { viewmoveCase } from "../view/viewmoveCase.js"
import { hoverMain } from "../view/hoverMain.js"

// Sortable 2 windows connected with each other
// Trace placeholder to determine moving up or down
export function sortable () {
	let prevplace,
		thisplace,
		sender

	$("#maintbl tbody, #queuetbl tbody").sortable({
		items: "tr",
		connectWith: "#maintbl tbody, #queuetbl tbody",
		forceHelperSize: true,
		forcePlaceholderSize: true,
//		revert: true,
//		delay: 150,
		cancel: "tr:has('th')",
		start: function(e, ui){
			clearTimer()
			$('#stafflist').hide()
			clearEditcell()
			clearMouseoverTR()
			ui.placeholder.innerHeight(ui.item.outerHeight())
			prevplace = ui.placeholder.index()
			thisplace = ui.placeholder.index()
			sender = ui.item.closest('table').attr('id')
		},
		// Make scroll only the window that placeholder is in
		over: function(e, ui) {
			ui.item.data('sortableItem').scrollParent = ui.placeholder.closest("div");
			ui.item.data('sortableItem').overflowOffset = ui.placeholder.closest("div").offset();
		},
		// For determination of up or down
		change: function(e, ui){
			prevplace = thisplace
			thisplace = ui.placeholder.index()
		},
		stop: function(e, ui) {
			let moveitem = ui.item[0],
				receiver = moveitem.closest('table').id,
				moveqn = moveitem.dataset.qn,
				moveopdate = moveitem.dataset.opdate,
				staffname = moveitem.dataset.staffname

			// Allow drag to Consults, or same staff name
			// That is (titlename === "Consults") is allowed
			// To another staff name is not allowed
			// Not allow to drag a blank line
			let illegal = !moveqn
            || ((sender === "maintbl")
						&& (receiver === "queuetbl")
						&& !isConsults()
						&& !isStaffname(staffname))
						

			if (illegal) {
				stopsorting()
				return false
			}

			// Find nearest row by dropping position
			let thisdrop
			let before
			let previtem = moveitem.previousElementSibling
			let nextitem = moveitem.nextElementSibling

			if (!previtem || previtem.querySelector('th')) {
				thisdrop = nextitem
				before = 1
			} else {
				if (!nextitem || nextitem.querySelector('th')) {
					thisdrop = previtem
					before = 0
				} else {
					// Determine that the user intend to drop on which row
					//ui.offset (without '()') = helper position
					let helpertop = ui.offset.top
					let helperheight = moveitem.offsetHeight
					let helpercenter = helpertop + helperheight/2

					let placeholdertop = moveitem.getBoundingClientRect().top
					let placeholderheight = ui.placeholder.height()
					let placeholdercenter = placeholdertop + placeholderheight/2
					let placeholderbottom = placeholdertop + placeholderheight

					let nearprev = Math.abs(helpercenter - placeholdertop)
					let nearplace = Math.abs(helpercenter - placeholdercenter)
					let nearnext = Math.abs(helpercenter - placeholderbottom)
					let nearest = Math.min(nearprev, nearplace, nearnext)

					if (nearest === nearprev) {
						thisdrop = previtem
						before = 0
					} 
					if (nearest === nearnext) {
						thisdrop = nextitem
						before = 1
					}
					if (nearest === nearplace) {
						if ((prevplace === thisplace) && (sender === receiver)) {
							stopsorting()
							return false
						}
						if (prevplace < thisplace) {
							thisdrop = previtem
							before = 0
						} else {
							thisdrop = nextitem
							before = 1
						}
					}
				}
			}

      let allNewCases = [],
				allOldCases = [],
				thisopdate = thisdrop.dataset.opdate,
        thisqn = thisdrop.dataset.qn

			// drop on the same case
			if (thisqn === moveqn) { return }

			moveitem.dataset.waitnum = calcWaitnum(thisopdate, previtem, nextitem)
      allOldCases = sameDateRoomTableQNs(moveitem)
      allNewCases = sameDateRoomTableQNs(thisdrop)

			// remove itself from old sameDateRoom
			allOldCases = allOldCases.filter(e => e !== moveqn)

			// In case of new is the same date room as old
			if (allNewCases.find(e => e === moveqn)) {
				allNewCases = allOldCases
				allOldCases = []
			}

			// insert itself into new sameDateRoom before/after the clicked row
			let index = allNewCases.indexOf(thisqn)
			before
			? allNewCases.splice(index, 0, moveqn)
			: allNewCases.splice(index + 1, 0, moveqn)

			// after sorting, must attach hover to the changed DOM elements
			let doSorting = function() {
				sqlSortable(allOldCases, allNewCases, moveitem, thisdrop).then(response => {
					let hasData = function () {
						updateBOOK(response)
//						viewmoveCase(moveitem, thisdrop)
//						hoverMain()
					}

					typeof response === "object"
					? hasData()
					: Alert("Sortable", response)
				}).catch(error => {})
			}

			doSorting()
/*
			// make undo-able
			UndoManager.add({
				undo: function() {
					doSorting(argModelUndo)
				},
				redo: function() {
					doSorting(argModelDo)
				}
			})
*/
			stopsorting()
		}
	})
}

let stopsorting = function () {
	// Return to original place so that viewOneDay(moveopdate)
	// will not render this row in wrong position
	$("#maintbl tbody, #queuetbl tbody").sortable( "cancel" )

	// before sorting, timer was stopped by clearTimer
	resetTimerCounter()

	//  after sorting, editcell was placed at row 0 column 1
	//  and display at placeholder position in entire width
	$('#editcell').hide()
}
