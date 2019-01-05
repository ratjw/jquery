
import { clearEditcell } from "../control/edit.js"
import { inPicArea } from "../util/util.js"
import { showUpload } from "./showUpload.js"

export function getNAME(evt, pointing)
{
	let hn = pointing.previousElementSibling.innerHTML
	let patient = pointing.innerHTML

	if (inPicArea(evt, pointing)) {
		showUpload(hn, patient)
	}
	clearEditcell()
}
