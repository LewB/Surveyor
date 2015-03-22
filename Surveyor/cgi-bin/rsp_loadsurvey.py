#!/usr/bin/env python
""" This Program returns the Data for the Header and Body Elements of a
    Dynamically Generated HTML Survey Called by index.html"""
# -*- coding: UTF-8 -*-

# use the cgi library
import cgi

# enable debugging
import cgitb
cgitb.enable()

# use JSON encoding
import json

# use python sqlite3 database
import sqlite3

#Define Main Function
def main():

    fs = cgi.FieldStorage()
    svCode = fs.getvalue("SURVEY")
    svPart = fs.getvalue("SVPART")
    svOwner = fs.getvalue("SVOWNER")
    if svCode == None:
       svCode = "*"
    if svPart == None:
       svPart = "BOTH"
       
    try:
        # connect to the database
        dbc = sqlite3.connect("data/rsp-survey.db")
        dbc.row_factory = sqlite3.Row
        # execute SQL SELECT to Create JSON Data
        csr = dbc.cursor()
        if svCode == "*":
            csr.execute("SELECT ROWID AS SH_ROWID,* FROM SURVEY_HDR WHERE SH_OWNER='" + svOwner + "' ORDER BY SH_CODE;")
        else:
            csr.execute("SELECT ROWID AS SH_ROWID,* FROM SURVEY_HDR WHERE SH_CODE='" + svCode + "';")
        rows = csr.fetchall()
        if rows != None:
            # Convert to JSON Data
            hdr_json = json.dumps( [dict(idx) for idx in rows] )
            if svPart != "HEADER":
                bdy_json = ""
                hrow = json.loads(hdr_json)
                for row in hrow:
                    # Extract the "rowid" from the First Row to GET key to the Body
                    sh_rowid = row['SH_ROWID']
                    if sh_rowid:
                        csr.execute("SELECT * FROM SURVEY_BDY WHERE SB_HDR='" \
                                              + str(sh_rowid) + "' ORDER BY SB_SEQ ASC")
                        rows = csr.fetchall()
                        bdy_json += json.dumps( [dict(idx) for idx in rows] )
            #
            # Print HTTP Response JSON
            #
            print "Content-Type: application/json"
            print
            if svPart == "HEADER":
                print hdr_json
            if svPart == "BODY":
                print bdy_json
            if svPart == "BOTH":
                print '{"HEADER":' + hdr_json + ',"BODY":' + bdy_json + '}'

    except sqlite3.Error, e:
        # Handle Exceptions
        if dbc:
            dbc.rollback()
        
    finally:
        if dbc:
            dbc.close()
        
# Run The Program
main()
