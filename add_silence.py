from pydub import AudioSegment
from pydub.generators import Sine

# Load the original audio file
audio = AudioSegment.from_mp3("LED Dance - Updated.mp3")

# Create 30 seconds of silence (30000 milliseconds)
silence = AudioSegment.silent(duration=30000)

# Concatenate silence + original audio
output = silence + audio

# Export the result with matching bitrate (180k)
output.export("LED Dance - Updated with 30s silence.mp3", format="mp3", bitrate="192k")

print("Done! Created 'LED Dance - Updated with 30s silence.mp3'")
