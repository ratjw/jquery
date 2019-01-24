import {
  CASENUMSV, HNSV, NAMESV, DIAGNOSISSV, TREATMENTSV, ADMISSIONSV,
  FINALSV, PROFILESV, ADMITSV, OPDATESV, DISCHARGESV, QNSV
} from "../model/const.js"
import { POINTER, OLDCONTENT, getNewcontent } from "../control/edit.js"
import { fetchSaveService } from "../model/servicedb.js"
import { getBOOKrowByQN } from "../util/getrows.js"
import { updateBOOK } from "../util/variables.js"
import { URIcomponent, Alert } from "../util/util.js"
import { reViewService } from "./showService.js"
import { coloring } from "./coloring.js"
import { setSERVICE, SERVICE } from "./setSERVICE.js"
import { countAllServices } from "./countAllServices.js"

export function savePreviousCellService() {
	let newcontent = getNewcontent()

	if (!POINTER || (OLDCONTENT === newcontent)) {
		return
	}

	switch(POINTER.cellIndex)
	{
		case CASENUMSV:
		case HNSV:
		case NAMESV:
			break
		case DIAGNOSISSV:
			saveContentService(POINTER, "diagnosis", newcontent)
			break
		case TREATMENTSV:
			saveContentService(POINTER, "treatment", newcontent)
			break
		case ADMISSIONSV:
			saveContentService(POINTER, "admission", newcontent)
			break
		case FINALSV:
			saveContentService(POINTER, "final", newcontent)
			break
		case PROFILESV:
			saveProfileService(POINTER)
			break
		case ADMITSV:
		case OPDATESV:
		case DISCHARGESV:
			break
	}
}

//column matches column name in MYSQL
let saveContentService = function (pointed, column, content) {

	// Not refillService because it may make next cell back to old value
	// when fast entry, due to slow return from Ajax of previous input
	pointed.innerHTML = content || ''

	// take care of white space, double qoute, single qoute, and back slash
	content = URIcomponent(content)

	saveService(pointed, column, content)
}

function saveService(pointed, column, newcontent) {
	let $row = $(pointed).closest("tr"),
		row = $row[0],
		qn = row.cells[QNSV].innerHTML

	let doSaveService = function (newdata, olddata) {
		fetchSaveService(pointed, column, newdata, qn).then(response => {
			let hasResponse = function () {
				updateBOOK(response)

				// other user may add a row
				let oldlen = SERVICE.length
				setSERVICE(response.SERVICE)
				let newlen = SERVICE.length
				if (oldlen !== newlen) {
					reViewService()
				}

				coloring(bookq)
				countAllServices()
			},
			noResponse = function () {
				Alert("saveService", response)
				pointed.innerHTML = olddata
				// return to previous content
			};

			typeof response === "object" ? hasResponse() : noResponse()
		}).catch(error => {})
	}

	doSaveService(newcontent, OLDCONTENT)

	// make undo-able
/*	UndoManager.add({
		undo: function() {
			doSaveService(OLDCONTENT, newcontent)
			pointed.innerHTML = OLDCONTENT
		},
		redo: function() {
			doSaveService(newcontent, OLDCONTENT)
			pointed.innerHTML = newcontent
		}
	})*/
}

// each key is of different column in database
// select only the changed columns to save
export function saveProfileService(pointed)
{
	let newRecord = getNewRecord(pointed)

	newRecord = getDiff(pointed, newRecord)

	if ( Object.keys(newRecord).length ) {
		saveService(pointed, "", newRecord)
	}
}

function getNewRecord(pointing)
{
	let	$input = $(pointing).find(".divRecord input"),
		record = {}

	$input.each(function() {
		let newkey = this.name.replace(/\d+/g, "")

		if (this.type === "radio" || this.type === "checkbox") {
			record[newkey] = this.checked ? this.value : ""
		} else if (this.type === "number") {
			record[newkey] = this.value ? this.value : ""
		}
	})

	return record
}

function getDiff(pointing, newRecord)
{
	let qn = pointing.parentNode.lastElementChild.innerHTML,
		bookq = getBOOKrowByQN(SERVICE, qn),
		record = {}

	Object.entries(newRecord).forEach(([key, val]) => {
		if (bookq[key] != val) {
			record[key] = val
		}
	})

	return record
}
