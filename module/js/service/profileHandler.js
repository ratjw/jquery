
import { countAllServices } from "./countAllServices.js"
import { showInputColor, operationToDisease } from "./clickProfile.js"

export function profileHandler()
{
  // save previous value to determine increasing or decreasing
  $('#servicetbl input[type=number]').on('mousedown keydown mousewheel', function(e) {
    // save number radios input before changed
    if (this.value) { this.prevVal = this.value }
  })
  .on('input', function(e) {
    if (/operated/.test(this.name)) {
      operationToDisease(this)
    }
    showInputColor(e.target)
    countAllServices()
  })

  // hack for click and unchecked a radio input
  $('#servicetbl label:has(input[type=radio])').on('mousedown', function(e) {
    var radios = $(this).find('input[type=radio]')
    var wasChecked = radios.prop('checked')

    // check all disease radios input before changed
    let inCell = this.closest("td")
    let qn = inCell.parentElement.lastElementChild.innerHTML
    let inputDisease = inCell.querySelectorAll("input[name='disease" + qn + "']")

    radios[0].beforeDz = Array.from(inputDisease).filter(i => i.checked).length
    radios[0].turnOff = wasChecked
    radios.prop('checked', !wasChecked)
  })
  .on('click', function(e) {
    var radios = $(this).find('input[type=radio]')
    radios.prop('checked', !radios[0].turnOff)
  })
}
