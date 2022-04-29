import React, { useEffect, useState } from "react";
import BackIcon from "./components/BackIcon/BackIcon";

import "./App.css";
import OrgChart from "./components/OrgChart/OrgChart";
import getData from "./components/getData/getData"; // get JSON file
import {INodeDataArry} from './components/OrgChart/OrgChart';



function App() {
  const [nodeDataArray, setData] = useState<INodeDataArry[]>([]);
  const [bShow, showBackButton] = useState(false);
  const [arr, setBackNode] = useState([]);

  useEffect(() => {
    loadNodes(0); // load & show top nodes.
  }, []);

  function loadNodes(parentNode: number) {
    console.log("loadNodes() -> arr:", arr);

    getData(parentNode) // <== ALL nodes in the database
      .then((nodes) => {
        nodes && setData(nodes); // replaces the nodeDataArray and re-trigger OrgChart's re-rendering.
      });
  }

  function handleBackButtonClick() {
    // e.preventDefault();
    console.log("handleBackButtonClick()");
    const nArr = [...arr];
    nArr.pop();

    const parentKey = nArr.pop();

    parentKey && loadNodes(parentKey); // restore view to parent node
    if (nArr.length < 2) showBackButton(false);
  }

  // This event is called by the child component OrgChart when the user
  // double-clicked on a node.  We will find sub-branches for that node
  // here and re-trigger the OrgChart display to show those sub-branches.
  const onNodeClickHandler = (nodeKey:any) => {
    // get sub-tree for this parent nodeKey
    console.log("onNodeClickHandler()");
    showBackButton(true);
    loadNodes(nodeKey);
  };

  return (
    <div className="App">
      <div className="app-orgchart-container">
        {bShow && (
          <button className="app-backbutton" onClick={handleBackButtonClick}>
            {bShow && <BackIcon />}
          </button>
        )}
        <p />
        <OrgChart
          nodeDataArray={nodeDataArray}
          OnNodeClickEvent={onNodeClickHandler}
        />
      </div>
    </div>
  );
}

export default App;
