#!/usr/bin/env python
""" This Program returns the Data for the Header and Body Elements of a
    Dynamically Generated HTML Survey Called by index.html"""
# -*- coding: UTF-8 -*-

# use the cgi library
import cgi

# enable debugging
#import cgitb
#cgitb.enable()

# use JSON encoding
import json

# use python sqlite3 database
import sqlite3
from _sqlite3 import Row

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
                    dbc.execute("DELETE FROM SURVEY_HDR WHERE ROWID='" + jrows[0]['SB_ROWID'] + "'")
                    dbc.execute("DELETE FROM SURVEY_BDY WHERE SB_HDR='" + jrows[0]['SB_HDR'] + "'")
                    dbc.commit()
                except (sqlite3.Error):
                    dbg = "Failed to DELETE Survey Header: " + jrows[0]['SB_HDR'] + " Err: " + e.args[0]
            elif svPart == "BODY":
                try:
                    dbc.execute("DELETE FROM SURVEY_BDY WHERE SB_HDR='" + jrows[0]['SB_HDR'] + "'" \
                                    + " AND SB_SEQ=" + jrows[0]['SB_SEQ'])
                    dbc.commit()
                except (sqlite3.Error):
                    dbg = "Failed to DELETE Survey Detail: " + jrows[0]['SB_HDR'] + " Err: " + e.args[0]
        else:
            # ****** ADD OR CHANGE MODE *************************
            csr = dbc.cursor()
            for row in jrows:
                if svPart == "HEADER":
                    # execute SQL SELECT on CGI values
                    csr.execute("SELECT ROWID FROM SURVEY_HDR WHERE ROWID='" + row['SH_ROWID'] + "'")
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
                                    + row['SH_SKIN'] + "')")
                            dbc.commit()
                            # Perform a Data Load to Establish ROWID after fresh Add
                        except (sqlite3.Error):
                            dbg = "Failed to ADD Survey Header: " + row['SH_CODE'] + " to DB SURVEY_HDR Table."
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
                                    + "WHERE ROWID='" + row['SH_ROWID'] + "'")
                            dbc.commit()
                        except (sqlite3.Error):
                            dbg = "Failed to CHANGE Survey: " + row['SH_CODE'] + " in DB SURVEY_HDR Table."
                elif svPart == "BODY":
                    csr.execute("SELECT SB_HDR, SB_SEQ FROM SURVEY_BDY WHERE (SB_HDR='" + row['SB_HDR'] + "' \
                                                            AND SB_SEQ='" + row['SB_SEQ'] + "')")
                    # get first DB table row from cursor after select
                    chkrow = csr.fetchone()
                    if chkrow == None:
                        # No record Exists - go ahead and try to ADD it
                        try:
                            dbc.execute("INSERT INTO SURVEY_BDY \
                                        (SB_HDR, SB_SEQ, SB_TYPE, SB_TITLE, SB_DESC, SB_LABEL, SB_MIN, \
                                        SB_MAX, SB_BTN_1, SB_BTN_2, SB_BTN_3) \
                                VALUES ('" + row['SB_HDR'] + "', '" \
                                    + row['SB_SEQ'] + "', '" \
                                    + row['SB_TYPE'] + "', '" \
                                    + row['SB_TITLE'] + "', '" \
                                    + row['SB_DESC'] + "', '" \
                                    + row['SB_LABEL'] + "', '" \
                                    + row['SB_MIN'] + "', '" \
                                    + row['SB_MAX'] + "', '" \
                                    + row['SB_BTN_1'] + "', '" \
                                    + row['SB_BTN_2'] + "', '" \
                                    + row['SB_BTN_3'] + "')")
                            dbc.commit()
                        except (sqlite3.Error):
                            dbg = "Failed to ADD Survey Detail: " + svCode + " to DB SURVEY_BDY Table."
                    else:
                        # Have a record match so Change it.
                        try:
                            dbc.execute("UPDATE SURVEY_BDY SET " \
                                    + "SB_TYPE='" + row['SB_TYPE'] + "'," \
                                    + "SB_TITLE='" + row['SB_TITLE'] + "'," \
                                    + "SB_DESC='" + row['SB_DESC'] + "'," \
                                    + "SB_LABEL='" + row['SB_LABEL'] + "'," \
                                    + "SB_MIN='" + row['SB_MIN'] + "'," \
                                    + "SB_MAX='" + row['SB_MAX'] + "'," \
                                    + "SB_BTN_1='" + row['SB_BTN_1'] + "'," \
                                    + "SB_BTN_2='" + row['SB_BTN_2'] + "'," \
                                    + "SB_BTN_3='" + row['SB_BTN_3'] + "'" \
                                    + "WHERE (SB_HDR='" + row['SB_HDR'] + "' " \
                                                + "AND SB_SEQ='" + row['SB_SEQ'] + "')")
            # SB_SEQ COULD BE A DIFFERENT VALUE NOW !!! MUST FIX THIS !!!
                            dbc.commit()
                        except (sqlite3.Error):
                            dbg = "Failed to CHANGE Survey Detail: " + svCode + " in DB SURVEY_BDY Table."

    except sqlite3.Error, e:
        # Handle Exceptions
        if dbc:
            dbc.rollback()
        dbg = "DB Err: " + e.args[0]
        
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