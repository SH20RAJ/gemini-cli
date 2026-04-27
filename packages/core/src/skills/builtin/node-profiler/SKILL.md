---
name: node-profiler
description: Performance profiling skill for Node.js. Use when investigating CPU bottlenecks, memory issues, or performance regressions in Node.js applications.
---

# Node.js Profiler

This skill equips Gemini CLI to perform performance and memory investigations on Node.js applications using the native V8 profiler.

## When to use this skill
- Identifying slow functions or CPU bottlenecks in Node.js scripts.
- Understanding the breakdown of execution time (JavaScript vs C++ vs Shared Libraries).
- Investigating high CPU utilization or performance regressions.

## Profiling Workflow

To profile a Node.js script, follow these steps:

### 1. Run the Profiler Script
Use the bundled script to execute the target Node.js file with profiling enabled.

```bash
node <path-to-skill>/scripts/run_profile.cjs <path-to-target-script.js> [args...]
```

**Note:** The `run_profile.cjs` script handles:
1. Running the target script with `node --prof` to generate an isolate file (`isolate-0xXXXXXXXXX-v8.log`).
2. Running `node --prof-process` on the generated isolate file to create a human-readable text profile.
3. Cleaning up the raw isolate file.
4. Outputting a summary of the profile to stdout (truncated to fit in the context window).

### 2. Analyze the Results
The output of the script will show you where the Node.js process spent most of its time. 

If you need help interpreting the results (e.g., understanding the difference between `Shared libraries`, `JavaScript`, and `C++` ticks, or deciphering the `[Bottom up (heavy) profile]` section), read the reference guide:

Read [v8_profiler_guide.md](references/v8_profiler_guide.md) for detailed instructions on interpreting V8 tick profiles.

### 3. Recommend Fixes
Based on the heavily ticked functions, provide actionable recommendations to the user. For instance, if synchronous `fs` methods are blocking the event loop, suggest async alternatives.
