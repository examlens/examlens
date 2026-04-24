"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Question = {
  id: string;
  text: string;
  type: string;
  marks: number;
  model_answer: string;
};

export default function TestPage() {
  const [data, setData] = useState<Question[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("questions")
        .select("*");

      if (error) {
        console.error(error);
      } else {
        setData(data as Question[]);
      }
    };

    fetchData();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Questions Table Test</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}