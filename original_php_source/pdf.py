import pymupdf
from PIL import Image as PILImage, ImageDraw, ImageFont, ImageStat

import os
from pdf2image import convert_from_path
import shutil
import json

extensions = {
    "jpeg": "image/jpeg",
    "jpg": "image/jpeg",
    "png": "image/png",
    "gif": "image/gif",
    "bmp": "image/bmp",
    "tiff": "image/tiff"
}

class Page:
    def __init__(self, number: int, text: str, images: list, errors: list = []):
        self.number = number
        self.text = text
        self.images = images
        self.errors = errors

    def __str__(self):
        return f"Page {self.number}: {self.text}"

    def to_dict(self):
        return {
            "number": self.number,
            "text": self.text.decode("utf8"),
            "images": [image.to_dict() for image in self.images],
            "errors": self.errors
        }

class Image:
    def __init__(self, id: str, page: int, number: int, path: str, x: float, y: float, width: float, height: float):
        self.id = id
        self.page = page
        self.number = number
        self.path = path
        self.x = x
        self.y = y
        self.width = width
        self.height = height

    def bbox(self):
        return pymupdf.Rect(self.x, self.y, self.x + self.width, self.y + self.height)

    def text_bbox(self):
        width = max(self.width, 125)
        return pymupdf.Rect(self.x, self.y, self.x + width, self.y + 25)

    def to_dict(self):
        return {
            "page": self.page,
            "number": self.number,
            "path": self.path,
            "x": self.x,
            "y": self.y,
            "width": self.width,
            "height": self.height
        }

def draw_red_borders_around_images(doc, images):
    for page in doc:
        img_list = page.get_images(full=True)

        # every image where page is page.number
        page_images = [image for image in images if image.page == page.number]

        for image in page_images:
            page.draw_rect(image.bbox(), color=(1, 0, 0), width=3, stroke_opacity=0.3)

            # draw "IMAGE" in the middle of the image
            page.draw_rect(image.text_bbox(), color=(1,0,0), fill=(1, 0, 0), fill_opacity=0.3, stroke_opacity=0.3)

            shape = page.new_shape()
            shape.insert_textbox(image.text_bbox(), str(image.id), fontsize=13, color=(1, 1, 1), align=1)
            shape.finish(fill=(1, 0, 0))
            shape.commit()

def draw_legible_text(image, draw, font, position, text):
    # The text should be readable, regardless of the background
    # We use a simple way to do this by just calculating the average brightness of the text region
    # and then choosing the text color based on our threshold (128 seems to work fine).
    bbox = draw.textbbox(position, text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]

    # Crop the text region
    text_region = image.crop((position[0], position[1], position[0] + text_width, position[1] + text_height))

    # Calculate the average brightness of the text region
    brightness = ImageStat.Stat(text_region).mean[0]

    # Choose text color. If the brightness is above 128, we use black text, otherwise white text.
    # Seems to work fine for most images,
    text_color = (0, 0, 0) if brightness > 128 else (255, 255, 255)

    draw.text(position, text, font=font, fill=text_color)

# Method to draw text on image
def bake_identifier_onto_image(path, output_path, number, text):
    # Open the image
    image = PILImage.open(path)
    draw = ImageDraw.Draw(image)
    font = ImageFont.load_default()

    # we leave a few pixels so the text is not on the edge of the image
    number_position = (5, 5)
    text_position = (5, 20)

    number_color = draw_legible_text(image, draw, font, number_position, number)
    text_color = draw_legible_text(image, draw, font, text_position, text)

    image.save(output_path)


def save_pages_as_files(doc, artifact_id, artifact_dir, pages_dir, images_dir = None, images_marked_dir = None, full_text_path = None, contents_path = None, pages_txt_dir = None):
    pages = []
    texts = []
    contents = []
    page_images = []
    images = []
    errors = []

    for (page, pageIndex) in zip(doc, range(len(doc))):
        page_images = []
        page_image_path = pages_dir + f"/page{pageIndex + 1}.jpg"

        text = page.get_text().encode("utf8")
        texts.append(text)
        contents.append({"page": pageIndex + 1, "type": "text", "text": text.decode("utf8")})

        if pages_txt_dir is not None:
            text_path = pages_txt_dir + f"/page{pageIndex + 1}.txt"
            with open(text_path, "wb") as text_file:
                text_file.write(text)

        page = doc.load_page(pageIndex)
        pix = page.get_pixmap()
        pix.save(page_image_path)

        page_image = Image(
            f"artifact:{artifact_id}:pages/page{page.number}.jpg",
            page.number,
            0,
            page_image_path,
            0,
            0,
            pix.width,
            pix.height
        )
        page_images.append(page_image)

        contents.append({"page": pageIndex + 1, "type": "page-image-marked", "mimetype": "image/jpeg", "path": "pages_marked/page" + str(pageIndex + 1) + ".jpg"})
        contents.append({"page": pageIndex + 1, "type": "page-image", "mimetype": "image/jpeg", "path": "pages/page" + str(pageIndex + 1) + ".jpg"})

        if images_dir is not None:
            img_list = page.get_images(full=True)

            for image in img_list:
                try:
                    bbox = page.get_image_bbox(image)
                    number = len(images) + 1

                    # extract the image bytes
                    xref = image[0]
                    raw_image = doc.extract_image(xref)
                    image_bytes = raw_image["image"]

                    # Check that the bytes are at least 150 bytes long, otherwise it's probably a corrupted image.
                    # This is based on experience and can be adjusted/improved with proper corruption detection.
                    # But for now, this is a simple and effective way to filter out corrupted images.
                    if len(image_bytes) < 150:
                        continue

                    # determine the mime type of the image
                    extension = raw_image["ext"]
                    mime_type = extensions.get(extension)

                    # if the mime type is not supported, skip the image
                    if mime_type is None:
                        continue

                    image_path = images_dir + f"/image{number}.{extension}"

                    relative_image_path = os.path.relpath(image_path, artifact_dir)
                    image = Image(
                        f"{artifact_id}/image{number}",
                        page.number,
                        number,
                        relative_image_path,
                        bbox.x0,
                        bbox.y0,
                        bbox.width,
                        bbox.height
                    )

                    if image.width > 100 or image.height > 100:
                        # save the image to the images directory
                        with open(image_path, "wb") as img_file:
                            img_file.write(image_bytes)

                        page_images.append(image)
                        images.append(image)

                        contents.append({"page": pageIndex + 1, "type": "image", "mimetype": mime_type, "path": image.path, "x": image.x, "y": image.y, "width": image.width, "height": image.height})

                        if images_marked_dir is not None:
                            marked_image_path = images_marked_dir + f"/image{number}.{extension}"
                            relative_marked_image_path = os.path.relpath(marked_image_path, artifact_dir)

                            bake_identifier_onto_image(image_path, marked_image_path, number=f"#{str(number)}", text=f"artifact:{artifact_id}:images/image{number}.{extension}",)

                            contents.append({"page": pageIndex + 1, "type": "image-marked", "mimetype": mime_type, "path": relative_marked_image_path, "x": image.x, "y": image.y, "width": image.width, "height": image.height})
                except Exception as e:
                    errors.append(f"Error processing image on page {pageIndex + 1}: {str(e)}")

        pages.append(Page(pageIndex + 1, text, page_images, errors))

    # join texts with "---- Page X ----" header for each page with number of page replaced
    if full_text_path is not None:
        full_text = b""
        pageIndex = 0

        for text in texts:
            pageIndex += 1
            full_text += f"---- Page {pageIndex} ----\n".encode("utf8")
            full_text += text
            full_text += b"\n\n"

        with open(full_text_path, "wb") as text_file:
            text_file.write(full_text)

    if contents_path is not None:
        with open(contents_path, "w") as f:
            f.write(json.dumps(contents, indent=4))


    return images

# def resize_pages():
#     pages_path = artifact_dir + f"/pages_marked/"
#
#     for page in os.listdir(pages_path):
#         image = Image.open(pages_path + page)
#         image = image.resize((int(image.width / 2), int(image.height / 2)))
#         image.save(pages_path + page)

def extract_pages(doc, images_dir):
    return []
