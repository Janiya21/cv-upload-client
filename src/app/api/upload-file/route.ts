import dbConnect from "@/lib/dbConnect";
import ApplicantALT from "@/model/ApplicantALT";
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import AWS from 'aws-sdk';

// Initialize AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const bucketName = process.env.AWS_BUCKET_NAME;
if (!bucketName) {
  throw new Error('AWS_BUCKET_NAME environment variable is not set');
}

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const formData = await req.formData();
    const firstName = formData.get("firstName") as string | null;
    const lastName = formData.get("lastName") as string | null;
    const phoneNo = formData.get("phoneNo") as string | null;
    const email = formData.get("email") as string | null;
    const noticePeriod = formData.get("noticePeriod") as string | null;
    const location = formData.get("location") as string | null;
    const positionId = formData.get("position") as string | null;
    const file = formData.get("file") as Blob | null;

    console.log('Form data parsed successfully');

    if (!file) {
      console.error('File is required');
      return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }

    const currentDate = new Date().toISOString().slice(0, 10);
    const fileName = `${firstName}-${lastName}.pdf`;
    const destination = `cv-uploads/${currentDate}/${fileName}`;

    console.log(`Attempting to upload file to destination: ${destination}`);

    const fileBuffer = Buffer.from(await file.arrayBuffer());

    console.log('File buffer created successfully');

    if (!bucketName) {
      throw new Error('AWS_BUCKET_NAME environment variable is not set');
    }

    const params = {
      Bucket: bucketName, 
      Key: destination,
      Body: fileBuffer,
      ContentType: file.type,
    };

    try {
      await s3.upload(params).promise();

      console.log('File uploaded to AWS S3 successfully');

      const publicUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${destination}`;

      if (positionId && !mongoose.Types.ObjectId.isValid(positionId)) {
        console.error('Invalid position ID');
        return NextResponse.json({ error: 'Invalid position ID' }, { status: 400 });
      }

      const newApplicant = new ApplicantALT({
        firstName: firstName || '',
        lastName: lastName || '',
        phoneNo: phoneNo || '',
        email: email || '',
        noticePeriod: noticePeriod || '',
        location: location || '',
        position: positionId ? new mongoose.Types.ObjectId(positionId) : null,
        url: publicUrl, 
      });

      await newApplicant.save();

      console.log('Applicant data saved successfully');

      return NextResponse.json({ message: 'Application submitted successfully' }, { status: 200 });
    } catch (uploadError) {
      console.error('Error during file upload', uploadError);
      return NextResponse.json({ error: 'Error during file upload' }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Error submitting application', error);
    return NextResponse.json({ error: 'Error submitting application' }, { status: 500 });
  }
}
