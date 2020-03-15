import React, { Component, Suspense, lazy } from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import TransactionsContainer from "./containers/transactions";
import PersonsConatiner from "./containers/persons";
import PersonConatiner from "./containers/person";
import TransactionContainer from "./containers/transaction";
import { Tortik } from "./tortik/tortik";
import Spinner from "../app/shared/Spinner";

const AddPerson = lazy(() => import("./add-person/add-person"));
const Main = lazy(() => import("./main/main"));

class AppRoutes extends Component {
  render() {
    return (
      <Suspense fallback={<Spinner />}>
        <Switch>
          <Route exact path="/tortik">
            <Tortik />
          </Route>
          <Route exact path="/dashboard" component={Main} />
          <Route exact path="/add-person" component={AddPerson} />
          <Route exact path="/transactions">
            <TransactionsContainer />
          </Route>
          <Route
            exact
            path="/transactions/:id"
            component={TransactionContainer}
          ></Route>

          <Route exact path="/persons">
            <PersonsConatiner />
          </Route>

          <Route exact path="/persons/:id" component={PersonConatiner}></Route>

          <Redirect to="/dashboard" />
        </Switch>
      </Suspense>
    );
  }
}

export default AppRoutes;
