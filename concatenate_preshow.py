#!/usr/bin/env python3
"""
Concatenate all MP3 files in the Pre-show folder into a single audio file.
"""

import os
from pathlib import Path
from pydub import AudioSegment

def concatenate_preshow_songs():
    """Concatenate all songs in the Pre-show folder."""
    preshow_dir = Path(__file__).parent / "Pre-show"
    output_file = Path(__file__).parent / "Pre-show_concatenated.mp3"
    
    # Get all MP3 files and sort them alphabetically
    mp3_files = sorted(preshow_dir.glob("*.mp3"))
    
    if not mp3_files:
        print("No MP3 files found in Pre-show folder")
        return
    
    print(f"Found {len(mp3_files)} songs to concatenate:")
    for i, file in enumerate(mp3_files, 1):
        print(f"  {i}. {file.name}")
    
    # Load and concatenate all audio files
    print("\nConcatenating audio files...")
    combined = AudioSegment.empty()
    
    for file in mp3_files:
        print(f"  Adding: {file.name}")
        audio = AudioSegment.from_mp3(file)
        combined += audio
    
    # Export the concatenated audio
    print(f"\nExporting to: {output_file}")
    combined.export(output_file, format="mp3")
    
    # Print duration information
    duration_seconds = len(combined) / 1000
    duration_minutes = duration_seconds / 60
    print(f"\nSuccess! Total duration: {duration_minutes:.2f} minutes ({duration_seconds:.2f} seconds)")
    print(f"Output file: {output_file}")

if __name__ == "__main__":
    concatenate_preshow_songs()
