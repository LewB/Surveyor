#!/usr/bin/env python
""" This Program returns the Survey Codes for a specified user
    Called from the Admin HOME page."""
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

#Define Main Function
def main():

    fs = cgi.FieldStorage()
    svOwner = fs.getvalue("SVOWNER")
    code_json = None
    
    try:
        # connect to the database
        dbc = sqlite3.connect("data/rsp-survey.db")
        dbc.row_factory = sqlite3.Row
        # execute SQL SELECT to Create JSON Data
        csr = dbc.cursor()
        csr.execute("SELECT SH_CODE FROM SURVEY_HDR WHERE SH_OWNER='" + svOwner + "' ORDER BY SH_CODE;")
        rows = csr.fetchall()
        if rows != None:
            # Convert to JSON Data
            code_json = json.dumps( [dict(idx) for idx in rows] )
            #
            # Print HTTP Response JSON
            #
            print "Content-Type: application/json"
            print
            print code_json
            
    except sqlite3.Error, e:
        # Handle Exceptions
        if dbc:
            dbc.rollback()
        print "Content-Type: text/plain"
        print
        print "ERR: " + e.args[0]
        
    finally:
        if dbc:
            dbc.close()
        
# Run The Program
main()
