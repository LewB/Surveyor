#!/usr/bin/env python
""" This Program returns the Data for the Header and Body Elements of a
    Dynamically Generated HTML Survey Called by index.html"""
# -*- coding: UTF-8 -*-

import os

# use the cgi library
import cgi

# enable debugging
#import cgitb
#cgitb.enable()

# use JSON encoding
import json

# use python sqlite3 database
import sqlite3
#from _sqlite3 import Row

#Define Main Function
def main():

    fs = cgi.FieldStorage()
    #svCode = fs.getvalue("SURVEY")
    svPart = fs.getvalue("SVPART")
    svMode = fs.getvalue("SVMODE")
    svData = fs.getvalue("SVDATA")
    if svPart == None or svMode == None or svData == None:
        print "Content-Type: text/plain"
        print
        print "Invalid Parameter Passed to rsp_survey."
        return
    
    #svCode = "SVR0003"
    #svPart = "HEADER"
    #svMode = "UPD"
    #svData = '[{"SH_CODE":"SVR0003","SH_OWNER":"Bond","SH_STATUS":"ready","SH_TYPE":"default","SH_NAME":"RT1","SH_DESC":"Raw Test One","SH_SKIN":"default"}]'
    
    dbg = "OK"
   
    try:
        # connect to the database
        dbc = sqlite3.connect("data/rsp-survey.db")
        dbc.row_factory = sqlite3.Row
        # Unpack DATA into JSON
        jrows = json.loads(svData)
        # ****** DEL MODE *********
        if svMode == "DEL":
            # ID Should Exist - go ahead and try to delete it
            if svPart == "HEADER":
                try:
                    dbc.execute("DELETE FROM SURVEY_HDR WHERE ROWID=" + jrows[0]['SH_ROWID'] + ";")
                    csr = dbc.cursor()
                    csr.execute("SELECT ROWID FROM SURVEY_BDY WHERE ROWID=" + jrows[0]['SH_ROWID'] + ";")
                    # Delete only if records found
                    chkrow = csr.fetchone()
                    if chkrow != None:
                        dbc.execute("DELETE FROM SURVEY_BDY WHERE SB_HDR=" + jrows[0]['SH_ROWID'] + ";")
                    dbc.commit()
                except (sqlite3.Error):
                    dbg = "Failed to DELETE Survey Header Or Detail For: " + jrows[0]['SH_CODE']
                    raise
                else:
                    # Remove Survey Database Too - If it Exists
                    dbPath = "data/" + jrows[0]['SH_CODE'] + ".db"
                    try:
                        if os.access(dbPath, os.W_OK) == True:
                            os.remove(dbPath)
                    except OSError, e:
                        dbg = "Error Removing DB File: " + dbPath
                        dbg += "\nOSerr: " + e.args[1]
            elif svPart == "BODY":
                try:
                    dbc.execute("DELETE FROM SURVEY_BDY WHERE ROWID=" + jrows[0]['SB_ROWID'] + ";")
                    dbc.commit()
                except (sqlite3.Error):
                    dbg = "Failed to DELETE Survey Detail For: " + jrows[0]['SH_CODE']
                    raise
        else:
            # ****** ADD OR CHANGE MODE *************************
            csr = dbc.cursor()
            svHDR = None
            for row in jrows:
                if svPart == "BODY" and svHDR != row['SB_HDR']:
                    # Delete Body Detail Records to Avoid Duplicate Conflicts in SB_HDR/SB_SEQ Key
                    try:
                        dbc.execute("DELETE FROM SURVEY_BDY WHERE SB_HDR=" + row['SB_HDR'] + ";")
                        dbc.commit()
                    except (sqlite3.Error):
                        dbg = "Failed to DELETE Survey Detail For SB_HDR: " + row['SH_HDR']
                        raise
                    # Set svHDR to Current Value
                    svHDR = row['SB_HDR']
                if svPart == "HEADER":
                    # execute SQL SELECT on CGI values
                    csr.execute("SELECT ROWID FROM SURVEY_HDR WHERE ROWID=" + row['SH_ROWID'] + ";")
                    # get first DB table row from cursor after select
                    chkrow = csr.fetchone()
                    if chkrow == None:
                        # No record Exists - go ahead and try to ADD it
                        try:
                            dbc.execute("INSERT INTO SURVEY_HDR \
                                (SH_CODE, SH_OWNER, SH_STATUS, SH_TYPE, \
                                        SH_NAME, SH_DESC, SH_SKIN) \
                                VALUES ('" + row['SH_CODE'] + "', '" \
                                    + row['SH_OWNER'] + "', '" \
                                    + row['SH_STATUS'] + "', '" \
                                    + row['SH_TYPE'] + "', '" \
                                    + row['SH_NAME'] + "', '" \
                                    + row['SH_DESC'] + "', '" \
                                    + row['SH_SKIN'] + "');")
                            dbc.commit()
                            # Perform a Data Load to Establish ROWID after fresh Add
                        except (sqlite3.Error):
                            # check for hard coded initial values to create and access database table
                            try:
                                dbc.execute('''CREATE TABLE IF NOT EXISTS 'SURVEY_HDR'
                                    ('SH_CODE' TEXT PRIMARY KEY     NOT NULL UNIQUE,
                                    'SH_OWNER' TEXT                 NOT NULL,
                                    'SH_STATUS' TEXT,
                                    'SH_TYPE' TEXT,
                                    'SH_NAME' TEXT,
                                    'SH_DESC' TEXT,
                                    'SH_SKIN' TEXT);''')
                                # Also assume body detail table does not exist.
                                dbc.execute('''CREATE TABLE IF NOT EXISTS SURVEY_BDY
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
                                dbc.execute("INSERT INTO SURVEY_HDR \
                                    (SH_CODE, SH_OWNER, SH_STATUS, SH_TYPE, \
                                            SH_NAME, SH_DESC, SH_SKIN) \
                                    VALUES ('" + row['SH_CODE'] + "', '" \
                                    + row['SH_OWNER'] + "', '" \
                                    + row['SH_STATUS'] + "', '" \
                                    + row['SH_TYPE'] + "', '" \
                                    + row['SH_NAME'] + "', '" \
                                    + row['SH_DESC'] + "', '" \
                                    + row['SH_SKIN'] + "');")
                                dbc.commit()
                            except (sqlite3.Error):
                                dbg = "ERR:Failed to Create Initial DB Tables: " + e.args[0]
                                raise
                    else:
                        # Have a record match so Change it.
                        try:
                            dbc.execute("UPDATE SURVEY_HDR SET " \
                                    + "SH_CODE='" + row['SH_CODE'] + "'," \
                                    + "SH_OWNER='" + row['SH_OWNER'] + "'," \
                                    + "SH_STATUS='" + row['SH_STATUS'] + "'," \
                                    + "SH_TYPE='" + row['SH_TYPE'] + "'," \
                                    + "SH_NAME='" + row['SH_NAME'] + "'," \
                                    + "SH_DESC='" + row['SH_DESC'] + "'," \
                                    + "SH_SKIN='" + row['SH_SKIN'] + "' " \
                                    + "WHERE ROWID=" + row['SH_ROWID'] + ";")
                            dbc.commit()
                        except (sqlite3.Error):
                            dbg = "Failed to CHANGE Survey: " + row['SH_CODE'] + " in DB SURVEY_HDR Table."
                            raise
                elif svPart == "BODY":
                    #csr.execute("SELECT SB_HDR, SB_SEQ FROM SURVEY_BDY WHERE (ROWID=" + row['SB_ROWID'] + ");")
                    # get first DB table row from cursor after select
                    #chkrow = csr.fetchone()
                    #if chkrow == None:
                        # No record Exists - go ahead and try to ADD it
                    try:
                        # All Records for that Header were Deleted, So Insert All New Records
                        # To Avoid SB_HDR/SB_SEQ Key Conflicts
                        dbc.execute("INSERT INTO SURVEY_BDY \
                                    (SB_HDR, SB_SEQ, SB_TYPE, SB_TITLE, SB_DESC, SB_LABEL, SB_MIN, \
                                    SB_MAX, SB_BTN_1, SB_BTN_2, SB_BTN_3) \
                            VALUES (" + row['SB_HDR'] + ", " \
                                + row['SB_SEQ'] + ", '" \
                                + row['SB_TYPE'] + "', '" \
                                + row['SB_TITLE'] + "', '" \
                                + row['SB_DESC'] + "', '" \
                                + row['SB_LABEL'] + "', " \
                                + row['SB_MIN'] + ", " \
                                + row['SB_MAX'] + ", '" \
                                + row['SB_BTN_1'] + "', '" \
                                + row['SB_BTN_2'] + "', '" \
                                + row['SB_BTN_3'] + "');")
                        dbc.commit()
                    except (sqlite3.Error):
                        dbg = "Failed to ADD Survey Detail to DB SURVEY_BDY Table."
                        raise
                    #else:
                        # Have a record match so Change it.
                    #    try:
                    #        dbc.execute("UPDATE SURVEY_BDY SET " \
                    #                + "SB_HDR=" + row['SB_HDR'] + "," \
                    #               + "SB_SEQ=" + row['SB_SEQ'] + "," \
                    #                + "SB_TYPE='" + row['SB_TYPE'] + "'," \
                    #                + "SB_TITLE='" + row['SB_TITLE'] + "'," \
                    #                + "SB_DESC='" + row['SB_DESC'] + "'," \
                    #                + "SB_LABEL='" + row['SB_LABEL'] + "'," \
                    #                + "SB_MIN=" + row['SB_MIN'] + "," \
                    #                + "SB_MAX=" + row['SB_MAX'] + "," \
                    #                + "SB_BTN_1='" + row['SB_BTN_1'] + "'," \
                    #                + "SB_BTN_2='" + row['SB_BTN_2'] + "'," \
                    #                + "SB_BTN_3='" + row['SB_BTN_3'] + "'" \
                    #                + "WHERE (ROWID=" + row['SB_ROWID'] + ");")
                    #        dbc.commit()
                    #    except (sqlite3.Error):
                    #        dbg = "Failed to CHANGE Survey Detail in DB SURVEY_BDY Table."
                    #        raise

    except sqlite3.Error, e:
        # Handle Exceptions
        if dbc:
            dbc.rollback()
        dbg += "\nDB Err: " + e.args[0]
        
    finally:
        if dbc:
            dbc.close()
        #
        # Print HTTP Response text: "OK" if no errors, else error string.
        # Variable "dbg" will be set to either condition.
        #
        print "Content-Type: text/plain"
        print
        print dbg
        
# Run The Program
main()
