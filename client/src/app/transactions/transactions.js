import React, { Component } from "react";
import { useHistory } from "react-router-dom";

const GenerateTable = ({ transaction }) => {
  let history = useHistory();

  const handleClick = (e, id) => {
    console.log(id);
    history.push(`/transactions/${id}`);
  };

  return transaction.map(({ datetime, flight_id, from, to, id, person }) => {
    return (
      <tr key={id} onClick={e => handleClick(e, id)}>
        <td>{`${person.lastName} ${person.firstName}`}</td>
        <td>{datetime}</td>
        <td>{`${from} => ${to}`}</td>
        <td className="text-success">{flight_id}</td>
      </tr>
    );
  });
};

export default class TransactionsList extends Component {
  render() {
    const { transaction } = this.props.data;
    console.log(transaction);
    return (
      <div className="col-lg-12 grid-margin stretch-card">
        <div className="card">
          <div className="card-body">
            <h4 className="card-title">Последние транзакции</h4>
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>ФИО</th>
                    <th>Дата въезда</th>
                    <th>Откуда => Куда</th>
                    <th>Рейс</th>
                  </tr>
                </thead>
                <tbody>
                  <GenerateTable transaction={transaction} />
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
