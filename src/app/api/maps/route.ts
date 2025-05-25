import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export interface MapInfo {
  value: string
  label: string
  image?: string
  description: string
}

export async function GET() {
  try {
    const mapsDirectory = path.join(process.cwd(), 'public', 'assets', 'maps')
    
    // Check if the directory exists
    if (!fs.existsSync(mapsDirectory)) {
      return NextResponse.json({ maps: [] }, { status: 200 })
    }

    // Read all files in the maps directory
    const files = fs.readdirSync(mapsDirectory)
    
    // Filter for JSON files only
    const mapFiles = files.filter(file => file.endsWith('.json'))
    
    // Transform file names into map info objects
    const maps: MapInfo[] = mapFiles.map((filename) => {
      const nameWithoutExt = filename.replace('.json', '')
      const formattedName = nameWithoutExt
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
      
      return {
        value: nameWithoutExt,
        label: formattedName,
        image: `/assets/maps/previews/${nameWithoutExt}-preview.png`,
        description: `${formattedName} workspace layout`
      }
    })
    
    return NextResponse.json({ maps }, { status: 200 })
  } catch (error) {
    console.error('Failed to load maps:', error)
    return NextResponse.json(
      { error: 'Failed to load maps', maps: [] },
      { status: 500 }
    )
  }
}
