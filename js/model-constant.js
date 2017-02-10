var GETLABDATA		= "php/getlabdata.php";
var GETNAMEHN		= "php/getnamehn.php";
var ICDPHP			= "php/icd.php";
var MYSQLIPHP		= "php/mysqli.php";
var MYSQL_ALLOR		= "php/mysql_allor.php";

var BOOK		= {};
var BOOKFILL	= [];	//fillup, fillstaff, fillday
var QWAIT		= {};
var QWAITFILL	= [];
var ALLLISTS	= {};
var STATE		= [];	//["FILLUP","2017-01-20"]	= show normal (queue of everyday) used in fillup
						//["FILLDAY","0"]	(0-6)	= show queue of day used in fillday
						//["FILLSTAFF","อ. ........."]		= show queue of staff used in fillstaff
var STARTFILLUP	= 3;	//how many weeks to fillup in starting table
var THISUSER	= "";
var TIMESTAMP	= "";
var TIMER		= "";
var OPDATE		= 0;
var STAFFNAME	= 1;
var HN			= 2;
var NAME		= 3;
var AGE			= 4;
var DIAGNOSIS	= 5;
var TREATMENT	= 6;
var TEL			= 7;
var QN			= 8;

var QWAITNUM	= 0;
var QSINCE		= 1;
var QSTAFFNAME	= 2;
var QHN			= 3;
var QNAME		= 4;
var QAGE		= 5;
var QDIAGNOSIS	= 6;
var QTREATMENT	= 7;
var QTEL		= 8;
var QQN			= 9;

var NAMEOFDAYTHAI	= ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัส", "ศุกร์", "เสาร์"];
var NAMEOFDAYABBR	= ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];	//for row color

//used for 1st column color
var NAMEOFDAYFULL	= ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];


var RED = "rgb(155, 255, 155)"		//used in undermed
var GREEN = "rgb(255, 200, 200)"	//used in undermed
var GRAY = "#D3D3D3"				//used in treatment

//used for found words color
var COLOROFFIND	= ["red", "yellow", "pink", "green", "orange", "blue", "purple"];

var NUMMONTH	= {"มค.":"01","กพ.":"02","มีค.":"03","เมย.":"04","พค.":"05","มิย.":"06",
					"กค.":"07","สค.":"08","กย.":"09","ตค.":"10","พย.":"11","ธค.":"12"};
var MONTH_LABEL = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 
					'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธ้นวาคม'];

var MEDLIST = [["No DM","+ DM","? DM"],//E14	 Unspecified diabetes mellitus
				["No HD","+ HD","? HD"],//I519	 Heart disease, unspecified
				["No HT","+ HT","? HT"],//I10	 Essential (primary) hypertension
				["No DLP","+ DLP","? DLP"],//E78	 Disorders of lipoprotein metabolism and other lipidaemias
				["No Liver Dz","Liver Dz","? Liver Dz"],//K769	 Liver disease, unspecified
				["No CKD","+ CKD","? CKD"],//N18	 Chronic renal failure
				["HBV -ve","HBV +ve","? HBV"],//Z225	 Carrier of viral hepatitis
				["HIV -ve","HIV +ve","? HIV"],//R75	 Laboratory evidence of human immunodeficiency virus [HIV]
				["No Antiplatelet","on Antiplatelet","? Antiplatelet"],//Y444	 Antithrombotic drugs [platelet-aggregati...
				["No Anticoag","on Anticoag","? Anticoag"],//Z921 Personal history of long-term (curren...
				["ไม่แพ้ Penicillin","แพ้ Penicillin","? Penicillin"],//Z880	 Personal history of allergy to penicillin 
				["ไม่แพ้ Sulfonamides","แพ้ Sulfonamides","? Sulfonamides"],//Z882	 Personal history of allergy to sulfonamides 
				["ไม่แพ้ Analgesics","แพ้ Analgesics","? Analgesics"]];//Z886	 Personal history of allergy to analgesic agent

var HOLIDAY = {
	"2015-01-02" : "url('pic/special.jpg')",	//วันหยุดพิเศษ
	"2015-03-04" : "url('pic/Magha.jpg')",		//วันมาฆบูชา
	"2015-05-13" : "url('pic/Ploughing.jpg')",	//วันพืชมงคล
	"2015-06-01" : "url('pic/Vesak.jpg')",		//วันวิสาขบูชา
	"2015-07-30" : "url('pic/Asalha.jpg')",		//วันอาสาฬหบูชา
	"2015-07-31" : "url('pic/Vassa.jpg')",		//วันเข้าพรรษา
	"2016-02-22" : "url('pic/Magha.jpg')",
	"2016-05-13" : "url('pic/Ploughing.jpg')",
	"2016-05-20" : "url('pic/Vesak.jpg')",
	"2016-07-19" : "url('pic/Asalha.jpg')",
	"2016-07-20" : "url('pic/Vassa.jpg')",
	"2017-02-11" : "url('pic/Magha.jpg')",
	"2017-02-13" : "url('pic/Maghasub.jpg')",
	"2017-05-09" : "url('pic/Ploughing.jpg')",
	"2017-05-10" : "url('pic/Vesak.jpg')",
	"2017-07-08" : "url('pic/Asalha.jpg')",
	"2017-07-09" : "url('pic/Vassa.jpg')",
	"2017-07-10" : "url('pic/Asalhasub.jpg')",
	"2017-07-11" : "url('pic/Vassasub.jpg')",
	"2018-03-01" : "url('pic/Magha.jpg')",
	"2018-05-09" : "url('pic/Ploughing.jpg')",
	"2018-05-29" : "url('pic/Vesak.jpg')",
	"2018-07-27" : "url('pic/Asalha.jpg')",
	"2018-07-28" : "url('pic/Vassa.jpg')",
	"2018-07-30" : "url('pic/Vassasub.jpg')",
	"2019-02-19" : "url('pic/Magha.jpg')",
	"2019-05-13" : "url('pic/Ploughing.jpg')",
	"2019-05-18" : "url('pic/Vesak.jpg')",
	"2019-05-20" : "url('pic/Vesaksub.jpg')",
	"2019-07-16" : "url('pic/Asalha.jpg')",
	"2019-07-17" : "url('pic/Vassa.jpg')"
	}
