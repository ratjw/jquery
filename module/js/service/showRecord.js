
import { editableSV } from "./setSERVICE.js"

export function showRecord(bookq)
{
	let $divRecord = $("#profileRecord > div").clone()

	initRecord(bookq, $divRecord)
	inputEditable($divRecord)
	return $divRecord[0]
}

// this.name === column in Mysql
// this.value === value of this item
// add qn to this.name to make it unique
// next sibling (span) right = wide pixels, to make it (span) contained in input box
function initRecord(bookq, $divRecord)
{
	let $input = $divRecord.find("input"),
		inputName = "",
		wide = ""

	$input.each(function() {
		inputName = this.name
		this.checked = this.value === bookq[inputName]
		this.name = inputName + bookq.qn
		wide = this.className.replace("w", "") + "px"
		if (this.type === "number") {
			this.value = bookq[inputName]
		} else {
			this.nextElementSibling.style.right = wide
		}
	})
}

function inputEditable($divRecord)
{
	if (editableSV) {
		$divRecord.find("input").prop("disabled", false)
	} else {
		$divRecord.find("input").prop("disabled", true)
	}
}
