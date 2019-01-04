
import {
  CASENUMSV, HNSV, NAMESV, DIAGNOSISSV, TREATMENTSV, ADMISSIONSV,
  FINALSV, PROFILESV, ADMITSV, OPDATESV, DISCHARGESV, QNSV
} from "../model/const.js"
import {
	OLDCONTENT, clearEditcell, createEditcell, editcellSaveData
} from "../control/edit.js"
import { isPACS } from "../util/variables.js"
import { inPicArea } from "../util/util.js"
import { showUpload } from "../get/showUpload.js"
import { saveService } from "./savePreviousCellService.js"
import { editableSV } from "./setSERVICE.js"
import { PACS } from "../get/PACS.js"

// Set up editcell for keyin
// redirect click to openPACS or file upload
export function editPresentCellService(evt, pointing) {
	let cindex = pointing.cellIndex

	switch(cindex)
	{
		case CASENUMSV:
			break
		case HNSV:
			getHNSV(evt, pointing)
			break
		case NAMESV:
			getNAMESV(evt, pointing)
			break
		case DIAGNOSISSV:
		case TREATMENTSV:
		case ADMISSIONSV:
		case FINALSV:
			editableSV && createEditcell(pointing)
			break
		case PROFILESV:
			editableSV && editcellSaveData(pointing, getRecord(pointing))
			break
		case ADMITSV:
		case DISCHARGESV:
			clearEditcell()
			break
	}
}

function getHNSV(evt, pointing)
{
	clearEditcell()
	if (isPACS) {
		if (inPicArea(evt, pointing)) {
			PACS(pointing.innerHTML)
		}
	}
}

function getNAMESV(evt, pointing)
{
	let hn = pointing.previousElementSibling
	let patient = pointing.innerHTML

	clearEditcell()
	if (inPicArea(evt, pointing)) {
		showUpload(hn, patient)
	}
}

export function getRecord(pointing)
{
	let	record = {},
		$input = $(pointing).find(".divRecord input")

	$input.each(function() {
		if (this.type === "checkbox" && !this.checked) {
			record[this.name] = ""
		} else {
			if (this.checked) {
				record[this.name] = this.title
			}
		}
	})

	return record
}
