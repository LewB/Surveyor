#!/usr/bin/env python
""" This Program Creates the Header and Body Tables in the Survey Database
    and the Login Table in the Admin Database.
    It Should be run before Database Access by any CGI process Occurs."""
# -*- coding: UTF-8 -*-

# use python sqlite3 database
import sqlite3
from _sqlite3 import Row

#Define Main Function
def main():
    
    try:
        #Survey Database
        print "Creating Database: rsp-survey.db..."
        dbc = sqlite3.connect("test/rsp-survey.db")
        # Survey header table
        print "Creating DB Table: SURVEY_HDR..."
        dbc.execute('''CREATE TABLE IF NOT EXISTS 'SURVEY_HDR'
                    (`SH_CODE`    TEXT NOT NULL,
                    `SH_OWNER`    TEXT NOT NULL DEFAULT 'Admin',
                    `SH_STATUS`    TEXT NOT NULL DEFAULT 'ready',
                    `SH_TYPE`    TEXT NOT NULL DEFAULT 'default',
                    `SH_NAME`    TEXT,
                    `SH_DESC`    TEXT,
                    `SH_SKIN`    TEXT DEFAULT 'defult',
                    PRIMARY KEY(SH_CODE);''')
        # Survey body detail table
        print "Creating DB Table: SURVEY_BDY..."
        dbc.execute('''CREATE TABLE IF NOT EXISTS 'SURVEY_BDY'
                    `SB_HDR`    INTEGER NOT NULL,
                    `SB_SEQ`    INTEGER NOT NULL,
                    `SB_TYPE`    TEXT NOT NULL DEFAULT 'default',
                    `SB_TITLE`    TEXT NOT NULL,
                    `SB_DESC`    TEXT,
                    `SB_LABEL`    TEXT,
                    `SB_MIN`    INTEGER DEFAULT 1,
                    `SB_MAX`    INTEGER DEFAULT 5,
                    `SB_BTN_1`    TEXT DEFAULT 'Submit',
                    `SB_BTN_2`    TEXT,
                    `SB_BTN_3`    TEXT,
                    PRIMARY KEY(SB_HDR,SB_SEQ);''')
        dbc.commit()
        dbc.close()
        # Admin Database
        print "Creating Database: rsp-admin.db..."
        dbc = sqlite3.connect("test/rsp-admin.db")
        # User table
        print "Creating DB Table: USER..."
        dbc.execute('''CREATE TABLE IF NOT EXISTS 'USER'
                    `US_LOGIN`    TEXT NOT NULL,
                    `US_TYPE`    TEXT NOT NULL,
                    `US_LNAME`    TEXT,
                    `US FNAME`    TEXT,
                    `US EMAIL`    TEXT,
                    `US_PHONE`    TEXT,
                    `US ORG`    TEXT,
                    PRIMARY KEY(US_LOGIN);''')
        # Login Table
        print "Creating DB Table: LOGIN..."
        dbc.execute('''CREATE TABLE IF NOT EXISTS 'USER'
                    `ID`    TEXT NOT NULL UNIQUE,
                    `PW`    TEXT NOT NULL,
                    `EMAIL`    TEXT,
                    `LOGKEY`    TEXT,
                    PRIMARY KEY(ID);''')
        dbc.execute('''INSERT INTO `LOGIN` VALUES ('Admin','password',NULL,NULL);''')
        dbc.commit()
        dbc.close()
        print "Database Creation Completed."
        print "Run: 'StartWebServer.bat' and enter 'http://<IP|Machine>:8000/html/login.html' to start!"
        
    except sqlite3.Error, e:
        print "Database Error: " + e.arg[0]
        if dbc:
            dbc.close()
    
# Run the Program
main()