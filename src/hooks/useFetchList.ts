import { useEffect, useState } from "react";
import { sanityClient } from "sanity:client";

type SanityChild = {
  _id: string;
  name: string;
  age: number;
  deeds: { description: string }[];
  status: "nice" | "naughty" | null;
};

export default function useFetchList() {
  const [isLoading, setIsLoading] = useState(true);
  const [listOfChildren, setListOfChildren] = useState<SanityChild[]>([]);

  useEffect(() => {
    async function fetchListOfChildren() {
      setIsLoading(true);
      try {
        const data = await sanityClient.fetch<SanityChild[]>(
          `*[_type == "child"] {
            _id,          
            name,
            age,
            deeds,        
          }`
        );
        setListOfChildren(data.map((child) => ({ ...child, status: null })));
      } catch (error) {
        console.error("Error fetching children:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchListOfChildren();
  }, []);

  return { isLoading, listOfChildren, setListOfChildren };
}
