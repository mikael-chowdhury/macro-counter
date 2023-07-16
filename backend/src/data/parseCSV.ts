import fs from "fs";

export default <T>(path: string, columns: string[]): Promise<T[]> => {
  return new Promise((res, rej) => {
    let result = "";

    const dataStream = fs.createReadStream(path, { encoding: "utf-8" });

    let done = 0;
    let chunkCount = 0;
    let total = fs.statSync(path).size;

    dataStream.on("data", (chunk) => {
      done += Buffer.byteLength(chunk.toString());
      process.stdout.clearLine(0);
      process.stdout.write(
        "   Loading Data...   " + Math.floor((done / total) * 100) + "%\r"
      );
      result += chunk.toString();
      chunkCount++;
    });

    dataStream.on("end", () => {
      process.stdout.write("\n");

      const lines = result.split("\n");
      lines.shift();

      const splitLines = lines.map((line) => line.split(","));

      const finalJSONArray = splitLines.map((line, lineNumber) => {
        let object: { [key: string]: any } = {};

        line.forEach((val, i) => {
          if (columns[i] != undefined)
            object[columns[i]] = val.replace(/\"/g, "");
        });

        if (
          (lineNumber / splitLines.length) * 100 -
            (Math.max(lineNumber - 1, 0) / splitLines.length) * 100 >
          10
        ) {
          process.stdout.clearLine(0);
          process.stdout.write(
            "   Parsing Data...   " +
              Math.floor((lineNumber / (splitLines.length - 1)) * 100) +
              "%\r"
          );
        }

        return object;
      });

      console.log("");

      res(finalJSONArray as unknown as T[]);
    });
  });
};
