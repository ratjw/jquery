import {
  CASENUMSV, HNSV, NAMESV, DIAGNOSISSV, TREATMENTSV, ADMISSIONSV,
  FINALSV, PROFILESV, ADMITSV, OPDATESV, DISCHARGESV, QNSV
} from "../model/const.js"
import { POINTER, OLDCONTENT, getNewcontent } from "../control/edit.js"
import { fetchSaveService } from "../model/fetchService.js"
import { getBOOKrowByQN } from "../util/getrows.js"
import { updateBOOK } from "../util/variables.js"
import { URIcomponent, Alert } from "../util/util.js"
import { reViewService } from "./showService.js"
import { countService } from "./countService.js"
import { setSERVICE, SERVICE } from "./setSERVICE.js"
import { UndoManager } from "../model/UndoManager.js"
import { getRecord } from "./editPresentCellService.js"

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

export function saveService(pointed, column, newcontent) {
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

				// Calc countService of this case only
				let oldclass = row.className,
					bookq = getBOOKrowByQN(SERVICE, qn),
					newclass = countService(bookq),
					oldclassArray = oldclass.split(" "),
					newclassArray = newclass.split(" "),
					counter,
					updateCounter = function (classArray, add) {
						$.each( classArray, function(i, each) {
							let counter = document.getElementById(each)
							counter.innerHTML = Number(counter.innerHTML) + add
						})
					};

				if (oldclass !== newclass) {
					updateCounter(oldclassArray, -1)
					updateCounter(newclassArray, 1)
					row.className = newclass
				}
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
	UndoManager.add({
		undo: function() {
			doSaveService(OLDCONTENT, newcontent)
			pointed.innerHTML = OLDCONTENT
		},
		redo: function() {
			doSaveService(newcontent, OLDCONTENT)
			pointed.innerHTML = newcontent
		}
	})
}

// each key is of different column in database
// select only the changed columns to save
export function saveProfileService(pointed)
{
	let newRecord = getRecord(pointed),
		oldRecord = OLDCONTENT,
		setRecord = {},
		$pointing = $(pointed),
		newkey

	$.each(newRecord, function(key, val) {
		if (val === oldRecord[key]) {
			delete newRecord[key]
		}
	})
	if ( Object.keys(newRecord).length ) {
		$.each(newRecord, function(key, val) {
		   newkey = key.replace(/\d+/g, "");
		   setRecord[newkey] = newRecord[key];
		})
		saveService($pointing[0], "", setRecord)
	}
}
