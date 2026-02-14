
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        const body = await request.json();
        const headersList = request.headers;
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        // Assuming the backend endpoint is /api/mods and we need to pass articleId in the body
        // The body should already contain articleId, name, version, etc.
        const apiUrl = process.env.API_URL || "https://api.chanomhub.com";

        const response = await fetch(`${apiUrl}/api/mods`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorData = await response.json();
            return NextResponse.json(
                { message: errorData.message || "Failed to create mod in backend" },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data, { status: 201 });

    } catch (error) {
        console.error("Error creating mod:", error);
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    }
}
