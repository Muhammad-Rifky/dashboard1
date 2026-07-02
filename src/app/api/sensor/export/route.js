import db from "../../../lib/db";
import ExcelJS from "exceljs";

export async function GET(req){

  const { searchParams } = new URL(req.url);

  const kode_perangkat = searchParams.get("kode_perangkat");
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  let query = `
    SELECT
      kode_perangkat,
      ph,
      suhu,
      tds,
      turbidity,
      created_at
    FROM sensor_data
    WHERE 1=1
  `;

  let params = [];

  if(kode_perangkat){
    query += " AND kode_perangkat = ?";
    params.push(kode_perangkat);
  }

  if(start && end){
    query += " AND DATE(created_at) BETWEEN ? AND ?";
    params.push(start, end);
  }

  query += " ORDER BY created_at DESC";

  const [rows] = await db.execute(query, params);

  // 🔥 BUAT EXCEL
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Data Sensor");

  // 🔥 JUDUL
  sheet.mergeCells("A1:G1");
  sheet.getCell("A1").value = "Data Pengukuran Sensor";
  sheet.getCell("A1").font = { bold:true, size:14 };
  sheet.getCell("A1").alignment = { horizontal:"center" };

  // 🔥 HEADER
  const header = ["No","Device","pH","Suhu","TDS","NTU","Waktu"];
  sheet.addRow([]);
  sheet.addRow(header);

  const headerRow = sheet.getRow(3);
  headerRow.font = { bold:true };

  // 🔥 DATA
  rows.forEach((row,index)=>{
    const waktu = new Date(row.created_at).toLocaleString("id-ID");

    sheet.addRow([
      index+1,
      row.kode_perangkat,
      row.ph,
      row.suhu,
      row.tds,
      row.turbidity,
      waktu
    ]);
  });

  // 🔥 AUTO WIDTH
  sheet.columns.forEach(col=>{
    col.width = 18;
  });

  const buffer = await workbook.xlsx.writeBuffer();

  return new Response(buffer,{
    headers:{
      "Content-Type":"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition":"attachment; filename=data-sensor.xlsx"
    }
  });
}