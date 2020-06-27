const root = window.document;

function connectToDevTools(componentName) {
  // connect to redux devtools
  var devTools = window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__.connect({
    name: componentName,
  });
  if (!devTools) {
    console.info("Could not connect to redux devtools");
  }
  return devTools;
}

root.addEventListener("SvelteRegisterComponent", (e) => {
  let send = true;

  let {component, tagName} = e.detail;
  var devTools = connectToDevTools(tagName);
  let captureState = component.$capture_state;
  let injectState = component.$inject_state;
  devTools.init(captureState());
  component.$$.after_update.push(() => {
    if (send) {
      devTools.send(tagName, captureState());
    } else {
      send = true;
    }
  });

  devTools.subscribe(function (message) {
    if (message.type === "DISPATCH" && (message.payload.type === "JUMP_TO_ACTION" || message.payload.type === "JUMP_TO_STATE") && message.state) {
      // set send to false to avoid logging dispatched action
      send = false;
      injectState(JSON.parse(message.state));
    }
  });

  component.$$.on_destroy.push(() => {
    devTools.unsubscribe();
    devTools = null;
  });
});