import React from "react";
import axios from "axios";
import { useState } from "react";

const useApiHook = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState("");

  const apiCall = async (url, method = "POST", body = null, headers = {}) => {
    setLoading(true);
    setError("");
    setData(null);

    try {
      const response = await axios({
        url,
        method,
        data: body,
        headers,
      });
      setData(response.data);
      return response.data;
    } catch (err) {
      if (err.response && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, data, apiCall };
};

export default useApiHook;
