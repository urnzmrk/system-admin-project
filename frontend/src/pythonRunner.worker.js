const PYODIDE_VERSION = "314.0.7";
const PYODIDE_BASE_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;
const MAX_FILE_COUNT = 25;
const MAX_PROJECT_SIZE = 256_000;
const MAX_OUTPUT_SIZE = 20_000;

let pyodide = null;
let outputText = "";
let outputTruncated = false;
let lastOutputMessage = 0;
let previousProjectPaths = new Set();
const originalNetworkDescriptors = new Map();

function publishOutput(force = false) {
  const now = Date.now();
  if (force || now - lastOutputMessage >= 75) {
    lastOutputMessage = now;
    self.postMessage({ type: "output", output: outputText });
  }
}

function appendOutput(value) {
  if (outputText.length >= MAX_OUTPUT_SIZE) {
    outputTruncated = true;
    return;
  }
  const chunk = String(value);
  const room = MAX_OUTPUT_SIZE - outputText.length;
  outputText += chunk.slice(0, room);
  if (chunk.length > room) outputTruncated = true;
  if (outputTruncated && !outputText.endsWith("\n[Output limit reached.]")) {
    outputText = `${outputText.slice(0, MAX_OUTPUT_SIZE - 28)}\n[Output limit reached.]`;
  }
  publishOutput();
}

function normalizeProjectPath(value) {
  const path = String(value || "").replace(/\\/g, "/");
  const segments = path.split("/");
  if (!path || path.startsWith("/") || segments.some((segment) => !segment || segment === "." || segment === "..")) {
    return "";
  }
  return path;
}

function blockWorkerNetworkAccess() {
  const blockedFetch = () => Promise.reject(new Error("Network access is disabled in the Python workspace."));
  for (const [name, value] of [["fetch", blockedFetch], ["WebSocket", undefined], ["EventSource", undefined], ["XMLHttpRequest", undefined], ["importScripts", undefined]]) {
    try {
      if (!originalNetworkDescriptors.has(name)) {
        originalNetworkDescriptors.set(name, Object.getOwnPropertyDescriptor(self, name) || null);
      }
      Object.defineProperty(self, name, { configurable: true, writable: false, value });
    } catch {
      // A browser may expose a non-configurable worker global; do not fail runtime setup.
    }
  }
}

function restoreWorkerNetworkAccess() {
  for (const [name, descriptor] of originalNetworkDescriptors) {
    try {
      if (descriptor) Object.defineProperty(self, name, descriptor);
      else delete self[name];
    } catch {
      // Keep running with the stricter network policy if a browser prevents restoration.
    }
  }
}

function collectMatplotlibFigures() {
  try {
    const result = pyodide.runPython(`
import base64, io, sys
__runner_figures = []
if "matplotlib.pyplot" in sys.modules:
    import matplotlib.pyplot as plt
    for __runner_number in plt.get_fignums()[:3]:
        __runner_buffer = io.BytesIO()
        plt.figure(__runner_number).savefig(__runner_buffer, format="png", bbox_inches="tight")
        __runner_png = base64.b64encode(__runner_buffer.getvalue()).decode("ascii")
        if len(__runner_png) <= 1200000:
            __runner_figures.append(__runner_png)
        __runner_buffer.close()
        plt.close(__runner_number)
__runner_figures
`);
    const figures = result.toJs();
    result.destroy();
    return figures;
  } catch {
    return [];
  }
}

async function initializeRuntime() {
  try {
    const { loadPyodide } = await import(/* @vite-ignore */ `${PYODIDE_BASE_URL}pyodide.mjs`);
    pyodide = await loadPyodide({
      indexURL: PYODIDE_BASE_URL,
      stdout: (line) => appendOutput(`${line}\n`),
      stderr: (line) => appendOutput(`${line}\n`),
    });
    const version = pyodide.runPython("import sys; sys.version.split()[0]");
    self.postMessage({ type: "ready", version });
  } catch (error) {
    self.postMessage({ type: "fatal", error: error?.message || "Could not load the browser Python runtime." });
  }
}

async function runProject(message) {
  if (!pyodide) {
    self.postMessage({ type: "failed", error: "The Python runtime is not ready.", output: outputText });
    return;
  }

  outputText = "";
  outputTruncated = false;
  lastOutputMessage = 0;

  const files = Array.isArray(message.files) ? message.files : [];
  if (!files.length || files.length > MAX_FILE_COUNT) {
    self.postMessage({ type: "failed", error: `A project must contain between 1 and ${MAX_FILE_COUNT} files.`, output: outputText });
    return;
  }
  const entrypoint = normalizeProjectPath(message.entrypoint || "main.py");
  const isTestRun = message.mode === "tests";
  const safeFiles = files.map((file) => ({ path: normalizeProjectPath(file?.path), content: String(file?.content ?? "") }));
  const testPaths = Array.isArray(message.testPaths) ? message.testPaths.map(normalizeProjectPath) : [];
  const totalSize = safeFiles.reduce((total, file) => total + file.content.length, 0);
  if (safeFiles.some((file) => !file.path) || totalSize > MAX_PROJECT_SIZE || String(message.stdin || "").length > 8_000) {
    self.postMessage({ type: "failed", error: "Project paths must stay inside the workspace and total source size must be under 256 KB.", output: outputText });
    return;
  }
  const entryFile = safeFiles.find((file) => file.path === entrypoint);
  if (!isTestRun && (!entryFile || !entrypoint.toLowerCase().endsWith(".py"))) {
    self.postMessage({ type: "failed", error: `Could not find Python entry file “${entrypoint}”.`, output: outputText });
    return;
  }
  if (isTestRun && (!testPaths.length || testPaths.some((path) => !path || !path.toLowerCase().endsWith(".py") || !safeFiles.some((file) => file.path === path)))) {
    self.postMessage({ type: "failed", error: "Choose valid Python test files from this project before running tests.", output: outputText });
    return;
  }

  const allPythonSource = safeFiles.filter((file) => file.path.toLowerCase().endsWith(".py")).map((file) => file.content).join("\n");
  if (/^\s*(?:from|import)\s+(?:micropip|pyodide_js|js)(?:\b|\.)/m.test(allPythonSource)) {
    self.postMessage({ type: "failed", error: "The browser runner blocks Python-to-JavaScript, package-installer, and runtime-control imports.", output: outputText });
    return;
  }

  self.postMessage({ type: "preparing" });
  try {
    restoreWorkerNetworkAccess();
    const currentProjectPaths = new Set(safeFiles.map((file) => file.path));
    for (const oldPath of previousProjectPaths) {
      if (!currentProjectPaths.has(oldPath)) {
        try { pyodide.FS.unlink(`/workspace/${oldPath}`); } catch { /* Removed files may already be absent. */ }
      }
    }
    for (const file of safeFiles) {
      const fullPath = `/workspace/${file.path}`;
      const parentPath = fullPath.slice(0, fullPath.lastIndexOf("/"));
      pyodide.FS.mkdirTree(parentPath);
      pyodide.FS.writeFile(fullPath, file.content);
    }
    previousProjectPaths = currentProjectPaths;

    for (const file of safeFiles.filter((entry) => entry.path.toLowerCase().endsWith(".py"))) {
      await pyodide.loadPackagesFromImports(file.content);
    }

    blockWorkerNetworkAccess();
    const inputLines = String(message.stdin || "").split(/\r?\n/);
    let inputIndex = 0;
    pyodide.setStdin({
      isatty: true,
      stdin: () => inputIndex < inputLines.length && message.stdin ? inputLines[inputIndex++] : null,
    });
    const sourceDirectories = [...new Set(safeFiles
      .filter((file) => file.path.toLowerCase().endsWith(".py"))
      .map((file) => `/workspace/${file.path.includes("/") ? file.path.slice(0, file.path.lastIndexOf("/")) : ""}`))];
    const pythonPathSetup = `import os, sys\nos.chdir('/workspace')\nfor __runner_path in ${JSON.stringify(sourceDirectories)}:\n    if __runner_path not in sys.path: sys.path.insert(0, __runner_path)\nfor __runner_name, __runner_module in list(sys.modules.items()):\n    __runner_file = getattr(__runner_module, '__file__', '') or ''\n    if __runner_file.startswith('/workspace/'):\n        sys.modules.pop(__runner_name, None)`;
    await pyodide.runPythonAsync(pythonPathSetup);
    if (/^\s*(?:from|import)\s+(?:matplotlib|pandas|seaborn)(?:\b|\.)/m.test(allPythonSource)) {
      await pyodide.runPythonAsync("import os; os.environ['MPLBACKEND'] = 'Agg'");
    }
    self.postMessage({ type: "executing" });
    if (isTestRun) {
      const testRunnerCode = `
import importlib.util, unittest
__runner_test_suite = unittest.TestSuite()
__runner_test_loader = unittest.TestLoader()
__runner_test_paths = ${JSON.stringify(testPaths)}
for __runner_index, __runner_test_path in enumerate(__runner_test_paths):
    __runner_test_file = f"/workspace/{__runner_test_path}"
    __runner_spec = importlib.util.spec_from_file_location(f"_project_test_{__runner_index}", __runner_test_file)
    __runner_module = importlib.util.module_from_spec(__runner_spec)
    __runner_spec.loader.exec_module(__runner_module)
    __runner_test_suite.addTests(__runner_test_loader.loadTestsFromModule(__runner_module))
__runner_result = unittest.TextTestRunner(verbosity=2).run(__runner_test_suite)
if __runner_result.testsRun == 0:
    raise AssertionError("No unittest test cases were found in the selected test files.")
if not __runner_result.wasSuccessful():
    raise AssertionError(f"{len(__runner_result.failures) + len(__runner_result.errors)} test(s) failed.")
`;
      await pyodide.runPythonAsync(testRunnerCode);
    } else {
      await pyodide.runPythonAsync(entryFile.content);
    }
    publishOutput(true);
    self.postMessage({ type: "completed", output: outputText, figures: collectMatplotlibFigures() });
  } catch (error) {
    appendOutput(error?.message || String(error));
    publishOutput(true);
    self.postMessage({ type: "failed", error: error?.message || String(error), output: outputText, figures: collectMatplotlibFigures() });
  }
}

self.addEventListener("message", (event) => {
  if (event.data?.type === "initialize") {
    initializeRuntime();
  } else if (event.data?.type === "run") {
    runProject(event.data);
  }
});
