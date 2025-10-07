import { apiReference } from "@scalar/express-api-reference";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express, {
  NextFunction,
  type Express,
  type Request,
  type Response,
} from "express";
import helmet from "helmet";
import path from "path";
import yaml from "yamljs";
import { ZodError } from "zod";
import { fromError } from "zod-validation-error";
import AppError from "./errors/app.error";
import router from "./routes";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "script-src": ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
        "style-src": ["'self'", "'unsafe-inline'"],
      },
    },
  })
);

// Load file dokumentasi Scalar
const apiSpec = yaml.load(path.join(__dirname, "../api-docs.yaml"));

// Endpoint untuk dokumentasi API Scalar
app.use(
  "/api-docs",
  apiReference({
    spec: {
      content: apiSpec,
      theme: "purple",
    },
  })
);

app.use("/api/v1", router);

app.get("/", (req: Request, res: Response) => {
  res.redirect("/api-docs");
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ZodError) {
    const validationError = fromError(err);
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: validationError.toString(),
    });
    return;
  } else if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  } else {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
    return;
  }
});
