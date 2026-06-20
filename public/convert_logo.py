import fitz
from PIL import Image, ImageChops
import io
import sys

def trim(im):
    bg = Image.new(im.mode, im.size, im.getpixel((0,0)))
    diff = ImageChops.difference(im, bg)
    diff = ImageChops.add(diff, diff, 2.0, -100)
    bbox = diff.getbbox()
    if bbox:
        return im.crop(bbox)
    return im

try:
    pdf_path = "pikanditas logo.pdf"
    doc = fitz.open(pdf_path)
    page = doc.load_page(0)

    zoom = 4.0 # High resolution
    mat = fitz.Matrix(zoom, zoom)
    
    # Try rendering with alpha
    pix = page.get_pixmap(matrix=mat, alpha=True)
    img_data = pix.tobytes("png")
    img = Image.open(io.BytesIO(img_data)).convert("RGBA")
    
    # Crop
    cropped_img = trim(img)
    
    # Optional: if the background was solid grey/white, we could try to make the remaining background transparent,
    # but since the image might have anti-aliasing against that background, it's safer to just crop the edges.
    
    cropped_img.save("logo.png")
    print("Success: Cropped image saved as logo.png")

except Exception as e:
    print("Error:", str(e))
    sys.exit(1)
