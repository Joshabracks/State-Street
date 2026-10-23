const SSID = "ssid";
const STID = "stid";

// Build a node's ssid. With two args: `${parentSSID}.${index}`. With one arg, the
// arg is a root index: `0.${index}`. The "." separator keeps ids unique (`0.1.0` vs `0.10`).
function generateSSID(a?: string | number, b?: number): string {
  if (a === undefined) return `0`;
  const parentSSID = b === undefined ? 0 : a;
  const index = b === undefined ? a : b;
  return `${parentSSID}.${index}`;
}

export { SSID, STID, generateSSID };
