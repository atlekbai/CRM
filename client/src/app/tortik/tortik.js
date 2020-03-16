import React, { Component, useState } from "react";
import { Form, Button } from "react-bootstrap";
import DatePicker from "react-datepicker";
import { CountryDropdown } from "react-country-region-selector";

class FileInput extends React.Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.fileInput = React.createRef();
  }

  handleSubmit(event) {
    event.preventDefault();
    this.upload(this.fileInput.current.files[0]);
  }

  toBase64 = file =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });

  main = async file => {
    return await this.toBase64(file);
  };

  upload = file => {
    console.log(file);
    this.main(file).then(r => {
      console.log(r);
      fetch("http://172.31.15.138:7071/detect/", {
        method: "POST",
        headers: {
          Authorization: `${localStorage.getItem("jwt")}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ image: r.split("base64,")[1] }) // This is your file object
      })
        .then(
          response => {
            console.log(response);

            return response.json();
          } // if the response is a JSON object
        )
        .then(
          success => {
            console.log("yay", success);
            const {
              setFirstName,
              setLastName,
              setStartDate,
              setCountry,
              setDocID,
              setPhone,
              setAttrs,
              setContacted,
              setFrom,
              setTo,
              setDatetime
            } = this.props;
            const { person } = success.data;
            const { transaction } = success.data;
            const isValidDate = d => {
              return d instanceof Date && !isNaN(d);
            };
            setFirstName(person.firstName);
            setLastName(person.lastName);
            setStartDate(
              isValidDate(new Date(transaction.birthDate))
                ? new Date(transaction.birthDate)
                : new Date()
            );
            setCountry(person.country);
            setDocID(person.doc_id);
            setPhone(person.phone);

            setFrom(transaction._from);
            setTo(transaction.to);
            setAttrs(transaction.attrs);
            setContacted(transaction.contacted);

            setDatetime(
              isValidDate(new Date(transaction.dateTime))
                ? new Date(transaction.dateTime)
                : new Date()
            );
          } // Handle the success response object
        )
        .catch(
          error => console.log(error) // Handle the error response object
        );
    });
  };

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          Upload file:
          <input type="file" ref={this.fileInput} />
        </label>
        <br />
        <button type="submit">Submit</button>
      </form>
    );
  }
}

const Tortik = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [country, setCountry] = useState("");
  const [doc_id, setDocID] = useState("");
  const [attrs, setAttrs] = useState({});
  const [contacted, setContacted] = useState(false);
  const [stay, setStay] = useState("");
  const [phone, setPhone] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [flight_id, setFlightID] = useState("");
  const [datetime, setDatetime] = useState(new Date());
  //   const [personData, setPersonData] = useState({});
  //   const [transactionData, setTransactionData] = useState({});

  const InsertPersonAndTransaction = () => {
    // api.crm.alem.school/person/addEntity/
    const url = "http://api.crm.alem.school/person/addEntity/";
    const data = {
      entity: {
        person: {
          lastName,
          firstName,
          birthDate: startDate,
          phone,
          doc_id,
          country
        },
        transaction: {
          attrs: JSON.stringify(["Italy"]),
          contacted,
          datetime,
          flight_id,
          _from: from,
          to,
          stay
        }
      }
    };
    console.log(JSON.stringify(data));
    fetch(url, {
      method: "POST", // or ‘PUT’
      body: JSON.stringify(data), // data can be `string` or {object}!
      headers: { "Content-Type": "application/json" }
    })
      .then(res => res.json())
      .catch(error => console.error("Error:", error))
      .then(response => console.log("Success:", response));

    console.log("hello");
    console.log(
      lastName,
      firstName,
      startDate,
      country,
      doc_id,
      attrs,
      stay,
      phone,
      from,
      to,
      flight_id,
      datetime
    );
  };

  return (
    <div className="row">
      <div className="col-12 grid-margin stretch-card">
        <div className="card">
          <div className="card-body">
            <h4 className="card-title">Форма с распознованием текста</h4>
            <p className="card-description"> </p>
            <FileInput
              setFirstName={setFirstName}
              setLastName={setLastName}
              setStartDate={setStartDate}
              setCountry={setCountry}
              setDocID={setDocID}
              setAttrs={setAttrs}
              setContacted={setContacted}
              setStay={setStay}
              setPhone={setPhone}
              setFrom={setFrom}
              setTo={setTo}
              setFlightID={setFlightID}
              setDatetime={setDatetime}
            />
            <form
              className="forms-sample"
              onSubmit={e => {
                console.log("w");
                e.preventDefault();
                InsertPersonAndTransaction();
              }}
            >
              <Form.Group>
                <label htmlFor="docID">ИИН</label>
                <Form.Control
                  type="text"
                  id="docID"
                  value={doc_id}
                  size="lg"
                  onChange={e => setDocID(e.target.value)}
                />
              </Form.Group>
              <Form.Group>
                <label htmlFor="lastName">Фамилия</label>
                <Form.Control
                  type="text"
                  id="lastName"
                  // placeholder={oldLastName || "Фамилия"}
                  size="lg"
                  // defaultValue={
                  //   personData.hasOwnProperty("firstName")
                  //     ? personData.firstName
                  //     : "empty"
                  // }
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                />
              </Form.Group>
              <Form.Group>
                <label htmlFor="firstName">Имя</label>
                <Form.Control
                  type="text"
                  className="form-control"
                  id="firstName"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  // placeholder={oldFirstName || "Имя"}
                />
              </Form.Group>
              <Form.Group className="row">
                <label className="col-sm-3 col-form-label">Дата рождения</label>
                <div className="col-sm-9">
                  <DatePicker
                    className="form-control w-100"
                    selected={startDate}
                    onChange={e => setStartDate(e)}
                  />
                </div>
              </Form.Group>
              <Form.Group>
                <label htmlFor="country">Гражданство</label>
                <CountryDropdown
                  defaultOptionLabel="Выберите страну"
                  className="form-control"
                  value={country}
                  onChange={val => setCountry(val)}
                />
              </Form.Group>
              <Form.Group>
                <label htmlFor="phoneNumber">Номер телефона</label>
                <Form.Control
                  type="text"
                  className="form-control"
                  id="phoneNumber"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  // placeholder={oldPhone || "Номер телефона"}
                />
              </Form.Group>
              <Form.Group>
                <label htmlFor="from">Откуда</label>
                <Form.Control
                  type="text"
                  id="from"
                  placeholder="Город"
                  size="lg"
                  value={from}
                  onChange={e => setFrom(e.target.value)}
                />
              </Form.Group>
              <Form.Group>
                <label htmlFor="to">Куда</label>
                <Form.Control
                  type="text"
                  id="to"
                  placeholder="Город"
                  size="lg"
                  value={to}
                  onChange={e => setTo(e.target.value)}
                />
              </Form.Group>
              <Form.Group>
                <label htmlFor="places">Страны за последние 14 дней</label>
                <Form.Control
                  as="textarea"
                  rows="4"
                  id="places"
                  placeholder="Города"
                  size="lg"
                  value={attrs}
                  onChange={e => setAttrs(e.target.value)}
                />
              </Form.Group>
              <Form.Group>
                <label htmlFor="live">Место проживания</label>
                <Form.Control
                  type="text"
                  className="form-control"
                  id="live"
                  placeholder="Адрес"
                  value={stay}
                  onChange={e => setStay(e.target.value)}
                />
              </Form.Group>
              <Form.Group>
                <label htmlFor="contact">Контакт с больными</label>
                <div className="form-check">
                  <label className="form-check-label">
                    <input
                      type="radio"
                      className="form-check-input"
                      name="optionsRadios"
                      id="optionsRadios1"
                      value="false"
                      onChange={e => setContacted(false)}
                      defaultChecked
                    />
                    <i className="input-helper"></i>
                    Нет
                  </label>
                </div>
                <div className="form-check">
                  <label className="form-check-label">
                    <input
                      type="radio"
                      className="form-check-input"
                      name="optionsRadios"
                      id="optionsRadios2"
                      value="true"
                      onChange={e => setContacted(true)}
                    />
                    <i className="input-helper"></i>
                    Да
                  </label>
                </div>
              </Form.Group>
              <Form.Group>
                <label htmlFor="date">Дата</label>
                <DatePicker
                  className="form-control w-100"
                  locale="pt-BR"
                  showTimeSelect
                  timeFormat="p"
                  timeIntervals={15}
                  dateFormat="Pp"
                  onChange={e => setDatetime(e)}
                  selected={datetime}
                />
              </Form.Group>
              <Form.Group>
                <label htmlFor="flight">Рейс</label>
                <Form.Control
                  type="text"
                  id="flight"
                  placeholder="номер рейса"
                  size="lg"
                  value={flight_id}
                  onChange={e => setFlightID(e.target.value)}
                />
              </Form.Group>
              <button type="submit" className="btn btn-primary mr-2">
                Submit
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export { Tortik };
