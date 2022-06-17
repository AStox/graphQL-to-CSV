import React, { useEffect, useState } from "react";
import { ApolloClient, InMemoryCache, ApolloProvider, useQuery, gql, from } from "@apollo/client";
import LoadingSpinner from "spinner";
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
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [results, setResults] = useState("");

  const exportQuery = () => {
    setExporting(true);
    setCopied(false);
    const client = new ApolloClient({
      uri: queryUrl,
      cache: new InMemoryCache({
        addTypename: false,
      }),
    });
    client
      .query({
        query: gql(queryString),
      })
      .then((result) => {
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
    navigator.clipboard.writeText(output);
    setResults(output);
    setExporting(false);
    console.log(output);
  };

  const copy2clip = () => {
    navigator.clipboard.writeText(results);
    setCopied(true);
  };

  return (
    <div style={{ display: "flex", flexDirection: "row", maxHeight: "100vh" }}>
      <div
        style={{
          flex: "0 0 auto",
          display: "flex",
          flexDirection: "column",
          minWidth: "50%",
          maxHeight: "100%",
        }}
      >
        <h3>Query URL</h3>
        <input
          className="flex"
          style={{ maxHeight: "1rem", margin: "0 4rem" }}
          value={queryUrl}
          onChange={(e) => setQueryUrl(e.target.value)}
        />
        <h3>Query</h3>
        <textarea
          className="flex"
          value={queryString}
          rows={30}
          cols={60}
          onChange={(e) => setQueryString(e.target.value)}
        />
        <div className="flex" style={{ marginTop: "20px" }}>
          <button onClick={exportQuery}>
            {!!!exporting && "Export"}
            {!!exporting && <LoadingSpinner />}
          </button>
        </div>
      </div>
      <div style={{ flex: "1 1 auto", display: "flex", flexDirection: "column" }}>
        <h3>Query Results</h3>
        {!!results && (
          <button className="flex" style={{ marginBottom: "20px" }} onClick={copy2clip}>
            {!!!copied && "Copy to clipboard"}
            {!!copied && "Copied!"}
          </button>
        )}
        <div>{results}</div>
      </div>
    </div>
  );
};

export default Main;
