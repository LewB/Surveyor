#!/usr/bin/env python
# -*- coding: UTF-8 -*-

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
    dbmode = fs.getvalue("MODE")

    # set the response text to "OK" by default
    dbg = "OK"

    try:
        dbc = sqlite3.connect("data/rsp-admin.db")
        # ****** DEL MODE *********
        if dbmode == "DEL":
            # ID Should Exist - go ahead and try to delete it
            try:
                dbc.execute("DELETE FROM LOGIN WHERE ID='" + logid + "'")
                dbc.commit()
            except (sqlite3.Error, e):
                dbg = "Failed to DELETE Login: " + logid + " Err: " + e.args[0]
        else:
            # ****** ADD OR CHANGE MODE *************************
            # execute SQL SELECT on CGI values
            csr = dbc.cursor()
            csr.execute("SELECT ID FROM LOGIN WHERE ID='" + logid + "'")
            # get first DB table row from cursor after select
            chkrow = csr.fetchone()
            if chkrow == None:
                if dbmode == "LOGOUT":
                    dbg = "Failed to Logout: " + logid + " Record not in Database."
                else:
                    # No ID Exists - go ahead and try to ADD it
                    try:
                        dbc.execute("INSERT INTO LOGIN (ID,PW,EMAIL) \
                                 VALUES ('" + logid + "', '" + logpw + "', '" + logem + "')")
                        dbc.commit()
                    except (sqlite3.Error):
                        dbg = "Failed to ADD Login: " + logid + " to DB LOGIN Table."
            else:
                if dbmode == "LOGOUT":
                    # Have a match so Logout.
                    try:
                        dbc.execute("UPDATE LOGIN SET LOGKEY=NULL WHERE ID='" + logid + "'")
                        dbc.commit()
                    except (sqlite3.Error):
                        dbg = "Failed to Logout: " + logid + " in DB LOGIN Table."
                else:
                    # Have a match so Change it.
                    try:
                        dbc.execute("UPDATE LOGIN SET PW='" + logpw + "', EMAIL='" + logem + "' \
                                        WHERE ID='" + logid + "'")
                        dbc.commit()
                    except (sqlite3.Error):
                        dbg = "Failed to CHANGE Login: " + logid + " in DB LOGIN Table."
        
    except (sqlite3.Error):
        dbg = "Could not Open Admin DB."
        
    finally:
        if dbc:
            # Close the Database
            dbc.close()
            

    #
    # Print HTTP Response text: "OK" if no errors, else error string.
    # Variable "dbg" will be set to either condition.
    #
    print "Content-Type: text/plain"
    print
    print dbg

# Run It
main()
