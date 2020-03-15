import React, { Component, useState } from "react";
import { Form, Button } from "react-bootstrap";
import DatePicker from "react-datepicker";
import { CountryDropdown } from "react-country-region-selector";

import gql from "graphql-tag";
import { useMutation } from "@apollo/react-hooks";

import TextInput from "react-autocomplete-input";
import "react-autocomplete-input/dist/bundle.css";

const ADD_TRANSACTION = gql`
  mutation MyMutation(
    $attrs: jsonb
    $contacted: Boolean!
    $datetime: timestamptz!
    $flight_id: String!
    $from: String!
    $person_id: Int!
    $stay: String!
    $to: String!
  ) {
    insert_transaction(
      objects: {
        attrs: $attrs
        contacted: $contacted
        datetime: $datetime
        flight_id: $flight_id
        from: $from
        person_id: $person_id
        stay: $stay
        to: $to
      }
    ) {
      affected_rows
    }
  }
`;

const ADD_PERSON = gql`
  mutation MyMutation(
    $birthDate: date
    $country: String!
    $doc_id: String!
    $firstName: String!
    $lastName: String!
    $phone: String!
  ) {
    insert_person(
      objects: {
        birthDate: $birthDate
        country: $country
        doc_id: $doc_id
        firstName: $firstName
        lastName: $lastName
        phone: $phone
      }
    ) {
      returning {
        id
      }
    }
  }
`;

class DocIDForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      options: [],
      exist: [],
      doc: ""
    };

    this.handleChange = this.handleChange.bind(this);
  }
  // add error!

  fetchDocID = docID => {
    //change token
    docID = docID.replace(/@/g, "").trim();
    fetch("http://crm.alem.school/v1/graphql", {
      credentials: "include",
      headers: {
        accept: "*/*",
        "accept-language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7,fr;q=0.6",
        authorization: `Bearer ${localStorage.getItem("jwt")}`,
        "content-type": "application/json"
      },
      referrer: "http://crm.alem.school/console/api-explorer",
      referrerPolicy: "no-referrer-when-downgrade",
      body: `{"query":"query MyQuery {\\n  person(where: {doc_id: {_like: \\"${docID}%\\"}}) {\\n    phone\\n birthDate\\n    country\\n    firstName\\n    id\\n    lastName\\n    doc_id\\n id\\n }\\n}\\n","variables":null,"operationName":"MyQuery"}`,
      method: "POST",
      mode: "cors"
    })
      .then(r => {
        return r.json();
      })
      .then(r => {
        let options = r.data.person.map(u => {
          return u.doc_id;
        });
        this.setState({
          options: options,
          exist: r,
          doc: docID
        });
      });
  };

  handleChange(value) {
    if (value.length >= 5) {
      this.fetchDocID(value);
      this.props.updateUserDoc(value);
    }
  }

  //   componentDidUpdate = e => {
  //     console.log("upate");
  //     console.log(e);
  //   };

  render() {
    const { userDataExist } = this.props;
    const { exist, doc, options } = this.state;
    return (
      <div className="row">
        <div className="col-12 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <form className="forms-sample"></form>
              <Form.Group>
                <label htmlFor="docID">ИИН</label>
                <TextInput
                  onChange={this.handleChange}
                  className="form-control"
                  onRequestOptions={this.handleRequestOptions}
                  options={this.state.options}
                  trigger=""
                />
                {/* <Form. */}
                {options.length > 0 ? (
                  <Button onClick={e => userDataExist(exist, doc)}>
                    Загрузить из базы
                  </Button>
                ) : null}
              </Form.Group>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const TransactionDataForm = ({ userId }) => {
  console.log(userId);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [visited, setVisited] = useState("");
  const [stay, setStay] = useState("");
  const [contacted, setContacted] = useState(false);
  const [datetime, setDatetime] = useState(new Date());
  const [flightID, setFlightID] = useState("");

  const [
    addTransaction,
    { loading: mutationLoading, error: mutationError, data: mutationSuccess }
  ] = useMutation(ADD_TRANSACTION);

  return (
    <div className="row">
      <div className="col-12 grid-margin stretch-card">
        <div className="card">
          <div className="card-body">
            <h4 className="card-title">Транзакция</h4>
            
            <form
              className="forms-sample"
              onSubmit={e => {
                e.preventDefault();
                console.log(
                  visited,
                  contacted,
                  datetime,
                  flightID,
                  from,
                  userId,
                  stay,
                  to
                );
                // $attrs: String!
                // $contacted: Boolean!
                // $datetime: date!
                // $flight_id: String!
                // $from: String!
                // $person_id: Int!
                // $stay: String!
                // $to: String!
                const toObject = arr => {
                  var rv = {};
                  for (var i = 0; i < arr.length; ++i) rv[arr[i]] = true;
                  return rv;
                };
                addTransaction({
                  variables: {
                    attrs: JSON.stringify(toObject(visited.split("\n"))),
                    contacted,
                    datetime: datetime.toISOString(),
                    flight_id: flightID,
                    from,
                    person_id: userId,
                    stay,
                    to
                  }
                });
              }}
            >
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
                  value={visited}
                  onChange={e => setVisited(e.target.value)}
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
                  value={flightID}
                  onChange={e => setFlightID(e.target.value)}
                />
              </Form.Group>
              <button type="submit" className="btn btn-primary mr-2">
                Добавить
              </button>
              {mutationLoading && <p>Loading...</p>}
              {mutationError && <p>Error :( Please try again</p>}
              {mutationSuccess && <p>Добавлен</p>}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

const UserDataForm = ({
  updateUserId,
  userData = {
    birthDate: "",
    country: "",
    firstName: "",
    lastName: "",
    phone: "",
    doc_id: ""
  },
  userDoc = ""
}) => {
  console.log(userDoc);
  const [startDate, setStartDate] = useState(new Date());
  const [country, setCountry] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");

  const [
    addPerson,
    { loading: mutationLoading, error: mutationError, data: mutationSuccess }
  ] = useMutation(ADD_PERSON, {
    onCompleted(mutationSuccess) {
      updateUserId(mutationSuccess.insert_person.returning[0].id);
    }
  });

  let {
    birthDate: oldBirthDate,
    country: oldCountry,
    firstName: oldFirstName,
    lastName: oldLastName,
    phone: oldPhone,
    doc_id: oldDocID
  } = userData;

  let countryLast = country || oldCountry;
  // let date = startDate || birthDate;

  return (
    <div className="row">
      <div className="col-12 grid-margin stretch-card">
        <div className="card">
          <div className="card-body">
            <h4 className="card-title">Персональные данные</h4>
            <form
              className="forms-sample"
              onSubmit={e => {
                e.preventDefault();
                // $birthDate: DateTime!
                // $country: String!
                // $doc_id: String!
                // $firstName: String!
                // $lastName: String!
                // $phone: String!
                addPerson({
                  variables: {
                    birthDate: startDate.toISOString(),
                    country,
                    doc_id: userDoc,
                    firstName,
                    lastName,
                    phone
                  }
                });
                // input.value = "";
              }}
            >
              <Form.Group>
                <label htmlFor="lastName">Фамилия</label>
                <Form.Control
                  type="text"
                  id="lastName"
                  placeholder={oldLastName || "Фамилия"}
                  size="lg"
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
                  placeholder={oldFirstName || "Имя"}
                />
              </Form.Group>
              <Form.Group className="row">
                <label className="col-sm-3 col-form-label">Дата рождения</label>
                <div className="col-sm-9">
                  <DatePicker
                    className="form-control w-100"
                    selected={
                      oldBirthDate && oldBirthDate !== ""
                        ? new Date(oldBirthDate)
                        : startDate
                    }
                    onChange={e => setStartDate(e)}
                  />
                </div>
              </Form.Group>
              <Form.Group>
                <label htmlFor="country">Гражданство</label>
                <CountryDropdown
                  defaultOptionLabel="Выберите страну"
                  className="form-control"
                  value={countryLast}
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
                  placeholder={oldPhone || "Номер телефона"}
                  // value={phone}
                />
              </Form.Group>
              {oldDocID || (
                <button type="submit" className="btn btn-primary mr-2">
                  Добавить
                </button>
              )}
              {mutationLoading && <p>Loading...</p>}
              {mutationError && <p>Error :( Please try again</p>}
              {mutationSuccess && <p>Добавлен</p>}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default class AddPerson extends Component {
  state = {
    userData: {},
    userDoc: "",
    userId: null
  };

  updateUserDoc = e => {
    this.setState({ userDoc: e });
  };

  userDataExist = (data, doc) => {
    console.log(data);
    if (
      "data" in data &&
      "person" in data.data &&
      data.data.person.length > 0
    ) {
      this.setState({ userData: data.data.person[0] });
    }
    this.setState({ userDoc: doc });
    let id = this.state.userData.userId || data.data.person[0].id;
    this.setState({ userId: id });
  };

  updateUserId = e => {
    this.setState({ userId: e });
    console.log(this.state.userId);
  };

  render() {
    const { userData, userDoc, userId } = this.state;
    return (
      <React.Fragment>
        <DocIDForm
          userDataExist={this.userDataExist}
          updateUserDoc={this.updateUserDoc}
        />
        <UserDataForm
          updateUserId={this.updateUserId}
          userData={userData}
          userDoc={userDoc}
        />
        {userId !== null ? (
          <TransactionDataForm userData={userData} userId={userId} />
        ) : null}
      </React.Fragment>
    );
  }
}
