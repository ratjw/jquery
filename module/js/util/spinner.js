
export function spinNumber($spin, oldval)
{
  let newval = null

  $spin.css("width", 37)
  $spin.val(oldval)
  $spin.spinner({
    min: 0,
    max: 99,
    step: 1,
    // make newval 0 as blank value
    spin: function( event, ui ) {
      event.preventDefault()
      newval = ui.value || ""
    },
    stop: function( event, ui ) {
      if (newval !== null) {
        $spin.val(newval)
        newval = null
      }
    }
  })
  $spin.focus()
}

export function spinTime($spin, oldtime)
{
  let newtime = ""

  $spin.css("width", 60)
  $spin.spinner({
    min: 0,
    max: 24,
    step: 0.5,
    create: function( event, ui ) {
      $spin.val(oldtime)
    },
    spin: function( event, ui ) {
      event.preventDefault()
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
