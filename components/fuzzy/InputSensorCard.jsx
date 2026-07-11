import {
  Droplets,
  Thermometer,
  Waves,
  CircleDot
} from "lucide-react";

export default function InputSensorCard({ input }) {
  const sensors = [
    {
      title: "pH",
      value: input.ph,
      unit: "",
      color: "blue",
      icon: <Droplets size={28} />
    },
    {
      title: "Suhu",
      value: input.suhu,
      unit: "°C",
      color: "orange",
      icon: <Thermometer size={28} />
    },
    {
      title: "TDS",
      value: input.tds,
      unit: "ppm",
      color: "green",
      icon: <Waves size={28} />
    },
    {
      title: "NTU",
      value: input.turbidityNtu,
      unit: "",
      color: "purple",
      icon: <CircleDot size={28} />
    }
  ];

  const colors = {
    blue: {
      border: "border-blue-300",
      bg: "bg-blue-50",
      icon: "text-blue-600",
      title: "text-blue-700"
    },
    orange: {
      border: "border-orange-300",
      bg: "bg-orange-50",
      icon: "text-orange-600",
      title: "text-orange-700"
    },
    green: {
      border: "border-green-300",
      bg: "bg-green-50",
      icon: "text-green-600",
      title: "text-green-700"
    },
    purple: {
      border: "border-purple-300",
      bg: "bg-purple-50",
      icon: "text-purple-600",
      title: "text-purple-700"
    }
  };

  return (
    <div className="bg-white border border-solid border-[#e5e7eb] rounded-2xl shadow p-6 mb-6">

      <h2 className="font-bold text-lg mb-5">
        Input Sensor
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">

        {sensors.map((sensor) => {

          const c = colors[sensor.color];

          return (
            <div
              key={sensor.title}
              className={`
                border
                ${c.border}
                rounded-xl
                p-4
                flex
                items-center
                gap-4
                hover:shadow-md
                transition
              `}
            >

              <div
                className={`
                  w-14
                  h-14
                  rounded-full
                  ${c.bg}
                  flex
                  items-center
                  justify-center
                  ${c.icon}
                `}
              >
                {sensor.icon}
              </div>

              <div>

                <p
                  className={`text-sm font-medium ${c.title}`}
                >
                  {sensor.title}
                </p>

                <h3 className="text-3xl font-bold">

                  {sensor.value}

                  <span className="text-lg font-medium ml-1">
                    {sensor.unit}
                  </span>

                </h3>

              </div>

            </div>
          );

        })}

      </div>

    </div>
  );
}