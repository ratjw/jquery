
const EQUIPICONS = {
    Fluoroscope: "Fluoroscope",
    "Navigator_frameless": "Navigator",
    "Navigator_with-frame": "Navigator",
    Oarm: "Oarm",
    Robotics: "Robotics",
    Microscope: "Microscope",
    ICG: "Microscope",
    Endoscope: "Endoscope",
    Excell: "CUSA",
    Soring: "CUSA",
    Sonar: "CUSA",
    ultrasound: "Ultrasound",
    Doppler: "Ultrasound",
    Duplex: "Ultrasound",
    CN5: "Monitor",
    CN6: "Monitor",
    CN7: "Monitor",
    CN8: "Monitor",
    CN9: "Monitor",
    CN10: "Monitor",
    CN11: "Monitor",
    CN12: "Monitor",
    SSEP: "Monitor",
    EMG: "Monitor",
    MEP: "Monitor"
}

const EQUIPICONSHOWN = [
	"Fluoroscope",
	"Navigator",
	"Microscope",
	"CUSA",
	"Endoscope",
	"Monitor"
]

// Add all equipments in one string to show in 1 cell
export function viewEquip(equipString)
{
  return equipString ? viewEquipJSON(JSON.parse(equipString)) : ""
}

export function viewEquipJSON(equipJSON)
{
  let equip = [],
    monitor = [],
	equipPics = [],
	img = ""

  $.each(equipJSON, function(key, value) {
    if (value === "checked") {
      if (key in EQUIPICONS) {
        equipPics.push(EQUIPICONS[key])
        if (EQUIPICONS[key] === "Monitor") {
          monitor.push(key)
        } else {
          equip.push(key)
		}
      } else {
        equip.push(key)
	  }
    } else {
      if (key === "Monitor") {
        monitor.push(value)
      } else {
        equip.push(key + ":" + value)
      }
    }
  })

  // convert to string
  equip = equip.length ? equip.join('; ') : ''
  monitor = monitor.length ? "; Monitor:" + monitor.toString() : ''

  // remove duplicated pics
  equipPics = equipPics.filter(function(pic, pos) {
    return equipPics.indexOf(pic) === pos;
  })

  EQUIPICONSHOWN.forEach((item) => {
    if (equipPics.includes(item)) {
	  img += `<img src="css/pic/equip/${item}.jpg"> `
	  equipPics = equipPics.filter(e => e !== item)
	} else {
	  img += `<img class="imgpale" src="css/pic/equip/${item}.jpg"> `
	}
  })
  
  return equip + monitor + "<br>" + img + equipImg(equipPics)
}

function equipImg(equipPics)
{
  let img = ""

  equipPics.forEach(function(item) {
    img += `<img src="css/pic/equip/${item}.jpg"> `
  })

  return img
}
