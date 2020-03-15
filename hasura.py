# -*- coding: utf-8 -*-
# @Author: Tlekbai Ali
# @Date:   2019-07-18 16:52:03
# @Last Modified by:   Tlekbai Ali
# @Last Modified time: 2019-09-07 11:36:56
"""Hasura module

This module includes Hasura class to interact with hasura engine.

Examples of usage:
    Create Hasura instance:
        hasura = Hasura("https://<hasura_endpoint>", "<secret_key>")

    Query data from hasura:
        query = "{user(where: {githubLogin: {_eq: \\\"atlekbai\\\"}})\
                      {id, attrs, created_at}}"
        response = hasura.query(query)
        data = response["data"]["user"]

    Commit mutations. Insert variable requires user_id:int and
    updated_at:timestamp:
        insert = "mutation {insert_users(objects: \
                                        {
                                            user_id: %d, \
                                            updated_at: \\\"%s\\\"\
                                        }) {affected_rows}}"
        response = hasura.query(insert % (10, "2019-09-21T15:00:00"))
        affected_rows = response["data"]["affected_rows"]

"""

import json
from urllib.request import Request, urlopen


class Hasura:
    """Class to wrap interactions with hasura
    """
    def __init__(self, address, secret):
        """
        Args:
            address: url address to hasura
            secret: secret key to access hasura

        """
        self.address = address
        self.secret = secret

    def query(self, string):
        """Function accepts queries and mutiations.

        Args:
            string: query string

        Returns:
            json: response object containing all specified in string fields

        """
        request_body = '{"query":"' + string + '"}'
        data = str.encode(request_body)
        req = Request(self.address, data=data)
        req.add_header("X-Hasura-Admin-Secret", self.secret)
        content = urlopen(req)
        response = json.load(content)
        return response
