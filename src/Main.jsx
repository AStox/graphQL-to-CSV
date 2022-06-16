import React, { useEffect, useState } from "react";
import { ApolloClient, InMemoryCache, ApolloProvider, useQuery, gql, from } from "@apollo/client";
// import { parse } from "json2csv";

const Main = () => {
  const [queryUrl, setQueryUrl] = useState("https://api.thegraph.com/subgraphs/name/astox/main");
  const [queryString, setQueryString] = useState(`
  {
    rewardDayTotals(first: 1000) {
      id
      aoRewardRate
      tinRewardRate
      dropRewardRate
    }
  }
  `);
  const [fields, setFields] = useState(["id", "aoRewardRate", "tinRewardRate", "dropRewardRate"]);

  let client;
  useEffect(() => {}, [setQueryUrl]);

  useEffect(() => {
    client = new ApolloClient({
      uri: queryUrl,
      cache: new InMemoryCache({
        addTypename: false,
      }),
    });
  }, []);

  const exportQuery = () => {
    console.log(queryString);
    client
      .query({
        query: gql(queryString),
      })
      .then((result) => {
        // console.log(JSON.stringify(result.data.rewardDayTotals));
        // console.log(parse(JSON.stringify(result.data.rewardDayTotals), opts));
        json2csv(result.data);
      });
  };

  const json2csv = (obj) => {
    const keys = Object.keys(obj);
    if (keys.length > 1) {
      throw Error("Too many top level properties. Just query one thing at a time");
    } else if (keys.length === 0) {
      throw Error("No top level properties. Did you query anything?");
    }
    const items = obj[keys[0]];
    const headers = Object.keys(items[0]);
    let output = "";
    for (let i = 0; i < headers.length; i++) {
      output += headers[i] + ",";
    }
    output += "\n";
    for (let i = 0; i < items.length; i++) {
      for (let j = 0; j < headers.length; j++) {
        output += items[i][headers[j]] + ",";
      }
      output += "\n";
    }
    console.log(output);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <h3>Query URL</h3>
      <input className="flex" value={queryUrl} onChange={(e) => setQueryUrl(e.target.value)} />
      <h3>Query</h3>
      <textarea
        className="flex"
        value={queryString}
        rows={30}
        cols={30}
        onChange={(e) => setQueryString(e.target.value)}
      />
      <div className="flex" style={{ marginTop: "20px" }}>
        <button onClick={exportQuery}>Export</button>
      </div>
    </div>
  );
};

export default Main;
