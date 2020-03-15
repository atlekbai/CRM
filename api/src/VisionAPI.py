import os
import json

from google.cloud import vision
from google.cloud.vision import types

class Person:
	lastName = ""
	firstName = ""
	birthDate = ""
	country = ""
	phone = ""
	doc_id = ""

class Transaction:
	attrs = ["", "", ""]
	contacted = False
	dateTime = ""
	_from =  ""
	to = ""

def get_rid_of_spaces(str) :
	tmp = ""
	for i in range (len(str)) :
		if str[i] != ' ' :
			tmp += str[i]
	return tmp

def get_rid_of_endls(str) :
	tmp = ""
	for i in range (len(str) - 3) :
		if str[i] == '\n' and str[i + 2] != '.' and str[i + 3] != '.':
			tmp += ' '
		else : 
			tmp += str[i]
	return tmp
	
def parse(str, start, end) :	
	st = str.find(start) + len(start)
	en = str.find(end) - 1
	if end == "None" :
		return get_rid_of_spaces(str[st:])	
	return get_rid_of_spaces(str[st:en])

os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = r'mygooglecredentials.json'

class VisionAPI:
	def __init__(self):
		self.client = vision.ImageAnnotatorClient()
		
	def detect(self, imageBytes):
		image = vision.types.Image(content=imageBytes)
		response = self.client.text_detection(
			image=image,
			image_context={"language_hints": ["en"]},
		)
		docText = response.full_text_annotation.text
		cnt = 0
		contact = ""
		st = get_rid_of_endls(docText)
		pr = Person()
		tr = Transaction()

		pr.lastName = parse(st, "Surname:", "2. Name:")
		pr.firstName = parse(st, "Name:", "3. Middle name:")
		pr.birthDate = parse(st, "Birthday (dd.mm.yyyy):", "5. Citizenship:")
		pr.country = parse(st, "Citizenship:", "6. IIN:")
		pr.doc_id = parse(st, "IIN:", "7. Place of work:")
		pr.phone = parse(st, "Phone:", "12. Trajectory")

		tr.attrs[0] = parse(st, "a.", "b.")
		tr.attrs[1] = parse(st, "b.", "c.")
		tr.attrs[2] = parse(st, "c.", "9. Did you have")

		contact = parse(st, "contact with sick people?", "10. Where do you live").lower()
		tr.dateTime = parse(st, "Date of filling (dd.mm.yyyy):", "None")
		tr._from = parse(st, "From:", "To:")
		tr.to = parse(st, "To:", "13. Date of filling")

		if (contact.find("yes") != -1) :
			tr.contacted = True

		tr.attrs = json.dumps(tr.attrs, separators=(',', ':'))
		jsonpr = pr.__dict__
		jsontr = tr.__dict__
		
		return {
			'person': jsonpr,
			'transaction': jsontr
		}
