export interface FoodItem {
  fdc_id: string;
  data_type: string;
  description: string;
  food_category_id: string;
  publication_date: string;
}

export interface NutrientData {
  fat: number;
  saturatedFat: number;
  transFat: number;
  cholesterol: number;
  sodium: number;
  carbohydrates: number;
  fiber: number;
  sugars: number;
  protein: number;
  calcium: number;
  iron: number;
  calories: number;
}

export interface FoodItemWithNutrients extends FoodItem {
  nutrientData: NutrientData;
}
