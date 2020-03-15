import React from "react";
import { useQuery } from "@apollo/react-hooks";
import TransactionsList from "../transactions/transactions";

import gql from "graphql-tag";

const QUERY_TRANSACTIONS = gql`
  query MyQuery {
    transaction(order_by: { id: desc }) {
      datetime
      flight_id
      from
      to
      id
      person {
        firstName
        lastName
      }
    }
  }
`;

const TransactionsContainer = () => {
  const { loading, error, data } = useQuery(QUERY_TRANSACTIONS);

  if (loading) return "Loading...";
  if (error) return `Error! ${error.message}`;
  console.log(data);
  return <TransactionsList data={data} />;
};

export default TransactionsContainer;
