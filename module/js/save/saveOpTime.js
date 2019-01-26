
import { OPDATE, THEATRE, OPROOM, STAFFNAME, QN } from "../model/const.js"
import { fetchSaveOpTime } from "../model/sqlsavedata.js"
import { getOpdate } from "../util/date.js"
import { getBOOKrowByQN, sameDateRoomBOOKRows } from "../util/rowsgetting.js"
import { BOOK, updateBOOK } from "../util/variables.js"
import { Alert } from "../util/util.js"
import { viewOneDay } from "../view/viewOneDay.js"
import { viewSplit } from "../view/viewSplit.js"

export function saveOpTime(pointed, newcontent)
{
	let	row = pointed.closest('tr'),
		qn = row.qn

	// valid time 00.00 - 23.59 or ""
	if (newcontent && !/^([0-1][0-9]|2[0-3])\.([0-5][0-9])$/.test(newcontent)) { return }

	let allCases = sameDateRoomBOOKRows(BOOK, row)

  allCases.find(e => e.qn === qn).optime = newcontent

	let timeCases = allCases.filter(e => e.optime !== "")
	let notimeCases = allCases.filter(e => e.optime === "")

	timeCases = timeCases.sort((e1, e2) => {
    if (e1.optime >= e2.optime) return 1
    return -1
  })

	let timeQNs = Array.from(timeCases, e => e.qn)
	let notimeQNs = Array.from(notimeCases, e => e.qn)
	let allQNs = timeQNs.concat(notimeQNs)

	fetchSaveOpTime(allQNs, newcontent, qn).then(response => {
		let hasData = function () {
			updateBOOK(response)
			viewOneDay(row.opdate)
			viewSplit(row.staffname)
		}

		typeof response === "object"
		? hasData()
		: Alert ("saveOpTime", response)
	})
}
