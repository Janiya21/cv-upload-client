import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';
import dbConnect from '@/lib/dbConnect';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  }

  await dbConnect();

  try {
    const db = mongoose.connection;

    const vacancyPipeline = [
      { $match: { _id: new ObjectId(id) } },
      {
        $lookup: {
          from: 'positions',       // The collection name you want to populate from
          localField: 'position',  // The local field in the 'vacancies' collection
          foreignField: '_id',     // The foreign field in the 'positions' collection
          as: 'positionDetails'    // The alias for the populated data
        }
      },
      { $unwind: '$positionDetails' }  // Optional: If you expect only one position per vacancy
    ];

    const vacancy = await db.collection('vacancies').aggregate(vacancyPipeline).toArray();

    if (vacancy.length === 0) {
      return NextResponse.json({ error: 'Vacancy not found' }, { status: 404 });
    }

    return NextResponse.json(vacancy[0], { status: 200 });
  } catch (error) {
    console.error('Error fetching vacancy:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
