import os
from datetime import datetime
from flask import Blueprint, request, jsonify
from src.hasura import Hasura

BP = Blueprint("person", __name__, url_prefix="/person")

@BP.route("/<int:person_id>/history", methods=["GET", "OPTIONS", "PUT"])
def personJournalEndpoint(person_id):
    FORMAT = "%Y-%m-%dT%H:%M:%S.%f+00:00"
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

@BP.after_request
def after_request(response):
    """Middleware for CORS
    """
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Credentials", "true")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
    response.headers.add("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")
    return response