import React, { Component } from "react";
import TransactionsContainer from "../containers/transactions";
import { useHistory } from "react-router-dom";

const PotentialView = ({ item }) => {
  let history = useHistory();

  const handleClick = (e, id) => {
    console.log(id);
    history.push(`/persons/${id}`);
  };

  return (
    <tr
      key="item.id"
      className="table-danger"
      onClick={e => handleClick(e, item.person.id)}
    >
      <td>
        {item.person.firstName} {item.person.lastName}
      </td>
      <td> {item.datetime} </td>
      <td>
        {" "}
        {item.from} => {item.to}{" "}
      </td>
      <td> {item.flight_id} </td>
      <td> Same flight {item.record.status.name}</td>
    </tr>
  );
};

export default class Main extends Component {
  constructor(props) {
    super(props);
  }
  state = {
    error: null,
    isLoaded: false,
    items: []
  };

  componentDidMount() {
    fetch(`http://api.crm.alem.school/countries/risky/`, {
      // credentials: "include",
      headers: {
        // "accept-language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7,fr;q=0.6",
        Authorization: `${localStorage.getItem("jwt")}`
      },
      method: "GET"
    })
      .then(res => res.json())
      .then(
        result => {
          console.log(result.data);
          this.setState({
            isLoaded: true,
            items: result.data
          });
        },
        // Примечание: важно обрабатывать ошибки именно здесь, а не в блоке catch(),
        // чтобы не перехватывать исключения из ошибок в самих компонентах.
        error => {
          this.setState({
            isLoaded: true,
            error
          });
        }
      );
  }

  render() {
    const { error, isLoaded, items } = this.state;
    if (error) {
      return <div>Ошибка: {error.message}</div>;
    } else if (!isLoaded) {
      return <div>Загрузка...</div>;
    } else {
      return (
        <React.Fragment>
          <div className="col-lg-12 stretch-card">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title">Потенциально зараженные</h4>
                <p className="card-description"></p>
                <div className="table-responsive">
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th> ФИО </th>
                        <th> Дата въезда </th>
                        <th> Откуда => Куда </th>
                        <th> Рейс </th>
                        <th> Причина </th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map(item => {
                        return (
                          // onClick={e => modeToPerson(e, item.)}
                          <PotentialView item={item} />
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          <TransactionsContainer />
        </React.Fragment>
      );
    }
  }
}
