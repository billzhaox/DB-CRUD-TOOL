import React, { useState, useEffect, useRef } from "react";
import {useLocation} from 'react-router-dom';

const API = process.env.REACT_APP_API;

export const OpsLog = () => {

  let [logs, setLogs] = useState([]);

  const token = localStorage.getItem('REACT_TOKEN_AUTH_KEY');

  const getLogs = async () => {
    const res = await fetch(`${API}/logs`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${JSON.parse(token)}`
      }
    });
    const data = await res.json();
    setLogs(data);
  };

  useEffect(() => {
    getLogs();
  }, []);

  return (
    <div className="row">
      <div className="col">
        <table className="table table-striped">
          <thead>
            <tr style={{fontWeight: 'bold'}}>
              <th>User Name</th>
              <th>Timestamp</th>
              <th>Database</th>
              <th>Table Name</th>
              <th>Operation</th>
              <th>Operation Object ID</th>
              <th>Request Body</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((alog) => (
              <tr key={alog.id}>
                <td>{alog.username}</td>
                <td>{alog.timestamp}</td>
                <td>{alog.db_uri}</td>
                <td>{alog.tb_name}</td>
                <td>{alog.operation}</td>
                <td>{alog.ops_obj_id}</td>
                <td>{alog.request_body}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
