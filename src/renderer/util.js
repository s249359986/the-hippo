function isMac() {
  return  /mac/.test(window.navigator.userAgent.toLowerCase());
}

export {
  isMac
}
