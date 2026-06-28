export default function Table({
  headers = [],
  children,
}) {
  return (
    <div className="hidden md:block overflow-auto rounded-lg">
      <table className="w-full text-sm">
        <thead className="bg-gray-100">
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                className={`p-3 ${
                  header.align === "center"
                    ? "text-center"
                    : "text-left"
                }`}
              >
                {header.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>{children}</tbody>
      </table>
    </div>
  );
}