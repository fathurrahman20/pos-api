import type { Request } from "express";
import multer, { type FileFilterCallback } from "multer";
import { allowedFileTypes } from "../schema/product.schema";
import BadRequestError from "../errors/bad-request.error";

const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

export const imageFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  if (!allowedFileTypes.includes(file.mimetype)) {
    cb(
      new BadRequestError(
        "Invalid file type. Only image files jpg, jpeg, png, webp are allowed. "
      )
    );
  }

  cb(null, true);
};

export const upload = multer({ storage: storage, fileFilter: imageFilter });
