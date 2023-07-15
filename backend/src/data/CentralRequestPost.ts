import axios from "axios";

export default (uri: string, data: object): Promise<any> => {
  return new Promise((res, rej) => {
    axios
      .post(`https://api.nal.usda.gov/fdc/v1${uri}`, data, {
        headers: {
          "X-Api-Key": "mj1LZf8K9QrZiIhJWxExHCbFIL0y3eCcizb5WhY9",
        },
      })
      .then((response) => {
        res(response.data);
      });
  });
};
