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

class TransactionView extends Component {
  state = {
    isOpen: false
  };

  showModal = () => {
    this.setState({ isOpen: true });
  };

  hideModal = () => {
    this.setState({ isOpen: false });
  };

  createRecord = (e, id) => {
    console.log(id);
  };

  render() {
    const {
      attrs = "",
      contacted = false,
      stay = "",
      from = "",
      to = "",
      datetime = "",
      flight_id = "",
      person: { lastName = "", firstName = "", id: user_id, phone = "" }
    } = this.props.transaction;

    let data = Object.keys(attrs).map(k => <h6 key={k}>{k}</h6>);
    if (!(attrs instanceof Object))
      data = Object.keys(JSON.parse(attrs)).map(k => <h6 key={k}>{k}</h6>);
    //   Resource(id).then(d => {
    //     setRecords(d.data);
    //   });

    const { isOpen } = this.state;

    return (
      <React.Fragment>
        <ModalRecord
          showModal={this.showModal}
          hideModal={this.hideModal}
          id={user_id}
          isOpen={isOpen}
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
                        {from} -> {to}{" "}
                      </p>
                      
                      {/* <p className="text-white"> Гражданство: {country}</p> */}
                      <div
                        className="badge badge-pill"
                        onClick={this.showModal}
                      >
                        {" "}
                        Добавить запись{" "}
                      </div>
                    </div>
                    <div className="ml-auto mt-2 mt-xl-0">
                        <p className="highlight-text text-white">
                          {" "}
                          {datetime}{" "}
                        </p>
                        <p className="highlight-text text-white">
                          {" "}
                          {flight_id}{" "}
                        </p>
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
                      <h6>
                        {firstName} {lastName}
                      </h6>
                      <p className="font-weight-light">ФИО</p>
                    </div>
                  </div>
                  <div className="revenue-item d-flex">
                    <div className="revenue-desc">
                      <div>{data}</div>
                      <p className="font-weight-light">Посещенные страны</p>
                    </div>
                  </div>
                  <div className="revenue-item d-flex">
                    <div className="revenue-desc">
                      <h6>{stay}</h6>
                      <p className="font-weight-light">Место проживания</p>
                    </div>
                  </div>
                  <div className="revenue-item d-flex">
                    <div className="revenue-desc">
                      <h6>{contacted === true ? "Да" : "Нет"}</h6>
                      <p className="font-weight-light">
                        Контактировал с больными
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default class Transaction extends Component {
  render() {
    console.log(this.props);
    const { transaction } = this.props.data;
    // console.log(person[0]);
    // const {
    //   birthDate = "",
    //   country = "",
    //   phone = "",
    //   id = "",
    //   firstName = "",
    //   lastName = "",
    //   doc_id = ""
    // } = person[0];

    // console.log(this.props);
    return <TransactionView transaction={transaction[0]} />;
    // return <h1>w</h1>;
  }
}
