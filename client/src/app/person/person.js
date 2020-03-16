import React, { Component, useState } from "react";
import { Sparklines, SparklinesBars } from "react-sparklines";
import Modal from "react-bootstrap/Modal";
import { Form, Button } from "react-bootstrap";

import gql from "graphql-tag";
import { useMutation } from "@apollo/react-hooks";

// import DatePicker from "react-date-picker";
const ADD_RECORD = gql`
  mutation MyMutation($person_id: Int, $status_id: Int) {
    insert_record(objects: { person_id: $person_id, status_id: $status_id }) {
      affected_rows
    }
  }
`;

const ModalRecord = ({ isOpen, hideModal, id }) => {
  const [recordId, setRecordId] = useState(4);

  const [
    addRecord,
    { loading: mutationLoading, error: mutationError, data: mutationSuccess }
  ] = useMutation(ADD_RECORD);

  return (
    <Modal show={isOpen} onHide={hideModal}>
      <Modal.Header>
        <Modal.Title>Выберите статус</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form
          onSubmit={e => {
            e.preventDefault();
            console.log(e);
            console.log(recordId);
            addRecord({
              variables: {
                person_id: id,
                status_id: recordId
              }
            });
          }}
        >
          <Form.Group>
            <Form.Control
              as="select"
              value={recordId}
              onChange={e => setRecordId(e.target.value)}
            >
              <option value="1">In Search</option>
              <option value="2">Hospitalized</option>
              <option value="3">Dead</option>
              <option value="4">Safe</option>
            </Form.Control>
          </Form.Group>
          <button type="submit" className="btn btn-primary mr-2">
            Submit
          </button>{" "}
        </form>
      </Modal.Body>
      <Modal.Footer>
        {/* <button onClick={this.hideModal}>Cancel</button> */}
        {/* <button onCLick>Save</button> */}
        {mutationLoading && <p>Loading...</p>}
        {mutationError && <p>Error :( Please try again</p>}
        {mutationSuccess && <p>Добавлен</p> && window.location.reload()}
      </Modal.Footer>
    </Modal>
  );
};

class RecordsView extends Component {
  state = {
    error: null,
    isLoaded: false,
    items: []
  };

  componentDidMount() {
    fetch(`http://api.crm.alem.school/person/${this.props.id}/history`, {
      // credentials: "include",
      headers: {
        "accept-language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7,fr;q=0.6",
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
        <div className="col-lg-12 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <h4 className="card-title">Журнал активности</h4>
              <div className="table-responsive">
                <table className="table table-hover">
                  <tbody>
                    {items.map(item => {
                      if (item.type === "record") {
                        return (
                          <tr key={item.id}>
                            <td>
                              <label className="badge badge-danger">
                                {item.type}
                              </label>
                            </td>
                            <td>{item.status.name}</td>
                            <td></td>
                            <td>{item.created_at}</td>
                          </tr>
                        );
                      }
                      return (
                        <tr key={item.id}>
                          <td>
                            <label className="badge badge-info">
                              {item.type}
                            </label>
                          </td>
                          <td>{item.from}</td>
                          <td>{item.to}</td>
                          <td>{item.datetime}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }
}

class PersonView extends Component {
  //   const [records, setRecords] = useState([]);
  state = {
    records: [],
    isOpen: false
  };

  showModal = () => {
    this.setState({ isOpen: true });
  };

  hideModal = () => {
    this.setState({ isOpen: false });
  };

  render() {
    const {
      birthDate = "",
      country = "",
      phone = "",
      id = "",
      firstName = "",
      lastName = "",
      doc_id = ""
    } = this.props.person;

    //   Resource(id).then(d => {
    //     setRecords(d.data);
    //   });

    return (
      <React.Fragment>
        <ModalRecord
          showModal={this.showModal}
          hideModal={this.hideModal}
          id={id}
          isOpen={this.state.isOpen}
        />
        <div className="col-xl-12 col-lg-12 col-sm-12 grid-margin stretch-card">
          <div className="row flex-grow">
            <div className="col-xl-12 col-lg-6 col-sm-6 grid-margin-0 grid-margin-xl stretch-card">
              <div className="card card-revenue">
                <div className="card-body">
                  <div className="d-flex w-100 h-100 justify-content-between align-items-center">
                    <div className="mr-auto">
                      <p className="highlight-text text-white">
                        {" "}
                        {firstName} {lastName}{" "}
                      </p>
                      <p className="text-white"> Гражданство: {country}</p>
                      <div
                        className="badge badge-pill"
                        onClick={this.showModal}
                      >
                        {" "}
                        Добавить запись{" "}
                      </div>
                    </div>
                    <div className="ml-auto mt-2 mt-xl-0">
                      <Sparklines
                        data={[4, 3, 10, 9, 4, 3, 8, 6, 7, 8]}
                        style={{ width: "110px", height: "70px" }}
                      >
                        <SparklinesBars barWidth={4} style={{ fill: "#fff" }} />
                      </Sparklines>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-12 col-lg-6 col-sm-6 stretch-card">
              <div className="card card-revenue-table mt-4 mt-sm-0 mt-xl-4">
                <div className="card-body">
                  <div className="revenue-item d-flex">
                    <div className="revenue-desc">
                      <h6>{birthDate}</h6>
                      <p className="font-weight-light">Дата рождения</p>
                    </div>
                  </div>
                  <div className="revenue-item d-flex">
                    <div className="revenue-desc">
                      <h6>{phone}</h6>
                      <p className="font-weight-light">Номер телефона</p>
                    </div>
                  </div>
                  <div className="revenue-item d-flex">
                    <div className="revenue-desc">
                      <h6>{doc_id}</h6>
                      <p className="font-weight-light">ИИН</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <RecordsView id={id} />
      </React.Fragment>
    );
  }
}

export default class Person extends Component {
  render() {
    console.log(this.props);
    const { person } = this.props.data;
    console.log(person[0]);
    // const {
    //   birthDate = "",
    //   country = "",
    //   phone = "",
    //   id = "",
    //   firstName = "",
    //   lastName = "",
    //   doc_id = ""
    // } = person[0];

    console.log(this.props);
    return <PersonView person={person[0]} />;
  }
}
