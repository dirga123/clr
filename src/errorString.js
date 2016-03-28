export default function getErrorString(e) {
  if (typeof e === 'object') {
    return e.toString();
  }
  return e;
}
