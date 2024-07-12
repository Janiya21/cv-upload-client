import dbConnect from "@/lib/dbConnect";
import ApplicantALT from "@/model/ApplicantALT";
import Position from "@/model/Position"; // Ensure this is the correct path to your Position model
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs/promises';

const ensureUploadDir = async () => {
  const uploadDir = path.resolve('./public/uploads');
  try {
    await fs.mkdir(uploadDir, { recursive: true });
  } catch (err:any) {
    if (err.code !== 'EEXIST') throw err;
  }
};

export async function POST(req: NextRequest) {
  // ensureUploadDir();
  await dbConnect();
  try {
    const formData = await req.formData();
    const firstName = formData.get("firstName") as string | null;
    const lastName = formData.get("lastName") as string | null;
    const phoneNo = formData.get("phoneNo") as string | null;
    const email = formData.get("email") as string | null;
    const noticePeriod = formData.get("noticePeriod") as string | null;
    const location = formData.get("location") as string | null;
    const positionId = formData.get("position") as string | null; // Position ID as a string
    const file = formData.get("file") as Blob | null;

    // const uploadDir = path.resolve('./public/uploads');
    // const fileName = `${Date.now()}-${firstName}-${lastName}.pdf`;
    // const filePath = path.join(uploadDir, fileName);
    // await fs.writeFile(filePath, Buffer.from(file, 'base64'));

    let fileBuffer = null;
    if (file) {
      const arrayBuffer = await file.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuffer);
    }

    if (positionId && !mongoose.Types.ObjectId.isValid(positionId)) {
      return NextResponse.json({ error: 'Invalid position ID' }, { status: 400 });
    }

    const newApplicant = new ApplicantALT({
      firstName: firstName || '',
      lastName: lastName || '',
      phoneNo: phoneNo || '',
      email: email || '',
      noticePeriod: noticePeriod || '',
      location: location || '',
      position: positionId ? new mongoose.Types.ObjectId(positionId) : null, // Ensure this is set as an ObjectId
      file: fileBuffer,
    });

    await newApplicant.save();

    return NextResponse.json({ message: 'Application submitted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error submitting application', error);
    return NextResponse.json({ error: 'Error submitting application' }, { status: 500 });
  }
}
