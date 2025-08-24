import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const API_KEY = process.env.NEXT_PUBLIC_NVIDIA_API_KEY;

    if (!API_KEY) {
      return NextResponse.json(
        { error: 'NVIDIA API key is not configured' },
        { status: 500 }
      );
    }

    // The correct NVIDIA API endpoint from build.nvidia.com
    const invokeUrl = "https://health.api.nvidia.com/v1/biology/nvidia/molmim/generate";

    const response = await fetch(invokeUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `NVIDIA API error: ${response.status} - ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
