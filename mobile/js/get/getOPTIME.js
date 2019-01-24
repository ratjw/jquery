
import { createEditcell } from "../control/edit.js"

export function getOPTIME(pointing)
{
	let	oldtime = pointing.innerHTML || "09.00",
		$editcell = $("#editcell"),
		newtime,
		html = '<input id="spin">'

	// no case
	if ( !$(pointing).siblings(":last").html() ) { return }

	createEditcell(pointing)
	$editcell.css("width", 65)
	$editcell.html(html)

	let $spin = $("#spin")
	$spin.css("width", 60)
	$spin.spinner({
		min: 0,
		max: 24,
		step: 0.5,
		create: function( event, ui ) {
			$spin.val(oldtime)
		},
		spin: function( event, ui ) {
			newtime = decimalToTime(ui.value)
		},
		stop: function( event, ui ) {
			if (newtime !== undefined) {
				$spin.val(newtime)
				newtime = ""
			}
		}
	})
	$spin.focus()
}

function decimalToTime(dec)
{
  if (dec === 0) { return "" }

  let  integer = Math.floor(dec),
    decimal = dec - integer

  return [
    (integer < 10) ? "0" + integer : "" + integer,
    decimal ? String(decimal * 60) : "00"
  ].join(".")
}
