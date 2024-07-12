import path from 'path';
import fs from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect'; // Import the dbConnect function
import ApplicantALT from '@/model/ApplicantALT';

// Function to ensure upload directory exists
const ensureUploadDir = async () => {
  const uploadDir = path.resolve('./public/uploads');
  try {
    await fs.mkdir(uploadDir, { recursive: true });
  } catch (err:any) {
    if (err.code !== 'EEXIST') throw err;
  }
};

ensureUploadDir();

export async function POST(req: NextRequest, res: NextResponse) {
  ensureUploadDir();

  try {
    await dbConnect();

    const { firstName, lastName, phoneNo, email, noticePeriod, position, location, file } = await req.json();

    if (!firstName || !lastName || !phoneNo || !email || !noticePeriod || !position || !location || !file) {
      return NextResponse.json({ error: 'Name and description are required' }, { status: 400 });
    }

    const uploadDir = path.resolve('./public/uploads');
    const fileName = `${Date.now()}-${firstName}-${lastName}.pdf`;
    const filePath = path.join(uploadDir, fileName);

    await fs.writeFile(filePath, Buffer.from(file, 'base64'));

    const newApplicant: any = new ApplicantALT({
      firstName,
      lastName,
      phoneNo,
      email,
      noticePeriod,
      position, // Ensure position is converted to ObjectId if necessary
      location,
      url: `/uploads/${fileName}`,
    });

    await newApplicant.save();

    return NextResponse.json(newApplicant, { status: 201 });
  } catch (error) {
    console.error('Error submitting newApplicant:', error);
    return NextResponse.json({ error: 'Error creating newApplicant' }, { status: 500 });
  }
}
