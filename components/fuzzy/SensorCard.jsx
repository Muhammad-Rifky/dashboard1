import {
    Droplets,
    Thermometer,
    Waves,
    CircleDot
} from "lucide-react";

export default function SensorCard({ input }) {

    const cards = [

        {
            title: "pH",
            value: input.ph,
            unit: "",
            icon: Droplets,
            color: "text-blue-500",
            border: "border-blue-300"
        },

        {
            title: "Suhu",
            value: input.suhu,
            unit: "°C",
            icon: Thermometer,
            color: "text-orange-500",
            border: "border-orange-300"
        },

        {
            title: "TDS",
            value: input.tds,
            unit: "ppm",
            icon: Waves,
            color: "text-green-500",
            border: "border-green-300"
        },

        {
            title: "NTU",
            value: input.turbidityNtu,
            unit: "",
            icon: CircleDot,
            color: "text-purple-500",
            border: "border-purple-300"
        }

    ];

    return (

        <div className="bg-white border-gray-200 rounded-2xl shadow p-6">

            <h2 className="font-semibold text-gray-700 mb-5">
                Input Sensor
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

                {cards.map((item, index) => {

                    const Icon = item.icon;

                    return (

                        <div
                            key={index}
                            className={`border ${item.border} rounded-xl p-5`}
                        >

                            <div className="flex items-center gap-4">

                                <div className={`p-3 rounded-full bg-gray-100 ${item.color}`}>

                                    <Icon size={28} />

                                </div>

                                <div>

                                    <p className="text-gray-500">
                                        {item.title}
                                    </p>

                                    <h2 className="text-3xl font-bold">

                                        {item.value}

                                        <span className="text-base ml-1">

                                            {item.unit}

                                        </span>

                                    </h2>

                                </div>

                            </div>

                        </div>
                    );
                })}
            </div>
        </div>
    );
}