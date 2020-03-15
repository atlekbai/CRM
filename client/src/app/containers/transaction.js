import React from "react";
import { useQuery } from "@apollo/react-hooks";
import Transaction from "../transaction/transaction";

import gql from "graphql-tag";

const QUERY_TRANSACTION = gql`
  query MyQuery($id: Int!) {
    transaction(where: { id: { _eq: $id } }) {
      attrs
      contacted
      datetime
      flight_id
      from
      id
      stay
      to
      person {
        lastName
        firstName
        id
        phone
      }
    }
  }
`;

const TransactionContainer = d => {
  const {
    match: {
      params: { id }
    }
  } = d;
  const { loading, error, data } = useQuery(QUERY_TRANSACTION, {
    variables: { id }
  });

  if (loading) return "Loading...";
  if (error) return `Error! ${error.message}`;
  console.log(data);
  console.log("start");
  return <Transaction data={data} />;
};

export default TransactionContainer;
