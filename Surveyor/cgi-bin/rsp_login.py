#!/usr/bin/env python
# -*- coding: UTF-8 -*-

import time

# use the cgi library
import cgi

# enable debugging
#import cgitb
#cgitb.enable()

# use internal sqlite3 database
import sqlite3

#Define Main Function
def main():
    # use the cgi interface to get POSTED values
    fs = cgi.FieldStorage()
    logid = fs.getvalue("LOGID")
    logpw = fs.getvalue("LOGPW")
    logem = fs.getvalue("LOGEM")

    # set the response text to "OK" by default
    dbg = "OK"

    dbc = None
    try:
        dbc = sqlite3.connect("data/rsp-admin.db")
        try:
            # execute SQL SELECT on CGI values
            csr = dbc.cursor()
            csr.execute("SELECT * FROM LOGIN WHERE ID='" + logid + "' AND PW='" + logpw + "'")
            # get first DB table row from cursor after select
            chkrow = csr.fetchone()
        except (sqlite3.Error):
            # check for hard coded initial values to create and access database table
            if logid == "Admin" and logpw == "password":
                try:
                    dbc.execute('''CREATE TABLE IF NOT EXISTS LOGIN
                     (ID TEXT PRIMARY KEY     NOT NULL UNIQUE,
                      PW TEXT                 NOT NULL,
                      EMAIL TEXT,
                      LOGKEY TEXT);''')
                    dbc.execute("INSERT INTO LOGIN (ID,PW,EMAIL,LOGKEY) \
                         VALUES ('" + logid + "', '" + logpw + "', NULL, NULL);")
                    dbc.commit()
                except sqlite3.Error, e:
                    if dbc:
                        dbc.rollback()
                    dbg = "ERR:Failed to Create Initial DB Table: " + e.args[0]
            else:
                dbg = "ERR:BAD INITIAL CREDENTIALS=[LOGID=" + logid + "&LOGPW=" + logpw + "]."
        else:
            if chkrow == None:
                dbg = "ERR:No Match for Login Credentials Found."
            else:
                # Have a match - Set LOGKEY Value.
                if chkrow[3] == None or chkrow[3] == "":
                    # Set LOGKEY string
                    utim = str(time.time())
                    try:
                        dbc.execute("UPDATE LOGIN SET LOGKEY='" + utim + "' WHERE ID='" + logid + "'")
                        dbc.commit()
                        dbg = "OK:" + utim
                    except sqlite3.Error, e:
                        if dbc:
                            dbc.rollback()
                        dbg = "ERR:Failed to Set LOGKEY For " + logid + "Error=" + e.args[0]
                else:
                    dbg = "DUPE: " + chkrow[3]
        
    except sqlite3.Error, e:
        # Handle Exceptions
        if dbc:
            dbc.rollback()
        dbg = "ERR: Admin DB: " + e.args[0]
        
    finally:
        # Close the database
        if dbc:
            dbc.close()
    #
    # Print HTTP Response text: "OK" if no errors, else error string.
    # Variable "dbg" will be set to either condition.
    #
    print "Content-Type: text/plain"
    print
    print dbg

main()
