import React from "react";
import { useQuery } from "@apollo/react-hooks";
import Person from "../person/person";

import gql from "graphql-tag";

const QUERY_PERSON = gql`
  query MyQuery($id: Int!) {
    person(where: { id: { _eq: $id } }) {
      firstName
      lastName
      doc_id
      birthDate
      country
      phone
      id
    }
  }
`;

const PersonContainer = d => {
  const {
    match: {
      params: { id }
    }
  } = d;
  const { loading, error, data } = useQuery(QUERY_PERSON, {
    variables: { id }
  });

  if (loading) return "Loading...";
  if (error) return `Error! ${error.message}`;
  console.log(data);
  console.log("start");
  return <Person data={data} />;
};

export default PersonContainer;
