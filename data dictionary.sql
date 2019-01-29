
+------------------------+
| Tables_in_neurosurgery |
+------------------------+
| book                   |
| bookhistory            |
| holiday                |
| oncall                 |
| staff                  |
+------------------------+

| book  | CREATE TABLE `book` (
  `deleted` tinyint(1) unsigned NOT NULL DEFAULT '0',
  `waitnum` double DEFAULT '1',
  `opdate` date DEFAULT NULL,
  `oproom` tinyint(2) DEFAULT NULL,
  `optime` varchar(10) NOT NULL DEFAULT '',
  `casenum` tinyint(2) DEFAULT NULL,
  `theatre` varchar(30) NOT NULL DEFAULT '',
  `staffname` varchar(50) NOT NULL DEFAULT '',
  `hn` varchar(10) NOT NULL DEFAULT '',
  `patient` varchar(255) NOT NULL DEFAULT '',
  `dob` date DEFAULT NULL,
  `gender` varchar(1) NOT NULL DEFAULT '',
  `diagnosis` varchar(1000) NOT NULL DEFAULT '',
  `treatment` varchar(1000) NOT NULL DEFAULT '',
  `admission` varchar(5000) NOT NULL DEFAULT '',
  `final` varchar(5000) NOT NULL DEFAULT '',
  `equipment` varchar(2000) NOT NULL DEFAULT '',
  `contact` varchar(1000) NOT NULL DEFAULT '',
  `admit` date DEFAULT NULL,                          *\ web service via SOAP
  `discharge` date DEFAULT NULL,                      */ GetEncounterDetailByMRNENCTYPE($hn, "IMP")
                                                          in getipd.php used by getAdmitDischargeDate
  `admitted` varchar(2) NOT NULL DEFAULT '',         * "", "0" "1", "2", ...
                                                          "" = IND (initially no data)
                                                          "0"= user-defined no admission
                                                          "2"... Readmission
  `operated` varchar(2) NOT NULL DEFAULT '',         * "", "0" "1", "2", ...
                                                          "" = IND
                                                          "0"= user-defined no operation
                                                          "2"... Reoperation
  `doneby` varchar(30) NOT NULL DEFAULT '',          * "", "Staff", "Resident" UDO (user-defined only)
  `manner` varchar(30) NOT NULL DEFAULT '',          * "", "Elective", "Emergency" UDO
  `scale` varchar(30) NOT NULL DEFAULT '',           * "", "Major", "Minor"        UDO
  `disease` varchar(255) NOT NULL DEFAULT '',        * "", "Brain Tumor", "Brain Vascular",
                                                          "CSF related", "Trauma", "Spine", "etc"
                                                          (run-time calc by operationFor)
                                                          "" = IND
                                                          user-defined no operation is in operated
  `radiosurgery` varchar(30) NOT NULL DEFAULT '',    * "", "no", "Radiosurgery"
                                                          "" = IND
                                                          "no" = user-defined no radiosurgery
  `endovascular` varchar(30) NOT NULL DEFAULT '',    * "", "no", "Endovascular"
                                                          "" = IND
                                                          "no" = user-defined no endovascular
  `infection` varchar(30) NOT NULL DEFAULT '',       * "", "Infection" UDO
  `morbid` varchar(30) NOT NULL DEFAULT '',          * "", "Morbidity" UDO
  `dead` varchar(30) NOT NULL DEFAULT '',            * "", "Dead"      UDO
  `qn` int(10) unsigned NOT NULL AUTO_INCREMENT,      * Booking entry ID number 
  `editor` varchar(10) NOT NULL DEFAULT '',          * user ID
  PRIMARY KEY (`qn`),
  KEY `opdate` (`opdate`),
  KEY `hn` (`hn`)                                      * used for search, and repeated hn entry
) ENGINE=InnoDB AUTO_INCREMENT=4848 DEFAULT CHARSET=utf8 |

| bookhistory | CREATE TABLE `bookhistory` ( * keep track of book entry with editdatetime and user ID
  `action` varchar(8) DEFAULT 'update',
  `editdatetime` datetime NOT NULL,
  `deleted` tinyint(1) unsigned NOT NULL DEFAULT '0',
  `waitnum` double DEFAULT '1',
  `opdate` date DEFAULT NULL,
  `oproom` tinyint(2) DEFAULT NULL,
  `optime` varchar(10) NOT NULL DEFAULT '',
  `casenum` tinyint(2) DEFAULT NULL,
  `theatre` varchar(30) NOT NULL DEFAULT '',
  `staffname` varchar(50) NOT NULL DEFAULT '',
  `hn` varchar(10) NOT NULL DEFAULT '',
  `patient` varchar(255) NOT NULL DEFAULT '',
  `dob` date DEFAULT NULL,
  `gender` varchar(1) NOT NULL DEFAULT '',
  `diagnosis` varchar(1000) NOT NULL DEFAULT '',
  `treatment` varchar(1000) NOT NULL DEFAULT '',
  `admission` varchar(5000) NOT NULL DEFAULT '',
  `final` varchar(5000) NOT NULL DEFAULT '',
  `equipment` varchar(2000) NOT NULL DEFAULT '',
  `contact` varchar(1000) NOT NULL DEFAULT '',
  `admit` date DEFAULT NULL,
  `discharge` date DEFAULT NULL,
  `admitted` varchar(30) NOT NULL DEFAULT '',
  `operated` varchar(30) NOT NULL DEFAULT '',
  `doneby` varchar(30) NOT NULL DEFAULT '',
  `manner` varchar(30) NOT NULL DEFAULT '',
  `scale` varchar(30) NOT NULL DEFAULT '',
  `disease` varchar(255) NOT NULL DEFAULT '',
  `radiosurgery` varchar(30) NOT NULL DEFAULT '',
  `endovascular` varchar(30) NOT NULL DEFAULT '',
  `infection` varchar(30) NOT NULL DEFAULT '',
  `morbid` varchar(30) NOT NULL DEFAULT '',
  `dead` varchar(30) NOT NULL DEFAULT '',
  `qn` int(10) unsigned NOT NULL,
  `editor` varchar(10) NOT NULL DEFAULT '',
  KEY `qn` (`qn`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 |

| holiday | CREATE TABLE `holiday` (  * updated by inputHoliday
  `holidate` date DEFAULT NULL,       * ISO date
  `dayname` varchar(255) DEFAULT NULL * name in English appear on screen in Thai
) ENGINE=InnoDB DEFAULT CHARSET=utf8 |

| oncall | CREATE TABLE `oncall` (
  `dateoncall` date DEFAULT NULL,        * exchange oncall date
  `staffname` varchar(255) DEFAULT NULL, * staff name to replace the one in regular queue
  `edittime` datetime DEFAULT NULL       * used the most recent edit time
) ENGINE=InnoDB DEFAULT CHARSET=utf8 |

| staff | CREATE TABLE `staff` (
  `number` tinyint(4) DEFAULT NULL,     * queue number for oncall
  `staffname` varchar(255) DEFAULT NULL,
  `specialty` varchar(255) DEFAULT NULL,
  `oncall` tinyint(1) DEFAULT NULL,      * whether having oncall queue or not
  `startoncall` date DEFAULT NULL         * the date to start sequencing oncall
) ENGINE=InnoDB DEFAULT CHARSET=utf8 |
