import React, { Component, useState } from "react";
import { Form, Button } from "react-bootstrap";
import DatePicker from "react-datepicker";
import { CountryDropdown } from "react-country-region-selector";
// fetch("http://172.31.15.138:7071/detect/", {
//   headers: {
//     "Content-Type": "application/json"
//   },
//   method: "POST"
// })

class FileInput extends React.Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.fileInput = React.createRef();
  }

  handleSubmit(event) {
    event.preventDefault();
    // alert(`Selected file - ${this.fileInput.current.files[0].name}`);
    this.upload(this.fileInput.current.files[0]);
    // this.upload()
  }

  toBase64 = file =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });

  main = async file => {
    // const file = document.querySelector("#myfile").files[0];
    return await this.toBase64(file);
  };

  upload = file => {
    console.log(file);
    this.main(file).then(r => {
      console.log(r);
      fetch("http://172.31.15.138:7071/detect/", {
        // Your POST endpoint
        method: "POST",
        headers: {
          // Content-Type may need to be completely **omitted**
          Authorization: `${localStorage.getItem("jwt")}`,
          // or you may need something
          "Content-Type": "application/json"
        },
        //   mode: "cors",

        // body:
        //   '{"image":"iVBORw0KGgoAAAANSUhEUgAAABwAAAAVCAYAAABVAo5cAAAABHNCSVQICAgIfAhkiAAAABl0RVh0U29mdHdhcmUAZ25vbWUtc2NyZWVuc2hvdO8Dvz4AAAHcSURBVEiJ7ZVPSJNhHMc//nuNbaIbxpvQuyA7OIgXhB2KIMN4QXjpsIudO8ii6CDCIAikUyAIghfFUIIg6mKXgTAQ30MsSiEGIkEj6BXqubybtA33yrTDu9nbtmTz4EH2vT3wfb6f5/f7PQ9PWzAYPOIM1X6WsBbwfAA73Qt//zjR6zrhXhmpZCGsJK+/zGMUhohqc0R6agPMr4+IFR7yZlitT8i+ZWx9pRbo7Z9i7raGDFCysA4l5Es6emAZo1Bx2eTygszh3zxRsLH3BemsiYSEt0cm0AG5vEnmAOzfol6Fl9FVBybMF8Q+GwigyzdCuMN22QWJjxMs7lWXMcvjn07Og9GX3O+zMD5NMJ+pLdgBdquE+wB2iKccGMBBziBZv1GnlgO8oOAHsAXpIvgHnvD0muI49laJpSpHVYjcXSNyvH2Hhfgk74vNAqskea6iXgyVVxtABVg1w5Ig3zjLBdw3yQCKJDPoga30JGM/NGbuTfHv3fvfDBuX8w6LKTazACH00E2nvXSdPvUElVu6S3w7gX5LQ74yzasBixw+AjV2Ge3GEmH3s/j2nGffd5sFQl7MEvtgEQ3dQe2VCWBh/kryLpUABssuCZ9XwedO8EiNlwe0tf7DFrBZ/QF1XJbjfMtYmwAAAABJRU5ErkJggg=="}'
        body: JSON.stringify({ image: r.split("base64,")[1] }) // This is your file object
        // body: {
        //   image:
        // "iVBORw0KGgoAAAANSUhEUgAAABwAAAAVCAYAAABVAo5cAAAABHNCSVQICAgIfAhkiAAAABl0RVh0U29mdHdhcmUAZ25vbWUtc2NyZWVuc2hvdO8Dvz4AAAHcSURBVEiJ7ZVPSJNhHMc//nuNbaIbxpvQuyA7OIgXhB2KIMN4QXjpsIudO8ii6CDCIAikUyAIghfFUIIg6mKXgTAQ30MsSiEGIkEj6BXqubybtA33yrTDu9nbtmTz4EH2vT3wfb6f5/f7PQ9PWzAYPOIM1X6WsBbwfAA73Qt//zjR6zrhXhmpZCGsJK+/zGMUhohqc0R6agPMr4+IFR7yZlitT8i+ZWx9pRbo7Z9i7raGDFCysA4l5Es6emAZo1Bx2eTygszh3zxRsLH3BemsiYSEt0cm0AG5vEnmAOzfol6Fl9FVBybMF8Q+GwigyzdCuMN22QWJjxMs7lWXMcvjn07Og9GX3O+zMD5NMJ+pLdgBdquE+wB2iKccGMBBziBZv1GnlgO8oOAHsAXpIvgHnvD0muI49laJpSpHVYjcXSNyvH2Hhfgk74vNAqskea6iXgyVVxtABVg1w5Ig3zjLBdw3yQCKJDPoga30JGM/NGbuTfHv3fvfDBuX8w6LKTazACH00E2nvXSdPvUElVu6S3w7gX5LQ74yzasBixw+AjV2Ge3GEmH3s/j2nGffd5sFQl7MEvtgEQ3dQe2VCWBh/kryLpUABssuCZ9XwedO8EiNlwe0tf7DFrBZ/QF1XJbjfMtYmwAAAABJRU5ErkJggg=="
        // }
      })
        .then(
          response => {
            console.log(response);
            return response.json();
          } // if the response is a JSON object
        )
        .then(
          success => console.log(success) // Handle the success response object
        )
        .catch(
          error => console.log(error) // Handle the error response object
        );
    });
  };

  //   onSelectFile = () => upload(input.files[0]);

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
  const [startDate, setStartDate] = useState(new Date());
  const [country, setCountry] = useState("");
  const [datetime, setDatetime] = useState(new Date());

  return (
    <div className="row">
      <div className="col-12 grid-margin stretch-card">
        <div className="card">
          <div className="card-body">
            <h4 className="card-title">Default form</h4>
            <p className="card-description"> Basic form layout </p>
            {/* <form className="forms-sample"></form> */}
            <FileInput />
            <form className="forms-sample"></form>
            <Form.Group>
              <label htmlFor="docID">ИИН</label>
              <Form.Control
                type="text"
                id="docID"
                // placeholder={oldLastName || "Фамилия"}
                size="lg"
                // value={lastName}
                // onChange={e => setLastName(e.target.value)}
              />
            </Form.Group>
            <Form.Group>
              <label htmlFor="lastName">Фамилия</label>
              <Form.Control
                type="text"
                id="lastName"
                // placeholder={oldLastName || "Фамилия"}
                size="lg"
                // value={lastName}
                // onChange={e => setLastName(e.target.value)}
              />
            </Form.Group>
            <Form.Group>
              <label htmlFor="firstName">Имя</label>
              <Form.Control
                type="text"
                className="form-control"
                id="firstName"
                // value={firstName}
                // onChange={e => setFirstName(e.target.value)}
                // placeholder={oldFirstName || "Имя"}
              />
            </Form.Group>
            <Form.Group className="row">
              <label className="col-sm-3 col-form-label">Дата рождения</label>
              <div className="col-sm-9">
                <DatePicker
                  className="form-control w-100"
                  selected={
                    // oldBirthDate && oldBirthDate !== ""
                    //   ? new Date(oldBirthDate)
                    startDate
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
                // value={phone}
                // onChange={e => setPhone(e.target.value)}
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
                // value={from}
                // onChange={e => setFrom(e.target.value)}
              />
            </Form.Group>
            <Form.Group>
              <label htmlFor="to">Куда</label>
              <Form.Control
                type="text"
                id="to"
                placeholder="Город"
                size="lg"
                // value={to}
                // onChange={e => setTo(e.target.value)}
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
                // value={visited}
                // onChange={e => setVisited(e.target.value)}
              />
            </Form.Group>
            <Form.Group>
              <label htmlFor="live">Место проживания</label>
              <Form.Control
                type="text"
                className="form-control"
                id="live"
                placeholder="Адрес"
                // value={stay}
                // onChange={e => setStay(e.target.value)}
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
                    // onChange={e => setContacted(false)}
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
                    // onChange={e => setContacted(true)}
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
                // onChange={e => setDatetime(e)}
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
                // value={flightID}
                // onChange={e => setFlightID(e.target.value)}
              />
            </Form.Group>
          </div>
        </div>
      </div>
    </div>
  );
};

export { Tortik };
