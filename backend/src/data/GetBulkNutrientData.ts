import path from "path";
import CentralRequestPost from "./CentralRequestPost";
import DataFrame from "./DataFrame";
import { FoodItem, FoodItemWithNutrients } from "./types";
import { readFileSync, writeFileSync } from "fs";

export default async (foodData: DataFrame<FoodItem>): Promise<void> => {
  return new Promise(async (res, rej) => {
    console.log("loading data.json");
    const data = JSON.parse(
      readFileSync(path.join(__dirname, "..", "data.json")).toString()
    );

    console.log("loading fullData.json");
    const fullData = JSON.parse(
      readFileSync(path.join(__dirname, "..", "fullData.json")).toString()
    );

    console.log("Obtaining ALL nutrient data (could take a while)...");

    let pageNum = 0;

    while (pageNum < foodData.data.length / 20) {
      const splicedFood = (data as FoodItem[]).slice(
        pageNum * 20,
        pageNum * 20 + 20
      );

      const splicedIds = splicedFood.map((item) => item.fdc_id);

      const beginTime = Date.now();
      const result: {}[] = await CentralRequestPost("/foods", {
        fdcIds: splicedIds,
        format: "full",
        nutrients: [203, 204],
      });

      const foodItems: FoodItemWithNutrients[] = [];

      splicedFood.forEach(async (foodItem, foodNumber) => {
        const response: { labelNutrients: object } = result[foodNumber] as any;
        if (response.labelNutrients) {
          if (foodNumber < 20) {
            const nutrientData = [
              ...Object.keys(response.labelNutrients).map((key, index) => {
                return {
                  name: key,
                  value:
                    response.labelNutrients[
                      key as keyof object & { value: number }
                    ]["value"],
                };
              }),
            ];

            let finalObject: object = {
              ...foodItem,
              nutrientData: {},
            };

            nutrientData.forEach((nutrient, index) => {
              (finalObject["nutrientData" as keyof object][
                nutrient.name as keyof object
              ] as any) = nutrient.value;
            });

            foodItems.push(finalObject as unknown as FoodItemWithNutrients);
          }
        } else {
          if (foodNumber < 20)
            foodItems.push({
              ...foodItem,
              nutrientData: {
                calcium: 0,
                calories: 0,
                carbohydrates: 0,
                cholesterol: 0,
                fat: 0,
                fiber: 0,
                iron: 0,
                protein: 0,
                saturatedFat: 0,
                sodium: 0,
                sugars: 0,
                transFat: 0,
              },
            } as FoodItemWithNutrients);
        }

        if (foodNumber == splicedFood.length - 1) {
          writeFileSync(
            path.join(__dirname, "..", "fullData.json"),
            JSON.stringify(
              fullData.concat(result as unknown as ConcatArray<never>),
              null,
              4
            )
          );

          process.stdout.clearLine(0);
          process.stdout.write(
            `   Obtained Nutrient Data ${
              (result.length / (data as FoodItem[]).length) * 100
            }%  |  Request + Formatting took ${Math.floor(
              (Date.now() - beginTime) / 1000
            )}s\r`
          );

          pageNum++;

          if (!(pageNum + 1 < foodData.data.length / 20)) {
            res();
          }
        }
      });
    }
  });
};
