import db from "../../../lib/db";
import { getUser } from "../../../lib/auth";

export async function POST(req){

  try{

    const user = await getUser();

    // 🔥 CEK LOGIN
    if(!user){
      return Response.json(
        { error:"Unauthorized" },
        { status:401 }
      );
    }

    const { kode_perangkat, name, location, user_id } = await req.json();

    // 🔥 VALIDASI
    if(!kode_perangkat || !name || !location){
      return Response.json(
        { error:"Semua field wajib diisi" },
        { status:400 }
      );
    }

    // 🔥 CEK DUPLIKAT
    const [existing] = await db.execute(
      "SELECT * FROM devices WHERE kode_perangkat=?",
      [kode_perangkat]
    );

    if(existing.length > 0){
      return Response.json(
        { error:"Device ID sudah digunakan!" },
        { status:400 }
      );
    }

    // 🔥 LOGIC ROLE
    let owner_id;

    if(user.role === "admin"){
      // admin bisa assign user
      owner_id = user_id || user.id;
    } else {
      // petani hanya bisa punya sendiri
      owner_id = user.id;
    }

    // 🔥 INSERT
    await db.execute(
      `INSERT INTO devices (kode_perangkat, name, location, user_id, status)
       VALUES (?, ?, ?, ?, 'offline')`,
      [kode_perangkat, name, location, owner_id]
    );

    return Response.json({ message:"Device berhasil ditambahkan" });

  }catch(err){

    console.log(err);

    return Response.json(
      { error:"Server error" },
      { status:500 }
    );

  }

}
