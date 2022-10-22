import url from "url";

const URL = url.URL;

export default function isValidUrl(s: string) {
  try {
    new URL(s);
    return true;
  } catch (err) {
    return false;
  }
}
