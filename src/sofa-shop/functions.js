function generateRandomHexString(length) {
  const chars = "ABCDEF0123456789";
  let result = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    result += chars.charAt(randomIndex);
  }

  return result;
}

export function getParams(stageIndex, limits, runner, rateLimit = true) {
  const params = {
    tags: {
      run_id: runner.testTag,
    },
    responseType: "text",
    headers: {},
  };
  if (limits[stageIndex] && rateLimit) {
    params["headers"]["rate-limit"] = limits[stageIndex];
  }
  params["headers"]["traceparent"] =
    "00" +
    "-" +
    "6b6eeeee" +
    generateRandomHexString(22) +
    "-" +
    generateRandomHexString(16) +
    "-" +
    "00";
  params["headers"]["Content-Type"] = "application/json";
  return params;
}
