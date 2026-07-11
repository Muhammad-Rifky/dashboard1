export default function RulesCard({ rules }) {

  const badgeColor = (output) => {
    switch (output.toLowerCase()) {
      case "baik":
        return "bg-green-100 text-green-700 border border-green-300";

      case "sedang":
        return "bg-orange-100 text-orange-700 border border-orange-300";

      case "buruk":
        return "bg-red-100 text-red-700 border border-red-300";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="bg-white border-gray-200 rounded-2xl shadow p-6">

      <h2 className="text-lg font-bold mb-4">
        Rule yang Aktif
      </h2>

      <div className="overflow-x-auto">

        <table className="w-full text-sm">

          <thead>

            <tr className="bg-gray-100 border-b">

              <th className="py-3 px-3 text-center">
                No
              </th>

              <th className="py-3 px-3 text-left">
                Nama Rule
              </th>

              <th className="py-3 px-3 text-center">
                α-Predicate
              </th>

              <th className="py-3 px-3 text-center">
                Output
              </th>

            </tr>

          </thead>

          <tbody>

            {rules.map((rule, index) => (

              <tr
                key={index}
                className="
                  border-b
                  hover:bg-blue-50
                  transition
                "
              >

                <td className="py-3 text-center">

                  {rule.no}

                </td>

                <td className="py-3">

                  {rule.name}

                </td>

                <td className="py-3 text-center font-semibold">

                  {Number(rule.alpha).toFixed(4)}

                </td>

                <td className="py-3 text-center">

                  <span
                    className={`
                      px-3
                      py-1
                      rounded-full
                      text-xs
                      font-semibold
                      ${badgeColor(rule.output)}
                    `}
                  >
                    {rule.output}
                  </span>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}