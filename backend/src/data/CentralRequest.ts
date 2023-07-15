import axios from "axios";

export default async (uri: string): Promise<any> => {
  const response = await axios.get(
    `https://api.nal.usda.gov/fdc/v1${uri}?api_key=mj1LZf8K9QrZiIhJWxExHCbFIL0y3eCcizb5WhY9`
  );
  return response.data;
};
