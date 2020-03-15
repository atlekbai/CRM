import React from "react";
import { useQuery } from "@apollo/react-hooks";
// import TransactionsList from "../transactions/transactions";
import Persons from "../persons/persons";

import gql from "graphql-tag";

const QUERY_PERSONS = gql`
  query MyQuery {
    person(order_by: { id: desc }) {
      firstName
      lastName
      birthDate
      country
      phone
      id
    }
  }
`;

const PersonsContainer = () => {
  const { loading, error, data } = useQuery(QUERY_PERSONS);

  if (loading) return "Loading...";
  if (error) return `Error! ${error.message}`;
  console.log(data);
  console.log("start");
  return <Persons data={data} />;
};

export default PersonsContainer;
