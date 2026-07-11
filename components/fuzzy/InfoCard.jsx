export default function InfoCard({ data }) {

    function formatDate(date) {
        return new Date(date).toLocaleString("id-ID", {
            timeZone: "Asia/Jakarta",
            dateStyle: "full",
            timeStyle: "medium"
        });
    }

    return (
        <div className="bg-white border border-solid border-[#e5e7eb] rounded-2xl shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-5">
                Informasi Pengambilan Data
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4">

                <div>

                    <p>
                        <span className="font-semibold">
                            ID
                        </span>
                        {" : "}
                        {data.id}
                    </p>

                    <p className="mt-2">
                        <span className="font-semibold">
                            Lokasi
                        </span>
                        {" : "}
                        {data.location}
                    </p>

                </div>

                <div>

                    <p>
                        <span className="font-semibold">
                            Nama
                        </span>
                        {" : "}
                        {data.name}
                    </p>

                    <p className="mt-2">
                        <span className="font-semibold">
                            Waktu Pengukuran
                        </span>
                        {" : "}
                        {formatDate(data.created_at)}
                    </p>

                </div>

            </div>

        </div>

    );

}