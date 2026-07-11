export default function MembershipCard({ membership }) {
  const sections = [
    {
      title: "pH",
      color: "blue",
      data: membership.ph,
    },
    {
      title: "Suhu",
      color: "orange",
      data: membership.suhu,
    },
    {
      title: "TDS",
      color: "green",
      data: membership.tds,
    },
    {
      title: "Turbidity",
      color: "purple",
      data: membership.turbidity,
    },
  ];

  const colors = {
    blue: {
      border: "border-blue-300",
      text: "text-blue-700",
      bar: "bg-blue-500",
    },
    orange: {
      border: "border-orange-300",
      text: "text-orange-600",
      bar: "bg-orange-500",
    },
    green: {
      border: "border-green-300",
      text: "text-green-600",
      bar: "bg-green-500",
    },
    purple: {
      border: "border-purple-300",
      text: "text-purple-600",
      bar: "bg-purple-500",
    },
  };

  return (
    <div className="bg-white border border-solid border-[#e5e7eb] rounded-2xl shadow p-6 mb-6">

      <h2 className="text-xl font-bold mb-5">
        Derajat Keanggotaan
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">

        {sections.map((section) => {

          const c = colors[section.color];

          return (
            <div
              key={section.title}
              className={`
                border
                rounded-xl
                ${c.border}
                p-4
              `}
            >

              <h3
                className={`
                  font-bold
                  text-lg
                  mb-4
                  ${c.text}
                `}
              >
                {section.title}
              </h3>

              <div className="space-y-4">

                {Object.entries(section.data).map(([name, value]) => {

                  if (typeof value !== "number") return null;

                  return (
                    <div key={name}>

                      <div className="flex justify-between mb-1">

                        <span className="capitalize text-sm">
                          {name}
                        </span>

                        <span className="font-semibold text-sm">
                          {value.toFixed(4)}
                        </span>

                      </div>

                      <div className="w-full bg-gray-200 rounded-full h-3">

                        <div
                          className={`
                            ${c.bar}
                            h-3
                            rounded-full
                            transition-all
                            duration-700
                          `}
                          style={{
                            width: `${value * 100}%`
                          }}
                        />

                      </div>

                    </div>
                  );

                })}

              </div>

            </div>
          );

        })}

      </div>

    </div>
  );
}