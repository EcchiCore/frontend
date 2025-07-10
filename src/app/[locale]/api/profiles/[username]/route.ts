import { NextRequest, NextResponse } from 'next/server'

const NEST_API_URL = 'http://localhost:1587'

export interface Profile {
    username: string
    bio: string | null
    image: string | null
    following: boolean
}

export interface ProfileResponse {
    profile: Profile
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
    try {
        // Await the params promise to get username
        const { username } = await params

        // Fetch profile data from NestJS backend
        const response = await fetch(`${NEST_API_URL}/api/profiles/${username}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })

        if (!response.ok) {
            // Handle different error status codes
            if (response.status === 404) {
                return NextResponse.json(
                  { error: 'Profile not found' },
                  { status: 404 }
                )
            }
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        // Parse and return the profile data
        const data: ProfileResponse = await response.json()

        return NextResponse.json(data)

    } catch (error) {
        console.error('Error fetching profile:', error)
        return NextResponse.json(
          { error: 'Internal server error' },
          { status: 500 }
        )
    }
}