import dbConnect from '@/lib/dbConnect';
import Position, { IPosition } from '@/model/Position';
import { NextRequest, NextResponse } from 'next/server';

export default async function handler(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get('id'); // Get id from query string
  const { method } = req;

  try {
    await dbConnect();

    switch (method) {
      case 'GET':
        const position = await Position.findById(id);
        if (!position) {
          return NextResponse.json({ error: 'Position not found' }, { status: 404 });
        }
        return NextResponse.json(position, { status: 200 });

      default:
        return NextResponse.json({ error: `Method ${method} Not Allowed` }, { status: 405 });
    }
  } catch (error: any) {
    console.error('Error fetching position:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
