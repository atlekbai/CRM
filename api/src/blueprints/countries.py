import time
import os
from functools import lru_cache
from datetime import datetime, timedelta

import requests
from bs4 import BeautifulSoup
from flask import Blueprint, request, jsonify
from src.hasura import Hasura

BP = Blueprint("countries", __name__, url_prefix="/countries")

@lru_cache()
def getCountriesData(ttl_hash=None):
    del ttl_hash
    url="https://www.worldometers.info/coronavirus/#countries"
    html_content = requests.get(url).text
    soup = BeautifulSoup(html_content, features="html.parser")

    countries_table = soup.find("table", attrs={"id": "main_table_countries"})
    countries_table_data = countries_table.tbody.find_all("tr")

    t_headers = []
    for th in countries_table.find_all("th"):
        t_headers.append(th.text.replace('\n', ' ').strip())

    table_data = {}
    for tr in countries_table_data:
        t_row = {}
        for td, th in zip(tr.find_all("td"), t_headers):
            t_row[th] = td.text.replace('\n', '').strip()
        table_data[t_row['Country,Other']] = t_row
    return table_data

def getTTLHash(seconds=600):
    """Return the same value withing `seconds` time period"""
    return round(time.time() / seconds)

@BP.route("/top/", methods=["GET", "OPTIONS", "PUT"])
def topCountriesEndpoint():
    WHOData = getCountriesData(getTTLHash)
    topCountries = []
    count = 0
    for key in WHOData:
        if count == 50:
            break
        topCountries.append(WHOData[key])
        count += 1
    response = {
        "data":topCountries
    }
    return response

@BP.route("/risky/", methods=["GET", "OPTIONS"])
def riskyTransactionsEndpoint():
    FORMAT = "%Y-%m-%dT%H:%M:%S.%f+00:00"
    hasura = Hasura(os.environ["HASURA_ADDR"], os.environ["HASURA_SCRT"])

    nonSafeTransactionsQuery = """
    {
    person_record_view(where: {record: {status_id: {_neq: 4}}}) {
        record {
            id
            status {
                id
                name
                risk
            }
        }
        person {
        transactions(order_by: {id: desc}, limit: 1) {
            from
            to
            datetime
            attrs
            created_at
        }
        }
    }
    }
    """

    nonSafeTransactions = hasura.query(nonSafeTransactionsQuery)["data"]["person_record_view"]
    riskyTransactions = []
    for entity in nonSafeTransactions:
        record = entity["record"]
        transactions = entity["person"]["transactions"]
        if len(transactions) < 1:
            continue
        transaction = transactions[0]
        riskyEntityQuery = """
        {
            person_record_view(where: {record: {status_id: {_neq: 4}}, person: {transactions: {_or:[
            {
                                to: {_eq: \\\"%s\\\"}, 
                                datetime: {
                                    _gte: \\\"%s\\\", 
                                    _lte: \\\"%s\\\"
                                }},
            {
                                from: {_eq: \\\"%s\\\"}, 
                                datetime: {
                                    _gte: \\\"%s\\\", 
                                    _lte: \\\"%s\\\"
                                }}
            ]}}}) {
                    person {
                        transactions(where: {_or:[
            {
                                to: {_eq: \\\"%s\\\"}, 
                                datetime: {
                                    _gte: \\\"%s\\\", 
                                    _lte: \\\"%s\\\"
                                }},
            {
                                from: {_eq: \\\"%s\\\"}, 
                                datetime: {
                                    _gte: \\\"%s\\\", 
                                    _lte: \\\"%s\\\"
                                }}
            ]}) {
                        id
                        from
                        to
                        person {
                            id
                            firstName
                            lastName
                        }
                        datetime
                        flight_id
                        contacted
                        attrs
                        created_at
                    }
                }
            }
        }
        """
        toPoint = transaction["to"]
        gteDate = transaction["datetime"]
        lteDate = datetime.strptime(gteDate, FORMAT) + timedelta(hours=1)
        lteDate = datetime.strftime(lteDate, FORMAT)
        
        potentialRiskyEntity = hasura.query(riskyEntityQuery % (toPoint, gteDate, lteDate,toPoint, gteDate, lteDate,toPoint, gteDate, lteDate, toPoint, gteDate, lteDate))["data"]["person_record_view"]
        for potentialEntity in potentialRiskyEntity:
            for trans in potentialEntity["person"]["transactions"]:
                trans["record"] = record
                riskyTransactions.append(trans)

    WHOData = getCountriesData(getTTLHash)
    countries = []
    count = 0
    for key in WHOData:
        if count == 50:
            break
        countries.append(WHOData[key])
        count += 1
    orCondition = ""
    for country in countries:
        countryName = country["Country,Other"]
        countryName = countryName.replace(".", "")
        countryName = countryName.replace("-", "")
        countryName = countryName.replace(" ", "")
        orCondition += "{attrs: {_contains:{%s: true}}}\n" % countryName

    riskyCountriesEntitiesQuery = """
    {
    person_record_view(where: {record: {status_id: {_neq: 4}, person: {transactions: {_or:[%s]}}}}) {
        person {
                transactions(where: {_or: [
                    %s
                ]}) {
                    id
                    from
                    to
                    person {
                        id
                        firstName
                        lastName
                    }
                    datetime
                    flight_id
                    contacted
                    attrs
                    created_at
                }
            }
        }
    }
    """
    riskyCountriesEntities = hasura.query(riskyCountriesEntitiesQuery % (orCondition, orCondition))["data"]["person_record_view"]
    for riskyCountriesEntity in riskyCountriesEntities:
        for trans in riskyCountriesEntity["person"]["transactions"]:
            found = False
            for fTrans in riskyTransactions:
                if fTrans['id'] == trans['id']:
                    found = True
                    break
            if not found:
                trans["type"] = "Risky Country"
                riskyTransactions.append(trans)
    riskyTransactions = sorted(riskyTransactions, key=lambda k: datetime.strptime(k['created_at'], "%Y-%m-%dT%H:%M:%S.%f+00:00"), reverse=True) 
    response = {
        "data":riskyTransactions
    }
    return response

@BP.route("/", methods=["POST", "OPTIONS", "PUT"])
def countriesEndpoint():
    if request.method != "POST":
        return
    data = request.json
    countries = data.get("countries")
    if countries == None or \
        type(countries) is not list or \
        len(countries) < 1 or \
        type(countries[0]) is not str:
        return {"error": "No countries given"}
    WHOData = getCountriesData(getTTLHash)
    foundData = {}
    for country in countries:
        if country not in WHOData:
            continue
        foundData[country] = WHOData[country]
    response = {
        "data":foundData
    }
    return response

@BP.after_request
def after_request(response):
    """Middleware for CORS
    """
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Credentials", "true")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
    response.headers.add("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")
    return response