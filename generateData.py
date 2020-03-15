import os
from random import randrange, randint, choice
from datetime import datetime, timedelta

import names
import pycountry
import geonamescache

from hasura import Hasura

def randomDate(start, end):
    """
    This function will return a random datetime between two datetime 
    objects.
    """
    delta = end - start
    int_delta = (delta.days * 24 * 60 * 60) + delta.seconds
    random_second = randrange(int_delta)
    return start + timedelta(seconds=random_second)

def randomPhone():
    n = '0000000000'
    while '9' in n[3:6] or n[3:6]=='000' or n[6]==n[7]==n[8]==n[9]:
        n = str(randint(10**9, 10**10-1))
    return n[:3] + '-' + n[3:6] + '-' + n[6:]

hasura = Hasura(os.environ["HASURA_ADDR"], os.environ["HASURA_SCRT"])

insertQuery = """
mutation {
  insert_person(objects: {
      firstName: \\\"%s\\\", 
      lastName: \\\"%s\\\", 
      birthDate: \\\"%s\\\", 
      country: \\\"%s\\\", 
      docID: \\\"%s\\\", 
      phone: \\\"%s\\\"}) {
    affected_rows
  }
}
"""

### Генерация 30 персон со случайными данными

for i in range(30):
    firstName = names.get_first_name()
    lastName = names.get_last_name()
    bornDate = randomDate(datetime.strptime('01.01.1950', '%d.%m.%Y'), datetime.strptime('31.12.2001', '%d.%m.%Y'))
    bornDate = datetime.strftime(bornDate, "%Y-%m-%dT00:00:00+06:00")
    country = list(pycountry.countries)[randint(0,249)].name
    docID = f"{randint(0, 999999999):09}"
    phone = randomPhone()
    result = hasura.query(insertQuery % (firstName, lastName, bornDate, country, docID, phone))

personQuery = """
{
  person {
    firstName
    lastName
    birthDate
    country
    docID
    phone
    id
  }
}
"""
insertTransaction = """
mutation {
  insert_transaction(objects: {
      personID: %d, 
      attrs: {%s}, 
      stay: \\\"%s\\\", 
      contacted: %s, 
      datetime: \\\"%s\\\", 
      flightID: \\\"%s\\\", 
      from: \\\"%s\\\", 
      to: \\\"%s\\\", 
      typeID: %d}) {
    affected_rows
  }
}
"""
### Генерация случайных транзакций для присутствующих в базе персон

persons = hasura.query(personQuery)["data"]["person"]
gc = geonamescache.GeonamesCache()
cities = gc.get_cities()
countries = gc.get_countries()
randomcities = [cities[choice(list(cities.keys()))] for i in range(30)]
kzcities = [cities[city] for city in cities if cities[city].get('countrycode') == 'KZ']
alphabet = "QWERTYUIOPASDFGHJKLZXCVBNM"
for person in persons:
    personID = person['id']
    visited = ""
    visitedAmount = randint(0, 5)
    for i in range(visitedAmount):
        countryName = countries[choice(list(countries.keys()))]['name']
        countryName = countryName.replace(".", "")
        countryName = countryName.replace("-", "")
        countryName = countryName.replace(" ", "")
        visited += f"{countryName}:true\n"
    stay = "Random Address"
    contacted = choice(["true", "false"])

    date = randomDate(datetime.strptime('01.01.2020', '%d.%m.%Y'), datetime.strptime('14.03.2020', '%d.%m.%Y'))
    hour = randint(0, 23)
    minute = randint(0, 59)
    date = datetime.strftime(date, f"%Y-%m-%dT{hour:02}:{minute:02}:00+06:00")
    flight = choice(alphabet)+choice(alphabet)
    fromPoint = randomcities[randint(0, len(randomcities)-1)]['name']
    toPoint = kzcities[randint(0, len(kzcities)-1)]['name']
    typeID = randint(1, 4)
    result = hasura.query(insertTransaction % (personID, visited, stay, contacted, date, flight, fromPoint, toPoint, typeID))
