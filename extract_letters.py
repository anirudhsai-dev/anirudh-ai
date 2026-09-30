#!/usr/bin/env python3
"""
Extract individual letters from transperent.png
The PNG contains "ANIRUDH" in a single image, split into 7 letters
"""
from PIL import Image
import os

# Paths
input_path = 'transperent.png'
output_dir = 'src/renderer/src/assets/letters'

# Create output directory
os.makedirs(output_dir, exist_ok=True)

# Open the image
img = Image.open(input_path)
width, height = img.size

print(f"Original image size: {width}x{height}")

# The image contains 7 letters: A N I R U D H
# We'll split it into 7 equal parts
num_letters = 7
letter_width = width // num_letters

print(f"Letter width: {letter_width}")

# Extract each letter
letters = ['A', 'N', 'I', 'R', 'U', 'D', 'H']

for i, letter in enumerate(letters):
    left = i * letter_width
    right = (i + 1) * letter_width if i < num_letters - 1 else width
    box = (left, 0, right, height)
    
    letter_img = img.crop(box)
    output_path = os.path.join(output_dir, f'letter_{letter.lower()}.png')
    letter_img.save(output_path)
    print(f"Saved {output_path} ({letter_img.size[0]}x{letter_img.size[1]})")

print("\nDone! Extracted letters to src/renderer/src/assets/letters/")
