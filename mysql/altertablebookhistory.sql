
ALTER TABLE bookhistory
	ADD theatre varchar(255) NOT NULL DEFAULT '' AFTER casenum,
	ADD opday date AFTER discharge, 
	ADD elective varchar(255) NOT NULL DEFAULT '' AFTER opday,
	ADD doneby varchar(255) NOT NULL DEFAULT '' AFTER elective,
	ADD major varchar(255) NOT NULL DEFAULT '' AFTER doneby,
	ADD disease varchar(255) NOT NULL DEFAULT '' AFTER major,
	ADD readmit tinyint(1) AFTER disease,
	ADD reoperate tinyint(1) AFTER readmit,
	ADD infection tinyint(1) AFTER reoperate,
	ADD morbid tinyint(1) AFTER infection,
	ADD dead tinyint(1) AFTER morbid;
