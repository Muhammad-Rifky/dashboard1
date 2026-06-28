import { useMemo } from "react";

export function useFilter({
  data = [],
  search = "",
  fields = [],
}) {
  const filteredData = useMemo(() => {
    const keyword = search.toLowerCase();

    return data.filter((item) =>
      fields.some((field) =>
        String(item[field] ?? "")
          .toLowerCase()
          .includes(keyword)
      )
    );
  }, [data, search, fields]);

  return filteredData;
}