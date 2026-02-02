import pymupdf
from PIL import Image
import os
from pdf2image import convert_from_path
import shutil
from pdf import extract_pages, save_pages_as_files, draw_red_borders_around_images
import json
import magic

if len(os.sys.argv) < 3:
    print("Usage: python prepare-pdf.py <artifact-dir> <pdf-path> <artifact-id>")

class JsonOutput:
    paths = {}
    pages = []
    error = None

    def to_dict(self):
        # output { paths: {} }

        try:
            pages = [page.to_dict() for page in self.pages]
        except Exception as e:
            self.error = str(e)

        if self.error:
            return {"error": self.error}
        else:
            return {
                "paths": self.paths,
                "pages": pages
            }

    def to_json(self):
        return json.dumps(self.to_dict(), indent=4)

class Metadata:
    id: str
    type: str
    name: str
    mimetype: str
    extension: str

    def to_dict(self):
        return {
            "id": self.id,
            "type": self.type,
            "name": self.name,
            "mimetype": self.mimetype,
            "extension": self.extension
        }

    def to_json(self):
        return json.dumps(self.to_dict(), indent=4)

json_output = JsonOutput()

artifact_dir = os.sys.argv[1]
temp_file_path = os.sys.argv[2]
artifact_id = os.sys.argv[3]

# create the artifact dir if it doesn't exist (-m option)
os.makedirs(artifact_dir, exist_ok=True)

metadata_path = artifact_dir + "/metadata.json"
contents_path = artifact_dir + "/contents.json"

types = {
    "application/pdf": "pdf",
    "image/jpeg": "image",
    "image/png": "image",
    "image/gif": "image",
    "text/plain": "text",
    "text/html": "text",
    "text/xml": "text",
    # word
    "application/msword": "rich-text-document",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "rich-text-document",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.template": "rich-text-document",
    # powerpoint
    "application/vnd.ms-powerpoint": "presentation",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": "presentation",
    "application/vnd.openxmlformats-officedocument.presentationml.slideshow": "presentation",
    "application/vnd.openxmlformats-officedocument.presentationml.template": "presentation",
    # excel
    "application/vnd.ms-excel": "spreadsheet",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "spreadsheet",
}

metadata = Metadata()
metadata.id = artifact_id
metadata.name = os.path.basename(temp_file_path)
metadata.mimetype = magic.from_file(temp_file_path, mime=True)
metadata.type = types[metadata.mimetype] if metadata.mimetype in types else "pdf"

# ".pdf"
ext = os.path.splitext(temp_file_path)[1]
# "pdf"
metadata.extension = ext[1:]



# write the metadata
with open(metadata_path, "w") as f:
    f.write(metadata.to_json())

file_path = artifact_dir + "/source." + metadata.extension
shutil.copy(temp_file_path, file_path)

json_output = JsonOutput()
json_output.paths["artifact_dir"] = artifact_dir
json_output.paths["temp_file_path"] = temp_file_path
json_output.paths["file_path"] = file_path

# file_path should be relative to artifact_dir
file_path = os.path.relpath(file_path, artifact_dir)

def do_other(output, other = None):
    if other == 'text':
        contents = [
            {"type": "text", "text": open(file_path, "r").read()}
        ]
    elif other == 'image':
        contents = [
            {"type": "image", "path": file_path, "mimetype": metadata.mimetype}
        ]
    else:
        contents = [
            {"type": "other", "path": file_path}
        ]

    if contents_path is not None:
        with open(contents_path, "w") as f:
            f.write(json.dumps(contents, indent=4))

    return output


def do_pdf(output):
    pdf_path = artifact_dir + "/source.pdf"
    marked_pdf_path = artifact_dir + "/marked.pdf"
    images_dir = artifact_dir + "/images"
    images_marked_dir = artifact_dir + "/images_marked"
    pages_dir = artifact_dir + "/pages"
    pages_marked_dir = artifact_dir + "/pages_marked"
    pages_txt_dir = artifact_dir + "/pages_txt"
    full_text_path = artifact_dir + "/source.txt"

    output.paths["artifact_dir"] = artifact_dir
    output.paths["temp_file_path"] = temp_file_path
    output.paths["pdf_path"] = pdf_path
    output.paths["marked_pdf_path"] = marked_pdf_path
    output.paths["images_dir"] = images_dir
    output.paths["images_marked_dir"] = images_marked_dir
    output.paths["pages_dir"] = pages_dir
    output.paths["pages_marked_dir"] = pages_marked_dir
    output.paths["pages_txt_dir"] = pages_txt_dir
    output.paths["full_text_path"] = full_text_path
    output.paths["contents_path"] = contents_path

    try:
        os.makedirs(images_dir, exist_ok=True)
        os.makedirs(images_marked_dir, exist_ok=True)
        os.makedirs(pages_dir, exist_ok=True)
        os.makedirs(pages_marked_dir, exist_ok=True)
        os.makedirs(pages_txt_dir, exist_ok=True)

        # copy the temp pdf to the artifact dir
        shutil.copy(temp_file_path, pdf_path)

        # open the pdf
        doc = pymupdf.open(pdf_path)

        # extract the pages (and save any images in the images dir)
#         pages = extract_pages(doc, images_dir)

        images = save_pages_as_files(
            doc,
            artifact_id=artifact_id,
            artifact_dir=artifact_dir,
            pages_dir=pages_dir,
            images_dir=images_dir,
            images_marked_dir=images_marked_dir,
            full_text_path=full_text_path,
            contents_path=contents_path,
            pages_txt_dir=pages_txt_dir
        )

        draw_red_borders_around_images(doc, images)

        doc.save(marked_pdf_path)

        save_pages_as_files(
            doc,
            artifact_id=artifact_id,
            artifact_dir=artifact_dir,
            pages_dir=pages_marked_dir
        )
    except Exception as e:
        output.error = str(e)
        output.trace = str(e.__traceback__)

    return output


if metadata.type == "pdf":
    json_output = do_pdf(json_output)
else:
    json_output = do_other(json_output, metadata.type)

print(json_output.to_json())
