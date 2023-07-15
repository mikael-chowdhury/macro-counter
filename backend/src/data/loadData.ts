import fs from "fs";
import path from "path";
import parseCSV from "./parseCSV";
import DataFrame from "./DataFrame";

export default <T>(name: string): Promise<DataFrame<T>> => {
  return new Promise(async (res, rej) => {
    const filePath = path.join(__dirname, "..", "..", "data", name + ".csv");

    const data = await parseCSV(filePath, [
      "fdc_id",
      "data_type",
      "description",
      "food_category_id",
      "publication_date",
    ]);

    fs.writeFileSync(
      path.join(__dirname, "..", "..", "data.json"),
      JSON.stringify(data, null, 4)
    );

    res(new DataFrame(data as unknown as T[]));
  });
};
