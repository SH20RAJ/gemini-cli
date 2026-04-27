#!/usr/bin/env node

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Clean up existing isolate files in the current directory
function cleanupIsolateFiles() {
  const files = fs.readdirSync(process.cwd());
  for (const file of files) {
    if (file.startsWith('isolate-') && file.endsWith('-v8.log')) {
      fs.unlinkSync(file);
    }
  }
}

function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('Usage: run_profile.cjs <script.js> [args...]');
    process.exit(1);
  }

  const targetScript = args[0];
  const targetArgs = args.slice(1);

  if (!fs.existsSync(targetScript)) {
    console.error(`Error: Target script not found: ${targetScript}`);
    process.exit(1);
  }

  console.log(`Starting profiling for: ${targetScript}...`);
  cleanupIsolateFiles();

  // Run the script with --prof
  const profResult = spawnSync(process.execPath, ['--prof', targetScript, ...targetArgs], {
    stdio: 'inherit'
  });

  if (profResult.error) {
    console.error(`Error running profiler: ${profResult.error.message}`);
    process.exit(1);
  }

  // Find the generated isolate file
  const files = fs.readdirSync(process.cwd());
  const isolateFile = files.find(f => f.startsWith('isolate-') && f.endsWith('-v8.log'));

  if (!isolateFile) {
    console.error('Error: No isolate file was generated. Ensure the script executed successfully.');
    process.exit(1);
  }

  console.log(`\nProcessing isolate file: ${isolateFile}...`);

  // Process the isolate file
  const processResult = spawnSync(process.execPath, ['--prof-process', isolateFile], {
    encoding: 'utf-8'
  });

  if (processResult.error) {
    console.error(`Error processing profile: ${processResult.error.message}`);
    process.exit(1);
  }

  // Output the processed profile
  const fullOutput = processResult.stdout;
  
  // Truncate to avoid blowing up context window (around 200 lines max)
  const lines = fullOutput.split('\n');
  if (lines.length > 200) {
    console.log(lines.slice(0, 200).join('\n'));
    console.log('\n... [Output truncated to 200 lines to preserve context window. Focus on the Summary and Heavy Profile sections above] ...');
  } else {
    console.log(fullOutput);
  }

  // Cleanup
  try {
    fs.unlinkSync(isolateFile);
  } catch (e) {
    // Ignore cleanup errors
  }

  console.log('\nProfiling complete.');
}

main();
