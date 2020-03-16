import os
import json
from datetime import datetime
from flask import Blueprint, request, jsonify
from src.hasura import Hasura

BP = Blueprint("person", __name__, url_prefix="/person")

@BP.route("/<int:person_id>/history", methods=["GET", "OPTIONS", "PUT"])
def personJournalEndpoint(person_id):
    FORMAT = "%Y-%m-%dT%H:%M:%S.%f%z"
    hasura = Hasura(os.environ["HASURA_ADDR"], os.environ["HASURA_SCRT"])
    activityQuery = """
    {
        transaction(where: {person_id: {_eq: %d}}, order_by: {created_at: desc}) {
            id
            from
            to
            attrs
            stay
            contacted
            datetime
            flight_id
            created_at
        }
        record(where: {person_id: {_eq: %d}}, order_by: {created_at: desc}) {
            id
            status {
                id
                name
                risk
            }
            created_at
        }
    }
    """
    result = hasura.query(activityQuery % (person_id, person_id))
    activities = []
    transactions = result["data"]["transaction"]
    records = result["data"]["record"]
    for transaction in transactions:
        transaction["type"] = "transaction"
        activities.append(transaction)
    for record in records:
        record["type"] = "record"
        activities.append(record)
    activities = sorted(activities, key=lambda k: datetime.strptime(k['created_at'], FORMAT), reverse=True) 
    response = {
        "data":activities
    }
    return response

@BP.route("/addEntity/", methods=["POST", "OPTIONS", "PUT"])
def addEntityEndpoint():
    if request.method != "POST":
        return {}
    data = request.json
    entity = data.get("entity")
    if entity == None:
        return {"error": "No entity given"}
    hasura = Hasura(os.environ["HASURA_ADDR"], os.environ["HASURA_SCRT"])
    personQuery = """
    {
        person(where:{doc_id:{_eq: \\\"%s\\\"}}) {
            id
        }
    }
    """
    person = hasura.query(personQuery % entity["person"]["doc_id"])["data"]["person"]
    if len(person) > 0:
        person_id = person[0]["id"]
    else:
        person = entity["person"]
        addPersonQuery = """
            mutation {
                insert_person(
                objects: {
                    birthDate: \\\"%s\\\"
                    country: \\\"%s\\\"
                    doc_id: \\\"%s\\\"
                    firstName: \\\"%s\\\"
                    lastName: \\\"%s\\\"
                    phone: \\\"%s\\\"
                }
                ) {
                    returning {
                        id
                    }
                }
        }
        """
        birthDate = datetime.strptime(person["birthDate"].strip()[:10], "%Y-%m-%d")
        birthDate = datetime.strftime(birthDate, "%Y-%m-%dT%00:00:00.01+00:00")
        person_id = hasura.query(addPersonQuery % (birthDate,
                                                   person["country"],
                                                   person["doc_id"],
                                                   person["firstName"],
                                                   person["lastName"],
                                                   person["phone"]))["data"]["insert_person"]["returning"][0]["id"]
    addTransactionQuery = """
    mutation {
        insert_transaction(
        objects: {
            attrs: %s
            contacted: %s
            datetime: \\\"%s\\\"
            flight_id: \\\"%s\\\"
            from: \\\"%s\\\"
            person_id: %d
            stay: \\\"%s\\\"
            to: \\\"%s\\\"
        }
        ) {
        affected_rows
        }
    }
    """
    countries = ""
    tr = entity["transaction"]
    transCountries = json.loads(entity["transaction"]["attrs"])
    for country in transCountries:
        countries += f"{country}: true\n"
    countries = f"{countries}"
    contacted = "false"
    if tr["contacted"]:
        contacted = "true"
    result = hasura.query(addTransactionQuery % (countries, 
                                                 contacted, 
                                                 tr["datetime"], 
                                                 tr["flight_id"], 
                                                 tr["_from"], 
                                                 person_id, 
                                                 tr["stay"], 
                                                 tr["to"]))
    return {
        "status": "ok"
    }



@BP.after_request
def after_request(response):
    """Middleware for CORS
    """
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Credentials", "true")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
    response.headers.add("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")
    return response