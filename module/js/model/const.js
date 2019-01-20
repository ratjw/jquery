
//--- constants ---------------------

export const
//tbl, queuetbl
OPDATE		= 0,
THEATRE		= 1,
OPROOM		= 2,
OPTIME		= 3,
CASENUM		= 4,
STAFFNAME	= 5,
HN			= 6,
PATIENT		= 7,
DIAGNOSIS	= 8,
TREATMENT	= 9,
EQUIPMENT	= 10,
CONTACT		= 11,
QN			= 12,

//servicetbl
CASENUMSV	= 0,
HNSV		= 1,
NAMESV		= 2,
DIAGNOSISSV	= 3,
TREATMENTSV	= 4,
ADMISSIONSV	= 5,
FINALSV		= 6,
PROFILESV	= 7,
ADMITSV		= 8,
OPDATESV	= 9,
DISCHARGESV	= 10,
QNSV		= 11,

THAIMONTH		= ["มค.", "กพ.", "มีค.", "เมย.", "พค.", "มิย.", "กค.", "สค.", "กย.", "ตค.", "พย.", "ธค."],
LARGESTDATE		= "9999-12-31",

COMPLICATION = ["Readmission", "Reoperation", "Infection", "Morbidity", "Dead"],

// ["type", "width", "name", "id" (also used in label for), "label"]
EQUIPSHEET = [
    ["spanInSpan", "70", "", "oproom", "ห้อง "],
    ["spanInSpan", "70", "", "casenum", "Case "],
    ["spanInSpan", "120", "", "optime", "เวลา "],
    ["spanInSpan", "", "", "opday", "วัน"],
    ["spanInSpan", "150", "", "opdate", "ที่ "],
    ["spanInSpan", "150", "", "staffname", "Surgeon "],
    ["br", "", "", "", ""],
    ["br", "", "", "", ""],
    ["span", "110", "", "", "ชื่อ-นามสกุล"],
    ["span", "", "", "patientname", ""],
    ["span", "20", "", "", ""],
    ["span", "", "", "", "อายุ&nbsp;"],
    ["span", "", "", "age", ""],
    ["span", "20", "", "", ""],
    ["span", "", "", "", "HN&nbsp;"],
    ["span", "", "", "hn", ""],
    ["br", "", "", "", ""],
    // floatleft makes the subsequent text rows go downwards
    // instead of pushing previous rows upward
    ["span", "110 floatleft", "", "", "Diagnosis"],
    ["span", "540", "", "diagnosis", ""],
    ["br", "", "", "", ""],
    ["span", "110 floatleft", "", "", "Operation"],
    ["span", "540", "", "treatment", ""],
    ["br", "", "", "", ""],
    ["br", "", "", "", ""],
    ["divbegin", "", "ส่วนเกิน", "", ""],
    ["span", "110", "", "", ""],
    ["span", "", "", "", "<i><b>***</b> ผู้ป่วยและญาติสามารถ<b><u>จ่ายส่วนเกินได้ </u></b></i> "],
    ["text", "", "110 textcenter", "copay", ""],
    ["span", "", "", "", " บาท <b>***</b>"],
    ["divend", "", "", "", ""],
    ["br", "", "", "", ""],
    ["divbegin", "", "position", "", ""],
    ["span", "110", "", "clearPosition", "Position <small>(คลิกลบ)</small>"],
    ["radio", "170", "pose", "Supine_left", "Supine left"],
    ["radio", "170", "pose", "Supine_right", "Supine right"],
    ["radio", "170", "pose", "Supine", "Supine"],
    ["br", "", "", "", ""],
    ["span", "110", "", "", ""],
    ["radio", "170", "pose", "Parkbench_ขวาลง", "Parkbench ขวาลง"],
    ["radio", "170", "pose", "Lateral_ขวาลง", "Lateral ขวาลง"],
    ["radio", "170", "pose", "Semiprone_ขวาลง", "Semiprone ขวาลง"],
    ["br", "", "", "", ""],
    ["span", "110", "", "", ""],
    ["radio", "170", "pose", "Parkbench_ซ้ายลง", "Parkbench ซ้ายลง"],
    ["radio", "170", "pose", "Lateral_ซ้ายลง", "Lateral ซ้ายลง"],
    ["radio", "170", "pose", "Semiprone_ซ้ายลง", "Semiprone ซ้ายลง"],
    ["br", "", "", "", ""],
    ["span", "110", "", "", ""],
    ["radio", "170", "pose", "Concorde", "Concorde"],
    ["radio", "170", "pose", "Prone", "Prone"],
    ["br", "", "", "", ""],
    ["span", "110", "", "", ""],
    ["text", "", "500", "position", ""],
    ["divend", "", "", "", ""],
    ["br", "", "", "", ""],
    ["br", "", "", "", ""],
    ["divbegin", "", "", "", "Imaging"],
    ["span", "110", "", "", "Imaging"],
    ["checkbox", "170", "", "Navigator_frameless", "Navigator frameless"],
    ["checkbox", "170", "", "Navigator_with-frame", "Navigator with frame"],
    ["checkbox", "", "", "Stereotactic_frame-based", "Stereotactic frame-based"],
    ["br", "", "", "", ""],
    ["span", "110", "", "", ""],
    ["checkbox", "170", "", "Fluoroscope", "Fluoroscope"],
    ["checkbox", "170", "", "Robotics", "Robotics"],
    ["checkbox", "170", "", "O-arm", "O-arm"],
    ["br", "", "", "", ""],
    ["span", "110", "", "", ""],
    ["checkbox", "170", "", "iMRI", "iMRI"],
    ["checkbox", "170", "", "iCT", "iCT"],
    ["br", "", "", "", ""],
    ["span", "110", "", "", ""],
    ["text", "", "500", "Imaging", ""],
    ["divend", "", "", "", ""],
    ["br", "", "", "", ""],
    ["br", "", "", "", ""],
    ["divbegin", "", "", "", "อุปกรณ์ยึดผู้ป่วย"],
    ["span", "110", "", "", "อุปกรณ์ยึดผู้ป่วย"],
    ["checkbox", "170", "", "Mayfield", "Mayfield"],
    ["checkbox", "170", "", "GelHeadRing", "Gel Head Ring"],
    ["checkbox", "170", "", "Horseshoe", "Horseshoe"],
    ["br", "", "", "", ""],
    ["span", "110", "", "", ""],
    ["text", "", "500", "อุปกรณ์ยึดผู้ป่วย", ""],
    ["divend", "", "", "", ""],
    ["br", "", "", "", ""],
    ["br", "", "", "", ""],
    ["divbegin", "", "", "", "เครื่องตัดกระดูก"],
    ["span", "110", "", "", "เครื่องตัดกระดูก"],
    ["checkbox", "170", "", "HighSpeedDrill", "High Speed Drill"],
    ["checkbox", "170", "", "SagittalSaw", "Sagittal Saw"],
    ["checkbox", "170", "", "Osteotome", "Osteotome"],
    ["br", "", "", "", ""],
    ["span", "110", "", "", ""],
    ["text", "", "500", "เครื่องตัดกระดูก", ""],
    ["divend", "", "", "", ""],
    ["br", "", "", "", ""],
    ["br", "", "", "", ""],
    ["divbegin", "", "", "", "กล้อง"],
    ["span", "110", "", "", "กล้อง"],
    ["checkbox", "170", "", "Microscope", "Microscope"],
    ["checkbox", "170", "", "ICG", "ICG"],
    ["checkbox", "170", "", "Endoscope", "Endoscope"],
    ["br", "", "", "", ""],
    ["span", "110", "", "", ""],
    ["text", "", "500", "กล้อง", "ระบุยี่ห้อ"],
    ["divend", "", "", "", ""],
    ["br", "", "", "", ""],
    ["br", "", "", "", ""],
    ["divbegin", "", "", "", "Retractor"],
    ["span", "110", "", "", "Retractor"],
    ["checkbox", "170", "", "Leylar", "Leylar"],
    ["checkbox", "170", "", "Halo", "Halo"],
    ["checkbox", "170", "", "Greenberg", "Greenberg"],
    ["br", "", "", "", ""],
    ["span", "110", "", "", ""],
    ["text", "", "500", "Retractor", ""],
    ["divend", "", "", "", ""],
    ["br", "", "", "", ""],
    ["br", "", "", "", ""],
    ["divbegin", "", "", "", "CUSA"],
    ["span", "110", "", "", "CUSA"],
    ["checkbox", "170", "", "Excell", "Excell"],
    ["checkbox", "170", "", "Soring", "Soring"],
    ["checkbox", "170", "", "Sonar", "Sonar"],
    ["br", "", "", "", ""],
    ["span", "110", "", "", ""],
    ["text", "", "500", "CUSA", ""],
    ["divend", "", "", "", ""],
    ["br", "", "", "", ""],
    ["br", "", "", "", ""],
    ["divbegin", "", "", "", "U/S"],
    ["span", "110", "", "", "U/S"],
    ["checkbox", "170", "", "Ultrasound", "Ultrasound"],
    ["checkbox", "170", "", "Doppler", "Doppler"],
    ["checkbox", "170", "", "Duplex", "Duplex"],
    ["br", "", "", "", ""],
    ["span", "110", "", "", ""],
    ["text", "", "500", "U/S", ""],
    ["divend", "", "", "", ""],
    ["br", "", "", "", ""],
    ["br", "", "", "", ""],
    ["divbegin", "", "", "", "Shunt"],
    ["span", "110", "", "clearShunt", "Shunt <small>(คลิกลบ)</small>"],
    ["br", "", "", "", ""],
    ["span", "10", "", "", ""],
    ["span", "30", "", "", "Pudenz"],
    ["span", "30", "", "", ""],
    ["span", "40", "", "", "หัว"],
    ["radio", "170", "head", "Pudenz_proximalLow", "low"],
    ["radio", "170", "head", "Pudenz_proximalMedium", "med"],
    ["radio", "170", "head", "Pudenz_proximalHigh", "high"],
    ["br", "", "", "", ""],
    ["span", "70", "", "", ""],
    ["span", "40", "", "", "ท้อง"],
    ["radio", "170", "peritoneum", "Pudenz_distalLow", "low"],
    ["radio", "170", "peritoneum", "Pudenz_distalMedium", "med"],
    ["radio", "170", "peritoneum", "Pudenz_distalHigh", "high"],
    ["br", "", "", "", ""],
    ["span", "10", "", "", ""],
    ["span", "100", "", "", "Programmable"],
    ["radio", "170", "program", "shunt_Medtronic", "Medtronic"],
    ["radio", "170", "program", "shunt_Codman", "Codman"],
    ["radio", "170", "program", "shunt_proGAV", "proGAV"],
    ["br", "", "", "", ""],
    ["span", "110", "", "", ""],
    ["text", "", "500", "Shunt", ""],
    ["divend", "", "", "", ""],
    ["br", "", "", "", ""],
    ["br", "", "", "", ""],
    ["divbegin", "", "", "", "เครื่องมือบริษัท"],
    ["span", "110", "", "", "เครื่องมือบริษัท"],
    ["span", "", "", "", "เวลาส่งเครื่อง"],
    ["text", "", "100", "เวลาส่งเครื่อง", ""],
    ["br", "", "", "", ""],
    ["span", "110", "", "", ""],
    ["text", "", "500", "เครื่องมือบริษัท", "ชื่อบริษัท ชื่อเครื่องมือ"],
    ["divend", "", "", "", ""],
    ["br", "", "", "", ""],
    ["br", "", "", "", ""],
    ["divbegin", "", "", "", "อุปกรณ์อื่นๆ"],
    ["span", "110", "", "", "อุปกรณ์อื่นๆ"],
    ["checkbox", "170", "", "cranioplastic_Cement", "cranioplastic Cement"],
    ["checkbox", "170", "", "MTEC_skull", "MTEC skull"],
    ["br", "", "", "", ""],
    ["span", "110", "", "", ""],
    ["text", "", "500", "อุปกรณ์อื่นๆ", ""],
    ["divend", "", "", "", ""],
    ["br", "", "", "", ""],
    ["br", "", "", "", ""],
    ["divbegin", "", "", "", "Monitor"],
    ["span", "110", "", "", "Monitor"],
    ["checkbox", "170", "", "CN3", "CN3"],
    ["checkbox", "170", "", "CN5", "CN5"],
    ["checkbox", "170", "", "CN6", "CN6"],
    ["br", "", "", "", ""],
    ["span", "110", "", "", ""],
    ["checkbox", "170", "", "CN7", "CN7"],
    ["checkbox", "170", "", "CN8", "CN8"],
    ["checkbox", "170", "", "CN9", "CN9"],
    ["br", "", "", "", ""],
    ["span", "110", "", "", ""],
    ["checkbox", "170", "", "CN10", "CN10"],
    ["checkbox", "170", "", "CN11", "CN11"],
    ["checkbox", "170", "", "CN12", "CN12"],
    ["br", "", "", "", ""],
    ["span", "110", "", "", ""],
    ["checkbox", "170", "", "SSEP", "SSEP"],
    ["checkbox", "170", "", "EMG", "EMG"],
    ["checkbox", "170", "", "MEP", "MEP"],
    ["br", "", "", "", ""],
    ["span", "110", "", "", ""],
    ["text", "", "500", "Monitor", "อื่นๆ"],
    ["divend", "", "", "", ""],
    ["br", "", "", "", ""],
    ["br", "", "", "", ""],
    ["divbegin", "", "", "", "Notice"],
    ["span", "110 floatleft", "", "", "Notice"],
    ["textarea", "", "", "Notice", "เครื่องมือพิเศษอื่นๆ"],
    ["divend", "", "", "", ""],
    ["br", "", "", "", ""],
    ["br", "", "", "", ""],
    ["divbegin", "", "", "", ""],
    ["span", "350", "", "", ""],
    ["span", "70", "", "", " Edited by "],
    ["span", "", "", "editedby", ""],
    ["divend", "", "", "", ""],
    ["br", "", "", "", ""]
],

// [labelwidth, inputwidth, type, name, title, label, min, max]
RECORDSHEET = [
	["70", "40", "radio", "doneby", "Staff", "Staff"],
	["", "55", "radio", "doneby", "Resident", "Resident"],
	["br", "", "", "", "", ""],
	["70", "50", "radio", "manner", "Elective", "Elective"],
	["", "70", "radio", "manner", "Emergency", "Emergency"],
	["br", "", "", "", "", ""],
	["70", "40", "radio", "scale", "Major", "Major"],
	["", "40", "radio", "scale", "Minor", "Minor"],
	["hr", "", "", "", "", ""],
	["70", "55", "radio", "disease", "Brain Tumor", "BTumor"],
	["", "60", "radio", "disease", "Brain Vascular", "BVascular"],
	["", "30", "radio", "disease", "CSF related", "CSF"],
	["br", "", "", "", "", ""],
	["70", "55", "radio", "disease", "Trauma", "Trauma"],
	["70", "40", "radio", "disease", "Spine", "Spine"],
	["", "30", "radio", "disease", "etc", "etc"],
	["hr", "", "", "", "", ""],
	["", "80", "checkbox", "radiosurgery", "Radiosurgery", "RadioSurgery"],
	["", "80", "checkbox", "endovascular", "Endovascular", "Endovascular"],
	["br", "", "", "", "", ""],
	["90 border", "30", "number", "admitted", "Readmission", "Admission", "0", "99"],
	["90 border", "30", "number", "operated", "Reoperation", "Operation", "0", "99"],
	["br", "", "", "", "", ""],
	["", "55", "checkbox", "infection", "Infection", "Infection"],
	["", "50", "checkbox", "morbid", "Morbidity", "Morbid"],
	["", "50", "checkbox", "dead", "Dead", "Mortal"]
],

//===========================================================================================
// Keyword constants for program to guess the disease in Service Review from disease and treatment

BRAINDX = [
	/\bbrain\b/i, /basal ganglion/i, /basal.*gg/i, /bgg/i, /cavernous/i, /cerebell/i, 
	/cranio/i, /\bCNS\b/i, /convexity/i, /\bCPA?\b/i, /cliv[aou]/i,
	/facial/i, /front/i, /fal[cx]/i, /\bF\-?P\b/i, /jugular/i,
	/pariet/i, /planum/i, /pitui/i, /pineal/i, /petro/i, 
	/occipit/i, /sella/i, /sphenoid/i, /sagittal/i, /\bSSS\b/i,
	/tempor/i, /tentori/i, /thalam/i, /tonsil/i,
	/transnasal/i, /transsphenoid/i, /transtent/i, /transventric/i, 
	/tuberculum/i, /vestibul/i
],
BRAINTUMORDX = [
	/^((?!cavernoma|hematoma|osteo|zyg).)*oma/i, /\bCA\b/i, /CPA/i, /crani[oe]/i,
	/Cushing/i, /cyst\b/i,
	/DNET/i, /GBM/i, /lesion/i, /mass/i, /metas/i, /\bNFP?A\b/i,
	/\bPA\b/i, /pituitary apoplexy/i, /tumou?r/i
],
BRAINVASCULARDX = [
	/aneurysm/i, /AVM/i, /AVF/i, /basal ganglion|\bbg|cerebellar hemorrhage/i,
	/cavernoma/i, /emboli/i, /ha?ematoma/i, /ha?emorrh/i, /HT?ICH/i,
	/\bICH\b/i, /infarct/i, /ischemi/i, /(\bICA\b|MCA|VBA).*stenosis/i,
	/\bM1\b|\bM2\b|MCA/i, /moya moya/i, /\bSAH\b/i, /stroke/i,
],
CSFDX = [
	/\bHCP\b/i, /hydrocephalus/i, /\bNPH\b/i,
	/(\bVP|\bLP|periton|subgaleal).*shunt/i,
	/shunt obstruct/i, /shunt malfunction/i
],
TRAUMADX = [
	/accident/i, /assault/i, /concussion/i, /contusion/i, /\bEDH\b/i,
	/fall/i, /Fx|fracture/i, /injury/i, /lacerat/i,
	/\bSDH\b/i, /subdural ha?ematoma/i, /trauma/i
],
SPINEDX = [
	/cervical/i, /cord/i, /\bCSM\b/i, /^((?!mri|mri|MRI?).)*[CTLS] ?[\d]/,
	/degenerat/i, /dislocat/i,
	/HNP/i, /lamin[eo]/i, /listhesis/i, /lumb[ao]/i,/lesion/i,
	/mass/i, /metas/i,  /myel/i,
	/odontoid/i, /sacr[ao]/i, /scoliosis/i, /spin[aeo]/i, /spondylo/i, /thora/i
],
ETCDX = [
	/abscess/i, /chiari/i, /convulsi/i, /\bCTS\b/i, /cubital/i,
	/dysplasia/i, /epilepsy/i, /hemifacial/i,
	/\bMTS\b/i, /ocele/i, /parkinson/i,
	/skull defect/i, /sclerosis/i, /seizure/i, /sural/i,
	/\bTG?N\b/i, /trigemin/i, /tunnel/i
],

BRAINTUMORDXNO = [
	/aneurysm/i, /AVM/i, /AVF/i, /basal ganglion|\bbg|cerebellar hemorrhage/i,
	/cavernoma/i, /emboli/i, /ha?ematoma/i, /HT?ICH/i,
	/\bICH\b/i, /infarct/i, /ischemi/i, /(ICA|MCA|VBA).*stenosis/i,
	/M1|M2|MCA occlusion/i, /moya moya/i, /\bSAH\b/i, /stroke/i,

	/\bHCP\b/i, /hydrocephalus/i, /\bNPH\b/i,
	/(\bVP|\bLP|periton|subgaleal).*shunt/i,
	/shunt obstruct/i, /shunt malfunction/i,

	/assault/i, /\bEDH\b/i, /contusion/i, /injury/i,
	/Fx|fracture/i, /lacerat/i,
	/\bC?SDH\b/i, /trauma/i,

	/cervical/i, /cord/i, /\bCSM\b/i, /^((?!mri|mri|MRI?).)*[CTLS] ?[\d]/,
	/dislocat/i, /neck/i,
	/HNP/i, /lamin[eo]/i, /listhesis/i, /lumb[ao]/i, /myel/i,
	/odontoid/i, /sacr[ao]/i, /scoliosis/i, /spin[aeo]/i, /spondylo/i, /thora/i,

	/abscess/i, /chiari/i, /\bCTS\b/i, /cubital/i,
	/dysplasia/i, /hemifacial/i,
	/\bMTS\b/i, /ocele/i, /parkinson/i,
	/skull defect/i, /sclerosis/i, /sural/i,
	/tunnel/i
],
BRAINVASCULARDXNO = [
	/^((?!cavernoma|hematoma|osteo|zyg).)*oma/i, /\bCA\b/i, /CPA/i, /Cushing/i, /cyst\b/i,
	/DNET/i, /GBM/i, /mass/i, /metas/i, /\bNFP?A\b/i,
	/pituitary apoplexy/i, /tumou?r/i,

	/\bHCP\b/i, /hydrocephalus/i, /\bNPH\b/i,
	/(\bVP|\bLP|periton|subgaleal).*shunt/i,
	/shunt obstruct/i, /shunt malfunction/i,

	/assault/i, /\bEDH\b/i, /contusion/i, /injury/i,
	/Fx|fracture/i, /lacerat/i,
	/\bC?SDH\b/i, /subdural ha?ematoma/i, /trauma/i,

	/cervical/i, /cord/i, /\bCSM\b/i, /^((?!mri|mri|MRI?).)*[CTLS] ?[\d]/,
	/degenerat/i, /dislocat/i,
	/HNP/i, /lamin[eo]/i, /listhesis/i, /lumb[ao]/i, /myel/i,
	/odontoid/i, /sacr[ao]/i, /scoliosis/i, /spin[aeo]/i, /spondylo/i, /thora/i,

	/abscess/i, /chiari/i, /convulsi/i, /\bCTS\b/i, /cubital/i,
	/dysplasia/i, /epilepsy/i, /hemifacial/i,
	/\bMTS\b/i, /ocele/i, /parkinson/i,
	/skull defect/i, /sclerosis/i, /seizure/i, /sural/i,
	/\bTG?N\b/i, /trigemin/i, /tunnel/i
],
CSFDXNO = [
	/cavernoma/i, /emboli/i, /ha?emorrh/i, /HT?ICH/i,
	/\bICH\b/i, /infarct/i, /ischemi/i, /(ICA|MCA|VBA).*stenosis/i,
	/M1|M2|MCA occlusion/i, /moya moya/i, /\bSAH\b/i, /stroke/i,

	/assault/i, /\bEDH\b/i, /contusion/i, /injury/i,
	/Fx|fracture/i, /lacerat/i, /trauma/i,

	/cord/i, /\bCSM\b/i,
	/degenerat/i, /dislocat/i,
	/HNP/i, /listhesis/i,
	/odontoid/i, /sacr[ao]/i, /scoliosis/i, /spin[aeo]/i, /spondylo/i,

	/abscess/i, /\bCTS\b/i, /cubital/i,
	/dysplasia/i, /hemifacial/i,
	/\bMTS\b/i,
	/sclerosis/i, /sural/i,
	/\bTG?N\b/i, /tunnel/i
],
TRAUMADXNO = [
	/^((?!cavernoma|hematoma|osteoma|zygoma).)*oma/i, /\bCA\b/i,
	/CPA/i, /Cushing/i, /cyst\b/i,
	/DNET/i, /GBM/i, /mass/i, /metas/i, /\bNFP?A\b/i,
	/\bPA\b/i, /pituitary apoplexy/i, /tumou?r/i,

	/^((?!pseudo?).)*aneurysm/i, /AVM/i, /AVF/i,
	/basal ganglion|\bbg|cerebellar hemorrhage/i,
	/cavernoma/i, /emboli/i, /ha?emorrh/i, /HT?ICH/i,
	/\bICH\b/i, /infarct/i, /ischemi/i, /(ICA|MCA|VBA).*stenosis/i,
	/M1|M2|MCA occlusion/i, /moya moya/i, /\bSAH\b/i, /stroke/i,

	/\bHCP\b/i, /hydrocephalus/i, /\bNPH\b/i,
	/(\bVP|\bLP|periton|subgaleal).*shunt/i,
	/shunt obstruct/i, /shunt malfunction/i,

	/\bCSM\b/i,
	/degenerat/i, /dislocat/i,
	/HNP/i, /myel/i,
	/odontoid/i, /scoliosis/i,

	/abscess/i, /chiari/i, /\bCTS\b/i, /cubital/i,
	/dysplasia/i, /hemifacial/i,
	/\bMTS\b/i, /ocele/i, /sural/i,
	/\bTG?N\b/i, /trigemin/i, /tunnel/i
],
SPINEDXNO = [
	/CPA/i, /crani[oe]/i, /Cushing/i,
	/GBM/i, /\bNFP?A\b/i,
	/\bPA\b/i, /pituitary apoplexy/i,

	/basal ganglion|\bbg|cerebellar hemorrhage/i, /HT?ICH/i,
	/\bICH\b/i, /infarct/i, /ischemi/i, /(ICA|MCA|VBA).*stenosis/i,
	/M1|M2|MCA occlusion/i, /moya moya/i, /\bSAH\b/i, /stroke/i,

	/\bHCP\b/i, /hydrocephalus/i, /\bNPH\b/i,
	/(\bVP|\bLP|periton|subgaleal).*shunt/i,
	/shunt obstruct/i, /shunt malfunction/i,

	/\bCTS\b/i, /cubital/i,
	/hemifacial/i,
	/\bMTS\b/i, /sural/i,
	/\bTG?N\b/i, /trigemin/i
],
ETCDXNO = [
	/DNET/i, /GBM/i, /mass/i, /metas/i, /\bNFP?A\b/i,
	/\bPA\b/i, /pituitary apoplexy/i, /tumou?r/i,

	/\bHCP\b/i, /hydrocephalus/i, /\bNPH\b/i,
	/(\bVP|\bLP|periton|subgaleal).*shunt/i,
	/shunt obstruct/i, /shunt malfunction/i,

	/assault/i, /\bEDH\b/i, /contusion/i, /injury/i,

	/HNP/i, /lamin[eo]/i, /listhesis/i, /lumb[ao]/i, /myel/i,
	/odontoid/i, /sacr[ao]/i, /scoliosis/i, /spin[aeo]/i, /spondylo/i, /thora/i
],

BRAINTUMORRX = [
	/approa/i, /biopsy/i, /\bbx\b/i, /crani[oe]c?tomy/i, /\bETS\b/i, /trans.*remov/i,
	/TSP/i, /TSS/i, /transnasal/i, /transsphenoid/i, /transventric/i, /tumou?r/i
],
BRAINVASCULARRX = [
	/anast/i, /bypass/i, /(clot|hematoma).*(remov|irrigat|evacuat)/i,
	/clamp/i, /clip/i, /crani[oe]c?tomy/i,
	/EDAS/i, /EDAMS/i, /excision.*AVM|AVM.*excision/i,
	/occlu/i, /thromb.*ectomy/i
],
CSFRX = [
	/ETV/i, /EVD/i, /lumbar drain/i, /OMMAYA/i,
	/Pudenz/i, /pressure.*valve/i, /Programmable/i,
	/(\bV\-?P|\bL\-?P|periton|subgaleal).*shunt/i,
],
TRAUMARX = [
	/debridement/i, /(clot|hematoma).*(remov|irrigat|evacuat)/i, /trauma/i
],
SPINERX = [
	/ACDF/i, /ALIF/i, /biopsy/i, /\bbx\b/i, /cervical/i, /^((?!mri|MRI?).)*[CTLS][\d]/,
	/corpectomy/i, /decompress/i, /Discectomy/i,
	/\bESI\b/i, /fixation/i, /foraminotomy/i, /\bfusion/i, /kyphoplasty/i,
	/lamin[eo]/i, /MIDLIF/i, /OLIF/i, 
	/PDS/i, /PLF/i, /PLIF/i, /remov/i, /sacr[ao]/i, /screw/i, /SNRB/i,
	/thora/i, /TLIF/i, /transoral/i, /transforam/i, /tumou?r/i,
	/vertebr/i, /untether/i
],
SPINEOP = [
	/ACDF/i, /ALIF/i, /biopsy/i, /\bbx\b/i, /block/i,
	/corpectomy/i, /decompress/i, /Discectomy/i, /disc.*fx/i, /ectomy/,
	/\bESI\b/i, /fixation/i, /foraminotomy/i, /\bfusion/i, /kyphoplasty/i,
	/lamin[eo]/i, /MIDLIF/i, /OLIF/i, 
	/PDS/i, /PLF/i, /PLIF/i, /remov/i, /sacr[ao]/i, /screw/i, /SNRB/i,
	/TLIF/i, /transoral/i, /transforam/i,
	/vertebr(oplasty|ectomy)\b/i, /untether/i
],
ETCRX = [
	/anast/i, /aspirat/i, /advance/i,
	/biop/i, /block/i, /burr/i, /\bbx\b/i, /balloon/i, /cranioplasty/i,
	/battery/i, /DBS/i, /grid/i, /MVD/i,
	/decom/i, /DBS/i, /drain/i, /disconnect/i,
	/ECOG/i, /ectom/i, /endoscop/i, /\bESI\b/i, /excis/i,
	/grid/i, /insert/i,
	/lesion/i, /lysis/i, /lesionectomy/i, /lobectomy/i,
	/neurot/i, /Navigator/i,
	/occlu/i, /operat/i, /ostom/i, /plast/i, 
	/rhizotomy/i,
	/recons/i, /redo/i, /remov/i, /repa/i, /revis/i, /\bRF/i, /robot/i,
	/scope/i, /stim/i, /suture/i,
	/tracheos/i, /VNS/i
],

BRAINTUMORRXNO = [
	/(clot|hematoma).*(remov|irrigat|evacuat)/i,
	/clip/i, /EDAS/i, /EDAMS/i, /excision.*AVM|AVM.*excision/i,

	/ETV/i,

	/trauma/i,
	
	/ACDF/i, /ALIF/i,
	/cervical/i, /corpectomy/i, /discectomy/i, /disc.*fx/i,
	/\bfusion/i, /kyphoplasty/i,
	/lamin[eo]/i, /lumbar/i, /MIDLIF/i, /OLIF/i, 
	/PDS/i, /PLF/i, /PLIF/i, /sacr[ao]/i, /screw/i, /SNRB/i,
	/thora/i, /TLIF/i,
	/vertebr(oplasty|ectomy)\b/i, /untether/i,

	/battery/i, /DBS/i, /decompressive.*craniectomy/i,
	/grid/i, /irrigate/i, /lesionectomy/i, /MVD/i,
	/untether/i, /VNS/i
],
BRAINVASCULARRXNO = [
	/biopsy/i, /\bbx\b/i, /tumou?r/i,
	/TSP/i, /TSS/i, /transnasal/i, /transsphenoid/i, /transventric/i,

	/ETV/i, /OMMAYA/i,

	/trauma/i,

	/ACDF/i, /ALIF/i,
	/corpectomy/i, /discectomy/i, /disc.*fx/i,
	/\bfusion/i, /kyphoplasty/i,
	/lamin[eo]/i, /MIDLIF/i, /OLIF/i, 
	/PDS/i, /PLF/i, /PLIF/i, /sacr[ao]/i, /screw/i, /SNRB/i,
	/thora/i, /TLIF/i,
	/vertebr(oplasty|ectomy)\b/i, /untether/i,

	/battery/i, /DBS/i,
	/grid/i, /irrigate/i, /MVD/i,
	/untether/i, /VNS/i
],
CSFRXNO = [
	/biopsy/i, /\bbx\b/i, /tumou?r.*remov/i,
	/TSP/i, /TSS/i, /transnasal/i, /transsphenoid/i, /transventric/i,

	/(clot|hematoma).*(remov|irrigat|evacuat)/i,
	/clip/i, /EDAS/i, /EDAMS/i, /excision.*AVM|AVM.*excision/i,

	/trauma/i,

	/ACDF/i, /ALIF/i, /MIDLIF/i, /OLIF/i, 
	/PLF/i, /PLIF/i, /SNRB/i, /TLIF/i,

	/battery/i, /DBS/i, /decompressive.*craniectomy/i, 
	/grid/i, /irrigate/i, /lobectomy/i, /MVD/i,
	/untether/i, /VNS/i
],
TRAUMARXNO = [
	/biopsy/i, /\bbx\b/i, /tumou?r/i,
	/TSP/i, /TSS/i, /transnasal/i, /transsphenoid/i, /transventric/i,

	/EDAS/i, /EDAMS/i, /excision.*AVM|AVM.*excision/i,

	/ETV/i, /OMMAYA/i,
	/(\bVP|\bLP|periton|subgaleal).*shunt/i,

	/ACDF/i, /ALIF/i,
	/lumbar drain/i, /MIDLIF/i, /OLIF/i, 
	/PLF/i, /PLIF/i, /SNRB/i,
	/TLIF/i,

	/battery/i, /DBS/i, /grid/i, /MVD/i,
	/untether/i, /VNS/i
],
SPINERXNO = [
	/crani[oe]/i, /\bETS\b/i,
	/TSP/i, /TSS/i, /transnasal/i, /transsphenoid/i, /transventric/i,

	/EDAS/i, /EDAMS/i,

	/ETV/i, /EVD/i, /OMMAYA/i,
	/(\bVP|\bLP|periton|subgaleal).*shunt/i,
	/lumbar drain/i,

	/battery/i, /DBS/i, /decompressive.*craniectomy/i, 
	/grid/i, /MVD/i, /cranioplasty/i,
	/VNS/i
],
ETCRXNO = [
	/tumou?r.*(biopsy|\bbx\b|remov)/i, /craniot.*tumou?r|clot remov/i,
	/TSP/i, /TSS/i, /transnasal/i, /transsphenoid/i, /transventric/i,

	/clip/i, /EDAS/i, /EDAMS/i, /excision.*AVM|AVM.*excision/i,

	/trauma/i,

	/ETV/i, /OMMAYA/i,
	/(\bVP|\bLP|periton|subgaleal).*shunt/i,

	/ACDF/i, /ALIF/i, /^((?!mri|mri|mri|MRI?).)*[CTLS][\d]/,
	/lamin[eo]/i, /lumbar drain/i, /MIDLIF/i, /OLIF/i, 
	/PLF/i, /PLIF/i, /sacr[ao]/i, /SNRB/i,
	/thora/i, /TLIF/i
],

NOOPERATION = [
	/adjust.*pressure/i, /advice.*surg[ery|ical]/i, /conservative/i, /observe/i, /\boff OR/
],
RADIOSURGERY = [
	/conformal radiotherapy/i, /CRT/i, /Cyber ?Knife/i,
	/Gamma knife/i, /GKS/i, /Linac/i,
	/radiosurgery/i, /\bRS\b/i,
	/\bSRS\b/i, /\bSRT\b/i, /stereotactic radiotherapy/i,
	/Tomotherapy/i
],
ENDOVASCULAR = [
	/\bcoil/i, /emboli[zs]/i, /\bendovasc/i, /\bintervention/i,
	/\bstent/i, /\btransart/i, /\btransvenous/i
],

KEYWORDS = {
	"Brain Tumor": [ BRAINTUMORRX, BRAINTUMORRXNO, BRAINTUMORDX, BRAINTUMORDXNO ],
	"Brain Vascular": [ BRAINVASCULARRX, BRAINVASCULARRXNO, BRAINVASCULARDX, BRAINVASCULARDXNO ],
	"Trauma": [ TRAUMARX, TRAUMARXNO, TRAUMADX, TRAUMADXNO ],
	"Spine": [ SPINERX, SPINERXNO, SPINEDX, SPINEDXNO.concat(BRAINDX) ],
	"CSF related": [ CSFRX, CSFRXNO, CSFDX, CSFDXNO ],
	"etc": [ ETCRX, ETCRXNO, ETCDX, ETCDXNO ]
}
