
import { searchCases, searchDB } from "./searchCases.js"
import { caseAll } from "./caseAll.js"
import { deletedCases } from "./deletedCases.js"
import { readme } from "./readme.js"
import { addnewrow } from "./addnewrow.js"
import { postponeCase } from "./postponeCase.js"
import { moveCase } from "./moveCase.js"
import { editHistory } from "./editHistory.js"
import { delCase } from "./delCase.js"
import { sendtoExcel } from "./sendtoExcel.js"
import { sendtoLINE, toLINE } from "./sendtoLINE.js"

let onclick = {
	"clicksearchCases": searchCases,
	"clickcaseAll": caseAll,
	"clickdeletedCases": deletedCases,
//	"clickreadme": readme,
	"addrow": addnewrow,
	"postponecase": postponeCase,
	"moveCase": moveCase,
	"clickeditHistory": editHistory,
	"delcase": delCase,
//	"clicksendtoExcel": sendtoExcel,
	"clicksendtoLINE": sendtoLINE,
	"buttonLINE": toLINE,
	"clicksearchDB": searchDB
}

export function setClickMenu()
{
	$.each(onclick, function(key, val) {
		document.getElementById(key).onclick = val
	})
}
