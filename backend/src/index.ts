import fs from "fs";
import loadData from "./data/loadData";
import { FoodItem } from "./data/types";
import path from "path";
import DataFrame from "./data/DataFrame";
import CentralRequest from "./data/CentralRequest";
import GetFoodItemsWithNutrientData from "./data/GetFoodItemsWithNutrientData";
import GetBulkNutrientData from "./data/GetBulkNutrientData";

(async () => {
  const foodData = await loadData<FoodItem>("food");

  fs.writeFileSync(
    path.join(__dirname, "data.json"),
    JSON.stringify(foodData.data, null, 4)
  );

  // const foodData: DataFrame<FoodItem> = new DataFrame(
  //   JSON.parse(fs.readFileSync(path.join(__dirname, "data.json")).toString())
  // );

  const fullData = JSON.parse(
    fs.readFileSync(path.join(__dirname, "fullData.json")).toString()
  );

  if (fullData.length < foodData.data.length) {
    await GetBulkNutrientData(foodData);
  }

  console.log("   Loaded data.\n\n");

  process.stdout.write("  > ");

  process.stdin.on("data", async (data) => {
    const query = data.toString();

    const foodItems = await GetFoodItemsWithNutrientData(foodData, query, 10);

    if (foodItems.length > 0) {
      console.log(
        foodItems
          .map(
            (foodItem) =>
              `${foodItem.description}  ->  P ${
                foodItem.nutrientData.protein || 0
              }g  KCAL ${foodItem.nutrientData.calories}`
          )
          .join("\n")
      );
    } else {
      console.log("couldn't find any food items with that name!");
    }

    process.stdout.write("\n\n  > ");
  });
})();
