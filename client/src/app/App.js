import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import "./App.scss";
import AppRoutes from "./AppRoutes";
import Navbar from "./shared/Navbar";
import Sidebar from "./shared/Sidebar";
import Footer from "./shared/Footer";

import ApolloClient from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { HttpLink } from "apollo-link-http";
import { ApolloProvider } from "@apollo/react-hooks";

const hasuraUri = "http://crm.alem.school/v1/graphql";

class App extends Component {
  state = {};
  componentDidMount() {
    this.onRouteChanged();
  }

  createApolloClient = authToken => {
    return new ApolloClient({
      link: new HttpLink({
        uri: hasuraUri,
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }),
      cache: new InMemoryCache()
    });
  };

  render() {
    let navbarComponent = !this.state.isFullPageLayout ? <Navbar /> : "";
    let sidebarComponent = !this.state.isFullPageLayout ? <Sidebar /> : "";
    let footerComponent = !this.state.isFullPageLayout ? <Footer /> : "";
    const jwt_token =
      "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJodHRwczovL2hhc3VyYS5pby9qd3QvY2xhaW1zIjp7IngtaGFzdXJhLWRlZmF1bHQtcm9sZSI6ImFkbWluIiwieC1oYXN1cmEtYWxsb3dlZC1yb2xlcyI6WyJhZG1pbiIsImd1ZXN0Il0sIngtaGFzdXJhLXVzZXItaWQiOiIxIn0sImV4cCI6MjA3MTY0OTgyMywiaWF0IjoxNTcxNTYzNDIzLCJpc3MiOiJhbGVtIn0.89f0wUY7zjRpzOtFciov2i7qYeJeT1_riqv5lamnY5k";
    localStorage.setItem("jwt", jwt_token);
    const client = this.createApolloClient(jwt_token);

    return (
      <div className="container-scroller">
        {navbarComponent}
        <div className="container-fluid page-body-wrapper">
          {sidebarComponent}
          <div className="main-panel">
            <div className="content-wrapper">
              <ApolloProvider client={client}>
                <AppRoutes />
              </ApolloProvider>
            </div>
            {footerComponent}
          </div>
        </div>
      </div>
    );
  }

  componentDidUpdate(prevProps) {
    if (this.props.location !== prevProps.location) {
      this.onRouteChanged();
    }
  }

  onRouteChanged() {
    console.log("ROUTE CHANGED");
    window.scrollTo(0, 0);
    const fullPageLayoutRoutes = [
      "/user-pages/login-1",
      "/user-pages/login-2",
      "/user-pages/register-1",
      "/user-pages/register-2",
      "/user-pages/lockscreen",
      "/error-pages/error-404",
      "/error-pages/error-500",
      "/general-pages/landing-page"
    ];
    for (let i = 0; i < fullPageLayoutRoutes.length; i++) {
      if (this.props.location.pathname === fullPageLayoutRoutes[i]) {
        this.setState({
          isFullPageLayout: true
        });
        document
          .querySelector(".page-body-wrapper")
          .classList.add("full-page-wrapper");
        break;
      } else {
        this.setState({
          isFullPageLayout: false
        });
        document
          .querySelector(".page-body-wrapper")
          .classList.remove("full-page-wrapper");
      }
    }
  }
}

export default withRouter(App);
