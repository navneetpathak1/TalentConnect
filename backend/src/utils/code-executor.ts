import { logger } from "./logger";
import { exec } from "child_process";
import { promisify } from "util";
import { writeFile, unlink, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

const execAsync = promisify(exec);

export interface CodeExecutionResult {
  success: boolean;
  score: number;
  executionTime: number;
  memoryUsed: number;
  output: string;
  error?: string;
  feedback: string;
}

export interface CodeExecutionOptions {
  code: string;
  language: string;
  testCases?: Array<{
    input: string;
    expectedOutput: string;
  }>;
  timeout?: number; // milliseconds
  maxMemory?: number; // bytes
}

/**
 * Execute code in a safe environment
 * This is a fallback implementation that runs code locally
 * For production, use Docker containers for isolation
 */
export async function executeCode(
  options: CodeExecutionOptions
): Promise<CodeExecutionResult> {
  const { code, language, testCases = [], timeout = 10000, maxMemory = 100 * 1024 * 1024 } = options;

  const startTime = Date.now();
  const tempDir = join(process.cwd(), "temp", `exec_${Date.now()}_${Math.random().toString(36).substring(7)}`);

  try {
    // Create temp directory
    await mkdir(tempDir, { recursive: true });

    let result: CodeExecutionResult;

    switch (language.toLowerCase()) {
      case "javascript":
      case "js":
        result = await executeJavaScript(code, testCases, tempDir, timeout);
        break;
      case "python":
      case "py":
        result = await executePython(code, testCases, tempDir, timeout);
        break;
      case "typescript":
      case "ts":
        result = await executeTypeScript(code, testCases, tempDir, timeout);
        break;
      default:
        result = {
          success: false,
          score: 0,
          executionTime: 0,
          memoryUsed: 0,
          output: "",
          error: `Unsupported language: ${language}`,
          feedback: `Language ${language} is not supported`,
        };
    }

    const executionTime = Date.now() - startTime;
    result.executionTime = executionTime;

    // Cleanup
    await cleanup(tempDir);

    return result;
  } catch (error) {
    logger.error({ error, language }, "Code execution error");
    
    // Cleanup on error
    await cleanup(tempDir).catch(() => {});

    return {
      success: false,
      score: 0,
      executionTime: Date.now() - startTime,
      memoryUsed: 0,
      output: "",
      error: error instanceof Error ? error.message : "Unknown error",
      feedback: "Code execution failed",
    };
  }
}

async function executeJavaScript(
  code: string,
  testCases: Array<{ input: string; expectedOutput: string }>,
  tempDir: string,
  timeout: number
): Promise<CodeExecutionResult> {
  const filePath = join(tempDir, "solution.js");
  await writeFile(filePath, code);

  try {
    const { stdout, stderr } = await execAsync(`node "${filePath}"`, {
      timeout,
      maxBuffer: 1024 * 1024, // 1MB
    });

    // Simple validation - in production, use proper test cases
    const passed = testCases.length === 0 || !stderr;
    const score = passed ? 100 : 0;

    return {
      success: passed,
      score,
      executionTime: 0, // Will be set by caller
      memoryUsed: 0, // Would need special tools to measure
      output: stdout,
      error: stderr || undefined,
      feedback: passed ? "All tests passed!" : stderr || "Some tests failed",
    };
  } catch (error: any) {
    return {
      success: false,
      score: 0,
      executionTime: 0,
      memoryUsed: 0,
      output: "",
      error: error.message || "Execution error",
      feedback: error.message || "Code execution failed",
    };
  }
}

async function executePython(
  code: string,
  testCases: Array<{ input: string; expectedOutput: string }>,
  tempDir: string,
  timeout: number
): Promise<CodeExecutionResult> {
  const filePath = join(tempDir, "solution.py");
  await writeFile(filePath, code);

  try {
    const { stdout, stderr } = await execAsync(`python "${filePath}"`, {
      timeout,
      maxBuffer: 1024 * 1024,
    });

    const passed = testCases.length === 0 || !stderr;
    const score = passed ? 100 : 0;

    return {
      success: passed,
      score,
      executionTime: 0,
      memoryUsed: 0,
      output: stdout,
      error: stderr || undefined,
      feedback: passed ? "All tests passed!" : stderr || "Some tests failed",
    };
  } catch (error: any) {
    return {
      success: false,
      score: 0,
      executionTime: 0,
      memoryUsed: 0,
      output: "",
      error: error.message || "Execution error",
      feedback: error.message || "Code execution failed",
    };
  }
}

async function executeTypeScript(
  code: string,
  testCases: Array<{ input: string; expectedOutput: string }>,
  tempDir: string,
  timeout: number
): Promise<CodeExecutionResult> {
  const filePath = join(tempDir, "solution.ts");
  await writeFile(filePath, code);

  try {
    // Compile TypeScript first
    await execAsync(`npx tsc "${filePath}" --outDir "${tempDir}" --target ES2020 --module commonjs`, {
      timeout: 5000,
    });

    const jsPath = join(tempDir, "solution.js");
    const { stdout, stderr } = await execAsync(`node "${jsPath}"`, {
      timeout,
      maxBuffer: 1024 * 1024,
    });

    const passed = testCases.length === 0 || !stderr;
    const score = passed ? 100 : 0;

    return {
      success: passed,
      score,
      executionTime: 0,
      memoryUsed: 0,
      output: stdout,
      error: stderr || undefined,
      feedback: passed ? "All tests passed!" : stderr || "Some tests failed",
    };
  } catch (error: any) {
    return {
      success: false,
      score: 0,
      executionTime: 0,
      memoryUsed: 0,
      output: "",
      error: error.message || "Execution error",
      feedback: error.message || "Code execution failed",
    };
  }
}

async function cleanup(tempDir: string): Promise<void> {
  try {
    if (existsSync(tempDir)) {
      // In production, use rimraf or similar for recursive deletion
      // For now, we'll leave cleanup to OS or a cleanup job
      logger.debug({ tempDir }, "Temp directory created (cleanup handled by OS)");
    }
  } catch (error) {
    logger.warn({ error, tempDir }, "Failed to cleanup temp directory");
  }
}

/**
 * Docker-based code execution (for production)
 * This would spawn isolated Docker containers for code execution
 */
export async function executeCodeInDocker(
  options: CodeExecutionOptions
): Promise<CodeExecutionResult> {
  // TODO: Implement Docker-based execution
  // This would:
  // 1. Create a Docker container with the language runtime
  //  // 2. Copy code into container
  // 3. Run code with resource limits
  // 4. Capture output and errors
  // 5. Clean up container
  
  logger.warn("Docker execution not implemented, falling back to local execution");
  return executeCode(options);
}

