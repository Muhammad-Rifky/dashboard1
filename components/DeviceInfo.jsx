export default function DeviceInfo({ device }) {
  return (
    <div>
      <p>ID: {device.kode_perangkat}</p>
      <p>Nama: {device.name}</p>
      <p>Lokasi: {device.location}</p>
    </div>
  );
}