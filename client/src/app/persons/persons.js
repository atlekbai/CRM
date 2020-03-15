import React, { Component } from "react";
// import { Link } from "react-router-dom";
import { useHistory } from "react-router-dom";

const PersonView = ({ persons }) => {
  let history = useHistory();

  const handleClick = (e, id) => {
    console.log(id);
    history.push(`/persons/${id}`);
  };

  return persons.map(person => {
    const { id, firstName, lastName, birthDate, country, phone } = person;
    return (
      <tr key={id} onClick={e => handleClick(e, id)}>
        <td>
          {firstName} {lastName}
        </td>
        <td>{birthDate}</td>
        <td>{country}</td>
        <td>{phone}</td>
      </tr>
    );
  });
};

export default class Persons extends Component {
  render() {
    console.log("he");
    console.log(this.props);
    const { person } = this.props.data;
    console.log(person);
    // let a = person.map(e => {
    //   return <h2>{e.country}</h2>;
    // });
    return (
      <div className="col-lg-12 grid-margin stretch-card">
        <div className="card">
          <div className="card-body">
            <h4 className="card-title">Персоны</h4>
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>ФИО</th>
                    <th>Дата рождения</th>
                    <th>Гражданство</th>
                    <th>Телефон</th>
                  </tr>
                </thead>
                <tbody>
                  <PersonView persons={person} />
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
