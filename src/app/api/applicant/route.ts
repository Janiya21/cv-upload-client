import dbConnect from "@/lib/dbConnect";
import Applicant from "@/model/Applicant";
import Vacancy from "@/model/Vacancy";
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


export async function GET(req: NextRequest) {
  await dbConnect();
  try {
    const applications = await Applicant.find({}).populate("vacancy");
    return NextResponse.json(applications, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching applications', error);
    return NextResponse.json({ error: 'Error fetching applications' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  await dbConnect();
  try {
    const formData = await req.formData();
    const vacancyId = formData.get("vacancy") as string | null;
    const firstName = formData.get("firstName") as string | null;
    const lastName = formData.get("lastName") as string | null;
    const phoneNo = formData.get("phoneNo") as string | null;
    const email = formData.get("email") as string | null;
    const noticePeriod = formData.get("noticePeriod") as string | null;
    const location = formData.get("location") as string | null;
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

     // Upload to Google Cloud Storage directly from buffer
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

      if (vacancyId && !mongoose.Types.ObjectId.isValid(vacancyId)) {
        return NextResponse.json({ error: 'Invalid vacancy ID' }, { status: 400 });
      }
  
      const newApplicant = new Applicant({
        firstName: firstName || '',
        lastName: lastName || '',
        phoneNo: phoneNo || '',
        email: email || '',
        notice: noticePeriod || '',
        location: location || '',
        url: publicUrl,
        vacancy: vacancyId ? new mongoose.Types.ObjectId(vacancyId) : null,
      });
  
      await newApplicant.save();
      const applicantId = newApplicant._id;
      
      const vacancy = await Vacancy.findByIdAndUpdate(vacancyId, {
        $push: { applicants: applicantId },
      }, { new: true });
  
      if (!vacancy) {
        throw new Error('Vacancy not found');
      }

     }catch (uploadError) {
      console.error('Error during file upload', uploadError);
      return NextResponse.json({ error: 'Error during file upload' }, { status: 500 });
    }
    return NextResponse.json({ message: 'Application submitted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error submitting application', error);
    return NextResponse.json({ error: 'Error submitting application' }, { status: 500 });
  }
}