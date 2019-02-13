
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
export function viewEquip(equip)
{
  if (equip) {
    return viewEquipJSON(JSON.parse(equip))
  }
  return ""
}

export function viewEquipNoImg(equip)
{
  if (equip) {
    return viewEquipText(JSON.parse(equip))
  }
  return ""
}

export function viewEquipJSON(equipJSON)
{
  if (Object.entries(equipJSON).length) {
    return viewEquipText(equipJSON) + "<br>" + viewEquipImage(equipJSON)
  }
  return ""
}

function viewEquipText(equipJSON)
{
  let equip = [],
    monitor = []

  $.each(equipJSON, function(key, value) {
    if (value === "checked") {
      if (key in EQUIPICONS) {
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
  
  return equip + monitor
}

function viewEquipImage(equipJSON)
{
  let equip = [],
    monitor = [],
    equipPics = [],
    img = ""

  $.each(equipJSON, function(key, value) {
    if (value === "checked") {
      if (key in EQUIPICONS) {
        equipPics.push(EQUIPICONS[key])
      } 
    }
  })

  // remove duplicated pics
  equipPics = [...new Set(equipPics)]

  // display 6 pics: pale the not-checked ones
  EQUIPICONSHOWN.forEach((item) => {
    if (equipPics.includes(item)) {
    img += `<img src="css/pic/equip/${item}.jpg"> `
    equipPics = equipPics.filter(e => e !== item)
  } else {
    img += `<img class="imgpale" src="css/pic/equip/${item}.jpg"> `
  }
  })
  
  return img + equipImg(equipPics)
}

function equipImg(equipPics)
{
  let img = ""

  equipPics.forEach(function(item) {
    img += `<img src="css/pic/equip/${item}.jpg"> `
  })

  return img
}
