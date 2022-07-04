export default function validTikTokUrl(url: string) {
  url = encodeURIComponent(url)
  let regex =
    /(http:|https:\/\/)?(www\.)?tiktok\.com\/(@.{1,24})\/video\/(\d{15,30})/;
  let match = url.match(regex);
  if (match) return true;

  regex = /(http:|https:\/\/)?((?!ww)\w{2})\.tiktok.com\/(\w{5,15})/;
  match = url.match(regex);
  if (match) return true;

  regex = /(http:|https:\/\/)?(www\.)?tiktok.com\/t\/(\w{5,15})/;
  match = url.match(regex);
  if (match) return true;

  regex = /(http:|https:\/\/)?m\.tiktok\.com\/v\/(\d{15,30})/;
  match = url.match(regex);
  if (match) return true;

  regex = /(http:|https:\/\/)?(www)?\.tiktok\.com\/(.*)item_id=(\d{5,30})/;
  match = url.match(regex);
  if (match) return true;

  return false;
}
