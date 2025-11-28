import { NextRequest, NextResponse } from "next/server";

/**
 * Dynamic placeholder image generator
 * Usage: /api/placeholder/64x64?text=A
 * Returns: SVG placeholder with specified dimensions and text
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ params: string[] }> | { params: string[] } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const { params: pathParams } = resolvedParams;
    const searchParams = request.nextUrl.searchParams;
    
    // Get size from path (e.g., "64x64")
    const sizeParam = pathParams[0] || "400x300";
    const [width, height] = sizeParam.split('x').map(Number);
    
    // Validate dimensions
    if (!width || !height || width > 2000 || height > 2000) {
      return new NextResponse("Invalid dimensions", { status: 400 });
    }
    
    // Get text from query params or use default
    const text = searchParams.get('text') || '?';
    const bgColor = searchParams.get('bg') || '#e5e7eb';
    const textColor = searchParams.get('color') || '#9ca3af';
    const fontSize = searchParams.get('fontSize') || Math.min(width, height) / 3;
    
    // Generate SVG placeholder
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${bgColor}"/>
        <text 
          x="50%" 
          y="50%" 
          font-family="Arial, sans-serif" 
          font-size="${fontSize}" 
          fill="${textColor}" 
          text-anchor="middle" 
          dominant-baseline="middle"
          font-weight="bold"
        >
          ${text}
        </text>
      </svg>
    `;
    
    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Placeholder API error:', error);
    return new NextResponse("Error generating placeholder", { status: 500 });
  }
}

