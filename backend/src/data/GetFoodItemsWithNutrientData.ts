import { responseEncoding } from "axios";
import CentralRequest from "./CentralRequest";
import DataFrame from "./DataFrame";
import { FoodItem, FoodItemWithNutrients, NutrientData } from "./types";
import CentralRequestPost from "./CentralRequestPost";
import stringSimilarity from "string-similarity";

export default async (
  foodData: DataFrame<FoodItem>,
  foodName: string,
  count: number = 100
): Promise<FoodItemWithNutrients[]> => {
  return new Promise(async (res, rej) => {
    let foodItems: FoodItemWithNutrients[] = [];

    console.log("Searching database...");
    const inputWords = foodName.toLowerCase().split(/\s+/);

    const foods = foodData
      .getAll(
        (f) =>
          f.description !== undefined &&
          inputWords.every((word) => f.description.toLowerCase().includes(word))
      )
      .slice(0, count);

    const foodIds = foods.map((food) => parseInt(food.fdc_id));

    console.log(
      `Found ${foods.length} matches in database${
        foods.length == count ? " (MAX)" : ""
      }`
    );

    if (foodIds.length > 0) {
      console.log("Retrieving nutritional information...");
      const datas: { fdcId: number }[] = await CentralRequestPost(`/foods`, {
        fdcIds: foodIds.map((id) => id.toString()),
        format: "full",
        nutrients: [203, 204],
      });

      console.log("Formatting nutritional data...");

      foods.forEach(async (foodItem, foodNumber) => {
        const response: { labelNutrients: object } = datas[foodNumber] as any;
        if (response.labelNutrients) {
          if (foodNumber < count) {
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
          if (foodNumber < count)
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

        if (foodNumber == foods.length - 1) {
          console.log();
          res(foodItems);
        }
      });
    } else {
      res([]);
    }
  });
};
